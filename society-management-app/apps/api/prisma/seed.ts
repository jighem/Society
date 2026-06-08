import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting application database seeding...');

  // 1. Seed Permissions list
  const permissionsList = [
    { code: 'society.view', description: 'View society information' },
    { code: 'society.create', description: 'Create new housing society records' },
    { code: 'society.update', description: 'Modify housing society profile details' },
    { code: 'society.delete', description: 'Remove housing society records' },
    
    { code: 'building.view', description: 'View buildings' },
    { code: 'building.create', description: 'Add new building entries' },
    { code: 'building.update', description: 'Edit building data' },
    { code: 'building.delete', description: 'Delete building profiles' },

    { code: 'wing.view', description: 'View society building wings' },
    { code: 'wing.create', description: 'Create wings' },
    { code: 'flat.view', description: 'View flat configuration' },
    { code: 'flat.create', description: 'Add flat configurations' },

    { code: 'owner.view', description: 'View flat owners list' },
    { code: 'owner.create', description: 'Add new flat owner profiles' },
    { code: 'tenant.view', description: 'View flat tenants records' },
    { code: 'tenant.create', description: 'Add tenant profile properties' },

    { code: 'maintenance.view', description: 'View maintenance calculators' },
    { code: 'maintenance.generate', description: 'Execute scheduled monthly bill calculations' },
    { code: 'maintenance.approve', description: 'Approve generated bill categories' },

    { code: 'payment.view', description: 'View invoices and transactions records' },
    { code: 'payment.create', description: 'Register member maintenance payments' },
    { code: 'expense.view', description: 'View society expenditure logs' },
    { code: 'expense.create', description: 'Add expense vouchers' },
    { code: 'expense.approve', description: 'Approve society expenses' },

    { code: 'complaint.view', description: 'Check resident ticket requests' },
    { code: 'complaint.create', description: 'File active issue complaints' },
    { code: 'complaint.assign', description: 'Assign complaint tickets to active vendors or staff' },
    { code: 'complaint.resolve', description: 'Mark complaint tickets as resolved' },

    { code: 'notice.view', description: 'Read circular notices' },
    { code: 'notice.create', description: 'Broadcast new society banners' },
    
    { code: 'document.upload', description: 'Store official registry files' },
    { code: 'report.view', description: 'Generate complex ledger reports' },
    { code: 'settings.manage', description: 'Access global developer controls' },
  ];

  console.log('🔑 Populating permission entities...');
  const cachedPermissionsMap: Record<string, string> = {};
  for (const perm of permissionsList) {
    const record = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
    cachedPermissionsMap[perm.code] = record.id;
  }

  // 2. Seed Default Roles
  const rolesList = [
    'SUPER_ADMIN',
    'SOCIETY_ADMIN',
    'CHAIRMAN',
    'SECRETARY',
    'TREASURER',
    'COMMITTEE_MEMBER',
    'OWNER',
    'TENANT',
    'ACCOUNTANT',
    'SECURITY_GUARD',
    'FACILITY_MANAGER',
    'AUDITOR',
  ];

  console.log('🎭 Creating default security groups...');
  const cachedRolesMap: Record<string, string> = {};
  for (const rName of rolesList) {
    const record = await prisma.role.upsert({
      where: { name: rName },
      update: {},
      create: {
        name: rName,
        description: `Functional role schema representing ${rName.toLowerCase().replace('_', ' ')}`,
      },
    });
    cachedRolesMap[rName] = record.id;
  }

  // Bind permissions to roles
  console.log('🔗 Mapping default permissions keys to security roles...');
  // Society Admin gets almost everything EXCEPT society level creation/destruction (handled by SaaS Super Admin)
  const societyAdminPerms = Object.keys(cachedPermissionsMap).filter(
    (key) => key !== 'society.create' && key !== 'society.delete',
  );

  for (const code of societyAdminPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: cachedRolesMap['SOCIETY_ADMIN'],
          permissionId: cachedPermissionsMap[code],
        },
      },
      update: {},
      create: {
        roleId: cachedRolesMap['SOCIETY_ADMIN'],
        permissionId: cachedPermissionsMap[code],
      },
    });
  }

  // Owner Permissions
  const ownerPerms = ['flat.view', 'owner.view', 'complaint.view', 'complaint.create', 'notice.view', 'payment.view', 'document.upload'];
  for (const code of ownerPerms) {
    if (cachedPermissionsMap[code]) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: cachedRolesMap['OWNER'],
            permissionId: cachedPermissionsMap[code],
          },
        },
        update: {},
        create: {
          roleId: cachedRolesMap['OWNER'],
          permissionId: cachedPermissionsMap[code],
        },
      });
    }
  }

  // Tenant Permissions
  const tenantPerms = ['flat.view', 'complaint.view', 'complaint.create', 'notice.view'];
  for (const code of tenantPerms) {
    if (cachedPermissionsMap[code]) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: cachedRolesMap['TENANT'],
            permissionId: cachedPermissionsMap[code],
          },
        },
        update: {},
        create: {
          roleId: cachedRolesMap['TENANT'],
          permissionId: cachedPermissionsMap[code],
        },
      });
    }
  }

  // 3. Create Sample Society "Green Heights Co-operative Housing Society"
  console.log('🏢 Creating sample green heights housing society...');
  const society = await prisma.society.upsert({
    where: { registrationNumber: 'CHS-2026-904128' },
    update: {},
    create: {
      name: 'Green Heights Co-operative Housing Society',
      registrationNumber: 'CHS-2026-904128',
      address: 'Plot 45-C, Sector 12, Kharghar',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      pinCode: '410210',
      contactNumber: '+919876543210',
      email: 'admin@greenheights.com',
      bankName: 'State Bank of India',
      bankAccountNumber: '39401920392',
      ifscCode: 'SBIN0001041',
      isActive: true,
    },
  });

  // 4. Encrypt default credentials using Bcrypt
  const adminHash = await bcrypt.hash('Admin@123', 10);
  const ownerHash = await bcrypt.hash('Owner@123', 10);
  const tenantHash = await bcrypt.hash('Tenant@123', 10);

  // Create Users
  console.log('👤 Seeding default credential accounts...');
  
  // Super Admin
  await prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: {},
    create: {
      email: 'superadmin@example.com',
      mobile: '+919999999999',
      passwordHash: adminHash,
      firstName: 'Albus',
      lastName: 'Dumbledore',
      roleId: cachedRolesMap['SUPER_ADMIN'],
    },
  });

  // Society Admin
  const societyAdminUser = await prisma.user.upsert({
    where: { email: 'admin@society.com' },
    update: {},
    create: {
      email: 'admin@society.com',
      mobile: '+918888888888',
      passwordHash: adminHash,
      firstName: 'Remus',
      lastName: 'Lupin',
      roleId: cachedRolesMap['SOCIETY_ADMIN'],
      societyId: society.id,
    },
  });

  // Owner User
  const ownerUser = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      email: 'owner@example.com',
      mobile: '+917777777777',
      passwordHash: ownerHash,
      firstName: 'Jayesh',
      lastName: 'Panchal',
      roleId: cachedRolesMap['OWNER'],
      societyId: society.id,
    },
  });

  // Tenant User
  const tenantUser = await prisma.user.upsert({
    where: { email: 'tenant@example.com' },
    update: {},
    create: {
      email: 'tenant@example.com',
      mobile: '+916666666666',
      passwordHash: tenantHash,
      firstName: 'Harry',
      lastName: 'Potter',
      roleId: cachedRolesMap['TENANT'],
      societyId: society.id,
    },
  });

  // 5. Build structure entities: Buildings, Wings, and Flats (101 to 110 per wing)
  console.log('🧱 Erecting building entities A & B...');
  const buildingA = await prisma.building.create({
    data: {
      name: 'A Building',
      code: 'BLD-A',
      floors: 3,
      societyId: society.id,
    },
  });

  const buildingB = await prisma.building.create({
    data: {
      name: 'B Building',
      code: 'BLD-B',
      floors: 3,
      societyId: society.id,
    },
  });

  console.log('🦋 Expanding structure to wings (A1, A2, B1, B2)...');
  const wingsConfig = [
    { name: 'A1', buildingId: buildingA.id },
    { name: 'A2', buildingId: buildingA.id },
    { name: 'B1', buildingId: buildingB.id },
    { name: 'B2', buildingId: buildingB.id },
  ];

  const cachedWings: any[] = [];
  for (const w of wingsConfig) {
    const wing = await prisma.wing.create({
      data: {
        name: w.name,
        floors: 3,
        buildingId: w.buildingId,
        societyId: society.id,
      },
    });
    cachedWings.push(wing);
  }

  // Create Flats 101 to 110 for each wing
  console.log('🏠 Instantiating flats 101-110 for each building wing...');
  let demoFlatId = '';
  for (const wing of cachedWings) {
    for (let flatNum = 101; flatNum <= 110; flatNum++) {
      const flat = await prisma.flat.create({
        data: {
          flatNumber: flatNum.toString(),
          floor: 1,
          carpetArea: 750.0,
          builtUpArea: 950.0,
          flatType: '2BHK',
          ownershipStatus: flatNum === 101 ? 'Owned' : flatNum === 102 ? 'Rented' : 'Vacant',
          occupancyStatus: flatNum === 101 ? 'SelfOccupied' : flatNum === 102 ? 'TenantOccupied' : 'Vacant',
          maintenanceCategory: 'Residential Standard',
          societyId: society.id,
          buildingId: wing.buildingId,
          wingId: wing.id,
        },
      });
      if (wing.name === 'A1' && flatNum === 101) {
        demoFlatId = flat.id;
      }
    }
  }

  // Map Owner and Tenant Profiles
  console.log('📋 Creating flat owners and rentals links...');
  const ownerProfile = await prisma.owner.create({
    data: {
      name: 'Jayesh Panchal',
      mobileNumber: '+917777777777',
      email: 'owner@example.com',
      address: 'Flat 101, Wing A1, Green Heights',
      panNumber: 'ABCDE1234F',
      emergencyContact: '+919900990099',
      ownershipStartDate: new Date('2021-01-01'),
      flatId: demoFlatId,
      userId: ownerUser.id,
    },
  });

  await prisma.tenant.create({
    data: {
      name: 'Harry Potter',
      mobileNumber: '+916666666666',
      email: 'tenant@example.com',
      agreementStartDate: new Date('2025-01-01'),
      agreementEndDate: new Date('2027-01-01'),
      policeVerificationStatus: true,
      flatId: demoFlatId,
      userId: tenantUser.id,
      ownerId: ownerProfile.id,
    },
  });

  // 6. Create Maintenance rules
  console.log('🧮 Seeding maintenance master ledger rule sets...');
  await prisma.maintenanceHead.create({
    data: {
      code: 'FIX_MAINT',
      name: 'Fixed Maintenance Charge',
      description: 'Monthly flat standard maintenance cost distribution',
      societyId: society.id,
    },
  });

  await prisma.maintenanceRule.create({
    data: {
      name: 'Residential Base Standard',
      calculationMethod: 'FIXED',
      amount: 1700.0,
      societyId: society.id,
    },
  });

  // 7. Seed Sample Notice
  console.log('📢 Broadcasting welcome notifications...');
  await prisma.notice.create({
    data: {
      title: 'Monsoon Preparedness Circular',
      content: 'All residents are requested to ensure balcony drain channels are clear prior to high rainfall sequences target cleanings.',
      targetRole: 'ALL',
      societyId: society.id,
      createdById: societyAdminUser.id,
    },
  });

  console.log('🌱 Application Database Seeding Completed Successfully! Enjoy workspace administration.\n');
}

main()
  .catch((e) => {
    console.error('❌ Error writing database seed files:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
