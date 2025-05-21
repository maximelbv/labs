import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Physics,
  RigidBody,
  type RapierRigidBody,
  BallCollider,
} from "@react-three/rapier";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sphere, Box, Torus } from "@react-three/drei";
import { MathUtils, Vector3 } from "three";
import { useControls } from "leva";
import type { ReactNode } from "react";
import ClassicRenderingSetup from "../../components/renderings/ClassicRenderingSetup";

const vec3 = (x = 0, y = 0, z = 0): [number, number, number] => [x, y, z];

type SceneProps = {
  backgroundColor?: string;
};

const getMesh = (shape: string, color: string, emissive: string): ReactNode => {
  const material = <meshLambertMaterial color={color} emissive={emissive} />;
  switch (shape) {
    case "sphere":
      return <Sphere args={[1]}>{material}</Sphere>;
    case "box":
      return <Box args={[1.5, 1.5, 1.5]}>{material}</Box>;
    case "torus":
      return <Torus args={[1, 0.4, 16, 32]}>{material}</Torus>;
    default:
      return <Sphere args={[1]}>{material}</Sphere>;
  }
};

const Clump = ({
  mesh,
  count,
  force,
}: {
  mesh: ReactNode;
  count: number;
  force: number;
}) => {
  const rigidBodiesRef = useRef<RapierRigidBody[]>([]);
  const [instances, setInstances] = useState<
    {
      position: [number, number, number];
      rotation: [number, number, number];
      scale: [number, number, number];
    }[]
  >([]);

  useEffect(() => {
    setInstances((prev) => {
      if (count <= prev.length) return prev;
      const toAdd = count - prev.length;
      const newInstances = Array.from({ length: toAdd }, () => ({
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
      return [...prev, ...newInstances];
    });
  }, [count]);

  useFrame(() => {
    rigidBodiesRef.current.forEach((body) => {
      const pos = body.translation();
      const f = new Vector3(-pos.x, -pos.y, -pos.z).multiplyScalar(force);
      body.applyImpulse({ x: f.x, y: f.y, z: f.z }, true);
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
            if (el) rigidBodiesRef.current[i] = el;
          }}
        >
          <group scale={instance.scale}>{mesh}</group>
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
        <meshBasicMaterial color="black" toneMapped={false} />
      </Sphere>
      <BallCollider args={[2]} restitution={0.1} />
    </RigidBody>
  );
};

const Scene = ({ backgroundColor = "#fff" }: SceneProps) => {
  const controls = useControls({
    instanceCount: { value: 40, min: 40, max: 300, step: 1 },
    force: { value: 1, min: 0, max: 5 },
    shape: { options: ["sphere", "box", "torus"] },
    color: "#40b0ff",
    emissive: "#87b3ff",
  });

  const [clampedCount, setClampedCount] = useState(controls.instanceCount);

  useEffect(() => {
    if (controls.instanceCount > clampedCount) {
      setClampedCount(controls.instanceCount);
    }
  }, [controls.instanceCount, clampedCount]);

  const mesh = useMemo(
    () => getMesh(controls.shape, controls.color, controls.emissive),
    [controls.shape, controls.color, controls.emissive]
  );

  return (
    <Canvas
      style={{ cursor: "none", background: backgroundColor }}
      camera={{ position: [0, 0, 30], fov: 40 }}
      shadows
      gl={{ alpha: true, stencil: false, depth: false, antialias: false }}
      onCreated={(state) => (state.gl.toneMappingExposure = 1.5)}
    >
      <ClassicRenderingSetup />
      <Physics gravity={[0, 1, 0]}>
        <Clump mesh={mesh} count={clampedCount} force={controls.force} />
        <Pointer />
      </Physics>
    </Canvas>
  );
};

export default Scene;
