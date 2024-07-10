import { generateToken04 } from "../utils/zegoServerAssistant";
export class AudioCall {
  private AppId = process.env.ZEGOCLOUD_APP_ID as unknown as number;
  private Server = process.env.ZEGOCLOUD_SERVER as string;
  private effectiveTimeInSeconds = 3600;
  generateAudioToken(user_id: string, groupId: string) {
    return generateToken04(
      Number(this.AppId),
      user_id,
      this.Server,
      this.effectiveTimeInSeconds,
      this.payload(groupId)
    );
  }
  private payload(groupId: string) {
    return JSON.stringify({
      room_id: groupId,
      privilege: {
        1: 1,
        2: 0,
      },
      stream_id_list: null,
    });
  }
}
