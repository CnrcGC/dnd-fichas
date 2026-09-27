import { Link } from "react-router-dom";

export default function PlatformRouteState({ title, description, status = "error", children }) {
  return (
    <section className="platform-page platform-route-state" aria-labelledby="platform-state-title" aria-busy={status === "loading" || undefined}>
      <h1 id="platform-state-title">{title}</h1>
      <p className="platform-page-copy">{description}</p>
      {children}
      {status !== "loading" && <p><Link to="/">Escolher outro sistema</Link></p>}
    </section>
  );
}

