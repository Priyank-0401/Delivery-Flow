import { Outlet } from "react-router-dom";

export function SettingsLayout() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account settings and organization preferences.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
            <a href="#" className="bg-muted font-medium text-foreground px-3 py-2 rounded-md text-sm whitespace-nowrap">
              Profile
            </a>
            <a href="#" className="text-muted-foreground hover:bg-muted/50 hover:text-foreground px-3 py-2 rounded-md text-sm whitespace-nowrap transition-colors">
              Organization
            </a>
            <a href="#" className="text-muted-foreground hover:bg-muted/50 hover:text-foreground px-3 py-2 rounded-md text-sm whitespace-nowrap transition-colors">
              Integrations (Jira)
            </a>
            <a href="#" className="text-muted-foreground hover:bg-muted/50 hover:text-foreground px-3 py-2 rounded-md text-sm whitespace-nowrap transition-colors">
              API Keys
            </a>
          </nav>
        </aside>
        
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
