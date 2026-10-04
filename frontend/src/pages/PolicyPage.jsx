import { useParams } from 'react-router-dom';
const titles = {
  privacy: 'Privacy policy',
  terms: 'Terms of service',
  shipping: 'Shipping & returns',
};
export default function PolicyPage() {
  const { policy } = useParams();
  return (
    <section className="section policy">
      <p className="eyebrow">Mitti Rituals</p>
      <h1>{titles[policy] || 'Store policy'}</h1>
      <p>
        Our complete {titles[policy]?.toLowerCase() || 'policy'} will be published before the
        storefront opens for orders.
      </p>
    </section>
  );
}
