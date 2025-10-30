/**
 * Features grid with subtle hover scale animations.
 */
export default function FeatureCards() {
  const cards = [
    { title: 'Course Strategy', desc: 'Smart plans tailored to your handicap and goals.' },
    { title: 'Equipment Fit', desc: 'Recommendations for clubs and balls that suit you.' },
    { title: 'Practice Plans', desc: 'Targeted drills to accelerate improvement.' },
  ];

  return (
    <section className="bg-white py-12">
      <div className="container mx-auto grid grid-cols-1 gap-6 px-6 md:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.title}
            className="ease-std rounded-xl border p-6 shadow-sm transition-transform duration-std hover:scale-105 hover:shadow-md"
          >
            <h3 className="text-xl font-semibold text-emerald">{c.title}</h3>
            <p className="mt-2 text-gray-600">{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
