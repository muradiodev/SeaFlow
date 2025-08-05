import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

function requireRole(roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Dashboard routes
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/fleet", requireAuth, async (req, res) => {
    try {
      const fleet = await storage.getFleetOverview();
      res.json(fleet);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fleet overview" });
    }
  });

  // Ships routes
  app.get("/api/ships", requireAuth, async (req, res) => {
    try {
      const ships = await storage.getAllShips();
      res.json(ships);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ships" });
    }
  });

  app.get("/api/ships/:id", requireAuth, async (req, res) => {
    try {
      const ship = await storage.getShip(req.params.id);
      if (!ship) {
        return res.status(404).json({ message: "Ship not found" });
      }
      res.json(ship);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ship" });
    }
  });

  app.post("/api/ships", requireRole(['dpa', 'superintendent']), async (req, res) => {
    try {
      const ship = await storage.createShip(req.body);
      await storage.createAuditLog(req.user!.id, 'CREATE', 'ship', ship.id, null, ship);
      res.status(201).json(ship);
    } catch (error) {
      res.status(500).json({ message: "Failed to create ship" });
    }
  });

  // Certificates routes
  app.get("/api/certificates", requireAuth, async (req, res) => {
    try {
      const { shipId } = req.query;
      let certificates;
      
      if (shipId) {
        certificates = await storage.getCertificatesByShip(shipId as string);
      } else if (req.user!.role === 'ship_captain' || req.user!.role === 'ship_crew') {
        if (!req.user!.shipId) {
          return res.status(400).json({ message: "No ship assigned" });
        }
        certificates = await storage.getCertificatesByShip(req.user!.shipId);
      } else {
        certificates = await storage.getAllCertificates();
      }
      
      res.json(certificates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  app.post("/api/certificates", requireAuth, async (req, res) => {
    try {
      const certificate = await storage.createCertificate({
        ...req.body,
        createdBy: req.user!.id
      });
      await storage.createAuditLog(req.user!.id, 'CREATE', 'certificate', certificate.id, null, certificate);
      res.status(201).json(certificate);
    } catch (error) {
      res.status(500).json({ message: "Failed to create certificate" });
    }
  });

  app.get("/api/certificates/expiring", requireAuth, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const certificates = await storage.getExpiringCertificates(days);
      res.json(certificates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expiring certificates" });
    }
  });

  // Forms routes
  app.get("/api/forms", requireAuth, async (req, res) => {
    try {
      const forms = await storage.getAllForms();
      res.json(forms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch forms" });
    }
  });

  app.post("/api/forms", requireRole(['dpa', 'superintendent']), async (req, res) => {
    try {
      const form = await storage.createForm({
        ...req.body,
        createdBy: req.user!.id
      });
      await storage.createAuditLog(req.user!.id, 'CREATE', 'form', form.id, null, form);
      res.status(201).json(form);
    } catch (error) {
      res.status(500).json({ message: "Failed to create form" });
    }
  });

  // Form submissions routes
  app.get("/api/form-submissions", requireAuth, async (req, res) => {
    try {
      const { shipId } = req.query;
      let submissions;
      
      if (shipId) {
        submissions = await storage.getFormSubmissionsByShip(shipId as string);
      } else if (req.user!.role === 'ship_captain' || req.user!.role === 'ship_crew') {
        if (!req.user!.shipId) {
          return res.status(400).json({ message: "No ship assigned" });
        }
        submissions = await storage.getFormSubmissionsByShip(req.user!.shipId);
      } else {
        submissions = await storage.getAllFormSubmissions();
      }
      
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch form submissions" });
    }
  });

  app.post("/api/form-submissions", requireAuth, async (req, res) => {
    try {
      const submission = await storage.createFormSubmission({
        ...req.body,
        submittedBy: req.user!.id,
        shipId: req.user!.shipId || req.body.shipId
      });
      await storage.createAuditLog(req.user!.id, 'CREATE', 'form_submission', submission.id, null, submission);
      res.status(201).json(submission);
    } catch (error) {
      res.status(500).json({ message: "Failed to create form submission" });
    }
  });

  // Notifications routes
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByUser(req.user!.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", requireRole(['dpa', 'superintendent']), async (req, res) => {
    try {
      const notification = await storage.createNotification(req.body);
      res.status(201).json(notification);
    } catch (error) {
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Users routes
  app.get("/api/users", requireRole(['dpa']), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove password from response
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Manuals routes
  app.get("/api/manuals", requireAuth, async (req, res) => {
    try {
      const { search } = req.query;
      let manuals;
      
      if (search) {
        manuals = await storage.searchManuals(search as string);
      } else {
        manuals = await storage.getAllManuals();
      }
      
      res.json(manuals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch manuals" });
    }
  });

  app.post("/api/manuals", requireRole(['dpa', 'superintendent']), async (req, res) => {
    try {
      const manual = await storage.createManual({
        ...req.body,
        lastUpdatedBy: req.user!.id
      });
      await storage.createAuditLog(req.user!.id, 'CREATE', 'manual', manual.id, null, manual);
      res.status(201).json(manual);
    } catch (error) {
      res.status(500).json({ message: "Failed to create manual" });
    }
  });

  // KPI routes
  app.get("/api/kpis", requireAuth, async (req, res) => {
    try {
      const kpis = await storage.getAllKpis();
      res.json(kpis);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch KPIs" });
    }
  });

  app.get("/api/kpis/:id/values", requireAuth, async (req, res) => {
    try {
      const { shipId } = req.query;
      const values = await storage.getKpiValues(req.params.id, shipId as string);
      res.json(values);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch KPI values" });
    }
  });

  // Audit logs routes
  app.get("/api/audit-logs", requireRole(['dpa', 'superintendent']), async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getAuditLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
