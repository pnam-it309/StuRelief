import { NextResponse } from 'next/server';
import { PrismaItemRepository } from '@/infrastructure/persistence/PrismaItemRepository';
import { GetItemsUseCase } from '@/use-cases/items/GetItemsUseCase';
import { PostItemUseCase } from '@/use-cases/items/PostItemUseCase';
import { createUserNotification, notifyAdmins } from '@/lib/notifications';
import prisma from '@/lib/prisma';

const itemRepository = new PrismaItemRepository();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '8');
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const studentId = searchParams.get('studentId') || undefined;
    const status = searchParams.get('status') || (studentId ? 'ALL' : 'AVAILABLE');

    const useCase = new GetItemsUseCase(itemRepository);
    const { items, total } = await useCase.execute(page, limit, { search, category, studentId, status });

    return NextResponse.json({
      data: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const useCase = new PostItemUseCase(itemRepository);
    const newItem = await useCase.execute({ ...body, status: 'DRAFT' });

    if (body.studentId) {
      await createUserNotification({
        userId: body.studentId,
        title: 'Bài đăng đã được gửi',
        content: `Bài đăng "${newItem.name}" của bạn đã được gửi và đang chờ admin duyệt.`,
        type: 'SYSTEM',
        link: `/products/${newItem.id}`,
      });
    }

    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error posting item' },
      { status: error.message?.includes('required') || error.message?.includes('Price') ? 400 : 500 }
    );
  }
}
