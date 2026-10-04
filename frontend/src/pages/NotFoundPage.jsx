import EmptyState from '../components/common/EmptyState';
export default function NotFoundPage() {
  return (
    <section className="section">
      <EmptyState
        title="This page has wandered off"
        text="The page you’re looking for isn’t here."
        action="Return home"
      />
    </section>
  );
}
