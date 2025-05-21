import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Physics,
  RigidBody,
  type RapierRigidBody,
  BallCollider,
} from "@react-three/rapier";
import { useEffect, useMemo, useRef, useState } from "react";
import { Environment, Sphere } from "@react-three/drei";
import { MathUtils, Vector3 } from "three";
import { EffectComposer, N8AO, SMAA } from "@react-three/postprocessing";
import type { ReactNode } from "react";

const vec3 = (x = 0, y = 0, z = 0): [number, number, number] => [x, y, z];

type ClumpProps = {
  meshes: ReactNode[];
  count: number;
};

const Clump = ({ meshes = [], count = 40 }: ClumpProps) => {
  const rigidBodiesRef = useRef<RapierRigidBody[] | null>(null);

  const instances = useMemo(() => {
    return Array.from({ length: count }, () => ({
      meshIndex: Math.floor(Math.random() * meshes.length),
      position: vec3(
        MathUtils.randFloatSpread(1),
        MathUtils.randFloatSpread(1),
        MathUtils.randFloatSpread(1)
      ),
      rotation: vec3(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      ),
      scale: vec3(1, 1, 1),
    }));
  }, [count, meshes.length]);

  useFrame(() => {
    if (!rigidBodiesRef.current) return;
    rigidBodiesRef.current.forEach((body) => {
      if (!body) return;
      const pos = body.translation();
      const force = new Vector3(-pos.x, -pos.y, -pos.z)
        .normalize()
        .multiplyScalar(2);
      body.applyImpulse({ x: force.x, y: force.y, z: force.z }, true);
    });
  });

  return (
    <>
      {instances.map((instance, i) => (
        <RigidBody
          key={i}
          position={instance.position}
          rotation={instance.rotation}
          linearDamping={4}
          angularDamping={10}
          colliders="hull"
          ref={(el) => {
            if (!el) return;
            if (!rigidBodiesRef.current) rigidBodiesRef.current = [];
            rigidBodiesRef.current[i] = el;
          }}
        >
          <group scale={instance.scale}>{meshes[instance.meshIndex]}</group>
        </RigidBody>
      ))}
    </>
  );
};

const Pointer = () => {
  const { viewport, pointer } = useThree();
  const ref = useRef<RapierRigidBody>(null);
  const [isReady, setIsReady] = useState(false);
  const firstPositionRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handler = () => {
      if (!firstPositionRef.current) {
        firstPositionRef.current = {
          x: (pointer.x * viewport.width) / 2,
          y: (pointer.y * viewport.height) / 2,
        };
        setIsReady(true);
      }
    };

    window.addEventListener("mousemove", handler, { once: true });
    return () => window.removeEventListener("mousemove", handler);
  }, [viewport, pointer]);

  useFrame(() => {
    if (!ref.current || !isReady) return;

    const x = (pointer.x * viewport.width) / 2;
    const y = (pointer.y * viewport.height) / 2;
    ref.current.setNextKinematicTranslation({ x, y, z: 0 });
  });

  if (!isReady || !firstPositionRef.current) return null;

  return (
    <RigidBody
      type="kinematicPosition"
      position={[firstPositionRef.current.x, firstPositionRef.current.y, 0]}
      colliders={false}
      ref={ref}
    >
      <Sphere scale={0.2}>
        <meshBasicMaterial color={[4, 4, 4]} toneMapped={false} />
      </Sphere>
      <BallCollider args={[2]} restitution={0.1} />
    </RigidBody>
  );
};

type SceneProps = {
  meshes?: ReactNode[];
  instanceCount?: number;
  backgroundColor?: string;
};

const Scene = ({
  meshes = [
    <Sphere args={[1]} key="sphere">
      <meshStandardMaterial color="lightgreen" />
    </Sphere>,
    <mesh key="box">
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="lightblue" />
    </mesh>,
    <mesh key="torus">
      <torusGeometry args={[1, 0.4, 16, 32]} />
      <meshStandardMaterial color="pink" />
    </mesh>,
  ],
  instanceCount = 40,
  backgroundColor = "#fafafa",
}: SceneProps) => {
  return (
    <Canvas
      style={{ cursor: "none", background: backgroundColor }}
      camera={{ position: [0, 0, 30], fov: 35 }}
    >
      <ambientLight intensity={0.5} />
      <color attach="background" args={[backgroundColor]} />
      <spotLight
        intensity={1}
        angle={0.2}
        penumbra={1}
        position={[30, 30, 30]}
        castShadow
        shadow-mapSize={[512, 512]}
      />
      <Environment
        background={false}
        files={"/hdri/photostudio.exr"}
        environmentIntensity={0.5}
      />
      <EffectComposer multisampling={0}>
        <N8AO
          halfRes
          color={backgroundColor}
          aoRadius={2}
          intensity={1}
          aoSamples={6}
          denoiseSamples={4}
        />
        <SMAA />
      </EffectComposer>
      <Physics gravity={[0, 1, 0]}>
        <Clump meshes={meshes} count={instanceCount} />
        <Pointer />
      </Physics>
    </Canvas>
  );
};

export default Scene;
