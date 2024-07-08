import React, { useState } from "react";
import { GiSpeaker } from "react-icons/gi";
import { FaRegCirclePause } from "react-icons/fa6";
import { IoPlayCircleOutline } from "react-icons/io5";
import { IoShareSocialOutline } from "react-icons/io5";
import { TbClipboardCopy, TbClipboardCheck } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
type ButtonOnClickType = {
  onClick: () => void;
};
type ButtonLayoutType = {
  name?: string;
  onClick?: () => void;
  styles?: string;
  icon?: React.ReactNode;
  props?: any;
};
const ButtonLayout = ({
  name,
  onClick,
  styles,
  icon,
  ...props
}: ButtonLayoutType) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            onClick={onClick}
            className={styles}
            {...props}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-700 text-white">
          <p>{name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
export const CopyButton = ({ onClick }: ButtonOnClickType) => {
  const [isCopied, setIsCopied] = useState(false);
  const handleCopyClick = () => {
    onClick();
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };
  const iconToggle: React.ReactNode = !isCopied ? (
    <TbClipboardCopy className="w-6 h-6" />
  ) : (
    <TbClipboardCheck className="w-6 h-6" />
  );
  const Styles =
    "py-2 px-3 inline-flex items-center gap-x-2 text-sm rounded-full border border-transparent text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600";
  return (
    <ButtonLayout
      icon={iconToggle}
      name={isCopied ? "copied" : "copy"}
      onClick={handleCopyClick}
      styles={Styles}
    />
  );
};

export const ShareButton = ({ onClick }: ButtonOnClickType) => {
  const Styles =
    "py-2 px-3 inline-flex items-center gap-x-2 text-sm rounded-full border border-transparent text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600";
  return (
    <ButtonLayout
      icon={<IoShareSocialOutline className="w-6 h-6" />}
      name="share"
      onClick={onClick}
      styles={Styles}
    />
  );
};

export const SpeakButton = ({ onClick }: ButtonOnClickType) => {
  const Styles =
    "py-2 px-3 inline-flex items-center gap-x-2 text-sm rounded-full border border-transparent text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600";

  return (
    <ButtonLayout
      icon={<GiSpeaker className="w-5 h-5" />}
      name="speak"
      onClick={onClick}
      styles={Styles}
    />
  );
};
export const PauseButton = ({ onClick }: ButtonOnClickType) => {
  const Styles =
    "py-2 px-3 inline-flex items-center gap-x-2 text-sm rounded-full border border-transparent text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600";
  return (
    <ButtonLayout
      icon={<FaRegCirclePause className="w-5 h-5" />}
      name="stop"
      onClick={onClick}
      styles={Styles}
    />
  );
};
export const PlayButton = ({ onClick }: ButtonOnClickType) => {
  const Styles =
    "py-2 px-3 inline-flex items-center gap-x-2 text-sm rounded-full border border-transparent text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600";
  return (
    <ButtonLayout
      icon={<IoPlayCircleOutline className="w-5 h-5" />}
      name="stop"
      onClick={onClick}
      styles={Styles}
    />
  );
};


