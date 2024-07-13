import { Socket } from "socket.io";
import { redis } from "../config/redis";

interface CodeChange {
  delta: string;
  range: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
}
export class Collaboration {
  constructor(public socket: Socket) {
    this.init();
  }
  private init() {
    this.getCodeTemplate();
    this.onCodeChange();
  }
  private getCodeTemplate() {
    this.socket.on("codeTemplate", async (groupId: string, callback) => {
      try {
        const codeTemplate = await redis.hget(
          `group:${groupId}`,
          "source_code"
        );
        callback(codeTemplate);
      } catch (err) {
        callback(JSON.stringify(err));
        return;
      }
    });
  }
  private onCodeChange() {
    this.socket.on(
      "codeChange",
      async (groupId: string, change: CodeChange) => {
        try {
          await redis.hset(`group:${groupId}`, "source_code", change.delta);
          const members = await redis.smembers(`group:${groupId}:members`);
          members.forEach((member) => {
            this.socket.to(member).emit("codeUpdate", {
              change: change,
              updatedCode: change.delta,
            });
          });
        } catch (err) {
          this.socket.emit("error", "Failed to apply code change");
        }
      }
    );
  }
}
