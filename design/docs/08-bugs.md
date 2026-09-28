# Bugs relevés

Trouvés pendant l'audit et les inventaires du code. Une fiche par bug : ce qu'on voit, pourquoi, où
regarder. Cochez la case quand c'est corrigé.

Gravité : **P1** bloque, trompe ou expose. **P2** gêne ou fait douter. **P3** détail.

## P1

### B1. « Élève » crée un compte enseignant

- [ ] Corrigé
- **Symptôme** : dans Administration, Utilisateurs, créer un compte avec le rôle Élève donne un
  compte enseignant.
- **Cause** : `getRole` renvoie `UserRoles.teacher` pour Élève.
- **Où** : `apps/web/src/app/pages/admin/users/users.page.ts`

### B2. Un cours qui ne charge pas se dit vide

- [ ] Corrigé
- **Symptôme** : si le chargement des sections ou des activités échoue, la page affiche « Ce cours
  ne contient aucune section ».
- **Cause** : `refresh()` n'a pas de `catch`, les sections restent `[]`.
- **Où** : `apps/web/src/app/pages/courses/course/dashboard/dashboard.page.ts`

### B3. Challenges : squelette infini

- [ ] Corrigé
- **Symptôme** : un échec de chargement laisse le squelette affiché pour toujours.
- **Cause** : `loading` n'est jamais remis à `false` (pas de `finally`).
- **Où** : `apps/web/src/app/pages/courses/course/challenges/challenges.page.ts`

### B4. Lecteur : chargement sans fin

- [ ] Corrigé
- **Symptôme** : si l'exécution d'un exercice ne répond pas, le chargement ne s'arrête jamais.
- **Cause** : aucun délai maximal côté client.
- **Où** : `libs/feature/player/browser`

### B5. Accueil vide pour les comptes démo et candidat

- [ ] Corrigé
- **Symptôme** : l'accueil ne montre rien à ces rôles.
- **Cause** : les données ne sont chargées que pour `student`.
- **Où** : `apps/web/src/app/pages/dashboard/overview/overview.presenter.ts`

## P2

### B6. `/tests` sans garde de rôle

- [ ] Corrigé
- **Symptôme** : un élève qui a l'adresse ouvre l'écran des tests d'entrée ; seule l'entrée du
  menu est cachée. À vérifier : l'API refuse-t-elle les données ?
- **Cause** : pas de garde de rôle sur les routes.
- **Où** : `apps/web/src/app/pages/tests/tests.routes.ts`

### B7. Anneau des statuts d'un cercle à « (0%) »

- [ ] Corrigé
- **Symptôme** : chaque statut affiche « (0%) » alors que les effectifs ne sont pas nuls.
- **Piste** : les compteurs `SUM` arrivent en chaînes et le total est concaténé.
- **Où** : `buildStatusChart`, `apps/web/src/app/pages/resources/resource/overview/overview.page.ts`

### B8. Corrections : onglet blanc sans élément

- [ ] Corrigé
- **Symptôme** : sans correction, l'onglet est blanc au lieu du message prévu.
- **Cause** : `correction-table` n'a pas de `ng-content`, le message passé n'est jamais affiché.
- **Où** : `correction-table.component.html`, pages `corrections/pendings` et `availables`

### B9. Code de déblocage affiché sans code

- [ ] Corrigé
- **Symptôme** : la fin d'activité montre le champ « Code de déblocage » même quand il n'y en a pas.
- **Cause** : aucune condition d'affichage.
- **Où** : `libs/feature/player/browser/src/components/player-activity/player-activity.component.html`

### B10. Résultats d'activité : échec silencieux

- [ ] Corrigé
- **Symptôme** : si les résultats ne chargent pas, rien ne s'affiche, sans message.
- **Cause** : erreur non gérée dans `ngOnInit`.
- **Où** : `player-results.component.ts`

## P3

### B11. Identifiant de session dans le résumé

- [ ] Corrigé
- **Symptôme** : la fin d'activité affiche l'UUID de la session.
- **Où** : `player-results.component.html`

### B12. Balise `<bouton>`

- [ ] Corrigé
- **Symptôme** : l'action Prévisualiser des annonces est une balise `<bouton>` au lieu de `<button>`.
- **Où** : `apps/web/src/app/pages/admin/announces/announces.page.html`

### B13. « Créer un challenge » montré aux élèves

- [ ] Corrigé
- **Symptôme** : l'état vide des challenges propose de créer un challenge à tout le monde ; un élève
  arrive sur une page refusée.
- **Cause** : pas de condition de permission.
- **Où** : `apps/web/src/app/pages/courses/course/challenges/challenges.page.html`

### B14. Élément vide dans le menu d'une activité

- [ ] Corrigé
- **Symptôme** : sans droit de modifier, le menu d'une carte d'activité a une ligne vide.
- **Cause** : le `<li>` de l'export CSV est toujours rendu.
- **Où** : `libs/feature/course/browser/src/components/activity-card/activity-card.component.html`

### B15. Polices non chargées

- [ ] Corrigé
- **Symptôme** : `--brand-font` demande Inter puis Roboto, aucune n'est chargée ; le navigateur
  prend sa police par défaut.
- **Où** : styles globaux de `apps/web`

### B16. Fautes d'interface

- [ ] Corrigé
- « Status », « Active », « A propos », « ce champs », « faîtes », « Centre d'intêret »,
  « estimée ». Détail et fichiers : tableau Microcopie de `02-audit.md`.

## Code mort

- [ ] Pages `informations` et `demo` des paramètres de cours, jamais routées
      (`apps/web/src/app/pages/courses/course/settings/`)
- [ ] « Transformer avec l'IA » commenté dans le builder, code et modale toujours présents
      (`pages/builder/builder.page.html`, `libs/feature/builder/browser/.../ai-prompt-modal/`)
- [ ] `isTemplateCreator` toujours `false`, `mode=configure` jamais positionné (`builder.page.ts`,
      `pages/resources/create/create.page.ts`)
- [ ] Pages `/forum` et `/agenda` vides (`pages/dashboard/dashboard.routes.ts`)

## Corrigés

- [x] **Activités d'avant juillet 2024 en erreur 500** (groupes d'exercices stockés en tableau) :
      `normalizeExerciseGroups`, PR cisstech/platon#115, mergée sur `main`.
