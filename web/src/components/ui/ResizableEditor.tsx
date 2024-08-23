import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./resizable";

interface ResizableEditorProps {
  header: React.ReactNode;
  editor: React.ReactNode;
  output: React.ReactNode;
}

export function ResizableEditor({ header, editor, output }: ResizableEditorProps) {
  return (
    <ResizablePanelGroup direction="vertical" className="w-full">
      <ResizablePanel defaultSize={75}>
        {header}
        {editor}
      </ResizablePanel>
      <ResizableHandle />
      {output && (
        <ResizablePanel defaultSize={25} className="border-gray-400">
          {output}
        </ResizablePanel>
      )}
    </ResizablePanelGroup>
  );
}