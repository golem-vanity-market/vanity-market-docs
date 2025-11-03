import React from "react";
import { Excalidraw } from "@excalidraw/excalidraw"; // your saved Excalidraw data
import "@excalidraw/excalidraw/index.css";
import jsonData from "./example.excalidraw.json";
import { ExcalidrawInitialDataState } from "@excalidraw/excalidraw/types";

function App() {
  return (
    <>
      <h1 style={{ textAlign: "center" }}>Excalidraw Example</h1>
      <div style={{ height: "500px" }}>
        <Excalidraw
          initialData={jsonData as unknown as ExcalidrawInitialDataState}
          viewModeEnabled={true}
        />
      </div>
    </>
  );
}

export default App;
