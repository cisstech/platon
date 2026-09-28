# Direction : interactions et règles d'écran

`design.md` fixe les tokens et l'identité. Ce document fixe le comportement : comment on navigue,
comment un écran est construit, comment il répond à chaque action et dans chaque état.

## Principes

1. **L'action avant le chiffre.** Chaque écran d'accueil répond d'abord à « qu'est-ce que je dois
   faire maintenant ». Les statistiques viennent ensuite, et seulement celles qui aident à décider.
2. **Un état honnête.** Vide, chargement, erreur, succès : chacun a sa forme et son texte. Une
   erreur ne se fait jamais passer pour un contenu vide, un chargement a toujours une fin.
3. **La densité suit le travail.** Lire un énoncé demande de l'air (`reading`, 72 caractères par
   ligne). Parcourir trois cents copies demande de la densité (`body`, lignes de 44 px).
4. **La confiance aux moments qui comptent.** Examen, test d'entrée, correction, suppression : les
   règles sont affichées avant, l'enregistrement est confirmé pendant, la conclusion est nette après.
5. **Le même geste, la même forme.** Une action principale a toujours la même apparence et la même
   place. Un état a toujours la même couleur et le même mot.

## Modèle de navigation

Le cadre est la couverture et la page. À gauche, la **couverture** : une barre latérale sombre de
240 px, dans le prune du logo, repliable à 64 px. À droite, la **page**, claire. Il n'y a pas de
barre supérieure sur bureau : ce qui est global vit dans la couverture, et la page garde toute sa
hauteur. Pour ceux qui utilisent PLaTon aujourd'hui, la barre latérale reste violette et à la même
place ; ce qui change est ce qu'elle contient.

De haut en bas :

1. Le logo PLaTon, tel quel, et le nom de l'établissement
2. **Créer** (enseignants et administrateurs), bouton libellé qui ouvre un menu : cours,
   activité, exercice, et cercle pour les administrateurs
3. Navigation principale, selon le rôle. L'élément actif est un **intercalaire** : il prend la
   couleur de la page et la rejoint, comme l'onglet d'un classeur. On sait où l'on est sans lire.
4. En bas : Aide (documentation, tutoriels), Notifications avec compteur, profil (compte,
   progression, thème, déconnexion, et la mention « Administrateur » quand c'est le cas)

Navigation par rôle :

| Étudiant | Enseignant | Administrateur |
| --- | --- | --- |
| Accueil | Accueil | Accueil |
| Cours | Cours | Cours |
| Corrections, seulement si des copies lui sont assignées | Corrections, avec le nombre en attente | Corrections |
| | Ressources | Ressources |
| | Tests d'entrée, seulement s'il en a créé ou en surveille | Tests d'entrée |
| | | Administration |

« Espace de travail » devient **Ressources** : c'est ce que la page contient. Les annonces ne sont
plus une rubrique : la dernière annonce non lue apparaît en tête de l'accueil, et l'historique
reste sur sa page, atteignable depuis ce bandeau et depuis les notifications.

Sur mobile, une barre supérieure de 56 px, elle aussi dans la couverture, porte le bouton de menu,
le titre de la page et les notifications ; la couverture devient un panneau qui glisse depuis la
gauche.

## Connexion

La page de connexion est la couverture et la page côte à côte. La couverture porte le logo, une
phrase sur ce que fait PLaTon et un lien vers la vidéo de présentation. La page porte d'abord le
compte de l'établissement (CAS), puis le mot de passe local. Les étudiants qui arrivent de Moodle
ne la voient jamais ; elle le dit à ceux qui la voient par erreur.

## Gabarit de page

Chaque page de l'application suit le même en-tête :

1. Fil d'Ariane (`small`, `muted`), seulement à partir du deuxième niveau
2. Titre (`title`), aligné à gauche, avec l'action principale à droite sur la même ligne
3. Description éventuelle (`body`, `muted`), une ligne
4. Onglets de la page, collés au bas de l'en-tête

Largeurs : 1200 px au plus pour les listes et les tableaux de bord, 760 px pour les formulaires,
72 caractères pour les textes longs. Marges de page : 32 px sur bureau, 16 px sur mobile.

## États

### Chargement

- Moins de 300 ms : rien. Afficher un indicateur trop tôt fait clignoter l'écran.
- Au-delà : un squelette qui reprend la forme exacte du contenu attendu (même nombre de colonnes,
  mêmes hauteurs de ligne), pas une série de barres grises génériques.
- Au-delà de 10 s : le squelette laisse la place à un message (« Le chargement prend plus de temps
  que prévu ») et à « Réessayer ». Au-delà de 30 s, c'est une erreur.
- Une action qui s'exécute (enregistrer, valider une réponse) garde son libellé et affiche un
  indicateur dans le bouton ; le bouton est inactif le temps de la requête.

### Vide

Deux cas, deux textes, jamais confondus :

- **Rien encore** : dire pourquoi c'est vide et quelle action le remplira, avec cette action.
  « Aucune activité dans cette section. Ajoutez-en une depuis vos ressources. » (enseignant) ;
  « Votre enseignant n'a pas encore publié d'activité ici. » (étudiant, sans action).
- **Aucun résultat** : rappeler la recherche ou les filtres, proposer de les effacer. « Aucun cours
  ne correspond à “Analyse”. Effacer la recherche. »

Pas d'illustration générique de boîte ou de loupe. Un état vide est un texte bien écrit, une icône
de la famille du contenu et une action.

### Erreur

- Dans une zone (une liste, une carte) : message court, cause si elle est connue, « Réessayer ». Le
  reste de la page continue de fonctionner.
- Page entière : titre humain (« Impossible d'ouvrir cette activité »), cause, deux sorties (réessayer,
  revenir à l'accueil), et le code d'erreur en petit pour le support.
- Formulaire : le message sous le champ concerné, au moment de l'envoi puis à chaque correction ;
  un résumé en tête si plusieurs champs sont en faute.

## Retours d'action

| Action | Retour |
| --- | --- |
| Enregistrer, modifier | Toast bref (« Modifications enregistrées »), 4 s, en bas à gauche, sans bouton |
| Créer | Navigation vers l'objet créé et toast avec lien si l'objet reste hors de vue |
| Supprimer ou retirer | Confirmation en place (pas de dialogue) pour un élément de liste ; dialogue avec le nom de l'objet pour un cours, un cercle, une activité notée. Toast avec « Annuler » pendant 8 s quand la suppression est réversible |
| Valider une réponse | Le résultat s'inscrit dans la marge de la copie, avec le retour sous la réponse ; pas de toast |
| Erreur serveur | Toast d'erreur persistant jusqu'à fermeture, avec la cause en clair |
| Copier un lien ou un code | Le bouton affiche « Copié » 2 s, sans toast |

`DialogService` garde ses méthodes (`success`, `error`, `confirm`...) et produit ces retours.

## Transitions

| Élément | Entrée | Sortie |
| --- | --- | --- |
| Survol, focus, changement de couleur | 120 ms, `ease-out` | idem |
| Menu, bulle, liste déroulante | 180 ms, opacité et translation de 4 px depuis le déclencheur | 120 ms, opacité |
| Dialogue | 260 ms, opacité et échelle de 0,98 à 1 ; voile en 180 ms | 180 ms |
| Panneau latéral | 260 ms, translation depuis son bord | 200 ms |
| Toast | 180 ms, translation de 8 px vers le haut | 150 ms, opacité |
| Changement d'onglet, de page | aucun effet de page ; le contenu nouveau apparaît en 120 ms d'opacité | |
| Résultat d'une réponse | l'icône de marge apparaît en 180 ms ; une réussite ne déclenche ni confetti ni son | |

Courbes : `ease-out` = `cubic-bezier(0.2, 0, 0, 1)`, `ease-in` = `cubic-bezier(0.3, 0, 1, 1)`.

## Moments de joie

Une plateforme d'apprentissage a le droit d'être contente pour vous, à condition de ne pas le faire
à chaque clic. Trois moments, et seulement ceux-là :

| Moment | Ce qui se passe |
| --- | --- |
| Une activité est terminée | La barre d'avancement finit de se remplir en 600 ms, puis prend la chaleur (le dégradé du logo). Le libellé passe à « Terminée ». Rien ne saute, rien ne tombe du ciel. |
| Un cours est achevé | Le cours reçoit la mention « Cours terminé » en chaleur dans la liste, une fois. |
| Première connexion | La bienvenue est écrite au nom de la personne et illustrée. |

Un bon résultat à une question n'est pas un moment de joie : c'est une information (vert, dans la
marge, en 180 ms). Les confettis restent l'affaire des auteurs d'exercices, qui disposent déjà du
composant `wc-confetti` pour les moments qu'ils jugent bons dans leurs propres exercices.

Le reste de la vie de l'interface est fait de petites réponses : un bouton qui s'enfonce d'un
pixel, un onglet intercalaire qui glisse vers son nouvel élément en 180 ms, une barre d'avancement
qui se remplit plutôt que d'apparaître remplie, une notification qui se marque lue en s'éclaircissant.

## Interaction et accessibilité

- Tout élément interactif a un état survol, un état focus (anneau `focus` de 2 px, décalé de 2 px)
  et un état désactivé qui dit pourquoi quand ce n'est pas évident.
- Cibles de 36 px de haut au moins sur bureau, 44 px sur tactile.
- Un bouton à icône seule a toujours un libellé accessible et une bulle au survol ou au focus.
- Raccourcis clavier documentés dans le menu d'aide : `/` pour rechercher dans une liste, `Échap`
  pour fermer, et dans la correction `J` et `K` pour passer d'une copie à l'autre.
- Les tableaux de plus de cinquante lignes paginent côté serveur, avec une taille de page mémorisée.

## Thème sombre

Même logique, valeurs inversées, testées aux mêmes seuils :

| Rôle | Clair | Sombre |
| --- | --- | --- |
| Fond | graphite 50 | graphite 950 `#141317` |
| Surface | blanc | `#1a191d` |
| Surface surélevée | blanc et ombre | graphite 900 `#222125` |
| Filet | graphite 150 | graphite 800 |
| Texte | graphite 900 (16:1) | graphite 100 (14,9:1) |
| Texte secondaire | graphite 600 (6,3:1) | graphite 400 (6,3:1) |
| Primaire (fond de bouton) | encre 700, texte blanc (8,3:1) | encre 300, texte graphite 950 (9,8:1) |
| États (texte) | 600 et 700 | 300 (de 9,3:1 à 10,1:1) |

L'éditeur de code garde son thème sombre propre et ne suit pas ce réglage.

## Ton

- **Vouvoiement partout.** L'application tutoie aujourd'hui dans le lecteur (« Demande le code à ton
  enseignant ») et vouvoie ailleurs ; on choisit le vouvoiement, le public est universitaire.
- Phrases courtes, verbes d'action sur les boutons (« Ajouter une activité », pas « Nouveau »).
- Dates relatives quand elles aident (« ferme jeudi à 18 h »), absolues dans les tableaux.
- Notes au format français : virgule décimale (« 14,5 / 20 »), espace avant l'unité.
- Pas d'excuse, pas de point d'exclamation dans les messages d'erreur.
