import { type User, type InsertUser, type Post, type InsertPost, type Comment, type InsertComment } from "@shared/schema";
import { FileStorage } from "./file-storage";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Post methods
  getAllPosts(): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  likePost(id: number): Promise<Post | undefined>;
  searchPosts(query: string): Promise<Post[]>;
  
  // Comment methods
  getCommentsByPostId(postId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
}

export const storage = new FileStorage();
