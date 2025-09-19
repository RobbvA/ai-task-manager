// index.js
// Express API with health, tasks GET/POST/PATCH

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { z } = require("zod");
const prisma = require("./db/client");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ---- Validation Schemas ----
const NewTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  notes: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueAt: z.string().datetime().optional(), // ISO string
});

const UpdateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(["todo", "doing", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueAt: z.string().datetime().nullable().optional(),
});

// ---- Routes ----

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// GET all tasks
app.get("/api/tasks", async (_req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(tasks);
  } catch (err) {
    console.error("GET /api/tasks error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST create task
app.post("/api/tasks", async (req, res) => {
  try {
    const parsed = NewTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Validation error", details: parsed.error.flatten() });
    }
    const { title, notes, priority, dueAt } = parsed.data;
    const created = await prisma.task.create({
      data: {
        title,
        notes,
        priority,
        dueAt: dueAt ? new Date(dueAt) : undefined,
      },
    });
    res.status(201).json(created);
  } catch (err) {
    console.error("POST /api/tasks error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH update task
app.patch("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = UpdateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Validation error", details: parsed.error.flatten() });
    }
    const d = parsed.data;
    const updateData = {
      ...(d.title !== undefined ? { title: d.title } : {}),
      ...(d.notes !== undefined ? { notes: d.notes ?? null } : {}),
      ...(d.status !== undefined ? { status: d.status } : {}),
      ...(d.priority !== undefined ? { priority: d.priority } : {}),
      ...(d.dueAt !== undefined
        ? { dueAt: d.dueAt ? new Date(d.dueAt) : null }
        : {}),
    };
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No updatable fields provided" });
    }
    const updated = await prisma.task.update({
      where: { id },
      data: updateData,
    });
    res.json(updated);
  } catch (err) {
    if (err?.code === "P2025")
      return res.status(404).json({ error: "Task not found" });
    console.error("PATCH /api/tasks/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---- Start ----
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ API listening on http://localhost:${PORT}`);
});
