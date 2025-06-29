import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, TrendingUp } from "lucide-react";
import PostCard from "@/components/post-card";
import SearchBar from "@/components/search-bar";
import type { Post } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const { data: searchResults, isLoading: isSearchLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts/search", searchQuery],
    queryFn: async () => {
      const response = await fetch(`/api/posts/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      return response.json();
    },
    enabled: isSearching && searchQuery.length > 0,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(query.length > 0);
  };

  const displayPosts = isSearching ? searchResults : posts;
  const displayLoading = isSearching ? isSearchLoading : isLoading;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 bg-clip-text text-transparent skibidi-bounce">
          🚽 Skibidi Hub 🚽
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          The most sigma community for Skibidi Toilet fans! Share, discuss, and vibe together! 
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/create">
            <Button size="lg" className="sigma-glow">
              <Plus className="mr-2 h-5 w-5" />
              Create Post
            </Button>
          </Link>
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      {/* Community Stats */}
      <Card className="mb-8 bg-gradient-to-r from-yellow-100 to-blue-100 border-2 border-yellow-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Community Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{posts?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Total Posts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {posts?.reduce((sum, post) => sum + post.likes, 0) || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Likes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">∞</div>
              <div className="text-sm text-muted-foreground">Sigma Energy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results Header */}
      {isSearching && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            Search Results for "{searchQuery}"
          </h2>
          <Button 
            variant="outline" 
            onClick={() => {
              setIsSearching(false);
              setSearchQuery("");
            }}
            className="mt-2"
          >
            Clear Search
          </Button>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {displayLoading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : displayPosts && displayPosts.length > 0 ? (
          displayPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">🚽</div>
              <h3 className="text-xl font-semibold mb-2">
                {isSearching ? "No posts found" : "No posts yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {isSearching 
                  ? "Try searching for something else!" 
                  : "Be the first to share something sigma with the community!"
                }
              </p>
              {!isSearching && (
                <Link href="/create">
                  <Button>Create First Post</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
