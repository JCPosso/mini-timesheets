"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createEmployeeSchema, updateEmployeeSchema } from "@mini-timesheets/shared";
import type { Employee } from "@mini-timesheets/shared";
import { api } from "@/lib/api";

const inputCls =
  "border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors w-full";

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
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Employees</h1>
        <button
          onClick={() => { setAdding(true); setEditing(null); setFormError(""); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Add employee
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-5 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={showInactive}
          onChange={(e) => setShowInactive(e.target.checked)}
          className="rounded accent-indigo-600"
        />
        Show inactive
      </label>

      {(adding || editing) && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-6 space-y-4 shadow-sm"
        >
          <h2 className="font-medium text-sm text-gray-700 dark:text-gray-300">
            {editing ? "Edit employee" : "New employee"}
          </h2>
          {formError && (
            <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              {formError}
            </p>
          )}
          <div className="grid grid-cols-3 gap-3">
            <input name="firstName" defaultValue={editing?.firstName} placeholder="First name" required className={inputCls} />
            <input name="lastName" defaultValue={editing?.lastName} placeholder="Last name" required className={inputCls} />
            <input
              name="hourlyRate"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={editing?.hourlyRate}
              placeholder="Hourly rate ($)"
              required
              className={inputCls}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => { setAdding(false); setEditing(null); setFormError(""); }}
              className="border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
        {isLoading && (
          <p className="p-5 text-sm text-gray-400 dark:text-gray-500">Loading...</p>
        )}
        {!isLoading && employees.length === 0 && (
          <p className="p-8 text-sm text-gray-400 dark:text-gray-500 text-center">No employees found.</p>
        )}
        {employees.map((emp) => (
          <div key={emp.id} className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                {emp.firstName} {emp.lastName}
              </span>
              <span className="text-sm text-gray-400 dark:text-gray-500">
                ${emp.hourlyRate.toFixed(2)}/h
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  emp.status === "active"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                }`}
              >
                {emp.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setEditing(emp); setAdding(false); setFormError(""); }}
                className="text-xs border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Edit
              </button>
              {emp.status === "active" ? (
                <button
                  onClick={() => deactivateMutation.mutate(emp.id)}
                  className="text-xs border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Deactivate
                </button>
              ) : (
                <button
                  onClick={() => reactivateMutation.mutate(emp.id)}
                  className="text-xs border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
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
