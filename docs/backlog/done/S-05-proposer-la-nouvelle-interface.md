# S-05 : Proposer la nouvelle interface, et en revenir

Source : stratégie de code du 2026-09-28 ; décisions : D4, D5, D13, D15.
Statut : Livré (2026-09-28).
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

- [x] Essayer et revenir, dans les deux sens, à la même adresse.
- [x] Le bandeau fermé ne revient pas.

> **Amendement à la livraison.** La proposition ne s'adresse qu'aux personnes sans préférence :
> celle qui a choisi « Revenir à l'interface actuelle » n'est plus sollicitée. « Connectée » veut dire
> sur une page du cadre, toutes protégées par la garde d'authentification : aucun appel d'API de plus.
> Textes : « PLaTon a une nouvelle interface. Essayez-la, vous pourrez revenir à celle-ci à tout
> moment. », « Essayer la nouvelle interface », « Non merci ». Carte sombre aux couleurs de la
> nouvelle identité, contrastes AA, animation coupée par `prefers-reduced-motion`.

> **Amendement à la livraison.** « Revenir à l'interface actuelle » est sur l'accueil de la coquille
> ; il passera dans le menu du profil avec C-02. Tant qu'aucun écran n'est porté, « Essayer » arrive
> sur le pont : attendu, le drapeau reste `off` jusqu'au palier 1 (X-01).

> **Vérification.** Dans Chrome, connecté avec le drapeau `opt-in` : la proposition s'affiche,
> « Essayer » garde l'adresse et enregistre la préférence, « Non merci » ne revient pas ; drapeau
> `off` : rien ; déconnecté : rien sur la page de connexion.
