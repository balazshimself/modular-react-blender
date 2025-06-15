
export interface Node {
  id: string;
  parent?: GroupNode;
}

export interface GroupNode extends Node {
  type: 'group';
  isHorizontal: boolean;
  ratio: number;
  childA: Node;
  childB: Node;
}

export interface LeafNode extends Node {
  type: 'leaf';
  editor: EditorType;
  isFocused: boolean;
}

export type EditorNode = GroupNode | LeafNode;

export enum EditorType {
  VIEWPORT_3D = '3D Viewport',
  OUTLINER = 'Outliner',
  PROPERTIES = 'Properties',
  TIMELINE = 'Timeline',
  SHADER_EDITOR = 'Shader Editor',
  TEXT_EDITOR = 'Text Editor'
}

export interface EditorContext {
  focusedNodeId: string | null;
  setFocusedNode: (nodeId: string) => void;
  updateNode: (nodeId: string, updates: Partial<LeafNode>) => void;
  splitNode: (nodeId: string, direction: 'horizontal' | 'vertical') => void;
  closeNode: (nodeId: string) => void;
  updateRatio: (nodeId: string, ratio: number) => void;
}
