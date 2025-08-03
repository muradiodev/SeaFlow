import { sql } from "drizzle-orm";
import { pgTable, text, varchar, uuid, timestamp, boolean, integer, decimal, jsonb, pgEnum, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['ship_captain', 'ship_crew', 'dpa', 'superintendent', 'operator']);
export const certificateStatusEnum = pgEnum('certificate_status', ['valid', 'expired', 'expiring_soon']);
export const formTypeEnum = pgEnum('form_type', ['recurring', 'one_time']);
export const submissionStatusEnum = pgEnum('submission_status', ['draft', 'submitted', 'approved', 'rejected']);
export const notificationTypeEnum = pgEnum('notification_type', ['form_deadline', 'certificate_expiry', 'system_update', 'approval_request', 'general']);
export const priorityEnum = pgEnum('priority', ['low', 'medium', 'high', 'critical']);
export const syncStatusEnum = pgEnum('sync_status_type', ['pending', 'synced', 'failed']);
export const syncActionEnum = pgEnum('sync_action', ['create', 'update', 'delete']);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  role: userRoleEnum("role").notNull(),
  shipId: uuid("ship_id"),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Ships table
export const ships = pgTable("ships", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  imoNumber: varchar("imo_number", { length: 20 }).notNull().unique(),
  flagState: varchar("flag_state", { length: 100 }),
  shipType: varchar("ship_type", { length: 100 }),
  grossTonnage: integer("gross_tonnage"),
  builtYear: integer("built_year"),
  classificationSociety: varchar("classification_society", { length: 100 }),
  isActive: boolean("is_active").default(true),
  lastSync: timestamp("last_sync"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Certificates table
export const certificates = pgTable("certificates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  shipId: uuid("ship_id").notNull(),
  certificateType: varchar("certificate_type", { length: 200 }).notNull(),
  certificateName: varchar("certificate_name", { length: 300 }).notNull(),
  issuingAuthority: varchar("issuing_authority", { length: 200 }),
  certificateNumber: varchar("certificate_number", { length: 100 }),
  issueDate: date("issue_date"),
  expiryDate: date("expiry_date"),
  filePath: varchar("file_path", { length: 500 }),
  status: certificateStatusEnum("status").default('valid'),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Forms table
export const forms = pgTable("forms", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 300 }).notNull(),
  description: text("description"),
  formType: formTypeEnum("form_type").notNull(),
  recurrencePattern: jsonb("recurrence_pattern"),
  isActive: boolean("is_active").default(true),
  requiresApproval: boolean("requires_approval").default(false),
  approvalRoles: jsonb("approval_roles"),
  formFields: jsonb("form_fields").notNull(),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Form instances table
export const formInstances = pgTable("form_instances", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  formId: uuid("form_id").notNull(),
  instanceName: varchar("instance_name", { length: 300 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

// Form submissions table
export const formSubmissions = pgTable("form_submissions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  formId: uuid("form_id").notNull(),
  formInstanceId: uuid("form_instance_id"),
  shipId: uuid("ship_id").notNull(),
  submittedBy: uuid("submitted_by").notNull(),
  submissionData: jsonb("submission_data").notNull(),
  attachments: jsonb("attachments"),
  status: submissionStatusEnum("status").default('draft'),
  digitalSignature: jsonb("digital_signature"),
  approvedBy: uuid("approved_by"),
  approvedAt: timestamp("approved_at"),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Documents table
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 300 }).notNull(),
  documentType: varchar("document_type", { length: 100 }),
  category: varchar("category", { length: 100 }),
  filePath: varchar("file_path", { length: 500 }),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  version: varchar("version", { length: 20 }).default('1.0'),
  shipId: uuid("ship_id"),
  isPublic: boolean("is_public").default(false),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  recipientId: uuid("recipient_id").notNull(),
  shipId: uuid("ship_id"),
  title: varchar("title", { length: 300 }).notNull(),
  message: text("message").notNull(),
  notificationType: notificationTypeEnum("notification_type").notNull(),
  priority: priorityEnum("priority").default('medium'),
  isRead: boolean("is_read").default(false),
  relatedEntityType: varchar("related_entity_type", { length: 100 }),
  relatedEntityId: uuid("related_entity_id"),
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

// Manuals table
export const manuals = pgTable("manuals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 300 }).notNull(),
  content: text("content"),
  category: varchar("category", { length: 100 }),
  tags: jsonb("tags"),
  version: varchar("version", { length: 20 }).default('1.0'),
  fileAttachments: jsonb("file_attachments"),
  isSearchable: boolean("is_searchable").default(true),
  lastUpdatedBy: uuid("last_updated_by").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Audit logs table
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  shipId: uuid("ship_id"),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: uuid("entity_id"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

// KPIs table
export const kpis = pgTable("kpis", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  calculationFormula: text("calculation_formula"),
  dataSource: varchar("data_source", { length: 100 }),
  category: varchar("category", { length: 100 }),
  unit: varchar("unit", { length: 50 }),
  targetValue: decimal("target_value", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// KPI values table
export const kpiValues = pgTable("kpi_values", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  kpiId: uuid("kpi_id").notNull(),
  shipId: uuid("ship_id"),
  periodStart: date("period_start"),
  periodEnd: date("period_end"),
  value: decimal("value", { precision: 10, scale: 2 }),
  calculatedAt: timestamp("calculated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Sync status table
export const syncStatus = pgTable("sync_status", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  shipId: uuid("ship_id").notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: uuid("entity_id").notNull(),
  action: syncActionEnum("action").notNull(),
  status: syncStatusEnum("status").default('pending'),
  data: jsonb("data"),
  errorMessage: text("error_message"),
  attempts: integer("attempts").default(0),
  lastAttempt: timestamp("last_attempt"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  ship: one(ships, {
    fields: [users.shipId],
    references: [ships.id]
  }),
  certificates: many(certificates),
  forms: many(forms),
  formSubmissions: many(formSubmissions),
  documents: many(documents),
  notifications: many(notifications),
  manuals: many(manuals),
  auditLogs: many(auditLogs)
}));

export const shipsRelations = relations(ships, ({ many }) => ({
  users: many(users),
  certificates: many(certificates),
  formSubmissions: many(formSubmissions),
  documents: many(documents),
  notifications: many(notifications),
  kpiValues: many(kpiValues),
  syncStatus: many(syncStatus)
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  ship: one(ships, {
    fields: [certificates.shipId],
    references: [ships.id]
  }),
  createdBy: one(users, {
    fields: [certificates.createdBy],
    references: [users.id]
  })
}));

export const formsRelations = relations(forms, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [forms.createdBy],
    references: [users.id]
  }),
  instances: many(formInstances),
  submissions: many(formSubmissions)
}));

export const formInstancesRelations = relations(formInstances, ({ one, many }) => ({
  form: one(forms, {
    fields: [formInstances.formId],
    references: [forms.id]
  }),
  createdBy: one(users, {
    fields: [formInstances.createdBy],
    references: [users.id]
  }),
  submissions: many(formSubmissions)
}));

export const formSubmissionsRelations = relations(formSubmissions, ({ one }) => ({
  form: one(forms, {
    fields: [formSubmissions.formId],
    references: [forms.id]
  }),
  formInstance: one(formInstances, {
    fields: [formSubmissions.formInstanceId],
    references: [formInstances.id]
  }),
  ship: one(ships, {
    fields: [formSubmissions.shipId],
    references: [ships.id]
  }),
  submittedBy: one(users, {
    fields: [formSubmissions.submittedBy],
    references: [users.id]
  }),
  approvedBy: one(users, {
    fields: [formSubmissions.approvedBy],
    references: [users.id]
  })
}));

export const kpisRelations = relations(kpis, ({ many }) => ({
  values: many(kpiValues)
}));

export const kpiValuesRelations = relations(kpiValues, ({ one }) => ({
  kpi: one(kpis, {
    fields: [kpiValues.kpiId],
    references: [kpis.id]
  }),
  ship: one(ships, {
    fields: [kpiValues.shipId],
    references: [ships.id]
  })
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true
});

export const selectUserSchema = createSelectSchema(users);

export const insertShipSchema = createInsertSchema(ships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastSync: true
});

export const selectShipSchema = createSelectSchema(ships);

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const selectCertificateSchema = createSelectSchema(certificates);

export const insertFormSchema = createInsertSchema(forms).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const selectFormSchema = createSelectSchema(forms);

export const insertFormSubmissionSchema = createInsertSchema(formSubmissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  submittedAt: true,
  approvedAt: true
});

export const selectFormSubmissionSchema = createSelectSchema(formSubmissions);

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  sentAt: true,
  readAt: true
});

export const selectNotificationSchema = createSelectSchema(notifications);

export const insertManualSchema = createInsertSchema(manuals).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const selectManualSchema = createSelectSchema(manuals);

export const insertKpiSchema = createInsertSchema(kpis).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const selectKpiSchema = createSelectSchema(kpis);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;
export type InsertShip = z.infer<typeof insertShipSchema>;
export type Ship = z.infer<typeof selectShipSchema>;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = z.infer<typeof selectCertificateSchema>;
export type InsertForm = z.infer<typeof insertFormSchema>;
export type Form = z.infer<typeof selectFormSchema>;
export type InsertFormSubmission = z.infer<typeof insertFormSubmissionSchema>;
export type FormSubmission = z.infer<typeof selectFormSubmissionSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = z.infer<typeof selectNotificationSchema>;
export type InsertManual = z.infer<typeof insertManualSchema>;
export type Manual = z.infer<typeof selectManualSchema>;
export type InsertKpi = z.infer<typeof insertKpiSchema>;
export type Kpi = z.infer<typeof selectKpiSchema>;
