import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#0B0E14]">
      <Outlet />
    </div>
  );
}
