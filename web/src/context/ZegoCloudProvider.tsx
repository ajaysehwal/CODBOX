"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";

const AppId = process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID;
const Server = process.env.NEXT_PUBLIC_ZEGOCLOUD_SERVER as string;

interface ZegoEngineContextProps {
  zegoEngine: ZegoExpressEngine | null;
}

const ZegoEngineContext = createContext<ZegoEngineContextProps | undefined>(undefined);

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

  useEffect(() => {
    const zg = new ZegoExpressEngine(Number(AppId), Server);
    setZegoEngine(zg);
    zg.on("roomStreamUpdate", async (roomID, updateType, streamList) => {
      if (updateType === "ADD") {
        const remoteStream = await zg.startPlayingStream(
          streamList[0].streamID
        );
        const remoteVideo = document.createElement("video");
        remoteVideo.srcObject = remoteStream;
        remoteVideo.play();
      }
    });
  }, []);

  return (
    <ZegoEngineContext.Provider value={{ zegoEngine }}>
      {children}
    </ZegoEngineContext.Provider>
  );
};
