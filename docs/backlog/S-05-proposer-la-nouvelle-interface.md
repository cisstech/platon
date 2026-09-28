# S-05 : Proposer la nouvelle interface, et en revenir

Source : stratégie de code du 2026-09-28 ; décisions : D4, D5, D13, D15.
Statut : À faire.
Dépend de : S-04.
Taille : S.

## 1. Comportement attendu

- Étant donné `ui.next = opt-in` et l'ancienne interface, quand une personne connectée arrive, alors
  un bandeau discret propose « Essayer la nouvelle interface », qu'on peut fermer pour de bon.
- Étant donné le bandeau fermé, alors il ne revient pas (clé `platon.ui.offer-dismissed`).
- Étant donné la nouvelle interface, alors le menu du profil propose « Revenir à l'ancienne
  interface », qui recharge la page à la même adresse.
- Étant donné `ui.next = off`, alors rien n'est proposé.

## 2. Tests à écrire d'abord

- Unitaires : l'affichage du bandeau selon le drapeau, la préférence et la fermeture.
- Bout en bout : essayer puis revenir, à la même adresse.

## 3. État actuel du code

Vérifié le 2026-09-28. Aucun mécanisme de ce genre.

## 4. Changements

- Le bandeau dans l'ancienne interface, ajouté par `legacy.bootstrap` (pas dans les composants
  existants).
- L'entrée de menu dans la nouvelle interface arrive avec le profil (C-02) ; en attendant, un lien
  dans la coquille.

## 5. Hors scope

Garder la préférence côté serveur (`UserPrefs`) : au palier 2 seulement (X-02).

## 6. Points ouverts

aucun

## 7. Definition of Done

- [ ] Essayer et revenir, dans les deux sens, à la même adresse.
- [ ] Le bandeau fermé ne revient pas.
