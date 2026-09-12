import { MONTHS, monthLabel } from "./mockPerformanceData";

export default function MonthTabs({ value, onChange }) {
  return (
    <div className="ep-tabs">
      {MONTHS.map((m) => (
        <button
          key={m}
          type="button"
          className={`ep-tab ${value === m ? "ep-tab--active" : ""}`}
          onClick={() => onChange(m)}
        >
          {monthLabel(m)}
        </button>
      ))}
    </div>
  );
}
