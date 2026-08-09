import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Megaphone, Plus, Trash2, Shield, Bell, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";
import { getAnnouncements } from "@/app/actions/admin-features";
import AnnouncementsConsole from "@/components/AnnouncementsConsole";

const ADMIN_EMAIL = 'bizleap1@gmail.com';

export default async function AdminAnnouncementsPage() {
  const session = await getServerSession(authOptions);

  const isSuperAdmin = Boolean((session?.user as any)?.isSuperAdmin) || session?.user?.email === ADMIN_EMAIL;

  if (!session || !session.user || !isSuperAdmin) {
    redirect('/dashboard');
  }

  const result = await getAnnouncements();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center tracking-tight">
            <Megaphone className="h-8 w-8 text-amber-500 mr-3" />
            Global Platform Announcements
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Post system-wide notifications, festive offers, or feature updates visible to all registered showroom owners.
          </p>
        </div>
      </div>

      {/* Announcements Manager Component */}
      <AnnouncementsConsole initialAnnouncements={result.announcements || []} />
    </div>
  );
}
