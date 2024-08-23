import { Server, Socket } from "socket.io";
import { MessageService } from "../services";
import { Message } from "../interface";
import { Events } from "../constants";
export class MessageEvent extends MessageService {
  constructor(public socket: Socket, public io: Server) {
    super(io);
    this.receive();
    this.setUpEvents();
  }
  private setUpEvents() {
    this.socket.on(Events.CHAT.SEND, this.sendMessage());
    this.socket.on(Events.CHAT.GET_MESSAGES, this.getMessages());
  }
  private sendMessage() {
    return async (groupId: string, message: Message) => {
      try {
        this.send(groupId, message);
        this.socket.emit(Events.CHAT.RECEIVE, message);
        this.socket.to(groupId).emit(Events.CHAT.RECEIVE, message);
      } catch (err) {
         throw new Error(JSON.stringify(err));
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