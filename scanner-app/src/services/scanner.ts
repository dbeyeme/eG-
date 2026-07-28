import { Capacitor } from '@capacitor/core';
import {
  BarcodeScanner,
  BarcodeFormat,
  type BarcodesScannedEvent,
} from '@capacitor-mlkit/barcode-scanning';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export type ScanPermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

export type ScannerCallbacks = {
  onResult: (raw: string) => void;
  onError?: (message: string) => void;
};

let webScanner: Html5Qrcode | null = null;
let nativeListener: { remove: () => Promise<void> } | null = null;
let cooldownUntil = 0;

/** Shared with CSS --scan-frame so the visual guide matches the decoded region. */
export function computeQrBoxSize(viewfinderWidth: number, viewfinderHeight: number): number {
  const minSide = Math.min(viewfinderWidth, viewfinderHeight);
  if (!Number.isFinite(minSide) || minSide <= 0) return 250;
  // Large box = higher hit rate for small / distant / busy QR codes
  return Math.max(120, Math.floor(minSide * 0.92));
}

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
    // Do not open a throwaway stream here — it races with html5-qrcode
    // and can break iOS user-gesture chaining. Permission is requested
    // when startWebScan calls getUserMedia.
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

function waitForElement(elementId: string, timeoutMs = 3000): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(elementId);
    if (existing) {
      resolve(existing);
      return;
    }

    const started = Date.now();
    const timer = window.setInterval(() => {
      const el = document.getElementById(elementId);
      if (el) {
        window.clearInterval(timer);
        resolve(el);
        return;
      }
      if (Date.now() - started > timeoutMs) {
        window.clearInterval(timer);
        reject(new Error('Zone de scan introuvable. Rechargez la page.'));
      }
    }, 16);
  });
}

function humanizeCameraError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err ?? '');
  if (/NotAllowed|Permission|denied|NotReadableError/i.test(message)) {
    return 'Permission caméra refusée. Autorisez l’accès puis réessayez.';
  }
  if (/NotFound|DevicesNotFound|Requested device not found/i.test(message)) {
    return 'Aucune caméra détectée. Branchez une webcam ou importez une image QR.';
  }
  if (/secure|https|Only secure origins/i.test(message)) {
    return 'La caméra exige HTTPS (ou localhost).';
  }
  if (/Overconstrained|Constraint/i.test(message)) {
    return 'Cette caméra ne peut pas être ouverte. Réessayez ou importez une image.';
  }
  return message || 'Impossible de démarrer la caméra.';
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

async function startWithCamera(
  scanner: Html5Qrcode,
  cameraConfig: MediaTrackConstraints | string,
  callbacks: ScannerCallbacks,
): Promise<void> {
  await scanner.start(
    cameraConfig,
    {
      // Higher fps + large box = better detection (incl. non-ticket / "lambda" QR)
      fps: 30,
      qrbox: (viewfinderWidth, viewfinderHeight) => {
        const side = computeQrBoxSize(viewfinderWidth, viewfinderHeight);
        return { width: side, height: side };
      },
      aspectRatio: 1.777778,
      disableFlip: false,
    },
    (decodedText) => {
      if (!decodedText || isInCooldown()) return;
      triggerCooldown();
      callbacks.onResult(decodedText);
    },
    () => undefined,
  );
}

export async function startWebScan(
  elementId: string,
  callbacks: ScannerCallbacks,
): Promise<void> {
  await stopWebScan();
  await waitForElement(elementId);

  webScanner = new Html5Qrcode(elementId, {
    verbose: false,
    experimentalFeatures: {
      useBarCodeDetectorIfSupported: true,
    },
    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
  });

  const attempts: Array<MediaTrackConstraints | string> = [
    { facingMode: { ideal: 'environment' } },
    { facingMode: 'environment' },
    { facingMode: 'user' },
  ];

  let lastError: unknown;
  for (const config of attempts) {
    try {
      await startWithCamera(webScanner, config, callbacks);
      // Ensure inline playback on iOS Safari — do NOT restyle video with
      // object-fit:cover (that desyncs the decoded region from what the user sees).
      const video = document.querySelector(
        `#${elementId} video`,
      ) as HTMLVideoElement | null;
      if (video) {
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.muted = true;
        video.style.objectFit = 'contain';
      }
      return;
    } catch (err) {
      lastError = err;
      try {
        if (webScanner.isScanning) await webScanner.stop();
      } catch {
        // ignore
      }
    }
  }

  webScanner = null;
  throw new Error(humanizeCameraError(lastError));
}

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

export async function stopWebScan(): Promise<void> {
  if (!webScanner) return;
  try {
    if (webScanner.isScanning) {
      await webScanner.stop();
    }
    webScanner.clear();
  } catch {
    // ignore
  }
  webScanner = null;
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
  await stopWebScan();
}
