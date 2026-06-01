import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[SYSTEM] Cập nhật lại tên các cơ sở đại học cho rõ ràng...');

  const updates = [
    { old: 'Cơ sở A', newName: 'Cơ sở A (Nguyễn Đình Chiểu)' },
    { old: 'Cơ sở B', newName: 'Cơ sở B (Nguyễn Tri Phương)' },
    { old: 'Cơ sở N', newName: 'Cơ sở N (Nam Thành phố)' },
    { old: 'Cơ sở Nam Thành phố', newName: 'Cơ sở N (Nam Thành phố)' }
  ];

  for (const u of updates) {
    const campus = await prisma.campus.findFirst({
      where: { name: u.old }
    });
    
    if (campus) {
      await prisma.campus.update({
        where: { id: campus.id },
        data: { name: u.newName }
      });
      console.log(`- Cập nhật: ${u.old} -> ${u.newName}`);
    }
  }

  console.log('[SUCCESS] Đã đổi tên xong!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
