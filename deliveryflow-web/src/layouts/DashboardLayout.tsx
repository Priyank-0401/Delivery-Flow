import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, Users, Settings, Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function DashboardLayout() {
  const location = useLocation();
  
  const getLinkClass = (path: string) => {
    const isActive = location.pathname.startsWith(path) || (path === '/dashboard' && location.pathname === '/');
    return isActive
      ? "flex items-center gap-3 rounded-md bg-primary/10 text-primary px-3 py-2 text-sm font-medium transition-colors"
      : "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors";
  };

  return (
    <div className="grid min-h-screen w-full grid-cols-[250px_1fr] bg-background">
      {/* Sidebar */}
      <div className="flex flex-col border-r bg-zinc-950 px-4 py-6">
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="h-6 w-6 rounded bg-primary"></div>
          <span className="text-lg font-bold tracking-tight text-white">DeliveryFlow</span>
        </div>
        
        <nav className="flex flex-1 flex-col gap-2">
          <Link to="/dashboard" className={getLinkClass('/dashboard')}>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link to="/projects" className={getLinkClass('/projects')}>
            <FolderKanban className="h-4 w-4" />
            Projects
          </Link>
          <Link to="/teams" className={getLinkClass('/teams')}>
            <Users className="h-4 w-4" />
            Teams
          </Link>
        </nav>

        <div className="mt-auto">
          <Link to="/settings" className={getLinkClass('/settings')}>
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex flex-col h-screen">
        {/* Top Navigation */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6">
          <div className="flex flex-1 items-center gap-4">
            <div className="text-sm font-medium text-muted-foreground hidden md:flex items-center gap-2">
              <span className="text-foreground">App</span>
              <span>/</span>
              <span className="capitalize">{location.pathname.split('/')[1] || 'Overview'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:flex">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-64 rounded-full bg-muted/50 pl-8 focus-visible:ring-primary"
              />
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full hover:bg-zinc-800">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar className="h-8 w-8 cursor-pointer border border-border">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">PM</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main Content (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-6 bg-zinc-950/30">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
