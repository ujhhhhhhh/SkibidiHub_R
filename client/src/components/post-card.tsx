import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Post } from "@shared/schema";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/posts/${post.id}/like`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Liked! 💙",
        description: "You showed some sigma support!",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to like post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    likeMutation.mutate();
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <Link href={`/post/${post.id}`}>
      <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.01] cursor-pointer group">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
              {post.title}
            </CardTitle>
            <Badge variant="secondary" className="ml-2 flex-shrink-0">
              🚽 Sigma
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {post.author}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(post.createdAt)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {truncateContent(post.content)}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={likeMutation.isPending}
                className="hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <Heart className="mr-1 h-4 w-4" />
                {post.likes}
              </Button>
              
              <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600">
                <MessageCircle className="mr-1 h-4 w-4" />
                Comments
              </Button>
            </div>
            
            <Button variant="outline" size="sm" className="text-xs">
              Read More →
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
