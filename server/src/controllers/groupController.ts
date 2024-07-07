import { Socket } from "socket.io";
import { SocketProvider } from "../socket";
import { redis } from "../config/redis";

export class GroupsManager {
  constructor(public socket: Socket) {
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
  private handleError(errorMessage: string) {
    this.socket.emit("error", errorMessage);
  }
  private isUserOffline() {
    this.socket.on("IsUserOffline", (userId) => {
      if (SocketProvider.users.has(userId)) {
        this.socket.emit("IsUserOffline", false);
      } else {
        this.socket.emit("IsUserOffline", true);
      }
    });
  }
  private validateGroup() {
    this.socket.on("IsGroupValid", async (groupId) => {
      const isGroupValid = await redis.exists(`group:${groupId}`);
      this.socket.emit("IsGroupValid", isGroupValid === 1);
    });
  }
  createGroup() {
    this.socket.on("createGroup", async (groupId: string, callback) => {
      try {
        this.socket.join(groupId);
        const groupsExists = await redis.exists(`group:${groupId}`);
        if (!groupsExists) {
          const created = await redis.hmset(`group:${groupId}`, {
            members: JSON.stringify([this.socket.id]),
            messages: JSON.stringify([]),
            source_code: "//Start type your code..",
            created_at: new Date().toISOString(),
            membersInfo: [],
          });
          if (created === "OK") {
            callback({ success: true });
          }
          console.log("Current groups:", created);
        }
      } catch (error) {
        callback({ success: false, error: "Failed to create group" });
      }
    });
  }
  joinGroup() {
    this.socket.on("joinGroup", async (groupId: string, callback) => {
      const groupExists = await redis.exists(`group:${groupId}`);
      if (!groupExists) {
        return callback({
          success: false,
          error: `Group ${groupId} does not exist`,
        });
      }
      await redis.sadd(`group:${groupId}:members`, this.socket.id);
      this.socket.join(groupId);
      console.log(`User ${this.socket.id} joined group ${groupId}`);
      callback({ success: true, id: this.socket.id });
    });
  }
  leaveGroup() {
    this.socket.on("leaveGroup", async (groupId: string, callback) => {
      const groupExists = await redis.exists(`group:${groupId}`);
      if (groupExists) {
        await this.socket.leave(groupId);
        await redis.srem(`group:${groupId}:members`, this.socket.id);
        callback({ success: true });
        console.log(`User ${this.socket.id} left group ${groupId}`);
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
            console.log(`User ${this.socket.id} removed from ${groupId}`);
          }
        }
      } catch (error) {
        console.error(
          `Error while removing user ${this.socket.id} on disconnect:`,
          error
        );
      }
    });
  }
}
