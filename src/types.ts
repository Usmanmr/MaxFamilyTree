export type Gender = 'male' | 'female' | 'other' | 'unknown';
export type RelationshipType = 'spouse' | 'parent' | 'child' | 'sibling' | 'adoptive_parent' | 'step_parent';
export type PrivacyType = 'public' | 'private' | 'family';
export type TreeMemberRole = 'owner' | 'editor' | 'viewer';
export type EventType = 'birth' | 'death' | 'marriage' | 'divorce' | 'education' | 'military' | 'immigration' | 'occupation' | 'residence' | 'other';

export interface Tree {
  id: string;
  ownerId: string;
  name: string;
  description?: string | null;
  privacy: PrivacyType;
  coverPhotoUrl?: string | null;
  personCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Person {
  id: string;
  treeId: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  maidenName?: string | null;
  gender: Gender;
  dateOfBirth?: string | null;
  birthPlace?: string | null;
  currentLocation?: string | null;
  dateOfDeath?: string | null;
  deathPlace?: string | null;
  isLiving: boolean;
  bio?: string | null;
  occupation?: string | null;
  nationality?: string | null;
  religion?: string | null;
  education?: string | null;
  profilePhotoId?: string | null;
  canvasX: number;
  canvasY: number;
  createdAt: string;
  updatedAt: string;
  // Included relations
  profilePhotoUrl?: string | null;
  thumbnailUrl?: string | null;
  photoCount?: number;
  lifeEventCount?: number;
}

export interface Relationship {
  id: string;
  treeId: string;
  person1Id: string;
  person2Id: string;
  type: RelationshipType;
  marriageDate?: string | null;
  marriagePlace?: string | null;
  divorceDate?: string | null;
  isCurrent: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  originalUrl: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
  year?: number | null;
  location?: string | null;
  isProfilePhoto: boolean;
  createdAt: string;
}

export interface LifeEvent {
  id: string;
  personId: string;
  type: EventType;
  title: string;
  description?: string | null;
  eventDate?: string | null;
  eventEndDate?: string | null;
  place?: string | null;
}
