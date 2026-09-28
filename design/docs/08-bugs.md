# Bugs relevés

Trouvés pendant l'audit et les inventaires du code, pas encore corrigés sauf mention. Chaque ligne
donne de quoi reproduire ou retrouver la cause.

Gravité : **P1** bloque, trompe ou expose. **P2** gêne ou fait douter. **P3** détail ou code mort.

## À corriger

| # | Grav. | Symptôme | Cause | Où |
| --- | --- | --- | --- | --- |
| B1 | P1 | Créer un compte « Élève » depuis l'administration crée un compte enseignant | `getRole` renvoie `UserRoles.teacher` pour Élève | `apps/web/src/app/pages/admin/users/users.page.ts` |
| B2 | P1 | Si le chargement d'un cours échoue, la page dit « Ce cours ne contient aucune section » | `refresh()` sans `catch`, les sections restent `[]` | `apps/web/src/app/pages/courses/course/dashboard/dashboard.page.ts` |
| B3 | P1 | Challenges : un échec de chargement laisse le squelette pour toujours | `loading` jamais remis à `false` (pas de `finally`) | `apps/web/src/app/pages/courses/course/challenges/challenges.page.ts` |
| B4 | P1 | Lecteur : si l'exécution d'un exercice ne répond pas, le chargement ne finit jamais | aucun délai maximal côté client | `libs/feature/player/browser` |
| B5 | P1 | Accueil vide pour les rôles démo et candidat | les statistiques ne sont chargées que pour `student` | `apps/web/src/app/pages/dashboard/overview/overview.presenter.ts` |
| B6 | P2 | Routes `/tests` accessibles sans rôle enseignant côté front (l'entrée n'est cachée que dans le menu) | pas de garde de rôle | `apps/web/src/app/pages/tests/tests.routes.ts` |
| B7 | P2 | Anneau des statuts d'un cercle : « (0%) » partout malgré des effectifs | piste : les compteurs `SUM` arrivent en chaînes, le total est concaténé | `buildStatusChart`, `apps/web/src/app/pages/resources/resource/overview/overview.page.ts` |
| B8 | P2 | Corrections sans élément : onglet blanc au lieu du message vide | `correction-table` n'a pas de `ng-content`, le message passé n'est jamais affiché | `correction-table.component.html`, `pages/corrections/*/…page.html` |
| B9 | P2 | Fin d'activité : champ « Code de déblocage » affiché même sans code | condition d'affichage absente | `libs/feature/player/browser/src/components/player-activity/player-activity.component.html` |
| B10 | P2 | Résultats d'activité : un échec de chargement n'affiche rien, sans message | erreur non gérée dans `ngOnInit` | `player-results.component.ts` |
| B11 | P3 | Le résumé de fin d'activité montre l'identifiant de session (UUID) | affiché tel quel | `player-results.component.html` |
| B12 | P3 | Balise `<bouton>` au lieu de `<button>` sur Prévisualiser | faute de frappe | `apps/web/src/app/pages/admin/announces/announces.page.html` |
| B13 | P3 | Le bouton « Créer un challenge » de l'état vide s'affiche aussi aux élèves (mène à une page refusée) | pas de condition de permission | `apps/web/src/app/pages/courses/course/challenges/challenges.page.html` |
| B14 | P3 | Menu d'une carte d'activité : un élément de liste vide sans le droit de modifier | le `<li>` du CSV est toujours rendu | `libs/feature/course/browser/src/components/activity-card/activity-card.component.html` |
| B15 | P3 | Polices : `--brand-font` demande Inter puis Roboto, aucune n'est chargée | déclaration sans chargement | styles globaux de `apps/web` |
| B16 | P3 | Fautes d'interface : « Status », « Active », « A propos », « ce champs », « faîtes », « Centre d'intêret », « estimée » | microcopie | voir le tableau Microcopie de `02-audit.md` |

## Code mort à retirer

| # | Quoi | Où |
| --- | --- | --- |
| M1 | Pages `informations` et `demo` des paramètres de cours, jamais routées | `apps/web/src/app/pages/courses/course/settings/informations/`, `…/settings/demo/` |
| M2 | « Transformer avec l'IA » commenté dans le builder, code et modale toujours là | `apps/web/src/app/pages/builder/builder.page.html`, `libs/feature/builder/browser/src/lib/component/ai-prompt-modal/` |
| M3 | `isTemplateCreator` toujours `false`, `mode=configure` jamais positionné | `builder.page.ts`, `pages/resources/create/create.page.ts` |
| M4 | Pages `/forum` et `/agenda` vides | `apps/web/src/app/pages/dashboard/dashboard.routes.ts` |

## Corrigés

| # | Symptôme | Correctif |
| --- | --- | --- |
| C1 | Erreur 500 sur les activités d'un cours et les résultats d'une session quand l'activité date d'avant juillet 2024 (groupes d'exercices stockés en tableau) | `normalizeExerciseGroups`, PR cisstech/platon#115, en attente de merge |

## Hors PLaTon

- **foundry** : `foundry check` ne lit ni les YAML des wireframes ni les liens des écrans (liens
  morts et écrans orphelins invisibles en CI). Ticket : `foundry/tmp/ticket-yaml-wireframes.md`.
