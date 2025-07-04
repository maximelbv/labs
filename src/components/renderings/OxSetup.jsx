import * as THREE from "three";
import { memo } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Lightformer,
  Environment,
  OrbitControls,
  Center,
  Float,
  AccumulativeShadows,
  RandomizedLight,
} from "@react-three/drei";
import {
  EffectComposer,
  N8AO,
  ToneMapping,
  TiltShift2,
} from "@react-three/postprocessing";
import { useControls } from "leva";

export default function OxSetup({ children }) {
  const { intensity, blurriness, highlight, highlight2 } = useControls(
    "Environment",
    {
      intensity: { value: 1.5, min: 0, max: 4, step: 0.1 },
      blurriness: { value: 1, min: 0, max: 1, step: 0.01 },
      highlight: "#ae62ff",
      highlight2: "#ae62ff",
    }
  );
  const { tiltShift, AO, toneMapping } = useControls("Effects", {
    tiltShift: true,
    AO: true,
    toneMapping: true,
  });

  return (
    <Canvas shadows camera={{ position: [2, 2, 6], fov: 65 }}>
      <group position={[0, 0, 0]}>
        <Float floatIntensity={2}>
          <Center
            scale={3}
            position={[0, 0.5, 0]}
            rotation={[0, Math.PI - Math.PI / 10, 0]}
          >
            {children}
          </Center>
        </Float>
        <Shadows />
      </group>
      <OrbitControls />
      <Environment
        resolution={1024}
        background
        backgroundBlurriness={blurriness}
        environmentIntensity={intensity}
      >
        <Room highlight={highlight} highlight2={highlight2} />
      </Environment>
      <Effects tiltShift={tiltShift} AO={AO} toneMapping={toneMapping} />
    </Canvas>
  );
}

const Shadows = memo(() => (
  <AccumulativeShadows
    frames={100}
    temporal
    alphaTest={0.8}
    opacity={1.25}
    scale={15}
    position={[0, -1.12, 0]}
  >
    <RandomizedLight amount={8} radius={4} position={[1, 5.5, 1]} />
  </AccumulativeShadows>
));

const Effects = memo(({ tiltShift, AO, toneMapping }) => (
  <EffectComposer>
    {AO && <N8AO aoRadius={1} intensity={6} />}
    {tiltShift && <TiltShift2 samples={5} blur={0.5} />}
    {toneMapping && <ToneMapping />}
  </EffectComposer>
));

const box = new THREE.BoxGeometry();
const white = new THREE.MeshStandardMaterial({
  color: new THREE.Color(1, 1, 1),
});
function Room({ highlight, highlight2 }) {
  return (
    <group position={[0, -0.5, 0]}>
      <spotLight
        castShadow
        position={[-15, 20, 15]}
        angle={0.2}
        penumbra={1}
        intensity={2}
        decay={0}
      />
      <spotLight
        castShadow
        position={[15, 20, 15]}
        angle={0.2}
        penumbra={1}
        intensity={2}
        decay={0}
      />
      <spotLight
        castShadow
        position={[15, 20, -15]}
        angle={0.2}
        penumbra={1}
        intensity={2}
        decay={0}
      />
      <spotLight
        castShadow
        position={[-15, 20, -15]}
        angle={0.2}
        penumbra={1}
        intensity={2}
        decay={0}
      />
      <pointLight
        castShadow
        color="white"
        intensity={100}
        distance={28}
        decay={2}
        position={[0.5, 14.0, 0.5]}
      />

      <mesh
        geometry={box}
        castShadow
        receiveShadow
        position={[0.0, 13.2, 0.0]}
        scale={[31.5, 28.5, 31.5]}
      >
        <meshStandardMaterial color="gray" side={THREE.BackSide} />
      </mesh>

      <Lightformer
        form="ring"
        position={[2, 3, -2]}
        scale={10}
        color={highlight}
        intensity={15}
      />
      <Lightformer
        form="ring"
        position={[-2, 3, 2]}
        scale={10}
        color={highlight2}
        intensity={15}
      />
    </group>
  );
}
