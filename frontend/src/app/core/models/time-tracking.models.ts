export type TimeEntryType = 'CLOCK_IN' | 'LUNCH_START' | 'LUNCH_END' | 'CLOCK_OUT' | 'MANUAL_ADJUSTMENT';
export type TimeEntrySource = 'MANUAL' | 'CSV_IMPORT' | 'SYSTEM';
export type TimeSheetStatus = 'NORMAL' | 'INCOMPLETE' | 'ABSENT' | 'OVERTIME' | 'MANUAL_REVIEW';

export interface Employee {
  id: string | null;
  name: string;
  cpf: string;
  email: string;
  registrationNumber: string;
  department: string;
  position: string;
  active: boolean;
}

export interface WorkSchedule {
  id: string | null;
  name: string;
  expectedDailyMinutes: number;
  toleranceMinutes: number;
  lunchBreakMinutes: number;
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface TimeEntry {
  id: string | null;
  employeeId: string;
  employeeName?: string;
  entryDate: string;
  entryTime: string;
  type: TimeEntryType;
  source: TimeEntrySource;
  notes: string;
}

export interface TimeSheet {
  id: string | null;
  employeeId: string;
  employeeName: string;
  referenceDate: string;
  workedMinutes: number;
  overtimeMinutes: number;
  missingMinutes: number;
  status: TimeSheetStatus;
  calculatedAt: string;
}

export interface TimeImportPreviewRow {
  rowNumber: number;
  cpf: string;
  nome: string;
  departamento: string;
  data: string | null;
  hora: string | null;
  tipo: string;
  valido: boolean;
  mensagem: string;
}

export interface TimeImportPreviewResponse {
  totalRows: number;
  validRows: number;
  errorRows: number;
  rows: TimeImportPreviewRow[];
}

export interface TimeImportConfirmResponse {
  batchId: string;
  totalRows: number;
  successRows: number;
  errorRows: number;
  status: string;
}

export interface TimeImportBatch {
  id: string;
  fileName: string;
  status: string;
  totalRows: number;
  successRows: number;
  errorRows: number;
  createdAt: string;
  finishedAt: string | null;
}

export interface TimeImportError {
  rowNumber: number;
  errorMessage: string;
}

export interface MonthlyTimeReport {
  referencia: string;
  totalFuncionarios: number;
  totalMinutosTrabalhados: number;
  totalHorasExtras: number;
  totalMinutosEmFalta: number;
  funcionarios: {
    employeeId: string;
    employeeName: string;
    workedMinutes: number;
    overtimeMinutes: number;
    missingMinutes: number;
  }[];
}
