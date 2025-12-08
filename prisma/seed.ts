import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  const hashedPassword = await bcrypt.hash('Admin@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@volunteer.com' },
    update: {},
    create: {
      email: 'admin@volunteer.com',
      password: hashedPassword,
      fullName: 'Admin User',
      phone: '+962791234567',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('Admin user created:', {
    id: admin.id,
    email: admin.email,
    fullName: admin.fullName,
    role: admin.role,
  });

  console.log('Default login credentials:');
  console.log('Email: admin@volunteer.com');
  console.log('Password: Admin@123');
  console.log('\nCHANGE THIS PASSWORD IN PRODUCTION!\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });