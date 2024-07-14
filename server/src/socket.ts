import { Server, Socket } from "socket.io";
import { GroupsManager } from "./controllers/groupController";
import { MessagesMananger } from "./controllers/messageController";
import { CodeEvaluator } from "./controllers/codeEvaluation";
import { Collaboration } from "./controllers/codeCollaboration";
import { redis, sub } from "./config/redis";
export class SocketProvider {
  private _io: Server;
  public users = new Map<string, string>();
  constructor() {
    this._io = new Server({
      transports: ["websocket", "polling"],
      cors: {
        origin: [
          "https://codexf.vercel.app",
          process.env.CLIENT_URL1 as string,
        ],
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
      },
    });
    sub.subscribe("group:*");
  }
  async init() {
    this.io.setMaxListeners(20);
    this.io.on("connection", async (socket: Socket) => {
      this.users.set(socket.id, socket.handshake.query.userId as string);
      this.initManagers(socket);
      await redis.set(
        `socket:${socket.id}:user`,
        socket.handshake.query.userId as string
      );
      console.log(this.users);
      socket.on("disconnect", async () => {
        this.users.delete(socket.id);
        console.log(this.users);
      });
    });
    return this._io;
  }
  private initManagers(socket: Socket) {
    new GroupsManager(socket);
    new MessagesMananger(socket, this.io);
    new CodeEvaluator(socket);
    new Collaboration(socket);
  }
  get io(): Server {
    return this._io;
  }
}
