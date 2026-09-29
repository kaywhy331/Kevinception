'use client';

import { useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { eraConfigs } from '../config';
import { useExperienceActions } from '../ExperienceContext';
import { useExperienceStore } from '../store';
import {
  consciousnessCues,
  type CoexistenceMomentId,
  type CoexistenceState,
  getPermissionedMemoryState,
  type ConsciousnessCueId,
  type ConsciousnessPhase,
  type PermissionedMemoryState
} from '../future/futureWorld';
import { Dust, Hoverable } from './SceneUtils';
import { GlassPanel, LightBar, RoomShell } from './EnvironmentPrimitives';

const cueObjects: Array<{ id: ConsciousnessCueId; position: [number, number, number] }> = [
  { id: 'mug', position: [-1.05, 1.82, .38] },
  { id: 'rain', position: [2.85, 3.35, -3.23] },
  { id: 'unfinished-note', position: [.62, 1.7, .2] },
  { id: 'boarding-stub', position: [1.72, 1.7, .78] },
  { id: 'doorway', position: [-3.88, 1.86, -2.82] }
];

const phaseIntensity: Record<ConsciousnessPhase, number> = {
  notice: .72,
  recall: .92,
  deliberate: 1.18,
  act: 1.55,
  continue: 1.32
};

/**
 * Like the 2D portrait, the 3D figure is made of permissioned memory: each body
 * segment belongs to one 2030 moment. Kept moments glow, unasked ones stay faint,
 * and refused ones are deliberate near-blanks—never reconstructed.
 */
const bandLook: Record<CoexistenceState['consent'][CoexistenceMomentId], { color: string; emissive: number; opacity: number }> = {
  kept: { color: '#ffd08a', emissive: 1.25, opacity: .52 },
  unasked: { color: '#ffbd62', emissive: .62, opacity: .26 },
  refused: { color: '#ff5938', emissive: .12, opacity: .06 }
};

function HologramKevin({ active, animate, phase, memoryState, consent }: {
  active: boolean;
  animate: boolean;
  phase: ConsciousnessPhase;
  memoryState: PermissionedMemoryState;
  consent: CoexistenceState['consent'];
}) {
  const figure = useRef<THREE.Group>(null);
  const hand = useRef<THREE.Group>(null);
  const scan = useRef<THREE.Mesh>(null);
  const intensity = phaseIntensity[phase];
  const memoryFactor = memoryState === 'retained' ? 1 : memoryState === 'withheld' ? .42 : .68;

  useFrame(({ clock }) => {
    if (!active || !animate) return;
    if (figure.current) {
      figure.current.position.y = Math.sin(clock.elapsedTime * .66) * .035;
      figure.current.rotation.y = Math.sin(clock.elapsedTime * .19) * .055;
      // A rare, small glitch—never a strobe, even for a withheld memory.
      const glitch = Math.sin(clock.elapsedTime * 2.3) > (memoryState === 'retained' ? .9995 : .996) ? .06 : 0;
      figure.current.position.x = glitch;
    }
    if (hand.current) hand.current.position.x = -1.28 + ((Math.sin(clock.elapsedTime * .72) + 1) / 2) * 1.6;
    if (scan.current) scan.current.position.y = 1.35 + ((clock.elapsedTime * .46) % 1) * 3.1;
  });

  const band = (id: CoexistenceMomentId) => {
    const look = bandLook[consent[id]];
    return (
      <meshStandardMaterial color={look.color} emissive="#ff7d20" emissiveIntensity={active ? intensity * look.emissive : .12} transparent opacity={active ? look.opacity : look.opacity * .6} wireframe />
    );
  };

  return (
    <group ref={figure} position={[0, 0, -.48]}>
      <mesh position={[0, 3.35, 0]} scale={[.78, 1, .66]} castShadow><sphereGeometry args={[.57, 32, 24]} />{band('morning')}</mesh>
      {phase === 'deliberate' && <><mesh position={[-.12, 3.35, -.06]} scale={[.78, 1, .66]}><sphereGeometry args={[.57, 24, 18]} /><meshBasicMaterial color="#ff542f" wireframe transparent opacity={.1 * memoryFactor} /></mesh><mesh position={[.12, 3.35, -.08]} scale={[.78, 1, .66]}><sphereGeometry args={[.57, 24, 18]} /><meshBasicMaterial color="#ffd27f" wireframe transparent opacity={.1 * memoryFactor} /></mesh></>}
      <mesh position={[0, 3.62, -.12]} scale={[.8, .4, .7]}><sphereGeometry args={[.58, 24, 18]} /><meshStandardMaterial color="#3a1608" emissive="#b74715" emissiveIntensity={active ? .48 : .05} transparent opacity={.68} /></mesh>
      <mesh position={[-.2, 3.37, .48]}><sphereGeometry args={[.035, 12, 10]} /><meshBasicMaterial color="#fff1c8" /></mesh>
      <mesh position={[.2, 3.37, .48]}><sphereGeometry args={[.035, 12, 10]} /><meshBasicMaterial color="#fff1c8" /></mesh>
      <mesh position={[0, 3.08, .5]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[.16, .012, 6, 18, Math.PI]} /><meshBasicMaterial color="#ffdf9c" /></mesh>
      <mesh position={[0, 2.72, 0]}><cylinderGeometry args={[.17, .2, .48, 18]} />{band('making')}</mesh>
      <mesh position={[0, 1.7, 0]} scale={[1, 1, .52]}><capsuleGeometry args={[.63, 1.35, 7, 18]} />{band('work')}</mesh>
      <mesh position={[-.88, 1.68, 0]} rotation={[0, 0, -.12]}><capsuleGeometry args={[.16, 1.45, 6, 14]} />{band('care')}</mesh>
      <mesh position={[.88, 1.68, 0]} rotation={[0, 0, .12]}><capsuleGeometry args={[.16, 1.45, 6, 14]} />{band('care')}</mesh>
      <mesh position={[-.34, .3, 0]}><capsuleGeometry args={[.2, 1.25, 6, 14]} />{band('evening')}</mesh>
      <mesh position={[.34, .3, 0]}><capsuleGeometry args={[.2, 1.25, 6, 14]} />{band('evening')}</mesh>

      <group ref={hand} position={[-1.28, 1.83, .42]} rotation={[0, 0, -Math.PI / 2]}>
        <mesh><capsuleGeometry args={[.12, .82, 6, 12]} />{band('care')}</mesh>
        <mesh position={[0, -.53, 0]} scale={[1.35, .72, 1]}><sphereGeometry args={[.18, 16, 12]} />{band('care')}</mesh>
      </group>

      <mesh ref={scan} position={[0, 1.35, .58]}><boxGeometry args={[1.6, .018, .025]} /><meshBasicMaterial color="#ffe4a5" transparent opacity={active ? .9 : .15} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -.5, 0]}><torusGeometry args={[1.15, .025, 8, 52]} /><meshStandardMaterial color={bandLook[consent.gathering].color} emissive="#ff542f" emissiveIntensity={active ? 1.2 * bandLook[consent.gathering].emissive : .1} transparent opacity={.2 + bandLook[consent.gathering].opacity} /></mesh>
      {/* Always mounted: toggling a light forces a shader recompile. */}
      <pointLight position={[0, 2.2, .3]} color="#ff8b28" intensity={active ? 4.2 * intensity * memoryFactor : 0} distance={8} decay={2} />
    </group>
  );
}

function CyberpunkApartment({ active }: { active: boolean }) {
  return (
    <>
      <GlassPanel position={[2.85, 3.32, -3.34]} size={[3.05, 3.55, .06]} color="#6f2b16" opacity={active ? .12 : .04} frameColor="#2c1a10" />
      <group position={[2.85, 2.0, -3.39]}>
        {[-1.05, -.58, -.08, .45, .94].map((x, index) => <mesh key={x} position={[x, .35 + (index % 2) * .28, 0]}><boxGeometry args={[.3, 1.2 + index * .18, .04]} /><meshStandardMaterial color="#060504" emissive={index % 2 ? '#ff542f' : '#ff9e2f'} emissiveIntensity={active ? .24 + index * .03 : .02} /></mesh>)}
        {[-.8, -.3, .25, .72].map((x) => <mesh key={`rain-${x}`} position={[x, 1.15, .03]} rotation={[0, 0, -.16]}><boxGeometry args={[.012, 2.8, .01]} /><meshBasicMaterial color="#e9d6af" transparent opacity={.16} /></mesh>)}
      </group>
      <group position={[0, 1.05, .45]}>
        <RoundedBox position={[0, .52, 0]} args={[4.45, .22, 2.05]} radius={.09} smoothness={3} castShadow receiveShadow><meshStandardMaterial color="#24170d" roughness={.42} metalness={.15} /></RoundedBox>
        {[-1.78, 1.78].flatMap((x) => [-.7, .7].map((z) => <mesh key={`${x}-${z}`} position={[x, -.22, z]} castShadow><cylinderGeometry args={[.09, .12, 1.45, 14]} /><meshStandardMaterial color="#0c0906" roughness={.58} /></mesh>))}
      </group>
      <mesh position={[-1.05, 1.82, .38]}><cylinderGeometry args={[.2, .18, .34, 24]} /><meshStandardMaterial color="#4c3524" roughness={.6} /></mesh>
      <mesh position={[-.85, 1.85, .38]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.11, .035, 8, 18]} /><meshStandardMaterial color="#66503b" /></mesh>
      <RoundedBox position={[.62, 1.69, .2]} rotation={[-Math.PI / 2, 0, -.12]} args={[1.15, .72, .045]} radius={.03} smoothness={2}><meshStandardMaterial color="#241a10" emissive="#ff6a2d" emissiveIntensity={active ? .12 : .01} /></RoundedBox>
      {/* The unprinted boarding pass: the payoff of 2030's “a year is waiting”. */}
      <group position={[1.72, 1.69, .78]} rotation={[-Math.PI / 2, 0, .1]} userData={{ label: 'A boarding pass, unprinted' }}>
        <mesh><planeGeometry args={[.62, .28]} /><meshBasicMaterial color="#ffc46a" transparent opacity={active ? .22 : .06} /></mesh>
        <mesh position={[.19, 0, .002]}><planeGeometry args={[.012, .24]} /><meshBasicMaterial color="#ffd79a" transparent opacity={active ? .5 : .1} /></mesh>
      </group>
      <LightBar position={[-2.25, 5.55, -2.5]} length={3.3} color="#ff7d2f" intensity={active ? .34 : .04} />
      <LightBar position={[2.35, 5.55, -2.5]} length={3.1} color="#f0d39b" intensity={active ? .2 : .03} />
    </>
  );
}

function CueObject({ id, active, memoryState, onSelect }: { id: ConsciousnessCueId; active: boolean; memoryState: PermissionedMemoryState; onSelect: () => void }) {
  const cue = cueObjects.find((item) => item.id === id)!;
  return (
    <Hoverable label={`${consciousnessCues[id].label} · ${consciousnessCues[id].certainty} · ${memoryState}`} onClick={onSelect}>
      <group position={cue.position} userData={{ memoryState }}>
        <mesh rotation={[Math.PI / 2, 0, 0]} scale={active ? 1.25 : 1}>
          <torusGeometry args={[id === 'rain' ? .7 : .28, active ? .032 : .016, 8, memoryState === 'withheld' ? 9 : id === 'unfinished-note' ? 12 : 36]} />
          <meshStandardMaterial color={id === 'unfinished-note' || memoryState === 'withheld' ? '#ff5938' : '#ffb14b'} emissive={id === 'unfinished-note' || memoryState === 'withheld' ? '#ff3d24' : '#ff7a20'} emissiveIntensity={active ? memoryState === 'retained' ? 1.65 : .74 : .26} transparent opacity={memoryState === 'withheld' ? .34 : active ? .9 : .4} />
        </mesh>
      </group>
    </Hoverable>
  );
}

export function Year2040Scene({ active, detail = true }: { active: boolean; timeline: boolean; detail?: boolean }) {
  const config = eraConfigs['2040'];
  const { enterYear } = useExperienceActions();
  const consciousness = useExperienceStore((state) => state.futureJourney.consciousness);
  const coexistence = useExperienceStore((state) => state.futureJourney.coexistence);
  const selectCue = useExperienceStore((state) => state.selectConsciousnessCue);
  const animate = useExperienceStore((state) => state.motion) !== 'reduced';
  const memoryState = getPermissionedMemoryState(coexistence, consciousness.selectedCue);

  // Artifacts unlock only through story events (finishing an encounter), never a bare click.
  const chooseCue = (id: ConsciousnessCueId) => selectCue(id);

  if (!detail) {
    return (
      <group position={[config.stationX, 0, 0]}>
        <RoomShell floorColor="#080705" wallColor="#100c08" sideColor="#160e08" ceilingColor="#090705" trimColor="#3d2413" accent="#ff9e2f" openLeft active={false} floorRoughness={.38} />
        <CyberpunkApartment active={false} />
        <HologramKevin active={false} animate={false} phase={consciousness.behaviorPhase} memoryState={memoryState} consent={coexistence.consent} />
      </group>
    );
  }

  return (
    <group position={[config.stationX, 0, 0]}>
      <RoomShell floorColor="#080705" wallColor="#100c08" sideColor="#160e08" ceilingColor="#090705" trimColor="#3d2413" accent="#ff9e2f" openLeft active={active} floorRoughness={.36} />
      <Dust center={[0, 3, 0]} spread={[9.2, 5.6, 6.9]} color="#c97d3f" active={active} count={active ? 34 : 9} />
      <CyberpunkApartment active={active} />

      <Hoverable label={`Enter Morning, After · Kevin is ${consciousness.behaviorPhase}`} onClick={() => enterYear('2040')}>
        <group>
          <HologramKevin active={active} animate={animate} phase={consciousness.behaviorPhase} memoryState={memoryState} consent={coexistence.consent} />
        </group>
      </Hoverable>

      {cueObjects.map(({ id }) => <CueObject key={id} id={id} active={consciousness.selectedCue === id} memoryState={getPermissionedMemoryState(coexistence, id)} onSelect={() => chooseCue(id)} />)}

      {consciousness.sourceTraceOpen && (
        <group position={[0, 4.75, -2.9]} userData={{ label: `Source trace · ${consciousnessCues[consciousness.selectedCue].certainty}` }}>
          {Array.from({ length: consciousnessCues[consciousness.selectedCue].certainty === 'conjecture' ? 7 : 18 }, (_, index) => <mesh key={index} position={[-2.1 + index * .25, Math.sin(index * 1.8) * (consciousnessCues[consciousness.selectedCue].certainty === 'conjecture' ? .12 : .02), 0]}><boxGeometry args={[.18, .018, .018]} /><meshBasicMaterial color={consciousnessCues[consciousness.selectedCue].certainty === 'conjecture' ? '#ff5738' : '#ffc16a'} /></mesh>)}
        </group>
      )}

      <spotLight position={[0, 5.8, 2.6]} target-position={[0, 2.1, -.3]} color="#ffb45d" intensity={active ? 2.8 : .24} distance={15} angle={.68} penumbra={.75} castShadow />
      <pointLight position={[3.7, 2.8, 0]} color="#ff492e" intensity={active ? 1.35 : 0} distance={7} decay={2} />
    </group>
  );
}
