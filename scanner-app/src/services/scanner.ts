import { Capacitor } from '@capacitor/core';
import {
  BarcodeScanner,
  BarcodeFormat,
  type BarcodesScannedEvent,
} from '@capacitor-mlkit/barcode-scanning';
import { Html5Qrcode } from 'html5-qrcode';

export type ScanPermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

export type ScannerCallbacks = {
  onResult: (raw: string) => void;
  onError?: (message: string) => void;
};

let nativeListener: { remove: () => Promise<void> } | null = null;
let cooldownUntil = 0;

export function isInCooldown(): boolean {
  return Date.now() < cooldownUntil;
}

export function triggerCooldown(ms = 2000): void {
  cooldownUntil = Date.now() + ms;
}

export function isNativeScannerAvailable(): boolean {
  return Capacitor.isNativePlatform();
}

export function isSecureCameraContext(): boolean {
  if (Capacitor.isNativePlatform()) return true;
  return window.isSecureContext;
}

export function cameraBlockedHelp(native: boolean): string {
  if (native) {
    return 'La caméra est bloquée. Ouvrez Réglages → Voyageur241 Scanner → activez Caméra, puis revenez ici.';
  }
  if (!window.isSecureContext) {
    return 'Sur iPhone, Safari n’autorise la caméra qu’en HTTPS. Ouvrez l’app via un lien sécurisé, ou importez une photo du QR.';
  }
  return 'Autorisez la caméra dans Réglages → Safari → Caméra (ou le dialogue Safari), puis réessayez. Sinon importez une photo du QR.';
}

export async function checkCameraPermission(): Promise<ScanPermissionState> {
  if (!Capacitor.isNativePlatform()) {
    if (!navigator.mediaDevices?.getUserMedia) return 'unsupported';
    return 'prompt';
  }

  try {
    const { camera } = await BarcodeScanner.checkPermissions();
    if (camera === 'granted' || camera === 'limited') return 'granted';
    if (camera === 'denied') return 'denied';
    return 'prompt';
  } catch {
    return 'unsupported';
  }
}

export async function requestCameraPermission(): Promise<ScanPermissionState> {
  if (!Capacitor.isNativePlatform()) {
    if (!navigator.mediaDevices?.getUserMedia) return 'unsupported';
    return 'prompt';
  }

  try {
    const { camera } = await BarcodeScanner.requestPermissions();
    if (camera === 'granted' || camera === 'limited') return 'granted';
    if (camera === 'denied') return 'denied';
    return 'prompt';
  } catch {
    return 'denied';
  }
}

export async function startNativeScan(callbacks: ScannerCallbacks): Promise<void> {
  const supported = await BarcodeScanner.isSupported();
  if (!supported.supported) {
    callbacks.onError?.('Scan natif non supporté sur cet appareil.');
    return;
  }

  document.documentElement.classList.add('barcode-scanner-active');
  document.body.classList.add('barcode-scanner-active');

  nativeListener = await BarcodeScanner.addListener(
    'barcodesScanned',
    (event: BarcodesScannedEvent) => {
      if (isInCooldown()) return;
      const barcode = event.barcodes[0];
      const value = barcode?.displayValue || barcode?.rawValue;
      if (!value) return;
      triggerCooldown();
      callbacks.onResult(value);
    },
  );

  await BarcodeScanner.startScan({
    formats: [BarcodeFormat.QrCode],
  });
}

export async function stopNativeScan(): Promise<void> {
  document.documentElement.classList.remove('barcode-scanner-active');
  document.body.classList.remove('barcode-scanner-active');
  if (nativeListener) {
    await nativeListener.remove();
    nativeListener = null;
  }
  try {
    await BarcodeScanner.removeAllListeners();
  } catch {
    // ignore
  }
  try {
    await BarcodeScanner.stopScan();
  } catch {
    // already stopped
  }
}

/** File/photo QR decode (fallback when camera is blocked). */
export async function scanQrFromFile(file: File): Promise<string> {
  const tempId = 'web-qr-file-reader';
  let holder = document.getElementById(tempId);
  if (!holder) {
    holder = document.createElement('div');
    holder.id = tempId;
    holder.style.display = 'none';
    document.body.appendChild(holder);
  }

  const scanner = new Html5Qrcode(tempId, { verbose: false });
  try {
    return await scanner.scanFile(file, false);
  } finally {
    try {
      scanner.clear();
    } catch {
      // ignore
    }
  }
}

export async function openAppSettings(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await BarcodeScanner.openSettings();
  } catch {
    // ignore
  }
}

export async function stopAllScanners(): Promise<void> {
  await stopNativeScan();
}
