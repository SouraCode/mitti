import { Link } from 'react-router-dom';
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div>
          <Link className="brand light" to="/">
            <span>MITTI</span>
            <small>RITUALS</small>
          </Link>
          <p>
            Mindful botanical care,
            <br />
            made for everyday rituals.
          </p>
        </div>
        <div>
          <h3>Explore</h3>
          <Link to="/shop">Shop all</Link>
          <Link to="/our-story">Our story</Link>
          <Link to="/ritual-guide">Ritual guide</Link>
        </div>
        <div>
          <h3>Care</h3>
          <Link to="/contact">Contact</Link>
          <Link to="/faq">FAQs</Link>
          <Link to="/policies/shipping">Shipping & returns</Link>
        </div>
        <div>
          <h3>Stay in the ritual</h3>
          <p>Quiet notes on care, ingredients and seasonal rituals.</p>
          <form className="newsletter">
            <input aria-label="Email address" placeholder="Your email address" type="email" />
            <button>Join</button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        © 2026 Mitti Rituals{' '}
        <span>
          <Link to="/policies/privacy">Privacy</Link>
          <Link to="/policies/terms">Terms</Link>
        </span>
      </div>
    </footer>
  );
}
