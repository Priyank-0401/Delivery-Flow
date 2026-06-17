import { useState, useEffect } from "react";
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
  Briefcase,
  CheckSquare,
  Timer,
  Users,
  Workflow,
  ShieldAlert,
  Sparkles,
  Palette,
  FolderOpen,
  Search
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommandPalette } from '@/components/ui/CommandPalette';
import { EntitySelector } from '@/components/ui/EntitySelector';
import { NotificationDrawer } from '@/components/ui/NotificationDrawer';

export function DashboardLayout() {
  const token = useAuthStore(state => state.token);
  const location = useLocation();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  const { selectedProjectId, setSelectedProjectId } = useProjectStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

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
  
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  const getLinkClass = (path: string) => {
    const isActive = location.pathname.startsWith(path) || (path === '/dashboard' && location.pathname === '/');
    return isActive
      ? "flex items-center gap-3 rounded-r-md bg-zinc-100 text-zinc-900 px-3 py-2 text-sm font-bold transition-colors border-l-4 border-indigo-600"
      : "flex items-center gap-3 rounded-r-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors border-l-4 border-transparent ml-1";
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <div className="px-3 mb-1 mt-6 text-xs font-semibold text-zinc-400">
      {title}
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-zinc-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-[220px] flex-shrink-0 flex flex-col border-r border-zinc-200 bg-zinc-50/50 py-6 overflow-y-auto z-20">
        <div className="flex items-center gap-3 px-6 mb-8">
          <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
            <Workflow className="h-4 w-4 text-indigo-600" />
          </div>
          <span className="text-lg font-bold tracking-tight text-zinc-900">DeliveryFlow</span>
        </div>
        
        <nav className="flex flex-1 flex-col pr-3 space-y-0.5">
          <SectionTitle title="Workspace" />
          <Link to="/dashboard" className={getLinkClass('/dashboard')}>
            <LayoutDashboard className="h-4 w-4" /> Overview
          </Link>

          <SectionTitle title="Execution" />
          <Link to="/projects" className={getLinkClass('/projects')}>
            <Briefcase className="h-4 w-4" /> Projects
          </Link>
          <Link to="/sprints" className={getLinkClass('/sprints')}>
            <Timer className="h-4 w-4" /> Sprints
          </Link>
          <Link to="/tasks" className={getLinkClass('/tasks')}>
            <CheckSquare className="h-4 w-4" /> Tasks
          </Link>

          <SectionTitle title="Intelligence" />
          <Link to="/dependencies" className={getLinkClass('/dependencies')}>
            <Network className="h-4 w-4" /> Dependencies
          </Link>
          <Link to="/health" className={getLinkClass('/health')}>
            <Activity className="h-4 w-4" /> Health
          </Link>
          <Link to="#" className="flex items-center gap-3 rounded-r-md px-3 py-2 text-sm font-medium text-zinc-400 cursor-not-allowed border-l-4 border-transparent ml-1">
            <ShieldAlert className="h-4 w-4" /> Risks
          </Link>
          <Link to="/teams" className={getLinkClass('/teams')}>
            <Users className="h-4 w-4" /> Capacity
          </Link>

          <SectionTitle title="AI Assistant" />
          <Link to="#" className="flex items-center gap-3 rounded-r-md px-3 py-2 text-sm font-medium text-zinc-400 cursor-not-allowed border-l-4 border-transparent ml-1">
            <Sparkles className="h-4 w-4" /> AI Advisor
          </Link>

          <SectionTitle title="Administration" />
          <Link to="/design-system" className={getLinkClass('/design-system')}>
            <Palette className="h-4 w-4" /> Design System
          </Link>
        </nav>

        <div className="mt-8 px-3 space-y-1">
          <Link to="/settings" className={getLinkClass('/settings')}>
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <button className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Collapse
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <header className="h-16 flex-shrink-0 flex items-center justify-between border-b border-zinc-200 bg-white px-8 z-10">
          
          {/* Left: Breadcrumbs & Context Switcher */}
          <div className="flex items-center gap-3">
            <Link to="/projects" className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Portfolio</Link>
            <span className="text-zinc-300">/</span>
            
            {isLoading ? (
              <div className="w-32 h-8 bg-zinc-100 animate-pulse rounded-md"></div>
            ) : (
              <EntitySelector
                value={selectedProjectId || null}
                onChange={setSelectedProjectId}
                triggerIcon={<FolderOpen className="w-4 h-4" />}
                options={projects?.map((p, i) => ({
                  id: p.id,
                  label: p.name,
                  group: i < 2 ? 'Pinned' : 'Recent',
                  health: 85 + i * 2, // Mock health data
                  sprint: `Sprint ${10 + i}`, // Mock sprint
                  owner: 'Mobile Team' // Mock owner
                })) || []}
              />
            )}
            
            <span className="text-zinc-300">/</span>
            <Link to={`/${location.pathname.split('/')[1] || 'dashboard'}`} className="text-sm font-bold text-zinc-900 capitalize hover:underline transition-all">
              {location.pathname.split('/')[1] || 'Overview'}
            </Link>
          </div>

          {/* Center: Inline Context Metrics */}
          <div className="hidden xl:flex items-center gap-4">
             <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors border border-transparent hover:border-zinc-200">
               <span className="w-2 h-2 rounded-full bg-success"></span>
               <span className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Healthy 87</span>
             </button>
             <Link to="/tasks?filter=blocked" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors border border-transparent hover:border-zinc-200">
               <span className="w-2 h-2 rounded-full bg-danger"></span>
               <span className="text-xs font-bold text-zinc-900 uppercase tracking-widest">3 Blocked</span>
             </Link>
             <Link to="/health" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors border border-transparent hover:border-zinc-200">
               <span className="w-2 h-2 rounded-full bg-warning"></span>
               <span className="text-xs font-bold text-zinc-900 uppercase tracking-widest">2 Risks</span>
             </Link>
             <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors border border-transparent hover:border-zinc-200">
               <span className="w-2 h-2 rounded-full bg-zinc-300"></span>
               <span className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Forecast On Track</span>
             </button>
          </div>
          
          {/* Right: Search, Notifications, Avatar */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors text-zinc-500"
            >
              <Search className="w-4 h-4" />
              <span className="text-sm font-medium mr-4">Search...</span>
              <kbd className="px-1.5 py-0.5 bg-white border border-zinc-200 rounded text-[10px] font-bold text-zinc-500">⌘K</kbd>
            </button>

            <div className="w-px h-6 bg-zinc-200 mx-2"></div>

            <button 
              onClick={() => setIsNotificationOpen(true)}
              className="text-zinc-400 hover:text-zinc-900 transition-colors relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-danger border-2 border-white"></span>
            </button>
            <Avatar className="h-8 w-8 cursor-pointer ring-1 ring-zinc-200 hover:ring-indigo-500 transition-all">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-indigo-50 text-indigo-600 text-xs font-semibold">PP</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main Content (Scrollable) */}
        <main className="flex-1 overflow-y-auto px-8 py-8 bg-[#FAFAFA] w-full">
          <Outlet />
        </main>
      </div>
      
      <CommandPalette 
        open={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
      
      <NotificationDrawer 
        open={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
}
