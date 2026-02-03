# 🚀 PulseCheck - Kubernetes Monitoring Dashboard

A modern, real-time Kubernetes cluster monitoring dashboard built with **Next.js**, **FastAPI**, and **TypeScript**. Monitor your K8s cluster health, pod metrics, and node status with a sleek, glassmorphic UI.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/python-3.8%2B-blue)
![Node.js](https://img.shields.io/badge/node.js-18%2B-brightgreen)

---

## ✨ Features

### 📊 **Cluster Overview**
- Real-time cluster status and statistics
- Node availability tracking
- Pod distribution by status (Running, Pending, Failed, Succeeded)
- Namespace count and resource aggregation

### 📈 **Resource Metrics**
- CPU and memory usage tracking per pod
- Interactive area charts with historical data
- Real-time metric updates every 5 seconds
- Color-coded resource utilization (green/amber/red)

### 🐳 **Pod Management**
- Comprehensive pod listing with filtering capabilities
- Pod status indicators (Running, Pending, Failed)
- Per-pod resource metrics (CPU/Memory)
- Quick access to detailed pod information
- Container information and event logs

### 🖥️ **Node Monitoring**
- Node status and readiness tracking
- Role detection (control-plane, worker)
- Kubernetes version and OS information
- Container runtime details
- Node health conditions

### 📝 **Log Viewer**
- Real-time pod logs with 100-line tail
- Container-specific log streaming
- Syntax-highlighted log output
- Interactive navigation

### 🎨 **Modern Design**
- Glassmorphism effects with backdrop blur
- Smooth animations and transitions
- Responsive design (mobile, tablet, desktop)
- Dark theme optimized for extended monitoring
- Gradient accents and glow effects

---

## 🏗️ Architecture

```
PulseCheck/
├── backend/                 # FastAPI server
│   ├── main.py             # API endpoints & K8s integration
│   └── requirements.txt     # Python dependencies
├── frontend/               # Next.js dashboard
│   ├── app/                # Next.js app directory
│   │   ├── page.tsx        # Main dashboard
│   │   ├── pods/           # Pod details page
│   │   ├── layout.tsx      # Root layout
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   │   ├── ClusterOverview.tsx
│   │   ├── PodTable.tsx
│   │   ├── MetricsChart.tsx
│   │   ├── NodeList.tsx
│   │   └── LogViewer.tsx
│   ├── hooks/              # React hooks
│   │   └── usePolling.ts   # Custom polling hook
│   └── package.json        # Node.js dependencies
├── kind-config.yml         # Kind cluster configuration
└── README.md               # This file
```

### **Technology Stack**

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript 5, Tailwind CSS 4 |
| Backend | FastAPI, Python 3.8+, Kubernetes Python Client |
| Kubernetes | Kubernetes API, metrics.k8s.io/v1beta1 |
| UI Components | Lucide React, Recharts |
| Deployment | Kind (Kubernetes in Docker) |

---

## 🚀 Quick Start

### Prerequisites
- **Docker** (for Kind cluster)
- **Python** 3.8 or higher
- **Node.js** 18 or higher
- **kubectl** configured

### 1️⃣ Create Kubernetes Cluster

```bash
# Install Kind if you haven't already
go install sigs.k8s.io/kind@latest

# Create cluster with the provided config
kind create cluster --config kind-config.yml --name pulsecheck
```

### 2️⃣ Start Backend Server

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs` (Swagger UI)

### 3️⃣ Start Frontend Dashboard

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The dashboard will be available at `http://localhost:3000`

### 4️⃣ Connect Frontend to Backend

By default, the frontend expects the API at `http://localhost:8000`. To customize:

```bash
# Set environment variable
export NEXT_PUBLIC_API_URL=http://your-api-url:8000
npm run dev
```

---

## 📡 API Endpoints

### Health & Status
- `GET /health` - Health check endpoint

### Cluster Information
- `GET /api/cluster` - Cluster overview statistics
- `GET /api/nodes` - List all nodes with details
- `GET /api/pods` - List all pods in default namespace

### Pod Operations
- `GET /api/pods/{pod_name}` - Get detailed pod information
- `GET /api/pods/{pod_name}/logs?tail=100&container=name` - Get pod logs
- `GET /api/metrics` - Get CPU and memory metrics for all pods

---

## 🔧 Configuration

### Kind Cluster (`kind-config.yml`)
```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: pulsecheck
nodes:
  - role: control-plane
  - role: worker
  - role: worker
```

### Environment Variables

**Frontend** (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend** (auto-detected)
- Uses `~/.kube/config` and `kind-pulsecheck` context
- Configure context: `kubectl config use-context kind-pulsecheck`

---

## 📊 Features in Detail

### Real-Time Updates
- **Cluster Overview**: Updates every 5 seconds
- **Pod Metrics**: Updates every 5 seconds
- **Node Information**: Updates every 10 seconds
- **Pod Logs**: Updates every 3 seconds

### Resource Metrics
Displays CPU and memory usage with proper unit parsing:
- CPU: nanocores (n), millicores (m), or cores
- Memory: Ki (Kibibytes), Mi (Mebibytes), Gi (Gibibytes)

### Status Indicators
- **Running** (🟢 Green): Pod is active and healthy
- **Pending** (🟡 Amber): Pod is being scheduled
- **Failed** (🔴 Red): Pod has crashed or failed
- **Succeeded** (🟢 Green): Pod completed successfully

---

## 🎨 Design System

### Color Palette
- **Primary**: Blue (`#3b82f6`)
- **Secondary**: Purple (`#8b5cf6`)
- **Success**: Emerald (`#10b981`)
- **Warning**: Amber (`#f59e0b`)
- **Danger**: Red (`#ef4444`)

### Components
- **Glass**: Frosted glass effect with 12px blur
- **Glass Strong**: Enhanced frosted effect with 20px blur
- **Gradients**: Multi-color gradient backgrounds
- **Animations**: Smooth transitions and pulsing glows

---

## 🛠️ Development

### Project Structure
```
frontend/
├── components/          # Reusable React components
├── hooks/              # Custom React hooks
├── app/                # Next.js app directory
├── public/             # Static assets
├── globals.css         # Global styles & animations
└── package.json        # Dependencies

backend/
├── main.py             # FastAPI application
├── requirements.txt    # Python dependencies
└── __pycache__/        # Python cache
```

### Key Components

#### **ClusterOverview.tsx**
Displays cluster statistics with animated cards and loading states.

#### **PodTable.tsx**
Interactive table with pod status, metrics, and quick navigation.

#### **MetricsChart.tsx**
Area charts for CPU and memory usage with historical data.

#### **NodeList.tsx**
Node status display with role and version information.

#### **LogViewer.tsx**
Syntax-highlighted log viewer with monospace font.

#### **usePolling Hook**
Custom hook for periodic data fetching with automatic retries.

---

## 🐛 Troubleshooting

### Backend Issues

**"Failed to connect to Kubernetes"**
```bash
# Verify cluster is running
kubectl cluster-info
kubectl get nodes

# Check context
kubectl config current-context
# Should output: kind-pulsecheck
```

**"Metrics not available"**
```bash
# Metrics require metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Verify it's running
kubectl get deployment metrics-server -n kube-system
```

### Frontend Issues

**"API connection refused"**
```bash
# Verify backend is running
curl http://localhost:8000/health

# Check NEXT_PUBLIC_API_URL
echo $NEXT_PUBLIC_API_URL
```

**"Pods not showing"**
```bash
# Verify default namespace exists
kubectl get namespaces

# Create some pods
kubectl run test-pod --image=nginx
```

---

## 📦 Dependencies

### Backend
- **fastapi**: Fast web framework for building APIs
- **kubernetes**: Official Kubernetes Python client
- **uvicorn**: ASGI web server

### Frontend
- **next.js**: React framework with server-side rendering
- **react**: UI library
- **typescript**: Type-safe JavaScript
- **tailwindcss**: Utility-first CSS framework
- **recharts**: React charting library
- **lucide-react**: Icon library

---

## 🚀 Deployment

### Production Build

**Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run build
npm run start
```

### Docker Deployment
Create Dockerfile for containerized deployment:

```dockerfile
# Backend
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/main.py .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]

# Frontend
FROM node:18-alpine
WORKDIR /app
COPY frontend .
RUN npm install && npm run build
CMD ["npm", "start"]
```

---

## 📝 Code Quality

### Linting
```bash
cd frontend
npm run lint
```

### Type Checking
```bash
cd frontend
npx tsc --noEmit
```

---

## 🔐 Security

- **CORS**: Configured for all origins (change in production)
- **API**: No authentication required (add auth in production)
- **Cluster Access**: Uses kubeconfig from local machine

### Production Recommendations
1. Restrict CORS origins to your frontend domain
2. Implement API authentication (OAuth, JWT)
3. Use HTTPS for all endpoints
4. Implement rate limiting
5. Add request validation and sanitization

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

## 🎯 Roadmap

- [ ] RBAC support
- [ ] Custom dashboards
- [ ] Alerts and notifications
- [ ] Historical data storage
- [ ] Multi-cluster support
- [ ] Pod auto-scaling controls
- [ ] Network policies visualization
- [ ] Performance optimization

---

**Built with ❤️ for Kubernetes monitoring**
