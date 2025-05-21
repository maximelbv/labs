import { OrbitControls, useHelper } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Leva, useControls } from "leva";
import { useState } from "react";
import { useRef } from "react";
import { DirectionalLightHelper } from "three";

const Light = () => {
  const { lightColor, lightIntensity } = useControls({
    lightColor: "white",
    lightIntensity: {
      value: 1,
      min: 0,
      max: 5,
    },
  });
  const directionalLightRef = useRef(null);
  useHelper(directionalLightRef, DirectionalLightHelper);

  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight
        color={lightColor}
        ref={directionalLightRef}
        intensity={lightIntensity}
        angle={0.2}
        penumbra={1}
        position={[1, 1, 1]}
        castShadow
        // shadow-mapSize={[256, 256]}
      />
    </>
  );
};

const Cube = ({ position, color, args }) => {
  const ref = useRef(null);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta;
      ref.current.rotation.y += delta * 2.0;
      // ref.current.position.z += Math.sin(state.clock.elapsedTime) * 2;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const Sphere = ({ position, color, hoveredColor, args }) => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const speed = isHovered ? 0.4 : 0.2;

  useFrame((state, delta) => {
    if (ref.current) {
      // ref.current.rotation.x += delta * 0.5;
      ref.current.rotation.y += delta * speed;
      // ref.current.position.y = 0 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  const handlePointerEnter = (e) => {
    e.stopPropagation();
    setIsHovered(true);
  };

  const handlePointerLeave = (e) => {
    setIsHovered(false);
  };

  return (
    <mesh
      ref={ref}
      position={position}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <sphereGeometry args={args} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const Plane = ({ position, args, color }) => {
  return (
    <mesh position={position}>
      <planeGeometry args={args} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const Basics = () => {
  return (
    <>
      <Leva />
      <Canvas
        gl={{ antialias: true }}
        camera={{ position: [4, 0, 2], fov: 100, near: 1, far: 40 }}
      >
        <color attach="background" args={["#242424"]} />
        <Light />
        <Sphere
          position={[0, 0, 0]}
          args={[1, 30, 30]}
          color={"orange"}
          hoveredColor={"blue"}
        />

        <OrbitControls />
      </Canvas>
    </>
  );
};

export default Basics;
