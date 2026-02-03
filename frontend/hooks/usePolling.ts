import { useEffect, useState } from 'react';

export function usePolling<T>(
  fetchFn: () => Promise<T>,
  interval: number = 5000
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const result = await fetchFn();
        if (isMounted) {
          setData(result);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchData();

    // Poll at interval
    const intervalId = setInterval(fetchData, interval);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [fetchFn, interval]);

  return { data, loading, error };
}