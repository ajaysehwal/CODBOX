import { Socket } from "socket.io";
import { User } from "../interface";
import { GroupRepository } from "../store/groupRepository";
import { GroupService } from "../services";
import { Events } from "../constants";
import { generateAudioToken } from "../utils/generateAudioToken";
export class GroupEvent extends GroupService {
  constructor(public socket: Socket) {
    super(new GroupRepository());
    this.setUpEvents();
  }
  private setUpEvents() {
    this.socket.on(Events.GROUP.CREATE, this.handleCreateGroup());
    this.socket.on(Events.GROUP.JOIN, this.handleJoinGroup());
    this.socket.on(Events.GROUP.LEAVE, this.handleLeaveGroup());
    this.socket.on(Events.GROUP.CLOSE, this.handleCloseGroup());
    this.socket.on(Events.GROUP.GET_MEMBERS_LIST, this.HandleGroupDetails());
    this.socket.on(Events.GROUP.VALIDATE, this.HandleGroupValidation());
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
        this.socket
          .to(groupId)
          .emit(Events.GROUP.MEMBER_JOINED, { ...user, type: "member" });
        const audioToken = generateAudioToken(user.uid, group.id);
        console.log("audiotoken", audioToken);
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
        this.socket.to(groupId).emit(Events.GROUP.MEMBER_LEFT, userId);
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
