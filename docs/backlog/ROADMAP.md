# Roadmap

> Mise à jour : 2026-10-09. Wireframes : [`design/flows`](../../design/flows). Décisions :
> [DECISIONS.md](./DECISIONS.md). Standard : [README.md](./README.md).

## Où on en est

Les wireframes sont faits pour tous les parcours (accueils, cours, activité, lecteur, corrections,
ressources, création, tests, administration, compte, annonces), avec la direction, l'audit et la
faisabilité dans [`design/docs`](../../design/docs). Côté code, le socle du basculement est livré
(phase S : choix au démarrage, styles et providers séparés, pont, proposition d'essai), puis les
fondations (phase F : bibliothèque `@platon/design-system` et Storybook, tokens clair et sombre,
polices et icônes, garde-fous `yarn lint:design`, dialogues et thème). Les wireframes ont été repris
après quatre tours de critique (154 écrans, règles communes, glyphes d'état, données de référence
dans `design/docs/09-donnees.md`). Dans la phase C, la session, le gabarit de page et ses états sont
livrés, puis la couverture et le cadre mobile ; les notifications sont prêtes à coder, leurs points
ouverts tranchés. La nouvelle interface n'a encore que son accueil provisoire.

## Où on atterrit

Une personne peut choisir la nouvelle interface et faire tout son travail dedans, sans jamais
tomber sur une page de l'ancienne. Puis la nouvelle devient le défaut, puis l'ancienne disparaît,
avec Material et ng-zorro.

## Ordre

**S** d'abord : le mécanisme de bascule doit exister et marcher avec une nouvelle interface presque
vide, qui renvoie tout vers l'ancienne par le pont. Puis **F**, les fondations du design system.
Puis **C**, le cadre, parce que chaque écran s'y affiche. Ensuite les parcours dans l'ordre où ils
servent le plus de monde : **A** (accueils), **K** (cours), **R** (ressources et création),
**L** (lecteur et corrections), **T** (tests d'entrée), **G** (administration et compte). **X**
enfin, la bascule.

Chaque écran livré sort du pont ; tant qu'un écran n'est pas livré, le pont l'ouvre dans l'ancienne
interface.

Statuts : `À faire`, `À écrire` (le ticket n'est pas encore rédigé), `En cours`, `Livré (date)`,
`Retiré (date)`. Un ticket ne démarre que si ses dépendances sont livrées.

## Phase S : le socle du basculement

| Ticket                                                               | Titre                                                                                          | Dépend de  | Taille | Statut             |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------- | ------ | ------------------ |
| [S-01](./done/S-01-choisir-l-interface-au-demarrage.md)              | Choisir l'interface au démarrage                                                               | aucun      | M      | Livré (2026-09-28) |
| [S-02](./done/S-02-separer-les-styles-par-interface.md)              | Séparer les styles par interface                                                               | S-01       | M      | Livré (2026-09-28) |
| [S-03](./done/S-03-isoler-les-providers-de-l-ancienne-interface.md)  | Isoler les providers de l'ancienne interface                                                   | S-01       | S      | Livré (2026-09-28) |
| [S-04](./done/S-04-le-pont-vers-l-ancienne-interface.md)             | Le pont vers l'ancienne interface                                                              | S-01       | M      | Livré (2026-09-28) |
| [S-05](./done/S-05-proposer-la-nouvelle-interface.md)                | Proposer la nouvelle interface, et en revenir                                                  | S-04       | S      | Livré (2026-09-28) |
| [S-06](./done/S-06-revenir-a-la-nouvelle-interface-apres-le-pont.md) | Ramener vers la nouvelle interface les écrans portés ouverts depuis l'ancienne (après le pont) | S-04, C-06 | S      | Livré (2026-10-08) |
| [S-07](./done/S-07-ecran-de-chargement.md)                           | Écran de chargement                                                                            | S-02       | S      | Livré (2026-09-29) |

## Phase F : les fondations du design system

| Ticket                                                  | Titre                                                   | Dépend de  | Taille | Statut             |
| ------------------------------------------------------- | ------------------------------------------------------- | ---------- | ------ | ------------------ |
| [F-01](./done/F-01-la-bibliotheque-et-storybook.md)     | La bibliothèque `@platon/design-system` et Storybook    | aucun      | M      | Livré (2026-09-29) |
| [F-02](./done/F-02-tokens-polices-et-icones.md)         | Tokens, polices et icônes                               | F-01, S-02 | M      | Livré (2026-09-29) |
| [F-03](./done/F-03-les-frontieres-et-les-garde-fous.md) | Les frontières et les garde-fous                        | F-01       | S      | Livré (2026-09-29) |
| [F-04](./done/F-04-les-ports-transverses.md)            | Les ports transverses : dialogues, notifications, thème | F-02, S-03 | M      | Livré (2026-09-29) |

## Phase C : le cadre

Ordre : C-01, C-07, C-06, C-05, C-02, C-03 et C-04 (livrés), puis C-08, qui remplace GraphQL par
REST et SSE (D33). C-07 aligne ce qui est livré sur les wireframes révisés après quatre tours de
critique. Les points ouverts de C-02 à C-05 sont tranchés (D22 à D30, 2026-10-08).

| Ticket                                                             | Titre                                                                                       | Dépend de        | Taille | Statut             |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------- | ------ | ------------------ |
| [C-01](./done/C-01-boutons-menus-bulles-avatar-badges.md)          | Boutons, menus, bulles, avatar, badges et choix segmenté                                    | F-02             | M      | Livré (2026-09-29) |
| [C-07](./done/C-07-aligner-f04-et-c01-sur-la-direction-revisee.md) | Aligner F-04 et C-01 sur la direction révisée                                               | C-01, F-04       | M      | Livré (2026-10-08) |
| [C-06](./done/C-06-la-session-dans-la-nouvelle-interface.md)       | La session : authentification, utilisateur courant, GraphQL                                 | F-04             | M      | Livré (2026-10-08) |
| [C-05](./done/C-05-le-gabarit-de-page.md)                          | Le gabarit de page : en-tête, onglets, états (vide, chargement, erreur)                     | C-01, C-07       | M      | Livré (2026-10-08) |
| [C-02](./done/C-02-la-couverture.md)                               | La couverture : navigation par rôle, intercalaire, Créer, profil, mention du logiciel libre | C-01, C-06, C-07 | L      | Livré (2026-10-08) |
| [C-03](./done/C-03-le-cadre-mobile.md)                             | Le cadre mobile : barre haute et panneau                                                    | C-02             | M      | Livré (2026-10-09) |
| [C-04](./done/C-04-le-panneau-des-notifications.md)                | Le panneau des notifications                                                                | C-02, C-06, F-04 | M      | Livré (2026-10-09) |
| [C-08](./C-08-le-temps-reel-en-sse-sans-graphql.md)                | Le temps réel en SSE, sans GraphQL                                                          | C-04             | L      | À faire            |

## Phase A : les accueils

| Ticket | Titre                                                                     | Dépend de | Taille | Statut   |
| ------ | ------------------------------------------------------------------------- | --------- | ------ | -------- |
| A-01   | Accueil élève : À faire, Bientôt, Résultats récents, bandeau d'annonce    | C-05      | L      | À écrire |
| A-02   | Accueil enseignant : En cours, À corriger, À préparer, Partir d'un modèle | C-05      | L      | À écrire |
| A-03   | La page Annonces                                                          | C-05      | S      | À écrire |
| A-04   | Point d'API `activities/mine` si l'agrégation côté client est trop lente  | A-01      | M      | À écrire |

## Phase K : les cours

| Ticket | Titre                                                             | Dépend de | Taille | Statut   |
| ------ | ----------------------------------------------------------------- | --------- | ------ | -------- |
| K-01   | La liste des cours (classeurs)                                    | C-05      | M      | À écrire |
| K-02   | La page d'un cours : vue d'ensemble, sections, À faire, état neuf | K-01      | L      | À écrire |
| K-03   | Membres et groupes                                                | K-02      | M      | À écrire |
| K-04   | Challenges et paramètres du cours                                 | K-02      | M      | À écrire |
| K-05   | Le panneau de réglage d'une activité                              | K-02      | L      | À écrire |
| K-06   | Ajouter une activité, et la composer avec des exercices           | K-02      | L      | À écrire |
| K-07   | Le suivi d'une activité : statistiques, apprenants, modération    | K-02      | L      | À écrire |

## Phase R : les ressources et la création

| Ticket | Titre                                           | Dépend de  | Taille | Statut   |
| ------ | ----------------------------------------------- | ---------- | ------ | -------- |
| R-01   | Le catalogue et ses filtres                     | C-05       | L      | À écrire |
| R-02   | La page d'une ressource et ses quatre onglets   | R-01       | L      | À écrire |
| R-03   | La page d'un cercle et ses collaborateurs       | R-02       | M      | À écrire |
| R-04   | La galerie des modèles                          | R-01       | M      | À écrire |
| R-05   | L'atelier (builder) et l'enregistrement         | R-04       | L      | À écrire |
| R-06   | Ajouter un exercice à un cours depuis l'atelier | R-05, K-06 | M      | À écrire |
| R-07   | Nouvelle ressource en PLE (formulaire unique)   | R-01       | S      | À écrire |

## Phase L : le lecteur et les corrections

| Ticket | Titre                                                              | Dépend de | Taille | Statut   |
| ------ | ------------------------------------------------------------------ | --------- | ------ | -------- |
| L-01   | La copie et sa marge (surface de réponse)                          | F-02      | L      | À écrire |
| L-02   | Le lecteur d'activité : introduction, exercice, conclusion, sortie | L-01      | L      | À écrire |
| L-03   | Les web components d'exercice dans la nouvelle interface           | L-01      | L      | À écrire |
| L-04   | La file de correction et la copie à corriger                       | L-01      | L      | À écrire |

## Phase T : les tests d'entrée

| Ticket | Titre                              | Dépend de | Taille | Statut   |
| ------ | ---------------------------------- | --------- | ------ | -------- |
| T-01   | La page d'un test et ses candidats | C-05      | M      | À écrire |
| T-02   | L'accueil du candidat              | L-02      | M      | À écrire |

## Phase G : l'administration et le compte

| Ticket                              | Titre                                    | Dépend de  | Taille | Statut             |
| ----------------------------------- | ---------------------------------------- | ---------- | ------ | ------------------ |
| G-01                                | Utilisateurs et groupes de la plateforme | C-05       | M      | À écrire           |
| G-02                                | LMS, CAS, tags, annonces                 | G-01       | M      | À écrire           |
| G-03                                | Mon compte : À propos, Sécurité          | C-05       | S      | À écrire           |
| [G-04](./done/G-04-la-connexion.md) | La connexion                             | F-02, C-06 | L      | Livré (2026-10-09) |

## Phase X : la bascule

| Ticket | Titre                                                                 | Dépend de              | Taille | Statut   |
| ------ | --------------------------------------------------------------------- | ---------------------- | ------ | -------- |
| X-01   | Palier 1, proposition aux volontaires (`platon-ui-next` à `opt-in`)   | S-05, C-02, A-01, A-02 | S      | À écrire |
| X-02   | Palier 2, la nouvelle interface par défaut, avec retour possible      | tous les écrans hors L | S      | À écrire |
| X-03   | Palier 3, retrait de l'ancienne interface, de Material et de ng-zorro | X-02, phase L          | L      | À écrire |

### Critères de passage

- **Palier 1** : le cadre et les deux accueils sont livrés ; tout le reste passe par le pont sans
  erreur ; revenir à l'ancienne interface marche en un clic.
- **Palier 2** : plus aucun écran d'enseignant ou d'élève ne passe par le pont, hors lecteur ;
  deux semaines de palier 1 sans défaut bloquant.
- **Palier 3** : le lecteur et les corrections sont livrés ; plus aucun passage par le pont en
  un mois de palier 2.

## Bugs de l'interface actuelle

Suivis à part dans [`design/docs/08-bugs.md`](../../design/docs/08-bugs.md). Ils se corrigent
dans l'ancienne interface tant qu'elle sert, et la nouvelle ne les reproduit pas.
