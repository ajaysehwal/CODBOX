import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
