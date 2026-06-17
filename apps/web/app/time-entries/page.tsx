"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createTimeEntrySchema } from "@mini-timesheets/shared";
import type { TimeEntry } from "@mini-timesheets/shared";
import { api } from "@/lib/api";

const inputCls =
  "border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors w-full";

const selectCls =
  "border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors";

export default function TimeEntriesPage() {
  const qc = useQueryClient();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | "">("");
  const [editing, setEditing] = useState<TimeEntry | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");

  const { data: employees = [] } = useQuery({
    queryKey: ["employees", false],
    queryFn: () => api.employees.list(false),
  });

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["time-entries", selectedEmployeeId],
    queryFn: () =>
      api.timeEntries.list(selectedEmployeeId !== "" ? selectedEmployeeId : undefined),
  });

  const createMutation = useMutation({
    mutationFn: api.timeEntries.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["time-entries"] });
      qc.invalidateQueries({ queryKey: ["weekly"] });
      setShowForm(false);
      setFormError("");
    },
    onError: (e) => setFormError(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { date?: string; hours?: number } }) =>
      api.timeEntries.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["time-entries"] });
      qc.invalidateQueries({ queryKey: ["weekly"] });
      setEditing(null);
      setFormError("");
    },
    onError: (e) => setFormError(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.timeEntries.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["time-entries"] });
      qc.invalidateQueries({ queryKey: ["weekly"] });
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const fd = new FormData(e.currentTarget);

    if (editing) {
      updateMutation.mutate({
        id: editing.id,
        data: {
          date: fd.get("date") as string,
          hours: Number(fd.get("hours")),
        },
      });
    } else {
      const raw = {
        employeeId: Number(fd.get("employeeId")),
        date: fd.get("date") as string,
        hours: Number(fd.get("hours")),
      };
      const parsed = createTimeEntrySchema.safeParse(raw);
      if (!parsed.success) { setFormError(parsed.error.issues[0].message); return; }
      createMutation.mutate(parsed.data);
    }
  }

  const employeeMap = Object.fromEntries(
    employees.map((e) => [e.id, `${e.firstName} ${e.lastName}`])
  );

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Time Entries</h1>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setFormError(""); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Log time
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <label className="text-sm text-gray-500 dark:text-gray-400">Employee:</label>
        <select
          value={selectedEmployeeId}
          onChange={(e) => setSelectedEmployeeId(e.target.value === "" ? "" : Number(e.target.value))}
          className={selectCls}
        >
          <option value="">All</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.firstName} {emp.lastName}
            </option>
          ))}
        </select>
      </div>

      {(showForm || editing) && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-6 space-y-4 shadow-sm"
        >
          <h2 className="font-medium text-sm text-gray-700 dark:text-gray-300">
            {editing ? "Edit entry" : "Log time"}
          </h2>
          {formError && (
            <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              {formError}
            </p>
          )}
          <div className="grid grid-cols-3 gap-3">
            {!editing && (
              <select name="employeeId" defaultValue={selectedEmployeeId} required className={selectCls}>
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            )}
            <input
              name="date"
              type="date"
              max={today}
              defaultValue={editing?.date ?? today}
              required
              className={inputCls}
            />
            <input
              name="hours"
              type="number"
              step="0.25"
              min="0.25"
              max="24"
              defaultValue={editing?.hours}
              placeholder="Hours"
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
              onClick={() => { setShowForm(false); setEditing(null); setFormError(""); }}
              className="border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
        {isLoading && <p className="p-5 text-sm text-gray-400 dark:text-gray-500">Loading...</p>}
        {!isLoading && entries.length === 0 && (
          <p className="p-8 text-sm text-gray-400 dark:text-gray-500 text-center">No entries found.</p>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between px-4 py-3.5">
            <div className="text-sm flex items-center gap-3">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {new Date(`${entry.date}T00:00:00Z`).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  timeZone: "UTC",
                })}
              </span>
              <span className="text-gray-600 dark:text-gray-300 font-medium">{entry.hours}h</span>
              {employeeMap[entry.employeeId] && (
                <span className="text-gray-400 dark:text-gray-500">{employeeMap[entry.employeeId]}</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setEditing(entry); setShowForm(false); setFormError(""); }}
                className="text-xs border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => deleteMutation.mutate(entry.id)}
                className="text-xs border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
