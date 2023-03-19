import type {ReactNode} from 'react';

import {Card} from '../ui';

export const AdminMetricCard = ({
  icon,
  label,
  value,
  trend
}: {
  icon: ReactNode;
  label: string;
  value: string;
  trend: string;
}) => (
  <Card className="admin-metric-card">
    <div className="metric-icon">{icon}</div>
    <span>{label}</span>
    <strong>{value}</strong>
    <small>{trend}</small>
  </Card>
);
