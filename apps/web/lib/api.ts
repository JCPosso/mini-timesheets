import type {
  Employee,
  TimeEntry,
  WeeklyApproval,
  WeeklySummary,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  CreateTimeEntryInput,
  UpdateTimeEntryInput,
  ApprovalActionInput,
} from "@mini-timesheets/shared";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.message ?? "API error");
  return json.data as T;
}

// Employees
export const api = {
  employees: {
    list: (showInactive = false) =>
      request<Employee[]>(`/employees?showInactive=${showInactive}`),
    get: (id: number) => request<Employee>(`/employees/${id}`),
    create: (data: CreateEmployeeInput) =>
      request<Employee>("/employees", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: UpdateEmployeeInput) =>
      request<Employee>(`/employees/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    deactivate: (id: number) =>
      request<Employee>(`/employees/${id}/deactivate`, { method: "POST" }),
    reactivate: (id: number) =>
      request<Employee>(`/employees/${id}/reactivate`, { method: "POST" }),
  },

  timeEntries: {
    list: (employeeId?: number) =>
      request<TimeEntry[]>(
        `/time-entries${employeeId ? `?employeeId=${employeeId}` : ""}`
      ),
    create: (data: CreateTimeEntryInput) =>
      request<TimeEntry>("/time-entries", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: UpdateTimeEntryInput) =>
      request<TimeEntry>(`/time-entries/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) =>
      request<{ id: number }>(`/time-entries/${id}`, { method: "DELETE" }),
  },

  weekly: {
    summary: (weekStart: string) =>
      request<WeeklySummary[]>(`/weekly?weekStart=${weekStart}`),
    approve: (employeeId: number, weekStart: string, data: ApprovalActionInput) =>
      request<WeeklyApproval>(
        `/weekly/${employeeId}/approve?weekStart=${weekStart}`,
        { method: "POST", body: JSON.stringify(data) }
      ),
  },
};
