---
name: voyageur-qr-scanner
description: >-
  Maintient le scan QR billets Voyageur241 (html5-qrcode / ML Kit,
  localStorage scannedTickets, audio succès/échec, cooldown). Use when touching
  footer.php, scanner-app ScanPage/scanner.ts, ticket validation UI, or QR JS.
---

# Voyageur QR Scanner

## Sources of truth

### PWA PHP (legacy)

Logique principale dans `footer.php` :
- `scannedTickets` via `localStorage`
- `isTicketScanned`, `generateRandomMatricule`, `getCurrentDateTime`
- audio `#success-audio` / `#failure-audio`
- `scanCooldown` pour anti-double scan
- lib `javascript/html5-qrcode.min.js`

### scanner-app (React / Capacitor)

- UI : `scanner-app/src/pages/ScanPage.tsx`
- Moteur : `scanner-app/src/services/scanner.ts` (web `Html5Qrcode`, natif ML Kit)
- Auth ticket : `scanner-app/src/services/ticketAuth.ts`
- Historique : `scanner-app/src/services/scanHistory.ts`
- Styles viseur / nav : `scanner-app/src/index.css`

## Rules

1. Ne jamais retirer le cooldown sans remplacement.
2. Persister chaque scan réussi (PHP `localStorage` / app `scanHistory`).
3. Feedback audio + UI immédiat (succès / déjà scanné / échec).
4. Tester mentalement : premier scan OK, rescan même ticket → échec, nouveau ticket OK.
5. Tout QR décodable (valide ou invalide) doit produire un feedback — pas de silence.

## Express UX checklist (scanner-app)

- [ ] Stage caméra borné (~55–65% hauteur), **pas** plein écran sous la nav
- [ ] `AppHeader` + `bottom-nav` toujours visibles et cliquables en mode live
- [ ] Viseur (`.scan-reticle`) + voile hors cadre aligné sur `qrbox` / `--scan-frame`
- [ ] Sensibilité web : `fps: 30`, `qrbox` ≈ 92% du côté min (BarcodeDetector si dispo)
- [ ] Vidéo en `object-fit: contain` (pas `cover`) pour aligner zone lue / zone vue
- [ ] Tout QR décodable (même hors ticket) → feedback immédiat + écran résultat
- [ ] Cooldown 2s conservé
- [ ] Natif ML Kit : nav opaque (`z-index` élevé), body transparent uniquement hors chrome

## Checklist générale

- [ ] localStorage / historique round-trip intact
- [ ] Sons branchés
- [ ] Pas de double init Html5Qrcode
- [ ] Arrêt caméra au leave page / bouton Arrêter
