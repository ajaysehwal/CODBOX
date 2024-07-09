import React from "react";
import { motion } from "framer-motion";
import { SubmissionResult } from "../interface";
export const CodeOutput = ({
  setOpen,
  Loading,
  result,
  setCompileResponse,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  Loading: boolean;
  result: SubmissionResult | null;
  setCompileResponse: React.Dispatch<
    React.SetStateAction<SubmissionResult | null>
  >;
}) => {
  return (
    <div className="w-full">
      {!Loading && (
        <motion.div
          className="w-[50%] h-1 top-0 bg-blue-600"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      )}

      <div className="flex justify-between items-center p-2">
        <p className="text-2xl font-bold">Output</p>
        <p
          className={`${
            result?.status.description === "Accepted"
              ? "text-green-600"
              : "text-red-500"
          } font-semibold p-4`}
        >
          {result?.status.description}
        </p>
      </div>

      <p className='p-2'>{result?.stdout}</p>
      <p className='p-2'>{result?.compile_output}</p>
    </div>
  );
};
