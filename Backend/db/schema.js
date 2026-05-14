const { pgTable, serial, text, varchar, timestamp, boolean, integer } = require('drizzle-orm/pg-core');

const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(), // stored as plain text per requirements
  role: varchar('role', { length: 20 }).notNull().default('user'),
  otp: varchar('otp', { length: 6 }),
  otp_expiry: timestamp('otp_expiry'),
  is_verified: boolean('is_verified').notNull().default(false),
  created_at: timestamp('created_at').defaultNow(),
});

const complaints = pgTable('complaints', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  complaintText: text('complaint_text').notNull(),
  aiQuestion: text('ai_question'),
  userAnswer: text('user_answer'),
  created_at: timestamp('created_at').defaultNow(),
});

module.exports = { users, complaints };
