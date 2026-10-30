import { Person, Relationship } from '../types';

export interface KinshipStats {
  siblings: number;
  nephews: number;
  nieces: number;
  uncles: number;
  aunties: number;
  firstCousins: number;
  secondCousins: number;
  thirdCousins: number;
  totalPaternal: number;
  totalMaternal: number;
  total: number;
}

export function calculateKinshipStats(personId: string, persons: Person[], relationships: Relationship[]): KinshipStats {
  const parentOf = new Map<string, string[]>();
  const childOf = new Map<string, string[]>();
  const genders = new Map<string, string>();
  const personExists = new Set<string>();
  
  persons.forEach(p => {
    parentOf.set(p.id, []);
    childOf.set(p.id, []);
    genders.set(p.id, p.gender);
    personExists.add(p.id);
  });

  relationships.forEach(r => {
    if (r.type === 'child' || r.type === 'parent') {
      const parent = r.type === 'child' ? r.person2Id : r.person1Id;
      const child = r.type === 'child' ? r.person1Id : r.person2Id;
      parentOf.get(parent)?.push(child);
      childOf.get(child)?.push(parent);
    }
  });

  const unique = (arr: string[]) => Array.from(new Set(arr));
  const getParents = (id: string) => childOf.get(id) || [];
  const getChildren = (id: string) => parentOf.get(id) || [];

  const parents = getParents(personId);
  
  let father = parents.find(p => genders.get(p) === 'male');
  let mother = parents.find(p => genders.get(p) === 'female');
  
  if (!father && parents.length > 0) father = parents[0];
  if (!mother && parents.length > 1) mother = parents[1];

  const getBloodRelatives = (rootId: string) => {
    // Phase 1: collect all biological ancestors
    const ancestors = new Set<string>();
    const ancestorQueue = [rootId];
    ancestors.add(rootId);
    
    let iterations = 0;
    while (ancestorQueue.length > 0 && iterations < 1000) {
      iterations++;
      const current = ancestorQueue.shift()!;
      getParents(current).forEach(p => {
        if (!ancestors.has(p)) {
          ancestors.add(p);
          ancestorQueue.push(p);
        }
      });
    }

    // Phase 2: collect all biological descendants of all ancestors
    const relatives = new Set<string>();
    const descQueue = Array.from(ancestors);
    ancestors.forEach(a => relatives.add(a));

    iterations = 0;
    while (descQueue.length > 0 && iterations < 2000) {
      iterations++;
      const current = descQueue.shift()!;
      getChildren(current).forEach(c => {
        if (!relatives.has(c)) {
          relatives.add(c);
          descQueue.push(c);
        }
      });
    }

    return relatives;
  };

  let paternalRelativesCount = 0;
  let maternalRelativesCount = 0;

  if (father) {
    const pSet = getBloodRelatives(father);
    pSet.delete(personId); // Remove self
    paternalRelativesCount = Array.from(pSet).filter(id => personExists.has(id)).length;
  }
  if (mother) {
    const mSet = getBloodRelatives(mother);
    mSet.delete(personId); // Remove self
    maternalRelativesCount = Array.from(mSet).filter(id => personExists.has(id)).length;
  }

  // To fix siblings, we only count full siblings and half-siblings, ensuring dedup.
  const siblings = unique(parents.flatMap(getChildren).filter(id => id !== personId));
  
  const siblingsChildren = unique(siblings.flatMap(getChildren));
  const nephews = siblingsChildren.filter(id => genders.get(id) === 'male');
  const nieces = siblingsChildren.filter(id => genders.get(id) === 'female');

  const parentsSiblings = unique(parents.flatMap(p => getParents(p).flatMap(getChildren).filter(id => id !== p)));
  
  const uncles = parentsSiblings.filter(id => genders.get(id) === 'male');
  const aunties = parentsSiblings.filter(id => genders.get(id) === 'female');

  const firstCousins = unique(parentsSiblings.flatMap(getChildren));

  const grandparents = unique(parents.flatMap(getParents));
  const grandparentsSiblings = unique(grandparents.flatMap(gp => getParents(gp).flatMap(getChildren).filter(id => id !== gp)));
  const parentsFirstCousins = unique(grandparentsSiblings.flatMap(getChildren));
  
  const secondCousins = unique(parentsFirstCousins.flatMap(getChildren));

  const greatGrandparents = unique(grandparents.flatMap(getParents));
  const greatGrandparentsSiblings = unique(greatGrandparents.flatMap(ggp => getParents(ggp).flatMap(getChildren).filter(id => id !== ggp)));
  const grandparentsFirstCousins = unique(greatGrandparentsSiblings.flatMap(getChildren));
  const parentsSecondCousins = unique(grandparentsFirstCousins.flatMap(getChildren));

  const thirdCousins = unique(parentsSecondCousins.flatMap(getChildren));

  const total = siblings.length + nephews.length + nieces.length + uncles.length + aunties.length + firstCousins.length + secondCousins.length + thirdCousins.length;

  return {
    siblings: siblings.length,
    nephews: nephews.length,
    nieces: nieces.length,
    uncles: uncles.length,
    aunties: aunties.length,
    firstCousins: firstCousins.length,
    secondCousins: secondCousins.length,
    thirdCousins: thirdCousins.length,
    totalPaternal: paternalRelativesCount,
    totalMaternal: maternalRelativesCount,
    total,
  };
}
