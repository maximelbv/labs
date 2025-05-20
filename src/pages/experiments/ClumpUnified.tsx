import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Physics,
  RigidBody,
  BallCollider,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useRef, useMemo, useEffect, type ReactNode } from "react";
import { Environment, useGLTF, Sphere, Clone } from "@react-three/drei";
import { Vector3, MathUtils, Mesh, Object3D } from "three";
import { EffectComposer, N8AO, SMAA } from "@react-three/postprocessing";
import type { Vector3Tuple } from "three";

const vec3 = (): Vector3Tuple => [
  MathUtils.randFloatSpread(1),
  MathUtils.randFloatSpread(1),
  MathUtils.randFloatSpread(1),
];

const rot3 = (): Vector3Tuple => [
  Math.random() * Math.PI * 2,
  Math.random() * Math.PI * 2,
  Math.random() * Math.PI * 2,
];

type ModelConfig = { url: string; scale: number | Vector3Tuple };
type SceneProps = {
  modelConfigs?: ModelConfig[];
  meshes?: ReactNode[];
  instanceCount?: number;
  backgroundColor?: string;
  hdriUrl?: string;
  hdriIntensity?: number;
};

const Clump = ({
  modelConfigs,
  meshes,
  count,
}: {
  modelConfigs?: ModelConfig[];
  meshes?: ReactNode[];
  count: number;
}) => {
  const bodies = useRef<RapierRigidBody[]>([]);

  const instances = useMemo(
    () =>
      Array.from({ length: count }, () => {
        const model = modelConfigs?.length
          ? modelConfigs[Math.floor(Math.random() * modelConfigs.length)]
          : null;
        const meshIndex = meshes?.length
          ? Math.floor(Math.random() * meshes.length)
          : 0;

        return {
          url: model?.url ?? null,
          scale: model
            ? Array.isArray(model.scale)
              ? model.scale
              : ([model.scale, model.scale, model.scale] as Vector3Tuple)
            : ([1, 1, 1] as Vector3Tuple),
          position: vec3(),
          rotation: rot3(),
          meshIndex,
        };
      }),
    [count, modelConfigs, meshes]
  );

  useEffect(() => {
    modelConfigs?.forEach((m) => m.url && useGLTF.preload(m.url));
  }, [modelConfigs]);

  useFrame(() => {
    bodies.current.forEach((body) => {
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
      {instances.map((inst, i) => (
        <RigidBody
          key={i}
          ref={(ref) => {
            if (ref) bodies.current[i] = ref;
          }}
          position={inst.position}
          rotation={inst.rotation}
          linearDamping={4}
          angularDamping={10}
          colliders="hull"
        >
          {inst.url ? (
            <Clone object={useGLTF(inst.url).scene} scale={inst.scale} />
          ) : meshes ? (
            <group scale={inst.scale}>{meshes[inst.meshIndex]}</group>
          ) : (
            <Sphere args={[1]}>
              <meshStandardMaterial color="lightgreen" />
            </Sphere>
          )}
        </RigidBody>
      ))}
    </>
  );
};

const Pointer = () => {
  const { viewport } = useThree();
  const ref = useRef<RapierRigidBody>(null);
  const ready = useRef(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!ref.current) return;
      const x =
        (((e.clientX / window.innerWidth) * 2 - 1) * viewport.width) / 2;
      const y =
        ((-(e.clientY / window.innerHeight) * 2 + 1) * viewport.height) / 2;
      ref.current.setTranslation({ x, y, z: 0 }, true);
      ready.current = true;
      window.removeEventListener("mousemove", move);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [viewport]);

  useFrame(({ pointer }) => {
    if (!ref.current || !ready.current) return;
    ref.current.setNextKinematicTranslation({
      x: (pointer.x * viewport.width) / 2,
      y: (pointer.y * viewport.height) / 2,
      z: 0,
    });
  });

  return (
    <RigidBody type="kinematicPosition" ref={ref} colliders={false}>
      <Sphere scale={0.2}>
        <meshBasicMaterial color={[4, 4, 4]} toneMapped={false} />
      </Sphere>
      <BallCollider args={[2]} restitution={0.1} />
    </RigidBody>
  );
};

const UnifiedClumpScene = ({
  modelConfigs,
  meshes,
  instanceCount = 40,
  backgroundColor = "#f1f1f1",
  hdriUrl = "/hdri/photostudio.exr",
  hdriIntensity = 0.4,
}: SceneProps) => {
  return (
    <Canvas
      style={{ cursor: "none" }}
      camera={{ position: [0, 0, 30], fov: 35 }}
      shadows
    >
      <color attach="background" args={[backgroundColor]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {hdriUrl && (
        <Environment
          background={false}
          files={hdriUrl}
          environmentIntensity={hdriIntensity}
        />
      )}
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
        <Clump
          modelConfigs={modelConfigs}
          meshes={meshes}
          count={instanceCount}
        />
        <Pointer />
      </Physics>
    </Canvas>
  );
};

export default UnifiedClumpScene;
