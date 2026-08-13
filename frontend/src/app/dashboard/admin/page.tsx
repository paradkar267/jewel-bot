import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getAdminStats } from "@/app/actions/admin";
import AdminConsole from "@/components/AdminConsole";

const ADMIN_EMAIL = 'bizleap1@gmail.com';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  const isSuperAdmin = Boolean((session?.user as any)?.isSuperAdmin) || session?.user?.email === ADMIN_EMAIL;

  if (!session || !session.user || !isSuperAdmin) {
    redirect('/dashboard');
  }

  const result = await getAdminStats();

  if (!result.success) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 shadow-sm">
        <p className="font-bold text-lg mb-2">Failed to load administrative console</p>
        <p className="text-xs opacity-80">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Platform Control Panel</h1>
        <p className="text-neutral-505 mt-1">Manage global shops, monitor metrics, and configure WhatsApp settings.</p>
      </div>

      <AdminConsole stats={result.stats} initialShops={result.shops as any} />
    </div>
  );
}
