"use client";

import { Dispatch, SetStateAction, useEffect } from "react";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";

const AppId = process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID;
const Server = process.env.NEXT_PUBLIC_ZEGOCLOUD_SERVER as string;

export function ZegoEngineInitializer({
  setZegoEngine,
}: {
  setZegoEngine: Dispatch<SetStateAction<ZegoExpressEngine | null>>;
}) {
  useEffect(() => {
    const zg = new ZegoExpressEngine(Number(AppId), Server);
    setZegoEngine(zg);

    const handleRoomStreamUpdate = async (
      roomID: string,
      updateType: string,
      streamList: any[]
    ) => {
      if (updateType === "ADD") {
        const remoteStream = await zg.startPlayingStream(
          streamList[0].streamID
        );
        const remoteVideo = document.createElement("video");
        remoteVideo.srcObject = remoteStream;
        remoteVideo.play();
      }
    };

    zg.on("roomStreamUpdate", handleRoomStreamUpdate);

    return () => {
      zg.off("roomStreamUpdate", handleRoomStreamUpdate);
    };
  }, [setZegoEngine]);

  return null;
}
