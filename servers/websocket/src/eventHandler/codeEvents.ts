import { Socket } from "socket.io";
import { CodeService } from "../services";
import { CodeChange, OwnerType } from "../interface";
import { Events } from "../constants";

type CallbackFunction = (error: any, result?: any) => void;

export class CodeEvents {
  private codeService: CodeService;

  constructor(private socket: Socket) {
    this.codeService = new CodeService();
    const eventHandlers = this.getEventHandlers();
    eventHandlers.forEach(({ event, handler }) => {
      this.socket.on(event, handler);
    });
  }
  private getEventHandlers() {
    return [
      {
        event: Events.GROUP.CODE_CHANGE,
        handler: this.handleCodeChange("group"),
      },
      {
        event: Events.USER.CODE_CHANGE,
        handler: this.handleCodeChange("user"),
      },
      { event: Events.GROUP.GET_FILES, handler: this.getFiles("group") },
      { event: Events.USER.GET_FILES, handler: this.getFiles("user") },
      {
        event: Events.GROUP.GET_FILE_CONTENT,
        handler: this.handleFileContent("group"),
      },
      {
        event: Events.USER.GET_FILE_CONTENT,
        handler: this.handleFileContent("user"),
      },
      {
        event: Events.GROUP.CREATE_FILE,
        handler: this.handleCreateFile("group"),
      },
      {
        event: Events.USER.CREATE_FILE,
        handler: this.handleCreateFile("user"),
      },
    ];
  }

  private handleFileContent =
    (ownerType: OwnerType) =>
    async (id: string, filename: string, callback: CallbackFunction) => {
      try {
        const fileManager = await this.codeService.file();
        const content = await fileManager.getFileContent(
          id,
          ownerType,
          filename
        );
        if (content) {
          callback(null, content);
        } else {
          callback("Error not find");
        }
      } catch (error) {
        console.log("find", error);
        callback(error);
      }
    };

  private getFiles =
    (ownerType: OwnerType) =>
    async (id: string, callback: CallbackFunction) => {
      try {
        const fileManager = await this.codeService.file();
        const files = await fileManager.listFiles(id, ownerType);
        callback(null, files);
      } catch (error) {
        callback(error);
      }
    };

  private handleCodeChange =
    (ownerType: OwnerType) =>
    async (id: string, filename: string, change: CodeChange) => {
      console.log(id, filename, change);
      try {
        const fileManager = await this.codeService.file();
        await fileManager.recordFileUpdate(
          id,
          ownerType,
          filename,
          change.delta
        );

        if (ownerType === "group") {
          this.broadcastCodeChange(id, filename, {
            change,
            updateCode: change.delta,
          });
        }
      } catch (error) {
        console.log(
          `Error updating file content for ${ownerType} ${id}:`,
          error
        );
      }
    };

  private broadcastCodeChange(
    groupId: string,
    filename: string,
    content: { change: CodeChange; updateCode: string }
  ): void {
    this.socket
      .to(groupId)
      .emit(Events.GROUP.CODE_CHANGE, { filename, content });
  }

  private handleCreateFile =
    (ownerType: OwnerType) =>
    async (id: string, filename: string, callback: CallbackFunction) => {
      try {
        const initialContent = `// Let's start learning in ${ownerType} ${id} - ${filename}`;
        const fileManager = await this.codeService.file();
        const result = await fileManager.createFile(
          id,
          ownerType,
          filename,
          initialContent
        );
        callback(null, result);
      } catch (error) {
        callback(error);
      }
    };
}
