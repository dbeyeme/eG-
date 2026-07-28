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
- Scan web React : `scanner-app/src/components/WebQrScanner.tsx` (`@yudiel/react-qr-scanner`)
- Moteur natif : `scanner-app/src/services/scanner.ts` (Capacitor ML Kit)
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

- [ ] Scan web via `@yudiel/react-qr-scanner` (plugin React BarcodeDetector/ZXing)
- [ ] Stage caméra borné + `AppHeader` / `bottom-nav` visibles en live
- [ ] Viseur custom (`.scan-reticle`) au-dessus du flux caméra
- [ ] Tout QR décodable (même hors ticket / faible contraste) → feedback + résultat
- [ ] Cooldown 2s conservé
- [ ] Natif ML Kit : nav opaque, body transparent hors chrome
- [ ] Arrêt caméra = demount React Scanner / stop ML Kit

## Checklist générale

- [ ] localStorage / historique round-trip intact
- [ ] Sons branchés
- [ ] Pas de double init Html5Qrcode
- [ ] Arrêt caméra au leave page / bouton Arrêter
