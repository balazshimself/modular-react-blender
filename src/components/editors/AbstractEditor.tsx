
import React from 'react';
import { EditorType } from '@/types/editor';

interface AbstractEditorProps {
  type: EditorType;
  isFocused: boolean;
}

const AbstractEditor: React.FC<AbstractEditorProps> = ({ type, isFocused }) => {
  const getEditorContent = () => {
    switch (type) {
      case EditorType.VIEWPORT_3D:
        return (
          <div className="flex items-center justify-center h-full bg-gray-800 text-white">
            <div className="text-center">
              <div className="text-lg font-bold mb-2">3D Viewport</div>
              <div className="text-sm opacity-70">3D scene viewport</div>
            </div>
          </div>
        );
      case EditorType.OUTLINER:
        return (
          <div className="flex items-center justify-center h-full bg-gray-700 text-white">
            <div className="text-center">
              <div className="text-lg font-bold mb-2">Outliner</div>
              <div className="text-sm opacity-70">Scene hierarchy</div>
            </div>
          </div>
        );
      case EditorType.PROPERTIES:
        return (
          <div className="flex items-center justify-center h-full bg-gray-600 text-white">
            <div className="text-center">
              <div className="text-lg font-bold mb-2">Properties</div>
              <div className="text-sm opacity-70">Object properties</div>
            </div>
          </div>
        );
      case EditorType.TIMELINE:
        return (
          <div className="flex items-center justify-center h-full bg-gray-900 text-white">
            <div className="text-center">
              <div className="text-lg font-bold mb-2">Timeline</div>
              <div className="text-sm opacity-70">Animation timeline</div>
            </div>
          </div>
        );
      case EditorType.SHADER_EDITOR:
        return (
          <div className="flex items-center justify-center h-full bg-purple-800 text-white">
            <div className="text-center">
              <div className="text-lg font-bold mb-2">Shader Editor</div>
              <div className="text-sm opacity-70">Node-based shading</div>
            </div>
          </div>
        );
      case EditorType.TEXT_EDITOR:
        return (
          <div className="flex items-center justify-center h-full bg-blue-800 text-white">
            <div className="text-center">
              <div className="text-lg font-bold mb-2">Text Editor</div>
              <div className="text-sm opacity-70">Code and text editing</div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full bg-gray-500 text-white">
            <div>Unknown Editor</div>
          </div>
        );
    }
  };

  return (
    <div className={`h-full ${isFocused ? 'ring-2 ring-blue-500' : ''}`}>
      {getEditorContent()}
    </div>
  );
};

export default AbstractEditor;
