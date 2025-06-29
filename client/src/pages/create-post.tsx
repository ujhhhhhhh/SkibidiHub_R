import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Send } from "lucide-react";
import { Link } from "wouter";
import type { InsertPost } from "@shared/schema";

export default function CreatePost() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");

  const createPostMutation = useMutation({
    mutationFn: async (postData: InsertPost) => {
      const response = await apiRequest("POST", "/api/posts", postData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post created successfully! 🎉",
        description: "Your sigma post is now live in the community!",
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Failed to create post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !author.trim()) {
      toast({
        title: "Please fill in all fields",
        description: "Title, content, and author are required!",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      author: author.trim(),
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Hub
          </Button>
        </Link>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Create New Post 📝
        </h1>
        <p className="text-muted-foreground">
          Share your thoughts with the Skibidi community!
        </p>
      </div>

      <Card className="sigma-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚽 New Sigma Post
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="author">Your Username</Label>
              <Input
                id="author"
                placeholder="Enter your username (e.g. SigmaToiletFan2024)"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="title">Post Title</Label>
              <Input
                id="title"
                placeholder="Give your post a catchy title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Share your thoughts, memes, discussions, or anything Skibidi related! Keep it fun and appropriate for the community."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 min-h-[200px]"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full toilet-shake hover:toilet-shake"
              disabled={createPostMutation.isPending}
            >
              {createPostMutation.isPending ? (
                "Creating..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Post to Community
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Community Guidelines */}
      <Card className="mt-6 bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-lg">Community Guidelines 📋</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Keep content Skibidi Toilet related and appropriate</li>
            <li>Be respectful to other community members</li>
            <li>No spam or repetitive content</li>
            <li>Share memes, discussions, theories, and fun content</li>
            <li>Help maintain the sigma energy of our community! 💪</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
