import { PrismaClient } from '@prisma/client';
import { universities } from './data/universities';

const prisma = new PrismaClient();

async function main() {
  console.log('[SYSTEM] Bắt đầu thêm các trường đại học mới...');

  for (const uni of universities) {
    console.log(`Đang xử lý: ${uni.name}`);
    
    // Kiểm tra xem trường đã tồn tại chưa
    const existingUni = await prisma.university.findUnique({
      where: { id: uni.id },
      include: { campuses: true }
    });

    if (existingUni) {
      console.log(`- Đã tồn tại: ${uni.name}`);
      // Thêm các cơ sở mới nếu chưa có
      for (const campusName of uni.campuses) {
        const campusExists = existingUni.campuses.some(c => c.name === campusName);
        if (!campusExists) {
          await prisma.campus.create({
            data: {
              name: campusName,
              universityId: uni.id
            }
          });
          console.log(`  + Đã thêm cơ sở mới: ${campusName}`);
        }
      }
    } else {
      // Tạo mới hoàn toàn
      await prisma.university.create({
        data: {
          id: uni.id,
          name: uni.name,
          emailDomains: [uni.domain],
          campuses: { create: uni.campuses.map(name => ({ name })) },
        },
      });
      console.log(`- Tạo mới trường: ${uni.name}`);
    }
  }

  console.log('[SUCCESS] Đã cập nhật xong dữ liệu các trường đại học!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
