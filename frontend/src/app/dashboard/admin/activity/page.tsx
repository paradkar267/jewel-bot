import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Activity } from "lucide-react";
import { getAdminActivityLogs } from "@/app/actions/admin-features";
import AuditLogsConsole from "@/components/AuditLogsConsole";

const ADMIN_EMAIL = 'bizleap1@gmail.com';

export default async function AdminActivityPage() {
  const session = await getServerSession(authOptions);

  const isSuperAdmin = Boolean((session?.user as any)?.isSuperAdmin) || session?.user?.email === ADMIN_EMAIL;

  if (!session || !session.user || !isSuperAdmin) {
    redirect('/dashboard');
  }

  const result = await getAdminActivityLogs();

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center tracking-tight">
            <Activity className="h-8 w-8 text-amber-500 mr-3" />
            Real-Time Showroom Audit Logs & Activity Feed
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Filter activities shop-by-shop or view live grouped streams for all registered jewelry showrooms.
          </p>
        </div>
      </div>

      {/* Interactive Audit Logs Console Component */}
      <AuditLogsConsole
        initialShops={result.shops || []}
        initialActivities={result.activities || []}
      />
    </div>
  );
}
