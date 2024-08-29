import { Server, Socket } from "socket.io";
import { MessageEvent, GroupEvent, CodeEvents } from "./eventHandler";
import { redis, sub, pub } from "./config/redis";
import { createAdapter } from "@socket.io/redis-adapter";
import { WhiteBorardEvents } from "./eventHandler/whiteBoardEvents";

export class SocketProvider {
  private _io: Server;
  static readonly maxConnections: number = parseInt(
    process.env.MAX_CONNECTIONS || "10000"
  );
  public users = new Map<string, string>();
  private readonly PORT = process.env.PORT || 8000;

  constructor() {
    this._io = new Server({
      transports: ["websocket", "polling"],
      cors: {
        origin: [
          "https://codbox.vercel.app",
          process.env.LOCAL_CLIENT as string,
        ],
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
      },
    });
    this._io.adapter(createAdapter(pub, sub));
    sub.subscribe("group:*");
  }

  async init() {
    this.io.setMaxListeners(20);
    this.io.use(this.connectionLimiter.bind(this));
    this.io.on("connection", this.handleConnection.bind(this));
    return this._io;
  }

  private connectionLimiter(socket: Socket, next: (err?: Error) => void) {
    if (this.users.size >= SocketProvider.maxConnections) {
      const err = new Error("Server has reached max connections");
      next(err);
    } else {
      next();
    }
  }

  private async handleConnection(socket: Socket) {
    this.users.set(socket.id, socket.handshake.query.userId as string);
    this.initManagers(socket);
    await redis.set(
      `socket:${socket.id}:user`,
      socket.handshake.query.userId as string
    );
    socket.on("disconnect", this.handleDisconnect.bind(this, socket));
  }

  private async handleDisconnect(socket: Socket) {
    this.users.delete(socket.id);
    await redis.del(`socket:${socket.id}:user`);
  }

  private initManagers(socket: Socket) {
    new GroupEvent(socket);
    new MessageEvent(socket, this.io);
    new CodeEvents(socket);
    new WhiteBorardEvents(socket);
  }

  get io(): Server {
    return this._io;
  }
}
