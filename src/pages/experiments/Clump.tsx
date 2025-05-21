import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Physics,
  RigidBody,
  type RapierRigidBody,
  BallCollider,
} from "@react-three/rapier";
import { useEffect, useMemo, useRef, useState } from "react";
import { Environment, Sphere, Box, Torus } from "@react-three/drei";
import { MathUtils, Vector3 } from "three";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import { useControls } from "leva";
import type { ReactNode } from "react";

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

  const instances = useMemo(() => {
    return Array.from({ length: count }, () => ({
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
  }, [count]);

  useFrame(() => {
    rigidBodiesRef.current.forEach((body) => {
      const pos = body.translation();
      const f = new Vector3(-pos.x, -pos.y, -pos.z)
        .normalize()
        .multiplyScalar(force);
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
          colliders="ball"
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
  const { instanceCount, force, shape, color, emissive } = useControls({
    instanceCount: { value: 40, min: 1, max: 200, step: 1 },
    force: { value: 6, min: 0, max: 20 },
    shape: { options: ["sphere", "box", "torus"] },
    color: "#40b0ff",
    emissive: "#87b3ff",
  });

  const mesh = useMemo(
    () => getMesh(shape, color, emissive),
    [shape, color, emissive]
  );

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
        intensity={2}
      />
      <directionalLight position={[0, 5, -4]} intensity={4} />
      <Environment files="/hdri/adamsbridge.hdr" />
      <EffectComposer>
        <N8AO color="black" aoRadius={2} intensity={1.15} />
      </EffectComposer>
      <Physics gravity={[0, 1, 0]}>
        <Clump mesh={mesh} count={instanceCount} force={force} />
        <Pointer />
      </Physics>
    </Canvas>
  );
};

export default Scene;
