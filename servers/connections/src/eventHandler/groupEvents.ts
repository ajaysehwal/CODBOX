import { Socket } from "socket.io";
import { User } from "../interface";
import { GroupRepository } from "../libs/groupRepository";
import { GroupService } from "../services";
import { generateAudioToken } from "../utils/generateAudioToken";
export class GroupEvent extends GroupService {
  constructor(public socket: Socket) {
    super(new GroupRepository());
    this.setUpEvents();
  }
  private setUpEvents() {
    this.socket.on("createGroup", this.handleCreateGroup());
    this.socket.on("joinGroup", this.handleJoinGroup());
    this.socket.on("leaveGroup", this.handleLeaveGroup());
    this.socket.on("closeGroup", this.handleCloseGroup());
    this.socket.on("getMembersList", this.HandleGroupDetails());
    this.socket.on("ValidateGroup", this.HandleGroupValidation());
  }
  private handleCreateGroup() {
    return async (user: User, callback: Function) => {
      try {
        const group = await this.createGroup(user);
        this.socket.join(group.id);
        const audioToken = generateAudioToken(user.uid, group.id);
        callback({ success: true, group, audioToken });
      } catch (error) {
        callback({ success: false, error: error });
      }
    };
  }
  private handleJoinGroup() {
    return async (groupId: string, user: User, callback: Function) => {
      try {
        const group = await this.joinGroup(groupId, user);
        this.socket.join(groupId);
        this.socket.to(groupId).emit("joined", { ...user, type: "member" });
        const audioToken = generateAudioToken(user.uid, group.id);
        callback({ success: true, group, audioToken });
      } catch (error) {
        callback({ success: false, error: error });
      }
    };
  }
  private handleLeaveGroup() {
    return async (groupId: string, userId: string, callback: Function) => {
      try {
        await this.leaveGroup(groupId, userId);
        this.socket.leave(groupId);
        this.socket.to(groupId).emit("leaved", userId);
        callback({ success: true });
      } catch (error) {
        callback({ success: false, error: error });
      }
    };
  }
  private handleCloseGroup() {
    return async (groupId: string, callback: Function) => {
      try {
        await this.closeGroup(groupId);
        callback(true);
      } catch (error) {
        callback(false);
      }
    };
  }
  private HandleGroupDetails() {
    return async (groupId: string, callback: Function) => {
      try {
        const members = await this.getGroupMembers(groupId);
        callback({ success: true, members });
      } catch (error) {
        callback({ success: false, error: error });
      }
    };
  }
  private HandleGroupValidation() {
    return async (groupId: string, callback: Function) => {
      try {
        const isExist = await this.isGroupValid(groupId);
        callback(isExist);
      } catch (error) {
        throw new Error(JSON.stringify(error));
      }
    };
  }
}
