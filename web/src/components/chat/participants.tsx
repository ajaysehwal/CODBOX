import React, { useEffect, useCallback } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { User } from "firebase/auth";
import { useAuth, useSocket } from "@/context";
import { useGroupsStore, GroupUser } from "@/zustand";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SendHorizontal, Users, Crown } from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Events } from "../constants";

interface Response {
  success: boolean;
  error?: string;
  members: GroupUser[];
}

const MAX_DISPLAYED_MEMBERS = 4;

export default function GroupParticipants() {
  const socket = useSocket();
  const { setMembers, members, setNewGroupMember, removeMember } =
    useGroupsStore();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("id") as string;
  const { user } = useAuth();

  const handleGetMembersList = useCallback(
    (response: Response) => {
      if (response.success) {
        setMembers(response.members);
      }
    },
    [setMembers]
  );

  const handleJoined = useCallback(
    (user: GroupUser) => {
      setNewGroupMember(user);
    },
    [setNewGroupMember]
  );

  const handleLeaved = useCallback(
    (userId: string) => {
      removeMember(userId);
    },
    [removeMember]
  );

  useEffect(() => {
    if (!socket || !groupId) return;

    socket.emit("getMembersList", groupId, handleGetMembersList);
    socket.on(Events.GROUP.MEMBER_JOINED, handleJoined);
    socket.on(Events.GROUP.MEMBER_LEFT, handleLeaved);

    return () => {
      socket.off(Events.GROUP.MEMBER_JOINED, handleJoined);
      socket.off(Events.GROUP.MEMBER_LEFT, handleLeaved);
    };
  }, [
    socket,
    groupId,
    handleGetMembersList,
    handleJoined,
    handleLeaved,
    setMembers,
  ]);

  const displayedMembers = members.slice(0, MAX_DISPLAYED_MEMBERS);

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger className="p-2 bg-white rounded-full hover:bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 shadow-sm">
          <MemberAvatars
            members={displayedMembers}
            totalCount={members.length}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-96 bg-white rounded-2xl shadow-2xl border border-gray-100">
          <div className="sticky top-0 bg-white p-3 border-b border-gray-100">
            <h3 className="text-1xl font-bold text-gray-800">Group Members</h3>
            <p className="text-sm text-gray-500 mt-1">
              {members.length} participants
            </p>
          </div>
          <ScrollArea className="h-[50vh]">
            <div className="p-4">
              {members.map((member) => (
                <DropdownMenuItem
                  key={member.uid}
                  className="flex items-center justify-between p-3 hover:bg-blue-50 rounded-xl transition-all duration-200 mb-2"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Image
                        className="rounded-full"
                        src={member.photoURL as string}
                        alt={`${member.displayName}'s avatar`}
                        width={42}
                        height={42}
                      />
                      {member.type === "Host" && (
                        <Crown className="w-5 h-5 text-yellow-500 absolute -top-1 -right-1" />
                      )}
                    </div>
                    <div className="flex-col">
                      <p className="text-sm font-semibold text-gray-800">
                        {member.displayName}
                      </p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  {member.uid !== user?.uid && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-full p-2"
                    >
                      <SendHorizontal className="w-5 h-5" />
                    </Button>
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface MemberAvatarsProps {
  members: User[];
  totalCount: number;
}

function MemberAvatars({ members, totalCount }: MemberAvatarsProps) {
  return (
    <div className="flex items-center -space-x-3">
      {members.map((member, i) => (
        <div key={member.uid} className="relative inline-block">
          <Image
            width={36}
            height={36}
            className="rounded-full ring-2 ring-white"
            src={member.photoURL as string}
            alt={`${member.displayName || "Member"}'s avatar`}
          />
        </div>
      ))}
      <MemberCount count={totalCount} />
    </div>
  );
}

function MemberCount({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-xs shadow-md">
      <Users className="w-5 h-5" />
    </div>
  );
}