---
name: voyageur-php-pages
description: >-
  Crée ou modifie des pages PHP Voyageur241 (includes header/footer, formulaires
  tf-*, flux auth/home/history). Use when editing *.php pages, adding screens,
  or wiring navigation in the eG- / Voyageur241 app.
---

# Voyageur PHP Pages

## Workflow

1. Lire `header.php` / `footer.php` et une page voisine du même type.
2. Créer/éditer la page avec includes obligatoires.
3. Réutiliser classes `tf-container`, `tf-form`, `tf-btn`, `app-header`.
4. Texte FR ; placeholders cohérents avec `index.php` / `home.php`.
5. Vérifier que les scripts nécessaires sont déjà dans `footer.php` (ne pas dupliquer).

## Checklist

- [ ] `include 'header.php'` / `footer.php`
- [ ] Preload si les pages sœurs en ont un
- [ ] Pas de nouvelle dépendance PHP
- [ ] Liens relatifs corrects (`home.php`, `history.php`, …)
