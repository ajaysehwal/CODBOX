import React from "react";
import { motion } from "framer-motion";

interface ToolButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  tooltip: string;
}

const ToolButton: React.FC<ToolButtonProps> = ({
  icon,
  onClick,
  active,
  disabled,
  tooltip,
}) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`p-2 rounded-md transition-colors duration-200 text-center m-auto ${
      active ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"
    } ${
      disabled
        ? "opacity-50 cursor-not-allowed"
        : "hover:bg-gray-600 hover:text-white"
    }`}
    disabled={disabled}
    title={tooltip}
  >
    {icon}
  </motion.button>
);

export default ToolButton;