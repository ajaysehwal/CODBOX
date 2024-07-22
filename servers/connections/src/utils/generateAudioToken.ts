import { generateToken04 } from "./zegoServerAssistant";
const appId = process.env.ZEGOCLOUD_APP_ID as unknown as number;
const server = process.env.ZEGOCLOUD_SERVER as string;
const effectiveTimeInSeconds = 3600;
export const generateAudioToken = (user_id: string, groupId: string) => {
  return generateToken04(
    Number(appId),
    user_id,
    server,
    effectiveTimeInSeconds,
    payload(groupId)
  );
};
const payload = (groupId: string) => {
  return JSON.stringify({
    room_id: groupId,
    privilege: {
      1: 1,
      2: 0,
    },
    stream_id_list: null,
  });
};
