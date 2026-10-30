import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const trees = pgTable('trees', {
  id: text('id').primaryKey(),
  ownerUid: text('owner_uid').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  privacy: text('privacy').notNull().default('private'),
  coverPhotoUrl: text('cover_photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const persons = pgTable('persons', {
  id: text('id').primaryKey(),
  treeId: text('tree_id')
    .notNull()
    .references(() => trees.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  middleName: text('middle_name'),
  lastName: text('last_name').notNull(),
  maidenName: text('maiden_name'),
  gender: text('gender').notNull().default('unknown'),
  dateOfBirth: text('date_of_birth'),
  birthPlace: text('birth_place'),
  currentLocation: text('current_location'),
  dateOfDeath: text('date_of_death'),
  deathPlace: text('death_place'),
  isLiving: boolean('is_living').notNull().default(true),
  bio: text('bio'),
  occupation: text('occupation'),
  nationality: text('nationality'),
  religion: text('religion'),
  education: text('education'),
  profilePhotoUrl: text('profile_photo_url'),
  canvasX: integer('canvas_x').notNull().default(0),
  canvasY: integer('canvas_y').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const relationships = pgTable('relationships', {
  id: text('id').primaryKey(),
  treeId: text('tree_id')
    .notNull()
    .references(() => trees.id, { onDelete: 'cascade' }),
  person1Id: text('person1_id')
    .notNull()
    .references(() => persons.id, { onDelete: 'cascade' }),
  person2Id: text('person2_id')
    .notNull()
    .references(() => persons.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  marriageDate: text('marriage_date'),
  marriagePlace: text('marriage_place'),
  divorceDate: text('divorce_date'),
  isCurrent: boolean('is_current').notNull().default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: text('id').primaryKey(),
  treeId: text('tree_id').references(() => trees.id, { onDelete: 'cascade' }),
  userUid: text('user_uid'),
  type: text('type').notNull(),
  message: text('message').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  trees: many(trees),
}));

export const treesRelations = relations(trees, ({ one, many }) => ({
  owner: one(users, {
    fields: [trees.ownerUid],
    references: [users.uid],
  }),
  persons: many(persons),
  relationships: many(relationships),
  activityLogs: many(activityLogs),
}));

export const personsRelations = relations(persons, ({ one }) => ({
  tree: one(trees, {
    fields: [persons.treeId],
    references: [trees.id],
  }),
}));

export const relationshipsRelations = relations(relationships, ({ one }) => ({
  tree: one(trees, {
    fields: [relationships.treeId],
    references: [trees.id],
  }),
  person1: one(persons, {
    fields: [relationships.person1Id],
    references: [persons.id],
  }),
  person2: one(persons, {
    fields: [relationships.person2Id],
    references: [persons.id],
  }),
}));
