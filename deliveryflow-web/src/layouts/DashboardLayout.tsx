import { useEffect } from 'react';
import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/api/projects';
import { useProjectStore } from '@/store/useProjectStore';
import { 
  LayoutDashboard, 
  Activity, 
  Network, 
  Settings, 
  ChevronLeft,
  Bell,
  Search,
  Calendar,
  Filter,
  Star,
  CheckCircle2,
  Briefcase,
  CheckSquare,
  Timer,
  Users,
  Workflow
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function DashboardLayout() {
  const token = useAuthStore(state => state.token);
  const location = useLocation();
  
  const { selectedProjectId, setSelectedProjectId } = useProjectStore();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  // Auto-select first project if none is selected
  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId, setSelectedProjectId]);
  
  const currentProject = projects?.find(p => p.id === selectedProjectId) || (projects && projects.length > 0 ? projects[0] : null);
  const projectName = currentProject?.name || 'Loading Portfolio...';
  
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentRouteName = pathSegments.length > 0 
    ? pathSegments[0].charAt(0).toUpperCase() + pathSegments[0].slice(1) 
    : 'Overview';

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  const getLinkClass = (path: string) => {
    const isActive = location.pathname.startsWith(path) || (path === '/dashboard' && location.pathname === '/');
    return isActive
      ? "flex items-center gap-3 rounded-md bg-zinc-800 text-primary px-3 py-2 text-sm font-bold transition-colors border-l-2 border-primary"
      : "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors border-l-2 border-transparent";
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <div className="px-3 mb-2 mt-6 text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
      {title}
    </div>
  );

  return (
    <div className="grid min-h-screen w-full grid-cols-[260px_1fr] bg-background">
      {/* Sidebar */}
      <div className="flex flex-col border-r border-zinc-800/80 bg-[#0B0E14] py-6 overflow-y-auto custom-scrollbar shadow-2xl z-20 relative">
        <div className="flex items-center gap-3 px-6 mb-8">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <Workflow className="h-5 w-5 text-indigo-400" />
          </div>
          <span className="text-xl font-black tracking-tight text-white uppercase">DeliveryFlow</span>
        </div>
        
        <nav className="flex flex-1 flex-col px-3 space-y-1">
          <SectionTitle title="Intelligence" />
          <Link to="/dashboard" className={getLinkClass('/dashboard')}>
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </Link>
          <Link to="/health" className={getLinkClass('/health')}>
            <Activity className="h-4 w-4" /> Project Health
          </Link>
          <Link to="/dependencies" className={getLinkClass('/dependencies')}>
            <Network className="h-4 w-4" /> Dependencies
          </Link>

          <div className="pt-4"></div>
          <SectionTitle title="Administration" />
          <Link to="/projects" className={getLinkClass('/projects')}>
            <Briefcase className="h-4 w-4" /> Projects
          </Link>
          <Link to="/sprints" className={getLinkClass('/sprints')}>
            <Timer className="h-4 w-4" /> Sprints
          </Link>
          <Link to="/tasks" className={getLinkClass('/tasks')}>
            <CheckSquare className="h-4 w-4" /> Tasks
          </Link>
          <Link to="/teams" className={getLinkClass('/teams')}>
            <Users className="h-4 w-4" /> Teams
          </Link>
        </nav>

        <div className="mt-8 px-3 space-y-1">
          <Link to="/settings" className={getLinkClass('/settings')}>
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <button className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Collapse
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Top Navigation */}
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-[#131720] px-8 shadow-sm z-10 relative">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              {/* Global Project Selector */}
              {isLoading ? (
                <div className="text-2xl font-black text-zinc-400 tracking-tight">Loading...</div>
              ) : (
                <div className="relative group">
                  <select 
                    value={selectedProjectId || ''} 
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="text-2xl font-black text-white tracking-tight bg-transparent appearance-none outline-none cursor-pointer pr-6 hover:text-indigo-100 transition-colors"
                  >
                    {projects?.map(p => (
                      <option key={p.id} value={p.id} className="text-sm font-semibold bg-zinc-900 text-white">
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {/* Custom dropdown arrow to replace default */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 group-hover:text-indigo-200">
                    ▼
                  </div>
                </div>
              )}
              
              <Star className="h-5 w-5 text-zinc-400 cursor-pointer hover:text-amber-400 transition-colors ml-2" />
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest ml-2 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                <CheckCircle2 className="h-3 w-3" />
                Active
              </div>
            </div>
            
            <div className="text-xs font-bold text-zinc-400 flex items-center gap-2 uppercase tracking-widest mt-1">
              <span className="hover:text-white cursor-pointer transition-colors">Portfolio</span>
              <span className="text-zinc-600">/</span>
              <span className="hover:text-white cursor-pointer transition-colors">{projectName}</span>
              <span className="text-zinc-600">/</span>
              <span className="text-indigo-300 font-black">{currentRouteName}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="relative hidden lg:flex">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <div className="absolute right-3 top-2.5 flex items-center gap-1">
                <kbd className="inline-flex h-5 items-center gap-1 rounded border border-zinc-700 bg-zinc-800 px-1.5 font-mono text-[10px] font-bold text-zinc-300">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
              <Input
                type="search"
                placeholder="Search delivery network..."
                className="w-80 rounded-lg bg-zinc-900/80 border-zinc-700 pl-9 pr-12 focus-visible:ring-1 focus-visible:ring-indigo-500 text-sm h-10 font-medium text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-700 rounded-lg px-4 py-2 cursor-pointer hover:bg-zinc-800 hover:border-zinc-600 transition-all shadow-sm">
              <Calendar className="h-4 w-4 text-zinc-300" />
              <span className="text-sm text-white font-bold">Nov 2 – Nov 30, 2025</span>
            </div>

            <Button variant="outline" className="h-10 bg-zinc-900/80 border-zinc-700 text-zinc-200 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 font-bold gap-2 rounded-lg">
              <Filter className="h-4 w-4" />
              Filters
            </Button>

            <div className="h-8 w-px bg-zinc-800 mx-1"></div>

            <div className="relative cursor-pointer group">
              <Bell className="h-6 w-6 text-zinc-300 group-hover:text-white transition-colors" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white border-2 border-[#131720] shadow-[0_0_10px_rgba(239,68,68,0.5)]">8</span>
            </div>

            <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-zinc-800 hover:ring-indigo-500 transition-all ml-2">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold border border-indigo-500">PP</AvatarFallback>
            </Avatar>
            <div className="hidden xl:flex flex-col">
              <span className="text-sm font-black text-white leading-none tracking-wide">Priyank Pahwa</span>
              <span className="text-[10px] text-zinc-400 mt-1 uppercase tracking-widest font-bold">Project Lead</span>
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
