---
name: voyageur-qr-scanner
description: >-
  Maintient le scan QR billets Voyageur241 (html5-qrcode, localStorage
  scannedTickets, audio succès/échec, cooldown). Use when touching footer.php
  scan logic, ticket validation UI, or QR-related JS.
---

# Voyageur QR Scanner

## Source of truth

Logique principale dans `footer.php` :
- `scannedTickets` via `localStorage`
- `isTicketScanned`, `generateRandomMatricule`, `getCurrentDateTime`
- audio `#success-audio` / `#failure-audio`
- `scanCooldown` pour anti-double scan
- lib `javascript/html5-qrcode.min.js`

## Rules

1. Ne jamais retirer le cooldown sans remplacement.
2. Persister chaque scan réussi dans `localStorage`.
3. Feedback audio + UI immédiat (succès / déjà scanné / échec).
4. Tester mentalement : premier scan OK, rescan même ticket → échec, nouveau ticket OK.

## Checklist

- [ ] localStorage round-trip intact
- [ ] Sons branchés
- [ ] Pas de double init Html5Qrcode
