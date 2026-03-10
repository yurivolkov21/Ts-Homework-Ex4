import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware.js";
import { ProductDatabase } from "./product.database.js";
import { ProductService } from "./product.service.js";
import { ProductController } from "./product.controller.js";

const router = Router();

const db = new ProductDatabase();
const service = new ProductService(db);
const controller = new ProductController(service);

// ─── Customer & Admin ─────────────────────────────────────────────────────────
// Any authenticated user can browse products
router.get("/", requireAuth, controller.list);
router.get("/:id", requireAuth, controller.getById);

// ─── Admin Only ───────────────────────────────────────────────────────────────
// Only admins can create, modify or remove products
router.post("/", requireAuth, requireRole("admin"), controller.create);
router.put("/:id", requireAuth, requireRole("admin"), controller.updateById);
router.patch("/:id", requireAuth, requireRole("admin"), controller.updateById);
router.delete("/:id", requireAuth, requireRole("admin"), controller.delete);

export const productRouters = router;