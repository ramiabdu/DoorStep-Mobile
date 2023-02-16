import {useEffect, useState} from 'react';
import {Server, WifiOff} from 'lucide-react';

import {API_URL, api} from '../api/client';
import {Card, LoadingState} from '../components/ui';

interface HealthPayload {
  status: string;
  service: string;
  timestamp: string;
}

export const HealthPage = () => {
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setHealth(await api.health());
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Health check failed');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  if (isLoading) {
    return <LoadingState label="Checking API health" />;
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <span className="eyebrow">API health</span>
        <h1>Backend connectivity.</h1>
        <p>{API_URL}</p>
      </div>

      <Card className={error ? 'health-card down' : 'health-card'}>
        {error ? <WifiOff size={30} /> : <Server size={30} />}
        <div>
          <h2>{error ? 'Backend unavailable' : 'Backend online'}</h2>
          <p>{error ?? `${health?.service} responded at ${health?.timestamp}`}</p>
        </div>
      </Card>
    </section>
  );
};
