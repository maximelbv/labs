import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Physics,
  RigidBody,
  type RapierRigidBody,
  BallCollider,
} from "@react-three/rapier";
import { useEffect, useMemo, useRef } from "react";
import { Environment, Sphere } from "@react-three/drei";
import { MathUtils, Vector3 } from "three";
import { EffectComposer, N8AO, SMAA } from "@react-three/postprocessing";

const vec3 = (x = 0, y = 0, z = 0): [number, number, number] => [x, y, z];

const Clump = ({ meshes = [], count = 40 }) => {
  const rigidBodiesRef = useRef<RapierRigidBody[]>(null);

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

const Scene = ({
  meshes = [
    <Sphere args={[1]}>
      <meshStandardMaterial color="lightgreen" />
    </Sphere>,
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="lightblue" />
    </mesh>,
    <mesh>
      <torusGeometry args={[1, 0.4, 16, 32]} />
      <meshStandardMaterial color="pink" />
    </mesh>,
  ],
  instanceCount = 40,
  backgroundColor = "#dfdfdf",
}) => {
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
      <Environment preset="sunset" />
      <EffectComposer multisampling={0}>
        <N8AO
          halfRes
          color="black"
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

// custom light
// model (model rendu)
// nombre d'objets
// taille des objets
// default position distance (valeurs des MathUtils.randFloatSpread dans le clump)
// force d'attraction (multiplyScalar(0.5))
// linearDamping
// angularDamping
// Collisions: (note: pour une collision representative du mesh,
// vous pouvez utiliser hull ou trimesh pour une collision plus precise, mais plus performante)
// curseur custom (true / false)
// portée de la collision du pointer
// camera props
// gravity props
// background color
// hdriUrl
// hdriIntensity
// style
