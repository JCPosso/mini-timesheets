"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createTimeEntrySchema } from "@mini-timesheets/shared";
import type { TimeEntry } from "@mini-timesheets/shared";
import { api } from "@/lib/api";

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
        <h1 className="text-xl font-semibold">Time Entries</h1>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setFormError(""); }}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          + Log time
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-gray-600">Employee:</label>
        <select
          value={selectedEmployeeId}
          onChange={(e) => setSelectedEmployeeId(e.target.value === "" ? "" : Number(e.target.value))}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm"
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
          className="bg-white border border-gray-200 rounded-lg p-4 mb-6 space-y-3"
        >
          <h2 className="font-medium text-sm">{editing ? "Edit entry" : "Log time"}</h2>
          {formError && <p className="text-red-500 text-sm">{formError}</p>}
          <div className="grid grid-cols-3 gap-3">
            {!editing && (
              <select
                name="employeeId"
                defaultValue={selectedEmployeeId}
                required
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              >
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
              className="border border-gray-300 rounded px-3 py-2 text-sm"
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
              onClick={() => { setShowForm(false); setEditing(null); setFormError(""); }}
              className="border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        {isLoading && <p className="p-4 text-sm text-gray-500">Loading...</p>}
        {!isLoading && entries.length === 0 && (
          <p className="p-4 text-sm text-gray-500">No entries found.</p>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between px-4 py-3">
            <div className="text-sm">
              <span className="font-medium">
                {new Date(`${entry.date}T00:00:00Z`).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  timeZone: "UTC",
                })}
              </span>
              <span className="ml-3 text-gray-700">{entry.hours}h</span>
              {employeeMap[entry.employeeId] && (
                <span className="ml-3 text-gray-500">{employeeMap[entry.employeeId]}</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setEditing(entry); setShowForm(false); setFormError(""); }}
                className="text-xs border border-gray-300 px-3 py-1 rounded hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={() => deleteMutation.mutate(entry.id)}
                className="text-xs border border-red-200 text-red-600 px-3 py-1 rounded hover:bg-red-50"
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
