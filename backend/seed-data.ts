import sqlite3 from 'sqlite3';

// Create database connection
const db = new sqlite3.Database('./admissions.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database.');
});

// Promisify database methods
const dbRun = (sql: string, params: any[] = []): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve();
    });
  });
};

const dbGet = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

async function seedData() {
  try {
    // Create departments with short codes
    const departments = [
      { id: 'dept-001', departmentName: 'Computer Science (CS)', totalSeats: 120, filledSeats: 95, hodName: 'Dr. Meera Sharma' },
      { id: 'dept-002', departmentName: 'Electronics Engineering (ECE)', totalSeats: 80, filledSeats: 68, hodName: 'Prof. Rohan Kumar' },
      { id: 'dept-003', departmentName: 'Mechanical Engineering (ME)', totalSeats: 100, filledSeats: 82, hodName: 'Dr. Pooja Singh' },
      { id: 'dept-004', departmentName: 'Civil Engineering (CE)', totalSeats: 90, filledSeats: 71, hodName: 'Prof. Arjun Verma' },
      { id: 'dept-005', departmentName: 'Business Administration (BA)', totalSeats: 70, filledSeats: 55, hodName: 'Dr. Anjali Rao' }
    ];

    // Create students with various statuses
    const students = [
      // Computer Science - Selected
      { id: 'stu-001', applicationId: 'APP-2026-001', studentName: 'Aarav Patel', gender: 'Male', dob: '2005-05-12', mobile: '9876543210', email: 'aarav.patel@example.com', district: 'Pune', schoolName: 'Green Valley High School', boardType: 'CBSE', community: 'General', cutoffMark: 91.2, departmentId: 'dept-001', admissionStatus: 'Selected', applicationDate: '2026-03-01' },
      { id: 'stu-002', applicationId: 'APP-2026-002', studentName: 'Sneha Iyer', gender: 'Female', dob: '2004-11-10', mobile: '9034567890', email: 'sneha.iyer@example.com', district: 'Bengaluru', schoolName: 'National Academy', boardType: 'State Board', community: 'General', cutoffMark: 93.4, departmentId: 'dept-001', admissionStatus: 'Selected', applicationDate: '2026-03-05' },
      { id: 'stu-003', applicationId: 'APP-2026-003', studentName: 'Ravi Kumar', gender: 'Male', dob: '2005-02-14', mobile: '9988776655', email: 'ravi.kumar@example.com', district: 'Delhi', schoolName: 'Central Public School', boardType: 'CBSE', community: 'OBC', cutoffMark: 87.5, departmentId: 'dept-001', admissionStatus: 'Selected', applicationDate: '2026-03-08' },
      
      // Electronics - Selected and Under Review
      { id: 'stu-004', applicationId: 'APP-2026-004', studentName: 'Nisha Reddy', gender: 'Female', dob: '2005-08-24', mobile: '9123456780', email: 'nisha.reddy@example.com', district: 'Hyderabad', schoolName: 'St. Mary\'s School', boardType: 'ICSE', community: 'OBC', cutoffMark: 88.5, departmentId: 'dept-002', admissionStatus: 'Selected', applicationDate: '2026-03-03' },
      { id: 'stu-005', applicationId: 'APP-2026-005', studentName: 'Vikas Joshi', gender: 'Male', dob: '2005-09-02', mobile: '9012345678', email: 'vikas.joshi@example.com', district: 'Ahmedabad', schoolName: 'Riverdale School', boardType: 'CBSE', community: 'SC', cutoffMark: 76.8, departmentId: 'dept-002', admissionStatus: 'Under Review', applicationDate: '2026-03-12' },
      { id: 'stu-006', applicationId: 'APP-2026-006', studentName: 'Priya Sharma', gender: 'Female', dob: '2005-07-18', mobile: '9876543211', email: 'priya.sharma@example.com', district: 'Mumbai', schoolName: 'Wisdom Academy', boardType: 'CBSE', community: 'General', cutoffMark: 85.2, departmentId: 'dept-002', admissionStatus: 'Selected', applicationDate: '2026-03-07' },
      
      // Mechanical Engineering - Waitlisted and Selected
      { id: 'stu-007', applicationId: 'APP-2026-007', studentName: 'Amit Singh', gender: 'Male', dob: '2005-03-25', mobile: '9988776644', email: 'amit.singh@example.com', district: 'Jaipur', schoolName: 'Modern High School', boardType: 'CBSE', community: 'General', cutoffMark: 80.5, departmentId: 'dept-003', admissionStatus: 'Waitlisted', applicationDate: '2026-03-10' },
      { id: 'stu-008', applicationId: 'APP-2026-008', studentName: 'Deepika Misra', gender: 'Female', dob: '2005-01-08', mobile: '9876543222', email: 'deepika.misra@example.com', district: 'Lucknow', schoolName: 'Sunrise School', boardType: 'State Board', community: 'General', cutoffMark: 89.7, departmentId: 'dept-003', admissionStatus: 'Selected', applicationDate: '2026-03-02' },
      { id: 'stu-009', applicationId: 'APP-2026-009', studentName: 'Sanjay Yadav', gender: 'Male', dob: '2005-06-15', mobile: '9123456781', email: 'sanjay.yadav@example.com', district: 'Indore', schoolName: 'Excellence School', boardType: 'CBSE', community: 'ST', cutoffMark: 78.3, departmentId: 'dept-003', admissionStatus: 'Applied', applicationDate: '2026-03-14' },
      
      // Civil Engineering - Selected and Rejected
      { id: 'stu-010', applicationId: 'APP-2026-010', studentName: 'Kavya Reddy', gender: 'Female', dob: '2005-04-20', mobile: '9876543233', email: 'kavya.reddy@example.com', district: 'Coimbatore', schoolName: 'Scholars Academy', boardType: 'ICSE', community: 'General', cutoffMark: 92.1, departmentId: 'dept-004', admissionStatus: 'Selected', applicationDate: '2026-03-04' },
      { id: 'stu-011', applicationId: 'APP-2026-011', studentName: 'Arjun Gupta', gender: 'Male', dob: '2005-09-10', mobile: '9012345677', email: 'arjun.gupta@example.com', district: 'Chandigarh', schoolName: 'Cambridge School', boardType: 'CBSE', community: 'EWS', cutoffMark: 72.5, departmentId: 'dept-004', admissionStatus: 'Rejected', applicationDate: '2026-03-09' },
      { id: 'stu-012', applicationId: 'APP-2026-012', studentName: 'Manavi Patel', gender: 'Female', dob: '2005-12-05', mobile: '9876543244', email: 'manavi.patel@example.com', district: 'Vadodara', schoolName: 'Bright Future School', boardType: 'State Board', community: 'OBC', cutoffMark: 84.9, departmentId: 'dept-004', admissionStatus: 'Selected', applicationDate: '2026-03-06' },
      
      // Business Administration - Applied and Under Review
      { id: 'stu-013', applicationId: 'APP-2026-013', studentName: 'Neha Kapoor', gender: 'Female', dob: '2005-11-22', mobile: '9123456782', email: 'neha.kapoor@example.com', district: 'Bangalore', schoolName: 'Global School', boardType: 'ICSE', community: 'General', cutoffMark: 86.3, departmentId: 'dept-005', admissionStatus: 'Under Review', applicationDate: '2026-03-11' },
      { id: 'stu-014', applicationId: 'APP-2026-014', studentName: 'Harsh Verma', gender: 'Male', dob: '2005-08-30', mobile: '9876543255', email: 'harsh.verma@example.com', district: 'Nashik', schoolName: 'Pioneer Academy', boardType: 'CBSE', community: 'General', cutoffMark: 81.6, departmentId: 'dept-005', admissionStatus: 'Applied', applicationDate: '2026-03-13' },
      { id: 'stu-015', applicationId: 'APP-2026-015', studentName: 'Shreya Das', gender: 'Female', dob: '2005-10-17', mobile: '9012345688', email: 'shreya.das@example.com', district: 'Kolkata', schoolName: 'Heritage School', boardType: 'State Board', community: 'SC', cutoffMark: 79.2, departmentId: 'dept-005', admissionStatus: 'Applied', applicationDate: '2026-03-15' }
    ];

    // Insert departments
    for (const dept of departments) {
      const existing = await dbGet('SELECT * FROM departments WHERE id = ?', [dept.id]);
      if (!existing) {
        await dbRun(
          'INSERT INTO departments (id, departmentName, totalSeats, filledSeats, hodName) VALUES (?, ?, ?, ?, ?)',
          [dept.id, dept.departmentName, dept.totalSeats, dept.filledSeats, dept.hodName]
        );
        console.log(`✅ Department created: ${dept.departmentName}`);
      }
    }

    // Insert students
    for (const student of students) {
      const existing = await dbGet('SELECT * FROM students WHERE id = ?', [student.id]);
      if (!existing) {
        await dbRun(
          `INSERT INTO students (id, applicationId, studentName, gender, dob, mobile, email, district, schoolName, boardType, community, cutoffMark, departmentId, admissionStatus, applicationDate)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [student.id, student.applicationId, student.studentName, student.gender, student.dob, student.mobile, student.email, student.district, student.schoolName, student.boardType, student.community, student.cutoffMark, student.departmentId, student.admissionStatus, student.applicationDate]
        );
        console.log(`✅ Student created: ${student.studentName}`);
      }
    }

    console.log('\n✨ Mock data seeded successfully!');
    console.log(`📊 Total Departments: ${departments.length}`);
    console.log(`📚 Total Students: ${students.length}`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    db.close();
  }
}

seedData();
