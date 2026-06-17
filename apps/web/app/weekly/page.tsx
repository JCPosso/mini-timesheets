"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { addWeeks, currentWeekStart, formatWeekRange } from "@/lib/week";

const STATUS_LABEL: Record<string, string> = {
  pending: "⏳ Pending",
  approved: "✅ Approved",
  rejected: "❌ Rejected",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "text-yellow-700 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30",
  approved: "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30",
  rejected: "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/30",
};

export default function WeeklyPage() {
  const qc = useQueryClient();
  const [weekStart, setWeekStart] = useState(currentWeekStart);

  const { data: summaries = [], isLoading } = useQuery({
    queryKey: ["weekly", weekStart],
    queryFn: () => api.weekly.summary(weekStart),
  });

  const approveMutation = useMutation({
    mutationFn: ({
      employeeId,
      action,
    }: {
      employeeId: number;
      action: "approved" | "rejected";
    }) => api.weekly.approve(employeeId, weekStart, { action }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weekly"] });
    },
  });

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Weekly Summary</h1>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setWeekStart((w) => addWeeks(w, -1))}
            className="border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            ◀
          </button>
          <span className="text-sm font-medium min-w-36 text-center text-gray-700 dark:text-gray-300">
            {formatWeekRange(weekStart)}
          </span>
          <button
            onClick={() => setWeekStart((w) => addWeeks(w, 1))}
            className="border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            ▶
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-gray-400 dark:text-gray-500">Loading...</p>}

        {!isLoading && summaries.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No employees found.</p>
        )}

        {summaries.map(({ employee, approval, regularHours, overtimeHours, regularPay, overtimePay, totalPay, totalHours }) => {
          const status = approval?.status ?? "pending";
          const isApproved = status === "approved";

          return (
            <div
              key={employee.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {employee.firstName} {employee.lastName}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[status]}`}>
                      {STATUS_LABEL[status]}
                    </span>
                  </div>

                  <div className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                    {totalHours === 0 ? (
                      <span className="italic">No entries this week</span>
                    ) : (
                      <span className="flex flex-wrap gap-x-3 gap-y-0.5">
                        <span>
                          Regular <strong className="text-gray-700 dark:text-gray-200">{regularHours.toFixed(1)}h</strong>
                          {overtimeHours > 0 && (
                            <> · Overtime <strong className="text-orange-600 dark:text-orange-400">{overtimeHours.toFixed(1)}h</strong></>
                          )}
                        </span>
                        <span className="text-gray-400 dark:text-gray-500">·</span>
                        <span>
                          {overtimeHours > 0 ? (
                            <>
                              Pay: ${regularPay.toFixed(2)} + ${overtimePay.toFixed(2)} ={" "}
                              <strong className="text-gray-900 dark:text-white">${totalPay.toFixed(2)}</strong>
                            </>
                          ) : (
                            <>
                              Pay: <strong className="text-gray-900 dark:text-white">${totalPay.toFixed(2)}</strong>
                            </>
                          )}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 shrink-0 items-center">
                  {isApproved ? (
                    <span className="text-xs text-gray-400 dark:text-gray-600">(locked)</span>
                  ) : (
                    <>
                      <button
                        disabled={approveMutation.isPending}
                        onClick={() => approveMutation.mutate({ employeeId: employee.id, action: "approved" })}
                        className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        disabled={approveMutation.isPending}
                        onClick={() => approveMutation.mutate({ employeeId: employee.id, action: "rejected" })}
                        className="text-xs border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
