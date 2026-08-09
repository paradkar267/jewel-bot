import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { FileSpreadsheet, Shield } from "lucide-react";
import ExportConsole from "@/components/ExportConsole";

const ADMIN_EMAIL = 'bizleap1@gmail.com';

export default async function AdminExportPage() {
  const session = await getServerSession(authOptions);

  const isSuperAdmin = Boolean((session?.user as any)?.isSuperAdmin) || session?.user?.email === ADMIN_EMAIL;

  if (!session || !session.user || !isSuperAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center tracking-tight">
            <FileSpreadsheet className="h-8 w-8 text-amber-500 mr-3" />
            1-Click Master Platform CSV & Excel Exporter
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Export comprehensive data reports of registered showrooms, products, customer leads, and broadcast metrics in standard CSV format.
          </p>
        </div>
      </div>

      {/* Export Console Component */}
      <ExportConsole />
    </div>
  );
}
