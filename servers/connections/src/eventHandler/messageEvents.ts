import { Server, Socket } from "socket.io";
import { MessageService } from "../services";
import { Message } from "../interface";

export class MessageEvent extends MessageService {
  constructor(public socket: Socket, public io: Server) {
    super(io);
    this.receive();
    this.setUpEvents();
  }
  private setUpEvents() {
    this.socket.on("sendMessage", this.sendMessage());
    this.socket.on("getMessages", this.getMessages());
  }
  private sendMessage() {
    return async (groupId: string, message: Message) => {
      try {
        this.send(groupId, message);
        this.socket.emit("receiveMessage", message);
        this.socket.to(groupId).emit("receiveMessage", message);
      } catch (err) {
        console.log(err);
      }
    };
  }
  private getMessages() {
    return async (groupId: string, callback: Function) => {
      try {
        const messages = await this.getall(groupId);
        callback(messages);
      } catch (err) {
        console.error("Error fetching messages:", err);
        callback([]);
      }
    };
  }
}