"use client";

import React from "react";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Result } from "../interface";

export const CodeOutput = ({
  Loading,
  result,
}: {
  Loading: boolean;
  result: Result;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
    >
      <div className="bg-gray-50 p-4 flex justify-between items-center border-b border-gray-200">
        <motion.p
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          className="text-lg font-mono font-semibold text-gray-800"
        >
          Output
        </motion.p>
        <div className="flex items-center space-x-3">
          {Loading && (
            <motion.div
              className="h-3 w-3 bg-blue-400 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                backgroundColor: ["#60A5FA", "#3B82F6", "#60A5FA"],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
            />
          )}
          <Badge
            variant={
              Loading
                ? "default"
                : result?.success
                ? "secondary"
                : "destructive"
            }
          >
            {Loading
              ? "Pending.."
              : result?.success
              ? "Executed Successfully"
              : "Execution Failed"}
          </Badge>
        </div>
      </div>
      <ScrollArea className="h-[400px] p-6 bg-gray-50">
        <div className="font-mono text-sm text-gray-800">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-4 flex justify-between items-center text-xs text-gray-500"
          >
            <span className="flex items-center">
              <span className="text-green-600 mr-2">$</span>
              execute_code
            </span>
            <span className="bg-gray-200 px-2 py-1 rounded text-gray-700">
              {result?.executionTime
                ? `Time: ${result.executionTime.toFixed(3)}s`
                : "Pending..."}
            </span>
          </motion.div>
          {result?.output && (
            <motion.pre
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="whitespace-pre-wrap mb-4 bg-gray-100 p-4 rounded-lg border border-gray-300 text-gray-800"
            >
              {result.output}
            </motion.pre>
          )}
          {result?.error && (
            <motion.pre
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="whitespace-pre-wrap text-red-600 bg-red-50 p-4 rounded-lg border border-red-200"
            >
              {result.error}
            </motion.pre>
          )}
          {!result?.output && !result?.error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-gray-500 italic"
            >
              No output available
            </motion.p>
          )}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-4 text-right text-xs text-gray-500"
          >
            Memory: {result?.memoryUsage ? `${result.memoryUsage} KB` : "N/A"}
          </motion.div>
        </div>
      </ScrollArea>
    </motion.div>
  );
};
