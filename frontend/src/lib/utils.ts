import { type FilterFn } from "@tanstack/react-table";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import ExcelJS from "exceljs";

/**
 * Combina clases tailwind usando clsx + twMerge.
 * @param inputs lista de clases.
 * @returns string final mergeado.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un número a moneda.
 * @param amount valor numérico.
 * @param currency código de moneda.
 * @param locale locale para Intl.
 * @returns string formateada.
 */
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

/**
 * Filtro de rango de fechas para react-table (string ISO).
 * @param row fila actual.
 * @param columnId id de la columna.
 * @param value tupla [from, to] en string ISO.
 * @returns true si pasa el filtro.
 */
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

/**
 * Filtro multi-select para react-table.
 * @param row fila actual.
 * @param columnId id de la columna.
 * @param value array de valores permitidos.
 * @returns true si el valor de la celda está en la lista.
 */
export const multiSelectFilterFn: FilterFn<unknown> = (row, columnId, value: string[]) => {
  if (!value || value.length === 0) return true

  const rowValue = row.getValue<unknown>(columnId)
  if (rowValue === null || rowValue === undefined) return false

  const stringValue = String(rowValue)
  return value.includes(stringValue)
}
multiSelectFilterFn.autoRemove = (val: string[]) => !val || val.length === 0

/**
 * Rango completo del mes en curso en ISO.
 * @returns tupla [startISO, endISO].
 */
export function getCurrentFullMonthRange() {
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return [start.toISOString(), end.toISOString()];
}

/**
 * Exporta un arreglo de objetos a Excel.
 * @param data filas a exportar.
 * @param name nombre base del archivo.
 * @returns Promise<void>.
 */
export async function exportToExcel(data: Record<string, string>[], name: string) {
  if (!data || data.length === 0) {
    console.warn("No hay datos para exportar.");
    return;
  }

  const sheetName = name || "Datos";
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName.slice(0, 31));

  ws.columns = Object.keys(data[0]).map(key => ({ header: key, key }));

  data.forEach(row => ws.addRow(row));

  ws.getRow(1).font = { bold: true };

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const fileName = `${(name || "datos").toLowerCase()}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`;
  const link = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: fileName
  });
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Exporta a CSV.
 * @param data filas a exportar.
 * @param name nombre base del archivo.
 * @returns void.
 */
export function exportToCSV(data: Record<string, string>[], name: string) {
  if (!data || data.length === 0) {
    console.warn("No hay datos para exportar.");
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header] || "";
        // Escapar comillas y envolver en comillas si contiene coma, comilla o salto de línea
        if (value.includes(",") || value.includes('"') || value.includes("\n")) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(",")
    )
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const fileName = `${(name || "datos").toLowerCase()}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
  const link = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: fileName
  });
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Exporta a JSON.
 * @param data filas a exportar.
 * @param name nombre base del archivo.
 * @returns void.
 */
export function exportToJSON(data: Record<string, string>[], name: string) {
  if (!data || data.length === 0) {
    console.warn("No hay datos para exportar.");
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  const fileName = `${(name || "datos").toLowerCase()}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
  const link = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: fileName
  });
  link.click();
  URL.revokeObjectURL(link.href);
}
