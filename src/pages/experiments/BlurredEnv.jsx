import { MaximelbvLogoModelV2 } from "../../components/gltfjsx-models/MaximelbvLogoV2";
import OxSetup from "../../components/renderings/OxSetup";

const BlurredEnv = () => {
  return (
    <OxSetup>
      <MaximelbvLogoModelV2 />
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
