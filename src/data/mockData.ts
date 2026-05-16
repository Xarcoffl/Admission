export type Student = {
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
};

export type Department = {
  id: string;
  departmentName: string;
  totalSeats: number;
  filledSeats: number;
  hodName: string;
};

export const initialDepartments: Department[] = [];

export const initialStudents: Student[] = [];
