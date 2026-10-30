import { db } from './index.ts';
import { trees, persons, relationships, activityLogs } from './schema.ts';
import { eq, desc, and } from 'drizzle-orm';

export async function getAllTreesForUser(uid: string) {
  try {
    const allTrees = await db.select().from(trees).orderBy(desc(trees.updatedAt));
    const allPersons = await db.select().from(persons);

    return allTrees.map((t) => {
      const treePersons = allPersons.filter((p) => p.treeId === t.id);
      return {
        id: t.id,
        name: t.name,
        description: t.description,
        privacy: t.privacy,
        ownerUid: t.ownerUid,
        persons: treePersons.length,
        lastUpdated: t.updatedAt ? t.updatedAt.toISOString() : new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error('Database query failed in getAllTreesForUser:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getTreeDetails(treeId: string) {
  try {
    const treeRows = await db.select().from(trees).where(eq(trees.id, treeId));
    const tree = treeRows[0] || null;
    const treePersons = await db.select().from(persons).where(eq(persons.treeId, treeId));
    const treeRels = await db.select().from(relationships).where(eq(relationships.treeId, treeId));
    const logs = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.treeId, treeId))
      .orderBy(desc(activityLogs.timestamp))
      .limit(50);

    return {
      tree,
      persons: treePersons.map((p) => ({
        ...p,
        createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: p.updatedAt ? p.updatedAt.toISOString() : new Date().toISOString(),
      })),
      relationships: treeRels.map((r) => ({
        ...r,
        createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: r.updatedAt ? r.updatedAt.toISOString() : new Date().toISOString(),
      })),
      activityLog: logs.map((l) => ({
        id: l.id,
        type: l.type,
        message: l.message,
        timestamp: l.timestamp ? l.timestamp.toISOString() : new Date().toISOString(),
      })),
    };
  } catch (error) {
    console.error('Database query failed in getTreeDetails:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getRecentActivities() {
  try {
    const logs = await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.timestamp))
      .limit(50);
    return logs.map((l) => ({
      id: l.id,
      type: l.type,
      message: l.message,
      timestamp: l.timestamp ? l.timestamp.toISOString() : new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Database query failed in getRecentActivities:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function createTree(data: {
  id: string;
  ownerUid: string;
  name: string;
  description?: string | null;
  privacy?: string;
}) {
  try {
    const result = await db
      .insert(trees)
      .values({
        id: data.id,
        ownerUid: data.ownerUid,
        name: data.name,
        description: data.description || null,
        privacy: data.privacy || 'private',
      })
      .returning();

    await db.insert(activityLogs).values({
      id: Math.random().toString(36).substring(2, 11),
      treeId: data.id,
      userUid: data.ownerUid,
      type: 'add',
      message: `Created family tree "${data.name}"`,
    });

    return result[0];
  } catch (error) {
    console.error('Database query failed in createTree:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function deleteTreeById(treeId: string) {
  try {
    await db.delete(trees).where(eq(trees.id, treeId));
    return { success: true };
  } catch (error) {
    console.error('Database query failed in deleteTreeById:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function createPerson(
  treeId: string,
  userUid: string,
  personData: {
    id: string;
    firstName: string;
    middleName?: string | null;
    lastName: string;
    maidenName?: string | null;
    gender?: string;
    dateOfBirth?: string | null;
    birthPlace?: string | null;
    currentLocation?: string | null;
    dateOfDeath?: string | null;
    deathPlace?: string | null;
    isLiving?: boolean;
    bio?: string | null;
    occupation?: string | null;
    nationality?: string | null;
    religion?: string | null;
    education?: string | null;
    profilePhotoUrl?: string | null;
    canvasX?: number;
    canvasY?: number;
  }
) {
  try {
    const result = await db
      .insert(persons)
      .values({
        id: personData.id,
        treeId,
        firstName: personData.firstName,
        middleName: personData.middleName || null,
        lastName: personData.lastName,
        maidenName: personData.maidenName || null,
        gender: personData.gender || 'unknown',
        dateOfBirth: personData.dateOfBirth || null,
        birthPlace: personData.birthPlace || null,
        currentLocation: personData.currentLocation || null,
        dateOfDeath: personData.dateOfDeath || null,
        deathPlace: personData.deathPlace || null,
        isLiving: personData.isLiving ?? true,
        bio: personData.bio || null,
        occupation: personData.occupation || null,
        nationality: personData.nationality || null,
        religion: personData.religion || null,
        education: personData.education || null,
        profilePhotoUrl: personData.profilePhotoUrl || null,
        canvasX: Math.round(personData.canvasX ?? 0),
        canvasY: Math.round(personData.canvasY ?? 0),
      })
      .returning();

    await db
      .update(trees)
      .set({ updatedAt: new Date() })
      .where(eq(trees.id, treeId));

    await db.insert(activityLogs).values({
      id: Math.random().toString(36).substring(2, 11),
      treeId,
      userUid,
      type: 'add',
      message: `Added ${personData.firstName} ${personData.lastName} to the tree`,
    });

    return result[0];
  } catch (error) {
    console.error('Database query failed in createPerson:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function updatePersonById(
  treeId: string,
  personId: string,
  userUid: string,
  updates: Record<string, any>
) {
  try {
    const allowedFields: Record<string, any> = { updatedAt: new Date() };
    const keys = [
      'firstName',
      'middleName',
      'lastName',
      'maidenName',
      'gender',
      'dateOfBirth',
      'birthPlace',
      'currentLocation',
      'dateOfDeath',
      'deathPlace',
      'isLiving',
      'bio',
      'occupation',
      'nationality',
      'religion',
      'education',
      'profilePhotoUrl',
    ];
    for (const k of keys) {
      if (k in updates) {
        allowedFields[k] = updates[k];
      }
    }
    if ('canvasX' in updates && typeof updates.canvasX === 'number') {
      allowedFields.canvasX = Math.round(updates.canvasX);
    }
    if ('canvasY' in updates && typeof updates.canvasY === 'number') {
      allowedFields.canvasY = Math.round(updates.canvasY);
    }

    const result = await db
      .update(persons)
      .set(allowedFields)
      .where(and(eq(persons.id, personId), eq(persons.treeId, treeId)))
      .returning();

    const updated = result[0];
    if (updated) {
      await db
        .update(trees)
        .set({ updatedAt: new Date() })
        .where(eq(trees.id, treeId));

      await db.insert(activityLogs).values({
        id: Math.random().toString(36).substring(2, 11),
        treeId,
        userUid,
        type: 'update',
        message: `Updated the details for ${updated.firstName} ${updated.lastName}`.trim(),
      });
    }

    return updated;
  } catch (error) {
    console.error('Database query failed in updatePersonById:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function batchUpdatePersonPositions(
  treeId: string,
  userUid: string,
  positions: Record<string, { x: number; y: number }>
) {
  try {
    const entries = Object.entries(positions);
    for (const [personId, pos] of entries) {
      await db
        .update(persons)
        .set({
          canvasX: Math.round(pos.x),
          canvasY: Math.round(pos.y),
          updatedAt: new Date(),
        })
        .where(and(eq(persons.id, personId), eq(persons.treeId, treeId)));
    }

    if (entries.length > 0) {
      await db
        .update(trees)
        .set({ updatedAt: new Date() })
        .where(eq(trees.id, treeId));

      await db.insert(activityLogs).values({
        id: Math.random().toString(36).substring(2, 11),
        treeId,
        userUid,
        type: 'update',
        message: `Saved coordinates of ${entries.length} individuals to Cloud SQL.`,
      });
    }

    return { updatedCount: entries.length };
  } catch (error) {
    console.error('Database query failed in batchUpdatePersonPositions:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function deletePersonById(treeId: string, personId: string, userUid: string) {
  try {
    const existing = await db
      .select()
      .from(persons)
      .where(and(eq(persons.id, personId), eq(persons.treeId, treeId)));
    const person = existing[0];

    await db
      .delete(persons)
      .where(and(eq(persons.id, personId), eq(persons.treeId, treeId)));

    await db
      .update(trees)
      .set({ updatedAt: new Date() })
      .where(eq(trees.id, treeId));

    if (person) {
      await db.insert(activityLogs).values({
        id: Math.random().toString(36).substring(2, 11),
        treeId,
        userUid,
        type: 'delete',
        message: `Removed ${person.firstName} ${person.lastName} from the tree`.trim(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Database query failed in deletePersonById:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function createRelationship(
  treeId: string,
  relData: {
    id: string;
    person1Id: string;
    person2Id: string;
    type: string;
    marriageDate?: string | null;
    marriagePlace?: string | null;
    divorceDate?: string | null;
    isCurrent?: boolean;
    notes?: string | null;
  }
) {
  try {
    const result = await db
      .insert(relationships)
      .values({
        id: relData.id,
        treeId,
        person1Id: relData.person1Id,
        person2Id: relData.person2Id,
        type: relData.type,
        marriageDate: relData.marriageDate || null,
        marriagePlace: relData.marriagePlace || null,
        divorceDate: relData.divorceDate || null,
        isCurrent: relData.isCurrent ?? true,
        notes: relData.notes || null,
      })
      .returning();

    await db
      .update(trees)
      .set({ updatedAt: new Date() })
      .where(eq(trees.id, treeId));

    return result[0];
  } catch (error) {
    console.error('Database query failed in createRelationship:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function deleteRelationshipById(treeId: string, relId: string) {
  try {
    await db
      .delete(relationships)
      .where(and(eq(relationships.id, relId), eq(relationships.treeId, treeId)));
    return { success: true };
  } catch (error) {
    console.error('Database query failed in deleteRelationshipById:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
