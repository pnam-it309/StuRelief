import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('audio/')) {
      return NextResponse.json({ error: 'Only image and audio files are allowed' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to the public/uploads directory
    const isProd = process.env.NODE_ENV === 'production';
    // In Docker (standalone monorepo), cwd is /app but public is in /app/web/public
    const baseDir = isProd ? join(process.cwd(), 'web') : process.cwd();
    const uploadDir = join(baseDir, 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Generate a unique safe filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filename = `${uniqueSuffix}-${cleanFileName}`;
    const filepath = join(uploadDir, filename);

    // Write file to local disk
    await writeFile(filepath, buffer);

    // Return the absolute public path
    const fileUrl = `/uploads/${filename}`;
    
    return NextResponse.json({ url: fileUrl });
  } catch (error: any) {
    console.error('Error handling upload:', error);
    return NextResponse.json({ error: 'Internal Server Error during upload' }, { status: 500 });
  }
}
