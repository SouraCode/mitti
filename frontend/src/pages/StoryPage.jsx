import { Link } from 'react-router-dom';

const storyHighlights = [
  {
    number: '01',
    title: 'Rooted in nature',
    text: 'We begin with ingredients that respect the rhythm of the earth and the skin they nourish.',
  },
  {
    number: '02',
    title: 'Crafted with care',
    text: 'Every formula is thoughtfully made in small batches to preserve freshness and purity.',
  },
  {
    number: '03',
    title: 'Made for rituals',
    text: 'Our routines are designed to turn everyday self-care into a calming, meaningful pause.',
  },
];

export default function StoryPage() {
  return (
    <>
      <section className="story-hero">
        <div className="story-hero__content">
          <div className="story-hero__copy">
            <p className="eyebrow">Our story</p>
            <h1>
              Born from the soil,
              <br />
              made for beautifully mindful days.
            </h1>
            <p>
              Mitti Rituals brings together the calming power of plants, the richness of honest
              ingredients, and the joy of routines that feel as good as they look.
            </p>
            <div className="story-badges">
              <span>Organic blends</span>
              <span>Small-batch care</span>
              <span>Gentle daily rituals</span>
            </div>
          </div>

          <div className="story-hero__card" aria-label="Brand promise">
            <div className="story-hero__label">Our promise</div>
            <h2>Less noise. More ritual.</h2>
            <div className="story-hero__stats">
              <div>
                <strong>Plant-first</strong>
                <span>Ingredients</span>
              </div>
              <div>
                <strong>Thoughtful</strong>
                <span>Formulas</span>
              </div>
              <div>
                <strong>Everyday</strong>
                <span>Luxury</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="prose-section story-journey">
        <div className="story-intro">
          <p className="eyebrow">A return to the essentials</p>
          <h2>We believe care should feel uplifting, honest, and deeply personal.</h2>
        </div>

        <div className="story-journey__grid">
          <div className="story-panel story-panel--text">
            <p>
              Mitti Rituals began with a simple idea: beauty rituals should be as nourishing as the
              ingredients they carry. We wanted to create a slower, kinder kind of self-care—one
              rooted in nature, built around natural textures, and designed to turn ordinary routines
              into joyful moments of pause.
            </p>
            <p>
              Our formulas are inspired by the comforting wisdom of the earth: warm botanicals,
              restorative oils, and ingredient stories that feel gentle yet effective. We believe that
              the products you use every day should support your skin while also creating a sense of
              calm, clarity, and ritual.
            </p>
          </div>

          <div className="story-panel story-panel--quote">
            <span className="story-quote-mark">“</span>
            <p>
              We create care that feels personal and grounding—beautifully simple, deeply effective,
              and made to be enjoyed again and again.
            </p>
          </div>
        </div>

        <div className="story-feature-grid">
          {storyHighlights.map((item) => (
            <article key={item.number} className="story-feature-card">
              <span>{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <div className="story-cta-row">
          <p>
            Thoughtfully made for skin that wants softness, glow, and a little more ease in the day.
          </p>
          <Link className="text-link" to="/ritual-guide">
            Discover your ritual →
          </Link>
        </div>
      </section>

      <section className="values">
        <div>
          <span>01</span>
          <h3>Rooted</h3>
          <p>We look first to plants, place, and time-tested ways of caring.</p>
        </div>
        <div>
          <span>02</span>
          <h3>Considered</h3>
          <p>We choose fewer, better steps and keep every detail intentional.</p>
        </div>
        <div>
          <span>03</span>
          <h3>Gentle</h3>
          <p>Kindness informs every touchpoint, from formula to packaging.</p>
        </div>
      </section>
    </>
  );
}
