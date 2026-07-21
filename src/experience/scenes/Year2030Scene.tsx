'use client';

import { useRef, useState } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { eraConfigs } from '../config';
import { useExperienceActions } from '../ExperienceContext';
import { ArtifactMesh, Dust, Hoverable } from './SceneUtils';
import { ArchiveColumn, CylinderBetween, GlassPanel, LightBar, RoomShell } from './EnvironmentPrimitives';
import { FloorPedestal, WallDisplay } from './SceneLayout';

const agents = [
  { id: 'clarifier', label: 'Clarifier', position: [-3.3, 0, -0.9] as [number, number, number], color: '#7de9ff' },
  { id: 'researcher', label: 'Researcher', position: [-2.55, 0, 1.7] as [number, number, number], color: '#8da8ff' },
  { id: 'architect', label: 'Architect', position: [0, 0, -2.9] as [number, number, number], color: '#79ffd1' },
  { id: 'builder', label: 'Builder', position: [2.55, 0, 1.7] as [number, number, number], color: '#ffd66b' },
  { id: 'governor', label: 'Governor', position: [3.3, 0, -0.9] as [number, number, number], color: '#ff7f9c' }
];

function AgentStation({ agent, selected, active, onSelect }: {
  agent: typeof agents[number];
  selected: boolean;
  active: boolean;
  onSelect: () => void;
}) {
  const avatar = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!active || !avatar.current) return;
    avatar.current.rotation.y = clock.elapsedTime * (selected ? 0.4 : 0.1);
    avatar.current.position.y = 1.35 + Math.sin(clock.elapsedTime * 1.1 + agent.position[0]) * 0.035;
  });
  return (
    <Hoverable label={`${agent.label} agent station`} onClick={onSelect}>
      <group position={agent.position} scale={selected ? 1.04 : 1}>
        <FloorPedestal position={[0, 0, 0]} size={[1.05, 0.55, 0.9]} color="#d3dcdd" accent={agent.color} />
        <RoundedBox position={[0, 0.68, 0.06]} args={[1.08, 0.18, 0.82]} radius={0.08} smoothness={3} castShadow receiveShadow><meshStandardMaterial color="#c8d2d3" roughness={0.32} metalness={0.18} /></RoundedBox>
        <GlassPanel position={[0, 0.98, 0.42]} size={[0.86, 0.42, 0.03]} color={agent.color} opacity={active ? 0.14 : 0.045} frameColor="#819093" />
        <mesh ref={avatar} position={[0, 1.35, -0.02]} castShadow><octahedronGeometry args={[0.3, 0]} /><meshStandardMaterial color={agent.color} emissive={agent.color} emissiveIntensity={active ? 0.75 : 0.08} metalness={0.34} roughness={0.22} /></mesh>
        <mesh position={[0, 1.35, -0.02]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.44, 0.02, 8, 28]} /><meshStandardMaterial color={agent.color} emissive={agent.color} emissiveIntensity={selected && active ? 1.0 : 0.14} /></mesh>
      </group>
    </Hoverable>
  );
}

export function Year2030Scene({ active }: { active: boolean; timeline: boolean }) {
  const config = eraConfigs['2030'];
  const { enterYear, discover } = useExperienceActions();
  const core = useRef<THREE.Mesh>(null);
  const packets = useRef<THREE.Group>(null);
  const [selected, setSelected] = useState('architect');
  const selectedAgent = agents.find((agent) => agent.id === selected) ?? agents[2];
  const corePosition: [number, number, number] = [0, 1.55, 0];
  useFrame(({ clock }, delta) => {
    if (!active) return;
    if (core.current) {
      core.current.rotation.y += delta * 0.3;
      core.current.rotation.x = Math.sin(clock.elapsedTime * 0.4) * 0.06;
    }
    if (packets.current) {
      packets.current.children.forEach((child, index) => {
        const t = (clock.elapsedTime * (0.12 + index * 0.01) + index * 0.16) % 1;
        const node = agents[index % agents.length];
        child.position.set(corePosition[0] + (node.position[0] - corePosition[0]) * t, corePosition[1] + (1.32 - corePosition[1]) * t, corePosition[2] + (node.position[2] - corePosition[2]) * t);
      });
    }
  });

  return (
    <group position={[config.stationX, 0, 0]}>
      <RoomShell floorColor="#d5dedf" wallColor="#e5eceb" sideColor="#ccd8d9" ceilingColor="#f4f7f5" trimColor="#75888c" accent={config.accent} openLeft openRight active={active} floorRoughness={0.35} />
      <Dust center={[0, 3.0, 0]} spread={[9.4, 5.5, 7]} color="#8cecff" active={active} count={active ? 30 : 10} />
      <LightBar position={[-2.7, 5.55, -2.4]} length={3.1} color="#c7fbff" intensity={active ? 0.85 : 0.08} />
      <LightBar position={[2.7, 5.55, -2.4]} length={3.1} color="#e7fff5" intensity={active ? 0.8 : 0.08} />

      <group position={[-3.72, 1.75, -2.78]}>
        {[-0.66, 0, 0.66].map((x, index) => <ArchiveColumn key={x} position={[x, 0, 0]} color={['#8cecff', '#a7b9ff', '#83ffd0'][index]} active={active} height={3.2} radius={0.24} />)}
        <RoundedBox position={[0, -1.61, 0]} args={[2.2, 0.22, 0.68]} radius={0.07} smoothness={2} castShadow><meshStandardMaterial color="#7c8b8e" metalness={0.3} roughness={0.42} /></RoundedBox>
      </group>
      <WallDisplay position={[3.35, 3.45, -3.26]} size={[2.35, 1.65]} frameColor="#718489" screenColor="#dffbff" accent={config.accent} active={active} />

      <Hoverable label="Enter Kevin Nexus" onClick={() => enterYear('2030')}>
        <group>
          <mesh position={[0, 0.2, 0]} receiveShadow><cylinderGeometry args={[2.0, 2.25, 0.4, 56]} /><meshStandardMaterial color="#c5d2d2" metalness={0.25} roughness={0.36} /></mesh>
          <mesh position={[0, 0.46, 0]} receiveShadow><cylinderGeometry args={[1.72, 1.9, 0.13, 56]} /><meshPhysicalMaterial color="#bdefff" transparent opacity={0.22} roughness={0.08} clearcoat={1} /></mesh>
          <mesh ref={core} position={corePosition} castShadow><icosahedronGeometry args={[0.72, 2]} /><meshStandardMaterial color="#2c5961" emissive="#64e8ff" emissiveIntensity={active ? 1.05 : 0.14} metalness={0.5} roughness={0.2} wireframe /></mesh>
          <mesh position={corePosition}><sphereGeometry args={[0.38, 28, 28]} /><meshStandardMaterial color="#efffff" emissive="#64e8ff" emissiveIntensity={active ? 1.55 : 0.2} transparent opacity={0.76} /></mesh>
          {active && <pointLight position={corePosition} color="#64e8ff" intensity={5.5} distance={7} decay={2} />}
        </group>
      </Hoverable>

      {agents.map((agent) => (
        <group key={agent.id}>
          <CylinderBetween from={corePosition} to={[agent.position[0], 1.3, agent.position[2]]} radius={0.012} color={agent.color} emissiveIntensity={active ? (selected === agent.id ? 0.65 : 0.28) : 0.05} transparent opacity={active ? (selected === agent.id ? 0.55 : 0.24) : 0.1} />
          <AgentStation agent={agent} selected={selected === agent.id} active={active} onSelect={() => { setSelected(agent.id); if (agent.id === 'governor') discover('human-gate', '2030'); }} />
        </group>
      ))}
      <group ref={packets} visible={active}>{agents.map((agent) => <mesh key={agent.id} position={corePosition}><boxGeometry args={[0.075, 0.075, 0.075]} /><meshStandardMaterial color={agent.color} emissive={agent.color} emissiveIntensity={1.0} /></mesh>)}</group>

      <Hoverable label="Human approval console" onClick={() => { setSelected('governor'); discover('human-gate', '2030'); }}>
        <group position={[0, 0, 2.95]}>
          <FloorPedestal position={[0, 0, 0]} size={[2.8, 0.58, 1.05]} color="#d1d9da" accent={selectedAgent.color} />
          <RoundedBox position={[0, 0.72, 0]} args={[2.9, 0.28, 1.08]} radius={0.15} smoothness={4} castShadow><meshStandardMaterial color="#d7dfdf" metalness={0.18} roughness={0.32} /></RoundedBox>
          <GlassPanel position={[0, 1.02, -0.08]} size={[2.35, 0.5, 0.035]} color={selectedAgent.color} opacity={active ? 0.17 : 0.05} rotation={[-0.26, 0, 0]} frameColor="#7d8d90" />
          {[-0.7, 0, 0.7].map((x, index) => <mesh key={x} position={[x, 0.82, 0.57]}><cylinderGeometry args={[0.13, 0.13, 0.07, 20]} /><meshStandardMaterial color={['#79ffd1', '#ffd66b', '#ff7f9c'][index]} emissive={['#3abf91', '#a47a18', '#a62b4c'][index]} emissiveIntensity={active ? 0.55 : 0.06} /></mesh>)}
        </group>
      </Hoverable>

      <FloorPedestal position={[4.05, 0, -1.25]} size={[0.78, 0.48, 0.78]} color="#b8c8ca" accent={config.accent} />
      <ArtifactMesh id="human-gate" year="2030" position={[4.05, 0.78, -1.25]} color="#64e8ff" active={active} shape="octahedron" scale={0.78} />
      <spotLight position={[0, 5.7, 2.6]} target-position={[0, 1.45, 0]} color="#d8ffff" intensity={active ? 3.7 : 0.32} distance={15} angle={0.65} penumbra={0.68} castShadow={active} />
      {active && <pointLight position={[4.0, 2.8, 0]} color="#64e8ff" intensity={1.7} distance={7} decay={2} />}
    </group>
  );
}
