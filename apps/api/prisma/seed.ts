import * as path from 'path';
import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';

// Load .env from root or local workspace if available (Node 20.12+)
const envPaths = [
  path.resolve(__dirname, '../../../.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(process.cwd(), '.env'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile(envPath);
    } catch {
      // Ignore if already loaded
    }
  }
}

const prisma = new PrismaClient();

function formatDisplayName(email: string): string {
  const username = email.split('@')[0] || 'admin';
  return username
    .split(/[._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ') || 'Administrator';
}

async function main() {
  console.log('🌱 Memulai proses seeding akun Administrator...');

  // Baca daftar email dari environment variable ADMIN_EMAILS
  const rawAdminEmails = process.env.ADMIN_EMAILS || 'admin@walikelas.id';
  const adminEmails = Array.from(
    new Set(
      rawAdminEmails
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean),
    ),
  );

  if (adminEmails.length === 0) {
    adminEmails.push('admin@walikelas.id');
  }

  console.log(`📋 Ditemukan ${adminEmails.length} email admin untuk di-seed:`, adminEmails);

  for (const email of adminEmails) {
    const displayName = formatDisplayName(email);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role: 'ADMIN',
        status: 'ACTIVE',
      },
      create: {
        email,
        name: displayName,
        role: 'ADMIN',
        status: 'ACTIVE',
        teacherProfile: {
          create: {
            displayName,
            schoolName: 'WaliKelas Management',
          },
        },
      },
      include: {
        teacherProfile: true,
      },
    });

    if (!user.teacherProfile) {
      await prisma.teacherProfile.create({
        data: {
          userId: user.id,
          displayName,
          schoolName: 'WaliKelas Management',
        },
      });
    }

    console.log(`  ✅ [ADMIN] ${user.email} (ID: ${user.id}, Nama: ${user.name})`);
  }

  console.log('✨ Seeding akun admin selesai dengan sukses!');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
