import { motion } from "framer-motion";
import ToolButton from "./ToolBarButton";
import { useWhiteBoard } from "./hooks/useWhiteBoard";

export default function Whiteboard() {
  const {
    toolbarItems,
    handleToolChange,
    activeTool,
    actionItems,
    canvasRef,
    startDrawing,
    stopDrawing,
    color,
    setColor,
    draw,
  } = useWhiteBoard();

  return (
    <div className="flex w-full h-full bg-gray-100">
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col h-full w-28 bg-[rgb(217,232,254)] shadow-lg py-6 px-2 items-center"
      >
        <div className="grid grid-cols-2 gap-2 mb-4">
          {toolbarItems.map((item) => (
            <ToolButton
              key={item.tool}
              icon={item.icon}
              onClick={() => handleToolChange(item.tool)}
              active={activeTool === item.tool}
              tooltip={item.tooltip}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {actionItems.map((item) => (
            <ToolButton
              key={item.tooltip}
              icon={item.icon}
              onClick={item.action}
              tooltip={item.tooltip}
            />
          ))}
        </div>
        <div className="flex justify-center mt-4 w-full">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="border-2 border-gray-300 cursor-pointer"
          />
        </div>
      </motion.div>
      <div className="flex-grow bg-white rounded-lg relative">
        <motion.canvas
          ref={canvasRef}
          className="w-full h-full"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
        />
      </div>
    </div>
  );
}
