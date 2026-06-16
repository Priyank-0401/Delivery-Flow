import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  LayoutDashboard, 
  Activity, 
  ShieldAlert, 
  LineChart, 
  FileText, 
  Network, 
  Clock, 
  ListTodo, 
  Timer, 
  Flag, 
  Users, 
  BarChart4, 
  MessageSquare, 
  Blocks, 
  GitBranch, 
  MessageCircle, 
  Workflow, 
  Settings, 
  ChevronLeft,
  Bell,
  Search,
  Calendar,
  Filter,
  Star,
  CheckCircle2,
  Briefcase,
  CheckSquare
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function DashboardLayout() {
  const token = useAuthStore(state => state.token);
  const location = useLocation();
  
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  const getLinkClass = (path: string) => {
    const isActive = location.pathname.startsWith(path) || (path === '/dashboard' && location.pathname === '/');
    return isActive
      ? "flex items-center gap-3 rounded-md bg-zinc-900/80 text-primary px-3 py-2 text-sm font-medium transition-colors border-l-2 border-primary"
      : "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-900/50 hover:text-white transition-colors border-l-2 border-transparent";
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <div className="px-3 mb-2 mt-6 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
      {title}
    </div>
  );

  return (
    <div className="grid min-h-screen w-full grid-cols-[260px_1fr] bg-background">
      {/* Sidebar */}
      <div className="flex flex-col border-r border-zinc-800/50 bg-[#0B0E14] py-6 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 px-6 mb-8">
          <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <Workflow className="h-4 w-4 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">DeliveryFlow</span>
        </div>
        
        <nav className="flex flex-1 flex-col px-3">
          <Link to="/dashboard" className={getLinkClass('/dashboard')}>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          <SectionTitle title="Insights" />
          <Link to="/health" className={getLinkClass('/health')}>
            <Activity className="h-4 w-4" /> Project Health
          </Link>

          <SectionTitle title="Execution" />
          <Link to="/projects" className={getLinkClass('/projects')}>
            <Briefcase className="h-4 w-4" /> Projects
          </Link>
          <Link to="/dependencies" className={getLinkClass('/dependencies')}>
            <Network className="h-4 w-4" /> Dependency Map
          </Link>
          <Link to="/sprints" className={getLinkClass('/sprints')}>
            <Timer className="h-4 w-4" /> Sprints
          </Link>
          <Link to="/tasks" className={getLinkClass('/tasks')}>
            <CheckSquare className="h-4 w-4" /> Tasks
          </Link>

          <SectionTitle title="Collaboration" />
          <Link to="/teams" className={getLinkClass('/teams')}>
            <Users className="h-4 w-4" /> Teams
          </Link>
        </nav>

        <div className="mt-8 px-3 space-y-1">
          <Link to="/settings" className={getLinkClass('/settings')}>
            <Settings className="h-4 w-4" />
            Project Settings
          </Link>
          <button className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-500 hover:text-white transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Collapse
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Top Navigation */}
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-zinc-800/50 bg-[#0B0E14] px-8">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">Project Phoenix</h1>
              <Star className="h-4 w-4 text-zinc-500 cursor-pointer hover:text-amber-400 transition-colors" />
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <CheckCircle2 className="h-3 w-3" />
                On Track
              </div>
            </div>
            <div className="text-sm font-medium text-zinc-500 flex items-center gap-2">
              <span className="hover:text-zinc-300 cursor-pointer">Programs</span>
              <span>/</span>
              <span className="hover:text-zinc-300 cursor-pointer">Phoenix</span>
              <span>/</span>
              <span className="text-zinc-300">Dashboard</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:flex">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <div className="absolute right-3 top-2.5 flex items-center gap-1">
                <kbd className="inline-flex h-5 items-center gap-1 rounded border border-zinc-700 bg-zinc-800 px-1.5 font-mono text-[10px] font-medium text-zinc-400">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
              <Input
                type="search"
                placeholder="Search anything..."
                className="w-72 rounded-md bg-zinc-900/50 border-zinc-800 pl-9 pr-12 focus-visible:ring-1 focus-visible:ring-primary text-sm h-9"
              />
            </div>

            <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-md px-3 py-1.5 cursor-pointer hover:bg-zinc-800 transition-colors">
              <Calendar className="h-4 w-4 text-zinc-400" />
              <span className="text-sm text-zinc-300 font-medium">Nov 2 – Nov 30, 2025</span>
            </div>

            <Button variant="outline" className="h-9 bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>

            <div className="h-8 w-px bg-zinc-800 mx-2"></div>

            <div className="relative cursor-pointer">
              <Bell className="h-5 w-5 text-zinc-400 hover:text-white transition-colors" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-[#0B0E14]">8</span>
            </div>

            <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-transparent hover:ring-primary transition-all">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs border border-zinc-700">PP</AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col">
              <span className="text-sm font-medium text-white leading-none">Priyank Pahwa</span>
              <span className="text-xs text-zinc-500 mt-1">Project Lead</span>
            </div>
          </div>
        </header>

        {/* Main Content (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#0B0E14] custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
