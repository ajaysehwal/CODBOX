import { GroupFileStore } from "./GroupFiles";
import { UserFileStore } from "./UserFiles";

export class FileManager {
  private userStore: UserFileStore;
  private groupStore: GroupFileStore;

  constructor() {
    this.userStore = new UserFileStore();
    this.groupStore = new GroupFileStore();
  }

  getUserStore(): UserFileStore {
    return this.userStore;
  }

  getGroupStore(): GroupFileStore {
    return this.groupStore;
  }
}
