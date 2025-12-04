export default function ShadowDebugHelpers() {
  return (
    <group>
      {/* Simple test sphere to verify shadows work */}
      <mesh position={[0, 5, 0]} castShadow>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial color="red" />
      </mesh>

      {/* Ground plane to catch shadows */}
      <mesh
        position={[0, -10, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="gray" />
      </mesh>

      {/* Simple directional light for testing */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </group>
  );
}
