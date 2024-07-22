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
import { SendHorizontal } from "lucide-react";
import { Button } from "../ui/button";

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
    socket.on("joined", handleJoined);
    socket.on("leaved", handleLeaved);

    return () => {
      socket.off("joined", handleJoined);
      socket.off("leaved", handleLeaved);
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
        <DropdownMenuTrigger className="w-[200px] p-2 border-none bg-white outline-none">
          <MemberAvatars
            members={displayedMembers}
            totalCount={members.length}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[450px]">
          {members.map((member) => (
            <DropdownMenuItem
              key={member.uid}
              className="flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <Image
                  className="rounded-full"
                  src={member.photoURL as string}
                  alt="img"
                  width={35}
                  height={35}
                />
                <div className="flex-col">
                  <p className="text-sm">{member.displayName}</p>
                  <p className="text-gray-400 text-[12px]">{member.email}</p>
                </div>
              </div>
              <div>
                {member.type === "Host" && (
                  <p className="text-gray-400 text-[13px]">{member.type}</p>
                )}

                {member.uid !== user?.uid && (
                  <div>
                    <Button size="icon" variant="outline">
                      <SendHorizontal className="text-blue-700" />
                    </Button>
                  </div>
                )}
              </div>
            </DropdownMenuItem>
          ))}
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
    <div className="flex -space-x-2 m-auto items-center justify-center">
      {members.map((member, i) => (
        <Image
          key={member.uid}
          width={28}
          height={28}
          className="inline-block rounded-full dark:ring-neutral-900"
          src={member.photoURL as string}
          alt={`${member.displayName || "Member"}'s avatar`}
        />
      ))}
      <MemberCount count={totalCount} />
    </div>
  );
}

function MemberCount({ count }: { count: number }) {
  return (
    <button className="hs-dropdown-toggle inline-flex items-center justify-center size-[30px] rounded-full bg-gray-100 border-2 border-white font-medium text-gray-700 shadow-sm align-middle transition-all text-sm dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-white dark:focus:bg-blue-100 dark:focus:text-blue-600 dark:focus:ring-offset-gray-800">
      <span className="font-medium leading-none">{count}</span>
    </button>
  );
}
