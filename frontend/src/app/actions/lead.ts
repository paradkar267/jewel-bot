'use server';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function deleteLead(leadId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return { success: false, error: 'Unauthorized' };
    }

    const shopId = (session.user as any).id;

    const existing = await prisma.lead.findFirst({
      where: { id: leadId, shop_id: shopId }
    });

    if (!existing) {
      return { success: false, error: 'Customer not found' };
    }

    await prisma.lead.delete({
      where: { id: leadId }
    });

    revalidatePath('/dashboard/leads');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting lead:", error);
    return { success: false, error: error.message || 'Failed to delete customer' };
  }
}
