import { Express, Request, Response } from "express";
import { z } from "zod";
import { getDb } from "./db";
import { newsArticles } from "../drizzle/schema";

const newsItemSchema = z.object({
  title: z.string().min(1).max(200),
  excerpt: z.string().min(1).max(500),
  content: z.string().min(1),
  tag: z.string().min(1).max(50),
});

const publishNewsSchema = z.object({
  items: z.array(newsItemSchema).min(1).max(10),
});

export function registerScheduledRoutes(app: Express) {
  app.post("/api/scheduled/publish-news", async (req: Request, res: Response) => {
    try {
      const parsed = publishNewsSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Invalid payload",
          details: parsed.error.issues,
        });
        return;
      }

      const db = await getDb();
      if (!db) {
        res.status(500).json({ error: "Database not available" });
        return;
      }

      const { items } = parsed.data;
      const inserted = [];

      for (const item of items) {
        const result = await db.insert(newsArticles).values({
          title: item.title,
          excerpt: item.excerpt,
          content: item.content,
          tag: item.tag,
        });
        inserted.push({
          title: item.title,
          tag: item.tag,
          id: (result as any)[0]?.insertId,
        });
      }

      res.status(200).json({
        success: true,
        message: `${inserted.length} article(s) published successfully`,
        articles: inserted,
      });
    } catch (error) {
      console.error("[Scheduled] publish-news error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: String(error),
      });
    }
  });
}
