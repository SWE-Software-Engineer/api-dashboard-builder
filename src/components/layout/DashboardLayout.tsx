// =============================================================================
// Dashboard Layout with Sidebar
// =============================================================================

import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="container mx-auto px-4 py-8 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
