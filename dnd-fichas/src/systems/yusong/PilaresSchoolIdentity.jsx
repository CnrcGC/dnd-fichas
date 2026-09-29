import { getPilaresSchool } from "./identityOptions";
import "./PilaresSchoolIdentity.css";

export default function PilaresSchoolIdentity({ schoolId, compact = false }) {
  const school = getPilaresSchool(schoolId);
  return (
    <span
      className={`pilares-school-badge ${compact ? "pilares-school-badge--compact" : ""}`}
      data-school={school.id}
      data-school-pattern={school.pattern}
    >
      <span className="pilares-school-badge__mark" aria-hidden="true">{school.monogram}</span>
      <span>{school.name}</span>
    </span>
  );
}
