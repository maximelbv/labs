import { Box, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";

const PhysicsComponent = () => {
  const BouncingCube = ({
    position,
    color = "royalblue",
    restitution = 2,
    gravityScale = 1,
  }) => {
    return (
      <RigidBody restitution={restitution} gravityScale={gravityScale}>
        <Box position={position}>
          <meshStandardMaterial color={color} />
        </Box>
      </RigidBody>
    );
  };

  return (
    <Canvas shadows camera={{ position: [16, 16, 16], fov: 30 }}>
      <color attach="background" args={["#ececec"]} />
      <Physics>
        <ambientLight intensity={1.5} />
        <directionalLight position={[-10, 10, 0]} intensity={1} />
        <OrbitControls />
        <BouncingCube position={[2, 2, 0]} />
        <BouncingCube position={[1, 3, 0]} />
        <BouncingCube position={[0, 4, 0]} />
        <BouncingCube position={[-1, 5, 0]} />
        <BouncingCube position={[-2, 6, 0]} />
        <RigidBody type="fixed">
          <Box position={[0, 0, 0]} args={[10, 1, 10]}>
            <meshStandardMaterial color="springgreen" />
          </Box>
        </RigidBody>
      </Physics>
    </Canvas>
  );
};

export default PhysicsComponent;
