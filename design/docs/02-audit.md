# Audit de l'expérience

Exploration menée le 28 septembre 2026 sur la branche `main` (PlatonOrg `develop`, Angular 22), en
local, avec la base du dump de développement migrée au schéma courant. Écrans parcourus avec les
comptes administrateur, enseignant et étudiant, sur bureau (1440 x 900) et mobile (390 x 844).

Priorités :

- **P1** : bloque ou trompe l'utilisateur, ou touche un moment à enjeu (note, examen, test).
- **P2** : ralentit, fait douter ou dégrade la confiance.
- **P3** : finition, cohérence, polissage.

## Ce qui ressort

1. **L'accueil ne répond pas à la question du jour.** Ni l'étudiant ni l'enseignant ne voient ce
   qu'ils ont à faire en arrivant. L'un voit des taux, l'autre un sélecteur de modèles.
2. **Les états d'erreur et de chargement n'existent presque pas.** Une erreur serveur devient un
   cours vide, une page blanche ou un squelette qui ne finit jamais.
3. **Deux bibliothèques, deux langages visuels.** Les champs Material (fond gris, soulignés) côtoient
   les champs ng-zorro (bordés) dans le même formulaire, les boutons changent de forme d'un écran à
   l'autre, les en-têtes de page aussi.
4. **La couleur ne veut rien dire.** Cinq teintes d'accent se disputent l'écran (violet de la barre
   latérale, bleu nuit des boutons, bleu vif, violet tertiaire, or en thème sombre) et chaque carte
   de statistique porte un coin de couleur décoratif. Le vert habille un taux d'abandon.
5. **Le fond beige** (`#f4f2ed`) donne un teint jauni à toute l'application, et le thème sombre
   bascule le primaire sur un or sans rapport.

## Identité visuelle

| Où | Constat | Effet | Proposition | Priorité |
| --- | --- | --- | --- | --- |
| Partout | Cinq accents : barre latérale `#3c2964`, primaire `#171c8f`, secondaire `#3466fe`, tertiaire `#7044ff`, primaire sombre `#d09000` | Rien ne se distingue, l'œil ne sait pas où agir | Un seul accent, l'encre violette dérivée du logo, réservé à l'action et à la sélection | P2 |
| Partout | Fond de page `#f4f2ed` (teinte chaude, 95°) | Aspect jauni, sale sur les écrans froids | Fond neutre légèrement froid, teinté de l'accent | P2 |
| Cartes de statistiques | Un ruban coloré par carte (violet, jaune, turquoise, bleu, rouge, vert, gris, orange) | Bruit, la couleur ne porte aucun sens | Pas de couleur décorative ; la couleur signale un état (réussi, en retard) | P2 |
| Tableau de bord étudiant | Taux d'abandon 25 % en vert | Contresens | Couleur liée au sens de la métrique, ou neutre | P1 |
| Connexion | Titre en anglais « Platform for Learning and Teaching online » sur une interface française, bandeau cookies incrusté dans la vidéo | Première impression brouillée | Page de connexion sobre, en français, vidéo optionnelle | P2 |
| Typographie | Source Sans Pro et Roboto, Material Icons et icônes Ant, graisses et tailles libres | Aucune échelle, hiérarchie floue | Une famille (Atkinson Hyperlegible Next et Mono), une échelle fermée | P2 |

## Navigation et cadre de l'application

| Où | Constat | Effet | Proposition | Priorité |
| --- | --- | --- | --- | --- |
| Admin, partout | Cadre rouge fixe de 6 px autour de l'écran (`app.page.html`, `.admin-box`) | Agressif, ressemble à une erreur, masque le bord du contenu | Mention discrète « Administrateur » dans le menu utilisateur, et une couleur de rappel seulement sur les actions à portée globale | P2 |
| Barre latérale | 220 px de violet plein, logo sur 140 px de haut avant le premier lien | Espace perdu, poids visuel sur la navigation plutôt que sur le contenu | Barre latérale claire, repliable, logo compact | P3 |
| Barre supérieure | « PLaTon » répété à côté du logo, bouton « + » sans libellé, bouton d'aide aux tutoriels sans libellé, thème à part | Actions ambiguës, doublons | « Créer » libellé, aide et thème dans le menu utilisateur, pas de titre de marque répété | P2 |
| Rôle étudiant | « Annonces » et « Corrections » en navigation principale alors que l'étudiant n'a le plus souvent rien à corriger | Navigation qui ne lui parle pas | Navigation par rôle ; Corrections n'apparaît que s'il y a des corrections assignées | P2 |
| Toutes pages | Deux gabarits d'en-tête : titre centré souligné (Cours, Espace de travail, Tests) ou titre à gauche (Administration, Corrections, Compte) | Incohérence | Un seul en-tête de page : fil d'Ariane, titre, description, actions à droite | P2 |
| Toutes pages | Action principale sous forme de rond avec icône seule (Cours, Espace de travail), de pilule libellée (Tests), de rectangle (Admin) | L'action principale change de forme et de sens | Bouton primaire libellé, toujours au même endroit | P2 |
| Espace de travail | L'icône de l'action principale est un arbre, sans libellé | Personne ne devine « parcourir les cercles » | Libellé explicite | P2 |
| Recherche | Aucune recherche globale ; une barre différente par page | L'utilisateur doit savoir où chercher | Palette de commande (⌘K) en second temps, barre de recherche unique par liste | P3 |

## Accueils

| Où | Constat | Effet | Proposition | Priorité |
| --- | --- | --- | --- | --- |
| Accueil étudiant | Huit statistiques et un graphique, aucune activité listée | L'étudiant ne sait pas quoi faire | « À faire » d'abord (activités ouvertes triées par échéance), puis « Bientôt », « Résultats récents », les chiffres ensuite | P1 |
| Accueil enseignant | Sélecteur de modèles d'exercice, vide | Aucun pilotage | « En cours » (activités ouvertes, participation), « À corriger », « Mes cours », « Ressources récentes » ; les modèles vont dans la création d'exercice | P1 |
| Accueil démo | Le rôle démo ne rend aucun contenu (`overview.page.ts`) | Première impression vide pour un prospect | Le démo voit l'accueil étudiant | P1 |
| Premier accès enseignant | Tour guidé shepherd lancé automatiquement | Tunnel imposé, masque l'écran | État vide qui guide par l'action (créer un cours, trouver un exercice, ajouter une activité), tour à la demande | P3 |

## Listes, cartes et pages de détail

| Où | Constat | Effet | Proposition | Priorité |
| --- | --- | --- | --- | --- |
| Cours (étudiant) | Carte avec icônes sans libellé (4, 11, 2), une date sans signification (création du cours), un badge d'avancement orange avec une barre d'icône | Chiffres illisibles | Avancement explicite (« 3 activités sur 8 terminées »), prochaine échéance, pas de date de création | P2 |
| Cours, onglet vue d'ensemble (étudiant) | Nombre d'enseignants et d'élèves, onglets Membres et Groupes, titre de section par défaut « Modifiez le titre de votre section » | Contenu d'enseignant montré à l'étudiant | Vue étudiant : sa progression, ses activités par section, rien de l'administration du cours | P2 |
| Espace de travail | Le même cercle affiché deux fois (résultats et « Mon espace ») | Doute sur ce qui est affiché | Mon cercle en raccourci de navigation, pas en doublon de résultat | P3 |
| Page d'un exercice | Onze cartes de statistiques de même poids | Rien n'est lisible | Trois indicateurs clés, le détail en tableau ou en graphique repliable | P2 |
| Page d'un cercle | Titre en casse anglaise « Suivi de l'État des Ressources », légende de l'anneau à « (0%) » partout | Faute de casse, chiffres faux | Casse de phrase, pourcentages corrects | P2 |
| Membres d'un cours | Bouton rouge plein de suppression sur chaque ligne ; ordre nom et prénom différent de l'administration | Risque d'erreur, incohérence | Suppression dans un menu de ligne avec confirmation, ordre « Prénom Nom » partout | P2 |
| Paramètres du cours | Trois blocs, trois boutons primaires identiques | Pas de hiérarchie | Un primaire par écran, les autres en secondaire, la zone destructive à part | P3 |

## Formulaires

| Où | Constat | Effet | Proposition | Priorité |
| --- | --- | --- | --- | --- |
| Compte, paramètres, administration | Champs Material remplis et sélecteurs ng-zorro bordés dans le même formulaire | Deux langages dans un même geste | Un seul champ, un seul sélecteur | P2 |
| Connexion | Bouton désactivé en majuscules grises, champs Material « fill » | Aspect daté, bouton qui ne dit pas pourquoi il est inactif | Bouton actif, validation au moment de l'envoi, messages sous les champs | P2 |
| Compte (étudiant) | Champ « Discord ID » avec un avertissement rouge, visible par un étudiant | Information technique exposée | Réservé aux rôles concernés, dans une section avancée | P3 |
| Création d'activité | Assistant en quatre étapes ; la première n'est qu'un bouton isolé | Parcours long pour une action hebdomadaire | Création en un panneau : section, exercice ou activité, type, dates ; aperçu à droite | P2 |

## États : vide, chargement, erreur

| Où | Constat | Effet | Proposition | Priorité |
| --- | --- | --- | --- | --- |
| Cours de démonstration | Erreur 500 sur les activités affichée comme « Ce cours ne contient aucune section » | L'étudiant croit qu'il n'y a rien | État d'erreur distinct, avec « Réessayer » | P1 |
| Lecteur d'activité fermée | Page entièrement blanche après une erreur 500 | Blocage total | État d'erreur du lecteur (le composant `player-error` existe) | P1 |
| Challenges | Squelette de chargement qui ne se termine jamais | Attente sans fin | Délai, puis état d'erreur | P1 |
| Prévisualisation d'exercice | Squelette infini quand l'exécution ne répond pas | L'autrice ne sait pas si c'est son code ou la plateforme | Délai, message qui distingue erreur d'exercice et indisponibilité du service | P1 |
| Corrections en attente | Zone blanche sous les onglets | On ne sait pas si c'est vide ou en panne | État vide qui dit quand des corrections arriveront | P2 |
| Listes | Illustration « boîte » grise générique, message de recherche (« Vérifiez les termes de votre recherche ») même sans recherche | Message faux quand la liste est vide par nature | Distinguer « rien encore » et « aucun résultat pour cette recherche » | P2 |

## Lecteur d'activité (étudiant)

| Où | Constat | Effet | Proposition | Priorité |
| --- | --- | --- | --- | --- |
| Conclusion d'activité | Tableau « Résumé » avec l'identifiant de session (UUID) | Donnée technique sans valeur pour l'étudiant | Résumé humain : durée, exercices réussis, note si disponible | P2 |
| Conclusion | Contenu « .... » | Contenu de remplissage visible | Masquer une conclusion vide | P3 |
| Mise en page | Titre dans une carte, puis cartes dans une carte, tout centré | Lecture difficile, poids visuel mal réparti | Une surface « copie » : énoncé et réponse sur une même feuille, alignés à gauche | P2 |
| Code de déblocage | Six cases dans un encadré orange, consigne en orange | Ressemble à une alerte | Étape d'accès claire : pourquoi, à qui demander, saisie au clavier et collage | P2 |

## Microcopie et langue

| Où | Constat | Proposition | Priorité |
| --- | --- | --- | --- |
| Administration | « Status », « Active » | « Statut », « Actif » | P2 |
| Compte | « A propos », « faîtes » | « À propos », « faites » | P3 |
| Tableau de bord étudiant | « Temps d'apprentissage estimée » | « Temps d'apprentissage estimé » | P3 |
| Charte des ressources | Tirets longs dans la liste des droits, « A condition » | Deux-points et virgules, « À condition » | P3 |
| Titres | Casse anglaise (« Suivi de l'État des Ressources ») | Casse de phrase partout | P3 |
| Général | Majuscules sans accent, espaces avant la ponctuation haute incohérentes | Accents sur les capitales, espace insécable avant `: ; ! ?` | P3 |

## Accessibilité

| Où | Constat | Proposition | Priorité |
| --- | --- | --- | --- |
| Éditeur | Titre gris foncé sur fond noir | Contraste d'au moins 4,5:1 | P1 |
| Boutons à icône seule (barre supérieure, cartes) | Pas de libellé visible, infobulle seulement au survol | Libellé accessible sur chaque bouton, libellé visible pour les actions principales | P2 |
| Cartes de cours | L'avancement passe par la couleur du badge | Texte explicite en plus de la couleur | P2 |
| Focus clavier | Styles de focus hérités de deux bibliothèques, inégaux | Anneau de focus unique, visible sur tout élément interactif | P2 |

## Bugs relevés pendant l'exploration

Ces points sont des défauts de fonctionnement, à traiter indépendamment de la refonte.

| Bug | Où | Détail |
| --- | --- | --- |
| Le libellé « Élève » enregistre le rôle enseignant | `apps/web/src/app/pages/admin/users/users.page.ts` (vers la ligne 68) | Le formulaire d'un utilisateur associe « Élève » à `UserRoles.teacher` |
| Pourcentages de l'anneau des statuts à 0 % | Vue d'ensemble d'un cercle | La légende affiche « (0%) » pour chaque statut, avec des effectifs non nuls |
| Erreur 500 sur la liste des activités | `ActivityService.addVirtualColumns` | Plante sur une activité dont la structure de variables est ancienne au lieu de l'ignorer ou de la signaler |
| Erreur 500 sur les résultats d'une session | `extractExercisesFromActivityVariables` (appelé par `DashboardService.ofSession`) | Même cause, même absence de garde |
| Accueil vide pour le rôle démo | `pages/dashboard/overview/overview.page.ts` | Le rôle démo n'est traité ni comme étudiant ni comme enseignant |
| Cadre rouge admin permanent | `apps/web/src/app/app.page.html` | Comportement voulu, mais à remplacer (voir la navigation) |

Les deux erreurs 500 ont été rencontrées sur des données au format de 2024 (dump de développement).
Elles montrent tout de même qu'une activité mal formée casse l'écran entier au lieu d'être
isolée.
