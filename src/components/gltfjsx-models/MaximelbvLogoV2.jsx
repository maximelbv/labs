import React from "react";
import { useGLTF } from "@react-three/drei";

export function MaximelbvLogoModelV2(props) {
  const { nodes, materials } = useGLTF("models/maximelbv-logo-v2.glb");

  materials["Material.001"].metalness = 1;
  materials["Material.001"].roughness = 0.3;

  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.Curve.geometry}
        material={materials["Material.001"]}
        position={[-0.121, -0.062, 0]}
        rotation={[Math.PI / 2, 0, Math.PI]}
        scale={[100, 67.272, 100]}
      />
    </group>
  );
}

useGLTF.preload("/maximelbv-logo-v2.glb");
