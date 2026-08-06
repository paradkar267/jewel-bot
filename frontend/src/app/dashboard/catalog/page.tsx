import { Sparkles } from 'lucide-react';
import CatalogGrid from '@/components/CatalogGrid';
import Link from 'next/link';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from '@/lib/prisma';

export default async function CatalogPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    redirect('/login');
  }

  // Redirect admin away from catalog
  if (session.user.email === 'bizleap1@gmail.com') {
    redirect('/dashboard/admin');
  }

  const shopId = (session.user as any).id;

  const products = await prisma.product.findMany({
    where: { shop_id: shopId },
    orderBy: { created_at: 'desc' },
  });

  const serializedProducts = products.map(product => ({
    ...product,
    price: product.price ? Number(product.price) : null,
    created_at: product.created_at.toISOString(),
  }));

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Vault</h1>
          <p className="text-gray-400 mt-1">Manage and edit your exclusive jewelry catalog.</p>
        </div>
        <Link 
          href="/dashboard/add" 
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-bold text-[#0a0a0a] bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)] hover:shadow-[0_0_25px_rgba(251,191,36,0.3)] transition-all transform hover:scale-105"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Add Jewelry
        </Link>
      </div>

      <CatalogGrid initialProducts={serializedProducts as any} />
    </div>
  );
}
