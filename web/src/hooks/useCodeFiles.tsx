import { useAuth, useSocket } from "@/context";
import { useCallback, useEffect, useMemo } from "react";
import { Events } from "@/components/constants";
import { useFilesStore } from "@/zustand";
import { useParams, useRouter } from "next/navigation";
import { useEditor } from "./useEditor";
import { useHashRoute } from "./usehashRoute";

type EventType = typeof Events.GROUP & typeof Events.USER;
type FileContext = { type: "group"; groupId: string } | { type: "user" };
type CreateFileResponse = { success: boolean; message: string };

const getEventName = (context: FileContext, action: keyof EventType): string =>
  context.type === "group"
    ? Events.GROUP[action as keyof typeof Events.GROUP]
    : Events.USER[action as keyof typeof Events.USER];

const getId = (
  context: FileContext,
  userId: string | undefined
): string | undefined => (context.type === "group" ? context.groupId : userId);

export const useFiles = (pageType: "group" | "user") => {
  const { socket } = useSocket();
  const { id: groupId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { setCode } = useEditor();
  const filename = useHashRoute();

  const {
    file,
    setFile,
    files,
    setFiles,
    createLoad,
    setCreateLoad,
    isLoading,
    setIsLoading,
    error,
    setError,
  } = useFilesStore();

  const context: FileContext = useMemo(
    () =>
      pageType === "group"
        ? { type: "group", groupId: groupId! }
        : { type: "user" },
    [pageType, groupId]
  );

  const emitSocketEvent = useCallback(
    (eventName: string, ...args: any[]) =>
      new Promise((resolve) =>
        socket?.emit(eventName, ...args, (_: any, response: any) =>
          resolve(response)
        )
      ),
    [socket]
  );

  const handleError = useCallback(
    (message: string, error: unknown) => {
      console.error(message, error);
      setError(`${message}: ${error}`);
      setIsLoading(false);
    },
    [setError, setIsLoading]
  );

  const getFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const event = getEventName(context, "GET_FILES");
      const ID = getId(context, user?.uid);
      const fetchedFiles = (await emitSocketEvent(event, ID)) as string[];
      setFiles(fetchedFiles);
    } catch (error) {
      handleError("Error getting files", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    context,
    user?.uid,
    emitSocketEvent,
    setFiles,
    handleError,
    setError,
    setIsLoading,
  ]);

  const createFile = useCallback(
    async (filename: string) => {
      setCreateLoad(true);
      setError(null);
      try {
        const event = getEventName(context, "CREATE_FILE");
        const ID = getId(context, user?.uid);
        const response = (await emitSocketEvent(
          event,
          ID,
          filename
        )) as CreateFileResponse;

        if (response.success) {
          setFiles([...files, filename]);
          await selectFile(filename);
          await getFiles();
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        handleError("Error creating file", error);
      } finally {
        setCreateLoad(false);
      }
    },
    [
      context,
      user?.uid,
      emitSocketEvent,
      setFiles,
      getFiles,
      handleError,
      setError,
    ]
  );

  const selectFile = useCallback(
    async (filename: string, initialgroupId?: string) => {
      try {
        const event = initialgroupId
          ? Events.GROUP.GET_FILE_CONTENT
          : getEventName(context, "GET_FILE_CONTENT");
        const ID = initialgroupId ? initialgroupId : getId(context, user?.uid);

        const content = (await emitSocketEvent(event, ID, filename)) as string;
        !initialgroupId && router.push(`#${filename}`);
        setFile({ filename, content });
        setCode(content);
      } catch (error) {
        handleError("Error selecting file", error);
        router.push("/");
      }
    },
    [context, user?.uid, emitSocketEvent, setFile, setCode, router, handleError]
  );

  return useMemo(
    () => ({
      createFile,
      files,
      selectFile,
      file,
      createLoad,
      setFile,
      isLoading,
      error,
      getFiles,
      context,
    }),
    [createFile, files, selectFile, file, createLoad, isLoading, error]
  );
};
