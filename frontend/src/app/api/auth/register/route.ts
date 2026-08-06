import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password, shopName, whatsappNumber, metaPhoneId } = await req.json();

    if (!email || !password || !shopName || !whatsappNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await prisma.shop.findUnique({
      where: { owner_email: email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const shop = await prisma.shop.create({
      data: {
        name: shopName,
        owner_email: email,
        password: hashedPassword,
        whatsapp_number: whatsappNumber,
        meta_phone_number_id: metaPhoneId || null,
      }
    });

    return NextResponse.json({ success: true, shopId: shop.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
