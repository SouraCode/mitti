import { Link } from 'react-router-dom';
export default function EmptyState({
  title = 'Our shelves are being prepared',
  text = 'This collection will be available soon.',
  action = 'Explore our ritual guide',
}) {
  return (
    <div className="empty-state">
      <span className="empty-mark">✦</span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action && (
        <Link className="text-link" to="/ritual-guide">
          {action} →
        </Link>
      )}
    </div>
  );
}
