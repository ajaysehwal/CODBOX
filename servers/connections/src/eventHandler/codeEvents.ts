import { Socket } from "socket.io";
import { CodeChange } from "../interface";
import { CodeSync } from "../services";
export class CodeEvents extends CodeSync {
  constructor(public socket: Socket) {
    super();
    this.setUpEvents();
  }
  private setUpEvents() {
    this.socket.on("currentCode", this.handleCurrentCode());
    this.socket.on("onCodeChange", this.handleCodeChange());
  }
  private handleCurrentCode() {
    return async (groupId: string, callback: Function) => {
      try {
        const code = await this.getCode(groupId);
        callback(code);
      } catch (error) {
        callback(JSON.stringify(error));
        return;
      }
    };
  }

  private handleCodeChange() {
    return async (groupId: string, change: CodeChange) => {
      console.log(groupId, change);
      try {
        await this.setCode(change.delta, groupId);
        this.broadcastCodeChange(groupId, { change, updateCode: change.delta });
      } catch (error) {
        this.socket.emit("error", "Failed to apply code change");
        return;
      }
    };
  }
  private broadcastCodeChange(
    groupId: string,
    code: { change: CodeChange; updateCode: string }
  ) {
    this.socket.to(groupId).emit("onCodeChange", code);
  }
}
