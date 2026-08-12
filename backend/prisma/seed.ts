import { prisma } from '../lib/prisma';
import { Role, DoctorStatus } from '@prisma/client';
import * as argon2 from 'argon2';

async function main() {
  console.log('🌱 Starting Gippo.uz Database Seeding...');

  // 1. Seed Specialties
  const cardiology = await prisma.specialty.upsert({
    where: { slug: 'cardiology' },
    update: {},
    create: {
      name: 'Cardiology',
      slug: 'cardiology',
      description: 'Heart and cardiovascular healthcare',
      iconUrl: 'https://cdn.gippo.uz/icons/cardiology.svg',
    },
  });

  const pediatrics = await prisma.specialty.upsert({
    where: { slug: 'pediatrics' },
    update: {},
    create: {
      name: 'Pediatrics',
      slug: 'pediatrics',
      description: 'Infant, child, and adolescent medicine',
      iconUrl: 'https://cdn.gippo.uz/icons/pediatrics.svg',
    },
  });

  const dermatology = await prisma.specialty.upsert({
    where: { slug: 'dermatology' },
    update: {},
    create: {
      name: 'Dermatology',
      slug: 'dermatology',
      description: 'Skin, hair, and nail healthcare',
      iconUrl: 'https://cdn.gippo.uz/icons/dermatology.svg',
    },
  });

  console.log('✅ Specialties seeded');

  // 2. Seed Initial Admin
  const adminPasswordHash = await argon2.hash('SuperAdminPass123!', {
    type: argon2.argon2id,
  });

  await prisma.user.upsert({
    where: { email: 'admin@gippo.uz' },
    update: {},
    create: {
      email: 'admin@gippo.uz',
      passwordHash: adminPasswordHash,
      firstName: 'Gippo',
      lastName: 'Admin',
      phone: '+998900000000',
      role: Role.ADMIN,
      isEmailVerified: true,
    },
  });

  console.log('✅ System Admin created (admin@gippo.uz / SuperAdminPass123!)');

  // 3. Seed Verified Approved Doctor
  const doctorPasswordHash = await argon2.hash('DoctorPass123!', {
    type: argon2.argon2id,
  });

  const doctorUser = await prisma.user.upsert({
    where: { email: 'dr.botir@gippo.uz' },
    update: {},
    create: {
      email: 'dr.botir@gippo.uz',
      passwordHash: doctorPasswordHash,
      firstName: 'Botir',
      lastName: 'Kadirov',
      phone: '+998911111111',
      role: Role.DOCTOR,
      isEmailVerified: true,
    },
  });

  await prisma.doctorProfile.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      bio: 'Senior Cardiologist with 12 years of experience at Tashkent Heart Center.',
      experienceYears: 12,
      education: 'Tashkent Medical Academy (MD, PhD)',
      licenseNumber: 'UZ-MED-LIC-0001',
      consultationFee: 150000.0,
      verificationStatus: DoctorStatus.APPROVED,
      isOnline: true,
      specialties: {
        create: [
          { specialtyId: cardiology.id },
        ],
      },
      availabilities: {
        create: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 },
          { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 },
          { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 },
          { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 },
          { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 },
        ],
      },
      ledger: {
        create: {
          totalEarnings: 0,
          availableBalance: 0,
          pendingBalance: 0,
          totalWithdrawn: 0,
        },
      },
    },
  });

  console.log('✅ Approved Doctor created (dr.botir@gippo.uz / DoctorPass123!)');

  // 4. Seed Test Patient
  const patientPasswordHash = await argon2.hash('PatientPass123!', {
    type: argon2.argon2id,
  });

  await prisma.user.upsert({
    where: { email: 'patient@gippo.uz' },
    update: {},
    create: {
      email: 'patient@gippo.uz',
      passwordHash: patientPasswordHash,
      firstName: 'Anvar',
      lastName: 'Tursunov',
      phone: '+998922222222',
      role: Role.PATIENT,
      isEmailVerified: true,
    },
  });

  console.log('✅ Test Patient created (patient@gippo.uz / PatientPass123!)');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
