import sqlite3 from 'sqlite3';

// Create database connection
const db = new sqlite3.Database('./admissions.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Promisify database methods for async/await
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

const dbAll = (sql: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Initialize database tables
export const initDatabase = async () => {
  try {
    // Create students table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        applicationId TEXT UNIQUE,
        studentName TEXT NOT NULL,
        gender TEXT CHECK(gender IN ('Male', 'Female', 'Other')),
        dob TEXT,
        mobile TEXT,
        email TEXT,
        district TEXT,
        schoolName TEXT,
        boardType TEXT CHECK(boardType IN ('State Board', 'CBSE', 'ICSE', 'Other')),
        community TEXT CHECK(community IN ('General', 'OBC', 'SC', 'ST', 'EWS')),
        cutoffMark REAL,
        departmentId TEXT,
        admissionStatus TEXT CHECK(admissionStatus IN ('Applied', 'Under Review', 'Selected', 'Rejected', 'Waitlisted')),
        applicationDate TEXT,
        quota TEXT CHECK(quota IN ('Management Quota', 'Counselling Quota')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (departmentId) REFERENCES departments(id)
      )
    `);

    // Create departments table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY,
        departmentName TEXT NOT NULL UNIQUE,
        totalSeats INTEGER NOT NULL,
        filledSeats INTEGER DEFAULT 0,
        hodName TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'officer', 'faculty')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables initialized successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Database operations
export const dbOperations = {
  // Students
  getAllStudents: () => dbAll('SELECT * FROM students ORDER BY created_at DESC'),
  getStudentById: (id: string) => dbGet('SELECT * FROM students WHERE id = ?', [id]),
  createStudent: async (student: any) => {
    await dbRun(
      `INSERT INTO students (id, applicationId, studentName, gender, dob, mobile, email, district, schoolName, boardType, community, cutoffMark, departmentId, admissionStatus, applicationDate, quota)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student.id, student.applicationId, student.studentName, student.gender, student.dob, student.mobile, student.email, student.district, student.schoolName, student.boardType, student.community, student.cutoffMark, student.departmentId, student.admissionStatus, student.applicationDate, student.quota]
    );
    // Return the created student row
    return await dbGet('SELECT * FROM students WHERE id = ?', [student.id]);
  },
  updateStudent: async (id: string, student: any) => {
    try {
      await dbRun(
        `UPDATE students SET studentName = ?, gender = ?, dob = ?, mobile = ?, email = ?, district = ?, schoolName = ?, boardType = ?, community = ?, cutoffMark = ?, departmentId = ?, admissionStatus = ?, applicationDate = ?, quota = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [student.studentName, student.gender, student.dob, student.mobile, student.email, student.district, student.schoolName, student.boardType, student.community, student.cutoffMark, student.departmentId, student.admissionStatus, student.applicationDate, student.quota, id]
      );
      // Return the updated student
      return await dbGet('SELECT * FROM students WHERE id = ?', [id]);
    } catch (error) {
      return null;
    }
  },
  deleteStudent: async (id: string): Promise<boolean> => {
    try {
      await dbRun('DELETE FROM students WHERE id = ?', [id]);
      return true; // Assume success if no error
    } catch (error) {
      return false;
    }
  },

  // Departments
  getAllDepartments: () => dbAll('SELECT * FROM departments ORDER BY created_at DESC'),
  getDepartmentById: (id: string) => dbGet('SELECT * FROM departments WHERE id = ?', [id]),
  createDepartment: (department: any) => dbRun(
    'INSERT INTO departments (id, departmentName, totalSeats, filledSeats, hodName) VALUES (?, ?, ?, ?, ?)',
    [department.id, department.departmentName, department.totalSeats, department.filledSeats, department.hodName]
  ),
  updateDepartment: async (id: string, department: any) => {
    try {
      await dbRun(
        'UPDATE departments SET departmentName = ?, totalSeats = ?, filledSeats = ?, hodName = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [department.departmentName, department.totalSeats, department.filledSeats, department.hodName, id]
      );
      // Return the updated department
      return await dbGet('SELECT * FROM departments WHERE id = ?', [id]);
    } catch (error) {
      return null;
    }
  },
  deleteDepartment: async (id: string): Promise<boolean> => {
    try {
      await dbRun('DELETE FROM departments WHERE id = ?', [id]);
      return true; // Assume success if no error
    } catch (error) {
      return false;
    }
  },

  // Users
  getUserByUsername: (username: string) => dbGet('SELECT * FROM users WHERE username = ?', [username]),
  createUser: (user: any) => dbRun(
    'INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)',
    [user.id, user.username, user.password, user.role]
  )
};

export default db;
