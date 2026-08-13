import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Sidebar from '@/components/Sidebar';

const ADMIN_EMAIL = 'bizleap1@gmail.com';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const userEmail = session.user.email;
  const shopName = session.user.name;
  const isSuperAdmin = Boolean((session.user as any).isSuperAdmin) || userEmail === ADMIN_EMAIL;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 font-sans selection:bg-black/10 flex flex-col md:flex-row">
      {/* Left Sidebar / Mobile Navigation */}
      <Sidebar 
        shopName={shopName ?? null} 
        userEmail={userEmail ?? null} 
        isSuperAdmin={isSuperAdmin}
      />

      {/* Main Content Area */}
      <div className="pl-0 md:pl-64 flex-1 flex flex-col min-h-screen w-full pt-16 md:pt-0">
        <main className="max-w-7xl w-full mx-auto py-4 px-4 sm:py-8 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
