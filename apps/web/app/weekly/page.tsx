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
  pending: "text-yellow-700 bg-yellow-50",
  approved: "text-green-700 bg-green-50",
  rejected: "text-red-700 bg-red-50",
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
        <h1 className="text-xl font-semibold">Weekly Summary</h1>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setWeekStart((w) => addWeeks(w, -1))}
            className="border border-gray-300 rounded px-3 py-1 text-sm hover:bg-gray-50"
          >
            ◀
          </button>
          <span className="text-sm font-medium min-w-36 text-center">
            {formatWeekRange(weekStart)}
          </span>
          <button
            onClick={() => setWeekStart((w) => addWeeks(w, 1))}
            className="border border-gray-300 rounded px-3 py-1 text-sm hover:bg-gray-50"
          >
            ▶
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-gray-500">Loading...</p>}

        {!isLoading && summaries.length === 0 && (
          <p className="text-sm text-gray-500">No employees found.</p>
        )}

        {summaries.map(({ employee, approval, regularHours, overtimeHours, regularPay, overtimePay, totalPay, totalHours }) => {
          const status = approval?.status ?? "pending";
          const isApproved = status === "approved";

          return (
            <div
              key={employee.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">
                      {employee.firstName} {employee.lastName}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[status]}`}
                    >
                      {STATUS_LABEL[status]}
                    </span>
                  </div>

                  <div className="mt-1.5 text-sm text-gray-600">
                    {totalHours === 0 ? (
                      <span className="text-gray-400 italic">No entries this week</span>
                    ) : (
                      <>
                        <span>
                          Regular {regularHours.toFixed(1)}h
                          {overtimeHours > 0 && ` · Overtime ${overtimeHours.toFixed(1)}h`}
                        </span>
                        <span className="ml-3 font-medium text-gray-800">
                          {overtimeHours > 0 ? (
                            <>
                              Pay: ${regularPay.toFixed(2)} + ${overtimePay.toFixed(2)} ={" "}
                              <strong>${totalPay.toFixed(2)}</strong>
                            </>
                          ) : (
                            <>Pay: <strong>${totalPay.toFixed(2)}</strong></>
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  {isApproved ? (
                    <span className="text-xs text-gray-400 self-center">(locked)</span>
                  ) : (
                    <>
                      <button
                        disabled={approveMutation.isPending}
                        onClick={() =>
                          approveMutation.mutate({ employeeId: employee.id, action: "approved" })
                        }
                        className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        disabled={approveMutation.isPending}
                        onClick={() =>
                          approveMutation.mutate({ employeeId: employee.id, action: "rejected" })
                        }
                        className="text-xs border border-red-300 text-red-600 px-3 py-1.5 rounded hover:bg-red-50 disabled:opacity-50"
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
