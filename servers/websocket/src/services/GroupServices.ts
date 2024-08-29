import { Group, User, MemberType } from "../interface";
import { GroupRepository } from "../store/groupRepository";
import { v4 as uuidv4 } from "uuid";
import { FilesStore } from "../store";

export class GroupService {
  private groupStore: FilesStore;

  constructor(private groupRepository: GroupRepository) {
    this.groupStore = new FilesStore("group");
  }

  async createGroup(creator: User): Promise<Group> {
    const group: Group = {
      id: uuidv4(),
      members: [creator.uid],
      createdAt: new Date().toISOString(),
      membersInfo: [{ ...creator, type: "Host" as MemberType }],
      board: "",
    };

    await Promise.all([
      this.groupRepository.createGroup(group),
      this.groupRepository.addMember(group.id, creator.uid),
      this.groupStore.createEntityStore(group.id),
    ]);

    return group;
  }

  async joinGroup(groupId: string, user: User): Promise<Group> {
    const group = await this.getGroupOrThrow(groupId);

    if (!this.isMember(group, user.uid)) {
      group.membersInfo.push({ ...user, type: "Member" as MemberType });
      group.members.push(user.uid);

      await Promise.all([
        this.groupRepository.updateGroup(group),
        this.groupRepository.addMember(groupId, user.uid),
      ]);
    }

    return group;
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    const group = await this.getGroupOrThrow(groupId);

    group.membersInfo = group.membersInfo.filter(
      (member) => member.uid !== userId
    );
    group.members = group.members.filter((id) => id !== userId);

    await Promise.all([
      this.groupRepository.updateGroup(group),
      this.groupRepository.removeMember(groupId, userId),
    ]);
  }

  async closeGroup(groupId: string): Promise<void> {
    await this.groupRepository.deleteGroup(groupId);
    // Consider adding cleanup for associated files in FilesStore
  }

  async getGroupMembers(groupId: string): Promise<User[]> {
    const group = await this.getGroupOrThrow(groupId);
    return group.membersInfo;
  }

  async isGroupValid(groupId: string): Promise<boolean> {
    return this.groupRepository.getGroup(groupId).then(Boolean);
  }

  async updateSourceCode(groupId: string): Promise<void> {
    const group = await this.getGroupOrThrow(groupId);
    await this.groupRepository.updateGroup(group);
    // Consider adding actual source code update logic here
  }

  private async getGroupOrThrow(groupId: string): Promise<Group> {
    const group = await this.groupRepository.getGroup(groupId);
    if (!group) {
      throw new Error(`Group ${groupId} does not exist`);
    }
    return group;
  }

  private isMember(group: Group, userId: string): boolean {
    return group.membersInfo.some((member) => member.uid === userId);
  }
}
