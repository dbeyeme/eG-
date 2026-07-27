import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import {
  IconAlert,
  IconCamera,
  IconImage,
  IconRetry,
  IconScan,
  IconSettings,
  IconStop,
} from '../components/Icons';
import { authenticateTicket } from '../services/ticketAuth';
import { playFailureSound, playSuccessSound } from '../services/audioFeedback';
import { useAuth } from '../context/AuthContext';
import {
  cameraBlockedHelp,
  checkCameraPermission,
  isNativeScannerAvailable,
  isSecureCameraContext,
  openAppSettings,
  requestCameraPermission,
  scanQrFromFile,
  startNativeScan,
  startWebScan,
  stopAllScanners,
  type ScanPermissionState,
} from '../services/scanner';

type ScanPhase = 'idle' | 'starting' | 'live' | 'blocked';

export function ScanPage() {
  const navigate = useNavigate();
  const { agent } = useAuth();
  const [permission, setPermission] = useState<ScanPermissionState>('prompt');
  const [phase, setPhase] = useState<ScanPhase>('idle');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const processingRef = useRef(false);
  const startTokenRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const native = isNativeScannerAvailable();

  useEffect(() => {
    void (async () => {
      if (!isSecureCameraContext()) {
        setPermission('unsupported');
        setError(cameraBlockedHelp(false));
        setPhase('blocked');
        return;
      }
      const state = await checkCameraPermission();
      setPermission(state);
      if (state === 'denied') {
        setError(cameraBlockedHelp(native));
        setPhase('blocked');
      }
    })();

    return () => {
      startTokenRef.current += 1;
      void stopAllScanners();
    };
  }, [native]);

  const handleRaw = useCallback(
    async (raw: string) => {
      if (processingRef.current) return;
      processingRef.current = true;
      setBusy(true);
      try {
        const { ticket } = await authenticateTicket(raw, agent?.identifier ?? 'agent');
        if (ticket.status === 'valid') {
          playSuccessSound();
        } else {
          playFailureSound();
        }
        startTokenRef.current += 1;
        await stopAllScanners();
        setPhase('idle');
        navigate(`/result/${ticket.id}`, { state: { ticket } });
      } catch {
        setError('Impossible d’authentifier ce ticket.');
        setPhase('blocked');
        playFailureSound();
      } finally {
        processingRef.current = false;
        setBusy(false);
      }
    },
    [navigate, agent?.identifier],
  );

  async function enableCamera() {
    const token = ++startTokenRef.current;
    setError('');

    if (!isSecureCameraContext()) {
      setError(cameraBlockedHelp(false));
      setPhase('blocked');
      return;
    }

    setPhase('starting');

    try {
      if (native) {
        const state = await requestCameraPermission();
        if (token !== startTokenRef.current) return;
        setPermission(state);
        if (state !== 'granted') {
          setError(cameraBlockedHelp(true));
          setPhase('blocked');
          return;
        }
        await startNativeScan({
          onResult: (raw) => void handleRaw(raw),
          onError: (message) => {
            if (token !== startTokenRef.current) return;
            setError(message);
            setPhase('blocked');
          },
        });
      } else {
        await startWebScan('web-qr-reader', {
          onResult: (raw) => void handleRaw(raw),
          onError: (message) => {
            if (token !== startTokenRef.current) return;
            setError(message);
            setPhase('blocked');
          },
        });
      }

      if (token !== startTokenRef.current) return;
      setPermission('granted');
      setPhase('live');
    } catch (err) {
      if (token !== startTokenRef.current) return;
      await stopAllScanners();
      const message =
        err instanceof Error ? err.message : 'Impossible de démarrer la caméra.';
      const denied = /refus|denied|Permission|NotAllowed/i.test(message);
      if (denied) {
        setPermission('denied');
        setError(cameraBlockedHelp(native));
      } else {
        setError(message);
      }
      setPhase('blocked');
    }
  }

  async function stopScan() {
    startTokenRef.current += 1;
    await stopAllScanners();
    setBusy(false);
    setPhase('idle');
    setError('');
  }

  async function onPickFile(file: File | undefined) {
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      const raw = await scanQrFromFile(file);
      await handleRaw(raw);
    } catch {
      setError('Impossible de lire ce QR. Essayez une image plus nette.');
      setPhase('blocked');
      playFailureSound();
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  const showLive = phase === 'starting' || phase === 'live';
  const showBlocked = phase === 'blocked';
  const showIdle = phase === 'idle';

  return (
    <div
      className={`page page-scan ${showLive ? 'page-scan--live' : ''} ${showLive && native ? 'page-scan--native-active' : ''}`}
    >
      {!showLive ? <AppHeader title="Scan QR" /> : null}

      {!showLive ? (
        <div className="page-banner" aria-hidden>
          <img src="/assets/banner-road.png" alt="" />
          <div className="page-banner__shade" />
          <p className="page-banner__caption">
            <IconScan size={16} /> Embarquement · QR billets
          </p>
        </div>
      ) : null}

      <main className={`scan-main ${showLive ? 'scan-main--live' : ''}`}>
        <div className={`scan-stage ${showLive ? 'scan-stage--live' : ''} ${showBlocked ? 'scan-stage--blocked' : ''}`}>
          {!native ? (
            <div
              id="web-qr-reader"
              className={`web-qr-reader ${showLive ? 'web-qr-reader--visible' : 'web-qr-reader--hidden'}`}
            />
          ) : null}

          {showIdle ? (
            <div className="scan-idle">
              <div className="scan-idle__badge" aria-hidden>
                <IconCamera size={36} />
              </div>
              <p className="scan-idle__title">Scanner un billet</p>
              <p className="scan-idle__hint">
                Touchez le bouton vert, acceptez la caméra, puis cadrez le QR.
              </p>
              <button type="button" className="btn btn-primary" onClick={() => void enableCamera()}>
                <IconCamera size={18} />
                Ouvrir la caméra
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => fileInputRef.current?.click()}
              >
                <IconImage size={18} />
                Ou importer une photo du QR
              </button>
            </div>
          ) : null}

          {showBlocked ? (
            <div className="scan-blocked" role="alert">
              <div className="scan-blocked__badge" aria-hidden>
                <IconAlert size={32} />
              </div>
              <p className="scan-blocked__title">
                {permission === 'denied' || permission === 'unsupported'
                  ? 'Caméra bloquée'
                  : 'Caméra indisponible'}
              </p>
              <p className="scan-blocked__text">{error || cameraBlockedHelp(native)}</p>

              <div className="scan-blocked__actions">
                {native ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => void openAppSettings()}
                  >
                    <IconSettings size={18} />
                    Ouvrir Réglages iPhone
                  </button>
                ) : null}

                <button type="button" className="btn btn-primary" onClick={() => void enableCamera()}>
                  <IconRetry size={18} />
                  Réessayer la caméra
                </button>

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <IconImage size={18} />
                  Continuer avec une photo
                </button>
              </div>
            </div>
          ) : null}

          {showLive ? (
            <div className="scan-live">
              <div className="scan-reticle" aria-hidden>
                <span className="scan-reticle__corner scan-reticle__corner--tl" />
                <span className="scan-reticle__corner scan-reticle__corner--tr" />
                <span className="scan-reticle__corner scan-reticle__corner--bl" />
                <span className="scan-reticle__corner scan-reticle__corner--br" />
              </div>

              <div className="scan-live__bar">
                <p className="scan-live__hint">
                  {phase === 'starting' || busy ? (
                    <>
                      <IconCamera size={16} /> Ouverture de la caméra…
                    </>
                  ) : (
                    <>
                      <IconScan size={16} /> Alignez le QR dans le viseur
                    </>
                  )}
                </p>
                <button type="button" className="btn btn-stop" onClick={() => void stopScan()}>
                  <IconStop size={18} />
                  Arrêter
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => void onPickFile(e.target.files?.[0])}
        />
      </main>
    </div>
  );
}
