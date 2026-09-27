import { Link } from "react-router-dom";

export default function PlatformPlaceholder({ title, description, returnTo = "/" }) {
  return (
    <section className="platform-page">
      <h1>{title}</h1>
      <p className="platform-page-copy">{description}</p>
      <p><Link to={returnTo}>Voltar</Link></p>
    </section>
  );
}

