# S-06 : Revenir à la nouvelle interface après le pont

Source : S-04 (le pont), C-06 (la session) ; constat du 2026-10-08 : après la connexion, une personne
partie de la nouvelle interface restait dans l'ancienne ; décisions : D3, D4.
Statut : Livré (2026-10-08).
Dépend de : S-04, C-06.
Taille : S.

## 1. Comportement attendu

- Étant donné l'ancienne interface ouverte par le pont (`?ui=legacy-once`), quand elle navigue vers
  une adresse que la nouvelle interface sert, alors la page se recharge à cette adresse et la
  préférence ramène la nouvelle interface.
- Étant donné une personne partie de la nouvelle interface sans session, quand elle se connecte, alors
  elle revient à l'adresse demandée, dans la nouvelle interface (`/login?next=…` puis `next`).
- Étant donné l'ancienne interface choisie, ou une adresse que la nouvelle ne sert pas, alors rien ne
  change.

## 2. Tests à écrire d'abord

- `isPorted` : les adresses servies, avec ou sans requête ni fragment ; les autres non.
- Les routes du cadre et la liste des adresses servies restent identiques.
- L'ancienne interface ouverte par le pont recharge une adresse servie, et seulement elle.

## 3. État actuel du code

Vérifié le 2026-10-08.

- La connexion de l'ancienne interface (`AuthSignInComponent`,
  `libs/core/browser/src/lib/auth/components/sign-in/sign-in.component.ts:159`) navigue vers `next`
  avec son routeur : on reste dans l'ancienne interface jusqu'au prochain rechargement.
- Le contexte de démarrage dit si l'ancienne interface a été ouverte par le pont (`bridged`).

## 4. Changements

- `apps/web/src/shared/ported-paths.ts` : les adresses servies par la nouvelle interface, partagées
  par les deux interfaces ; `next.routes.spec.ts` vérifie qu'elles suivent les routes du cadre.
- `apps/web/src/app/ui-switch/return-to-next.ts` : dans l'ancienne interface ouverte par le pont, un
  début de navigation vers une adresse servie recharge la page.
- `PageNavigation` passe dans `apps/web/src/shared/`, utilisé par les deux interfaces.

## 5. Hors scope

Une adresse avec paramètres (`/courses/:id`) : la liste ne connaît que des chemins exacts ; elle
gagnera des motifs avec le premier écran porté qui en a besoin.

## 6. Points ouverts

aucun

## 7. Definition of Done

- [x] Les tests du §2 passent.
- [x] Partie de la nouvelle interface, une personne qui se connecte revient dans la nouvelle
      interface, à l'adresse demandée.

> **Amendement à la livraison.** Vérifié dans Chrome sur l'application lancée (API réelle, compte
> `ypicker`) : `/?ui=next` mène à `/login?next=%2Fdashboard` par le pont, la connexion réussit et la
> page se recharge sur `/dashboard` dans la nouvelle interface, avec la couverture et les données de
> l'API (synthèse des corrections, charte, cercle).
