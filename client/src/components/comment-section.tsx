import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Send, User, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Comment, InsertComment } from "@shared/schema";

interface CommentSectionProps {
  postId: number;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newComment, setNewComment] = useState("");
  const [commenterName, setCommenterName] = useState("");

  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: [`/api/posts/${postId}/comments`],
  });

  const createCommentMutation = useMutation({
    mutationFn: async (commentData: InsertComment) => {
      const response = await apiRequest("POST", "/api/comments", commentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      setNewComment("");
      setCommenterName("");
      toast({
        title: "Comment posted! 💬",
        description: "Your sigma comment is now live!",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to post comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !commenterName.trim()) {
      toast({
        title: "Please fill in all fields",
        description: "Both comment and name are required!",
        variant: "destructive",
      });
      return;
    }

    createCommentMutation.mutate({
      postId,
      content: newComment.trim(),
      author: commenterName.trim(),
    });
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Comments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comments ({comments?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <div key={comment.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center gap-4 mb-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span className="font-medium">{comment.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Comment Form */}
      <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-lg">Add Your Comment 💭</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div>
              <Label htmlFor="commenter-name">Your Name</Label>
              <Input
                id="commenter-name"
                placeholder="Enter your name..."
                value={commenterName}
                onChange={(e) => setCommenterName(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="comment-content">Comment</Label>
              <Textarea
                id="comment-content"
                placeholder="Share your thoughts about this post..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mt-1 min-h-[100px]"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={createCommentMutation.isPending}
              className="w-full sm:w-auto"
            >
              {createCommentMutation.isPending ? (
                "Posting..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Post Comment
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
