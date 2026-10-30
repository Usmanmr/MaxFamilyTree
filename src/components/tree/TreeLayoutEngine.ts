import dagre from 'dagre';
import { Person, Relationship } from '../../types';

export function applyHierarchicalLayout(persons: Person[], relationships: Relationship[]) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 240;
  const nodeHeight = 280;
  const hGap = 8; // very close gap between spouses

  // Rank separation: space between generations (levels)
  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 200, nodesep: 100 });

  const families = new Map<string, { p1: string, p2: string }>();
  const spouseCouples: { id1: string, id2: string, famId: string }[] = [];
  
  relationships.forEach(rel => {
    if (rel.type === 'spouse') {
      const p1 = rel.person1Id;
      const p2 = rel.person2Id;
      const famId = `fam_${[p1, p2].sort().join('_')}`;
      if (!families.has(famId)) {
        families.set(famId, { p1, p2 });
        spouseCouples.push({ id1: p1, id2: p2, famId });
      }
    }
  });

  const getPrimaryId = (id: string) => {
    const s = spouseCouples.find(c => c.id1 === id || c.id2 === id);
    if (s) {
      const p1Obj = persons.find(p => p.id === s.id1);
      const p2Obj = persons.find(p => p.id === s.id2);
      if (p1Obj?.gender === 'male') return p1Obj.id;
      if (p2Obj?.gender === 'male') return p2Obj.id;
      return [s.id1, s.id2].sort()[0];
    }
    return id;
  };

  const primaryNodes = new Set<string>();

  persons.forEach((person) => {
    const primaryId = getPrimaryId(person.id);
    if (!primaryNodes.has(primaryId)) {
      primaryNodes.add(primaryId);
      const isCouple = spouseCouples.some(c => c.id1 === primaryId || c.id2 === primaryId);
      if (isCouple) {
        dagreGraph.setNode(primaryId, { width: nodeWidth * 2 + hGap, height: nodeHeight });
      } else {
        dagreGraph.setNode(primaryId, { width: nodeWidth, height: nodeHeight });
      }
    }
  });

  relationships.forEach((rel) => {
    if (rel.type === 'child' || rel.type === 'parent' || rel.type === 'adoptive_parent' || rel.type === 'step_parent') {
      const parent = rel.type === 'child' ? rel.person2Id : rel.person1Id;
      const child = rel.type === 'child' ? rel.person1Id : rel.person2Id;
      
      const parentPrimary = getPrimaryId(parent);
      const childPrimary = getPrimaryId(child);

      dagreGraph.setEdge(parentPrimary, childPrimary, { weight: 1 });
    }
  });

  dagre.layout(dagreGraph);

  const updatedPositions: Record<string, { x: number; y: number; scale?: number }> = {};
  
  persons.forEach((person) => {
    const primaryId = getPrimaryId(person.id);
    if (person.id === primaryId) {
      const nodeWithPosition = dagreGraph.node(primaryId);
      if (!nodeWithPosition) return;
      
      const isCouple = spouseCouples.some(c => c.id1 === primaryId || c.id2 === primaryId);
      const w = isCouple ? (nodeWidth * 2 + hGap) : nodeWidth;
      
      updatedPositions[primaryId] = { 
        x: nodeWithPosition.x - w / 2, 
        y: nodeWithPosition.y - nodeHeight / 2 
      };
    }
  });

  persons.forEach((person) => {
    const primaryId = getPrimaryId(person.id);
    if (person.id !== primaryId) {
      const primaryPos = updatedPositions[primaryId];
      if (primaryPos) {
        updatedPositions[person.id] = {
          x: primaryPos.x + nodeWidth + hGap,
          y: primaryPos.y
        };
      }
    }
  });

  families.forEach((fam, famId) => {
    const pos1 = updatedPositions[fam.p1];
    const pos2 = updatedPositions[fam.p2];
    if (pos1 && pos2) {
      const leftX = Math.min(pos1.x, pos2.x);
      const rightX = Math.max(pos1.x, pos2.x);
      const centerX = leftX + (rightX - leftX) / 2 + (nodeWidth / 2); 
      const centerY = (pos1.y + pos2.y) / 2;
      
      updatedPositions[famId] = { 
        x: centerX - 25, 
        y: centerY + 140 - 12
      };
    }
  });

  const yValues = Array.from(new Set(persons.map(p => updatedPositions[p.id]?.y || 0)));
  yValues.sort((a,b) => a - b);
  const levels: number[] = [];
  for (const y of yValues) {
    const lastLevel = levels[levels.length - 1];
    if (lastLevel === undefined || Math.abs(y - lastLevel) > 50) {
      levels.push(y);
    }
  }

  persons.forEach(p => {
    const pos = updatedPositions[p.id];
    if (pos) {
      const closest = levels.reduce((prev, curr) => Math.abs(curr - pos.y) < Math.abs(prev - pos.y) ? curr : prev, levels[0] || 0);
      const level = levels.indexOf(closest);
      updatedPositions[p.id].scale = Math.pow(0.85, level); // 15% reduction per level
    }
  });

  families.forEach((fam, famId) => {
    const pos = updatedPositions[famId];
    if (pos && pos.y) {
       const closest = levels.reduce((prev, curr) => Math.abs(curr - pos.y) < Math.abs(prev - pos.y) ? curr : prev, levels[0] || 0);
       const level = levels.indexOf(closest);
       updatedPositions[famId].scale = Math.pow(0.85, level);
    }
  });

  // Apply saved horizontal positions
  persons.forEach(p => {
    if (p.canvasX !== undefined) {
      if (updatedPositions[p.id]) {
        updatedPositions[p.id].x = p.canvasX;
      } else {
        updatedPositions[p.id] = { x: p.canvasX, y: p.canvasY || 0, scale: 1 };
      }
    }
  });

  // Recalculate family positions between spouses
  families.forEach((fam, famId) => {
    const pos1 = updatedPositions[fam.p1];
    const pos2 = updatedPositions[fam.p2];
    if (pos1 && pos2) {
      const leftX = Math.min(pos1.x, pos2.x);
      const rightX = Math.max(pos1.x, pos2.x);
      const centerX = leftX + (rightX - leftX) / 2 + (nodeWidth / 2); 
      const centerY = (pos1.y + pos2.y) / 2;
      
      updatedPositions[famId] = { 
        ...updatedPositions[famId],
        x: centerX - 25, 
        y: centerY + 140 - 12
      };
    }
  });

  return updatedPositions;
}

export function applyRadialLayout(persons: Person[], relationships: Relationship[], rootPersonId: string) {
  const updatedPositions: Record<string, { x: number; y: number }> = {};
  
  if (!rootPersonId) return updatedPositions;

  const rootPerson = persons.find(p => p.id === rootPersonId);
  if (!rootPerson) return updatedPositions;

  // Lay them out manually in rings based on radial distance.
  // We'll use a very basic BFS to assign layers.
  const layers: Record<string, number> = { [rootPersonId]: 0 };
  const queue = [rootPersonId];
  
  while (queue.length > 0) {
    const curr = queue.shift()!;
    const level = layers[curr];
    
    // Find neighbors
    const neighbors = relationships
      .filter(r => r.person1Id === curr || r.person2Id === curr)
      .map(r => r.person1Id === curr ? r.person2Id : r.person1Id);
      
    neighbors.forEach(n => {
      if (layers[n] === undefined) {
        layers[n] = level + 1;
        queue.push(n);
      }
    });
  }

  // Ring radiuses
  const radiuses = [0, 350, 650, 950, 1250, 1550];

  const nodesByLayer: Record<number, string[]> = {};
  Object.entries(layers).forEach(([id, layer]) => {
    if (!nodesByLayer[layer]) nodesByLayer[layer] = [];
    nodesByLayer[layer].push(id);
  });

  Object.keys(nodesByLayer).forEach(layerStr => {
    const layer = parseInt(layerStr);
    const nodes = nodesByLayer[layer];
    const radius = radiuses[layer] || (radiuses[radiuses.length - 1] + 300 * (layer - radiuses.length + 1));
    
    if (layer === 0) {
      updatedPositions[nodes[0]] = { x: 0, y: 0 };
      return;
    }

    const angleStep = (2 * Math.PI) / nodes.length;
    nodes.forEach((nodeId, idx) => {
      const angle = idx * angleStep;
      updatedPositions[nodeId] = {
        x: Math.round(Math.cos(angle) * radius),
        y: Math.round(Math.sin(angle) * radius)
      };
    });
  });

  return updatedPositions;
}
