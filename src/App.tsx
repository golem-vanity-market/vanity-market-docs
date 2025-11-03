import React, { useMemo } from "react";
import { Excalidraw } from "@excalidraw/excalidraw"; // your saved Excalidraw data
import "@excalidraw/excalidraw/index.css";
import jsonData from "./example.excalidraw.json";
import { ExcalidrawInitialDataState } from "@excalidraw/excalidraw/types";

function App() {
  const initialData = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const fileParam = params.get("file") || params.get("url");

    if (!fileParam) {
      return jsonData as unknown as ExcalidrawInitialDataState;
    }

    // Use server proxy to avoid CORS issues
    const proxyUrl = `/api/fetch?url=${encodeURIComponent(fileParam)}`;

    return (async () => {
      try {
        const res = await fetch(proxyUrl, { credentials: "omit" });
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const data = (await res.json()) as ExcalidrawInitialDataState;
        return data;
      } catch (e) {
        // Fallback to bundled example on error
        return jsonData as unknown as ExcalidrawInitialDataState;
      }
    })();
  }, []);

  return (
    <>
      <h1 style={{ textAlign: "center" }}>Excalidraw Example</h1>
      <div style={{ height: "500px" }}>
        <Excalidraw initialData={initialData} viewModeEnabled={true} />
      </div>
    </>
  );
}

export default App;
