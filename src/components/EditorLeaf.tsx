
import React from 'react';
import { LeafNode, EditorContext, EditorType } from '@/types/editor';
import EditorTopBar from './EditorTopBar';
import AbstractEditor from './editors/AbstractEditor';

interface EditorLeafProps {
  node: LeafNode;
  context: EditorContext;
}

const EditorLeaf: React.FC<EditorLeafProps> = ({ node, context }) => {
  const handleEditorChange = (newEditor: EditorType) => {
    context.updateNode(node.id, { editor: newEditor });
  };

  const handleClose = () => {
    context.closeNode(node.id);
  };

  const handleSplitHorizontal = () => {
    context.splitNode(node.id, 'horizontal');
  };

  const handleSplitVertical = () => {
    context.splitNode(node.id, 'vertical');
  };

  const handleFocus = () => {
    context.setFocusedNode(node.id);
  };

  return (
    <div 
      className="flex flex-col h-full bg-gray-900 border border-gray-700"
      onClick={handleFocus}
    >
      <EditorTopBar
        currentEditor={node.editor}
        onEditorChange={handleEditorChange}
        onClose={handleClose}
        onSplitHorizontal={handleSplitHorizontal}
        onSplitVertical={handleSplitVertical}
        isFocused={node.isFocused}
      />
      <div className="flex-1 overflow-hidden">
        <AbstractEditor
          type={node.editor}
          isFocused={node.isFocused}
        />
      </div>
    </div>
  );
};

export default EditorLeaf;
