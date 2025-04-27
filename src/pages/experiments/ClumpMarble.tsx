import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Physics,
  InstancedRigidBodies,
  RigidBody,
  type RapierRigidBody,
  BallCollider,
} from "@react-three/rapier";
import { useEffect, useMemo, useRef } from "react";
import { Environment, Sphere, useTexture } from "@react-three/drei";
import { MathUtils, Vector3 } from "three";
import { EffectComposer, N8AO } from "@react-three/postprocessing";

const vec3 = (x = 0, y = 0, z = 0): [number, number, number] => [x, y, z];

const Clump = () => {
  // const [
  //   aoMap,
  //   colorMap,
  //   displacementMap,
  //   normalMap,
  //   roughnessMap
  // ] = useTexture([
  //   '/textures/snow/Snow007C_2K-JPG_AmbientOcclusion.jpg',
  //   '/textures/snow/Snow007C_2K-JPG_Color.jpg',
  //   '/textures/snow/Snow007C_2K-JPG_Displacement.jpg',
  //   '/textures/snow/Snow007C_2K-JPG_NormalGL.jpg',
  //   '/textures/snow/Snow007C_2K-JPG_Roughness.jpg'
  // ])

  const [colorMap, displacementMap, normalMap, roughnessMap] = useTexture([
    "/textures/marble/Onyx006_2K-JPG_Color.jpg",
    "/textures/marble/Onyx006_2K-JPG_Displacement.jpg",
    "/textures/marble/Onyx006_2K-JPG_NormalGL.jpg",
    "/textures/marble/Onyx006_2K-JPG_Roughness.jpg",
  ]);

  const rigidBodiesRef = useRef<RapierRigidBody[]>(null);

  const instances = useMemo(() => {
    return Array.from({ length: 40 }, () => ({
      key: Math.random(),
      position: vec3(
        MathUtils.randFloatSpread(1),
        MathUtils.randFloatSpread(1),
        MathUtils.randFloatSpread(1)
      ),
      rotation: vec3(0, 0, 0),
      scale: vec3(1, 1, 1),
    }));
  }, []);

  useFrame(() => {
    if (!rigidBodiesRef.current) return;
    rigidBodiesRef.current.forEach((body) => {
      const position = body.translation();
      const force = new Vector3(
        -position.x,
        -position.y,
        -position.z
      ).multiplyScalar(0.5);
      body.applyImpulse({ x: force.x, y: force.y, z: force.z }, true);
    });
  });

  return (
    <InstancedRigidBodies
      ref={rigidBodiesRef}
      instances={instances}
      linearDamping={4}
      angularDamping={10}
      colliders="ball"
    >
      <instancedMesh
        args={[undefined, undefined, 40]}
        castShadow
        receiveShadow
        onUpdate={(self) => {
          self.geometry.setAttribute("uv2", self.geometry.attributes.uv);
        }}
      >
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={colorMap}
          displacementMap={displacementMap}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
          metalness={0.5}
          roughness={0.3}
          displacementScale={0.05}
        />
      </instancedMesh>
    </InstancedRigidBodies>
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

const Scene = () => {
  return (
    <Canvas
      style={{ cursor: "none" }}
      camera={{ position: [0, 0, 30], fov: 35 }}
    >
      {/* <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      /> */}
      <Environment files="/hdri/photostudio.exr" environmentIntensity={0.5} />
      <EffectComposer multisampling={0}>
        <N8AO
          halfRes
          color="black"
          aoRadius={2}
          intensity={1}
          aoSamples={6}
          denoiseSamples={4}
        />
      </EffectComposer>
      <Physics gravity={[0, 1, 0]}>
        <Clump />
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
