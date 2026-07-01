import { AmbientBackground } from "@/components/dashboard/ambient-background";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen bg-background">
      <AmbientBackground />
      <Sidebar />
      <main className="relative flex-1 overflow-auto">{children}</main>
    </div>
  );
}
