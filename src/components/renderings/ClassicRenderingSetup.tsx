import { Environment } from "@react-three/drei";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import { useControls } from "leva";

const ClassicRenderingSetup = ({
  hdri = "/hdri/adamsbridge.hdr",
  backgroundColor = "#ffffff",
}: {
  hdri?: string;
  backgroundColor?: string;
}) => {
  const { ambient, directional, env, postProcess } = useControls(
    "Lights",
    {
      ambient: true,
      directional: true,
      env: true,
      postProcess: true,
    },
    { collapsed: true }
  );

  return (
    <>
      <color attach="background" args={[backgroundColor]} />
      {ambient && <ambientLight intensity={1} />}
      {directional && <directionalLight position={[0, 5, -4]} intensity={4} />}
      {env && <Environment files={hdri} />}
      {postProcess && (
        <EffectComposer>
          <N8AO color="black" aoRadius={2} intensity={1.15} />
        </EffectComposer>
      )}
    </>
  );
};

export default ClassicRenderingSetup;
