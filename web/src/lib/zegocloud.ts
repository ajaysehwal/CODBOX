"use client";
import { useEffect, useState } from "react";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";
const AppId = process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID;
const Server = process.env.NEXT_PUBLIC_ZEGOCLOUD_SERVER as string;
export const ZegoEngine = () => {
  const [zegoEngine,setZegoEngine]=useState<ZegoExpressEngine | null>(null);
  const appID = 1843547935;
  const zegoserver = "413a29ab68595d97b9f30beee5bee3fb";
  useEffect(() => {
    const zg = new ZegoExpressEngine(appID, zegoserver);
    setZegoEngine(zg);
    zg.on("roomStreamUpdate", async (roomID, updateType, streamList) => {
        if (updateType === "ADD") {
          const remoteStream = await zg.startPlayingStream(
            streamList[0].streamID
          );
          const remoteAudio = document.createElement("audio");
          remoteAudio.srcObject = remoteStream;
          remoteAudio.play();
        }
      });
  }, []);
  return zegoEngine;
};
