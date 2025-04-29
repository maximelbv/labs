import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Physics,
  RigidBody,
  type RapierRigidBody,
  BallCollider,
} from "@react-three/rapier";
import { useEffect, useMemo, useRef } from "react";
import { Environment, Sphere, useGLTF, Clone } from "@react-three/drei";
import { MathUtils, Mesh, Vector3 } from "three";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import type { Vector3Tuple } from "three";

type ModelInstanceProps = {
  url: string;
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  scale: Vector3Tuple;
};

const ModelInstance = ({
  url,
  position,
  rotation,
  scale,
}: ModelInstanceProps) => {
  const { scene } = useGLTF(url);

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <Clone
      object={scene}
      scale={scale}
      position={position}
      rotation={rotation}
    />
  );
};

type ModelRigidBodyProps = {
  url: string;
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  scale: Vector3Tuple;
};

const ModelRigidBody = ({
  url,
  position,
  rotation,
  scale,
}: ModelRigidBodyProps) => {
  const ref = useRef<RapierRigidBody | null>(null);

  useFrame(() => {
    if (!ref.current) return;
    const currentPos = ref.current.translation();
    const force = new Vector3(
      -currentPos.x,
      -currentPos.y,
      -currentPos.z
    ).multiplyScalar(0.5);
    ref.current.applyImpulse({ x: force.x, y: force.y, z: force.z }, true);
  });

  return (
    <RigidBody
      ref={ref}
      position={position}
      linearDamping={4}
      angularDamping={10}
      colliders="hull"
    >
      <ModelInstance
        url={url}
        position={[0, 0, 0]}
        rotation={rotation}
        scale={scale}
      />
    </RigidBody>
  );
};

type ModelConfig = {
  url: string;
  scale: number | Vector3Tuple;
};

type ClumpProps = {
  modelConfigs: ModelConfig[];
  count: number;
};

const Clump = ({ modelConfigs = [], count = 40 }: ClumpProps) => {
  const instances = useMemo(() => {
    return Array.from({ length: count }, () => {
      const config =
        modelConfigs[Math.floor(Math.random() * modelConfigs.length)];
      return {
        modelUrl: config.url,
        scale: Array.isArray(config.scale)
          ? config.scale
          : ([config.scale, config.scale, config.scale] as Vector3Tuple),
        position: [
          MathUtils.randFloatSpread(1),
          MathUtils.randFloatSpread(1),
          MathUtils.randFloatSpread(1),
        ] as Vector3Tuple,
        rotation: [
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
        ] as Vector3Tuple,
      };
    });
  }, [count, modelConfigs]);

  if (modelConfigs.length === 0) {
    return (
      <>
        {instances.map((instance, i) => (
          <RigidBody
            key={i}
            position={instance.position}
            linearDamping={4}
            angularDamping={10}
            colliders="hull"
          >
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[1, 32, 32]} />
              <meshStandardMaterial
                color="lightgreen"
                roughness={0.2}
                envMapIntensity={1}
              />
            </mesh>
          </RigidBody>
        ))}
      </>
    );
  }

  return (
    <>
      {instances.map((instance, i) => (
        <ModelRigidBody
          key={i}
          url={instance.modelUrl}
          position={instance.position}
          rotation={instance.rotation}
          scale={instance.scale}
        />
      ))}
    </>
  );
};

const Pointer = () => {
  const { viewport } = useThree();
  const ref = useRef<RapierRigidBody | null>(null);
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

type SceneProps = {
  modelConfigs?: ModelConfig[];
  instanceCount?: number;
  backgroundColor?: string;
  hdriUrl?: string;
  hdriIntensity?: number;
};

const Scene = ({
  // modelConfigs = [
  //   { url: "/models/brainrot/ambalabu.glb", scale: 1 },
  //   { url: "/models/brainrot/bananini.glb", scale: 1 },
  //   { url: "/models/brainrot/bombardiro.glb", scale: 0.5 },
  //   { url: "/models/brainrot/patapim.glb", scale: 0.1 },
  //   { url: "/models/brainrot/sahur.glb", scale: 0.2 },
  //   { url: "/models/brainrot/tralala.glb", scale: 0.2 },
  // ],
  modelConfigs = [
    { url: "/models/frog.glb", scale: 10 },
    { url: "/models/maximelbv-logo.glb", scale: 2 },
  ],
  instanceCount = 40,
  backgroundColor = "#f1f1f1",
  hdriUrl = "/hdri/photostudio.exr",
  hdriIntensity = 0.4,
}: SceneProps) => {
  useEffect(() => {
    modelConfigs.forEach((config) => {
      if (config.url) {
        useGLTF.preload(config.url);
      }
    });
  }, [modelConfigs]);

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
        shadow-bias={-0.0001}
      />
      {hdriUrl && (
        <Environment
          background={false}
          files={hdriUrl}
          environmentIntensity={hdriIntensity}
        />
      )}
      <EffectComposer multisampling={0} renderPriority={1} autoClear={false}>
        <N8AO
          halfRes
          color={backgroundColor}
          aoRadius={2}
          intensity={1}
          aoSamples={6}
          denoiseSamples={4}
        />
      </EffectComposer>
      <Physics gravity={[0, 1, 0]}>
        <Clump modelConfigs={modelConfigs} count={instanceCount} />
        <Pointer />
      </Physics>
    </Canvas>
  );
};

export default Scene;
