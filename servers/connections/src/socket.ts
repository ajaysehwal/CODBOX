import { Server, Socket } from "socket.io";
import { MessageEvent, GroupEvent, CodeEvents } from "./eventHandler";
import { redis, sub } from "./config/redis";
import http from "http";
export class SocketProvider {
  private _io: Server;
  public users = new Map<string, string>();
  private readonly PORT = process.env.PORT || 8000;
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
        await redis.del(`socket:${socket.id}:user`);
        console.log(this.users);
      });
    });
    return this._io;
  }
  start(server: http.Server) {
    server.listen(this.PORT, () => {
      console.log(`socket server is running on ${this.PORT}`);
    });
  }
  private initManagers(socket: Socket) {
    new GroupEvent(socket);
    new MessageEvent(socket, this.io);
    new CodeEvents(socket);
  }
  get io(): Server {
    return this._io;
  }
}
