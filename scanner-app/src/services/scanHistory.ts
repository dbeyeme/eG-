import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import type { TicketInfo } from '../types/ticket';

const STORAGE_KEY = 'scannedTickets';

async function readAll(): Promise<TicketInfo[]> {
  if (Capacitor.isNativePlatform()) {
    const { value } = await Preferences.get({ key: STORAGE_KEY });
    if (!value) return [];
    try {
      return JSON.parse(value) as TicketInfo[];
    } catch {
      return [];
    }
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as TicketInfo[];
  } catch {
    return [];
  }
}

async function writeAll(tickets: TicketInfo[]): Promise<void> {
  const value = JSON.stringify(tickets);
  if (Capacitor.isNativePlatform()) {
    await Preferences.set({ key: STORAGE_KEY, value });
    return;
  }
  localStorage.setItem(STORAGE_KEY, value);
}

export async function getScannedTickets(): Promise<TicketInfo[]> {
  return readAll();
}

export async function isTicketAlreadyScanned(ticketNumber: string): Promise<boolean> {
  const tickets = await readAll();
  return tickets.some(
    (t) => t.number === ticketNumber && (t.status === 'valid' || t.status === 'already_scanned'),
  );
}

export async function saveScannedTicket(ticket: TicketInfo): Promise<void> {
  const tickets = await readAll();
  tickets.unshift(ticket);
  await writeAll(tickets.slice(0, 200));
}

export async function clearScannedTickets(): Promise<void> {
  await writeAll([]);
}
