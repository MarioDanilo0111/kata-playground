import { useState, useMemo } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

const BASE_URL = "https://hapi.fhir.org/baseR4";

function buildURL(params) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.append(k, v);
  });
  return q.toString();
}

function App() {
  const [patientId, setPatientId] = useState("594843");
  const [category, setCategory] = useState("laboratory");
  const [count, setCount] = useState(10);
  const [status, setStatus] = "idle";
  const [error, setError] = useState("");

  const url = useMemo(() => {
    const qs = buildURL({
      patient: patientId,
      _sort: "-date",
      _count: count,
      category,
    });

    return `${BASE_URL}/Observation?${qs}`;
  }, [patientId, count, category]);

  return (
    <div>
      <h1>FHIR Observations Browser</h1>
      <h3>{url}</h3>
    </div>
  );
}

export default App;
