import { Link } from "react-router-dom";

export default function PlatformPlaceholder({ title, description }) {
  return (
    <section className="platform-page">
      <h1>{title}</h1>
      <p className="platform-page-copy">{description}</p>
      <p><Link to="/">Voltar para personagens</Link></p>
    </section>
  );
}

