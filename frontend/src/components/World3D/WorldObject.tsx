import { useRef } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import type { WorldObject as WorldObjectType } from '../../../../shared/types';

interface WorldObjectProps {
  object: WorldObjectType;
}

function WorldObject({ object }: WorldObjectProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      // Update position and rotation from physics
      meshRef.current.position.set(object.position.x, object.position.y, object.position.z);
      meshRef.current.quaternion.set(
        object.rotation.x,
        object.rotation.y,
        object.rotation.z,
        object.rotation.w
      );
    }
  });

  const color = `rgb(${object.sensory.visual.color[0]}, ${object.sensory.visual.color[1]}, ${object.sensory.visual.color[2]})`;

  // Render based on object type
  if (object.type === 'sphere') {
    return (
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[object.physical.dimensions.x, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
    );
  } else if (object.type === 'box') {
    return (
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry
          args={[
            object.physical.dimensions.x * 2,
            object.physical.dimensions.y * 2,
            object.physical.dimensions.z * 2,
          ]}
        />
        <meshStandardMaterial color={color} />
      </mesh>
    );
  } else if (object.type === 'cylinder') {
    return (
      <mesh ref={meshRef} castShadow receiveShadow>
        <cylinderGeometry
          args={[
            object.physical.dimensions.x,
            object.physical.dimensions.z,
            object.physical.dimensions.y,
            32,
          ]}
        />
        <meshStandardMaterial color={color} />
      </mesh>
    );
  } else if (object.type === 'plane') {
    return (
      <mesh ref={meshRef} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[object.physical.dimensions.x, object.physical.dimensions.z]} />
        <meshStandardMaterial color={color} />
      </mesh>
    );
  }

  return null;
}

export default WorldObject;
