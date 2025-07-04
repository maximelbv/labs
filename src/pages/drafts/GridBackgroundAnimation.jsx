import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import ClassicRenderingSetup from "../../components/renderings/ClassicRenderingSetup";
import { Environment, OrbitControls } from "@react-three/drei";

const AnimatedBall = ({ position }) => {
  const meshRef = useRef();
  const speed = useRef(Math.random() * 2 + 1);
  const phase = useRef(Math.random() * Math.PI * 2);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      const s = 0.7 + Math.sin(t * speed.current + phase.current) * 0.3;
      meshRef.current.scale.set(s, s, s);
    }
  });

  const colors = ["#FEF6B5", "#ffd08e", "#ffa679", "#f67b77", "#e15383"];

  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.4, 32]} />
      <meshBasicMaterial
        color={colors[Math.floor(Math.random() * colors.length)]}
      />
    </mesh>
  );
};

// Grille de balles 10x10
const BallGrid = () => {
  const gridSize = 20;
  const spacing = 0.8;
  const balls = [];

  for (let x = 0; x < gridSize; x++) {
    for (let z = 0; z < gridSize; z++) {
      const posX = (x - gridSize / 2) * spacing;
      const posZ = (z - gridSize / 2) * spacing;
      balls.push(<AnimatedBall key={`${x}-${z}`} position={[posX, 0, posZ]} />);
    }
  }

  return <>{balls}</>;
};

// Caméra vue du dessus
const GridBackgroundAnimation = () => {
  return (
    <Canvas camera={{ position: [0, 8, 0], fov: 50 }}>
      <Environment
        resolution={1024}
        background
        backgroundBlurriness={1}
        environmentIntensity={1}
      >
        <ClassicRenderingSetup />
        <BallGrid />
        <OrbitControls />
      </Environment>
    </Canvas>
  );
};

export default GridBackgroundAnimation;
