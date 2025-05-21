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
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import type { ReactNode } from "react";
import { useControls } from "leva";

const vec3 = (x = 0, y = 0, z = 0): [number, number, number] => [x, y, z];

type ClumpProps = {
  meshes: ReactNode[];
  count: number;
};

type SceneProps = {
  meshes?: ReactNode[];
  instanceCount?: number;
  backgroundColor?: string;
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
        .multiplyScalar(6);
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
          colliders="ball"
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
        <meshBasicMaterial color={"black"} toneMapped={false} />
      </Sphere>
      <BallCollider args={[2]} restitution={0.1} />
    </RigidBody>
  );
};

const Scene = ({ backgroundColor = "#fff" }: SceneProps) => {
  const meshes = [
    <Sphere args={[1]} key="sphere-1">
      <meshLambertMaterial color="#ffa0a0" emissive="red" />
    </Sphere>,
  ];
  const { instances } = useControls({
    instances: { value: 40, min: 1, max: 500 },
  });

  return (
    <Canvas
      style={{ cursor: "none", background: backgroundColor }}
      camera={{ position: [0, 0, 30], fov: 40 }}
      shadows
      gl={{ alpha: true, stencil: false, depth: false, antialias: false }}
      onCreated={(state) => (state.gl.toneMappingExposure = 1.5)}
    >
      <color attach="background" args={[backgroundColor]} />
      <ambientLight intensity={1} />
      <spotLight
        position={[20, 20, 25]}
        penumbra={1}
        angle={0.2}
        color="white"
        castShadow
        shadow-mapSize={[512, 512]}
      />
      <directionalLight position={[0, 5, -4]} intensity={4} />
      <Environment files="/hdri/adamsbridge.hdr" />
      <EffectComposer>
        <N8AO color="black" aoRadius={2} intensity={1.15} />
      </EffectComposer>
      <Physics gravity={[0, 1, 0]}>
        <Clump meshes={meshes} count={instances} />
        <Pointer />
      </Physics>
    </Canvas>
  );
};

export default Scene;
