export const Events = {
    USER: {
      CODE_CHANGE: "u_change",
      GET_FILE_CONTENT: "u_fileContent",
      DRAW: "userDraw",
      CREATE_FILE: "u_createFile",
      CREATE_PROJECT: "u_createProject",
      GET_FILES: "u_files",
    },
    GROUP: {
      GET_FILE_CONTENT: "g_fileConent",
      JOIN: "joinGroup",
      LEAVE: "leaveGroup",
      CREATE: "createGroup",
      GET_MEMBERS_LIST: "getMembersList",
      MEMBER_JOINED: "joined",
      MEMBER_LEFT: "leaved",
      DRAW: "g_draw",
      CODE_CHANGE: "g_change",
      GET_FILES: "g_files",
      CREATE_FILE: "g_createfile",
      CLOSE:"closeGroup",
      VALIDATE:"ValidateGroup",
      DRAW_CLEAR:'clear'
    },
    CHAT: {
      SEND: "sendMessage",
      RECEIVE: "receiveMessage",
      GET_MESSAGES: "getMessages"
    }
  } as const;