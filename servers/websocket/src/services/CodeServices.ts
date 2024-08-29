import { FilesManager } from "../managers";

export class CodeService {
  private filesManager: FilesManager;

  constructor() {
    this.filesManager = new FilesManager();
  }
  async file() {
    return this.filesManager;
  }
}
