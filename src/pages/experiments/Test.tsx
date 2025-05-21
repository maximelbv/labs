import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import SceneRenderingSetup from "../../components/renderings/ClassicRenderingSetup";
import { useControls } from "leva";

const TestScene = () => {
  const { scene } = useGLTF("/models/test.glb");
  const { setup } = useControls({
    setup: true,
  });

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      shadows
      gl={{ antialias: true }}
    >
      {setup && <SceneRenderingSetup />}

      <primitive object={scene} />

      <OrbitControls />
    </Canvas>
  );
};

export default TestScene;
