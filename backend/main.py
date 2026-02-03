from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from kubernetes import client, config
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="PulseCheck API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Kubernetes clients
v1 = None
custom_api = None

try:
    config.load_kube_config(context="kind-pulsecheck")
    v1 = client.CoreV1Api()
    custom_api = client.CustomObjectsApi()
    logger.info("✅ Connected to Kubernetes cluster: kind-pulsecheck")
except Exception as e:
    logger.error(f"❌ Failed to connect to Kubernetes: {e}")


# ============================================
# Health Check
# ============================================

@app.get("/health")
def health():
    """Health check endpoint"""
    return {
        "status": "ok",
        "kubernetes_connected": v1 is not None,
        "cluster": "kind-pulsecheck"
    }


# ============================================
# Pods
# ============================================

@app.get("/api/pods")
def get_pods():
    """Get list of all pods in default namespace"""
    if not v1:
        raise HTTPException(status_code=503, detail="Kubernetes client not initialized")
    
    try:
        pods = v1.list_namespaced_pod(namespace="default")
        
        pod_list = []
        for pod in pods.items:
            # Calculate age
            created = pod.metadata.creation_timestamp
            age_seconds = (datetime.now(created.tzinfo) - created).total_seconds()
            
            if age_seconds < 60:
                age = f"{int(age_seconds)}s"
            elif age_seconds < 3600:
                age = f"{int(age_seconds // 60)}m"
            elif age_seconds < 86400:
                age = f"{int(age_seconds // 3600)}h"
            else:
                age = f"{int(age_seconds // 86400)}d"
            
            # Get container statuses
            ready_count = 0
            total_count = 0
            restarts = 0
            
            if pod.status.container_statuses:
                total_count = len(pod.status.container_statuses)
                for container in pod.status.container_statuses:
                    if container.ready:
                        ready_count += 1
                    restarts += container.restart_count
            
            pod_info = {
                "name": pod.metadata.name,
                "namespace": pod.metadata.namespace,
                "status": pod.status.phase,
                "ready": f"{ready_count}/{total_count}",
                "restarts": restarts,
                "age": age,
                "node": pod.spec.node_name,
                "ip": pod.status.pod_ip,
                "created_at": created.isoformat()
            }
            
            pod_list.append(pod_info)
        
        return {
            "pods": pod_list,
            "count": len(pod_list)
        }
    
    except Exception as e:
        logger.error(f"Error fetching pods: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching pods: {str(e)}")


@app.get("/api/pods/{pod_name}")
def get_pod_details(pod_name: str):
    """Get detailed information about a specific pod"""
    if not v1:
        raise HTTPException(status_code=503, detail="Kubernetes client not initialized")
    
    try:
        pod = v1.read_namespaced_pod(name=pod_name, namespace="default")
        
        # Extract container info
        containers = []
        if pod.spec.containers:
            for container in pod.spec.containers:
                containers.append({
                    "name": container.name,
                    "image": container.image,
                    "ports": [{"containerPort": p.container_port, "protocol": p.protocol} 
                             for p in container.ports] if container.ports else []
                })
        
        # Extract events (last 5)
        events = v1.list_namespaced_event(
            namespace="default",
            field_selector=f"involvedObject.name={pod_name}"
        )
        
        event_list = []
        for event in events.items[:5]:
            event_list.append({
                "type": event.type,
                "reason": event.reason,
                "message": event.message,
                "timestamp": event.last_timestamp.isoformat() if event.last_timestamp else None
            })
        
        return {
            "name": pod.metadata.name,
            "namespace": pod.metadata.namespace,
            "status": pod.status.phase,
            "node": pod.spec.node_name,
            "ip": pod.status.pod_ip,
            "labels": pod.metadata.labels,
            "containers": containers,
            "events": event_list
        }
    
    except client.exceptions.ApiException as e:
        if e.status == 404:
            raise HTTPException(status_code=404, detail=f"Pod '{pod_name}' not found")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Logs
# ============================================

@app.get("/api/pods/{pod_name}/logs")
def get_pod_logs(pod_name: str, tail: int = 100, container: str = None):
    """Get logs from a specific pod"""
    if not v1:
        raise HTTPException(status_code=503, detail="Kubernetes client not initialized")
    
    try:
        logs = v1.read_namespaced_pod_log(
            name=pod_name,
            namespace="default",
            tail_lines=tail,
            container=container
        )
        
        return {
            "pod": pod_name,
            "container": container,
            "lines": tail,
            "logs": logs
        }
    
    except client.exceptions.ApiException as e:
        if e.status == 404:
            raise HTTPException(status_code=404, detail=f"Pod '{pod_name}' not found")
        raise HTTPException(status_code=400, detail=str(e))


# ============================================
# Metrics
# ============================================

@app.get("/api/metrics")
def get_metrics():
    """Get CPU and memory metrics for all pods"""
    if not custom_api:
        raise HTTPException(status_code=503, detail="Kubernetes client not initialized")
    
    try:
        metrics = custom_api.list_namespaced_custom_object(
            group="metrics.k8s.io",
            version="v1beta1",
            namespace="default",
            plural="pods"
        )
        
        metrics_list = []
        
        for item in metrics.get("items", []):
            pod_name = item["metadata"]["name"]
            
            # Aggregate metrics from all containers in the pod
            total_cpu = 0
            total_memory = 0
            
            for container in item.get("containers", []):
                usage = container.get("usage", {})
                
                # Parse CPU (format: "1m" or "100n")
                cpu_str = usage.get("cpu", "0")
                if cpu_str.endswith("n"):
                    total_cpu += int(cpu_str[:-1]) / 1_000_000  # nanocores to millicores
                elif cpu_str.endswith("m"):
                    total_cpu += int(cpu_str[:-1])
                else:
                    total_cpu += int(cpu_str) * 1000
                
                # Parse Memory (format: "7Mi" or "1024Ki")
                mem_str = usage.get("memory", "0")
                if mem_str.endswith("Ki"):
                    total_memory += int(mem_str[:-2]) / 1024  # Ki to Mi
                elif mem_str.endswith("Mi"):
                    total_memory += int(mem_str[:-2])
                elif mem_str.endswith("Gi"):
                    total_memory += int(mem_str[:-2]) * 1024
                else:
                    total_memory += int(mem_str) / (1024 * 1024)
            
            metrics_list.append({
                "pod": pod_name,
                "cpu": f"{int(total_cpu)}m",
                "cpu_millicores": int(total_cpu),
                "memory": f"{int(total_memory)}Mi",
                "memory_mb": int(total_memory)
            })
        
        return {
            "metrics": metrics_list,
            "count": len(metrics_list)
        }
    
    except Exception as e:
        logger.error(f"Error fetching metrics: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching metrics: {str(e)}")


# ============================================
# Nodes
# ============================================

@app.get("/api/nodes")
def get_nodes():
    """Get list of all nodes in the cluster"""
    if not v1:
        raise HTTPException(status_code=503, detail="Kubernetes client not initialized")
    
    try:
        nodes = v1.list_node()
        
        node_list = []
        for node in nodes.items:
            # Get node conditions
            conditions = {}
            if node.status.conditions:
                for condition in node.status.conditions:
                    conditions[condition.type] = condition.status
            
            # Get node info
            node_info = node.status.node_info
            
            node_list.append({
                "name": node.metadata.name,
                "status": "Ready" if conditions.get("Ready") == "True" else "NotReady",
                "roles": list(node.metadata.labels.get("node-role.kubernetes.io", {}).keys()) or ["worker"],
                "version": node_info.kubelet_version,
                "os": f"{node_info.operating_system}/{node_info.architecture}",
                "container_runtime": node_info.container_runtime_version,
                "conditions": conditions
            })
        
        return {
            "nodes": node_list,
            "count": len(node_list)
        }
    
    except Exception as e:
        logger.error(f"Error fetching nodes: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching nodes: {str(e)}")


# ============================================
# Cluster Overview
# ============================================

@app.get("/api/cluster")
def get_cluster_overview():
    """Get cluster overview statistics"""
    if not v1:
        raise HTTPException(status_code=503, detail="Kubernetes client not initialized")
    
    try:
        # Get all resources
        pods = v1.list_pod_for_all_namespaces()
        nodes = v1.list_node()
        namespaces = v1.list_namespace()
        
        # Count pod statuses
        pod_statuses = {
            "Running": 0,
            "Pending": 0,
            "Failed": 0,
            "Succeeded": 0,
            "Unknown": 0
        }
        
        for pod in pods.items:
            status = pod.status.phase
            pod_statuses[status] = pod_statuses.get(status, 0) + 1
        
        # Count ready nodes
        ready_nodes = sum(1 for node in nodes.items 
                         if any(c.type == "Ready" and c.status == "True" 
                               for c in node.status.conditions))
        
        return {
            "cluster_name": "kind-pulsecheck",
            "nodes": {
                "total": len(nodes.items),
                "ready": ready_nodes
            },
            "pods": {
                "total": len(pods.items),
                "by_status": pod_statuses
            },
            "namespaces": len(namespaces.items)
        }
    
    except Exception as e:
        logger.error(f"Error fetching cluster overview: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching cluster overview: {str(e)}")


# ============================================
# Run Server
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)