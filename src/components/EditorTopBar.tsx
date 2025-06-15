
import React from 'react';
import { X } from 'lucide-react';
import { EditorType } from '@/types/editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditorTopBarProps {
  currentEditor: EditorType;
  onEditorChange: (editor: EditorType) => void;
  onClose: () => void;
  isFocused: boolean;
}

const EditorTopBar: React.FC<EditorTopBarProps> = ({
  currentEditor,
  onEditorChange,
  onClose,
  isFocused
}) => {
  const editorOptions = Object.values(EditorType);

  return (
    <div className={`flex items-center justify-between px-2 py-1 bg-gray-800 border-b border-gray-700 ${
      isFocused ? 'bg-gray-700' : ''
    }`}>
      <Select value={currentEditor} onValueChange={(value) => onEditorChange(value as EditorType)}>
        <SelectTrigger className="w-40 h-7 text-xs bg-transparent border-gray-600 text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {editorOptions.map((editor) => (
            <SelectItem key={editor} value={editor} className="text-xs">
              {editor}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <button
        onClick={onClose}
        className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
      >
        <X size={12} />
      </button>
    </div>
  );
};

export default EditorTopBar;
