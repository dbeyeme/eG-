import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const plistPath = resolve(process.cwd(), 'ios/App/App/Info.plist');

const CAMERA_KEY = 'NSCameraUsageDescription';
const CAMERA_MSG =
  'Voyageur241 Scanner utilise la caméra pour scanner les QR codes des billets à l’embarquement.';

if (!existsSync(plistPath)) {
  console.log(
    '[patch-ios-permissions] ios/App/App/Info.plist introuvable. Exécutez d’abord: npx cap add ios',
  );
  process.exit(0);
}

let plist = readFileSync(plistPath, 'utf8');

if (plist.includes(CAMERA_KEY)) {
  console.log('[patch-ios-permissions] NSCameraUsageDescription déjà présent.');
  process.exit(0);
}

const entry = `	<key>${CAMERA_KEY}</key>
	<string>${CAMERA_MSG}</string>
`;

if (!plist.includes('</dict>')) {
  console.error('[patch-ios-permissions] Format Info.plist inattendu.');
  process.exit(1);
}

plist = plist.replace('</dict>', `${entry}</dict>`);
writeFileSync(plistPath, plist);
console.log('[patch-ios-permissions] NSCameraUsageDescription ajouté.');
