export const CopyText = (
  textRef: React.MutableRefObject<HTMLTextAreaElement | null>
) => {
  try {
    if (textRef.current) {
      const range = document.createRange();
      range.selectNodeContents(textRef.current);

      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand("copy");
        selection.removeAllRanges();
      }
    }
  } catch (error) {
    throw new Error(
      "Unable to copy response please you can select text and press Clt + C"
    );
  }
};

import { Language } from "@/components/interface";
import { randomBytes } from "crypto";

export function generateRandomToken(length: number = 16): string {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = randomBytes(length);
  let token = "";
  for (let i = 0; i < length; i++) {
    const byte = bytes[i] % characters.length;
    token += characters[byte];
  }
  return token;
}

import { atom } from "recoil";

export const backgroundAtom = atom<{ mode: "dark" | "light"; lines: boolean }>({
  key: "bg",
  default: {
    mode: "light",
    lines: true,
  },
});

export const getLanguageByExtension = (filename: string): Language => {
  const extension = filename.split(".").pop();

  switch (extension) {
    case "ts":
      return "typescript";
    case "js":
      return "javascript";
    case "jsx":
      return "javascript";
    case "tsx":
      return "typescript";
    case "py":
      return "python";
    case "java":
      return "java";
    case "cpp":
      return "cpp";
    default:
      return "javascript";
  }
};
