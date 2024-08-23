import { Socket } from "socket.io";
import { DrawData } from "../interface";
import { Events } from "../constants";
export class WhiteBorardEvents {
  constructor(public socket: Socket) {
    this.setUpEvents();
  }
  private setUpEvents() {
    this.socket.on(Events.GROUP.DRAW, this.handleDraw());
    this.socket.on(Events.GROUP.DRAW_CLEAR, this.handleClear());
  }
  private handleDraw() {
    return (data: DrawData) => {
      this.socket.to(data.groupId).emit(Events.GROUP.DRAW, data);
    };
  }
  private handleClear() {
    return (groupId: string) => {
      this.socket.to(groupId).emit(Events.GROUP.DRAW_CLEAR);
    };
  }
}
