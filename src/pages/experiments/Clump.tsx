import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  Physics,
  RigidBody,
  type RapierRigidBody,
  BallCollider,
} from "@react-three/rapier";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sphere } from "@react-three/drei";
import { MathUtils, TextureLoader, Vector3 } from "three";
import { EffectComposer, SMAA } from "@react-three/postprocessing";
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
  instanceCount = 40,
  backgroundColor = "#fff",
}: SceneProps) => {
  const overlay = useLoader(TextureLoader, "/textures/smile.png");
  const meshes = [
    <group key="sphere-1">
      <Sphere args={[1]}>
        <meshToonMaterial
          color="#8aff68"
          gradientMap={null}
          toneMapped={false}
        />
      </Sphere>
      <Sphere args={[1.001]}>
        <meshBasicMaterial map={overlay} transparent depthWrite={false} />
      </Sphere>
    </group>,

    <group key="sphere-2">
      <Sphere args={[1]}>
        <meshToonMaterial
          color="#68c5ff"
          gradientMap={null}
          toneMapped={false}
        />
      </Sphere>
      <Sphere args={[1.001]}>
        <meshBasicMaterial map={overlay} transparent depthWrite={false} />
      </Sphere>
    </group>,

    <group key="sphere-3">
      <Sphere args={[1]}>
        <meshToonMaterial
          color="#be88ff"
          gradientMap={null}
          toneMapped={false}
        />
      </Sphere>
      <Sphere args={[1.001]}>
        <meshBasicMaterial map={overlay} transparent depthWrite={false} />
      </Sphere>
    </group>,
  ];

  return (
    <Canvas
      style={{ cursor: "none", background: backgroundColor }}
      camera={{ position: [0, 0, 30], fov: 35 }}
      shadows
    >
      <color attach="background" args={[backgroundColor]} />
      <ambientLight intensity={1.2} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />
      <directionalLight
        position={[-10, 5, 10]}
        intensity={0.6}
        color="#c0d9ff"
      />
      <directionalLight
        position={[0, -10, -10]}
        intensity={0.4}
        color="#ffffff"
      />
      <EffectComposer>
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
