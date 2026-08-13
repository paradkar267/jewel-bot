import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';
import { redirect } from "next/navigation";
import BroadcastModal from '@/components/BroadcastModal';
import CustomerTable from '@/components/CustomerTable';

export default async function LeadsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    redirect('/login');
  }

  const shopId = (session.user as any).id;

  const leads = await prisma.lead.findMany({
    where: { shop_id: shopId },
    orderBy: { last_contacted_at: 'desc' },
  });

  const serializedLeads = leads.map(l => ({
    id: l.id,
    customer_phone: l.customer_phone,
    customer_name: l.customer_name,
    message_count: l.message_count,
    is_active: l.is_active,
    last_contacted_at: l.last_contacted_at.toISOString(),
  }));

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">My Customers</h1>
          <p className="text-neutral-500 mt-1">People who have interacted with your bot</p>
        </div>
        <BroadcastModal customerCount={leads.length} />
      </div>

      <div className="bg-white shadow-sm rounded-2xl border border-neutral-200 overflow-hidden">
        <CustomerTable initialLeads={serializedLeads} />
      </div>
    </div>
  );
}
