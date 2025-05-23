const DEVICE_MOUSE = "mouse";
const DEVICE_TOUCH = "touch";

type DeviceType = typeof DEVICE_MOUSE | typeof DEVICE_TOUCH;

function isClient(): boolean {
  return typeof window !== "undefined";
}

export function getDeviceType(): DeviceType {
  if (!isClient()) {
    return DEVICE_MOUSE;
  }

  const isMouse = window.matchMedia("(pointer: fine)").matches;

  return isMouse ? DEVICE_MOUSE : DEVICE_TOUCH;
}
