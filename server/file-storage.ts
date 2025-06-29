import fs from 'fs/promises';
import path from 'path';
import { type User, type InsertUser, type Post, type InsertPost, type Comment, type InsertComment } from "@shared/schema";

const DATA_DIR = path.join(process.cwd(), 'data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const COUNTERS_FILE = path.join(DATA_DIR, 'counters.json');

interface Counters {
  users: number;
  posts: number;
  comments: number;
}

export class FileStorage {
  private async ensureDataDir() {
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
  }

  private async readFile<T>(filePath: string, defaultValue: T): Promise<T> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return defaultValue;
    }
  }

  private async writeFile<T>(filePath: string, data: T): Promise<void> {
    await this.ensureDataDir();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  private async getCounters(): Promise<Counters> {
    return await this.readFile(COUNTERS_FILE, { users: 1, posts: 1, comments: 1 });
  }

  private async updateCounters(counters: Counters): Promise<void> {
    await this.writeFile(COUNTERS_FILE, counters);
  }

  private async initializeData() {
    const posts = await this.readFile<Post[]>(POSTS_FILE, []);
    const comments = await this.readFile<Comment[]>(COMMENTS_FILE, []);
    
    // Only initialize if BOTH posts and comments are empty
    if (posts.length === 0 && comments.length === 0) {
      const initialPosts: Post[] = [
        {
          id: 1,
          title: "Welcome to Skibidi Hub! 🚽",
          content: "Welcome to our awesome community! Share your thoughts, memes, and discussions about everything Skibidi Toilet related. Let's make this the most sigma community ever!",
          author: "SkibidiModerator",
          likes: 42,
          createdAt: new Date()
        },
        {
          id: 2,
          title: "Best Skibidi Toilet Episodes Discussion",
          content: "What are your favorite episodes and why? Drop your rankings below! I personally love the ones with the cameramen vs toilets battles.",
          author: "ToiletFan123",
          likes: 28,
          createdAt: new Date()
        },
        {
          id: 3,
          title: "Skibidi Meme Collection Thread",
          content: "Share your best Skibidi memes here! Keep it appropriate and fun for everyone. No cap, only the most fire memes allowed! 🔥",
          author: "MemeKing2024",
          likes: 35,
          createdAt: new Date()
        },
        {
          id: 4,
          title: "Theory: What if the toilets are actually good?",
          content: "Hear me out guys, what if the Skibidi Toilets are trying to save humanity from something worse? The plot keeps getting deeper!",
          author: "TheoryMaster99",
          likes: 19,
          createdAt: new Date()
        },
        {
          id: 5,
          title: "My Skibidi Toilet tier list (controversial)",
          content: "S Tier: G-Man Toilet, Camera Titan\nA Tier: Speaker Titan, TV Man\nB Tier: Basic toilets\nC Tier: Plunger cameraman (sorry not sorry)",
          author: "RankingKing",
          likes: 23,
          createdAt: new Date()
        }
      ];
      await this.writeFile(POSTS_FILE, initialPosts);

      const initialComments: Comment[] = [
        {
          id: 1,
          postId: 1,
          content: "Thanks for creating this community! So excited to be here!",
          author: "NewUser2024",
          createdAt: new Date()
        },
        {
          id: 2,
          postId: 1,
          content: "Finally a place for true Skibidi fans! This is going to be epic!",
          author: "SigmaFan42",
          createdAt: new Date()
        },
        {
          id: 3,
          postId: 2,
          content: "Episode 67 part 2 is absolutely fire! The plot twist was insane!",
          author: "EpisodeFan",
          createdAt: new Date()
        },
        {
          id: 4,
          postId: 2,
          content: "I still think episode 55 is underrated. The titan battles were incredible!",
          author: "TitanLover",
          createdAt: new Date()
        },
        {
          id: 5,
          postId: 3,
          content: "Can't wait to see all the creative memes everyone comes up with!",
          author: "CreativeUser",
          createdAt: new Date()
        },
        {
          id: 6,
          postId: 3,
          content: "Already working on some OC memes for this thread 🔥",
          author: "MemeCreator2024",
          createdAt: new Date()
        },
        {
          id: 7,
          postId: 4,
          content: "Interesting theory! Never thought about it that way before",
          author: "ThoughtfulUser",
          createdAt: new Date()
        },
        {
          id: 8,
          postId: 5,
          content: "How is plunger cameraman C tier?! That's controversial for sure lol",
          author: "PlungerDefender",
          createdAt: new Date()
        }
      ];
      await this.writeFile(COMMENTS_FILE, initialComments);
      await this.updateCounters({ users: 1, posts: 6, comments: 9 });
    }
  }

  constructor() {
    this.initializeData();
  }

  async getUser(id: number): Promise<User | undefined> {
    const users = await this.readFile<User[]>(USERS_FILE, []);
    return users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await this.readFile<User[]>(USERS_FILE, []);
    return users.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const users = await this.readFile<User[]>(USERS_FILE, []);
    const counters = await this.getCounters();
    
    const user: User = {
      ...insertUser,
      id: counters.users++
    };
    
    users.push(user);
    await this.writeFile(USERS_FILE, users);
    await this.updateCounters(counters);
    
    return user;
  }

  async getAllPosts(): Promise<Post[]> {
    const posts = await this.readFile<Post[]>(POSTS_FILE, []);
    return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getPost(id: number): Promise<Post | undefined> {
    const posts = await this.readFile<Post[]>(POSTS_FILE, []);
    return posts.find(post => post.id === id);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const posts = await this.readFile<Post[]>(POSTS_FILE, []);
    const counters = await this.getCounters();
    
    const post: Post = {
      ...insertPost,
      id: counters.posts++,
      likes: 0,
      createdAt: new Date()
    };
    
    posts.push(post);
    await this.writeFile(POSTS_FILE, posts);
    await this.updateCounters(counters);
    
    return post;
  }

  async likePost(id: number): Promise<Post | undefined> {
    const posts = await this.readFile<Post[]>(POSTS_FILE, []);
    const postIndex = posts.findIndex(post => post.id === id);
    
    if (postIndex === -1) return undefined;
    
    posts[postIndex].likes += 1;
    await this.writeFile(POSTS_FILE, posts);
    
    return posts[postIndex];
  }

  async searchPosts(query: string): Promise<Post[]> {
    const posts = await this.readFile<Post[]>(POSTS_FILE, []);
    const lowercaseQuery = query.toLowerCase();
    
    return posts
      .filter(post => 
        post.title.toLowerCase().includes(lowercaseQuery) ||
        post.content.toLowerCase().includes(lowercaseQuery) ||
        post.author.toLowerCase().includes(lowercaseQuery)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    const comments = await this.readFile<Comment[]>(COMMENTS_FILE, []);
    return comments
      .filter(comment => comment.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const comments = await this.readFile<Comment[]>(COMMENTS_FILE, []);
    const counters = await this.getCounters();
    
    const comment: Comment = {
      ...insertComment,
      id: counters.comments++,
      createdAt: new Date()
    };
    
    comments.push(comment);
    await this.writeFile(COMMENTS_FILE, comments);
    await this.updateCounters(counters);
    
    return comment;
  }
}