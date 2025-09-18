import { useState, useMemo, useEffect } from "react";
/* import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
*/
import "./App.css";

const BASE_URL = "https://hapi.fhir.org/baseR4";

function buildQS(params) {
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
  const [data, setData] = useState(null);
  const [state, setState] = useState("idle"); //idle | loading | error | done
  const [error, setError] = useState("");

  const url = useMemo(() => {
    const qs = buildQS({
      patient: patientId,
      category,
      _sort: "-date",
      _count: count,
    });
    return `${BASE_URL}/Observation?${qs}`;
  }, [patientId, category, count]);

  useEffect(() => {
    const ctrl = new AbortController();
    setState("loading");
    setError("");
    fetch(url, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((json) => {
        setData(json);
        setState("done");
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setError(e.statusText || String(e));
        }
      });
    return () => ctrl.abort();
  }, [url]);

  const items = data?.entry?.map((e) => e.resource) ?? [];

  //console.log("items existing: ", items);

  return (
    <div
      className=""
      style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}
    >
      <h1>FHRI Observation Browser</h1>
      <label>
        Patient ID
        <input
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
        />
      </label>
      <label>
        Category
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="laboratory">laboratory</option>
          <option value="viral-signs">vital-signs</option>
          <option value="">(all)</option>
        </select>
      </label>
      <label>
        count
        <input
          type="number"
          min={1}
          max={50}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
        />
      </label>
      <div style={{ alignSelf: "end", padding: "36px" }}>
        <small>URL: </small>
        <div style={{ whiteSpace: "nowrop", overflow: "auto" }}>
          <code>{url}</code>
        </div>
      </div>
      {state === "loading" && <p>Loading</p>}
      {state === "error" && <p style={{ color: "crimson" }}>Error: {error}</p>}

      <ul style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {items.map((obs) => {
          const title =
            obs.code?.text ||
            obs.code?.coding?.[0]?.display ||
            obs.code?.coding?.[0]?.code ||
            obs.id;
          const when = obs.effectiveDateTime || obs.issued || "-";
          const value = obs.valueQuantity
            ? `${obs.valueQuantity.value} ${obs.valueQuantity.unit || ""}`
            : obs.valueString || obs.valueCodebleConcept?.text || "-";

          return (
            <li
              key={obs.id}
              style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}
            >
              <div>{value}</div>
              <div>{when}</div>
              <div>Object: {obs.subject?.reference}</div>
            </li>
          );
        })}
      </ul>
      {state === "done" && items.length === 0 && (
        <p>No observations found for this file.</p>
      )}
    </div>
  );
}

export default App;
