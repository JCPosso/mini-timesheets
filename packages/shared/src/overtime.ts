const OVERTIME_THRESHOLD = 40;
const OVERTIME_MULTIPLIER = 1.5;

export interface OvertimeResult {
  regularHours: number;
  overtimeHours: number;
  regularPay: number;
  overtimePay: number;
  totalPay: number;
  totalHours: number;
}

/**
 * Calculates regular vs overtime hours and pay for a weekly set of hours.
 * Overtime = hours beyond 40 in a single week, paid at 1.5x the hourly rate.
 */
export function calculateWeeklyPay(
  totalHours: number,
  hourlyRate: number
): OvertimeResult {
  const regularHours = Math.min(totalHours, OVERTIME_THRESHOLD);
  const overtimeHours = Math.max(0, totalHours - OVERTIME_THRESHOLD);

  const regularPay = round2(regularHours * hourlyRate);
  const overtimePay = round2(overtimeHours * hourlyRate * OVERTIME_MULTIPLIER);
  const totalPay = round2(regularPay + overtimePay);

  return {
    regularHours,
    overtimeHours,
    regularPay,
    overtimePay,
    totalPay,
    totalHours,
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
