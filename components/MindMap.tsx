import React from 'react';
import { LearningPath, MindMapNode as MindMapNodeType } from '../types';
import { useMindMap } from '../hooks/useMindMap';
import { ZoomInIcon } from './icons/ZoomInIcon';
import { ZoomOutIcon } from './icons/ZoomOutIcon';
import { CenterFocusIcon } from './icons/CenterFocusIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface MindMapProps {
  path: LearningPath;
  onNodeSelect: (nodeId: string) => void;
  selectedNodeId: string | null;
}

const MindMapNode: React.FC<{ node: MindMapNodeType; onToggle: (id: string) => void; onSelect: (id: string) => void; isSelected: boolean; }> = React.memo(({ node, onToggle, onSelect, isSelected }) => {
    const hasChildren = node.children.length > 0;
    
    return (
        <g
            transform={`translate(${node.x}, ${node.y})`}
            className="transition-all duration-500 ease-in-out"
        >
            {/* Main node body */}
            <g className="cursor-pointer group" onClick={() => onSelect(node.id)}>
                <circle
                    r="10"
                    fill={isSelected ? 'var(--accent-primary)' : 'var(--bg-tertiary)'}
                    stroke="var(--border-secondary)"
                    strokeWidth="2"
                    className="transition-colors duration-300"
                />
                {isSelected && <circle r="14" fill="var(--accent-glow)" className="pointer-events-none" />}
                <text
                    textAnchor="middle"
                    y="-20"
                    fill="var(--text-primary)"
                    className="font-pen text-lg select-none pointer-events-none transition-colors duration-300 group-hover:fill-[var(--accent-primary)]"
                >
                    {node.label}
                </text>
            </g>

            {/* Expander button */}
            {hasChildren && (
                 <g 
                    onClick={() => onToggle(node.id)} 
                    className="cursor-pointer"
                    transform="translate(0, 10)"
                >
                    <rect x="-10" y="-1" width="20" height="12" fill="transparent" />
                    <ChevronDownIcon
                        className={`w-5 h-5 text-[var(--text-tertiary)] transition-transform duration-300 ease-in-out`}
                        style={{ transform: `translateX(-10px) translateY(0px) rotate(${node.isExpanded ? '0deg' : '-90deg'})` }}
                    />
                </g>
            )}
        </g>
    );
});


const MindMap: React.FC<MindMapProps> = ({ path, onNodeSelect, selectedNodeId }) => {
    const {
        svgRef,
        visibleNodes,
        visibleEdges,
        viewBox,
        handleToggleNode,
        handleBackgroundMouseDown,
        handleWheel,
        zoomIn,
        zoomOut,
        resetView,
    } = useMindMap({ initialPath: path });

    return (
        <div className="w-full h-full relative font-pen overflow-hidden rounded-lg bg-[var(--bg-primary)]" style={{
            backgroundImage: 'radial-gradient(var(--border-primary) 1px, transparent 0)',
            backgroundSize: '20px 20px'
        }}>
            <svg
                ref={svgRef}
                className="w-full h-full cursor-grab active:cursor-grabbing"
                viewBox={viewBox}
                onMouseDown={handleBackgroundMouseDown}
                onWheel={handleWheel}
            >
                <defs>
                    <filter id="pencilTexture">
                        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="1" result="turbulence" />
                        <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="1.5" />
                    </filter>
                </defs>
                <g>
                    {visibleEdges.map(edge => (
                         <path
                            key={edge.id}
                            d={`M ${edge.source.x} ${edge.source.y + 15} C ${edge.source.x} ${(edge.source.y + edge.target.y)/2}, ${edge.target.x} ${(edge.source.y + edge.target.y)/2}, ${edge.target.x} ${edge.target.y}`}
                            stroke="var(--text-tertiary)"
                            strokeWidth="1.5"
                            fill="none"
                            filter="url(#pencilTexture)"
                            className="animate-path-draw"
                             style={{
                                strokeDasharray: 500,
                                strokeDashoffset: 500,
                            }}
                        />
                    ))}
                    {visibleNodes.map(node => (
                       <MindMapNode 
                            key={node.id} 
                            node={node} 
                            onToggle={handleToggleNode}
                            onSelect={onNodeSelect}
                            isSelected={selectedNodeId === node.id}
                        />
                    ))}
                </g>
            </svg>

            <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button onClick={zoomIn} title="Zoom In" className="p-2 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-hover)]"><ZoomInIcon /></button>
                <button onClick={zoomOut} title="Zoom Out" className="p-2 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-hover)]"><ZoomOutIcon /></button>
                <button onClick={resetView} title="Reset View" className="p-2 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-hover)]"><CenterFocusIcon /></button>
            </div>
        </div>
    );
};

export default MindMap;