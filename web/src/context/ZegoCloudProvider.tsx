"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import dynamic from "next/dynamic";

const ZegoEngineInitializer = dynamic(
  () => import("../lib/zegocloud").then((mod) => mod.ZegoEngineInitializer),
  { ssr: false }
);

interface ZegoEngineContextProps {
  zegoEngine: ZegoExpressEngine | null;
}

const ZegoEngineContext = createContext<ZegoEngineContextProps | undefined>(
  undefined
);

export const useZegoEngine = () => {
  const context = useContext(ZegoEngineContext);
  if (!context) {
    throw new Error("useZegoEngine must be used within a ZegoEngineProvider");
  }
  return context;
};

interface ZegoEngineProviderProps {
  children: ReactNode;
}

export const ZegoEngineProvider = ({ children }: ZegoEngineProviderProps) => {
  const [zegoEngine, setZegoEngine] = useState<ZegoExpressEngine | null>(null);

  return (
    <ZegoEngineContext.Provider value={{ zegoEngine }}>
      <ZegoEngineInitializer setZegoEngine={setZegoEngine} />
      {children}
    </ZegoEngineContext.Provider>
  );
};
