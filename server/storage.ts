import { users, ships, certificates, forms, formSubmissions, notifications, manuals, kpis, kpiValues, auditLogs, type User, type InsertUser, type Ship, type InsertShip, type Certificate, type InsertCertificate, type Form, type InsertForm, type FormSubmission, type InsertFormSubmission, type Notification, type InsertNotification, type Manual, type InsertManual, type Kpi, type InsertKpi } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Ship methods
  getShip(id: string): Promise<Ship | undefined>;
  getAllShips(): Promise<Ship[]>;
  createShip(ship: InsertShip): Promise<Ship>;
  updateShip(id: string, ship: Partial<InsertShip>): Promise<Ship | undefined>;

  // Certificate methods
  getCertificate(id: string): Promise<Certificate | undefined>;
  getCertificatesByShip(shipId: string): Promise<Certificate[]>;
  getAllCertificates(): Promise<Certificate[]>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  updateCertificate(id: string, certificate: Partial<InsertCertificate>): Promise<Certificate | undefined>;
  getExpiringCertificates(days: number): Promise<Certificate[]>;

  // Form methods
  getForm(id: string): Promise<Form | undefined>;
  getAllForms(): Promise<Form[]>;
  createForm(form: InsertForm): Promise<Form>;
  updateForm(id: string, form: Partial<InsertForm>): Promise<Form | undefined>;

  // Form submission methods
  getFormSubmission(id: string): Promise<FormSubmission | undefined>;
  getFormSubmissionsByShip(shipId: string): Promise<FormSubmission[]>;
  getAllFormSubmissions(): Promise<FormSubmission[]>;
  createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission>;
  updateFormSubmission(id: string, submission: Partial<InsertFormSubmission>): Promise<FormSubmission | undefined>;

  // Notification methods
  getNotification(id: string): Promise<Notification | undefined>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<void>;

  // Manual methods
  getManual(id: string): Promise<Manual | undefined>;
  getAllManuals(): Promise<Manual[]>;
  searchManuals(query: string): Promise<Manual[]>;
  createManual(manual: InsertManual): Promise<Manual>;
  updateManual(id: string, manual: Partial<InsertManual>): Promise<Manual | undefined>;

  // KPI methods
  getKpi(id: string): Promise<Kpi | undefined>;
  getAllKpis(): Promise<Kpi[]>;
  createKpi(kpi: InsertKpi): Promise<Kpi>;
  updateKpi(id: string, kpi: Partial<InsertKpi>): Promise<Kpi | undefined>;
  getKpiValues(kpiId: string, shipId?: string): Promise<any[]>;

  // Dashboard methods
  getDashboardStats(): Promise<any>;
  getFleetOverview(): Promise<any>;

  // Audit methods
  createAuditLog(userId: string, action: string, entityType: string, entityId?: string, oldValues?: any, newValues?: any): Promise<void>;
  getAuditLogs(limit?: number): Promise<any[]>;

  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updateUser: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set({
      ...updateUser,
      updatedAt: new Date()
    }).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Ship methods
  async getShip(id: string): Promise<Ship | undefined> {
    const [ship] = await db.select().from(ships).where(eq(ships.id, id)).limit(1);
    return ship || undefined;
  }

  async getAllShips(): Promise<Ship[]> {
    return await db.select().from(ships).where(eq(ships.isActive, true)).orderBy(ships.name);
  }

  async createShip(insertShip: InsertShip): Promise<Ship> {
    const [ship] = await db.insert(ships).values(insertShip).returning();
    return ship;
  }

  async updateShip(id: string, updateShip: Partial<InsertShip>): Promise<Ship | undefined> {
    const [ship] = await db.update(ships).set({
      ...updateShip,
      updatedAt: new Date()
    }).where(eq(ships.id, id)).returning();
    return ship || undefined;
  }

  // Certificate methods
  async getCertificate(id: string): Promise<Certificate | undefined> {
    const [certificate] = await db.select().from(certificates).where(eq(certificates.id, id)).limit(1);
    return certificate || undefined;
  }

  async getCertificatesByShip(shipId: string): Promise<Certificate[]> {
    return await db.select().from(certificates).where(eq(certificates.shipId, shipId)).orderBy(desc(certificates.expiryDate));
  }

  async getAllCertificates(): Promise<Certificate[]> {
    return await db.select().from(certificates).orderBy(desc(certificates.expiryDate));
  }

  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    const [certificate] = await db.insert(certificates).values(insertCertificate).returning();
    return certificate;
  }

  async updateCertificate(id: string, updateCertificate: Partial<InsertCertificate>): Promise<Certificate | undefined> {
    const [certificate] = await db.update(certificates).set({
      ...updateCertificate,
      updatedAt: new Date()
    }).where(eq(certificates.id, id)).returning();
    return certificate || undefined;
  }

  async getExpiringCertificates(days: number): Promise<Certificate[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return await db.select().from(certificates)
      .where(and(
        lte(certificates.expiryDate, futureDate.toISOString().split('T')[0]),
        gte(certificates.expiryDate, new Date().toISOString().split('T')[0])
      ))
      .orderBy(certificates.expiryDate);
  }

  // Form methods
  async getForm(id: string): Promise<Form | undefined> {
    const [form] = await db.select().from(forms).where(eq(forms.id, id)).limit(1);
    return form || undefined;
  }

  async getAllForms(): Promise<Form[]> {
    return await db.select().from(forms).where(eq(forms.isActive, true)).orderBy(desc(forms.createdAt));
  }

  async createForm(insertForm: InsertForm): Promise<Form> {
    const [form] = await db.insert(forms).values({
      ...insertForm,
      recurrencePattern: insertForm.recurrencePattern as any,
      approvalRoles: insertForm.approvalRoles as any,
      formFields: insertForm.formFields as any
    }).returning();
    return form;
  }

  async updateForm(id: string, updateForm: Partial<InsertForm>): Promise<Form | undefined> {
    const [form] = await db.update(forms).set({
      ...updateForm,
      recurrencePattern: updateForm.recurrencePattern as any,
      approvalRoles: updateForm.approvalRoles as any,
      formFields: updateForm.formFields as any,
      updatedAt: new Date()
    }).where(eq(forms.id, id)).returning();
    return form || undefined;
  }

  // Form submission methods
  async getFormSubmission(id: string): Promise<FormSubmission | undefined> {
    const [submission] = await db.select().from(formSubmissions).where(eq(formSubmissions.id, id)).limit(1);
    return submission || undefined;
  }

  async getFormSubmissionsByShip(shipId: string): Promise<FormSubmission[]> {
    return await db.select().from(formSubmissions).where(eq(formSubmissions.shipId, shipId)).orderBy(desc(formSubmissions.createdAt));
  }

  async getAllFormSubmissions(): Promise<FormSubmission[]> {
    return await db.select().from(formSubmissions).orderBy(desc(formSubmissions.createdAt));
  }

  async createFormSubmission(insertSubmission: InsertFormSubmission): Promise<FormSubmission> {
    const [submission] = await db.insert(formSubmissions).values({
      ...insertSubmission,
      submissionData: insertSubmission.submissionData as any,
      attachments: insertSubmission.attachments as any
    }).returning();
    return submission;
  }

  async updateFormSubmission(id: string, updateSubmission: Partial<InsertFormSubmission>): Promise<FormSubmission | undefined> {
    const [submission] = await db.update(formSubmissions).set({
      ...updateSubmission,
      submissionData: updateSubmission.submissionData as any,
      attachments: updateSubmission.attachments as any,
      updatedAt: new Date()
    }).where(eq(formSubmissions.id, id)).returning();
    return submission || undefined;
  }

  // Notification methods
  async getNotification(id: string): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
    return notification || undefined;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.recipientId, userId)).orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db.update(notifications).set({
      isRead: true,
      readAt: new Date()
    }).where(eq(notifications.id, id));
  }

  // Manual methods
  async getManual(id: string): Promise<Manual | undefined> {
    const [manual] = await db.select().from(manuals).where(eq(manuals.id, id)).limit(1);
    return manual || undefined;
  }

  async getAllManuals(): Promise<Manual[]> {
    return await db.select().from(manuals).where(eq(manuals.isSearchable, true)).orderBy(desc(manuals.updatedAt));
  }

  async searchManuals(query: string): Promise<Manual[]> {
    return await db.select().from(manuals)
      .where(and(
        eq(manuals.isSearchable, true),
        sql`(title ILIKE ${`%${query}%`} OR content ILIKE ${`%${query}%`})`
      ))
      .orderBy(desc(manuals.updatedAt));
  }

  async createManual(insertManual: InsertManual): Promise<Manual> {
    const [manual] = await db.insert(manuals).values({
      ...insertManual,
      tags: insertManual.tags as any,
      fileAttachments: insertManual.fileAttachments as any
    }).returning();
    return manual;
  }

  async updateManual(id: string, updateManual: Partial<InsertManual>): Promise<Manual | undefined> {
    const [manual] = await db.update(manuals).set({
      ...updateManual,
      tags: updateManual.tags as any,
      fileAttachments: updateManual.fileAttachments as any,
      updatedAt: new Date()
    }).where(eq(manuals.id, id)).returning();
    return manual || undefined;
  }

  // KPI methods
  async getKpi(id: string): Promise<Kpi | undefined> {
    const [kpi] = await db.select().from(kpis).where(eq(kpis.id, id)).limit(1);
    return kpi || undefined;
  }

  async getAllKpis(): Promise<Kpi[]> {
    return await db.select().from(kpis).where(eq(kpis.isActive, true)).orderBy(kpis.name);
  }

  async createKpi(insertKpi: InsertKpi): Promise<Kpi> {
    const [kpi] = await db.insert(kpis).values(insertKpi).returning();
    return kpi;
  }

  async updateKpi(id: string, updateKpi: Partial<InsertKpi>): Promise<Kpi | undefined> {
    const [kpi] = await db.update(kpis).set({
      ...updateKpi,
      updatedAt: new Date()
    }).where(eq(kpis.id, id)).returning();
    return kpi || undefined;
  }

  async getKpiValues(kpiId: string, shipId?: string): Promise<any[]> {
    let whereConditions = [eq(kpiValues.kpiId, kpiId)];
    
    if (shipId) {
      whereConditions.push(eq(kpiValues.shipId, shipId));
    }
    
    return await db.select().from(kpiValues)
      .where(and(...whereConditions))
      .orderBy(desc(kpiValues.calculatedAt));
  }

  // Dashboard methods
  async getDashboardStats(): Promise<any> {
    const totalShips = await db.select({ count: sql`count(*)` }).from(ships).where(eq(ships.isActive, true));
    const activeShips = await db.select({ count: sql`count(*)` }).from(ships).where(
      and(eq(ships.isActive, true), sql`last_sync > NOW() - INTERVAL '24 hours'`)
    );
    const pendingForms = await db.select({ count: sql`count(*)` }).from(formSubmissions).where(eq(formSubmissions.status, 'draft'));
    const expiringCerts = await this.getExpiringCertificates(30);

    return {
      totalShips: totalShips[0]?.count || 0,
      activeShips: activeShips[0]?.count || 0,
      pendingForms: pendingForms[0]?.count || 0,
      expiringCertificates: expiringCerts.length
    };
  }

  async getFleetOverview(): Promise<any> {
    return await db.select({
      id: ships.id,
      name: ships.name,
      imoNumber: ships.imoNumber,
      shipType: ships.shipType,
      isActive: ships.isActive,
      lastSync: ships.lastSync
    }).from(ships).where(eq(ships.isActive, true)).orderBy(ships.name);
  }

  // Audit methods
  async createAuditLog(userId: string, action: string, entityType: string, entityId?: string, oldValues?: any, newValues?: any): Promise<void> {
    await db.insert(auditLogs).values({
      userId,
      action,
      entityType,
      entityId,
      oldValues,
      newValues
    });
  }

  async getAuditLogs(limit: number = 100): Promise<any[]> {
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
  }
}

export const storage = new DatabaseStorage();
