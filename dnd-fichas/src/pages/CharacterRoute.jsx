import { Navigate, useParams } from "react-router-dom";

export default function CharacterRoute() {
  const { id } = useParams();
  return <Navigate to={`/ficha/${encodeURIComponent(id)}`} replace />;
}

