type Bar = {
  label: string;
  value: number;
  tone?: "cool" | "warm" | "neutral";
};

type Props = {
  title: string;
  bars: Bar[];
};

const BarChart = ({ title, bars }: Props) => {
  const max = Math.max(1, ...bars.map((bar) => bar.value));

  return (
    <div className="chart-card glass">
      <h3>{title}</h3>
      <div className="chart-bars">
        {bars.map((bar) => (
          <div key={bar.label} className="chart-row">
            <span>{bar.label}</span>
            <div className="chart-track">
              <div
                className={`chart-bar ${bar.tone ?? "neutral"}`}
                style={{ width: `${(bar.value / max) * 100}%` }}
              />
            </div>
            <strong>{bar.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;
