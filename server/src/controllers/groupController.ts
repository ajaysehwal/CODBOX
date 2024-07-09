import { Socket } from "socket.io";
import { redis } from "../config/redis";
import { AudioCall } from "./audioCall";
export class GroupsManager {
  private Audio: AudioCall;
  constructor(public socket: Socket) {
    this.Audio = new AudioCall(this.socket);
    this.init();
  }
  init() {
    this.createGroup();
    this.joinGroup();
    this.leaveGroup();
    this.closeGroup();
    this.validateGroup();
    this.onDisconnect();
  }
  private validateGroup() {
    this.socket.on("IsGroupValid", async (groupId) => {
      const isGroupValid = await redis.exists(`group:${groupId}`);
      this.socket.emit("IsGroupValid", isGroupValid === 1);
    });
  }
  createGroup() {
    this.socket.on("createGroup", async (groupId: string, user, callback) => {
      try {
        this.socket.join(groupId);
        const groupsExists = await redis.exists(`group:${groupId}`);
        if (!groupsExists) {
          const created = await redis.hmset(`group:${groupId}`, {
            members: JSON.stringify([]),
            messages: JSON.stringify([]),
            source_code: "//Start type your code..",
            created_at: new Date().toISOString(),
            membersInfo: JSON.stringify([user]),
          });
          const AudioToken = this.Audio.generateAudioToken(user.uid, groupId);
          if (created === "OK") {
            callback({
              success: true,
              AudioToken,
            });
          }
        }
      } catch (error) {
        callback({
          success: false,
          error: "Failed to create group",
          AudioToken: "",
        });
      }
    });
  }
  joinGroup() {
    this.socket.on("joinGroup", async (groupId: string, user, callback) => {
      const groupExists = await redis.exists(`group:${groupId}`);
      if (!groupExists) {
        return callback({
          success: false,
          error: `Group ${groupId} does not exist`,
          AudioToken: "",
        });
      }
      await redis.sadd(`group:${groupId}:members`, this.socket.id);
      this.socket.join(groupId);
      callback({
        success: true,
        AudioToken: this.Audio.generateAudioToken(user.uid, groupId),
      });
    });
  }
  leaveGroup() {
    this.socket.on("leaveGroup", async (groupId: string, callback) => {
      const groupExists = await redis.exists(`group:${groupId}`);
      if (groupExists) {
        await this.socket.leave(groupId);
        await redis.srem(`group:${groupId}:members`, this.socket.id);
        callback({ success: true });
      } else {
        callback({ success: false, error: `Group ${groupId} does not exist` });
      }
    });
  }
  closeGroup() {
    this.socket.on("closeGroup", async (groupId: string, callback) => {
      const groupExists = await redis.exists(`group:${groupId}`);
      if (groupExists) {
        await redis.del(`group:${groupId}`);
        await redis.del(`group:${groupId}:members`);
        callback({ success: true });
      } else {
        callback({ success: false, error: `Group ${groupId} does not exist` });
      }
    });
  }
  onDisconnect() {
    this.socket.on("disconnect", async () => {
      try {
        const groupIds = await redis.keys(`group:*:members`);
        for (const groupId of groupIds) {
          const isMember = await redis.sismember(groupId, this.socket.id);
          if (isMember) {
            await redis.srem(groupId, this.socket.id);
          }
        }
      } catch (error) {
        throw new Error(JSON.stringify(error));
      }
    });
  }
}
