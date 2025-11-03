import React, {useEffect} from "react";
import {Excalidraw} from "@excalidraw/excalidraw"; // your saved Excalidraw data
import "@excalidraw/excalidraw/index.css";
import jsonData from "./example.excalidraw.json";
import {ExcalidrawInitialDataState} from "@excalidraw/excalidraw/types";

function App() {
  const [data, setData] = React.useState<ExcalidrawInitialDataState | null>(null);
  const [presentationMode, setPresentationMode] = React.useState<boolean>(false);
  const [title, setTitle] = React.useState<string>("Excalidraw Viewer");


  const initialData = async () => {
    const params = new URLSearchParams(window.location.search);
    const fileParam = params.get("url");
    const titleParam = params.get("title");
    if (titleParam) {
      setTitle(titleParam);
    } else {
      //last part of the fileParam as title
      if (fileParam) {
        const parts = fileParam.split("/");
        if (parts.length > 0) {
          const lastPart = parts[parts.length - 1];
          setTitle(decodeURIComponent(lastPart));
        }
      }
    }

    let presentationMode = false;
    if (!fileParam) {
      return {
        "data": jsonData as unknown as ExcalidrawInitialDataState,
        "presentationMode": presentationMode
      }
    }

    // Use server proxy to avoid CORS issues
    const proxyUrl = `${fileParam}`;
    try {
      const res = await fetch(proxyUrl, {credentials: "omit"});

      console.log("Trying to fetch Excalidraw file from:", proxyUrl);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = (await res.json()) as ExcalidrawInitialDataState;
      return {
        "data": data,
        "presentationMode": true
      };
    } catch (e) {
      // Fallback to bundled example on error
      console.error("Error fetching Excalidraw file:", e);
      throw new Error("Failed to fetch Excalidraw file");
    }
  };

  useEffect(() => {
    initialData().then((data) => {
        console.log("Loaded initial data:", data);
        setData(data.data);
        setPresentationMode(data.presentationMode);
      },
      (error) => {
        console.error("Error loading initial data:", error);
      });
  }, []);

  return (
    <>
      <h1 style={{textAlign: "center"}}>{title}</h1>
      <div style={{height: "100vh", width: "100vw"}}>
        {data ?
          <Excalidraw initialData={data} viewModeEnabled={presentationMode}/>
          : <p>Loading ...</p>
        }
      </div>
    </>
  );
}

export default App;
