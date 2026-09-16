import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";

import { getMe, logout } from "../api/auth";
import { getDashboardLiveEvents } from "../api/dashboard";

const PAGE_SIZE = 25;

function formatTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeVerdict(value) {
  return String(value || "unknown")
    .toLowerCase()
    .replaceAll("_", "-")
    .replaceAll(" ", "-");
}

export default function SignalsPage() {
  const navigate = useNavigate();
const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);

  const [status, setStatus] = useState("loading");
const [hours, setHours] = useState(24);
  const [verdict, setVerdict] = useState("all");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [pageIndex, setPageIndex] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function authenticate() {
      try {
        const me = await getMe();
        setUser(me);
      } catch {
        logout();
        navigate("/login");
      }
    }

    authenticate();
  }, [navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPageIndex(0);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);
useEffect(() => {
    if (!user) return;

    let active = true;

    async function loadSignals(silent = false) {
      try {
        if (!silent) {
          setStatus("loading");
        }

        const offset = pageIndex * PAGE_SIZE;

        const data = await getDashboardLiveEvents(
          PAGE_SIZE,
          hours,
          offset,
          search,
          verdict
        );

        if (!active) return;

        setEvents(data.results || []);
        setTotal(Number(data.total ?? 0));
        setStatus("ready");
      } catch {
        if (!active) return;

        if (!silent) {
          setStatus("error");
        }
      }
    }

    loadSignals();

    const timer = setInterval(() => {
      loadSignals(true);
    }, 10000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [user, hours, verdict, search, pageIndex]);
function changeHours(value) {
    setHours(Number(value));
    setPageIndex(0);
  }

  function changeVerdict(value) {
    setVerdict(value);
    setPageIndex(0);
  }
const start = total > 0 ? pageIndex * PAGE_SIZE + 1 : 0;
  const end = Math.min(pageIndex * PAGE_SIZE + events.length, total);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const hasPrevious = pageIndex > 0;
  const hasNext = pageIndex + 1 < totalPages;

  return (
    <main className="dashboard-shell dashboard-shell-topnav overview-dashboard signals-dashboard">
      <DashboardNavbar user={user} />

      <section className="dashboard-main overview-main signals-main">
        <header className="signals-header">
          <div>
            <span className="overview-kicker">Signals</span>

            <h1>Threat signals</h1>

            <p>
              Explore activity observed across your DrishtiMesh sensors.
            </p>
          </div>

          <span className="overview-live">
            <i></i>
            Live
          </span>
        </header>

        <section className="signals-toolbar">
          <div className="signals-search">
            <span>⌕</span>

            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search IP, sensor, signal type..."
              aria-label="Search threat signals"
            />
          </div>

          <select
            value={hours}
            onChange={(event) => changeHours(event.target.value)}
            aria-label="Signal time range"
          >
            <option value={6}>Past 6 hours</option>
            <option value={12}>Past 12 hours</option>
            <option value={24}>Past 24 hours</option>
            <option value={168}>Past 7 days</option>
          </select>

          <select
            value={verdict}
            onChange={(event) => changeVerdict(event.target.value)}
            aria-label="Signal verdict"
          >
            <option value="all">All verdicts</option>
            <option value="malicious">Malicious</option>
            <option value="suspicious">Suspicious</option>
            <option value="unknown">Unknown</option>
          </select>
        </section>

        <div className="signals-result-head">
          <div>
            <strong>Recent activity</strong>
            <span>
              {status === "ready"
                ? `${total.toLocaleString()} total signals`
                : "Loading signals"}
            </span>
          </div>
        </div>

        {status === "loading" && (
          <div className="signals-state">
            Loading threat signals...
          </div>
        )}

        {status === "error" && (
          <div className="signals-state">
            <strong>Unable to load signals</strong>
            <span>Please try again.</span>
          </div>
        )}

        {status === "ready" && events.length === 0 && (
          <div className="signals-state">
            <strong>No matching signals</strong>
            <span>
              Try changing the time range, verdict, or search.
            </span>
          </div>
        )}

        {status === "ready" && events.length > 0 && (
          <>
            <div className="signals-table-wrap">
              <table className="signals-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Source IP</th>
                    <th>Event</th>
                    <th>Sensor</th>
                    <th>Verdict</th>
                    <th>Score</th>
                  </tr>
                </thead>

                <tbody>
                  {events.map((event, index) => {
                    const signalVerdict =
                      event.verdict ||
                      event.severity ||
                      "unknown";

                    const verdictClass =
                      normalizeVerdict(signalVerdict);

                    return (
                      <tr
                        key={`${event.src_ip}-${event.observed_at}-${index}`}
                      >
                        <td className="signals-time">
                          {formatTime(event.observed_at)}
                        </td>

                        <td>
                          {event.src_ip ? (
                            <button
                              type="button"
                              className="signals-ip"
                              onClick={() =>
                                window.open(
                                  `/lookup?ip=${encodeURIComponent(
                                    event.src_ip
                                  )}`,
                                  "_blank",
                                  "noopener,noreferrer"
                                )
                              }
                            >
                              {event.src_ip}
                            </button>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td>
                          {event.signal_type || "unknown"}
                        </td>

                        <td>
                          {event.sensor || "sensor"}
                        </td>

                        <td>
                          <span
                            className={`signals-verdict signals-verdict-${verdictClass}`}
                          >
                            {signalVerdict}
                          </span>
                        </td>

                        <td className="signals-score">
                          {event.score ??
                            event.confidence ??
                            "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <footer className="signals-pagination">
              <span>
                Showing {start}–{end} of {total.toLocaleString()}
              </span>

              <div>
                <button
                  type="button"
                  disabled={!hasPrevious}
                  onClick={() =>
                    setPageIndex((value) =>
                      Math.max(0, value - 1)
                    )
                  }
                >
                  Previous
                </button>

                <span>
                  Page {pageIndex + 1} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={!hasNext}
                  onClick={() =>
                    setPageIndex((value) => value + 1)
                  }
                >
                  Next
                </button>
              </div>
            </footer>
          </>
        )}
      </section>
    </main>
  );
}
