export default function DashboardCommandBar({ hours, onHoursChange }) {
  return (
    <section className="dash-command-bar">
      <div className="dash-search-box">
        <span>⌕</span>
        <input placeholder="Search IP, sensor, signal type..." />
      </div>

      <select
        value={hours}
        onChange={(e) => onHoursChange(Number(e.target.value))}
      >
        <option value={6}>Past 6 hours</option>
        <option value={12}>Past 12 hours</option>
        <option value={24}>Past 24 hours</option>
        <option value={168}>Past 7 days</option>
      </select>

      <select defaultValue="all">
        <option value="all">All verdicts</option>
        <option value="malicious">Malicious</option>
        <option value="suspicious">Suspicious</option>
        <option value="unknown">Unknown</option>
      </select>

      <button type="button">Search</button>
    </section>
  );
}
