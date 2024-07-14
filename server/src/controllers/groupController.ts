import { Socket } from "socket.io";
import { redis } from "../config/redis";
import { AudioCall } from "./audioCall";
export class GroupsManager {
  private Audio: AudioCall;
  constructor(public socket: Socket) {
    this.Audio = new AudioCall();
    this.init();
  }
  init() {
    this.createGroup();
    this.joinGroup();
    this.leaveGroup();
    this.closeGroup();
    this.validateGroup();
    this.onDisconnect();
    this.sendGroupDetails();
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
        if (!(await this.isGroupExist(groupId))) {
          const created = await redis.hmset(`group:${groupId}`, {
            members: JSON.stringify([]),
            messages: JSON.stringify([]),
            source_code: "//Start type your code..",
            created_at: new Date().toISOString(),
            membersInfo: JSON.stringify([]),
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
      try {
        if (!(await this.isGroupExist(groupId))) {
          return callback({
            success: false,
            error: `Group ${groupId} does not exist`,
            AudioToken: "",
          });
        }
        await redis.sadd(`group:${groupId}:members`, this.socket.id);
        const groupData = await redis.hgetall(`group:${groupId}`);
        const membersInfo = JSON.parse(groupData.membersInfo);
        const userExists = membersInfo.some(
          (member: any) => member.uid === user.uid
        );
        if (!userExists) {
          membersInfo.push(user);
          await redis.hset(
            `group:${groupId}`,
            "membersInfo",
            JSON.stringify(membersInfo)
          );
        }

        this.socket.join(groupId);
        const AudioToken = this.Audio.generateAudioToken(user.uid, groupId);
        callback({
          success: true,
          token: AudioToken,
        });
        // this.socket.emit("joined", groupId, user, AudioToken);
        this.socket.to(groupId).emit("joined", user);
      } catch (error) {
        callback({
          success: false,
          error: "Failed to join group",
        });
      }
    });
  }
  leaveGroup() {
    this.socket.on("leaveGroup", async (groupId: string, user, callback) => {
      try {
        if (await this.isGroupExist(groupId)) {
          await this.socket.leave(groupId);
          await redis.srem(`group:${groupId}:members`, this.socket.id);
          this.removeGroupMember(groupId, user.uid);
          this.socket.emit("leaved");
          this.socket.to(groupId).emit("userleaved", groupId, user.uid);
          callback({ success: true });
        } else {
          callback({
            success: false,
            error: `Group ${groupId} does not exist`,
          });
        }
      } catch (error) {
        callback({ success: false, error: "Failed to leave group" });
      }
    });
  }
  closeGroup() {
    this.socket.on("closeGroup", async (groupId: string, callback) => {
      if (await this.isGroupExist(groupId)) {
        await redis.del(`group:${groupId}`);
        await redis.del(`group:${groupId}:members`);
        callback({ success: true });
      } else {
        callback({ success: false, error: `Group ${groupId} does not exist` });
      }
    });
  }
  sendGroupDetails() {
    this.socket.on("getMembersList", async (groupId, callback) => {
      try {
        if (await this.isGroupExist(groupId)) {
          const groupData = await redis.hgetall(`group:${groupId}`);

          if (groupData && groupData.membersInfo) {
            const membersInfo = JSON.parse(groupData.membersInfo);
            callback({ success: true, members: membersInfo });
          } else {
            callback({ success: false, error: "No members info found" });
          }
        } else {
          callback({
            success: false,
            error: `Group ${groupId} does not exist`,
          });
        }
      } catch (error) {
        callback({ success: false, error: "Failed to retrieve members list" });
      }
    });
  }
  private async removeGroupMember(groupId: string, userId: string) {
    const groupData = await redis.hgetall(`group:${groupId}`);
    if (!groupData || !groupData.membersInfo) {
      console.log("No group data or membersInfo found for group:", groupId);
      return;
    }
    let membersInfo = JSON.parse(groupData.membersInfo);
    membersInfo = membersInfo.filter((member: any) => member.uid !== userId);
    await redis.hset(
      `group:${groupId}`,
      "membersInfo",
      JSON.stringify(membersInfo)
    );
  }
  onDisconnect() {
    this.socket.on("disconnect", async () => {
      try {
        const groupIds = await redis.keys(`group:*:members`);
        for (const groupId of groupIds) {
          const isMember = await redis.sismember(groupId, this.socket.id);
          console.log("not a member", isMember);
          if (isMember) {
            await redis.srem(groupId, this.socket.id);
            const userId = await redis.get(`socket:${this.socket.id}:user`);
            if (userId && groupId) {
              await this.removeGroupMember(groupId, userId);
              this.socket.to(groupId).emit("leaved", groupId, userId);
              await redis.del(`socket:${this.socket.id}:user`);
            }
          }
        }
        await redis.del(`socket:${this.socket.id}:user`);
      } catch (error) {
        throw new Error(JSON.stringify(error));
      }
    });
  }

  private async isGroupExist(groupId: string) {
    const groupExists = await redis.exists(`group:${groupId}`);
    return groupExists;
  }
}
