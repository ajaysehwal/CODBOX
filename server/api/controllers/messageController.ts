import { Server, Socket } from "socket.io";
import { redis, pub } from "../config/redis";
export type Message = {
  id: string;
  name: string;
  text: string;
  uuid: string;
  timestamp: Date;
  email: string;
};
export class MessagesMananger {
  constructor(public socket: Socket, public io: Server) {
    this.init();
  }
  init() {
    this.sendMessage();
    this.receiveMessage();
    this.getMessages();
  }
  sendMessage() {
    this.socket.on("sendMessage", async (groupId: string, message: Message) => {
      const groupsExists = await redis.exists(`group:${groupId}`);
      if (groupsExists) {
        await redis.lpush(`group:${groupId}:messages`, JSON.stringify(message));
        await pub.publish(`group:${groupId}`, JSON.stringify(message));
        this.socket.emit("receiveMessage", message);
        this.socket.to(groupId).emit("receiveMessage", message);
      }
    });
  }
  receiveMessage() {
    pub.on("message", (channel: string, message: string) => {
      const groupId = channel.split(":")[1];
      const parsedMessage = JSON.parse(message);
      this.io.to(groupId).emit("receiveMessage", parsedMessage);
    });
  }
  getMessages() {
    this.socket.on(
      "getMessages",
      async (groupId: string, callback: (messages: Message[]) => void) => {
        const groupExists = await redis.exists(`group:${groupId}`);
        if (groupExists) {
          const messages = await redis.lrange(
            `group:${groupId}:messages`,
            0,
            -1
          );
          const parsedMessages = messages.map((message) => JSON.parse(message));
          parsedMessages.reverse();
          callback(parsedMessages);
        } else {
          callback([]);
        }
      }
    );
  }
}
