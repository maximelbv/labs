export const mapExperimentFileNameToUrl = (filename: string): string => {
  return filename
    .replace("./pages/experiments/", "")
    .replace(".tsx", "")
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "");
};
