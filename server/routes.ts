import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostSchema, insertCommentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all posts with pagination
  app.get("/api/posts", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const offset = (page - 1) * limit;
      
      const allPosts = await storage.getAllPosts();
      const totalPosts = allPosts.length;
      const posts = allPosts.slice(offset, offset + limit);
      
      res.json({
        posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
          totalPosts,
          hasMore: offset + limit < totalPosts
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Search posts using query parameter with pagination
  app.get("/api/posts/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const offset = (page - 1) * limit;
      
      if (!query || query.trim().length === 0) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const allPosts = await storage.searchPosts(query);
      const totalPosts = allPosts.length;
      const posts = allPosts.slice(offset, offset + limit);
      
      res.json({
        posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
          totalPosts,
          hasMore: offset + limit < totalPosts
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to search posts" });
    }
  });

  // Get a specific post
  app.get("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getPost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  // Create a new post
  app.post("/api/posts", async (req, res) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Like a post
  app.post("/api/posts/:id/like", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.likePost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  // Get comments for a post with pagination
  app.get("/api/posts/:id/comments", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const allComments = await storage.getCommentsByPostId(id);
      const totalComments = allComments.length;
      const comments = allComments.slice(offset, offset + limit);
      
      res.json({
        comments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalComments / limit),
          totalComments,
          hasMore: offset + limit < totalComments
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Create a new comment
  app.post("/api/comments", async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
