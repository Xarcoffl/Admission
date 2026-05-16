export interface Student {
  id: string;
  applicationId: string;
  studentName: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  mobile: string;
  email: string;
  district: string;
  schoolName: string;
  boardType: 'State Board' | 'CBSE' | 'ICSE' | 'Other';
  community: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';
  cutoffMark: number;
  departmentId: string;
  admissionStatus: 'Applied' | 'Under Review' | 'Selected' | 'Rejected' | 'Waitlisted';
  applicationDate: string;
  quota: 'Management Quota' | 'Counselling Quota';
}

export interface Department {
  id: string;
  departmentName: string;
  totalSeats: number;
  filledSeats: number;
  hodName: string;
}

export interface User {
  id: string;
  username: string;
  password: string; // hashed
  role: 'admin' | 'officer' | 'faculty';
}

import { dbOperations, initDatabase } from './database';

// Initialize database on module load
initDatabase().catch(console.error);

// Export database operations as the data store
export const dataStore = dbOperations;

