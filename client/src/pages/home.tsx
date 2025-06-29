
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, TrendingUp, Loader2 } from "lucide-react";
import PostCard from "@/components/post-card";
import SearchBar from "@/components/search-bar";
import type { Post } from "@shared/schema";

interface PostsResponse {
  posts: Post[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasMore: boolean;
  };
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const {
    data: postsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery<PostsResponse>({
    queryKey: ["/api/posts"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(`/api/posts?page=${pageParam}&limit=5`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      return response.json();
    },
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasMore ? lastPage.pagination.currentPage + 1 : undefined,
    initialPageParam: 1,
  });

  const {
    data: searchData,
    isLoading: isSearchLoading,
    fetchNextPage: fetchNextSearchPage,
    hasNextPage: hasNextSearchPage,
    isFetchingNextPage: isFetchingNextSearchPage
  } = useInfiniteQuery<PostsResponse>({
    queryKey: ["/api/posts/search", searchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(`/api/posts/search?q=${encodeURIComponent(searchQuery)}&page=${pageParam}&limit=5`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      return response.json();
    },
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasMore ? lastPage.pagination.currentPage + 1 : undefined,
    initialPageParam: 1,
    enabled: isSearching && searchQuery.length > 0,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(query.length > 0);
  };

  const displayData = isSearching ? searchData : postsData;
  const displayLoading = isSearching ? isSearchLoading : isLoading;
  const displayPosts = displayData?.pages.flatMap(page => page.posts) || [];
  const totalPosts = displayData?.pages[0]?.pagination.totalPosts || 0;
  const totalLikes = displayPosts.reduce((sum, post) => sum + post.likes, 0);

  const handleLoadMore = () => {
    if (isSearching) {
      fetchNextSearchPage();
    } else {
      fetchNextPage();
    }
  };

  const hasMore = isSearching ? hasNextSearchPage : hasNextPage;
  const isFetchingMore = isSearching ? isFetchingNextSearchPage : isFetchingNextPage;

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
              <div className="text-2xl font-bold text-blue-600">{totalPosts}</div>
              <div className="text-sm text-muted-foreground">Total Posts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{totalLikes}</div>
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
          <>
            {displayPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            
            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center py-4">
                <Button 
                  onClick={handleLoadMore}
                  disabled={isFetchingMore}
                  variant="outline"
                  size="lg"
                >
                  {isFetchingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More Posts"
                  )}
                </Button>
              </div>
            )}
          </>
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
