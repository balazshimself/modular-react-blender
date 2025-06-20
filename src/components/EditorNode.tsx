import React from "react";
import { EditorNode as EditorNodeType, EditorContext } from "@/types/editor";
import EditorLeaf from "./EditorLeaf";
import EditorGroup from "./EditorGroup";

interface EditorNodeProps {
  node: EditorNodeType;
  context: EditorContext;
}

const EditorNode: React.FC<EditorNodeProps> = ({ node, context }) => {
  if (node.type === "leaf") {
    return <EditorLeaf node={node} context={context} />;
  } else {
    return <EditorGroup node={node} context={context} />;
  }
};

export default EditorNode;
