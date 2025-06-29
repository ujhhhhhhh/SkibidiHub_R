
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Send, User, Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Comment, InsertComment } from "@shared/schema";

interface CommentsResponse {
  comments: Comment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalComments: number;
    hasMore: boolean;
  };
}

interface CommentSectionProps {
  postId: number;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [newComment, setNewComment] = useState({ content: "", author: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: commentsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery<CommentsResponse>({
    queryKey: [`/api/posts/${postId}/comments`],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(`/api/posts/${postId}/comments?page=${pageParam}&limit=10`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      return response.json();
    },
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasMore ? lastPage.pagination.currentPage + 1 : undefined,
    initialPageParam: 1,
  });

  const createCommentMutation = useMutation({
    mutationFn: async (comment: InsertComment): Promise<Comment> => {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(comment),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create comment");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      setNewComment({ content: "", author: "" });
      toast({
        title: "Comment posted!",
        description: "Your comment has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.content.trim() || !newComment.author.trim()) return;

    createCommentMutation.mutate({
      postId,
      content: newComment.content.trim(),
      author: newComment.author.trim(),
    });
  };

  const comments = commentsData?.pages.flatMap(page => page.comments) || [];
  const totalComments = commentsData?.pages[0]?.pagination.totalComments || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments ({totalComments})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Your name"
              value={newComment.author}
              onChange={(e) => setNewComment(prev => ({ ...prev, author: e.target.value }))}
              required
            />
          </div>
          <Textarea
            placeholder="Write your comment..."
            value={newComment.content}
            onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
            required
            rows={3}
          />
          <Button 
            type="submit" 
            disabled={createCommentMutation.isPending || !newComment.content.trim() || !newComment.author.trim()}
            className="w-full md:w-auto"
          >
            {createCommentMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Post Comment
              </>
            )}
          </Button>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-16 w-full" />
              </div>
            ))
          ) : comments.length > 0 ? (
            <>
              {comments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span className="font-medium">{comment.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
              
              {/* Load More Comments Button */}
              {hasNextPage && (
                <div className="flex justify-center py-4">
                  <Button 
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    variant="outline"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More Comments"
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
