import React from "react";
import { motion } from "framer-motion";

interface ToolButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
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
    className={`
        p-2 rounded-lg transition-all duration-200 
        shadow-md hover:shadow-lg
        flex items-center justify-center
        ${
          active
            ? "bg-blue-500 text-white ring-2 ring-blue-300"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:translate-y-[-2px]"
        }
      `}
    disabled={disabled}
    title={tooltip}
  >
    {icon}
    <span className="
      absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
      px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded-md
      opacity-0 group-hover:opacity-100 transition-opacity duration-200
      pointer-events-none whitespace-nowrap
    ">
      {tooltip}
    </span>
  </motion.button>
);

export default ToolButton;
