import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, getWeek } from 'date-fns';
import { es } from 'date-fns/locale';

export function getLocalDateString(date?: Date): string {
  const d = date ?? new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getWeekBounds(date: Date): { start: Date; end: Date } {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return { start, end };
}

export function getMonthBounds(year: number, month: number): { start: Date; end: Date } {
  const date = new Date(year, month - 1, 1);
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

export function formatDateES(date: Date): string {
  return format(date, "EEEE d 'de' MMMM", { locale: es });
}

/**
 * Formatea una fecha como dd/mm o dd/mm/aa.
 * Si la fecha es del año actual se omite el año.
 */
export function formatShortDate(date: Date | string): string {
  const d =
    typeof date === 'string'
      ? new Date(date.includes('T') ? date : date + 'T12:00:00')
      : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const currentYear = new Date().getFullYear();
  return year !== currentYear
    ? `${day}/${month}/${String(year).slice(-2)}`
    : `${day}/${month}`;
}

export function getDaysInMonth(year: number, month: number): Date[] {
  const { start, end } = getMonthBounds(year, month);
  return eachDayOfInterval({ start, end });
}

export function getDaysInYear(year: number): Date[] {
  return eachDayOfInterval({
    start: new Date(year, 0, 1),
    end: new Date(year, 11, 31),
  });
}

export function getWeekNumber(date: Date): number {
  return getWeek(date, { weekStartsOn: 1 });
}

export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}
