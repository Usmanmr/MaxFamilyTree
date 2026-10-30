import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  Connection, 
  Edge,
  Node,
  MarkerType,
  BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useTreeStore } from '../../store/treeStore';
import PersonNode, { PersonNodeData } from './PersonNode';
import { SpouseEdge, ParentChildEdge, SiblingEdge, AdoptiveEdge, StepEdge } from './RelationshipEdge';
import { applyHierarchicalLayout, applyRadialLayout } from './TreeLayoutEngine';
import { Person, Relationship } from '../../types';
import { getSocket } from '../../lib/socket';
import { calculateKinshipStats } from '../../lib/kinship';
import { calculateAgeIn2026 } from './SmartFilterPanel';

const GENERATIONS = [
  { id: '1', minAge: 62, maxAge: 80 },
  { id: '2', minAge: 46, maxAge: 61 },
  { id: '3', minAge: 30, maxAge: 45 },
  { id: '4', minAge: 14, maxAge: 29 },
  { id: '5', minAge: 0, maxAge: 13 },
];

const LIFE_STAGES = [
  { id: 'toddlers', minAge: 0, maxAge: 3 },
  { id: 'kids', minAge: 4, maxAge: 9 },
  { id: 'preteens', minAge: 10, maxAge: 12 },
  { id: 'teenagers', minAge: 13, maxAge: 19 },
  { id: 'youngadults', minAge: 20, maxAge: 29 },
  { id: 'elders', minAge: 60, maxAge: 999 },
];

export function isPersonVisible(p: Person, filters: any): boolean {
  if (!filters.generations.length && !filters.lifeStages.length && !filters.demographics.length && (!filters.locations || !filters.locations.length) && (!filters.birthMonths || !filters.birthMonths.length) && (!filters.vitalStatus || !filters.vitalStatus.length)) return true;

  const age = calculateAgeIn2026(p.dateOfBirth, p.dateOfDeath);
  const location = p.currentLocation || p.birthPlace;
  
  let dobMonth: number | null = null;
  if (p.dateOfBirth) {
    try {
      const d = new Date(p.dateOfBirth);
      if (!isNaN(d.getTime())) dobMonth = d.getMonth();
    } catch(e) {}
  }
  
  let passGen = true;
  if (filters.generations.length > 0) {
    passGen = filters.generations.some((genId: string) => {
      const gen = GENERATIONS.find(g => g.id === genId);
      return gen && age !== null && age >= gen.minAge && age <= gen.maxAge;
    });
  }

  let passStage = true;
  if (filters.lifeStages.length > 0) {
    passStage = filters.lifeStages.some((stageId: string) => {
      const stage = LIFE_STAGES.find(s => s.id === stageId);
      return stage && age !== null && age >= stage.minAge && age <= stage.maxAge;
    });
  }

  let passDemo = true;
  if (filters.demographics.length > 0) {
    passDemo = filters.demographics.includes(p.gender);
  }

  let passLocation = true;
  if (filters.locations && filters.locations.length > 0) {
    passLocation = location !== null && location !== undefined ? filters.locations.includes(location) : false;
  }

  let passBirthMonth = true;
  if (filters.birthMonths && filters.birthMonths.length > 0) {
    passBirthMonth = dobMonth !== null ? filters.birthMonths.includes(dobMonth) : false;
  }

  let passVitalStatus = true;
  if (filters.vitalStatus && filters.vitalStatus.length > 0) {
    passVitalStatus = filters.vitalStatus.includes(p.isLiving ? 'living' : 'deceased');
  }

  return passGen && passStage && passDemo && passLocation && passBirthMonth && passVitalStatus;
}

import { useStore, Handle, Position } from 'reactflow';
import { Heart } from 'lucide-react';

const FamilyNode = ({ data }: { data: any }) => (
  <div className="flex items-center justify-center bg-white border border-[#e74c3c]/30 px-1.5 py-0.5 rounded-full shadow-sm" style={{ transform: `scale(${data.scale || 1})` }}>
    <Handle type="target" position={Position.Left} id="left-tgt" style={{ opacity: 0 }} />
    <Handle type="target" position={Position.Right} id="right-tgt" style={{ opacity: 0 }} />
    <Handle type="source" position={Position.Bottom} id="bottom-src" style={{ opacity: 0 }} />
    <Handle type="target" position={Position.Top} id="top-tgt" style={{ opacity: 0 }} />
    <Heart className="w-3 h-3 text-[#e74c3c] fill-current" />
    {data?.marriageDate && <span className="text-[10px] text-[#e74c3c] font-medium ml-1">m. {new Date(data.marriageDate).getFullYear()}</span>}
  </div>
);

const pastelColors = [
  'rgba(255, 182, 193, 0.15)', // Light Pink
  'rgba(173, 216, 230, 0.15)', // Light Blue
  'rgba(144, 238, 144, 0.15)', // Light Green
  'rgba(255, 228, 181, 0.15)', // Moccasin
  'rgba(221, 160, 221, 0.15)', // Plum
  'rgba(255, 218, 185, 0.15)', // Peach
];

const GenerationRailNode = ({ data }: { data: any }) => {
  const transform = useStore((s) => s.transform);
  const tx = transform[0];
  const zoom = transform[2];
  
  return (
    <div className="relative pointer-events-none w-[1px] h-[350px]">
      <div 
        className="absolute top-0 h-full w-[100000px] -left-[50000px]" 
        style={{ 
          backgroundColor: pastelColors[data.index % pastelColors.length],
          borderTop: '1px dashed rgba(0,0,0,0.05)',
          borderBottom: '1px dashed rgba(0,0,0,0.05)',
          marginTop: -30,
          opacity: 0.2,
        }}
      />
      {data.index >= 2 && (
        <div 
          className="absolute top-4 font-bold text-white opacity-20 tracking-[0.2em] uppercase font-mono origin-top-left"
          style={{ 
            left: (20 - tx) / Math.max(0.001, zoom),
            transform: `scale(${Math.max(1, 2 / zoom)})`,
            marginTop: -30
          }}
        >
          {`Generation ${data.index - 1}`}
        </div>
      )}
    </div>
  );
};


const nodeTypes = {
  person: PersonNode,
  family: FamilyNode,
  generation_rail: GenerationRailNode
};

const edgeTypes = {
  spouse: SpouseEdge,
  parent: ParentChildEdge,
  sibling: SiblingEdge,
  adoptive_parent: AdoptiveEdge,
  step_parent: StepEdge,
};

// Generate ReactFlow edges
function generateEdges(relationships: Relationship[], persons: Person[], layoutedPositions: Record<string, { x: number, y: number }>): Edge[] {
  const edges: Edge[] = [];
  const families = new Map<string, { p1: string, p2: string }>();

  // Determine family units for marriages
  relationships.forEach(r => {
    if (r.type === 'spouse') {
      const p1 = r.person1Id;
      const p2 = r.person2Id;
      const famId = `fam_${[p1, p2].sort().join('_')}`;
      families.set(famId, { p1, p2 });

      const p1Pos = layoutedPositions[p1] || { x: 0 };
      const p2Pos = layoutedPositions[p2] || { x: 0 };
      const p1IsLeft = p1Pos.x < p2Pos.x;

      // Add spouse lines to family node
      edges.push({
        id: `${r.id}_1`,
        source: p1,
        sourceHandle: p1IsLeft ? 'right-src' : 'left-src',
        target: famId,
        targetHandle: p1IsLeft ? 'left-tgt' : 'right-tgt',
        type: 'spouse',
        data: r,
      });
      edges.push({
        id: `${r.id}_2`,
        source: p2,
        sourceHandle: p1IsLeft ? 'left-src' : 'right-src',
        target: famId,
        targetHandle: p1IsLeft ? 'right-tgt' : 'left-tgt',
        type: 'spouse',
        data: r,
      });
    }
  });

  relationships.forEach(r => {
    if (r.type !== 'spouse') {
      let edgeType = r.type as string;
      
      let source = r.person1Id;
      let target = r.person2Id;
      
      if (r.type === 'child') {
        source = r.person2Id;
        target = r.person1Id;
        edgeType = 'parent';
      }

      // Check if source is part of a family
      let famNodeId = null;
      // find the other parent of the child
      const otherParentRel = relationships.find(r2 => 
        (r2.type === 'parent' && r2.person2Id === target && r2.person1Id !== source) ||
        (r2.type === 'child' && r2.person1Id === target && r2.person2Id !== source)
      );
      const otherParent = otherParentRel ? (otherParentRel.type === 'parent' ? otherParentRel.person1Id : otherParentRel.person2Id) : null;
      
      for (const [famId, fam] of families.entries()) {
        if ((fam.p1 === source && fam.p2 === otherParent) || (fam.p2 === source && fam.p1 === otherParent)) {
          famNodeId = famId;
          break;
        }
      }
      
      // fallback to any family if explicit match not found
      if (!famNodeId) {
        for (const [famId, fam] of families.entries()) {
          if (fam.p1 === source || fam.p2 === source) {
            famNodeId = famId;
            break;
          }
        }
      }

      if (famNodeId) {
        // Only add one edge per family per child
        if (!edges.some(e => e.source === famNodeId && e.target === target)) {
          edges.push({
            id: `fam_child_${famNodeId}_${target}`,
            source: famNodeId,
            sourceHandle: 'bottom-src',
            target,
            targetHandle: 'top-tgt',
            type: edgeType,
            data: r,
          });
        }
      } else {
        edges.push({
          id: r.id,
          source,
          sourceHandle: 'bottom-src',
          target,
          targetHandle: 'top-tgt',
          type: edgeType,
          data: r,
        });
      }
    }
  });

  return edges;
}

export default function TreeCanvas() {
  const store = useTreeStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onNodesChangeWrapped = useCallback((changes: any) => {
    onNodesChange(changes.map((c: any) => {
      // Restrict dragging to horizontal only
      if (c.type === 'position' && c.position && c.dragging) {
        const existingNode = nodes.find(n => n.id === c.id);
        if (existingNode && existingNode.type === 'person') {
          return { 
            ...c, 
            position: { x: c.position.x, y: existingNode.position.y },
            ...(c.positionAbsolute ? { positionAbsolute: { x: c.positionAbsolute.x, y: existingNode.position.y } } : {})
          };
        }
      }
      return c;
    }));
  }, [nodes, onNodesChange]);

  useEffect(() => {
    const layoutedPositions = applyHierarchicalLayout(store.persons, store.relationships);
    
    // Extract unique levels for generation rails
    const yValues = Array.from(new Set(store.persons.map(p => {
      const pos = layoutedPositions[p.id] || { y: p.canvasY || 0 };
      return pos.y;
    })));
    yValues.sort((a,b) => a - b);
    
    const levels: number[] = [];
    for (const y of yValues) {
      if (levels.length === 0 || Math.abs(y - levels[levels.length - 1]) > 100) {
        levels.push(y);
      }
    }

    const railNodes: Node[] = levels.map((y, index) => ({
      id: `rail_${index}`,
      type: 'generation_rail',
      position: { x: 0, y },
      data: { index },
      selectable: false,
      draggable: false,
      zIndex: -1,
      style: { width: 1, height: 350 },
    }));

    const layoutedNodes: Node[] = store.persons.map(p => {
      const pos = layoutedPositions[p.id] || { x: p.canvasX, y: p.canvasY, scale: 1 };
      const kinship = calculateKinshipStats(p.id, store.persons, store.relationships);
      const isVisible = isPersonVisible(p, store.filters);
      
      return {
        id: p.id,
        type: 'person',
        position: { x: pos.x, y: pos.y },
        data: { ...p, isSelected: p.id === store.selectedPersonId, scale: pos.scale, kinship, visible: isVisible },
        selectable: true,
        draggable: true,
        zIndex: 10,
      };
    });

    // Add family nodes to the React Flow graph
    const familyNodes: Node[] = [];
    Object.keys(layoutedPositions).forEach(id => {
      if (id.startsWith('fam_')) {
        // Find marriage date from relationships
        const spouseRels = store.relationships.filter(r => r.type === 'spouse');
        let marriageDate = null;
        for (const rel of spouseRels) {
          const p1 = rel.person1Id;
          const p2 = rel.person2Id;
          const famIdCheck = `fam_${[p1, p2].sort().join('_')}`;
          if (famIdCheck === id && rel.marriageDate) {
            marriageDate = rel.marriageDate;
            break;
          }
        }

        familyNodes.push({
          id,
          type: 'family',
          position: { x: layoutedPositions[id].x, y: layoutedPositions[id].y },
          data: { marriageDate, scale: layoutedPositions[id].scale },
          selectable: false,
          draggable: false,
          zIndex: 5,
        });
      }
    });

    setNodes([...railNodes, ...layoutedNodes, ...familyNodes]);
    setEdges(generateEdges(store.relationships, store.persons, layoutedPositions));
  }, [store.persons, store.relationships, store.selectedPersonId, setNodes, setEdges]);
  
  const onNodeDragStop = useCallback((event: any, node: Node) => {
    if (node.type === 'person') {
      store.updatePersonPosition(node.id, node.position.x, node.position.y);
    }
  }, [store]);

  const onNodeClick = useCallback((event: any, node: Node) => {
    if (node.type === 'person') {
      store.selectPerson(node.id);
    }
  }, [store]);

  const onPaneClick = useCallback(() => {
    store.selectPerson(null);
  }, [store]);

  const onConnect = useCallback((params: Connection) => {
    console.log("Connect", params);
  }, []);

  return (
    <div className="w-full h-full bg-[#151526] relative overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeWrapped}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes as any}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        minZoom={0.1}
        maxZoom={2.5}
        panOnScroll={true}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        nodesConnectable={false}
        nodesDraggable={true}
        elementsSelectable={true}
        deleteKeyCode={['Backspace', 'Delete']}
        onlyRenderVisibleElements={false}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#2d3748" />
        
        <Controls className="shadow-lg rounded-xl overflow-hidden [&_.react-flow__controls-button]:bg-white [&_.react-flow__controls-button]:border-b [&_.react-flow__controls-button]:border-slate-100 hover:[&_.react-flow__controls-button]:bg-slate-50 [&_path]:fill-slate-800" />
        
        <MiniMap 
          pannable={true}
          zoomable={true}
          nodeColor={(node: any) => {
            if (node.type === 'generation_rail') return 'transparent';
            switch(node.data?.gender) {
              case 'male': return '#3b82f6';
              case 'female': return '#ec4899';
              case 'other': return '#8b5cf6';
              default: return '#94a3b8';
            }
          }}
          maskColor="transparent"
          maskStrokeColor="#e76f2f"
          maskStrokeWidth={2}
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px'
          }}
        />

        <svg className="absolute inset-0 w-0 h-0 pointer-events-none">
          <defs>
            <marker id="arrow-parent" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#64748b" />
            </marker>
            <marker id="arrow-adoptive" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
            </marker>
            <marker id="arrow-step" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
            </marker>
          </defs>
        </svg>

      </ReactFlow>
    </div>
  );
}
