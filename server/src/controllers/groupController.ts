import { Socket } from "socket.io";
import { Message } from "./messageController";
import { SocketProvider } from "../socket";
import { redis } from "../config/redis";
type Group = {
  members: Set<string>;
  messages: Message[];
};

export class GroupsManager {
  public static groups = new Map<string, Group>();
  constructor(public socket: Socket) {
    this.init();
  }
  init() {
    this.createGroup();
    this.joinGroup();
    this.leaveGroup();
    this.closeGroup();
    this.validateGroup();
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
      console.log("check",groupExists);
      if (groupExists) {
        await redis.sadd(`group:${groupId}:members`, this.socket.id);
        console.log(`User ${this.socket.id} joined group ${groupId}`);
        callback({ success: true });
      } else {
        callback({ success: false, error: `Group ${groupId} does not exist` });
      }
    });
  }
  leaveGroup() {
    this.socket.on("leaveGroup", async (groupId: string, callback) => {
      const groupExists = await redis.exists(`group:${groupId}`);
      if (groupExists) {
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
}
