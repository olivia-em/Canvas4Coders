import { Suspense, useMemo } from "react";
import Scene from "./components/Scene";
// import ShadowTest from "./components/ShadowTest";
import "./style.css";

function App() {
  const loadingStyle = useMemo(
    () => ({
      color: "white",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontSize: "24px",
      backgroundColor: "#000",
    }),
    []
  );

  const containerStyle = useMemo(
    () => ({
      width: "100vw",
      height: "100vh",
    }),
    []
  );

  return (
    <div style={containerStyle}>
      <Suspense fallback={<div style={loadingStyle}>Loading...</div>}>
        <Scene />
      </Suspense>
    </div>
  );
}

export default App;
