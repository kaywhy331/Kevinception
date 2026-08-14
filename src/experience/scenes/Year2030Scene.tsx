'use client';

import { useRef, useState } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { eraConfigs } from '../config';
import { useExperienceActions } from '../ExperienceContext';
import { useExperienceStore } from '../store';
import type { FutureAgentId, FutureMissionPhase } from '../future/futureJourney';
import { Dust, Hoverable } from './SceneUtils';
import { ArchiveColumn, CylinderBetween, GlassPanel, LightBar, RoomShell } from './EnvironmentPrimitives';
import { FloorPedestal, WallDisplay } from './SceneLayout';

type Collaborator = {
  id: FutureAgentId;
  label: string;
  position: [number, number, number];
  color: string;
  human?: boolean;
};

type StationState = 'waiting' | 'queued' | 'working' | 'complete' | 'gate';

const collaborators: Collaborator[] = [
  { id: 'clarifier', label: 'AI Clarifier', position: [-3.3, 0, -0.9], color: '#fff1ce' },
  { id: 'researcher', label: 'AI Researcher', position: [-2.55, 0, 1.7] as [number, number, number], color: '#8da8ff' },
  { id: 'architect', label: 'AI Architect', position: [0, 0, -2.9] as [number, number, number], color: '#79ffd1' },
  { id: 'builder', label: 'AI Builder', position: [2.55, 0, 1.7] as [number, number, number], color: '#ffd66b' },
  { id: 'governor', label: 'Human Governor', position: [3.3, 0, -0.9] as [number, number, number], color: '#ff7f9c', human: true }
];

function stationState(agentId: FutureAgentId, phase: FutureMissionPhase, activeTaskIndex: number, taskIndex: number): StationState {
  if (phase === 'brief' || taskIndex < 0) return 'waiting';
  if (phase === 'decision' && agentId === 'governor') return 'gate';
  if (phase === 'complete' || phase === 'decision' || taskIndex < activeTaskIndex) return 'complete';
  if (phase === 'orchestrating' && taskIndex === activeTaskIndex) return 'working';
  return 'queued';
}

function AgentStation({ agent, selected, active, missionState, onSelect }: {
  agent: Collaborator;
  selected: boolean;
  active: boolean;
  missionState: StationState;
  onSelect: () => void;
}) {
  const avatar = useRef<THREE.Mesh>(null);
  const energized = missionState === 'working' || missionState === 'gate';
  const settled = missionState === 'complete';
  useFrame(({ clock }) => {
    if (!active || !avatar.current) return;
    avatar.current.rotation.y = clock.elapsedTime * (energized ? 0.58 : selected ? 0.34 : 0.1);
    avatar.current.position.y = 1.35 + Math.sin(clock.elapsedTime * (energized ? 2 : 1.1) + agent.position[0]) * (energized ? 0.07 : 0.035);
  });
  return (
    <Hoverable label={`${agent.label} collaboration station · ${missionState}`} onClick={onSelect}>
      <group position={agent.position} scale={energized ? 1.1 : selected ? 1.04 : 1}>
        <FloorPedestal position={[0, 0, 0]} size={[1.05, 0.55, 0.9]} color="#d3dcdd" accent={agent.color} />
        <RoundedBox position={[0, 0.68, 0.06]} args={[1.08, 0.18, 0.82]} radius={0.08} smoothness={3} castShadow receiveShadow><meshStandardMaterial color="#c8d2d3" roughness={0.32} metalness={0.18} /></RoundedBox>
        <GlassPanel position={[0, 0.98, 0.42]} size={[0.86, 0.42, 0.03]} color={agent.color} opacity={active ? energized ? 0.28 : settled ? 0.19 : 0.1 : 0.045} frameColor="#819093" />
        <mesh ref={avatar} position={[0, 1.35, -0.02]} castShadow>{agent.human ? <capsuleGeometry args={[0.22, 0.36, 5, 12]} /> : <octahedronGeometry args={[0.3, 0]} />}<meshStandardMaterial color={agent.color} emissive={agent.color} emissiveIntensity={active ? energized ? 1.35 : settled ? 0.68 : agent.human ? 0.38 : 0.42 : 0.08} metalness={agent.human ? 0.12 : 0.34} roughness={agent.human ? 0.48 : 0.22} /></mesh>
        <mesh position={[0, 1.35, -0.02]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.44, energized ? 0.035 : 0.02, 8, 28]} /><meshStandardMaterial color={agent.color} emissive={agent.color} emissiveIntensity={active ? energized ? 1.55 : settled ? 0.64 : selected ? 0.8 : 0.14 : 0.08} /></mesh>
        {settled && <mesh position={[0, 1.82, -0.02]}><sphereGeometry args={[0.055, 12, 12]} /><meshStandardMaterial color="#ffffff" emissive={agent.color} emissiveIntensity={1.4} /></mesh>}
      </group>
    </Hoverable>
  );
}

export function Year2030Scene({ active, detail = true }: { active: boolean; timeline: boolean; detail?: boolean }) {
  const config = eraConfigs['2030'];
  const { enterYear, discover } = useExperienceActions();
  const mission = useExperienceStore((state) => state.futureJourney.mission);
  const core = useRef<THREE.Mesh>(null);
  const packets = useRef<THREE.Group>(null);
  const receipt = useRef<THREE.Group>(null);
  const [selected, setSelected] = useState<FutureAgentId>('clarifier');
  const corePosition: [number, number, number] = [0, 1.55, 0];
  const currentTask = mission.phase === 'orchestrating' ? mission.run?.tasks[mission.activeTaskIndex] : null;
  const selectedAgent = currentTask?.agent ?? (mission.phase === 'decision' || mission.phase === 'complete' ? 'governor' : selected);
  const missionActive = mission.phase !== 'brief';
  const packetCount = missionActive ? mission.autonomy + 2 : 2;
  useFrame(({ clock }, delta) => {
    if (!active || !detail) return;
    if (core.current) {
      core.current.rotation.y += delta * (missionActive ? 0.34 + mission.autonomy * 0.08 : 0.22);
      core.current.rotation.x = Math.sin(clock.elapsedTime * 0.4) * 0.06;
    }
    if (packets.current) {
      packets.current.children.forEach((child, index) => {
        const t = (clock.elapsedTime * (0.08 + mission.autonomy * 0.026 + index * 0.008) + index * 0.16) % 1;
        const node = collaborators[index % collaborators.length];
        child.position.set(corePosition[0] + (node.position[0] - corePosition[0]) * t, corePosition[1] + (1.32 - corePosition[1]) * t, corePosition[2] + (node.position[2] - corePosition[2]) * t);
      });
    }
    if (receipt.current) {
      receipt.current.rotation.y += delta * 0.5;
      receipt.current.position.y = 2.18 + Math.sin(clock.elapsedTime * 1.4) * 0.07;
    }
  });

  if (!detail) {
    return (
      <group position={[config.stationX, 0, 0]}>
        <RoomShell floorColor="#cbd6d7" wallColor="#e5eceb" sideColor="#ccd8d9" ceilingColor="#f4f7f5" trimColor="#75888c" accent={config.accent} openLeft openRight active={false} floorRoughness={0.38} />
        <LightBar position={[-2.7, 5.55, -2.4]} length={3.1} color="#c7fbff" intensity={0.06} />
        <LightBar position={[2.7, 5.55, -2.4]} length={3.1} color="#e7fff5" intensity={0.06} />
        <WallDisplay position={[3.35, 3.45, -3.26]} size={[2.35, 1.65]} frameColor="#718489" screenColor="#dffbff" accent={config.accent} active={false} />
        <mesh position={[0, 0.22, 0]} receiveShadow><cylinderGeometry args={[1.8, 2.05, 0.4, 40]} /><meshStandardMaterial color="#c5d2d2" metalness={0.2} roughness={0.4} /></mesh>
        <mesh position={[0, 1.35, 0]}><icosahedronGeometry args={[0.58, 1]} /><meshStandardMaterial color="#43676d" emissive="#64e8ff" emissiveIntensity={0.16} wireframe /></mesh>
      </group>
    );
  }

  return (
    <group position={[config.stationX, 0, 0]}>
      <RoomShell floorColor="#cbd6d7" wallColor="#e5eceb" sideColor="#ccd8d9" ceilingColor="#f4f7f5" trimColor="#75888c" accent={config.accent} openLeft openRight active={active} floorRoughness={0.35} />
      <Dust center={[0, 3.0, 0]} spread={[9.4, 5.5, 7]} color="#8cecff" active={active} count={active ? 26 : 8} />
      <LightBar position={[-2.7, 5.55, -2.4]} length={3.1} color="#c7fbff" intensity={active ? 0.78 : 0.07} />
      <LightBar position={[2.7, 5.55, -2.4]} length={3.1} color="#e7fff5" intensity={active ? 0.74 : 0.07} />

      <group position={[-3.72, 1.75, -2.78]}>
        {[-0.66, 0, 0.66].map((x, index) => <ArchiveColumn key={x} position={[x, 0, 0]} color={['#8cecff', '#a7b9ff', '#83ffd0'][index]} active={active} height={3.2} radius={0.24} />)}
        <RoundedBox position={[0, -1.61, 0]} args={[2.2, 0.22, 0.68]} radius={0.07} smoothness={2} castShadow><meshStandardMaterial color="#7c8b8e" metalness={0.3} roughness={0.42} /></RoundedBox>
      </group>
      <WallDisplay position={[3.35, 3.45, -3.26]} size={[2.35, 1.65]} frameColor="#718489" screenColor="#dffbff" accent={config.accent} active={active} />

      <Hoverable label="Enter Kevin Nexus" onClick={() => enterYear('2030')}>
        <group>
          <mesh position={[0, 0.2, 0]} receiveShadow><cylinderGeometry args={[2.0, 2.25, 0.4, 56]} /><meshStandardMaterial color="#c5d2d2" metalness={0.25} roughness={0.36} /></mesh>
          <mesh position={[0, 0.46, 0]} receiveShadow><cylinderGeometry args={[1.72, 1.9, 0.13, 56]} /><meshPhysicalMaterial color="#bdefff" transparent opacity={0.22} roughness={0.08} clearcoat={1} /></mesh>
          <mesh ref={core} position={corePosition} castShadow><icosahedronGeometry args={[0.72, 2]} /><meshStandardMaterial color="#2c5961" emissive="#64e8ff" emissiveIntensity={active ? 0.72 + mission.autonomy * 0.16 + (mission.phase === 'decision' ? 0.42 : 0) : 0.14} metalness={0.5} roughness={0.2} wireframe /></mesh>
          <mesh position={corePosition}><sphereGeometry args={[0.38, 28, 28]} /><meshStandardMaterial color="#efffff" emissive="#64e8ff" emissiveIntensity={active ? 1.1 + mission.autonomy * 0.16 : 0.2} transparent opacity={missionActive ? 0.9 : 0.66} /></mesh>
          {active && <pointLight position={corePosition} color={mission.phase === 'decision' ? '#ff8fa8' : '#64e8ff'} intensity={3.8 + mission.autonomy * 0.45} distance={7} decay={2} />}
        </group>
      </Hoverable>

      {collaborators.map((agent) => {
        const taskIndex = mission.run?.tasks.findIndex((task) => task.agent === agent.id) ?? -1;
        const state = stationState(agent.id, mission.phase, mission.activeTaskIndex, taskIndex);
        return (
          <group key={agent.id}>
            <CylinderBetween from={corePosition} to={[agent.position[0], 1.3, agent.position[2]]} radius={state === 'working' || state === 'gate' ? 0.024 : 0.012} color={agent.color} emissiveIntensity={active ? selectedAgent === agent.id ? 0.92 : state === 'complete' ? 0.48 : 0.2 : 0.05} transparent opacity={active ? selectedAgent === agent.id ? 0.72 : state === 'complete' ? 0.42 : 0.18 : 0.1} />
            <AgentStation agent={agent} selected={selectedAgent === agent.id} active={active} missionState={state} onSelect={() => { setSelected(agent.id); if (agent.id === 'governor') discover('human-gate', '2030'); }} />
          </group>
        );
      })}
      <group ref={packets} visible={active && missionActive}>{Array.from({ length: packetCount }, (_, index) => {
        const agent = collaborators[index % collaborators.length];
        return <mesh key={`${agent.id}-${index}`} position={corePosition}><boxGeometry args={[0.075, 0.075, 0.075]} /><meshStandardMaterial color={agent.color} emissive={agent.color} emissiveIntensity={1.0 + mission.autonomy * 0.12} /></mesh>;
      })}</group>

      <Hoverable label="Human approval node · Kevin · Human Lead" onClick={() => { setSelected('governor'); discover('human-gate', '2030'); }}>
        <group position={[0, 0, 2.85]}>
          <FloorPedestal position={[0, 0, 0]} size={[1.05, 0.55, 0.9]} color="#d4dddd" accent="#ffffff" />
          <RoundedBox position={[0, 0.68, 0.06]} args={[1.08, 0.18, 0.82]} radius={0.08} smoothness={3} castShadow receiveShadow><meshStandardMaterial color="#c8d2d3" roughness={0.32} metalness={0.18} /></RoundedBox>
          <GlassPanel position={[0, 0.98, 0.42]} size={[0.86, 0.42, 0.03]} color="#efffff" opacity={active ? 0.14 : 0.045} frameColor="#819093" />
          {collaborators.map((agent, index) => (
            <mesh key={agent.id} position={[-0.36 + index * 0.18, 0.79, 0.48]}>
              <sphereGeometry args={[0.045, 12, 12]} />
              <meshStandardMaterial color={agent.color} emissive={agent.color} emissiveIntensity={active ? 0.95 : 0.12} />
            </mesh>
          ))}
          {mission.artifact && (
            <group ref={receipt} position={[0, 2.18, 0.08]} userData={{ label: `Governed receipt ${mission.artifact.receiptId}`, receiptId: mission.artifact.receiptId }}>
              <RoundedBox args={[0.72, 0.34, 0.12]} radius={0.05} smoothness={3} castShadow>
                <meshStandardMaterial color="#f6ffff" emissive={mission.artifact.status === 'stopped' ? '#ff718f' : mission.artifact.status === 'reframed' ? '#ffd66b' : '#64e8ff'} emissiveIntensity={1.3} metalness={0.32} roughness={0.2} />
              </RoundedBox>
              <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.48, 0.018, 8, 32]} /><meshStandardMaterial color="#ffffff" emissive="#64e8ff" emissiveIntensity={1.2} /></mesh>
            </group>
          )}
        </group>
      </Hoverable>

      <spotLight position={[0, 5.7, 2.6]} target-position={[0, 1.45, 0]} color="#d8ffff" intensity={active ? 3.5 : 0.3} distance={15} angle={0.65} penumbra={0.68} castShadow={active} />
    </group>
  );
}
