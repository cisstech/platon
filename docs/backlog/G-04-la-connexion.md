# G-04 : La connexion

Source : `design/flows/connexion` (bureau et téléphone, chargement, erreur) et ses annotations ;
`design/spec/flows/connexion.md` ; inventaire du code du 2026-10-09 ; décisions : D2, D3, D6, D24,
D26, D30.
Statut : À faire.
Dépend de : F-02, C-06.
Taille : L.

## 1. Comportement attendu

- Étant donné une personne sans session qui a choisi la nouvelle interface, quand elle arrive sur
  `/login` (directement, renvoyée par la garde de session ou après sa déconnexion), alors la nouvelle
  page s'affiche, hors du cadre : la couverture sombre à gauche (en haut sur un téléphone) porte la
  phrase d'accroche en titre, la présentation de PLaTon et de l'établissement et le lien « Voir la
  présentation, 2 min » ; la page porte « Se connecter » et le formulaire. Un lien d'évitement mène
  au formulaire.
- Étant donné les CAS déclarés, alors le premier bouton, principal, ouvre la connexion de
  l'établissement ; « ou avec un compte PLaTon » le sépare du formulaire. Sans CAS, ni bouton ni
  séparateur.
- Étant donné le formulaire, quand on l'envoie, alors le bouton garde sa place et sa taille et dit
  « Connexion en cours », le bouton de l'établissement est atténué et la zone de message annonce
  l'attente ; avant l'envoi, le bouton reste actif et rien n'est validé.
- Étant donné des identifiants refusés, alors la zone sous le mot de passe dit « Nom d'utilisateur ou
  mot de passe incorrect. Compte université ? Passez par le bouton du haut. », les deux champs sont
  marqués invalides et le focus va au mot de passe ; rien ne bouge. Une panne de PLaTon ou du réseau
  a son propre message, qui dit laquelle.
- Étant donné le mot de passe, alors « Afficher le mot de passe » le montre ou le cache, et le
  bouton dit son état ; « Mot de passe oublié ? » reste à droite de l'étiquette (point ouvert 1).
- Étant donné une connexion réussie, alors la personne arrive sur `next`, ou sur l'accueil, sans
  entrée d'historique : un écran porté s'ouvre dans la nouvelle interface, un autre par le pont.
- Étant donné `/login?access-token=…&refresh-token=…&next=…` (LTI, CAS, invitation d'un candidat),
  alors la page connecte sans formulaire et mène à `next` ; si le jeton est refusé, elle le dit et
  montre le formulaire.
- Étant donné une session déjà ouverte, alors `/login` mène à `next`, ou à l'accueil.
- Étant donné un échec du CAS, alors l'API ramène à `/login` avec un code que la page traduit, au
  lieu d'une erreur JSON (B24) ; `next` arrive encodé, et absent quand il manque.
- Étant donné une adresse, alors elle garde son sens dans les deux interfaces (D3) : `/login`, `next`,
  `access-token`, `refresh-token`, `callbackUrl`, `callbackTitle`. `/login/no-account` et l'étape
  d'application externe (`callbackUrl`) restent dans l'interface actuelle, par le pont.

## 2. Tests à écrire d'abord

- Fonctions de vue : les boutons d'établissement (aucun, un, plusieurs), le message selon l'échec
  (identifiants, jeton, CAS, panne, hors connexion), la cible après connexion (`next` absent,
  `undefined`, ou commençant par `/login`).
- Store de la page : connexion par le formulaire (succès, refus, panne), par jeton dans l'adresse,
  session déjà ouverte, états chargement et erreur.
- `Session` : une connexion remplace l'utilisateur gardé ; après un refus de la garde, la connexion
  ouvre l'écran demandé.
- Route `/login` : servie par la nouvelle interface, hors du cadre et sans garde de session ;
  `callbackUrl` passe par le pont ; `ported-paths`, `next.routes.spec` et le retour après le pont
  suivent.
- Design system : le champ (étiquette, aide, erreur reliée par `aria-describedby`, `aria-invalid`), le
  mot de passe et sa bascule, le gabarit couverture et page ; stories au bureau et au téléphone, en
  clair et en sombre, au repos, en chargement et en erreur.
- API : l'échec du CAS redirige vers `/login` avec son code ; `next` encodé et omis quand il manque
  (contrôleur CAS, intergiciel LTI) ; une même réponse pour un compte inconnu et un mauvais mot de
  passe (point ouvert 5).

## 3. État actuel du code

Vérifié le 2026-10-09.

- Page actuelle : `/login` (`apps/web/src/app/app.routes.ts:11-22`, `pages/login/`), Material et
  ng-zorro : `AuthSignInComponent` (`libs/core/browser/src/lib/auth/components/sign-in/`) et
  `CasSignInComponent` (`libs/feature/cas/browser`), une vidéo de l'Université Gustave Eiffel en dur.
  Toute erreur donne la même boîte « Une erreur est survenue lors de la connexion ! ». Elle connecte
  aussi par jeton dans l'adresse, propose « Continuer en tant que … » à une session ouverte, et
  l'étape `callbackUrl` d'une application externe. `/login/no-account` reçoit les comptes CAS
  inconnus. Aucun test.
- API : `POST /api/v1/auth/signin` (public) répond 404 « User not found » ou 400 « Password is
  incorrect » ; aucune limite de tentatives (B23) ; l'état actif du compte n'est pas vérifié à la
  connexion (les gardes du navigateur s'en chargent). CAS : `GET /api/v1/cas/casnames` ne donne que
  des noms techniques ; `GET /api/v1/cas/login/:casname` redirige vers le CAS puis vers
  `/login?access-token=…`, ou finit sur une erreur JSON (B24). LTI redirige aussi vers `/login`.
- Nouvelle interface : `sessionGuard` renvoie vers `/login?next=…` ; `Session.load()` garde sa
  promesse, `undefined` compris, et n'a pas de connexion ; `/login` passe par le pont (route `**`) et
  le retour après le pont (S-06) ramène à la nouvelle interface. `isPorted` compare des chemins
  exacts ; `next.routes.spec` ne lit que les routes du cadre.
- Entrées légères : `AuthService` et `TokenService` sont dans `@platon/core/browser/shared` ; le CAS
  n'a pas d'entrée légère, et `CAS_PROVIDERS` n'est fourni que par l'interface actuelle.
- Design system : aucun champ de saisie ; `plButton` a son état de chargement, `plSkipLink` existe, et
  les icônes `school`, `visibility`, `visibility_off`, `play_arrow` et `error` aussi.

## 4. Changements

- API : le CAS redirige vers `/login?error=…` à l'échec, encode `next` et l'omet quand il manque ;
  l'intergiciel LTI encode `next` ; la connexion répond pareil pour un compte inconnu et un mauvais mot
  de passe (point ouvert 5).
- Entrées légères : `@platon/feature/cas/browser/shared` (`CasService`, `CAS_PROVIDERS`).
- Design system : le champ de saisie et le mot de passe avec sa bascule ; le gabarit de connexion,
  couverture et page.
- Nouvelle interface : `pages/login/` (page, store, fonctions de vue) ; la route `/login` hors du
  cadre ; `Session.signIn` et l'oubli de l'utilisateur gardé ; `/login` dans `ported-paths` ; la
  balise de la présentation (point ouvert 3).
- Interface actuelle : rien, sinon ses tests qui disaient `/login` non porté.
- Règles : `front/new-interface.md` admet une route portée hors du cadre.

## 5. Hors scope

La création de compte, la réinitialisation du mot de passe par courriel (aucun service d'envoi),
`/login/no-account`, l'étape d'application externe, la limite de tentatives (B23), la déconnexion
côté serveur, un libellé d'affichage par CAS (G-02).

## 6. Points ouverts

1. « Mot de passe oublié ? » : aucun parcours n'existe ; les comptes à mot de passe sont créés par
   l'administration. Proposé : le lien mène à l'aide (`/docs/main/overview/login`), qui dit à qui
   s'adresser.
2. Le bouton de l'établissement : l'API ne donne que des noms techniques. Proposé : un CAS,
   « Continuer avec le compte université » ; plusieurs, un bouton « Continuer avec <nom> » chacun ;
   un libellé par CAS viendra avec G-02.
3. « Voir la présentation, 2 min » : l'adresse dépend de l'établissement. Proposé : une balise
   `<meta name="platon-presentation">`, lue comme `platon-institution` (D24) ; sans elle, pas de lien.
4. La couverture sans établissement (balise vide) : proposé, « PLaTon est une plateforme
   d'exercices. … » et un pied sans nom d'établissement.
5. Un compte inconnu et un mauvais mot de passe : l'API les distingue et dit ainsi quels comptes
   existent. Proposé : une même réponse 400, que l'interface actuelle affiche déjà par un message
   unique.
6. Le thème : l'interface actuelle force le clair sur la connexion. Proposé : la nouvelle page suit le
   thème choisi, la couverture reste sombre dans les deux.
7. Une session déjà ouverte : proposé, aller directement à `next` ; « Continuer en tant que … »
   disparaît, sauf avec `callbackUrl`, qui passe par le pont.

## 7. Definition of Done

- [ ] Les tests du §2 passent.
- [ ] Les connexions par mot de passe, par CAS, par LTI et par invitation de candidat mènent au bon
      écran, dans la nouvelle interface ou par le pont.
- [ ] Les captures au bureau et au téléphone, en clair et en sombre, au repos, en chargement et en
      erreur, comparées au wireframe ; aucune violation axe.
- [ ] Le démarrage de la nouvelle interface reste sans code ng-zorro, Material ni Monaco.
