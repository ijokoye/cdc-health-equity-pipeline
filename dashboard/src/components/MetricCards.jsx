function MetricCards({ countiesShown, uniqueStates, averageObesity, averageSVI, highRiskCount }) {
  const cards = [
    { label: "Counties Shown",    value: countiesShown },
    { label: "Unique States",     value: uniqueStates },
    { label: "Average Obesity",   value: averageObesity ? `${averageObesity}%` : "--" },
    { label: "Average SVI",       value: averageSVI },
    { label: "High-Risk Counties", value: highRiskCount },
  ];

  return (
    <section className="cards-grid">
      {cards.map((card) => (
        <div className="card" key={card.label}>
          <p className="card-label">{card.label}</p>
          <p className="card-value">{card.value}</p>
        </div>
      ))}
    </section>
  );
}

export default MetricCards;
