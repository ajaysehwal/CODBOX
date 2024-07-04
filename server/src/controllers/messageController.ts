import { Socket } from "socket.io";
import { GroupsManager } from "./groupController";
export type Message = {
  username: string;
  text: string;
  uuid: string;
  timestamp: Date;
};
export class MessagesMananger {
  constructor(public socket: Socket) {
    this.init();
  }
  init() {
    this.sendMessage();
  }
  sendMessage() {
    this.socket.on("sendMessage", (groupId: string, message: Message) => {
      console.log("sendMessage", message);
      const groups = GroupsManager.groups;
      if (groups.has(groupId)) {
        groups.get(groupId)?.messages.push(message);
        this.socket.emit("receiveMessage",message);
        groups.get(groupId)?.members.forEach((memberId) => {
          console.log(memberId);
          this.socket.to(memberId).emit("receiveMessage", message);
        });
      } else {
        console.log(`Group ${groupId} does not exist`);
      }
      console.log("Current groups:", GroupsManager.groups);
    });
  }
}
