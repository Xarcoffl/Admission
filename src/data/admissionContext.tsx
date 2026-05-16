import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { Department, Student, initialDepartments, initialStudents } from './mockData';

const API_BASE = 'http://localhost:3001/api';

type AdmissionContextValue = {
  students: Student[];
  departments: Department[];
  user: { id: string; username: string; role: string } | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateStudent: (student: Student) => Promise<void>;
  addStudent: (student: Student) => Promise<void>;
  removeStudent: (studentId: string) => Promise<void>;
  updateDepartment: (department: Department) => Promise<void>;
  addDepartment: (department: Department) => Promise<void>;
  removeDepartment: (departmentId: string) => Promise<void>;
  lastRefreshed: string;
};

const AdmissionContext = createContext<AdmissionContextValue | undefined>(undefined);

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export function AdmissionProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [user, setUser] = useState<{ id: string; username: string; role: string } | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState(() => new Date().toLocaleString());
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Initialize Socket.io connection when user logs in
  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:3001', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      newSocket.on('studentCreated', (newStudent: Student) => {
        setStudents(prev => [...prev, newStudent]);
        setLastRefreshed(new Date().toLocaleString());
      });

      newSocket.on('studentUpdated', (updatedStudent: Student) => {
        setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
        setLastRefreshed(new Date().toLocaleString());
      });

      newSocket.on('studentDeleted', (studentId: string) => {
        setStudents(prev => prev.filter(s => s.id !== studentId));
        setLastRefreshed(new Date().toLocaleString());
      });

      newSocket.on('departmentCreated', (newDepartment: Department) => {
        setDepartments(prev => [...prev, newDepartment]);
        setLastRefreshed(new Date().toLocaleString());
      });

      newSocket.on('departmentUpdated', (updatedDepartment: Department) => {
        setDepartments(prev => prev.map(d => d.id === updatedDepartment.id ? updatedDepartment : d));
        setLastRefreshed(new Date().toLocaleString());
      });

      newSocket.on('departmentDeleted', (departmentId: string) => {
        setDepartments(prev => prev.filter(d => d.id !== departmentId));
        setLastRefreshed(new Date().toLocaleString());
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user]);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_BASE}/students`, { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_BASE}/departments`, { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStudents();
      fetchDepartments();
    }
  }, [user]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return true;
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setStudents([]);
    setDepartments([]);
  };

  const value = useMemo(
    () => ({
      students,
      departments,
      user,
      login,
      logout,
      addStudent: async (student: Student) => {
        const response = await fetch(`${API_BASE}/students`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify(student)
        });
        if (response.ok) {
          // Real-time update will be handled by Socket.io
          setLastRefreshed(new Date().toLocaleString());
        }
      },
      updateStudent: async (student: Student) => {
        const response = await fetch(`${API_BASE}/students/${student.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify(student)
        });
        if (response.ok) {
          // Real-time update will be handled by Socket.io
          setLastRefreshed(new Date().toLocaleString());
        }
      },
      removeStudent: async (studentId: string) => {
        const response = await fetch(`${API_BASE}/students/${studentId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        if (response.ok) {
          // Real-time update will be handled by Socket.io
          setLastRefreshed(new Date().toLocaleString());
        }
      },
      addDepartment: async (department: Department) => {
        const response = await fetch(`${API_BASE}/departments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify(department)
        });
        if (response.ok) {
          // Real-time update will be handled by Socket.io
          setLastRefreshed(new Date().toLocaleString());
        }
      },
      updateDepartment: async (department: Department) => {
        const response = await fetch(`${API_BASE}/departments/${department.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify(department)
        });
        if (response.ok) {
          // Real-time update will be handled by Socket.io
          setLastRefreshed(new Date().toLocaleString());
        }
      },
      removeDepartment: async (departmentId: string) => {
        const response = await fetch(`${API_BASE}/departments/${departmentId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        if (response.ok) {
          // Real-time update will be handled by Socket.io
          setLastRefreshed(new Date().toLocaleString());
        }
      },
      lastRefreshed
    }),
    [students, departments, user, lastRefreshed]
  );

  return <AdmissionContext.Provider value={value}>{children}</AdmissionContext.Provider>;
}

export function useAdmission() {
  const context = useContext(AdmissionContext);
  if (!context) {
    throw new Error('useAdmission must be used within AdmissionProvider');
  }
  return context;
}

