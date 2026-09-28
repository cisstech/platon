# Audit de l'expérience

Exploration du 28 septembre 2026 (branche `main`, dump de développement) avec les comptes admin,
enseignant et étudiant. Chaque constat renvoie au fichier qui le produit.

Priorités : **P1** bloque, trompe ou touche un moment à enjeu. **P2** ralentit ou fait douter.
**P3** finition.

## En bref

1. L'accueil ne dit à personne quoi faire.
2. Une erreur s'affiche comme une liste vide ou un chargement sans fin.
3. Material et ng-zorro cohabitent dans les mêmes écrans.
4. La couleur ne porte pas de sens.

## Identité visuelle

| Constat | Prio. | Preuve |
| --- | --- | --- |
| Plusieurs accents : barre latérale `#3c2964`, primaire `#171c8f`, secondaire `#3466fe`, tertiaire `#7044ff`, primaire sombre `#d09000` | P2 | `shared/styles/_css-variables.scss` |
| Fond de page beige `#f4f2ed` | P2 | `shared/styles/_css-variables.scss` |
| Chaque carte de statistique porte un ruban d'une couleur arbitraire | P2 | `ribbonColor` dans `pages/dashboard/overview/overview.page.html` |
| Taux d'abandon en vert jusqu'à 40 % : un quart d'abandon passe pour un succès | P2 | `positiveRedColor`, `libs/shared/ui/src/cards/statistic-card/statistic-card.component.ts` |
| Page de connexion : titre en anglais « Platform for Learning and Teaching online », vidéo tierce en iframe | P2 | `pages/login/login.page.html` |
| Typographie : `--brand-font` demande Inter puis Roboto, non chargées ; Source Sans Pro est déclarée à côté | P2 | `shared/styles/_css-variables.scss`, `shared/styles/fonts.scss` |

## Cadre et navigation

| Constat | Prio. | Preuve |
| --- | --- | --- |
| Cadre rouge fixe (`0.7vh`) autour de l'écran pour tout administrateur | P2 | `apps/web/src/app/app.page.html`, `app.page.scss` |
| Barre latérale de 220 px, logo de 128 px avant le premier lien | P3 | `pages/dashboard/dashboard.page.scss`, `widgets/sidebar/sidebar.component.scss` |
| Barre supérieure : « PLaTon » répété à côté du logo, bouton « + » et bouton tutoriels sans libellé ni infobulle | P2 | `widgets/toolbar/toolbar.component.html` |
| « Annonces » et « Corrections » affichés à tous, même sans correction assignée | P2 | `widgets/sidebar/sidebar.component.ts` |
| Titre de page centré sur Cours, Espace de travail, Tests ; à gauche ailleurs (fil d'Ariane) | P2 | `courses.page.scss`, `resources.page.scss`, `tests.page.scss` |
| Action de création en rond à icône seule (Cours), en pilule libellée (Tests) | P2 | `courses.page.html`, `tests.page.html` |
| Espace de travail : bouton icône « arbre » seul pour l'arbre des cercles | P3 | `pages/resources/resources.page.html` |
| Premier accès enseignant : tutoriel lancé automatiquement | P3 | `firstLoginStartTuto`, `widgets/toolbar/toolbar.component.ts` |

## Accueils

| Constat | Prio. | Preuve |
| --- | --- | --- |
| Étudiant : huit statistiques et deux graphiques, aucune activité listée | P1 | `pages/dashboard/overview/overview.page.html` |
| Enseignant et admin : seulement le sélecteur de modèles d'exercice | P1 | idem, `canSeeTemplates` |
| Démo (et candidat) : accueil vide, les statistiques ne sont chargées que pour `student` | P1 | `pages/dashboard/overview/overview.presenter.ts` |

## Cours

| Constat | Prio. | Preuve |
| --- | --- | --- |
| Si le chargement des sections ou activités échoue, l'écran affiche « Ce cours ne contient aucune section » | P1 | `refresh()` sans `catch`, `pages/courses/course/dashboard/dashboard.page.ts` |
| L'étudiant voit le nombre d'enseignants et d'élèves, et les onglets Membres et Groupes | P2 | `course/dashboard/dashboard.page.html`, `course/course.page.html` |
| Carte de cours : compteurs à icône seule (infobulle au survol), avancement en barre de 5 pas dans un ruban coloré | P2 | `libs/feature/course/browser/src/components/course-item/course-item.component.html` |
| Membres : bouton rouge plein « retirer » sur chaque ligne (avec confirmation) | P3 | `course-member-table.component.html` |
| Paramètres : Sauvegarder, Créer accès démo, Charger un cours et Supprimer l'accès démo sont tous des boutons primaires | P3 | `course/settings/settings.page.html` |
| Ajout d'activité : assistant Section, Activité, Fonction, Configuration (la section est sautée depuis une section) | P2 | `pages/activities/create/create.page.html` |
| Challenges : un échec de chargement laisse le squelette affiché indéfiniment | P1 | `loading` sans `finally`, `course/challenges/challenges.page.ts` |

## Ressources

| Constat | Prio. | Preuve |
| --- | --- | --- |
| Page d'un exercice : dix cartes de statistiques de même poids | P2 | `pages/resources/resource/overview/overview.page.html` |
| Titre en casse anglaise « Suivi de l'État des Ressources » | P3 | idem |
| Liste vide : « Vérifiez les termes de votre recherche » s'affiche même sans recherche | P2 | `resources.page.html`, `courses.page.html`, `activities/create/create.page.html` |
| Création d'exercice : assistant en six étapes | P2 | `pages/resources/create/create.page.html` |

## Lecteur d'activité

| Constat | Prio. | Preuve |
| --- | --- | --- |
| La fin d'activité affiche toujours le champ « Code de déblocage », même sans code | P1 | `player-activity.component.html` |
| Le résumé montre l'identifiant de session (UUID) | P2 | `player-results/player-results.component.html` |
| Un échec du chargement des résultats n'est pas géré : le tableau n'apparaît pas, sans message | P2 | `ngOnInit`, `player-results.component.ts` |
| Aucun délai maximal côté client : si l'exécution ne répond pas, le chargement ne finit pas | P1 | pas de `timeout` dans `libs/feature/player/browser` |
| Consignes au tutoiement (« Demande le code à ton enseignant ») alors que le reste vouvoie | P3 | `player-activity.component.html` |

## Corrections

| Constat | Prio. | Preuve |
| --- | --- | --- |
| Sans correction, l'onglet reste blanc : le message vide passé au tableau n'est jamais projeté (pas de `ng-content`) | P2 | `correction-table.component.html`, `pages/corrections/pendings/pendings.page.html` |

## Formulaires

| Constat | Prio. | Preuve |
| --- | --- | --- |
| Champs Material `fill` et sélecteurs ng-zorro dans le même formulaire | P2 | `pages/account/about-me/about-me.page.html` |
| Connexion : bouton « SE CONNECTER » désactivé tant que le formulaire est invalide | P2 | `libs/core/browser/src/lib/auth/components/sign-in/sign-in.component.html` |
| Compte : champ « Discord ID » visible par tous, avec l'aide « si vous savez exactement ce que vous faîtes » | P3 | `about-me.page.html` |

## Microcopie

| Actuel | Correct | Où |
| --- | --- | --- |
| « Status », « Active » | « Statut », « Actif » | `libs/core/browser/src/lib/auth/components/user-table/`, `activity-table.component.html` |
| « A propos » | « À propos » | `pages/account/account.page.html` |
| « ce champs », « faîtes », « Centre d'intêret » | « ce champ », « faites », « Centre d'intérêt » | `about-me.page.html` |
| « Temps d'apprentissage estimée » | « estimé » | `overview.page.html` |
| « A condition », tirets longs | « À condition », deux-points | `widgets/toolbar/user-charter/user-charter.component.html` |

## Bugs

Les bugs relevés sont suivis dans [08-bugs.md](08-bugs.md).
