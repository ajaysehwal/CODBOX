// constants.ts

export const DEFAULT_LANGUAGE = [
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "php",
  "rust",
] as const;

export const DEFAULT_THEME = ["vs-dark", "light"] as const;

export const DEFAULT_CODE = `/**
 * CodeXF - A platform for seamless collaboration in coding.
 * Connect, code, and create together in real-time!
 */` as const;

export const CANVAS_SIZE = {
  width: 3500,
  height: 2000,
};

export const INITIAL_COLOR = "#111111";
export const INITIAL_LINE_WIDTH = 5;
// u == user
// g == group
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
    GET_FILE_CONTENT: "g_fileContent",
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
    CLOSE: "closeGroup",
    VALIDATE: "ValidateGroup",
    DRAW_CLEAR: "clear",
  },
  CHAT: {
    SEND: "sendMessage",
    RECEIVE: "receiveMessage",
    GET_MESSAGES: "getMessages",
  },
};

import React from "react";
import {
  SiJavascript,
  SiTypescript,
  SiReact,
  SiPython,
  SiRust,
  SiCplusplus,
  SiPhp,
  SiGo,
  SiRuby,
  SiSwift,
} from "react-icons/si";
import { FaJava } from "react-icons/fa";

export type LanguageIconType =
  | "js"
  | "ts"
  | "jsx"
  | "py"
  | "rs"
  | "cpp"
  | "php"
  | "java"
  | "go"
  | "rb"
  | "swift";

export const LANGUAGE_ICONS: Record<LanguageIconType, JSX.Element> = {
  js: <SiJavascript className="text-yellow-400" />,
  ts: <SiTypescript className="text-blue-400" />,
  jsx: <SiReact className="text-blue-500" />,
  py: <SiPython className="text-green-500" />,
  rs: <SiRust className="text-orange-500" />,
  cpp: <SiCplusplus className="text-blue-600" />,
  php: <SiPhp className="text-purple-500" />,
  java: <FaJava className="text-red-500" />,
  go: <SiGo className="text-blue-300" />,
  rb: <SiRuby className="text-red-600" />,
  swift: <SiSwift className="text-orange-500" />,
};
