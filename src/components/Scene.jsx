import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useState, useCallback } from "react";
import BacksideSphere from "./Spheres/BacksideSphere";
import SpotlightGroup from "./Lights/SpotlightGroup";
import TextLayer from "./Text/TextLayer";
import RotatingRing from "./Text/RotatingRing";
import KeyboardControls from "./KeyboardControls";
import {
  sceneConfig,
  sphereConfig,
  lightConfig,
  textConfig,
} from "../config/sceneConfig";
import { innerText, outerText, ringText } from "../config/textContent";
import { innerColorGroups, outerColorGroups } from "../config/colorGroups";

function SceneContent({ lightVisibility, setLightVisibility }) {
  const handleKeyPress = useCallback(
    (key) => {
      const index = { r: 0, g: 1, b: 2 }[key];
      if (index !== undefined) {
        setLightVisibility((prev) => {
          const newState = [...prev];
          newState[index] = !newState[index];
          console.log(
            `${key.toUpperCase()} spotlight: ${newState[index] ? "ON" : "OFF"}`
          );
          return newState;
        });
      }
    },
    [setLightVisibility]
  );

  return (
    <>
      <KeyboardControls onKeyPress={handleKeyPress} />

      {/* Camera Controls */}
      <OrbitControls enableDamping dampingFactor={0.05} />

      {/* Ambient Light */}
      <ambientLight
        color={lightConfig.ambient.color}
        intensity={lightConfig.ambient.intensity}
      />

      {/* Main Content Group with Rotation */}
      <group rotation={[0, sceneConfig.rotation, 0]}>
        {/* Spheres */}
        <BacksideSphere
          radius={sphereConfig.inner.radius}
          opacity={sphereConfig.inner.opacity}
          color={sphereConfig.inner.color}
        />
        <BacksideSphere
          radius={sphereConfig.outer.radius}
          opacity={sphereConfig.outer.opacity}
          color={sphereConfig.outer.color}
        />

        {/* Text Layers */}
        <Suspense fallback={null}>
          <TextLayer
            text={innerText}
            colorGroups={innerColorGroups}
            position={textConfig.inner.position}
            fontSize={textConfig.inner.fontSize}
            targetWidthMultiplier={textConfig.inner.targetWidthMultiplier}
            flipped={textConfig.inner.flipped}
          />

          <TextLayer
            text={outerText}
            colorGroups={outerColorGroups}
            position={textConfig.outer.position}
            fontSize={textConfig.outer.fontSize}
            targetWidthMultiplier={textConfig.outer.targetWidthMultiplier}
            flipped={textConfig.outer.flipped}
          />

          <RotatingRing
            text={ringText}
            radius={textConfig.ring.radius}
            fontSize={textConfig.ring.fontSize}
            color={textConfig.ring.color}
            rotationSpeed={textConfig.ring.rotationSpeed}
          />
        </Suspense>
      </group>

      {/* Spotlights OUTSIDE the rotated group with scene rotation passed in */}
      <SpotlightGroup
        colors={lightConfig.inner.colors}
        radius={lightConfig.inner.radius}
        targetZ={lightConfig.inner.targetZ}
        rotationSpeed={lightConfig.inner.rotationSpeed}
        intensity={lightConfig.inner.intensity}
        angle={lightConfig.inner.angle}
        penumbra={lightConfig.inner.penumbra}
        visibilityStates={[true, true, true]}
        showHelpers={false}
        sceneRotation={sceneConfig.rotation}
      />

      <SpotlightGroup
        colors={lightConfig.outer.colors}
        radius={lightConfig.outer.radius}
        targetZ={lightConfig.outer.targetZ}
        rotationSpeed={lightConfig.outer.rotationSpeed}
        intensity={lightConfig.outer.intensity}
        angle={lightConfig.outer.angle}
        penumbra={lightConfig.outer.penumbra}
        visibilityStates={[true, true, true]}
        showHelpers={false}
        sceneRotation={sceneConfig.rotation}
      />
    </>
  );
}

export default function Scene() {
  const [lightVisibility, setLightVisibility] = useState([true, true, true]);

  return (
    <Canvas
      camera={{
        position: sceneConfig.camera.position,
        fov: sceneConfig.camera.fov,
      }}
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        alpha: false,
        stencil: false,
        depth: true,
      }}
    >
      <SceneContent
        lightVisibility={lightVisibility}
        setLightVisibility={setLightVisibility}
      />
    </Canvas>
  );
}
