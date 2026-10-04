export default function EmptyAdminState({ title, text }) {
  return (
    <div className="admin-empty">
      <span>✦</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
