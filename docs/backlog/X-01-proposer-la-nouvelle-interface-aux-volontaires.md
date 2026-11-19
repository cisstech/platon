# X-01 : Palier 1, proposer la nouvelle interface aux volontaires

Source : `docs/backlog/ROADMAP.md` (phase X, critères de passage du palier 1) ; S-05 (la proposition)
et S-04, S-06 (le pont) ; décisions : D4, D5, D13, D41.
Statut : À faire.
Dépend de : S-05, C-02, A-01, A-02, et la mise en production de la pile #116 à #124.
Taille : S.

## 1. Comportement attendu

- Étant donné une instance dont le drapeau `platon-ui-next` vaut `opt-in`, quand une personne
  connectée qui n'a pas encore choisi ouvre une page de l'interface actuelle, alors l'avis de S-05 lui
  propose la nouvelle interface (« Essayer la nouvelle interface », « Non merci »), quel que soit son
  rôle.
- Étant donné une personne qui essaie, alors elle arrive sur son accueil, d'élève ou d'enseignant ;
  chaque écran pas encore porté s'ouvre dans l'interface actuelle par le pont, en un seul
  rechargement, avec l'avis « Cette page n'existe pas encore dans la nouvelle interface » et son lien
  de retour.
- Étant donné une personne dans la nouvelle interface, alors « Revenir à l'interface actuelle », dans
  le menu du profil (la feuille du profil sur téléphone), la ramène à la même adresse dans l'interface
  actuelle, qui devient sa préférence ; la proposition ne revient plus.
- Étant donné le drapeau `off`, rien ne change pour personne, et `?ui=next` reste possible (D5).

## 2. Tests à écrire d'abord

- La passe du pont : chaque entrée de la couverture et du menu du profil, et chaque lien des deux
  accueils, ouvre son écran dans l'interface actuelle sans erreur ni écran blanc, puis « Revenir à la
  nouvelle interface » ramène à l'accueil. Sur le monde de démonstration (`dumps/local`), en élève,
  en enseignant, en correcteur et en administrateur, sur ordinateur et sur téléphone. C'est une passe
  dans Chrome sur l'app lancée, pas un test de CI : la CI ne lance pas l'app. Aucun code ne change :
  pas de test unitaire nouveau.

## 3. État actuel du code

Vérifié le 2026-10-12.

- Drapeau : `<meta name="platon-ui-next" content="off">` dans `apps/web/src/index.html`, lu par
  `readUiFlag` (`apps/web/src/ui-switch/ui-flag.ts`). `resolveUiMode` (`ui-switch/ui-mode.ts`)
  retient le paramètre `?ui=`, puis la préférence du navigateur, puis le drapeau.
- Proposition : `apps/web/src/app/ui-switch/ui-switch-notice.vm.ts` la montre à toute personne
  connectée sans préférence, sur les pages du cadre, jamais dans le lecteur, l'éditeur, l'atelier, la
  connexion ni les pages candidat. « Non merci » la ferme pour ce navigateur. Aucun filtre de rôle.
- Retour : le menu et la feuille du profil de la nouvelle interface (A-02), vers `?ui=legacy`.
- Pont : `legacyBridgeGuard` et `?ui=legacy-once` (S-04), l'avis de retour (S-06).
- Écrans portés : la connexion (G-04) et l'accueil (A-01, A-02). Tout le reste passe par le pont.
- Mesure : aucune. La préférence vit dans le navigateur ; le serveur ne la voit pas.
- Avis : aucun canal dans la nouvelle interface.
- Déploiement : l'image nginx sert les fichiers extraits de l'image de build (`build-release.yml`,
  `docker-compose.prod.yml`) ; le drapeau se change dans le `index.html` déployé.

## 4. Changements

Aucun code : la proposition, le pont et le retour existent. Côté développement, il reste la passe du
pont (§ 2). Le reste est de l'exploitation, faite par l'équipe de l'instance une fois la pile en
production : passer `platon-ui-next` à `opt-in` dans le `index.html` déployé, et publier une
annonce depuis l'administration.

## 5. Hors scope

Le palier 2 (X-02) ; tout nouvel écran ; les bugs de l'interface actuelle
(`design/docs/08-bugs.md`), qui s'y corrigent à part.

La mesure et le recueil des avis : pas pour ce palier (points n° 2 et 3, tranchés le 2026-10-12). Deux
idées restent prêtes, à reprendre à tout moment, sans rien changer d'autre :

- Mesurer : enregistrer côté serveur chaque choix d'interface (essayer, revenir, refuser la
  proposition), avec la personne, son rôle, le choix et la date ; une requête d'abord, un écran
  d'administration avec G-02.
- Recueillir les avis : une entrée « Donner votre avis » dans le menu et la feuille du profil, vers
  l'adresse d'un `<meta name="platon-feedback">` du `index.html` déployé (formulaire, courriel ou
  ticket), absente quand elle est vide, comme `platon-institution`.

## 6. Points ouverts

1. À qui proposer. Tranché le 2026-10-12 : à tout le monde, comme la proposition de S-05 le fait
   déjà, sans filtre de rôle.
2. Mesurer. Tranché le 2026-10-12 : pas de mesure pour ce palier ; l'idée reste au § 5.
3. Recueillir les avis. Tranché le 2026-10-12 : pas de canal d'avis pour ce palier ; l'idée reste au
   § 5.
4. L'instance et le moment. Tranché le 2026-10-12 : l'équipe de l'instance choisit, une fois la pile
   fusionnée sur `main` et mise en production.
5. Annoncer. Tranché le 2026-10-12 : l'équipe de l'instance publie l'annonce depuis l'administration ;
   le bandeau des accueils la montre.

## 7. Definition of Done

- [x] La passe du pont verte sur le monde de démonstration : quatre rôles, ordinateur et téléphone.
- [ ] La pile #116 à #124 fusionnée sur `main`.
- [ ] Côté exploitation, hors de ce dépôt : le drapeau à `opt-in` et l'annonce publiés sur
      l'instance.

> **Passe du pont, le 2026-10-12.**
>
> - Faite dans Chrome sur l'app de développement, avec le monde de démonstration, en élève (Inès),
>   en enseignant (Karim), en correcteur (Julien) et en administrateur (ypicker), sur ordinateur et
>   sur téléphone.
> - Chaque entrée de la couverture et du profil, et chaque lien des accueils, ouvre son écran dans
>   l'interface actuelle avec l'avis du pont, et « Revenir à la nouvelle interface » ramène à l'accueil.
>   Le lecteur et la correction s'ouvrent en plein écran, sans avis, comme prévu.
> - Les lignes « Commencer » n'ont pas été ouvertes : l'interface actuelle crée une copie dès
>   l'ouverture du lecteur, avant même de commencer.
> - Les échecs des passes complètes venaient du serveur de développement surchargé (« 504 Gateway
>   Time-out » de nginx, morceaux de l'app non chargés, icônes ng-zorro non téléchargées). Chaque lien
>   en échec, rejoué seul, passe.
> - La documentation (`/docs`) répond 502 en local : son site n'est pas lancé en développement. Elle
>   s'ouvre dans un nouvel onglet, hors du pont.

> **Défaut trouvé en chemin.** L'écran de démarrage (S-07, `apps/web/src/index.html`) a des couleurs
> fixes, pensées pour un fond clair, et pas de variante sombre. Quand le système est en thème sombre, la
> feuille de styles de l'interface, chargée en même temps, assombrit le fond : « Chargement de PLaTon »
> et « PLaTon n'a pas pu démarrer » deviennent presque illisibles. Corrigé par la PR #125 : une feuille
> de l'app, chargée seulement par la nouvelle interface, donne à l'écran les couleurs des tokens ;
> l'interface actuelle garde les siennes.
