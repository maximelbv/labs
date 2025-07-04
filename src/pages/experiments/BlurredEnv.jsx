import { MotoModel } from "../../components/gltfjsx-models/Moto";
import OxSetup from "../../components/renderings/OxSetup";

const BlurredEnv = () => {
  return (
    <OxSetup>
      <MotoModel />
    </OxSetup>
  );
};

export const meta = {
  title: "Blurred Env",
  category: "Three.js",
  cover: "experimentsPreviews/blurred-env.png",
  date: "2025-04-07",
};

export default BlurredEnv;
