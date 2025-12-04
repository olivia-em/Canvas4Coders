import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useRef } from "react";
import { BackSide, DoubleSide } from "three";
import * as THREE from "three";
import { useFont } from "../hooks/useFont";

function TestText() {
  const font = useFont();
  const spotRef1 = useRef();
  const spotRef2 = useRef();
  const spotRef3 = useRef();

  if (!font) return null;

  // Create simple text geometry
  const shapes = font.generateShapes("SHADOW TEST", 2);
  const geometry = new THREE.ShapeGeometry(shapes);

  // Center the geometry
  geometry.computeBoundingBox();
  const centerX =
    -(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2;
  const centerY =
    -(geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2;

  useFrame(({ clock }) => {
    // Rotate spotlights around the text using the SAME logic as SpotlightRig
    const time = clock.getElapsedTime();
    const radius = 5;
    const targetZ = 0; // Text is at z=0
    const rotationAngle = time * 0.5; // Same as rotationSpeed

    // Red light - index 0 (rotates around X axis in YZ plane)
    const x1 = 0;
    const y1 = Math.cos(rotationAngle) * radius;
    const z1 = targetZ + Math.sin(rotationAngle) * radius;

    // Green light - index 1 (rotates around Z axis, negative Y)
    const x2 = 0;
    const y2 = Math.cos(rotationAngle) * -radius;
    const z2 = targetZ + Math.sin(rotationAngle) * radius;

    // Blue light - index 2 (rotates around Y axis in XZ plane)
    const x3 = Math.cos(rotationAngle) * radius;
    const y3 = 0;
    const z3 = targetZ + Math.sin(rotationAngle) * radius;

    if (spotRef1.current) spotRef1.current.position.set(x1, y1, z1);
    if (spotRef2.current) spotRef2.current.position.set(x2, y2, z2);
    if (spotRef3.current) spotRef3.current.position.set(x3, y3, z3);
  });

  return (
    <>
      {/* Ambient light */}
      <ambientLight color="black" intensity={0.1} />

      {/* BackSide Sphere */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <sphereGeometry args={[20, 32, 32]} />
        <meshStandardMaterial
          color="white"
          side={DoubleSide} // DEBUG: show both inside and outside
          roughness={0.5}
          metalness={0.0}
        />
      </mesh>

      {/* Test white directional light outside sphere */}
      <directionalLight
        position={[0, 0, 30]}
        intensity={1}
        color="white"
        castShadow
      />

      {/* Text - centered */}
      <mesh position={[centerX, centerY, 0]} castShadow receiveShadow>
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial
          color="white"
          side={DoubleSide}
          roughness={0.5}
          metalness={0.0}
        />
      </mesh>

      {/* Red Spotlight */}
      <spotLight
        ref={spotRef1}
        color={0xff0000}
        target-position={[0, 0, 0]}
        intensity={1000}
        angle={Math.PI / 2.5}
        penumbra={0.7}
        distance={200}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0005}
        shadow-camera-near={0.5}
        shadow-camera-far={100}
      />

      {/* Green Spotlight */}
      <spotLight
        ref={spotRef2}
        color={0x00ff00}
        target-position={[0, 0, 0]}
        intensity={900}
        angle={Math.PI / 2.5}
        penumbra={0.7}
        distance={200}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0005}
        shadow-camera-near={0.5}
        shadow-camera-far={100}
      />

      {/* Blue Spotlight */}
      <spotLight
        ref={spotRef3}
        color={0x0000ff}
        target-position={[0, 0, 0]}
        intensity={900}
        angle={Math.PI / 2.5}
        penumbra={0.7}
        distance={200}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0005}
        shadow-camera-near={0.5}
        shadow-camera-far={100}
      />
    </>
  );
}

export default function ShadowTest() {
  return (
    <Canvas
      camera={{ position: [0, 0, 25], fov: 50 }}
      shadows
      style={{ width: "100vw", height: "100vh" }}
    >
      <OrbitControls enableDamping dampingFactor={0.05} />
      <Suspense fallback={null}>
        <TestText />
      </Suspense>
    </Canvas>
  );
}
