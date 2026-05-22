import { useEffect, useState } from "react";

export default function AnnouncementBar() {
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (!closed) {
      document.body.classList.add("has-top-strip");
    } else {
      document.body.classList.remove("has-top-strip");
    }

    return () => document.body.classList.remove("has-top-strip");
  }, [closed]);

  if (closed) return null;

  return (
    <div className="top-strip">
      <div className="top-strip-content">
        <em>Now Live!</em>

        <strong>
          Explore attacker activity collected from distributed honeypot sensors
        </strong>

        <a href="#">Open IP lookup →</a>
      </div>

      <button
        className="top-strip-close"
        onClick={() => setClosed(true)}
      >
        ×
      </button>
    </div>
  );
}
