interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ title, description, actionLabel, onAction }: EmptyStateProps) => (
  <div className="empty-state">
    <div className="empty-state__mark">∑</div>
    <h2>{title}</h2>
    <p>{description}</p>
    {actionLabel ? <button onClick={onAction}>{actionLabel}</button> : null}
  </div>
);
