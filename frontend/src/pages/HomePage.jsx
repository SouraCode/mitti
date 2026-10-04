import { Link } from 'react-router-dom';
import SectionHeading from '../components/common/SectionHeading';
import ProductGrid from '../components/product/ProductGrid';
import { useProducts } from '../hooks/useProducts';

const categories = [
  { title: 'Hair care', note: 'Care from scalp to ends', image: 'home-category-hair' },
  { title: 'Skin care', note: 'A softer everyday ritual', image: 'home-category-skin' },
  { title: 'Cleansing', note: 'A fresh start, gently', image: 'home-category-cleanse' },
];

export default function HomePage() {
  const { products, loading } = useProducts({ limit: '4' });

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="home-kicker">
            <span /> Botanical care, made with intention
          </p>
          <h1>
            Make room for
            <br />
            <em>your ritual.</em>
          </h1>
          <p className="home-hero-description">
            Thoughtful, small-batch care for hair, skin, and the moments in between.
          </p>
          <div className="home-hero-actions">
            <Link className="home-primary-link" to="/shop">
              Explore the collection <span aria-hidden="true">↗</span>
            </Link>
            <Link className="home-secondary-link" to="/our-story">
              The Mitti way
            </Link>
          </div>
          <div className="home-hero-footnote">
            <span className="home-footnote-mark" aria-hidden="true">
              m.
            </span>
            <span>
              Slow care for everyday life.
              <br />
              Rooted in simple rituals.
            </span>
          </div>
        </div>
        <div
          className="home-hero-visual"
          role="img"
          aria-label="Botanical skincare arranged in warm morning light"
        >
          <div className="hero-floating-note">
            <span>01 / 03</span>
            <i />
            Made for your rhythm
          </div>
          <div className="hero-roundel" aria-hidden="true">
            <span>CARE</span>
            <b>✳</b>
            <span>IN RITUAL</span>
          </div>
          <div className="hero-image-caption">
            <span>THE DAILY RITUAL</span>
            <span>01 — ROOTED IN NATURE</span>
          </div>
        </div>
        <div className="hero-scroll-cue" aria-hidden="true">
          <span />
          Scroll to explore
        </div>
      </section>

      <section className="home-values" aria-label="Our approach">
        <div>
          <span className="value-number">01</span>
          <p>
            <strong>Plant-led</strong>
            <small>Thoughtfully chosen ingredients</small>
          </p>
        </div>
        <div>
          <span className="value-number">02</span>
          <p>
            <strong>Small batch</strong>
            <small>Made with care, not haste</small>
          </p>
        </div>
        <div>
          <span className="value-number">03</span>
          <p>
            <strong>Everyday ritual</strong>
            <small>Simple care, made meaningful</small>
          </p>
        </div>
      </section>

      <section className="home-categories section">
        <div className="home-section-intro">
          <div>
            <p className="eyebrow">Find your rhythm</p>
            <h2>Care for every kind of day.</h2>
          </div>
          <p>Start with what you need. Stay for how it feels.</p>
        </div>
        <div className="home-category-grid">
          {categories.map((category, index) => (
            <Link
              className={`home-category-card ${category.image}`}
              to={`/shop?category=${encodeURIComponent(category.title)}`}
              key={category.title}
              style={{ '--category-order': index }}
            >
              <span className="category-index">0{index + 1}</span>
              <span className="home-category-copy">
                <strong>{category.title}</strong>
                <small>{category.note}</small>
              </span>
              <span className="category-arrow" aria-hidden="true">
                ↗
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-story-band">
        <div
          className="home-story-image"
          role="img"
          aria-label="Natural botanical ingredients and care products"
        />
        <div className="home-story-copy">
          <p className="eyebrow">A little more mindful</p>
          <h2>
            Care that begins
            <br />
            with listening.
          </h2>
          <p>
            We believe the best routines leave room to slow down. Mitti Rituals brings thoughtful
            botanical care into the everyday, one small moment at a time.
          </p>
          <Link className="home-text-link" to="/our-story">
            Discover our story <span aria-hidden="true">→</span>
          </Link>
          <span className="story-ornament" aria-hidden="true">
            ✳
          </span>
        </div>
      </section>

      <section className="home-products section">
        <SectionHeading
          eyebrow="From our studio"
          title="A ritual to come back to."
          copy="Explore the products currently available in our collection."
          action={
            <Link className="home-text-link" to="/shop">
              View the collection <span aria-hidden="true">→</span>
            </Link>
          }
        />
        <ProductGrid products={products} loading={loading} />
      </section>

      <section className="home-closing">
        <div className="closing-flower" aria-hidden="true">
          ✳
        </div>
        <p className="eyebrow">Begin where you are</p>
        <h2>
          A little care can
          <br />
          <em>change the feeling of a day.</em>
        </h2>
        <Link className="home-primary-link" to="/shop">
          Find your ritual <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </div>
  );
}
