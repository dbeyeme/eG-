import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { WebQrScanner } from '../components/WebQrScanner';
import {
  IconAlert,
  IconCamera,
  IconImage,
  IconRetry,
  IconScan,
  IconSettings,
  IconStop,
  IconTicket,
} from '../components/Icons';
import { authenticateTicket } from '../services/ticketAuth';
import { playFailureSound, playSuccessSound } from '../services/audioFeedback';
import { useAuth } from '../context/AuthContext';
import {
  cameraBlockedHelp,
  checkCameraPermission,
  isInCooldown,
  isNativeScannerAvailable,
  isSecureCameraContext,
  openAppSettings,
  requestCameraPermission,
  scanQrFromFile,
  startNativeScan,
  stopAllScanners,
  triggerCooldown,
  type ScanPermissionState,
} from '../services/scanner';

type ScanPhase = 'idle' | 'starting' | 'live' | 'blocked';

function normalizeManualTicket(value: string): string | null {
  const cleaned = value.trim().toUpperCase().replace(/\s+/g, '');
  if (!cleaned) return null;
  const match = cleaned.match(/\b(TKT[-_A-Z0-9]+)\b/);
  if (match?.[1]) return match[1];
  if (/^TKT[-_A-Z0-9]+$/.test(cleaned)) return cleaned;
  return null;
}

export function ScanPage() {
  const navigate = useNavigate();
  const { agent } = useAuth();
  const [permission, setPermission] = useState<ScanPermissionState>('prompt');
  const [phase, setPhase] = useState<ScanPhase>('idle');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [manualNumber, setManualNumber] = useState('');
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
      setError('');
      document.querySelector('.scan-reticle__frame')?.classList.add('is-hit');
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
        document.querySelector('.scan-reticle__frame')?.classList.remove('is-hit');
      }
    },
    [navigate, agent?.identifier],
  );

  const onWebScanResult = useCallback(
    (raw: string) => {
      if (isInCooldown() || processingRef.current) return;
      triggerCooldown();
      void handleRaw(raw);
    },
    [handleRaw],
  );

  async function verifyManualNumber() {
    const numero = normalizeManualTicket(manualNumber);
    if (!numero) {
      setError('Saisissez un numéro valide (ex. TKT-2607-013).');
      return;
    }
    setError('');
    await handleRaw(numero);
  }

  async function enableCamera() {
    if (phase === 'starting') return;
    const token = ++startTokenRef.current;
    setError('');

    if (!isSecureCameraContext()) {
      setError(cameraBlockedHelp(false));
      setPhase('blocked');
      return;
    }

    setPhase('starting');

    try {
      await stopAllScanners();
      if (token !== startTokenRef.current) return;

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
      setError('Impossible de lire ce QR. Saisissez le N° du ticket ci-dessous.');
      setPhase('idle');
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
      <AppHeader title="Scan QR" />

      {!showLive ? (
        <div className="page-banner" aria-hidden>
          <img src="/assets/banner-road.png" alt="" />
          <div className="page-banner__shade" />
          <p className="page-banner__caption">
            <IconScan size={16} /> Embarquement · contrôle en base
          </p>
        </div>
      ) : null}

      <main className={`scan-main ${showLive ? 'scan-main--live' : ''}`}>
        <div
          className={`scan-stage ${showLive ? 'scan-stage--live' : ''} ${showBlocked ? 'scan-stage--blocked' : ''}`}
        >
          {!native && phase === 'live' ? (
            <WebQrScanner
              paused={busy}
              onResult={onWebScanResult}
              onError={(message) => {
                setError(message);
                setPhase('blocked');
                setPermission(/refus|Permission|denied/i.test(message) ? 'denied' : permission);
              }}
            />
          ) : null}

          {showIdle ? (
            <div className="scan-idle">
              <div className="scan-idle__badge" aria-hidden>
                <IconCamera size={36} />
              </div>
              <p className="scan-idle__title">Contrôler un billet</p>
              <p className="scan-idle__hint">
                Scan QR ou saisie du N° — vérification en base : existence, validité, non utilisé.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy}
                onClick={() => void enableCamera()}
              >
                <IconCamera size={18} />
                Ouvrir la caméra
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={busy}
                onClick={() => fileInputRef.current?.click()}
              >
                <IconImage size={18} />
                Ou importer une photo du QR
              </button>

              <form
                className="scan-manual"
                onSubmit={(e) => {
                  e.preventDefault();
                  void verifyManualNumber();
                }}
              >
                <label className="scan-manual__label" htmlFor="manual-ticket">
                  <IconTicket size={16} /> N° ticket (si QR illisible)
                </label>
                <div className="scan-manual__row">
                  <input
                    id="manual-ticket"
                    className="scan-manual__input"
                    type="text"
                    inputMode="text"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="TKT-2607-013"
                    value={manualNumber}
                    disabled={busy}
                    onChange={(e) => setManualNumber(e.target.value)}
                  />
                  <button type="submit" className="btn btn-secondary" disabled={busy}>
                    Vérifier
                  </button>
                </div>
              </form>
              {error && showIdle ? (
                <p className="scan-manual__error" role="alert">
                  {error}
                </p>
              ) : null}
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

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setPhase('idle');
                    setError('');
                  }}
                >
                  <IconTicket size={18} />
                  Saisir le N° du ticket
                </button>
              </div>
            </div>
          ) : null}

          {showLive ? (
            <div className="scan-live">
              <div className="scan-reticle" aria-hidden>
                <span className="scan-reticle__frame">
                  <span className="scan-reticle__corner scan-reticle__corner--tl" />
                  <span className="scan-reticle__corner scan-reticle__corner--tr" />
                  <span className="scan-reticle__corner scan-reticle__corner--bl" />
                  <span className="scan-reticle__corner scan-reticle__corner--br" />
                </span>
              </div>

              <div className="scan-live__bar">
                <p className="scan-live__hint">
                  {busy ? (
                    <>
                      <IconCamera size={16} /> QR détecté — vérification…
                    </>
                  ) : phase === 'starting' ? (
                    <>
                      <IconCamera size={16} /> Ouverture de la caméra…
                    </>
                  ) : (
                    <>
                      <IconScan size={16} /> Alignez le QR dans le cadre
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
