export type EmployeeStatus = "active" | "inactive";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  hourlyRate: number;
  status: EmployeeStatus;
  deactivatedAt: string | null;
  createdAt: string;
}

export interface TimeEntry {
  id: number;
  employeeId: number;
  date: string; // ISO date: YYYY-MM-DD
  hours: number;
  createdAt: string;
}

export interface WeeklyApproval {
  id: number;
  employeeId: number;
  weekStart: string; // ISO date: YYYY-MM-DD (Monday)
  status: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklySummary {
  employee: Employee;
  weekStart: string;
  regularHours: number;
  overtimeHours: number;
  regularPay: number;
  overtimePay: number;
  totalPay: number;
  totalHours: number;
  approval: WeeklyApproval | null;
  entries: TimeEntry[];
}
