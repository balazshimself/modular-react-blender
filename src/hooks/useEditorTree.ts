
import { useState, useCallback } from 'react';
import { EditorNode, LeafNode, GroupNode, EditorType, EditorContext } from '@/types/editor';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useEditorTree = () => {
  const [rootNode, setRootNode] = useState<EditorNode>(() => {
    const initialLeaf: LeafNode = {
      id: generateId(),
      type: 'leaf',
      editor: EditorType.VIEWPORT_3D,
      isFocused: true
    };
    return initialLeaf;
  });

  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(rootNode.id);

  const findNode = useCallback((nodeId: string, node: EditorNode = rootNode): EditorNode | null => {
    if (node.id === nodeId) return node;
    
    if (node.type === 'group') {
      return findNode(nodeId, node.childA) || findNode(nodeId, node.childB);
    }
    
    return null;
  }, [rootNode]);

  const updateNodeInTree = useCallback((
    nodeId: string, 
    updater: (node: EditorNode) => EditorNode,
    node: EditorNode = rootNode
  ): EditorNode => {
    if (node.id === nodeId) {
      return updater(node);
    }
    
    if (node.type === 'group') {
      return {
        ...node,
        childA: updateNodeInTree(nodeId, updater, node.childA),
        childB: updateNodeInTree(nodeId, updater, node.childB)
      };
    }
    
    return node;
  }, [rootNode]);

  const setFocusedNode = useCallback((nodeId: string) => {
    setFocusedNodeId(nodeId);
    setRootNode(prevRoot => {
      const updateFocus = (node: EditorNode): EditorNode => {
        if (node.type === 'leaf') {
          return { ...node, isFocused: node.id === nodeId };
        } else {
          return {
            ...node,
            childA: updateFocus(node.childA),
            childB: updateFocus(node.childB)
          };
        }
      };
      return updateFocus(prevRoot);
    });
  }, []);

  const updateNode = useCallback((nodeId: string, updates: Partial<LeafNode>) => {
    setRootNode(prevRoot => 
      updateNodeInTree(nodeId, (node) => ({ ...node, ...updates }), prevRoot)
    );
  }, [updateNodeInTree]);

  const splitNode = useCallback((nodeId: string, direction: 'horizontal' | 'vertical') => {
    const targetNode = findNode(nodeId);
    if (!targetNode || targetNode.type !== 'leaf') return;

    // Create two new leaf nodes with the same editor type as the original
    const newLeafA: LeafNode = {
      id: generateId(),
      type: 'leaf',
      editor: targetNode.editor,
      isFocused: true
    };

    const newLeafB: LeafNode = {
      id: generateId(),
      type: 'leaf',
      editor: targetNode.editor,
      isFocused: false
    };

    const newGroup: GroupNode = {
      id: generateId(),
      type: 'group',
      isHorizontal: direction === 'horizontal',
      ratio: 0.5,
      childA: newLeafA,
      childB: newLeafB,
      parent: targetNode.parent
    };

    // Update parent references
    newGroup.childA.parent = newGroup;
    newGroup.childB.parent = newGroup;

    setRootNode(prevRoot => {
      if (prevRoot.id === nodeId) {
        return newGroup;
      }
      return updateNodeInTree(nodeId, () => newGroup, prevRoot);
    });

    // Focus the first child
    setFocusedNode(newLeafA.id);
  }, [findNode, updateNodeInTree, setFocusedNode]);

  const closeNode = useCallback((nodeId: string) => {
    const targetNode = findNode(nodeId);
    if (!targetNode || targetNode.type !== 'leaf' || !targetNode.parent) return;

    const parent = targetNode.parent;
    const sibling = parent.childA.id === nodeId ? parent.childB : parent.childA;
    
    // Update sibling's parent reference to match the parent's parent
    const updatedSibling = { ...sibling, parent: parent.parent };

    setRootNode(prevRoot => {
      if (prevRoot.id === parent.id) {
        // If parent is root, sibling becomes new root
        return updatedSibling;
      }
      // Replace parent with sibling in the tree
      return updateNodeInTree(parent.id, () => updatedSibling, prevRoot);
    });

    // Update focus if the closed node was focused
    if (focusedNodeId === nodeId) {
      if (updatedSibling.type === 'leaf') {
        setFocusedNode(updatedSibling.id);
      } else {
        // Find first leaf in sibling subtree
        const findFirstLeaf = (node: EditorNode): string | null => {
          if (node.type === 'leaf') return node.id;
          return findFirstLeaf(node.childA) || findFirstLeaf(node.childB);
        };
        const firstLeafId = findFirstLeaf(updatedSibling);
        if (firstLeafId) setFocusedNode(firstLeafId);
      }
    }
  }, [findNode, updateNodeInTree, focusedNodeId, setFocusedNode]);

  const updateRatio = useCallback((nodeId: string, ratio: number) => {
    setRootNode(prevRoot => 
      updateNodeInTree(nodeId, (node) => 
        node.type === 'group' ? { ...node, ratio } : node, 
        prevRoot
      )
    );
  }, [updateNodeInTree]);

  const context: EditorContext = {
    focusedNodeId,
    setFocusedNode,
    updateNode,
    splitNode,
    closeNode,
    updateRatio
  };

  return { rootNode, context };
};
