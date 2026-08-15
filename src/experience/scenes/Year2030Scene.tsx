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
import { GlassPanel, LightBar, Plant, RoomShell } from './EnvironmentPrimitives';

const momentObjects: Array<{
  id: CoexistenceMomentId;
  position: [number, number, number];
  color: string;
}> = [
  { id: 'morning', position: [-1.05, 1.82, 0.38], color: '#f2d29e' },
  { id: 'making', position: [0.62, 1.69, 0.2], color: '#b66b45' },
  { id: 'work', position: [3.18, 2.5, -2.95], color: '#e6b85c' },
  { id: 'care', position: [-3.85, 1.85, -2.8], color: '#d8764e' },
  { id: 'gathering', position: [2.1, 1.76, 0.66], color: '#8aa08a' }
];

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
        {id === 'gathering' && <><mesh position={[-.16, 0, 0]}><cylinderGeometry args={[.14, .1, .34, 18]} />{material}</mesh><mesh position={[.16, 0, 0]}><cylinderGeometry args={[.14, .1, .34, 18]} />{material}</mesh></>}
        <ConsentMark decision={decision} color={object.color} />
      </group>
    </Hoverable>
  );
}

function ApartmentFurniture({ active }: { active: boolean }) {
  return (
    <>
      <group position={[0, 1.05, .45]}>
        <RoundedBox position={[0, .52, 0]} args={[4.45, .22, 2.05]} radius={.09} smoothness={3} castShadow receiveShadow>
          <meshStandardMaterial color="#8b6040" roughness={.55} />
        </RoundedBox>
        {[-1.78, 1.78].flatMap((x) => [-.7, .7].map((z) => <mesh key={`${x}-${z}`} position={[x, -.22, z]} castShadow><cylinderGeometry args={[.09, .12, 1.45, 14]} /><meshStandardMaterial color="#60442f" roughness={.62} /></mesh>))}
      </group>
      <group position={[-3.55, 3.08, -3.0]}>
        {[0, .86, 1.72].map((y) => <RoundedBox key={y} position={[0, y, 0]} args={[2.25, .1, .42]} radius={.025} smoothness={2}><meshStandardMaterial color="#72513b" roughness={.58} /></RoundedBox>)}
        {[-.72, -.22, .34, .72].map((x, index) => <RoundedBox key={x} position={[x, .25 + (index % 3) * .84, .04]} args={[.24, .58, .31]} radius={.025} smoothness={2}><meshStandardMaterial color={['#9b4f38', '#c38b50', '#536f60', '#d2b37d'][index]} roughness={.65} /></RoundedBox>)}
      </group>
      <Plant position={[4.05, .04, 2.25]} scale={1.18} potColor="#a46643" leafColor="#60785f" />
      <LightBar position={[-2.25, 5.55, -2.5]} length={3.3} color="#ffe3aa" intensity={active ? .78 : .08} />
      <LightBar position={[2.35, 5.55, -2.5]} length={3.1} color="#f4d7a1" intensity={active ? .62 : .07} />
    </>
  );
}

export function Year2030Scene({ active, detail = true }: { active: boolean; timeline: boolean; detail?: boolean }) {
  const config = eraConfigs['2030'];
  const { enterYear, discover } = useExperienceActions();
  const coexistence = useExperienceStore((state) => state.futureJourney.coexistence);
  const selectMoment = useExperienceStore((state) => state.selectCoexistenceMoment);
  const wren = useRef<THREE.Group>(null);
  const hand = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!active || !detail) return;
    if (wren.current) {
      const breath = 1 + Math.sin(clock.elapsedTime * 1.15) * .018;
      wren.current.scale.setScalar(breath);
      wren.current.position.y = 3.1 + Math.sin(clock.elapsedTime * .72) * .025;
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
        <mesh position={[0, 1.58, .45]} castShadow><boxGeometry args={[4.2, .2, 1.8]} /><meshStandardMaterial color="#8b6040" roughness={.6} /></mesh>
        <mesh position={[.95, 2.65, -.2]}><sphereGeometry args={[.42, 24, 18]} /><meshStandardMaterial color="#ffd78a" emissive="#f3ad45" emissiveIntensity={.18} transparent opacity={.52} /></mesh>
      </group>
    );
  }

  return (
    <group position={[config.stationX, 0, 0]}>
      <RoomShell floorColor="#a48668" wallColor="#d7d2bd" sideColor="#c6b89c" ceilingColor="#eee5d2" trimColor="#765741" accent="#d69b50" openLeft openRight active={active} floorRoughness={.68} />
      <Dust center={[0, 3, 0]} spread={[9.1, 5.3, 6.8]} color="#f2cf8c" active={active} count={active ? 22 : 7} />
      <ApartmentFurniture active={active} />

      <GlassPanel position={[2.85, 3.32, -3.34]} size={[3.05, 3.55, .06]} color="#e8c17e" opacity={active ? .18 : .05} frameColor="#725944" />
      <group position={[2.85, 2.0, -3.39]}>
        {[-1.05, -.58, -.08, .45, .94].map((x, index) => <mesh key={x} position={[x, .35 + (index % 2) * .28, 0]}><boxGeometry args={[.3, 1.2 + index * .18, .04]} /><meshStandardMaterial color="#80735e" emissive="#e2a653" emissiveIntensity={active ? .08 + index * .02 : .01} /></mesh>)}
      </group>

      <group ref={hand} position={[-2.15, 1.84, .45]} rotation={[0, 0, -.08]}>
        <mesh castShadow><capsuleGeometry args={[.17, 1.1, 6, 14]} /><meshStandardMaterial color="#bb8060" roughness={.54} /></mesh>
        <mesh position={[-.72, 0, 0]} rotation={[0, 0, Math.PI / 2]}><capsuleGeometry args={[.24, .7, 6, 14]} /><meshStandardMaterial color="#394b42" roughness={.72} /></mesh>
      </group>

      {momentObjects.map(({ id }) => <MomentObject key={id} id={id} active={coexistence.activeMoment === id} decision={coexistence.consent[id]} onSelect={() => chooseMoment(id)} />)}

       <Hoverable label="Enter Morning, Together with Wren" onClick={() => enterYear('2030')}>
         <group ref={wren} position={[.55, 3.1, -3.15]} userData={{ label: `Wren in the room · ${coexistenceMoments[coexistence.activeMoment].title}` }}>
           <mesh position={[0, 0, .02]}>
             <planeGeometry args={[5.4, 2.05]} />
             <meshBasicMaterial color="#ffd991" transparent opacity={coexistence.activeMoment === 'care' ? .025 : active ? .14 : .035} depthWrite={false} blending={THREE.AdditiveBlending} />
           </mesh>
           <mesh position={[-.2, -1.22, 2.55]} rotation={[-Math.PI / 2, 0, -.09]} scale={[coexistence.activeMoment === 'work' ? .46 : 1, 1, 1]}>
             <planeGeometry args={[4.9, .035]} />
             <meshBasicMaterial color={coexistence.activeMoment === 'work' ? '#d76b42' : '#ffe1a0'} transparent opacity={coexistence.activeMoment === 'care' ? .04 : active ? .8 : .12} depthWrite={false} blending={THREE.AdditiveBlending} />
           </mesh>
           {coexistence.activeMoment === 'making' && <mesh position={[-.1, -1.06, 2.54]} rotation={[-Math.PI / 2, 0, -.04]}><planeGeometry args={[4.2, .022]} /><meshBasicMaterial color="#b86542" transparent opacity={active ? .72 : .1} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>}
           {active && coexistence.activeMoment !== 'care' && <pointLight position={[.8, -.35, 1.8]} color="#ffc15c" intensity={2.7} distance={8.5} decay={2} />}
         </group>
       </Hoverable>

      <spotLight position={[1.8, 5.75, 2.7]} target-position={[0, 1.45, .35]} color="#ffe4b0" intensity={active ? 3.4 : .28} distance={15} angle={.72} penumbra={.74} castShadow={active} />
    </group>
  );
}
