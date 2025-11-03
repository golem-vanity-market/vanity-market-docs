import React from "react";
import {Excalidraw} from "@excalidraw/excalidraw"; // your saved Excalidraw data
import "@excalidraw/excalidraw/index.css";

function App() {
  return (
    <>
      <h1 style={{ textAlign: "center" }}>Excalidraw Example</h1>
      <div style={{ height: "500px" }}>
        <Excalidraw />
      </div>
    </>
  );
}

export default App;
