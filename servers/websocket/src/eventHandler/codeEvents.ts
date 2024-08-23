import { Socket } from "socket.io";
import { CodeService } from "../services/code";
import { CodeChange, OwnerType } from "../interface";
import { Events } from "../constants";
import { FileManager } from "../managers/FileManager";
import { FileUpdateManager } from "../managers/FileUpdatesManager";
import { RedisStore } from "../store/redisStore";
import { Logger } from "../utils/logger";

export class CodeEvents {
  private codeService: CodeService;

  constructor(private socket: Socket) {
    const fileManager = new FileManager();
    const fileUpdateManager = new FileUpdateManager(
      new RedisStore(),
      new Logger()
    );
    this.codeService = new CodeService(fileManager, fileUpdateManager);
    this.setupEvents();
  }

  private setupEvents(): void {
    this.socket.on(Events.GROUP.CODE_CHANGE, this.handleCodeChange("group"));
    this.socket.on(Events.USER.CODE_CHANGE, this.handleCodeChange("user"));
    this.socket.on(Events.GROUP.GET_FILES, this.getFiles("group"));
    this.socket.on(Events.USER.GET_FILES, this.getFiles("user"));
    this.socket.on(Events.GROUP.GET_FILE_CONTENT, this.handleFileCode("group"));
    this.socket.on(Events.USER.GET_FILE_CONTENT, this.handleFileCode("user"));
    this.socket.on(Events.GROUP.CREATE_FILE, this.handleCreateFile("group"));
    this.socket.on(Events.USER.CREATE_FILE, this.handleCreateFile("user"));
  }

  private handleFileCode(ownerType: OwnerType) {
    return async (id: string, filename: string, callback: Function) => {
      console.log(id, filename);
      try {
        const code =
          ownerType === "group"
            ? await this.codeService.getGroupFileCode(id, filename)
            : await this.codeService.getUserFileCode(id, filename);
        console.log(code);
        callback(null, code);
      } catch (error) {
        callback(error);
      }
    };
  }

  private getFiles(ownerType: OwnerType) {
    return async (id: string, callback: Function) => {
      try {
        const files =
          ownerType === "group"
            ? await this.codeService.getGroupFiles(id)
            : await this.codeService.getUserFiles(id);
        console.log(id, files);
        callback(null, files);
      } catch (error) {
        callback(error);
      }
    };
  }

  private handleCodeChange(ownerType: OwnerType) {
    return async (id: string, filename: string, change: CodeChange) => {
      console.log(id,filename,change)
      try {
        if (ownerType === "group") {
          await this.codeService.updateGroupFileCode(
            id,
            filename,
            change.delta
          );
          this.broadcastCodeChange(id, filename, {
            change,
            updateCode: change.delta,
          });
        } else {
          await this.codeService.updateUserFileCode(id, filename, change.delta);
        }
      } catch (error) {
        console.log(error);
      }
    };
  }

  private broadcastCodeChange(
    groupId: string,
    filename: string,
    content: { change: CodeChange; updateCode: string }
  ): void {
    this.socket.to(groupId).emit(Events.GROUP.CODE_CHANGE, filename, content);
  }
  private handleCreateFile(owner: OwnerType) {
    return async (id: string, filename: string, callback: Function) => {
      console.log("creating", id, filename);
      try {
        const { success, message } =
          owner === "group"
            ? await this.codeService.createGroupFile(
                id,
                filename,
                `// lets start learning in ${id} group`
              )
            : await this.codeService.createUserFile(
                id,
                filename,
                `console.log("Nice to meet you! -${id}")`
              );
        callback(null, { success, message });
      } catch (error) {
        callback(error);
      }
    };
  }
}
