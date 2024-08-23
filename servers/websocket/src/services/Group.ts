import { Group, User, Message } from "../interface";
import { GroupRepository } from "../store/groupRepository";
import { v4 as uuidv4 } from "uuid";

export class GroupService {
  constructor(private groupRepository: GroupRepository) {}
  async createGroup(creator: User): Promise<Group> {
    const group: Group = {
      id: uuidv4(),
      members: [creator.uid],
      sourceCode: "// Start typing your code...",
      createdAt: new Date().toISOString(),
      membersInfo: [{ ...creator, type: "Host" }],
      board: "",
    };
    await this.groupRepository.createGroup(group);
    await this.groupRepository.addMember(group.id, creator.uid);
    return group;
  }

  async joinGroup(groupId: string, user: User): Promise<Group> {
    const group = await this.groupRepository.getGroup(groupId);
    if (!group) {
      throw new Error(`Group ${groupId} does not exist`);
    }
    if (!group.membersInfo.some((member) => member.uid === user.uid)) {
      group.membersInfo.push({ ...user, type: "Member" });
      group.members.push(user.uid);
      await this.groupRepository.updateGroup(group);
    }
    await this.groupRepository.addMember(groupId, user.uid);
    return group;
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    const group = await this.groupRepository.getGroup(groupId);
    if (!group) {
      throw new Error(`Group ${groupId} does not exist`);
    }
    group.membersInfo = group.membersInfo.filter(
      (member) => member.uid !== userId
    );
    group.members = group.members.filter((id) => id !== userId);
    await this.groupRepository.updateGroup(group);
    await this.groupRepository.removeMember(groupId, userId);
  }

  async closeGroup(groupId: string): Promise<void> {
    await this.groupRepository.deleteGroup(groupId);
  }

  async getGroupMembers(groupId: string): Promise<User[]> {
    const group = await this.groupRepository.getGroup(groupId);
    return group ? group.membersInfo : [];
  }

  async isGroupValid(groupId: string): Promise<boolean> {
    return (await this.groupRepository.getGroup(groupId)) !== null;
  }

  async updateSourceCode(groupId: string, sourceCode: string): Promise<void> {
    const group = await this.groupRepository.getGroup(groupId);
    if (!group) {
      throw new Error(`Group ${groupId} does not exist`);
    }
    group.sourceCode = sourceCode;
    await this.groupRepository.updateGroup(group);
  }
}
