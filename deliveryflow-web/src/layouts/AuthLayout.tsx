import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-zinc-950 p-12 text-white border-r border-border relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-900/40 via-zinc-950 to-zinc-950 z-0"></div>
        
        <div className="z-10 relative">
          <h1 className="text-3xl font-bold tracking-tighter">DeliveryFlow</h1>
          <p className="text-zinc-400 mt-2">Delivery Intelligence Platform</p>
        </div>
        
        <div className="z-10 relative">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium text-zinc-300">
              "Predicting delivery failures before they happen."
            </p>
          </blockquote>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-background p-8">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
