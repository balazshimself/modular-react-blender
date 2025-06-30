import { useState, useCallback, useEffect } from "react";
import {
  EditorNode,
  LeafNode,
  GroupNode,
  EditorType,
  EditorContext,
} from "@/types/editor";

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useEditorTree = () => {
  const [rootNodeId, setRootNodeId] = useState<string>(() => {
    return generateId();
  });

  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(rootNodeId);
  const [maximizedNodeId, setMaximizedNodeId] = useState<string | null>(null);
  const [preMaximizeRootId, setPreMaximizeRootId] = useState<string | null>(
    null
  );

  const [editorMap, setEditorMap] = useState<Map<string, EditorNode>>(() => {
    const initialLeaf: LeafNode = {
      id: rootNodeId,
      type: "leaf",
      editor: EditorType.VIEWPORT_3D,
      isFocused: true,
    };

    const initialMap = new Map<string, EditorNode>();
    initialMap.set(rootNodeId, initialLeaf);
    return initialMap;
  });

  // Helper function to build tree structure from the map for display/traversal
  const buildTreeFromMap = useCallback(
    (nodeId: string): EditorNode | null => {
      const node = editorMap.get(nodeId);
      if (!node) return null;

      if (node.type === "leaf") {
        return node;
      } else {
        // For group nodes, get children from map and build full tree structure
        const groupNode = node as GroupNode;
        const childA = buildTreeFromMap(groupNode.childA_id);
        const childB = buildTreeFromMap(groupNode.childB_id);

        if (!childA || !childB) return null;

        // Return a tree-structured GroupNode (for compatibility with existing code)
        return {
          ...groupNode,
          childA,
          childB,
        } as any; // We know this will have the right shape for tree traversal
      }
    },
    [editorMap]
  );

  // Get the current root node tree
  const rootNode = buildTreeFromMap(maximizedNodeId || rootNodeId);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === "Space") {
        e.preventDefault();
        toggleMaximize();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedNodeId, maximizedNodeId]);

  const toggleMaximize = useCallback(() => {
    if (maximizedNodeId) {
      setMaximizedNodeId(null);
      if (preMaximizeRootId) {
        setRootNodeId(preMaximizeRootId);
        setPreMaximizeRootId(null);
      }
    } else {
      if (focusedNodeId) {
        const focusedNode = editorMap.get(focusedNodeId);
        if (focusedNode && focusedNode.type === "leaf") {
          setPreMaximizeRootId(rootNodeId);
          setMaximizedNodeId(focusedNodeId);
        }
      }
    }
  }, [focusedNodeId, maximizedNodeId, rootNodeId, editorMap]);

  useEffect(() => {
    if (rootNode) {
      printTree(rootNode);
    }
  }, [rootNode]);

  useEffect(() => {
    console.log("Editor Map Updated:", Array.from(editorMap.entries()));
  }, [editorMap]);

  function printTree(startNode: any, depth = 0) {
    const indent = "  ".repeat(depth);
    console.log(
      `${indent}${startNode.type} - ${startNode.id}, ${
        startNode.type === "leaf" ? startNode.editor : ""
      }`
    );

    if (startNode.type === "group") {
      printTree(startNode.childA, depth + 1);
      printTree(startNode.childB, depth + 1);
    }
  }

  const setFocusedNode = useCallback((nodeId: string) => {
    setFocusedNodeId(nodeId);

    // Update focus state for all leaf nodes in the map
    setEditorMap((prevMap) => {
      const newMap = new Map(prevMap);

      for (const [id, node] of newMap) {
        if (node.type === "leaf") {
          newMap.set(id, {
            ...node,
            isFocused: id === nodeId,
          });
        }
      }

      return newMap;
    });
  }, []);

  const updateNode = useCallback(
    (nodeId: string, updates: Partial<LeafNode>) => {
      setEditorMap((prevMap) => {
        const newMap = new Map(prevMap);
        const targetNode = newMap.get(nodeId);

        if (!targetNode || targetNode.type !== "leaf") return prevMap;

        // Update the node in the map
        newMap.set(nodeId, { ...targetNode, ...updates });
        return newMap;
      });
    },
    []
  );

  const splitNode = useCallback(
    (nodeId: string, direction: "horizontal" | "vertical") => {
      const targetNode = editorMap.get(nodeId);
      console.log("Splitting node:", nodeId, "Direction:", direction);

      if (!targetNode || targetNode.type !== "leaf") return;

      // Create new node IDs
      const newLeafAId = generateId();
      const newLeafBId = generateId();
      const newGroupId = generateId();

      // Create two new leaf nodes with the same editor type as the original
      const newLeafA: LeafNode = {
        id: newLeafAId,
        type: "leaf",
        editor: (targetNode as LeafNode).editor,
        isFocused: true,
        parent_id: newGroupId,
      };

      const newLeafB: LeafNode = {
        id: newLeafBId,
        type: "leaf",
        editor: (targetNode as LeafNode).editor,
        isFocused: false,
        parent_id: newGroupId,
      };

      // Create group node with ID references
      const newGroup: GroupNode = {
        id: newGroupId,
        type: "group",
        isHorizontal: direction === "horizontal",
        ratio: 0.5,
        childA_id: newLeafAId,
        childB_id: newLeafBId,
        parent_id: targetNode.parent_id,
      };

      setEditorMap((prevMap) => {
        const newMap = new Map(prevMap);

        // Remove the original node
        newMap.delete(nodeId);

        // Add new nodes to map
        newMap.set(newLeafAId, newLeafA);
        newMap.set(newLeafBId, newLeafB);
        newMap.set(newGroupId, newGroup);

        // Update parent's reference if it exists
        if (targetNode.parent_id) {
          const parent = newMap.get(targetNode.parent_id);
          if (parent && parent.type === "group") {
            const parentGroup = parent as GroupNode;
            const updatedParent: GroupNode = {
              ...parentGroup,
              childA_id:
                parentGroup.childA_id === nodeId
                  ? newGroupId
                  : parentGroup.childA_id,
              childB_id:
                parentGroup.childB_id === nodeId
                  ? newGroupId
                  : parentGroup.childB_id,
            };
            newMap.set(targetNode.parent_id, updatedParent);
          }
        }

        return newMap;
      });

      // Update root node ID if we're splitting the root
      if (rootNodeId === nodeId) {
        setRootNodeId(newGroupId);
      }

      setFocusedNode(newLeafAId);
    },
    [editorMap, rootNodeId, setFocusedNode]
  );

  const closeNode = useCallback(
    (nodeId: string) => {
      const targetNode = editorMap.get(nodeId);
      if (!targetNode || !targetNode.parent_id) return;

      const parent = editorMap.get(targetNode.parent_id);
      if (!parent || parent.type !== "group") return;

      const parentGroup = parent as GroupNode;
      const isChildA = parentGroup.childA_id === nodeId;
      const siblingId = isChildA
        ? parentGroup.childB_id
        : parentGroup.childA_id;
      const sibling = editorMap.get(siblingId);

      if (!sibling) return;

      console.log("Closing node:", nodeId);
      console.log(
        "Sibling node:",
        siblingId,
        sibling.type === "leaf" ? (sibling as LeafNode).editor : "group"
      );

      setEditorMap((prevMap) => {
        const newMap = new Map(prevMap);

        // Remove the target node and its parent
        newMap.delete(nodeId);
        newMap.delete(targetNode.parent_id!);

        // Update sibling's parent reference
        const updatedSibling = {
          ...sibling,
          parent_id: parentGroup.parent_id,
        };
        newMap.set(siblingId, updatedSibling);

        // Update grandparent's reference if it exists
        if (parentGroup.parent_id) {
          const grandParent = newMap.get(parentGroup.parent_id);
          if (grandParent && grandParent.type === "group") {
            const grandParentGroup = grandParent as GroupNode;
            const updatedGrandParent: GroupNode = {
              ...grandParentGroup,
              childA_id:
                grandParentGroup.childA_id === targetNode.parent_id
                  ? siblingId
                  : grandParentGroup.childA_id,
              childB_id:
                grandParentGroup.childB_id === targetNode.parent_id
                  ? siblingId
                  : grandParentGroup.childB_id,
            };
            newMap.set(parentGroup.parent_id, updatedGrandParent);
          }
        }

        return newMap;
      });

      // Update root if we closed the parent of root
      if (rootNodeId === targetNode.parent_id) {
        setRootNodeId(siblingId);
      }

      // Focus the sibling or its first leaf
      const findFirstLeafId = (id: string): string => {
        const node = editorMap.get(id);
        if (!node) return id;

        if (node.type === "leaf") {
          return id;
        }

        const groupNode = node as GroupNode;
        return findFirstLeafId(groupNode.childA_id);
      };

      const nodeToFocus =
        sibling.type === "leaf" ? siblingId : findFirstLeafId(siblingId);
      setFocusedNode(nodeToFocus);
    },
    [editorMap, rootNodeId, setFocusedNode]
  );

  const updateRatio = useCallback((nodeId: string, ratio: number) => {
    setEditorMap((prevMap) => {
      const newMap = new Map(prevMap);
      const targetNode = newMap.get(nodeId);

      if (targetNode && targetNode.type === "group") {
        newMap.set(nodeId, { ...targetNode, ratio });
      }

      return newMap;
    });
  }, []);

  const context: EditorContext = {
    focusedNodeId,
    setFocusedNode,
    updateNode,
    splitNode,
    closeNode,
    updateRatio,
    isMaximized: maximizedNodeId !== null,
    toggleMaximize,
  };

  return { rootNode, context };
};
