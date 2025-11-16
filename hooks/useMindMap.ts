import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { LearningPath, MindMapNode, MindMapEdge } from '../types';

interface UseMindMapProps {
    initialPath: LearningPath;
}

const LAYOUT_CONFIG = {
    levelSeparation: 120,
    siblingSeparation: 60,
};

export function useMindMap({ initialPath }: UseMindMapProps) {
    const [tree, setTree] = useState<MindMapNode | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [viewBox, setViewBox] = useState('0 0 1000 600');
    const [isPanning, setIsPanning] = useState(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const svgRef = useRef<SVGSVGElement>(null);
    

    // --- INITIALIZATION ---
    useEffect(() => {
        const width = svgRef.current?.clientWidth || 1000;
        const height = svgRef.current?.clientHeight || 600;
        setViewBox(`-${width / 2} -${height / 2} ${width} ${height}`);
        
        const nodesMap = new Map<string, MindMapNode>();
        initialPath.nodes.forEach(n => {
            nodesMap.set(n.id, { ...n, x: 0, y: 0, children: [], isExpanded: false, level: 0 });
        });

        initialPath.edges.forEach(e => {
            const parent = nodesMap.get(e.from);
            const child = nodesMap.get(e.to);
            if (parent && child) {
                parent.children.push(child);
                child.parent = parent.id;
            }
        });
        
        const childrenIds = new Set(initialPath.edges.map(e => e.to));
        const rootNode = Array.from(nodesMap.values()).find(n => !childrenIds.has(n.id));

        if (rootNode) {
             setExpandedNodes(new Set([rootNode.id]));
             rootNode.isExpanded = true;
             setTree(rootNode);
        }

    }, [initialPath]);
    
     const { visibleNodes, visibleEdges } = useMemo(() => {
        if (!tree) return { visibleNodes: [], visibleEdges: [] };

        const nodes: MindMapNode[] = [];
        const edges: MindMapEdge[] = [];
        const modifiers: { [key: string]: number } = {};

        function assignLevels(node: MindMapNode, level: number) {
            node.level = level;
            node.isExpanded = expandedNodes.has(node.id);
            if(node.isExpanded) {
                 node.children.forEach(child => assignLevels(child, level + 1));
            }
        }
        
        function calculateInitialPositions(node: MindMapNode) {
            node.children.forEach(calculateInitialPositions);
            let x = 0;
            if (node.children.length === 0) {
                x = 0;
            } else {
                x = (node.children[0].x + node.children[node.children.length - 1].x) / 2;
            }
            node.x = x;
        }
        
        function fixCollisions(node: MindMapNode) {
            for (let i = 0; i < node.children.length - 1; i++) {
                const rightContour = getContour(node.children[i], 'right');
                const leftContour = getContour(node.children[i+1], 'left');

                for(let level = 0; level < Math.min(rightContour.length, leftContour.length); level++) {
                    const distance = rightContour[level] - leftContour[level];
                    if (distance > 0) {
                        const shift = distance + LAYOUT_CONFIG.siblingSeparation;
                        moveSubtree(node.children[i+1], shift);
                    }
                }
            }
             node.children.forEach(fixCollisions);
        }
        
        function getContour(node: MindMapNode, side: 'left' | 'right', contour: number[] = [], level = 0): number[] {
            contour[level] = node.x;
            if (node.children.length > 0) {
                const child = side === 'left' ? node.children[0] : node.children[node.children.length - 1];
                getContour(child, side, contour, level + 1);
            }
            return contour;
        }

        function moveSubtree(node: MindMapNode, shift: number) {
            node.x += shift;
            node.children.forEach(child => moveSubtree(child, shift));
        }

        function calculateFinalPositions(node: MindMapNode, mod: number = 0) {
            node.x += mod;
            node.y = node.level * LAYOUT_CONFIG.levelSeparation;
            
            nodes.push(node);
            
            if (node.isExpanded) {
                node.children.forEach(child => {
                     edges.push({id: `${node.id}-${child.id}`, from: node.id, to: child.id});
                     calculateFinalPositions(child, mod + (modifiers[node.id] || 0));
                });
            }
        }
        
        assignLevels(tree, 0);
        calculateInitialPositions(tree);
        fixCollisions(tree);
        calculateFinalPositions(tree);

        // Center the tree
        const minX = Math.min(...nodes.map(n => n.x));
        const maxX = Math.max(...nodes.map(n => n.x));
        const xOffset = (minX + maxX) / 2;
        nodes.forEach(n => n.x -= xOffset);


        const finalEdges = edges.map(edge => {
            const source = nodes.find(n => n.id === edge.from);
            const target = nodes.find(n => n.id === edge.to);
            return { ...edge, source, target };
        }).filter(e => e.source && e.target) as (MindMapEdge & { source: MindMapNode, target: MindMapNode })[];

        return { visibleNodes: nodes, visibleEdges: finalEdges };

    }, [tree, expandedNodes]);


    // --- UTILITIES ---
    const getSVGPoint = (e: React.MouseEvent): { x: number; y: number } => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const pt = svgRef.current.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const screenCTM = svgRef.current.getScreenCTM();
        if (screenCTM) {
            return pt.matrixTransform(screenCTM.inverse());
        }
        return { x: 0, y: 0 };
    };

    // --- INTERACTION HANDLERS ---
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const [x, y, w, h] = viewBox.split(' ').map(parseFloat);
        const scale = 1.1;
        const newW = e.deltaY > 0 ? w * scale : w / scale;
        const newH = e.deltaY > 0 ? h * scale : h / scale;
        
        const mousePoint = getSVGPoint(e);
        const newX = mousePoint.x - (mousePoint.x - x) * (newW / w);
        const newY = mousePoint.y - (mousePoint.y - y) * (newH / h);

        setViewBox(`${newX} ${newY} ${newW} ${newH}`);
    };

    const handleBackgroundMouseDown = (e: React.MouseEvent) => {
        if (e.target === svgRef.current) {
            setIsPanning(true);
            lastMousePos.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isPanning) {
             const [vx, vy, vw, vh] = viewBox.split(' ').map(parseFloat);
             const dx = (e.clientX - lastMousePos.current.x) * (vw / (svgRef.current?.clientWidth || 1));
             const dy = (e.clientY - lastMousePos.current.y) * (vh / (svgRef.current?.clientHeight || 1));
             setViewBox(`${vx - dx} ${vy - dy} ${vw} ${vh}`);
             lastMousePos.current = { x: e.clientX, y: e.clientY };
        }
    }, [isPanning, viewBox]);

    const handleMouseUp = useCallback(() => {
        setIsPanning(false);
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const handleToggleNode = (nodeId: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
    }
    
    const zoom = (factor: number) => {
        const [x, y, w, h] = viewBox.split(' ').map(parseFloat);
        const newW = w * factor;
        const newH = h * factor;
        const newX = x + (w - newW) / 2;
        const newY = y + (h - newH) / 2;
        setViewBox(`${newX} ${newY} ${newW} ${newH}`);
    };
    const zoomIn = () => zoom(0.8);
    const zoomOut = () => zoom(1.2);
    const resetView = () => {
        const width = svgRef.current?.clientWidth || 1000;
        const height = svgRef.current?.clientHeight || 600;
        setViewBox(`-${width/2} -${height/2} ${width} ${height}`);
    };
    
    return {
        svgRef,
        visibleNodes,
        visibleEdges,
        viewBox,
        handleBackgroundMouseDown,
        handleWheel,
        handleToggleNode,
        zoomIn,
        zoomOut,
        resetView,
    };
}