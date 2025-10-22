import { FilterFn } from "@tanstack/react-table";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import ExcelJS from "exceljs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    // Opcional: fuerza siempre dos decimales.
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export const dateRangeFilterFn: FilterFn<unknown> = (row, columnId, value: [string, string]) => {
  if (!value || value.length !== 2) return true
  const [from, to] = value

  const rowValue = row.getValue<unknown>(columnId)
  if (!rowValue) return false

  const rowDate = new Date(rowValue as string)
  if (isNaN(rowDate.getTime())) return false

  const fromDate = from ? new Date(from) : undefined
  const toDate = to ? new Date(to) : undefined

  if (fromDate) fromDate.setHours(0, 0, 0, 0)
  if (toDate) toDate.setHours(23, 59, 59, 999)

  if (fromDate && isNaN(fromDate.getTime())) return false
  if (toDate && isNaN(toDate.getTime())) return false

  if (fromDate && toDate) {
    return rowDate >= fromDate && rowDate <= toDate
  }
  if (fromDate) {
    return rowDate >= fromDate
  }
  if (toDate) {
    return rowDate <= toDate
  }
  return true
}
dateRangeFilterFn.autoRemove = (val: [string, string]) => !val || (val[0] === '' && val[1] === '')

export const multiSelectFilterFn: FilterFn<unknown> = (row, columnId, value: string[]) => {
  if (!value || value.length === 0) return true

  const rowValue = row.getValue<unknown>(columnId)
  if (rowValue === null || rowValue === undefined) return false

  const stringValue = String(rowValue)
  return value.includes(stringValue)
}
multiSelectFilterFn.autoRemove = (val: string[]) => !val || val.length === 0

export function getCurrentFullMonthRange() {
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return [start.toISOString(), end.toISOString()];
}

export async function exportToExcel(data: Record<string, string>[], name: string) {
  if (!data || data.length === 0) {
    console.warn("No hay datos para exportar.");
    return;
  }

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(name.slice(0, 31));

  ws.columns = Object.keys(data[0]).map(key => ({ header: key, key }));

  data.forEach(row => ws.addRow(row));

  ws.getRow(1).font = { bold: true };

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const fileName = `${name.toLowerCase()}-${new Date().toISOString()}.xlsx`;
  const link = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: fileName
  });
  link.click();
  URL.revokeObjectURL(link.href);
}