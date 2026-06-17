type Lang = "en" | "es";

const messages = {
  EMPLOYEE_NOT_FOUND: {
    en: "Employee not found.",
    es: "Empleado no encontrado.",
  },
  EMPLOYEE_INACTIVE: {
    en: "Cannot log time for an inactive employee.",
    es: "No se puede registrar tiempo para un empleado inactivo.",
  },
  TIME_ENTRY_NOT_FOUND: {
    en: "Time entry not found.",
    es: "Entrada de tiempo no encontrada.",
  },
  TIME_ENTRY_LOCKED: {
    en: "This week is approved and locked. Entries cannot be modified.",
    es: "Esta semana está aprobada y bloqueada. No se pueden modificar las entradas.",
  },
  FUTURE_DATE_NOT_ALLOWED: {
    en: "Future dates are not allowed.",
    es: "No se permiten fechas futuras.",
  },
  VALIDATION_ERROR: {
    en: "Validation error.",
    es: "Error de validación.",
  },
  APPROVAL_NOT_FOUND: {
    en: "No weekly summary found for this employee and week.",
    es: "No se encontró resumen semanal para este empleado y semana.",
  },
  ALREADY_APPROVED: {
    en: "This week is already approved.",
    es: "Esta semana ya está aprobada.",
  },
  INTERNAL_ERROR: {
    en: "Internal server error.",
    es: "Error interno del servidor.",
  },
} as const;

type MessageKey = keyof typeof messages;

export function getLang(acceptLanguage: string | undefined): Lang {
  if (acceptLanguage?.toLowerCase().startsWith("es")) return "es";
  return "en";
}

export function msg(key: MessageKey, lang: Lang): string {
  return messages[key][lang];
}
