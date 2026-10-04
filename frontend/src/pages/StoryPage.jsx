import { Link } from 'react-router-dom';
export default function StoryPage() {
  return (
    <>
      <section className="story-hero">
        <div>
          <p className="eyebrow">Our story</p>
          <h1>
            Born from the earth,
            <br />
            made for real life.
          </h1>
        </div>
      </section>
      <section className="prose-section">
        <p className="eyebrow">A return to the essentials</p>
        <h2>We believe care is not a chore. It is a pause.</h2>
        <p>
          Mitti Rituals is a considered home for handmade hair and skincare, grounded in plant
          wisdom and the everyday pleasure of taking your time. We make space for thoughtful
          formulas, quieter routines, and the gentle consistency that care deserves.
        </p>
        <p>
          Each future release will be prepared in small batches and shared only when it is ready. No
          rush. No excess. Just beautiful essentials for the rituals you return to.
        </p>
        <Link className="text-link" to="/ritual-guide">
          Discover your ritual →
        </Link>
      </section>
      <section className="values">
        <div>
          <span>01</span>
          <h3>Rooted</h3>
          <p>We look first to plants, place and time-tested ways of caring.</p>
        </div>
        <div>
          <span>02</span>
          <h3>Considered</h3>
          <p>We choose fewer, better steps and keep our work intentional.</p>
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
