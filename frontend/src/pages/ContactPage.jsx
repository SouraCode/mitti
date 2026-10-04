export default function ContactPage() {
  return (
    <section className="contact-page">
      <div className="contact-intro">
        <p className="eyebrow">Say hello</p>
        <h1>
          We'd love to hear
          <br />
          from you.
        </h1>
        <p>For care questions, order support or a simple note, write to us below.</p>
        <a className="text-link" href="mailto:hello@mittirituals.com">
          hello@mittirituals.com
        </a>
      </div>
      <form className="contact-form">
        <label>
          Name
          <input required placeholder="Your name" />
        </label>
        <label>
          Email
          <input required type="email" placeholder="you@example.com" />
        </label>
        <label>
          How can we help?
          <textarea required rows="5" placeholder="Write your message" />
        </label>
        <button className="button">Send message</button>
      </form>
    </section>
  );
}
