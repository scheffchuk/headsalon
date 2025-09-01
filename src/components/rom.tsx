"use client";

import React, { useMemo, useState, useEffect, cache } from "react";
import Link from "next/link";

type RoadmapNode = {
  name: string | string[];
  url?: string;
  children?: RoadmapNode[];
};

type LayoutNode = {
  name: string;
  url?: string;
  x: number;
  y: number;
  depth: number;
  id: string;
  isLeaf: boolean;
  isRoot: boolean;
  hasUrl: boolean;
  children: LayoutNode[];
};

interface TreeLink {
  source: LayoutNode;
  target: LayoutNode;
}

interface RoadmapTreeProps {
  data: RoadmapNode;
  width?: number;
}

// Layout configuration constants
const LAYOUT_CONFIG = {
  HORIZONTAL_INDENT: 150,
  VERTICAL_SPACING: 80,
  ARTICLE_SPACING: 25,
  ARTICLE_INDENT: 20,
  SECTION_SPACING: 30,
  BASE_X: 50,
  BASE_Y: 50,
  BOTTOM_PADDING: 100,
} as const;

const MARGIN = { top: 20, right: 10, bottom: 0, left: 10 } as const;

// Pure utility functions
const normalizeNodeName = (name: string | string[]): string =>
  Array.isArray(name) ? name[0] : name;

const isLeafNode = (node: { children?: unknown[] }): boolean =>
  !node.children || node.children.length === 0;

const hasValidUrl = (url?: string): url is string => Boolean(url);

// Create layout node with computed properties
const createLayoutNode = (
  node: RoadmapNode,
  depth: number,
  id: string
): LayoutNode => ({
  name: normalizeNodeName(node.name),
  url: node.url,
  x: 0,
  y: 0,
  depth,
  id,
  isLeaf: isLeafNode(node),
  isRoot: depth === 0,
  hasUrl: hasValidUrl(node.url),
  children: [],
});

// Position a single node based on its type and depth
const positionNode = (node: LayoutNode, depth: number, currentY: number) => {
  node.x = currentY;
  node.y = LAYOUT_CONFIG.BASE_X + depth * LAYOUT_CONFIG.HORIZONTAL_INDENT;
  return currentY + LAYOUT_CONFIG.VERTICAL_SPACING;
};

// Separate child nodes into categories and articles
const separateChildren = (children: LayoutNode[]) => ({
  categories: children.filter((child) => !child.isLeaf),
  articles: children.filter((child) => child.isLeaf),
});

// Tree layout algorithm with dynamic height calculation
function computeTreeLayout(root: RoadmapNode): {
  nodes: LayoutNode[];
  actualHeight: number;
} {
  const nodes: LayoutNode[] = [];
  let nodeIdCounter = 0;

  // First pass: create all nodes with computed properties
  function traverse(node: RoadmapNode, depth = 0): LayoutNode {
    const layoutNode = createLayoutNode(node, depth, `node-${nodeIdCounter++}`);
    nodes.push(layoutNode);

    if (node.children) {
      layoutNode.children = node.children.map((child) =>
        traverse(child, depth + 1)
      );
    }

    return layoutNode;
  }

  // Second pass: position all nodes
  function positionNodes(node: LayoutNode, depth = 0, startY = 0): number {
    let currentY = positionNode(node, depth, startY);

    if (node.children.length === 0) {
      return currentY;
    }

    const { categories, articles } = separateChildren(node.children);

    // Position articles first
    for (const article of articles) {
      article.x = currentY;
      article.y = node.y + LAYOUT_CONFIG.ARTICLE_INDENT;
      currentY += LAYOUT_CONFIG.ARTICLE_SPACING;
    }

    if (articles.length > 0) {
      currentY += LAYOUT_CONFIG.SECTION_SPACING;
    }

    // Position categories
    for (const category of categories) {
      currentY = positionNodes(category, depth + 1, currentY);
      currentY += LAYOUT_CONFIG.SECTION_SPACING;
    }

    return currentY;
  }

  const rootNode = traverse(root);
  const finalY = positionNodes(rootNode, 0, LAYOUT_CONFIG.BASE_Y);
  const actualHeight = finalY + LAYOUT_CONFIG.BOTTOM_PADDING;

  return { nodes, actualHeight };
}

// Generate SVG path for connecting lines
const generatePath = (source: LayoutNode, target: LayoutNode): string => {
  const midX = (source.y + target.y) / 2;
  return `M${source.y},${source.x}C${midX},${source.x} ${midX},${target.x} ${target.y},${target.x}`;
};

// Generate links between connected nodes
const generateLinks = (nodes: LayoutNode[]): TreeLink[] =>
  nodes.flatMap((node) =>
    node.children.map((child) => ({ source: node, target: child }))
  );

// Get node styling based on its properties
const getNodeRadius = (node: LayoutNode): number => {
  if (node.isLeaf && node.hasUrl) return 2.5;
  if (node.isRoot) return 4;
  return 3;
};

const getNodeStrokeClass = (node: LayoutNode): string => {
  if (node.isLeaf && node.hasUrl) return "stroke-blue-400";
  if (node.isRoot) return "stroke-gray-800 stroke-[2px]";
  return "stroke-blue-500 stroke-[2px]";
};

const getTextClass = (node: LayoutNode): string =>
  node.isRoot ? "text-base font-bold" : "text-xs font-semibold";

const getTextFill = (node: LayoutNode): string =>
  node.isRoot ? "#1f2937" : "#374151";

// Reusable TreeNode component
interface TreeNodeProps {
  node: LayoutNode;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node }) => (
  <g
    key={node.id}
    transform={`translate(${node.y}, ${node.x})`}
    className="roadmap-node"
  >
    <circle
      r={getNodeRadius(node)}
      className={`fill-white stroke-[1.5px] ${getNodeStrokeClass(node)}`}
    />

    {node.isLeaf && node.hasUrl && node.url ? (
      <>
        <text
          dy={3}
          dx={6}
          textAnchor="start"
          className="text-xs"
          fill="#2563eb"
          pointerEvents="none"
        >
          {node.name}
        </text>
        <foreignObject
          x={6}
          y={-8}
          width={Math.max(80, node.name.length * 16)}
          height={16}
        >
          <Link
            href={node.url}
            className="block w-full h-full cursor-pointer"
            title={node.name}
          >
            <span className="sr-only">{node.name}</span>
          </Link>
        </foreignObject>
      </>
    ) : (
      <text
        dy={-6}
        dx={0}
        textAnchor="middle"
        className={getTextClass(node)}
        fill={getTextFill(node)}
      >
        {node.name}
      </text>
    )}
  </g>
);

// Main component
export default function Rom({ data, width = 800 }: RoadmapTreeProps) {
  const { nodes, links, actualHeight } = useMemo(() => {
    const { nodes, actualHeight } = computeTreeLayout(data);
    const links = generateLinks(nodes);
    return { nodes, links, actualHeight };
  }, [data]);

  return (
    <div className="roadmap-tree w-full">
      <div>
        <svg
          width={width + MARGIN.right + MARGIN.left}
          height={actualHeight + MARGIN.top + MARGIN.bottom}
          className="font-sans"
        >
          <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
            {/* Render connection lines */}
            {links.map((link, index) => (
              <path
                key={`link-${index}`}
                d={generatePath(link.source, link.target)}
                className="fill-none stroke-gray-300 stroke-2"
              />
            ))}

            {/* Render nodes */}
            {nodes.map((node) => (
              <TreeNode key={node.id} node={node} />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}

// Loading component
const LoadingState = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    <span className="ml-3 text-gray-600">加载海德沙龙刷机包...</span>
  </div>
);

// Error component
const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="text-red-500 text-lg mb-2">⚠️ 加载失败</div>
      <div className="text-gray-600">{message}</div>
    </div>
  </div>
);

// Data fetching utility
const fetchRomData = cache(async (): Promise<RoadmapNode> => {
  const response = await fetch("/rom-file.json");
  if (!response.ok) {
    throw new Error("Failed to load rom file data");
  }
  return response.json();
});

// Data loading wrapper component
export function HeadSalonRom() {
  const [romData, setRomData] = useState<RoadmapNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRomData()
      .then((data) => {
        setRomData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!romData) return null;

  return <Rom data={romData} />;
}
