import { Server } from "socket.io";
import { RedisStore } from "../store/redisStore";
import { Message } from "../interface";

export class MessageService extends RedisStore {
  constructor(public io: Server) {
    super();
  }
  async send(groupId: string, message: Message) {
    await this.lpush(groupId, JSON.stringify(message));
  }
  async receive() {
    this.pub.on("message", (channel: string, message: string) => {
      const groupId = channel.split(":")[1];
      const parsedMessage = JSON.parse(message);
      this.io.to(groupId).emit("receiveMessage", parsedMessage);
    });
  }
  async getall(groupId: string) {
    const messages = await this.lrange(groupId);
    const parsedMessages = messages.map((message) => JSON.parse(message));
    parsedMessages.reverse();
    return parsedMessages;
  }
}
