import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex">
        <Sidebar />

        <div className="min-h-screen flex-1">
          <Topbar />

          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
