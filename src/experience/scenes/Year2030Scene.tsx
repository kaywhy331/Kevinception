'use client';

import { useMemo, useRef, useState } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { eraConfigs } from '../config';
import { useExperienceActions } from '../ExperienceContext';
import { ArtifactMesh, Dust, Hoverable } from './SceneUtils';
import { ArchiveColumn, CylinderBetween, GlassPanel, LightBar, RoomShell } from './EnvironmentPrimitives';

const agents = [
  { id: 'clarifier', label: 'Clarifier', position: [-3.05, 1.2, -0.35] as [number, number, number], color: '#7de9ff' },
  { id: 'researcher', label: 'Researcher', position: [-1.85, 1.2, 1.85] as [number, number, number], color: '#8da8ff' },
  { id: 'architect', label: 'Architect', position: [0, 1.2, -2.0] as [number, number, number], color: '#79ffd1' },
  { id: 'builder', label: 'Builder', position: [1.85, 1.2, 1.85] as [number, number, number], color: '#ffd66b' },
  { id: 'governor', label: 'Governor', position: [3.05, 1.2, -0.35] as [number, number, number], color: '#ff7f9c' }
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
    avatar.current.rotation.y = clock.elapsedTime * (selected ? 0.42 : 0.12);
    avatar.current.position.y = 0.78 + Math.sin(clock.elapsedTime * 1.1 + agent.position[0]) * 0.05;
  });
  return (
    <Hoverable label={`${agent.label} agent station`} onClick={onSelect}>
      <group position={agent.position} scale={selected ? 1.06 : 1}>
        <RoundedBox position={[0, -0.55, 0]} args={[1.35, 0.35, 1.1]} radius={0.15} smoothness={3} castShadow receiveShadow>
          <meshStandardMaterial color="#d5dedf" roughness={0.34} metalness={0.22} />
        </RoundedBox>
        <RoundedBox position={[0, -0.25, -0.34]} args={[1.05, 0.12, 0.34]} radius={0.05} smoothness={2}>
          <meshStandardMaterial color={agent.color} emissive={agent.color} emissiveIntensity={active ? 0.42 : 0.06} roughness={0.3} />
        </RoundedBox>
        <mesh ref={avatar} position={[0, 0.78, 0]} castShadow>
          <octahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial color={agent.color} emissive={agent.color} emissiveIntensity={active ? 0.85 : 0.1} metalness={0.34} roughness={0.22} />
        </mesh>
        <mesh position={[0, 0.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.61, 0.025, 8, 32]} />
          <meshStandardMaterial color={agent.color} emissive={agent.color} emissiveIntensity={selected && active ? 1.2 : 0.18} />
        </mesh>
        <GlassPanel position={[0, 0.05, 0.5]} size={[1.05, 0.58, 0.035]} color={agent.color} opacity={active ? 0.16 : 0.05} frameColor="#819093" />
      </group>
    </Hoverable>
  );
}

export function Year2030Scene({ active, timeline }: { active: boolean; timeline: boolean }) {
  const config = eraConfigs['2030'];
  const { navigateToYear, openInterface, discover } = useExperienceActions();
  const core = useRef<THREE.Mesh>(null);
  const packets = useRef<THREE.Group>(null);
  const [selected, setSelected] = useState('architect');
  const selectedAgent = agents.find((agent) => agent.id === selected) ?? agents[2];
  const corePosition: [number, number, number] = [0, 1.7, 0];
  useFrame(({ clock }, delta) => {
    if (!active) return;
    if (core.current) {
      core.current.rotation.y += delta * 0.34;
      core.current.rotation.x = Math.sin(clock.elapsedTime * 0.4) * 0.08;
    }
    if (packets.current) {
      packets.current.children.forEach((child, index) => {
        const t = (clock.elapsedTime * (0.14 + index * 0.012) + index * 0.16) % 1;
        const node = agents[index % agents.length];
        child.position.set(
          corePosition[0] + (node.position[0] - corePosition[0]) * t,
          corePosition[1] + (node.position[1] + 0.3 - corePosition[1]) * t,
          corePosition[2] + (node.position[2] - corePosition[2]) * t
        );
      });
    }
  });
  const activate = () => timeline ? navigateToYear('2030') : openInterface();

  return (
    <group position={[config.stationX, 0, 0]}>
      <RoomShell floorColor="#d5dedf" wallColor="#e5eceb" sideColor="#ccd8d9" ceilingColor="#f4f7f5" trimColor="#75888c" accent={config.accent} openLeft openRight active={active} floorRoughness={0.35} />
      <Dust center={[0, 3.0, 0]} spread={[9.4, 5.5, 7]} color="#8cecff" active={active} count={active ? 38 : 12} />
      <LightBar position={[-2.7, 5.55, -2.4]} length={3.1} color="#c7fbff" intensity={active ? 1.05 : 0.12} />
      <LightBar position={[2.7, 5.55, -2.4]} length={3.1} color="#e7fff5" intensity={active ? 0.95 : 0.1} />

      <GlassPanel position={[5.08, 2.72, 0]} size={[4.6, 4.95, 0.05]} color="#c8f6ff" opacity={active ? 0.16 : 0.06} rotation={[0, Math.PI / 2, 0]} frameColor="#80969a" />
      <mesh position={[4.98, 4.85, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[3.8, 0.22]} /><meshBasicMaterial color="#91ecff" transparent opacity={active ? 0.48 : 0.1} /></mesh>

      <group position={[-3.7, 2.55, -2.86]}>
        {[-0.72, 0, 0.72].map((x, index) => <ArchiveColumn key={x} position={[x, 0, 0]} color={['#8cecff', '#a7b9ff', '#83ffd0'][index]} active={active} height={3.5} radius={0.27} />)}
        <RoundedBox position={[0, -1.85, 0]} args={[2.35, 0.26, 0.72]} radius={0.08} smoothness={2} castShadow><meshStandardMaterial color="#7c8b8e" metalness={0.3} roughness={0.42} /></RoundedBox>
      </group>
      <group position={[3.6, 2.65, -2.92]}>
        <GlassPanel position={[0, 0.45, 0]} size={[2.55, 2.3, 0.045]} color="#dffbff" opacity={active ? 0.18 : 0.06} frameColor="#819093" />
        {[-0.78, 0, 0.78].map((x, index) => (
          <group key={x} position={[x, 0.45, 0.05]}>
            <mesh position={[0, 0.55, 0]}><boxGeometry args={[0.5, 0.08, 0.03]} /><meshBasicMaterial color={['#64e8ff', '#79ffd1', '#ff7f9c'][index]} /></mesh>
            {Array.from({ length: 4 }).map((_, row) => <mesh key={row} position={[0, 0.25 - row * 0.25, 0]}><boxGeometry args={[0.5 - row * 0.06, 0.04, 0.025]} /><meshBasicMaterial color="#b9d5d8" transparent opacity={0.7} /></mesh>)}
          </group>
        ))}
      </group>

      <Hoverable label="Enter Kevin Nexus" onClick={activate}>
        <group position={corePosition}>
          <mesh position={[0, -1.45, 0]} receiveShadow><cylinderGeometry args={[2.2, 2.55, 0.34, 64]} /><meshStandardMaterial color="#c5d2d2" metalness={0.25} roughness={0.36} /></mesh>
          <mesh position={[0, -1.2, 0]} receiveShadow><cylinderGeometry args={[1.95, 2.05, 0.16, 64]} /><meshPhysicalMaterial color="#bdefff" transparent opacity={0.24} roughness={0.08} clearcoat={1} /></mesh>
          <mesh ref={core} castShadow><icosahedronGeometry args={[0.9, 2]} /><meshStandardMaterial color="#2c5961" emissive="#64e8ff" emissiveIntensity={active ? 1.15 : 0.18} metalness={0.5} roughness={0.2} wireframe /></mesh>
          <mesh><sphereGeometry args={[0.48, 32, 32]} /><meshStandardMaterial color="#efffff" emissive="#64e8ff" emissiveIntensity={active ? 1.8 : 0.28} transparent opacity={0.78} /></mesh>
          {active && <pointLight color="#64e8ff" intensity={7.2} distance={8} decay={2} />}
        </group>
      </Hoverable>

      {agents.map((agent) => (
        <group key={agent.id}>
          <CylinderBetween from={corePosition} to={[agent.position[0], agent.position[1] + 0.4, agent.position[2]]} radius={0.018} color={agent.color} emissiveIntensity={active ? 0.72 : 0.08} transparent opacity={active ? 0.6 : 0.14} />
          <AgentStation agent={agent} selected={selected === agent.id} active={active} onSelect={() => { setSelected(agent.id); if (agent.id === 'governor') discover('human-gate', '2030'); }} />
        </group>
      ))}

      <group ref={packets} visible={active}>
        {agents.map((agent) => <mesh key={agent.id} position={corePosition}><boxGeometry args={[0.1, 0.1, 0.1]} /><meshStandardMaterial color={agent.color} emissive={agent.color} emissiveIntensity={1.2} /></mesh>)}
      </group>

      <Hoverable label="Human approval console" onClick={() => { setSelected('governor'); discover('human-gate', '2030'); }}>
        <group position={[0, 0.65, 2.7]}>
          <RoundedBox args={[3.2, 0.85, 1.15]} radius={0.2} smoothness={4} castShadow><meshStandardMaterial color="#d7dfdf" metalness={0.18} roughness={0.32} /></RoundedBox>
          <GlassPanel position={[0, 0.42, -0.1]} size={[2.65, 0.62, 0.04]} color={selectedAgent.color} opacity={active ? 0.2 : 0.06} rotation={[-0.3, 0, 0]} frameColor="#7d8d90" />
          {[-0.8, 0, 0.8].map((x, index) => <mesh key={x} position={[x, 0.08, 0.58]}><cylinderGeometry args={[0.16, 0.16, 0.08, 20]} /><meshStandardMaterial color={['#79ffd1', '#ffd66b', '#ff7f9c'][index]} emissive={['#3abf91', '#a47a18', '#a62b4c'][index]} emissiveIntensity={active ? 0.65 : 0.08} /></mesh>)}
        </group>
      </Hoverable>

      <ArtifactMesh id="human-gate" year="2030" position={[4.15, 0.95, -0.9]} color="#64e8ff" active={active} shape="octahedron" scale={1.3} />
      <spotLight position={[0, 5.7, 2.6]} target-position={[0, 1.5, 0]} color="#d8ffff" intensity={active ? 4.2 : 0.4} distance={15} angle={0.65} penumbra={0.68} castShadow={active} />
      {active && <pointLight position={[4.2, 3.0, 0]} color="#64e8ff" intensity={2.2} distance={8} decay={2} />}
    </group>
  );
}
