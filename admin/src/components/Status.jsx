export default function Status({ children, tone = 'neutral' }) {
  return <span className={`status ${tone}`}>{children}</span>;
}
