import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { useWorldStore } from '../../store/worldStore';
import AIEntity from './AIEntity';
import WorldObject from './WorldObject';

function World3D() {
  const { objects, aiPosition } = useWorldStore();

  return (
    <Canvas
      camera={{ position: [10, 10, 10], fov: 60 }}
      shadows
      className="w-full h-full"
    >
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* AI Entity */}
      <AIEntity position={aiPosition} />

      {/* World Objects */}
      {objects.map((obj) => (
        <WorldObject key={obj.id} object={obj} />
      ))}

      {/* Ground Grid */}
      <Grid
        args={[100, 100]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6b7280"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#9ca3af"
        fadeDistance={50}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />

      {/* Camera Controls */}
      <OrbitControls
        target={[aiPosition.x, aiPosition.y, aiPosition.z]}
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
}

export default World3D;
