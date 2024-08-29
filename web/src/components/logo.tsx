import { motion } from "framer-motion";
import { FaCode } from "react-icons/fa";

const CubeLogo = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div
        className="w-32 h-32 relative transform-3d"
        style={{ perspective: "1000px" }}
      >
        <motion.div
          className="w-full h-full absolute"
          animate={{ rotateY: 45, rotateX: -20 }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front face */}
          <div className="absolute w-full h-full bg-blue-500 flex items-center justify-center">
            <FaCode className="text-white text-4xl" />
          </div>

          {/* Back face */}
          <div
            className="absolute w-full h-full bg-blue-700"
            style={{ transform: "translateZ(-32px) rotateY(180deg)" }}
          />

          {/* Left face */}
          <div
            className="absolute w-full h-full bg-blue-600"
            style={{ transform: "translateX(-16px) rotateY(-90deg)" }}
          />

          {/* Right face */}
          <div
            className="absolute w-full h-full bg-blue-600"
            style={{ transform: "translateX(16px) rotateY(90deg)" }}
          />

          {/* Top face */}
          <div
            className="absolute w-full h-full bg-blue-400"
            style={{ transform: "translateY(-16px) rotateX(90deg)" }}
          />

          {/* Bottom face */}
          <div
            className="absolute w-full h-full bg-blue-400"
            style={{ transform: "translateY(16px) rotateX(-90deg)" }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default CubeLogo;
