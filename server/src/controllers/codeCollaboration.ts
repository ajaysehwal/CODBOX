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
        const members = await redis.hget(`group:${groupId}`, "members");
        console.log(members);
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
        console.log(`Received code change for group: ${groupId}`, change);
        try {
          const currentCode =
            (await redis.hget(`group:${groupId}`, "source_code")) || "";
          console.log("Current code:", currentCode);

          await redis.hset(`group:${groupId}`, "source_code", change.delta);
          console.log("Code updated in Redis");
          const members = await redis.smembers(`group:${groupId}:members`);
          members.forEach((member) => {
            this.socket
              .to(member)
              .emit("codeUpdate", {
                change: change,
                updatedCode: change.delta,
              });
          });
          console.log(`Group ${groupId} members:`, members);
          console.log("Change broadcasted to group");
        } catch (err) {
          console.error("Error handling code change:", err);
          this.socket.emit("error", "Failed to apply code change");
        }
      }
    );
  }
}
