# G-04 : La connexion

Source : `design/flows/connexion` (bureau et téléphone, chargement, erreur) et ses annotations ;
`design/spec/flows/connexion.md` ; inventaire du code du 2026-10-09 ; décisions : D2, D3, D6, D24,
D26, D30, D34.
Statut : Livré (2026-10-09).
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

Aucun : tranchés le 2026-10-09 par D34, sur les propositions suivantes.

1. « Mot de passe oublié ? » mène à l'aide (`/docs/main/overview/login`), qui dit à qui s'adresser.
2. Un CAS : « Continuer avec le compte université » ; plusieurs : un bouton « Continuer avec <nom> »
   chacun ; un libellé par CAS viendra avec G-02.
3. « Voir la présentation, 2 min » vient d'une balise `<meta name="platon-presentation">`, lue comme
   `platon-institution` (D24) ; sans elle, pas de lien.
4. Sans établissement, la couverture dit « PLaTon est une plateforme d'exercices. … », et son pied
   ne nomme pas d'établissement.
5. L'API répond pareil (400) à un compte inconnu et à un mauvais mot de passe.
6. La page suit le thème choisi ; sa couverture reste sombre dans les deux.
7. Une session déjà ouverte va directement à `next` ; `callbackUrl` passe par le pont.

## 7. Definition of Done

- [x] Les tests du §2 passent.
- [x] Les connexions par mot de passe, par CAS, par LTI et par invitation de candidat mènent au bon
      écran, dans la nouvelle interface ou par le pont.
- [x] Les captures au bureau et au téléphone, en clair et en sombre, au repos, en chargement et en
      erreur, comparées au wireframe ; aucune violation axe.
- [x] Le démarrage de la nouvelle interface reste sans code ng-zorro, Material ni Monaco.

> **Amendement à la livraison.** API : un compte inconnu, un compte sans mot de passe et un mauvais
> mot de passe reçoivent la même réponse 400, dans le même temps (une comparaison bcrypt contre un
> leurre). La connexion par CAS passe dans `CasService.signIn`, qui rend un résultat (connecté, sans
> compte, échec) que le contrôleur traduit en redirection : tout échec, CAS inconnu, ticket refusé,
> fournisseur injoignable, réponse vide ou base indisponible, ramène à `/login?error=cas`.
> L'adresse de service part encodée vers le CAS et reste la même au retour : un `next` avec `&`
> faisait refuser le ticket. `https` écrit en dur dans l'adresse de service reste (B24) ; la limite de
> tentatives aussi (B23). L'intergiciel LTI n'écrit plus les jetons dans le journal. L'adresse de
> connexion et ses paramètres sont définis une fois, dans `@platon/core/common` (`signInUrl`,
> `signInFailureUrl`, `SIGN_IN_PARAMS`) ; le CAS a `CAS_SIGN_IN_FAILED` et `casSignInUrl`.

> **Amendement à la livraison.** Nouvelle interface : `/login` est une route hors du cadre, servie
> sans garde de session. Sa garde laisse `callbackUrl` à l'interface actuelle, connecte avec les jetons
> de l'adresse puis ouvre `next` sans les garder dans l'historique (hors connexion, elle ne les
> dépense pas et le dit), et mène une session déjà ouverte à `next`. `next` ne mène jamais vers un
> autre site. `Session` gagne `signIn` et `signInWithToken` ; la déconnexion recharge `/login`, pour
> que rien de la personne ne reste en mémoire, stores du cadre compris. Le pont remplace l'entrée
> d'historique quand la navigation le demande. La balise `platon-presentation` donne le lien de
> présentation. La couverture est un `header`, la page un `main` que vise le lien d'évitement ; le
> titre de l'onglet est « Connexion à PLaTon ».

> **Amendement à la livraison.** Interface actuelle, contrairement au §4, deux corrections : le
> retour vers la nouvelle interface ignore la première navigation d'un chargement par le pont, sans
> quoi `/login?callbackUrl=…` rebouclait sans fin ; `AuthService.signOut` retire le jeton avant de
> naviguer, sans quoi le rechargement de `/login` pouvait couper sa suppression et laisser la personne
> connectée. Elle ne traduit pas `error=cas` : après un échec du CAS, son formulaire s'affiche sans
> message.

> **Amendement à la livraison.** La page : un échec de plus, « missing » (champs vides). Seul un 400
> vaut identifiants refusés ; le reste suit la règle des autres écrans, PLaTon qui ne répond pas ou
> l'appareil hors connexion. Les messages tiennent en deux lignes, le conseil à la ligne comme sur le
> wireframe. Après un envoi refusé, le focus va au champ à reprendre, que le message décrit ; un échec
> venu de l'adresse est lu à l'arrivée. La liste des CAS a son état : sa place est gardée pendant le
> chargement, et un échec le dit, avec « Réessayer ». Avec plusieurs CAS, seul le premier bouton est
> principal. L'établissement se lit « de l'Université … », « d'Aix-Marseille Université », « de
> Sorbonne Université ». Une panne pendant une connexion par jeton se lit encore comme un lien qui
> n'est plus valable : le service partagé avale l'erreur du chargement de l'utilisateur. Un candidat
> connecté sans `next` arrive sur l'accueil, puis sur `/403` ; l'invitation passe toujours `next`.
> Les textes « Étudiants : » et « les enseignants, les étudiants » sont ceux du wireframe.

> **Amendement à la livraison.** Bibliothèque : `pl-field`, `input[plInput]` (une directive, que le
> champ habille) et `button[plPasswordReveal]`, avec des cibles de 44 px au toucher. Le gabarit
> couverture et page n'y est pas : une seule page s'en sert, il vit dans la page. Le champ n'a pas
> d'aide, le wireframe n'en montre pas ; ses stories sont celles du bureau. La documentation dit
> désormais quoi faire d'un mot de passe oublié (`apps/docs/pages/main/overview/login.mdx`).

> **Amendement à la livraison.** Vérifié dans Chrome sur le build de production avec une API
> simulée, sans établissement et avec Aix-Marseille Université, un CAS puis deux, au bureau et au
> téléphone, en clair et en sombre, sans violation axe : lien d'évitement, champs vides, refus,
> affichage du mot de passe, chargement sans mouvement, connexion, déconnexion, jetons de l'adresse,
> échec du CAS. Une exécution du script a vu la page se recharger entre deux essais ; trois autres
> sont passées, sans le reproduire. Vérifié sur l'application lancée avec `ypicker` : la nouvelle
> page, le refus, la connexion, et la même réponse de l'API pour un compte inconnu. Non vérifié : un
> vrai CAS (aucun n'est configuré en local), un lancement LTI réel, Safari, un lecteur d'écran.
