import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { env } from '@/infrastructure/config/env';
import { getAuthToken } from '@/lib/authHelper';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = getAuthToken(cookieStore, request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token, env.JWT_SECRET);
    if (!payload) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        profile: {
          select: {
            campusId: true,
            universityId: true,
            campus: {
              select: {
                name: true,
              },
            },
            university: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const url = new URL(request.url);
    const pointId = url.searchParams.get('id');

    const profile = currentUser?.profile;
    
    // Tạo mảng các điều kiện OR
    const orConditions: any[] = [];
    if (profile?.campusId) {
      orConditions.push({ campusId: profile.campusId });
    } else if (profile?.universityId) {
      orConditions.push({ campus: { universityId: profile.universityId } });
    }
    if (pointId) {
      orConditions.push({ id: pointId });
    }

    const where = orConditions.length > 0 ? { OR: orConditions } : {};

    const meetingPoints = await prisma.meetingPoint.findMany({
      where,
      orderBy: [{ isSafeZone: 'desc' }, { name: 'asc' }],
      include: {
        campus: {
          select: {
            id: true,
            name: true,
            address: true,
            latitude: true,
            longitude: true,
            university: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      data: meetingPoints.map((meetingPoint) => ({
        id: meetingPoint.id,
        name: meetingPoint.name,
        description: meetingPoint.description,
        photoUrl: meetingPoint.photoUrl,
        isSafeZone: meetingPoint.isSafeZone,
        campusId: meetingPoint.campusId,
        campusName: meetingPoint.campus.name,
        campusAddress: meetingPoint.campus.address,
        campusLatitude: meetingPoint.campus.latitude,
        campusLongitude: meetingPoint.campus.longitude,
        universityName: meetingPoint.campus.university.name,
      })),
      meta: {
        scope: profile?.campusId ? 'campus' : profile?.universityId ? 'university' : 'all',
        campusName: profile?.campus?.name ?? null,
        universityName: profile?.university?.name ?? null,
        totalPoints: meetingPoints.length,
        safePoints: meetingPoints.filter((meetingPoint) => meetingPoint.isSafeZone).length,
        campusCount: new Set(meetingPoints.map((meetingPoint) => meetingPoint.campus.id)).size,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
