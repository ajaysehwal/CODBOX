import { Socket } from "socket.io";
import { User } from "../interface";
import { GroupRepository } from "../store/groupRepository";
import { GroupService } from "../services";
import { Events } from "../constants";

type CallbackFunction = (response: {
  success: boolean;
  error?: any;
  [key: string]: any;
}) => void;

export class GroupEvent {
  private groupService: GroupService;

  constructor(private socket: Socket) {
    this.groupService = new GroupService(new GroupRepository());
    this.setupEvents();
  }

  private setupEvents(): void {
    const eventHandlers = [
      { event: Events.GROUP.CREATE, handler: this.handleCreateGroup },
      { event: Events.GROUP.JOIN, handler: this.handleJoinGroup },
      { event: Events.GROUP.LEAVE, handler: this.handleLeaveGroup },
      { event: Events.GROUP.CLOSE, handler: this.handleCloseGroup },
      {
        event: Events.GROUP.GET_MEMBERS_LIST,
        handler: this.handleGroupDetails,
      },
      { event: Events.GROUP.VALIDATE, handler: this.handleGroupValidation },
    ];

    eventHandlers.forEach(({ event, handler }) => {
      this.socket.on(event, handler);
    });
  }

  private handleCreateGroup = async (
    user: User,
    callback: CallbackFunction
  ): Promise<void> => {
    try {
      const group = await this.groupService.createGroup(user);
      this.socket.join(group.id);
      callback({ success: true, group });
    } catch (error) {
      callback({ success: false, error });
    }
  };

  private handleJoinGroup = async (
    groupId: string,
    user: User,
    callback: CallbackFunction
  ): Promise<void> => {
    try {
      const group = await this.groupService.joinGroup(groupId, user);
      this.socket.join(groupId);
      this.socket
        .to(groupId)
        .emit(Events.GROUP.MEMBER_JOINED, { ...user, type: "Member" });
      callback({ success: true, group });
    } catch (error) {
      callback({ success: false, error });
    }
  };

  private handleLeaveGroup = async (
    groupId: string,
    userId: string,
    callback: CallbackFunction
  ): Promise<void> => {
    try {
      await this.groupService.leaveGroup(groupId, userId);
      this.socket.leave(groupId);
      this.socket.to(groupId).emit(Events.GROUP.MEMBER_LEFT, userId);
      callback({ success: true });
    } catch (error) {
      callback({ success: false, error });
    }
  };

  private handleCloseGroup = async (
    groupId: string,
    callback: CallbackFunction
  ): Promise<void> => {
    try {
      await this.groupService.closeGroup(groupId);
      callback({ success: true });
    } catch (error) {
      callback({ success: false, error });
    }
  };

  private handleGroupDetails = async (
    groupId: string,
    callback: CallbackFunction
  ): Promise<void> => {
    try {
      const members = await this.groupService.getGroupMembers(groupId);
      callback({ success: true, members });
    } catch (error) {
      callback({ success: false, error });
    }
  };

  private handleGroupValidation = async (
    groupId: string,
    callback: CallbackFunction
  ): Promise<void> => {
    try {
      const isValid = await this.groupService.isGroupValid(groupId);
      callback({ success: true, isValid });
    } catch (error) {
      callback({ success: false, error });
    }
  };
}
