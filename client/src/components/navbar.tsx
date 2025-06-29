import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Plus, Search } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-yellow-200 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-2xl skibidi-bounce">🚽</div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Skibidi Hub
                </h1>
                <p className="text-xs text-muted-foreground">Sigma Community</p>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/">
              <Button 
                variant={location === "/" ? "default" : "ghost"} 
                size="sm"
                className="hidden sm:flex"
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
            
            <Link href="/create">
              <Button 
                variant={location === "/create" ? "default" : "ghost"} 
                size="sm"
                className="sigma-glow"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create
              </Button>
            </Link>

            {/* Mobile icons only */}
            <div className="flex sm:hidden gap-1">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <Home className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
