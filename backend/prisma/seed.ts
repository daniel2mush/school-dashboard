import { Gender } from '../generated/prisma/index.js';
import { prisma } from '../src/clients/prismaClient.js';
import bcrypt from 'bcrypt';

async function main() {
  console.log('Starting seed process...');

  // Reset data for a clean slate
  await prisma.announcement.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.fee.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.timetable.deleteMany();
  await prisma.period.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();
  await prisma.yearGroup.deleteMany();

  const getHashedPassword = async () => await bcrypt.hash('password123', 12);

  // 1. Create Periods
  console.log('Seeding Periods...');
  const periodDefaults = [
    { label: "Period 1", startTime: "7:30", endTime: "8:30" },
    { label: "Period 2", startTime: "8:30", endTime: "9:30" },
    { label: "Period 3", startTime: "9:30", endTime: "10:30" },
    { label: "Break", startTime: "10:30", endTime: "11:00", isBreak: true },
    { label: "Period 4", startTime: "11:00", endTime: "12:00" },
    { label: "Period 5", startTime: "12:00", endTime: "13:00" },
  ];
  
  const periods = await Promise.all(
    periodDefaults.map(p => prisma.period.create({ data: p }))
  );

  // 2. Create Subjects
  console.log('Seeding Subjects...');
  const subjectNames = ["English", "Mathematics", "Science", "Social Studies", "ICT", "French", "Physics"];
  const subjects = await Promise.all(
    subjectNames.map(name => prisma.subject.create({ data: { name } }))
  );

  // 3. Create Year Groups
  console.log('Seeding Year Groups...');
  const yearGroup1 = await prisma.yearGroup.create({
    data: { name: 'Year 1', level: 'Primary' }
  });
  const yearGroup2 = await prisma.yearGroup.create({
    data: { name: 'Year 2', level: 'Primary' }
  });

  // Assign subjects to Year Groups
  await prisma.yearGroup.update({
    where: { id: yearGroup1.id },
    data: { subjects: { connect: subjects.slice(0, 5).map(s => ({ id: s.id })) } }
  });
  await prisma.yearGroup.update({
    where: { id: yearGroup2.id },
    data: { subjects: { connect: subjects.map(s => ({ id: s.id })) } }
  });

  // 4. Create Fees
  console.log('Seeding Fees...');
  await prisma.fee.create({ data: { amount: 2500, paid: 2500, yearGroupId: yearGroup1.id }});
  await prisma.fee.create({ data: { amount: 2800, paid: 1800, yearGroupId: yearGroup2.id }});

  // 5. Create Users (Admin, Teachers, Students)
  console.log('Seeding Users...');
  const password = await getHashedPassword();

  // Admin
  await prisma.user.create({
    data: {
      email: 'admin@sunridge.edu',
      password,
      name: 'System Admin',
      initials: 'AD',
      role: 'ADMIN',
      gender: Gender.Other
    }
  });

  // Teachers
  const teacher1 = await prisma.user.create({
    data: {
      email: 'teacher1@sunridge.edu',
      password,
      name: 'Mr. Kofi Mensah',
      initials: 'KM',
      role: 'TEACHER',
      gender: Gender.Male,
      specialization: 'Mathematics',
      taughtYearGroups: { connect: [{ id: yearGroup1.id }, { id: yearGroup2.id }] }
    }
  });

  const teacher2 = await prisma.user.create({
    data: {
      email: 'teacher2@sunridge.edu',
      password,
      name: 'Mrs. Abena Asante',
      initials: 'AA',
      role: 'TEACHER',
      gender: Gender.Female,
      specialization: 'English',
      taughtYearGroups: { connect: [{ id: yearGroup1.id }, { id: yearGroup2.id }] }
    }
  });

  // Students
  const student1 = await prisma.user.create({
    data: {
      email: 'student1@sunridge.edu',
      password,
      name: 'Ama Owusu',
      initials: 'AO',
      role: 'STUDENT',
      gender: Gender.Female,
      enrolledYearGroupId: yearGroup1.id
    }
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'student2@sunridge.edu',
      password,
      name: 'Kwame Boateng',
      initials: 'KB',
      role: 'STUDENT',
      gender: Gender.Male,
      enrolledYearGroupId: yearGroup2.id
    }
  });

  // 6. Create Timetables
  console.log('Seeding Timetables...');
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
  
  for (const day of days) {
    for (const period of periods) {
      if (period.isBreak) continue;
      // Assign random subjects to periods
      const randomSubjectId = subjects[Math.floor(Math.random() * subjects.length)].id;
      
      await prisma.timetable.createMany({
        data: [
          { day, yearGroupId: yearGroup1.id, periodId: period.id, subjectId: randomSubjectId },
          { day, yearGroupId: yearGroup2.id, periodId: period.id, subjectId: randomSubjectId }
        ]
      });
    }
  }

  // 7. Create Grades
  console.log('Seeding Grades...');
  const student1Subjects = subjects.slice(0, 5);
  for (const subject of student1Subjects) {
     const score = Math.floor(Math.random() * 40) + 60; // 60-100
     const gradeLetter = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D';
     await prisma.grade.create({
       data: {
         score,
         grade: gradeLetter,
         studentId: student1.id,
         subjectId: subject.id,
         teacherId: teacher1.id
       }
     });
  }

  for (const subject of subjects) {
    const score = Math.floor(Math.random() * 40) + 60;
    const gradeLetter = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D';
    await prisma.grade.create({
      data: {
        score,
        grade: gradeLetter,
        studentId: student2.id,
        subjectId: subject.id,
        teacherId: teacher2.id
      }
    });
 }

  // 8. Create Attendance
  console.log('Seeding Attendance...');
  for (let i = 0; i < 20; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Mostly present, occasional absent/late
    const s1Status = Math.random() > 0.1 ? 'P' : 'A';
    const s2Status = Math.random() > 0.15 ? 'P' : 'T';

    await prisma.attendance.create({ data: { studentId: student1.id, date, status: s1Status }});
    await prisma.attendance.create({ data: { studentId: student2.id, date, status: s2Status }});
  }

  // 9. Create Announcements
  console.log('Seeding Announcements...');
  await prisma.announcement.create({
    data: {
      title: 'End of Term Examinations',
      content: 'Exams begin 14th July. Please review the timetable.',
      authorId: teacher1.id,
      priority: 'Urgent',
      targetType: 'ALL'
    }
  });

  await prisma.announcement.create({
    data: {
      title: 'Year 1 Science Fair',
      content: 'The Year 1 Science fair will be held next Friday.',
      authorId: teacher2.id,
      priority: 'Normal',
      targetType: 'YEAR_GROUP',
      targetYearGroupId: yearGroup1.id
    }
  });

  console.log('Seeding complete! ✨');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
