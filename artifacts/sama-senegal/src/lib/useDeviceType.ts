import { useState, useEffect } from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";

function computeDevice(): DeviceType {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export function useDeviceType(): DeviceType {
  const [device, setDevice] = useState<DeviceType>(computeDevice);

  useEffect(() => {
    const onResize = () => setDevice(computeDevice());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return device;
}
