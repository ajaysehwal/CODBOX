import { motion } from "framer-motion";
import { Code } from "lucide-react";

export const Logo: React.FC = () => {
  return (
    <div className="w-[40px] h-[40px] [perspective:800px] m-auto">
      <motion.div
        className="w-full h-full relative [transform-style:preserve-3d]"
        animate={{
          rotateX: [0, 360],
          rotateY: [0, 360],
        }}
        transition={{
          duration: 20,
          ease: "easeOut",
          repeat: Infinity,
        }}
      >
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className={`absolute w-full h-full border border-blue-500 bg-blue-50 bg-opacity-20 rounded-sm`}
            style={getFaceStyles(index)}
          />
        ))}

        <div className="absolute w-full h-full flex items-center justify-center [transform-style:preserve-3d]">
          <Code className="text-blue-500" size={28} />
        </div>
      </motion.div>
    </div>
  );
};

const getFaceStyles = (index: number): React.CSSProperties => {
  const common = {
    backfaceVisibility: "visible" as const,
  };
  switch (index) {
    case 0: // front
      return { ...common, transform: "translateZ(20px)" };
    case 1: // back
      return { ...common, transform: "rotateY(180deg) translateZ(20px)" };
    case 2: // right
      return { ...common, transform: "rotateY(90deg) translateZ(20px)" };
    case 3: // left
      return { ...common, transform: "rotateY(-90deg) translateZ(20px)" };
    case 4: // top
      return { ...common, transform: "rotateX(-90deg) translateZ(20px)" };
    case 5: // bottom
      return { ...common, transform: "rotateX(90deg) translateZ(20px)" };
    default:
      return common;
  }
};
