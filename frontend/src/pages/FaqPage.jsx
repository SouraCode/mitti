const faqs = [
  [
    'When will products be available?',
    'Our first small-batch releases are currently being prepared. Join our newsletter for launch notes.',
  ],
  [
    'Where do you ship?',
    'Shipping regions and timelines will be published before the collection opens.',
  ],
  [
    'How can I find the right ritual?',
    'The Ritual Guide is a gentle starting point. Product-specific guidance will be added with each release.',
  ],
  [
    'Can I contact the team?',
    'Yes. Send us a note through the contact page and we will get back to you as soon as we can.',
  ],
];
export default function FaqPage() {
  return (
    <section className="section faq">
      <div className="page-intro">
        <p className="eyebrow">Helpful answers</p>
        <h1>Frequently asked questions</h1>
      </div>
      {faqs.map(([question, answer]) => (
        <details key={question}>
          <summary>
            {question}
            <span>+</span>
          </summary>
          <p>{answer}</p>
        </details>
      ))}
    </section>
  );
}
