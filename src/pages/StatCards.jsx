export default function StatCard({ label, value, sub, icon, tone = "default" }) {
  const Icon = icon;
  return (
    <div className="ep-stat">
      <div className="ep-stat__top">
        <p className="ep-stat__label">{label}</p>
        <span className={`ep-stat__icon ep-stat__icon--${tone}`}>{Icon ? <Icon /> : null}</span>
      </div>
      <p className="ep-stat__value">{value}</p>
      {sub ? <p className="ep-stat__sub">{sub}</p> : null}
    </div>
  );
}
