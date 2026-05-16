import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

// Create database connection
const db = new sqlite3.Database('./admissions.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database.');
});

// Promisify database methods
const dbGet = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbRun = (sql: string, params: any[] = []): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve();
    });
  });
};

// Initialize database tables
async function initDatabase() {
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
}

async function createAdminUser() {
  try {
    // Initialize database tables first
    await initDatabase();

    // Check if admin user already exists
    const existingAdmin = await dbGet('SELECT * FROM users WHERE username = ?', ['admin']);

    if (existingAdmin) {
      console.log('Admin user already exists!');
      return;
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync('admin123', 10);

    // Create admin user
    await dbRun(
      'INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)',
      ['1', 'admin', hashedPassword, 'admin']
    );

    console.log('✅ Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    db.close();
  }
}

createAdminUser();