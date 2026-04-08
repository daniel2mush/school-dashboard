import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'node:url';
import {
  AttendanceStatus,
  DayOfWeek,
  Gender,
  Level,
  Priority,
  Role,
  TargetType,
} from '../generated/prisma/index.js';
import { prisma } from '../src/clients/prismaClient.js';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

const PASSWORD = 'password123';
const SCHOOL_NAME = 'Sunridge Academy';
const EMAIL_DOMAIN = 'sunridge.edu';

const teacherFirstNames = [
  'Amina',
  'Basil',
  'Clara',
  'Daniel',
  'Esther',
  'Faisal',
  'Grace',
  'Hassan',
  'Irene',
  'Jamal',
];

const studentFirstNames = [
  'Ama',
  'Kwame',
  'Esi',
  'Kojo',
  'Akosua',
  'Kofi',
  'Adjoa',
  'Yaw',
  'Nana',
  'Abena',
  'Mensah',
  'Afia',
  'Prince',
  'Zainab',
  'Joseph',
  'Linda',
  'Michael',
  'Rita',
  'Samuel',
  'Thandi',
];

const lastNames = [
  'Mensah',
  'Boateng',
  'Asante',
  'Owusu',
  'Agyeman',
  'Addo',
  'Baah',
  'Sarpong',
  'Yeboah',
  'Badu',
];

const subjectsSeed = [
  'Mathematics',
  'English',
  'Science',
  'Social Studies',
  'ICT',
  'French',
  'History',
  'Geography',
];

const yearGroupSpecs = [
  { name: 'Year 1', level: Level.Primary, roomNumber: 'A1', capacity: 24 },
  { name: 'Year 2', level: Level.Primary, roomNumber: 'A2', capacity: 24 },
  { name: 'Year 3', level: Level.Primary, roomNumber: 'B1', capacity: 22 },
  {
    name: 'JHS 1',
    level: Level.JuniorSecondary,
    roomNumber: 'C1',
    capacity: 26,
  },
  {
    name: 'SHS 1',
    level: Level.SeniorSecondary,
    roomNumber: 'D1',
    capacity: 28,
  },
];

const periodSeed = [
  { label: 'Period 1', startTime: '07:30', endTime: '08:20' },
  { label: 'Period 2', startTime: '08:20', endTime: '09:10' },
  { label: 'Period 3', startTime: '09:10', endTime: '10:00' },
  { label: 'Break', startTime: '10:00', endTime: '10:30', isBreak: true },
  { label: 'Period 4', startTime: '10:30', endTime: '11:20' },
  { label: 'Period 5', startTime: '11:20', endTime: '12:10' },
  { label: 'Period 6', startTime: '12:10', endTime: '13:00' },
];

function createRng(seed: number) {
  return function rng() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: T[], index: number) {
  return items[index % items.length];
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

function gradeFromScore(score: number) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'E';
}

function amountInWords(amount: number) {
  return `${amount.toFixed(2)} Ghana cedis`;
}

function getSchoolDays(count: number, rng: () => number) {
  const days: Date[] = [];
  const current = new Date();
  current.setHours(0, 0, 0, 0);

  while (days.length < count) {
    current.setDate(current.getDate() - 1);
    const day = current.getDay();
    if (day === 0 || day === 6) continue;
    const date = new Date(current);
    date.setHours(8 + Math.floor(rng() * 2), Math.floor(rng() * 60), 0, 0);
    days.push(date);
  }

  return days.reverse();
}

async function createManyInChunks<T>(
  rows: T[],
  createMany: (data: T[]) => Promise<unknown>,
  chunkSize = 250,
) {
  for (let index = 0; index < rows.length; index += chunkSize) {
    await createMany(rows.slice(index, index + chunkSize));
  }
}

async function main() {
  console.log(`Starting seed process for ${SCHOOL_NAME}...`);

  const rng = createRng(20260408);
  const password = await bcrypt.hash(PASSWORD, 12);

  console.log('Resetting existing data...');
  await prisma.announcement.deleteMany();
  await prisma.material.deleteMany();
  await prisma.feePayment.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.timetable.deleteMany();
  await prisma.fee.deleteMany();
  await prisma.period.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();
  await prisma.yearGroup.deleteMany();

  console.log('Seeding periods...');
  const periods = await prisma.period.createMany({ data: periodSeed });
  console.log(`Created ${periods.count} periods.`);
  const createdPeriods = await prisma.period.findMany({ orderBy: { id: 'asc' } });

  console.log('Seeding subjects...');
  const subjects = await Promise.all(
    subjectsSeed.map((name, index) =>
      prisma.subject.create({
        data: {
          name,
          description: `${name} for ${SCHOOL_NAME} mock data set ${index + 1}.`,
        },
      }),
    ),
  );

  console.log('Seeding year groups...');
  const yearGroups = await Promise.all(
    yearGroupSpecs.map((group) =>
      prisma.yearGroup.create({
        data: {
          ...group,
        },
      }),
    ),
  );

  const yearGroupSubjectMap = new Map<number, number[]>();
  yearGroupSubjectMap.set(yearGroups[0].id, [subjects[0].id, subjects[1].id, subjects[2].id, subjects[4].id]);
  yearGroupSubjectMap.set(yearGroups[1].id, [subjects[0].id, subjects[1].id, subjects[2].id, subjects[3].id, subjects[4].id]);
  yearGroupSubjectMap.set(yearGroups[2].id, [subjects[0].id, subjects[1].id, subjects[2].id, subjects[3].id, subjects[5].id]);
  yearGroupSubjectMap.set(yearGroups[3].id, [subjects[0].id, subjects[1].id, subjects[2].id, subjects[4].id, subjects[6].id]);
  yearGroupSubjectMap.set(yearGroups[4].id, [subjects[0].id, subjects[1].id, subjects[2].id, subjects[4].id, subjects[7].id]);

  for (const group of yearGroups) {
    const subjectIds = yearGroupSubjectMap.get(group.id) ?? [];
    await prisma.yearGroup.update({
      where: { id: group.id },
      data: {
        subjects: {
          connect: subjectIds.map((id) => ({ id })),
        },
      },
    });
  }

  console.log('Seeding fees...');
  const fees = [];
  for (const group of yearGroups) {
    const amount = 1200 + group.id * 125;
    fees.push(
      await prisma.fee.create({
        data: {
          amount,
          title: `${group.name} Term Fee`,
          description: `Core academic fee for ${group.name}.`,
          yearGroupId: group.id,
        },
      }),
    );
    fees.push(
      await prisma.fee.create({
        data: {
          amount: 250 + group.id * 20,
          title: `${group.name} Activity Levy`,
          description: `Activities, clubs, and exam support for ${group.name}.`,
          yearGroupId: group.id,
        },
      }),
    );
  }

  console.log('Seeding admin...');
  await prisma.user.create({
    data: {
      email: `admin@${EMAIL_DOMAIN}`,
      password,
      name: 'System Admin',
      initials: 'SA',
      role: Role.ADMIN,
      gender: Gender.Other,
      status: 'Active',
    },
  });

  console.log('Seeding teachers...');
  const teachers = [];
  for (let index = 0; index < 50; index += 1) {
    const gender = index % 2 === 0 ? Gender.Male : Gender.Female;
    const firstName = pick(teacherFirstNames, index);
    const lastName = pick(lastNames, Math.floor(index / teacherFirstNames.length));
    const subject = subjects[index % subjects.length];
    const connectedYearGroups = [
      yearGroups[index % yearGroups.length],
      yearGroups[(index + 1) % yearGroups.length],
    ];

    const teacher = await prisma.user.create({
      data: {
        email: `teacher.${String(index + 1).padStart(3, '0')}@${EMAIL_DOMAIN}`,
        password,
        name: `${gender === Gender.Male ? 'Mr.' : 'Ms.'} ${firstName} ${lastName}`,
        initials: initials(`${firstName} ${lastName}`),
        role: Role.TEACHER,
        gender,
        specialization: subject.name,
        status: 'Active',
        taughtYearGroups: {
          connect: connectedYearGroups.map((group) => ({ id: group.id })),
        },
      },
      include: {
        taughtYearGroups: true,
      },
    });

    teachers.push(teacher);
  }

  console.log('Seeding students...');
  const students = [];
  for (let index = 0; index < 100; index += 1) {
    const gender = index % 3 === 0 ? Gender.Female : index % 3 === 1 ? Gender.Male : Gender.Other;
    const firstName = pick(studentFirstNames, index);
    const lastName = pick(lastNames, Math.floor(index / studentFirstNames.length));
    const yearGroup = yearGroups[index % yearGroups.length];

    const student = await prisma.user.create({
      data: {
        email: `student.${String(index + 1).padStart(3, '0')}@${EMAIL_DOMAIN}`,
        password,
        name: `${firstName} ${lastName}`,
        initials: initials(`${firstName} ${lastName}`),
        role: Role.STUDENT,
        gender,
        enrolledYearGroupId: yearGroup.id,
        status: 'Active',
      },
    });

    students.push(student);
  }

  console.log('Seeding timetable...');
  const timetableRows = [];
  const days: DayOfWeek[] = [
    DayOfWeek.Monday,
    DayOfWeek.Tuesday,
    DayOfWeek.Wednesday,
    DayOfWeek.Thursday,
    DayOfWeek.Friday,
  ];

  for (const group of yearGroups) {
    const groupSubjectIds = yearGroupSubjectMap.get(group.id) ?? [];
    const groupTeachers = teachers.filter((teacher) =>
      teacher.taughtYearGroups.some((entry) => entry.id === group.id),
    );

    for (const day of days) {
      for (const period of createdPeriods) {
        if (period.isBreak) continue;

        const subjectId = groupSubjectIds[(group.id + period.id + day.length) % groupSubjectIds.length];
        const subject = subjects.find((item) => item.id === subjectId)!;
        const subjectTeachers = teachers.filter((teacher) => teacher.specialization === subject.name);
        const fallbackTeachers = groupTeachers.length ? groupTeachers : teachers;
        const teacher =
          subjectTeachers[(group.id + period.id + day.length) % subjectTeachers.length] ??
          fallbackTeachers[(group.id + period.id) % fallbackTeachers.length];

        timetableRows.push({
          day,
          yearGroupId: group.id,
          periodId: period.id,
          subjectId,
          teacherId: teacher?.id ?? null,
        });
      }
    }
  }

  await prisma.timetable.createMany({ data: timetableRows });

  console.log('Seeding fee payments...');
  const feePaymentRows = [];
  for (const student of students) {
    const studentYearGroup = yearGroups.find((group) => group.id === student.enrolledYearGroupId);
    if (!studentYearGroup) continue;

    const groupFees = fees.filter((fee) => fee.yearGroupId === studentYearGroup.id);
    for (const fee of groupFees) {
      const paymentMode = rng();
      const amountPaid =
        paymentMode < 0.15
          ? 0
          : paymentMode < 0.45
            ? Math.round(fee.amount * (0.35 + rng() * 0.35))
            : fee.amount;

      feePaymentRows.push({
        feeId: fee.id,
        studentId: student.id,
        amountPaid,
        amountInWords: amountInWords(amountPaid),
        isFullyPaid: amountPaid >= fee.amount,
        paidAt: amountPaid > 0 ? new Date() : null,
      });
    }
  }

  await createManyInChunks(feePaymentRows, (data) => prisma.feePayment.createMany({ data }));

  console.log('Seeding grades...');
  const gradeRows = [];
  for (const student of students) {
    const studentYearGroup = yearGroups.find((group) => group.id === student.enrolledYearGroupId);
    if (!studentYearGroup) continue;

    const groupSubjects = yearGroupSubjectMap.get(studentYearGroup.id) ?? [];
    const selectedSubjects = groupSubjects.slice(0, 4);

    for (const subjectId of selectedSubjects) {
      const subject = subjects.find((item) => item.id === subjectId)!;
      const subjectTeachers = teachers.filter((teacher) => teacher.specialization === subject.name);
      const score = Math.round(48 + rng() * 52);
      const teacher = subjectTeachers[(student.id + subjectId) % subjectTeachers.length] ?? teachers[0];

      gradeRows.push({
        score,
        grade: gradeFromScore(score),
        studentId: student.id,
        subjectId,
        teacherId: teacher.id,
        assignmentAvg: Math.round((score * 0.9 + rng() * 8) * 10) / 10,
        midterm: Math.round((score * 0.95 + rng() * 6) * 10) / 10,
        projectFinal: Math.round((score * 1.02 + rng() * 5) * 10) / 10,
        test: rng() > 0.5,
        test2: rng() > 0.5,
        date: new Date(),
      });
    }
  }

  await createManyInChunks(gradeRows, (data) => prisma.grade.createMany({ data }));

  console.log('Seeding attendance...');
  const schoolDays = getSchoolDays(30, rng);
  const attendanceRows = [];

  for (const date of schoolDays) {
    for (const student of students) {
      const roll = rng();
      const status =
        roll < 0.82
          ? AttendanceStatus.P
          : roll < 0.9
            ? AttendanceStatus.T
            : roll < 0.98
              ? AttendanceStatus.A
              : AttendanceStatus.H;

      attendanceRows.push({
        studentId: student.id,
        date,
        status,
      });
    }
  }

  await createManyInChunks(attendanceRows, (data) => prisma.attendance.createMany({ data }));

  console.log('Seeding announcements...');
  await prisma.announcement.createMany({
    data: [
      {
        title: 'Welcome Back Assembly',
        content:
          'All students and teachers should report to the main hall on Monday for the opening assembly.',
        priority: Priority.Important,
        authorId: teachers[0].id,
        targetType: TargetType.ALL,
      },
      {
        title: 'Attendance Review',
        content:
          'Class teachers should review attendance records and contact families for repeated absences.',
        priority: Priority.Normal,
        authorId: teachers[1].id,
        targetType: TargetType.TEACHERS_ONLY,
      },
      {
        title: 'Year 1 Parent Meeting',
        content: 'Parents and guardians for Year 1 students are invited to the meeting on Friday.',
        priority: Priority.Urgent,
        authorId: teachers[2].id,
        targetType: TargetType.YEAR_GROUP,
        targetYearGroupId: yearGroups[0].id,
      },
    ],
  });

  console.log('Seed complete.');
  console.log(`Created 1 admin, ${teachers.length} teachers, and ${students.length} students.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
