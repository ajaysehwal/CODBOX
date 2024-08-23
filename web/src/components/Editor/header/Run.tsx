import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context";
import { Play, X } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
const GoogleSignIn = lazy(() => import("../../navbar/signIn"));
import * as DialogPrimitive from "@radix-ui/react-dialog";

interface RunCodeButtonProps {
  run: () => void;
}

export const RunCodeButton: React.FC<RunCodeButtonProps> = ({ run }) => {
  const { isAuth } = useAuth();
  const [open, setOpen] = useState<boolean>(false);

  const compileCode = () => {
    if (isAuth) {
      setOpen(false);
      run();
    } else {
      setOpen(true);
    }
  };

  useEffect(() => {
    isAuth && setOpen(false);
  }, [isAuth]);

  return (
    <>
      <Dialog open={open}>
        <DialogContent className="p-6 max-w-sm mx-auto bg-white rounded-lg shadow-xl border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">
              Sign in to access all features
            </DialogTitle>
          </DialogHeader>
          <Suspense fallback={<Skeleton className="h-10 w-full" />}>
            <GoogleSignIn />
          </Suspense>
          <DialogPrimitive.Close
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogContent>
      </Dialog>

      <Button
        onClick={compileCode}
        className="bg-indigo-500 text-white hover:bg-indigo-600 transition-colors duration-200 shadow-sm flex items-center space-x-2 rounded-md"
      >
        <Play className="w-4 h-4" />
        <span>Run</span>
      </Button>
    </>
  );
};
