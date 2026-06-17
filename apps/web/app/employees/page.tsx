"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createEmployeeSchema, updateEmployeeSchema } from "@mini-timesheets/shared";
import type { Employee } from "@mini-timesheets/shared";
import { api } from "@/lib/api";

export default function EmployeesPage() {
  const qc = useQueryClient();
  const [showInactive, setShowInactive] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState("");

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees", showInactive],
    queryFn: () => api.employees.list(showInactive),
  });

  const createMutation = useMutation({
    mutationFn: api.employees.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["employees"] }); setAdding(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof api.employees.update>[1] }) =>
      api.employees.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["employees"] }); setEditing(null); },
  });

  const deactivateMutation = useMutation({
    mutationFn: api.employees.deactivate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });

  const reactivateMutation = useMutation({
    mutationFn: api.employees.reactivate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const fd = new FormData(e.currentTarget);
    const raw = {
      firstName: fd.get("firstName") as string,
      lastName: fd.get("lastName") as string,
      hourlyRate: Number(fd.get("hourlyRate")),
    };

    if (editing) {
      const parsed = updateEmployeeSchema.safeParse(raw);
      if (!parsed.success) { setFormError(parsed.error.issues[0].message); return; }
      updateMutation.mutate({ id: editing.id, data: parsed.data });
    } else {
      const parsed = createEmployeeSchema.safeParse(raw);
      if (!parsed.success) { setFormError(parsed.error.issues[0].message); return; }
      createMutation.mutate(parsed.data);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Employees</h1>
        <button
          onClick={() => { setAdding(true); setEditing(null); setFormError(""); }}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          + Add employee
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-600 mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={showInactive}
          onChange={(e) => setShowInactive(e.target.checked)}
          className="rounded"
        />
        Show inactive
      </label>

      {(adding || editing) && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-lg p-4 mb-6 space-y-3"
        >
          <h2 className="font-medium text-sm">{editing ? "Edit employee" : "New employee"}</h2>
          {formError && <p className="text-red-500 text-sm">{formError}</p>}
          <div className="grid grid-cols-3 gap-3">
            <input
              name="firstName"
              defaultValue={editing?.firstName}
              placeholder="First name"
              required
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <input
              name="lastName"
              defaultValue={editing?.lastName}
              placeholder="Last name"
              required
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <input
              name="hourlyRate"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={editing?.hourlyRate}
              placeholder="Hourly rate ($)"
              required
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => { setAdding(false); setEditing(null); setFormError(""); }}
              className="border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        {isLoading && (
          <p className="p-4 text-sm text-gray-500">Loading...</p>
        )}
        {!isLoading && employees.length === 0 && (
          <p className="p-4 text-sm text-gray-500">No employees found.</p>
        )}
        {employees.map((emp) => (
          <div key={emp.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <span className="font-medium text-sm">
                {emp.firstName} {emp.lastName}
              </span>
              <span className="ml-3 text-sm text-gray-500">
                ${emp.hourlyRate.toFixed(2)}/h
              </span>
              <span
                className={`ml-3 text-xs px-2 py-0.5 rounded-full ${
                  emp.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {emp.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setEditing(emp); setAdding(false); setFormError(""); }}
                className="text-xs border border-gray-300 px-3 py-1 rounded hover:bg-gray-50"
              >
                Edit
              </button>
              {emp.status === "active" ? (
                <button
                  onClick={() => deactivateMutation.mutate(emp.id)}
                  className="text-xs border border-red-200 text-red-600 px-3 py-1 rounded hover:bg-red-50"
                >
                  Deactivate
                </button>
              ) : (
                <button
                  onClick={() => reactivateMutation.mutate(emp.id)}
                  className="text-xs border border-green-200 text-green-700 px-3 py-1 rounded hover:bg-green-50"
                >
                  Reactivate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
