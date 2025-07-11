import React from "react";
import { GroupNode, EditorContext } from "@/types/editor";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import EditorNode from "./EditorNode";

interface EditorGroupProps {
  node: GroupNode;
  context: EditorContext;
}

const EditorGroup: React.FC<EditorGroupProps> = ({ node, context }) => {
  const handleResize = (sizes: number[]) => {
    const newRatio = sizes[0] / 100;
    context.updateRatio(node.id, newRatio);
    console.log("Ratio updated!!");
  };

  const direction = node.isHorizontal ? "horizontal" : "vertical";
  const sizeA = node.ratio * 100;
  const sizeB = (1 - node.ratio) * 100;
  const nodeWithChildren = node as any;

  return (
    <ResizablePanelGroup
      direction={direction}
      onLayout={handleResize}
      className="h-full"
    >
      <ResizablePanel defaultSize={sizeA} minSize={10}>
        <EditorNode node={nodeWithChildren.childA} context={context} />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={sizeB} minSize={10}>
        <EditorNode node={nodeWithChildren.childB} context={context} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default EditorGroup;
