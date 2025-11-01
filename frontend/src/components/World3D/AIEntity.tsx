import { useRef } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';

interface AIEntityProps {
  position: { x: number; y: number; z: number };
}

function AIEntity({ position }: AIEntityProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      // Smooth position interpolation
      meshRef.current.position.lerp(
        { x: position.x, y: position.y, z: position.z },
        0.1
      );
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.5, 32, 32]} castShadow receiveShadow>
      <meshStandardMaterial
        color="#ff6b6b"
        emissive="#ff3838"
        emissiveIntensity={0.3}
        metalness={0.3}
        roughness={0.4}
      />
    </Sphere>
  );
}

export default AIEntity;
