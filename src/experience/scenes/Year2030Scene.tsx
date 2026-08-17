'use client';

import { useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { eraConfigs } from '../config';
import { useExperienceActions } from '../ExperienceContext';
import { useExperienceStore } from '../store';
import {
  coexistenceMoments,
  type CoexistenceMomentId
} from '../future/futureWorld';
import { Dust, Hoverable } from './SceneUtils';
import { CylinderBetween, GlassPanel, LightBar, Plant, RoomShell } from './EnvironmentPrimitives';

const momentObjects: Array<{
  id: CoexistenceMomentId;
  position: [number, number, number];
  color: string;
}> = [
  { id: 'morning', position: [-2.75, 1.87, 0.62], color: '#f2d29e' },
  { id: 'making', position: [0.45, 1.71, -1.12], color: '#b66b45' },
  { id: 'work', position: [3.22, 2.64, -3.58], color: '#e6b85c' },
  { id: 'care', position: [-4.42, 1.82, -1.52], color: '#d8764e' },
  { id: 'evening', position: [-.55, 1.16, 1.92], color: '#caa050' },
  { id: 'gathering', position: [2.72, 1.16, 1.82], color: '#8aa08a' }
];

const saitoPosition: [number, number, number] = [0, 4.18, -3.62];
const commitmentDialPosition: [number, number, number] = [-1.62, 1.74, 1.05];

type SaitoActionTarget = { to: [number, number, number]; gated?: boolean };

/**
 * One permissioned input fans out to every room surface Saito touches for that
 * moment. A gated target stops short and renders the human-authority stop:
 * staged plans surface anywhere, but commitment happens only at the dial.
 */
const responseTargets: Record<CoexistenceMomentId, readonly SaitoActionTarget[]> = {
  morning: [
    { to: [-2.72, 5.55, .5] },
    { to: [.15, 2.58, -.57] },
    { to: [-.55, 1.34, 1.92] },
    { to: commitmentDialPosition, gated: true }
  ],
  making: [
    { to: [.15, 2.58, -.57] },
    { to: [.4, 5.55, -1.1] },
    { to: commitmentDialPosition, gated: true }
  ],
  work: [
    { to: [3.22, 2.64, -3.58], gated: true }
  ],
  care: [
    { to: [-4.42, 2.92, -1.52] },
    { to: commitmentDialPosition, gated: true }
  ],
  evening: [
    { to: [.15, 2.58, -.57] },
    { to: [-4.42, 2.92, -1.52] },
    { to: [2.85, 5.55, 1.55] },
    { to: commitmentDialPosition, gated: true }
  ],
  gathering: [
    { to: [2.85, 5.55, 1.55] },
    { to: commitmentDialPosition, gated: true }
  ]
};

function SaitoActionChannel({ active, target, index, color, privateRestraint, actStatus }: {
  active: boolean;
  target: SaitoActionTarget;
  index: number;
  color: string;
  privateRestraint: boolean;
  actStatus: string;
}) {
  const outgoingSignal = useRef<THREE.Mesh>(null);
  const gated = Boolean(target.gated);
  const actionEnd: [number, number, number] = gated
    ? [
        saitoPosition[0] + (target.to[0] - saitoPosition[0]) * .58,
        saitoPosition[1] + (target.to[1] - saitoPosition[1]) * .58,
        saitoPosition[2] + (target.to[2] - saitoPosition[2]) * .58
      ]
    : target.to;

  useFrame(({ clock }) => {
    const actionProgress = active ? (clock.elapsedTime * .42 + .48 + index * .19) % 1 : 0;
    outgoingSignal.current?.position.lerpVectors(
      new THREE.Vector3(...saitoPosition),
      new THREE.Vector3(...actionEnd),
      actionProgress
    );
  });

  return (
    <>
      <CylinderBetween from={saitoPosition} to={actionEnd} radius={.016} color={gated ? '#c65d3b' : color} emissiveIntensity={active ? .72 : .07} transparent opacity={privateRestraint ? .1 : active ? .38 : .06} />
      <mesh ref={outgoingSignal} userData={{ label: gated ? 'Saito stops at human authority' : 'Saito changes the permitted room surface' }}>
        <sphereGeometry args={[gated ? .095 : .07, 16, 12]} />
        <meshBasicMaterial color={gated ? '#e36a43' : '#fff0b7'} transparent opacity={privateRestraint ? .28 : active ? .9 : .1} />
      </mesh>
      <group position={actionEnd} userData={{ label: gated ? 'Human authority gate · no action beyond this point' : `Permitted response · ${actStatus}` }}>
        <mesh rotation={gated ? [0, 0, Math.PI / 4] : [Math.PI / 2, 0, 0]}>
          {gated ? <boxGeometry args={[.34, .34, .08]} /> : <torusGeometry args={[.26, .025, 8, 30]} />}
          <meshStandardMaterial color={gated ? '#b95132' : color} emissive={color} emissiveIntensity={active ? 1.1 : .12} transparent opacity={privateRestraint ? .22 : active ? .78 : .12} />
        </mesh>
        {gated && <pointLight color="#d86742" intensity={active ? 1.8 : .08} distance={3.2} decay={2} />}
      </group>
    </>
  );
}

function SaitoSpatialResponse({ active, momentId, decision }: {
  active: boolean;
  momentId: CoexistenceMomentId;
  decision: 'unasked' | 'kept' | 'refused';
}) {
  const incomingSignal = useRef<THREE.Mesh>(null);
  const object = momentObjects.find((item) => item.id === momentId)!;
  const targets = responseTargets[momentId];
  const privateRestraint = momentId === 'care';
  const color = decision === 'refused' ? '#b65f44' : decision === 'kept' ? '#fff0ae' : object.color;
  const actStatus = coexistenceMoments[momentId].agent.steps.act.status;

  useFrame(({ clock }) => {
    const inputProgress = active ? (clock.elapsedTime * .42) % 1 : 0;
    incomingSignal.current?.position.lerpVectors(
      new THREE.Vector3(...object.position),
      new THREE.Vector3(...saitoPosition),
      inputProgress
    );
  });

  return (
    <group userData={{ label: `Saito spatial response · ${coexistenceMoments[momentId].agent.id}` }}>
      <CylinderBetween from={object.position} to={saitoPosition} radius={.011} color={color} emissiveIntensity={active ? .58 : .06} transparent opacity={active ? .28 : .05} />
      <mesh ref={incomingSignal} userData={{ label: 'Permissioned room input reaches Saito' }}>
        <sphereGeometry args={[.075, 16, 12]} />
        <meshBasicMaterial color="#fff9df" transparent opacity={active ? .95 : .12} />
      </mesh>
      {targets.map((target, index) => (
        <SaitoActionChannel
          key={`${momentId}-${target.to.join(':')}`}
          active={active}
          target={target}
          index={index}
          color={color}
          privateRestraint={privateRestraint}
          actStatus={actStatus}
        />
      ))}
    </group>
  );
}

function ConsentMark({ decision, color }: { decision: 'unasked' | 'kept' | 'refused'; color: string }) {
  if (decision === 'unasked') return null;
  return (
    <group position={[0, .42, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[.21, .025, 8, decision === 'kept' ? 32 : 10]} />
        <meshStandardMaterial color={decision === 'kept' ? '#fff1bf' : '#b65f44'} emissive={color} emissiveIntensity={decision === 'kept' ? 1.3 : .42} transparent opacity={decision === 'kept' ? .9 : .5} />
      </mesh>
    </group>
  );
}

function MomentObject({ id, active, decision, onSelect }: {
  id: CoexistenceMomentId;
  active: boolean;
  decision: 'unasked' | 'kept' | 'refused';
  onSelect: () => void;
}) {
  const object = momentObjects.find((item) => item.id === id)!;
  const material = <meshStandardMaterial color={object.color} emissive={object.color} emissiveIntensity={active ? .82 : .12} roughness={.42} metalness={.08} />;
  return (
    <Hoverable label={`${coexistenceMoments[id].time} · ${coexistenceMoments[id].title}`} onClick={onSelect}>
      <group position={object.position} scale={active ? 1.14 : 1}>
        {id === 'morning' && <><mesh castShadow><cylinderGeometry args={[.2, .18, .34, 24]} />{material}</mesh><mesh position={[.2, .03, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.11, .035, 8, 18]} />{material}</mesh></>}
        {id === 'making' && <RoundedBox rotation={[-Math.PI / 2, 0, -.12]} args={[1.15, .72, .045]} radius={.03} smoothness={2} castShadow>{material}</RoundedBox>}
        {id === 'work' && <mesh><planeGeometry args={[1.25, 1.5]} /><meshPhysicalMaterial color="#e8c579" transparent opacity={active ? .28 : .08} roughness={.08} clearcoat={1} /></mesh>}
        {id === 'care' && <RoundedBox args={[.16, 2.2, .18]} radius={.03} smoothness={2}>{material}</RoundedBox>}
        {id === 'evening' && <><mesh castShadow><cylinderGeometry args={[.24, .26, .05, 22]} />{material}</mesh><RoundedBox position={[.3, .07, .14]} rotation={[-Math.PI / 2, 0, .32]} args={[.34, .22, .03]} radius={.015} smoothness={2}>{material}</RoundedBox></>}
        {id === 'gathering' && <><mesh position={[-.16, 0, 0]}><cylinderGeometry args={[.14, .1, .34, 18]} />{material}</mesh><mesh position={[.16, 0, 0]}><cylinderGeometry args={[.14, .1, .34, 18]} />{material}</mesh></>}
        <ConsentMark decision={decision} color={object.color} />
      </group>
    </Hoverable>
  );
}

function ApartmentFurniture({ active }: { active: boolean }) {
  return (
    <>
      <group position={[-2.72, 0, .62]} userData={{ label: 'Kitchen · local sensing zone' }}>
        <RoundedBox position={[0, .82, 0]} args={[2.85, 1.45, 1.42]} radius={.12} smoothness={3} castShadow receiveShadow>
          <meshStandardMaterial color="#6c5543" roughness={.7} />
        </RoundedBox>
        <RoundedBox position={[0, 1.58, 0]} args={[3.08, .16, 1.58]} radius={.07} smoothness={3} castShadow receiveShadow>
          <meshStandardMaterial color="#cbb99b" roughness={.34} metalness={.08} />
        </RoundedBox>
        {[-.82, 0, .82].map((x) => <mesh key={x} position={[x, .84, .72]}><boxGeometry args={[.025, 1.1, .025]} /><meshStandardMaterial color="#bd9b72" roughness={.5} /></mesh>)}
      </group>

      <group position={[-.55, 0, 1.92]} userData={{ label: 'Dinner table · where seeds are spoken' }}>
        <mesh position={[0, 1.02, 0]} castShadow><cylinderGeometry args={[.92, .92, .07, 28]} /><meshStandardMaterial color="#8a6a4a" roughness={.5} /></mesh>
        <mesh position={[0, .5, 0]}><cylinderGeometry args={[.09, .13, 1.0, 12]} /><meshStandardMaterial color="#5c4634" roughness={.62} /></mesh>
      </group>

      <group position={commitmentDialPosition} userData={{ label: 'Commitment dial · staged plans commit only by hand' }}>
        <mesh castShadow><cylinderGeometry args={[.14, .16, .09, 20]} /><meshStandardMaterial color="#b08430" metalness={.72} roughness={.28} emissive="#7a4d18" emissiveIntensity={active ? .34 : .05} /></mesh>
        <mesh position={[0, .07, 0]}><boxGeometry args={[.035, .05, .16]} /><meshStandardMaterial color="#5c3a16" metalness={.6} roughness={.3} /></mesh>
      </group>

      <group position={[.42, 0, -1.22]} userData={{ label: 'Studio · mounted context zone' }}>
        <RoundedBox position={[0, 1.55, 0]} args={[3.35, .18, 1.55]} radius={.07} smoothness={3} castShadow receiveShadow>
          <meshStandardMaterial color="#8a5a3d" roughness={.52} />
        </RoundedBox>
        {[-1.38, 1.38].map((x) => <mesh key={x} position={[x, .72, 0]}><boxGeometry args={[.13, 1.55, 1.18]} /><meshStandardMaterial color="#4d4036" roughness={.66} /></mesh>)}
        <group userData={{ label: 'Saito pane · staged plans surface here; the hand commits' }}>
          <GlassPanel position={[.15, 2.58, -.61]} size={[2.25, 1.42, .055]} color="#edc77f" opacity={active ? .16 : .035} frameColor="#5e4a3c" />
        </group>
        <mesh position={[.15, 2.58, -.57]}><planeGeometry args={[1.72, .74]} /><meshBasicMaterial color="#f5ddaa" transparent opacity={active ? .08 : .018} /></mesh>
      </group>

      <group position={[2.72, 0, 1.72]} userData={{ label: 'Living room · guest-safe zone' }}>
        <RoundedBox position={[0, .02, 0]} args={[3.65, .16, 2.7]} radius={.18} smoothness={3} receiveShadow>
          <meshStandardMaterial color="#987b63" roughness={.82} />
        </RoundedBox>
        <RoundedBox position={[1.15, .58, -.28]} args={[.76, 1.05, 2.12]} radius={.24} smoothness={4} castShadow>
          <meshStandardMaterial color="#596a5e" roughness={.9} />
        </RoundedBox>
        <RoundedBox position={[.38, .68, -.95]} args={[2.25, .98, .68]} radius={.22} smoothness={4} castShadow>
          <meshStandardMaterial color="#637568" roughness={.9} />
        </RoundedBox>
        <RoundedBox position={[-.15, .84, .08]} args={[1.7, .13, 1.05]} radius={.07} smoothness={3} castShadow>
          <meshStandardMaterial color="#9f6846" roughness={.46} />
        </RoundedBox>
      </group>

      <group position={[-1.18, 2.72, -3.36]} userData={{ label: 'Passive ventilation and acoustic partition' }}>
        {[-1.0, -.66, -.32, .02, .36, .7, 1.04].map((x) => <RoundedBox key={x} position={[x, 0, 0]} args={[.09, 4.95, .22]} radius={.025} smoothness={2}><meshStandardMaterial color="#7b5f49" roughness={.62} /></RoundedBox>)}
      </group>

      <group position={[-4.35, 2.92, -2.62]}>
        {[0, .82, 1.64].map((y) => <RoundedBox key={y} position={[0, y - .82, 0]} args={[1.4, .09, .36]} radius={.025} smoothness={2}><meshStandardMaterial color="#72513b" roughness={.58} /></RoundedBox>)}
        {[-.42, .02, .45].map((x, index) => <RoundedBox key={x} position={[x, -.55 + index * .78, .03]} args={[.2, .5, .28]} radius={.025} smoothness={2}><meshStandardMaterial color={['#9b4f38', '#c38b50', '#536f60'][index]} roughness={.65} /></RoundedBox>)}
      </group>

      <Plant position={[4.35, .05, -.5]} scale={1.28} potColor="#a46643" leafColor="#60785f" />
      <LightBar position={[-2.72, 5.55, .5]} length={2.9} color="#ffe3aa" intensity={active ? .72 : .07} />
      <LightBar position={[.4, 5.55, -1.1]} length={3.25} color="#f4d7a1" intensity={active ? .58 : .06} />
      <LightBar position={[2.85, 5.55, 1.55]} length={2.4} color="#e4bd75" intensity={active ? .42 : .05} />
    </>
  );
}

export function Year2030Scene({ active, detail = true }: { active: boolean; timeline: boolean; detail?: boolean }) {
  const config = eraConfigs['2030'];
  const { enterYear, discover } = useExperienceActions();
  const coexistence = useExperienceStore((state) => state.futureJourney.coexistence);
  const selectMoment = useExperienceStore((state) => state.selectCoexistenceMoment);
  const saito = useRef<THREE.Group>(null);
  const hand = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!active || !detail) return;
    if (saito.current) {
      const breath = 1 + Math.sin(clock.elapsedTime * 1.15) * .018;
      saito.current.scale.setScalar(breath);
      saito.current.position.y = 4.18 + Math.sin(clock.elapsedTime * .72) * .025;
    }
    if (hand.current) hand.current.position.x = -2.15 + Math.sin(clock.elapsedTime * .72) * .28;
  });

  const chooseMoment = (id: CoexistenceMomentId) => {
    selectMoment(id);
    if (id === 'care') discover('human-gate', '2030');
  };

  if (!detail) {
    return (
      <group position={[config.stationX, 0, 0]}>
        <RoomShell floorColor="#a48668" wallColor="#d7d2bd" sideColor="#c6b89c" ceilingColor="#eee5d2" trimColor="#765741" accent="#d69b50" openLeft openRight active={false} floorRoughness={.7} />
        <ApartmentFurniture active={false} />
        <SaitoSpatialResponse active={false} momentId={coexistence.activeMoment} decision={coexistence.consent[coexistence.activeMoment]} />
        <mesh position={[0, 4.18, -3.62]}><icosahedronGeometry args={[.34, 2]} /><meshStandardMaterial color="#ffd78a" emissive="#f3ad45" emissiveIntensity={.18} transparent opacity={.52} /></mesh>
      </group>
    );
  }

  return (
    <group position={[config.stationX, 0, 0]}>
      <RoomShell floorColor="#a48668" wallColor="#d7d2bd" sideColor="#c6b89c" ceilingColor="#eee5d2" trimColor="#765741" accent="#d69b50" openLeft openRight active={active} floorRoughness={.68} />
      <Dust center={[0, 3, 0]} spread={[9.1, 5.3, 6.8]} color="#f2cf8c" active={active} count={active ? 22 : 7} />
      <ApartmentFurniture active={active} />

      <GlassPanel position={[3.15, 2.72, -3.78]} size={[3.62, 3.7, .06]} color="#b9d1c5" opacity={active ? .14 : .04} frameColor="#725944" />
      <group position={[3.15, 1.92, -3.81]}>
        {[-1.3, -.82, -.28, .3, .84, 1.28].map((x, index) => <mesh key={x} position={[x, .28 + (index % 3) * .25, 0]}><boxGeometry args={[.32, 1.1 + index * .2, .04]} /><meshStandardMaterial color="#66756d" emissive="#d9a150" emissiveIntensity={active ? .055 + index * .015 : .008} /></mesh>)}
      </group>

      <group ref={hand} position={[-2.15, 1.84, .62]} rotation={[0, 0, -.08]}>
        <mesh castShadow><capsuleGeometry args={[.17, 1.1, 6, 14]} /><meshStandardMaterial color="#bb8060" roughness={.54} /></mesh>
        <mesh position={[-.72, 0, 0]} rotation={[0, 0, Math.PI / 2]}><capsuleGeometry args={[.24, .7, 6, 14]} /><meshStandardMaterial color="#394b42" roughness={.72} /></mesh>
      </group>

      {momentObjects.map(({ id }) => <MomentObject key={id} id={id} active={coexistence.activeMoment === id} decision={coexistence.consent[id]} onSelect={() => chooseMoment(id)} />)}
      <SaitoSpatialResponse active={active} momentId={coexistence.activeMoment} decision={coexistence.consent[coexistence.activeMoment]} />

       <Hoverable label="Enter Morning, Together with Saito" onClick={() => enterYear('2030')}>
         <group ref={saito} position={[0, 4.18, -3.62]} userData={{ label: `Saito in the room · ${coexistenceMoments[coexistence.activeMoment].title}` }}>
           <mesh>
             <icosahedronGeometry args={[.34, 2]} />
             <meshPhysicalMaterial color="#ffe0a0" emissive="#f2a948" emissiveIntensity={active ? 1.05 : .12} transparent opacity={coexistence.activeMoment === 'care' ? .28 : active ? .72 : .2} roughness={.12} clearcoat={1} />
           </mesh>
           {[0, Math.PI / 2].map((rotation) => <mesh key={rotation} rotation={[rotation, 0, Math.PI / 4]}><torusGeometry args={[.52, .018, 8, 42]} /><meshBasicMaterial color="#ffe5ad" transparent opacity={active ? .7 : .12} /></mesh>)}
           <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.7, .012, 8, 48]} /><meshBasicMaterial color="#c96e3d" transparent opacity={active ? .42 : .08} /></mesh>
           <mesh position={[0, -.03, .08]}><sphereGeometry args={[.08, 16, 12]} /><meshBasicMaterial color="#fffbe8" /></mesh>
           {active && coexistence.activeMoment !== 'care' && <pointLight position={[0, 0, .5]} color="#ffc15c" intensity={2.9} distance={8.5} decay={2} />}
         </group>
       </Hoverable>

      <spotLight position={[1.8, 5.75, 2.7]} target-position={[0, 1.45, .35]} color="#ffe4b0" intensity={active ? 3.4 : .28} distance={15} angle={.72} penumbra={.74} castShadow={active} />
    </group>
  );
}
