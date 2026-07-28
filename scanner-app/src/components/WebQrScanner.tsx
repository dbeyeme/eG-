import { Scanner, type IDetectedBarcode, type IScannerError } from '@yudiel/react-qr-scanner';

type Props = {
  paused?: boolean;
  onResult: (raw: string) => void;
  onError?: (message: string) => void;
};

function humanizeError(error: IScannerError | unknown): string {
  const kind =
    typeof error === 'object' && error && 'kind' in error
      ? String((error as IScannerError).kind)
      : '';
  const message =
    typeof error === 'object' && error && 'message' in error
      ? String((error as { message?: unknown }).message ?? '')
      : String(error ?? '');

  if (kind === 'permission-denied' || /NotAllowed|Permission|denied/i.test(message)) {
    return 'Permission caméra refusée. Autorisez l’accès puis réessayez.';
  }
  if (kind === 'no-camera' || /NotFound|DevicesNotFound/i.test(message)) {
    return 'Aucune caméra détectée. Importez une photo du QR.';
  }
  if (kind === 'insecure-context' || /secure|https/i.test(message)) {
    return 'La caméra exige HTTPS (ou localhost).';
  }
  if (kind === 'in-use') {
    return 'La caméra est déjà utilisée par une autre application. Fermez-la puis réessayez.';
  }
  return message || 'Impossible de démarrer la caméra.';
}

/**
 * Web QR scanner powered by the React plugin `@yudiel/react-qr-scanner`
 * (BarcodeDetector + ZXing polyfill). Native Capacitor keeps ML Kit.
 */
export function WebQrScanner({ paused = false, onResult, onError }: Props) {
  return (
    <div className="react-qr-scanner">
      <Scanner
        formats={['qr_code']}
        constraints={{
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        }}
        paused={paused}
        sound={false}
        allowMultiple={false}
        scanDelay={1600}
        retryDelay={120}
        startTimeoutMs={8000}
        components={{
          finder: false,
          torch: false,
          zoom: false,
          onOff: false,
        }}
        styles={{
          container: {
            width: '100%',
            height: '100%',
            paddingTop: 0,
            borderRadius: 0,
            overflow: 'hidden',
            background: '#000',
          },
          video: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          },
        }}
        onScan={(codes: IDetectedBarcode[]) => {
          const value = codes.find((c) => c.rawValue)?.rawValue?.trim();
          if (value) onResult(value);
        }}
        onError={(error) => {
          onError?.(humanizeError(error));
        }}
      />
    </div>
  );
}
