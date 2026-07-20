'use client';

import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { eraConfigs } from '../config';
import { useExperienceActions } from '../ExperienceContext';
import { ArtifactMesh, Dust, Hoverable, Pedestal } from './SceneUtils';

const nodes = [
  { id: 'clarifier', label: 'Clarifier', position: [-2.7, 2.55, 0.2] as [number, number, number], color: '#7de9ff' },
  { id: 'researcher', label: 'Researcher', position: [-1.5, 0.95, 0.75] as [number, number, number], color: '#8da8ff' },
  { id: 'architect', label: 'Architect', position: [0, 3.25, -0.65] as [number, number, number], color: '#79ffd1' },
  { id: 'builder', label: 'Builder', position: [1.65, 1.05, 0.85] as [number, number, number], color: '#ffd66b' },
  { id: 'governor', label: 'Governor', position: [2.8, 2.55, 0.05] as [number, number, number], color: '#ff7f9c' }
];

function Beam({ from, to, color, active }: { from: [number, number, number]; to: [number, number, number]; color: string; active: boolean }) {
  const midpoint = useMemo(() => new THREE.Vector3().fromArray(from).add(new THREE.Vector3().fromArray(to)).multiplyScalar(0.5), [from, to]);
  const length = useMemo(() => new THREE.Vector3().fromArray(from).distanceTo(new THREE.Vector3().fromArray(to)), [from, to]);
  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    const direction = new THREE.Vector3().fromArray(to).sub(new THREE.Vector3().fromArray(from)).normalize();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    return q;
  }, [from, to]);
  return (
    <mesh position={midpoint} quaternion={quaternion}>
      <cylinderGeometry args={[0.018, 0.018, length, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 1.2 : 0.15} transparent opacity={active ? 0.7 : 0.2} />
    </mesh>
  );
}

export function Year2030Scene({ active, timeline }: { active: boolean; timeline: boolean }) {
  const config = eraConfigs['2030'];
  const { navigateToYear, openInterface, discover } = useExperienceActions();
  const core = useRef<THREE.Mesh>(null);
  const packets = useRef<THREE.Group>(null);
  const [selected, setSelected] = useState('architect');
  useFrame(({ clock }, delta) => {
    if (core.current) {
      core.current.rotation.y += delta * (active ? 0.4 : 0.08);
      core.current.rotation.x = Math.sin(clock.elapsedTime * 0.4) * 0.1;
    }
    if (packets.current && active) {
      packets.current.children.forEach((child, index) => {
        const t = (clock.elapsedTime * (0.12 + index * 0.018) + index * 0.16) % 1;
        const node = nodes[index % nodes.length];
        child.position.set(node.position[0] * t, 1.85 + (node.position[1] - 1.85) * t, node.position[2] * t);
      });
    }
  });
  const activate = () => timeline ? navigateToYear('2030') : openInterface();

  return (
    <group position={[config.stationX, 0, 0]}>
      <Pedestal position={[0, -0.25, 0]} width={10.8} depth={8.5} color="#101b20" />
      <Dust center={[0, 2.2, 0]} spread={[10, 6, 8]} color="#64e8ff" active={active} count={120} />
      <mesh position={[0, 2.4, -3.15]} receiveShadow>
        <boxGeometry args={[10.2, 5.9, 0.12]} />
        <meshStandardMaterial color="#071116" roughness={0.9} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[4.4, 64]} />
        <meshStandardMaterial color="#07151a" metalness={0.25} roughness={0.55} emissive="#0a3038" emissiveIntensity={active ? 0.35 : 0.05} />
      </mesh>

      <Hoverable label="Enter Kevin Nexus" onClick={activate}>
        <group position={[0, 1.85, 0]}>
          <mesh ref={core} castShadow>
            <icosahedronGeometry args={[1.05, 2]} />
            <meshStandardMaterial color="#183f49" emissive="#64e8ff" emissiveIntensity={active ? 1.15 : 0.22} metalness={0.5} roughness={0.2} wireframe />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.56, 32, 32]} />
            <meshStandardMaterial color="#e7feff" emissive="#64e8ff" emissiveIntensity={active ? 1.8 : 0.4} transparent opacity={0.75} />
          </mesh>
          <pointLight color="#64e8ff" intensity={active ? 12 : 2} distance={8} decay={2} />
        </group>
      </Hoverable>

      {nodes.map((node) => (
        <group key={node.id}>
          <Beam from={[0, 1.85, 0]} to={node.position} color={node.color} active={active} />
          <Hoverable label={`${node.label} agent`} onClick={() => { setSelected(node.id); if (node.id === 'governor') discover('human-gate', '2030'); }}>
            <group position={node.position} scale={selected === node.id ? 1.18 : 1}>
              <mesh castShadow>
                <octahedronGeometry args={[0.42, 0]} />
                <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={active ? 0.9 : 0.15} metalness={0.35} roughness={0.25} />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.62, 0.025, 8, 32]} />
                <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={active ? 0.65 : 0.08} />
              </mesh>
            </group>
          </Hoverable>
        </group>
      ))}

      <group ref={packets}>
        {nodes.map((node, index) => (
          <mesh key={node.id} position={[0, 1.85, 0]}>
            <boxGeometry args={[0.11, 0.11, 0.11]} />
            <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={1.1} />
          </mesh>
        ))}
      </group>

      <ArtifactMesh id="human-gate" year="2030" position={[3.75, 0.85, -0.9]} color="#64e8ff" active={active} shape="octahedron" scale={1.35} />
      <pointLight position={[0, 5.5, 2]} color="#65dff4" intensity={active ? 5 : 0.8} distance={13} decay={2} />
    </group>
  );
}
