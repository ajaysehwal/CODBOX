import { GroupRepository } from "../libs/groupRepository";
import { RedisStore } from "../libs/redisStore";

export class CodeSync extends RedisStore {
  private group: GroupRepository;
  constructor() {
    super();
    this.group = new GroupRepository();
  }
  async getCode(groupId: string) {
    const group = await this.group.getGroup(groupId);
    if (!group) {
      return `Group ${groupId} not found`;
    }
    return group.sourceCode;
  }
  async setCode(code: string, groupId: string) {
    const group = await this.group.getGroup(groupId);
    if (!group) {
      return `Group ${groupId} not found`;
    }
    group.sourceCode = code;
    this.group.updateGroup(group);
    return true;
  }
}
