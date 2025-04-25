import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";

const PhysicsComponent = () => {
  return (
    <Canvas shadows camera={{ position: [3, 3, 3], fov: 30 }}>
      <color attach="background" args={["#ececec"]} />
      <Physics>
        <>
          <OrbitControls />
          <RigidBody>
            <mesh>
              <boxGeometry />
              <meshNormalMaterial />
            </mesh>
          </RigidBody>
        </>
      </Physics>
    </Canvas>
  );
};

export default PhysicsComponent;
