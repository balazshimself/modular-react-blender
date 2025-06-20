import React, { useEffect, useState } from "react";
import { useEditorTree } from "@/hooks/useEditorTree";
import EditorNode from "./EditorNode";

const ModularEditor: React.FC = () => {
  const { rootNode, context } = useEditorTree();
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="bg-gray-900"
      style={{
        width: dimensions.width,
        height: dimensions.height,
        overflow: "hidden",
      }}
    >
      <EditorNode node={rootNode} context={context} />
    </div>
  );
};

export default ModularEditor;
