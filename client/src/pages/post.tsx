import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User, Heart } from "lucide-react";
import CommentSection from "@/components/comment-section";
import type { Post } from "@shared/schema";

export default function PostPage() {
  const [match, params] = useRoute("/post/:id");
  const postId = params?.id ? parseInt(params.id) : null;

  const { data: post, isLoading, error } = useQuery<Post>({
    queryKey: [`/api/posts/${postId}`],
    enabled: postId !== null,
  });

  if (!match || postId === null) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-600">Invalid Post ID</h1>
            <Link href="/">
              <Button className="mt-4">Back to Hub</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-600">Post Not Found</h1>
            <p className="text-muted-foreground mb-4">
              This post might have been removed or doesn't exist.
            </p>
            <Link href="/">
              <Button>Back to Hub</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Hub
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      ) : post ? (
        <>
          <Card className="sigma-glow mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">{post.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {post.author}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-red-500" />
                  {post.likes} likes
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none">
                <p className="whitespace-pre-wrap">{post.content}</p>
              </div>
            </CardContent>
          </Card>

          <CommentSection postId={postId} />
        </>
      ) : null}
    </div>
  );
}
