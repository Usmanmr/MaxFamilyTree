import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(
  uid: string,
  email: string,
  firstName?: string | null,
  lastName?: string | null,
  avatarUrl?: string | null
) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        firstName: firstName || email.split('@')[0] || 'User',
        lastName: lastName || '',
        avatarUrl: avatarUrl || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(firstName ? { firstName } : {}),
          ...(lastName !== undefined && lastName !== null ? { lastName } : {}),
          ...(avatarUrl ? { avatarUrl } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function updateUserProfile(
  uid: string,
  data: { firstName?: string; lastName?: string; avatarUrl?: string | null }
) {
  try {
    const result = await db
      .update(users)
      .set(data)
      .where(eq(users.uid, uid))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in updateUserProfile:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
