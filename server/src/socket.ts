import { Server, Socket } from "socket.io";
import { GroupsManager } from "./controllers/groupController";
import { MessagesMananger } from "./controllers/messageController";
export class SocketProvider {
  private _io: Server;
  public users = new Map<string, string>();
  static users: any;
  constructor() {
    this._io = new Server({
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["*"],
        credentials: true,
      },
    });
  }
  async init() {
    this.io.on("connection", (socket: Socket) => {
      this.users.set(socket.id, socket.handshake.query.userId as string);
      this.initManager(socket);
      console.log(this.users);
      socket.on("disconnect", () => {
        this.users.delete(socket.id);
        console.log(this.users);
      });
    });
    return this._io;
  }
  private initManager(socket: Socket) {
    new GroupsManager(socket);
    new MessagesMananger(socket);
  }
  get io(): Server {
    return this._io;
  }
}
