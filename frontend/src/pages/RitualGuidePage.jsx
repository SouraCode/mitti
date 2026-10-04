const rituals = [
  [
    'Begin with the scalp',
    'A calm scalp ritual can anchor the rest of your care. Massage with light, steady pressure and let the moment lengthen.',
  ],
  [
    'Cleanse with care',
    'Choose a wash rhythm that respects your hair and skin rather than pushing them to perform.',
  ],
  [
    'Seal in softness',
    'Apply nourishment to slightly damp skin or ends, then give it a moment to settle.',
  ],
];
export default function RitualGuidePage() {
  return (
    <section className="section guide">
      <div className="page-intro">
        <p className="eyebrow">Ritual guide</p>
        <h1>
          Care is a practice,
          <br />
          not a performance.
        </h1>
        <p>A few small ways to make your routine feel more like your own.</p>
      </div>
      <div className="ritual-list">
        {rituals.map(([title, copy], index) => (
          <article key={title}>
            <span>0{index + 1}</span>
            <div>
              <h2>{title}</h2>
              <p>{copy}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
