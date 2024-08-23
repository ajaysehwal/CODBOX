import { Group } from "../interface";
import { RedisStore } from "./redisStore";

export class GroupRepository extends RedisStore {
  constructor() {
    super();
  }

  async createGroup(group: Group): Promise<void> {
    await this.set(`group:${group.id}`, JSON.stringify(group));
  }

  async getGroup(groupId: string): Promise<Group | null> {
    const groupData = await this.get(`group:${groupId}`);
    return groupData ? JSON.parse(groupData) : null;
  }

  async updateGroup(group: Group): Promise<void> {
    await this.set(`group:${group.id}`, JSON.stringify(group));
  }

  async deleteGroup(groupId: string): Promise<void> {
    await this.del(`group:${groupId}`);
  }

  async addMember(groupId: string, userId: string): Promise<void> {
    await this.sadd(`group:${groupId}:members`, userId);
  }

  async removeMember(groupId: string, userId: string): Promise<void> {
    await this.srem(`group:${groupId}:members`, userId);
  }

  async getMembers(groupId: string): Promise<string[]> {
    return await this.smembers(`group:${groupId}:members`);
  }
}
