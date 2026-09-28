# Personas et parcours

PLaTon sert des gens qui n'ont pas le même travail à faire. Un étudiant ouvre la plateforme pour
savoir ce qu'il doit rendre et le faire. Un enseignant l'ouvre pour préparer, suivre et évaluer. Une
autrice d'exercices y passe des heures dans un éditeur. Une candidate ne la verra qu'une fois, le
jour d'un test qui compte pour elle.

Ces personas sont tirés de l'exploration de la plateforme avec les comptes de démonstration
(étudiant `aruston`, enseignant `bcacManus`, administrateur `ypicker`) sur une base peuplée par le
dump de développement. Chaque frustration est marquée **observé** quand elle a été vue à l'écran, et
**à vérifier** quand c'est une hypothèse qui demande un test ou un entretien.

## Inès, étudiante en L1 Informatique

Inès suit trois cours sur PLaTon, dont Algorithmique et programmation 1. Elle fait ses TP sur son
ordinateur portable pendant les séances, et regarde sur son téléphone dans le RER ce qu'il lui
reste à rendre. Elle arrive le plus souvent depuis Moodle, par un lien LTI.

**Ce qu'elle veut faire**

- savoir ce qu'elle doit faire et pour quand, sans chercher
- lancer ou reprendre une activité en un geste
- comprendre pourquoi une réponse est fausse, tout de suite
- voir où elle en est dans chaque cours

**Ce qui la freine aujourd'hui**

- **observé** : l'accueil aligne huit chiffres (taux de réussite, taux d'abandon, note moyenne...)
  sans une seule action. Rien ne dit quelle activité est ouverte ni quand elle ferme.
- **observé** : le taux d'abandon de 25 % est affiché en vert, la couleur du succès.
- **observé** : dans un cours, une erreur serveur s'affiche comme un cours vide (« Ce cours ne
  contient aucune section »). Inès croit qu'il n'y a rien à faire.
- **observé** : la page d'un cours lui montre le nombre d'enseignants et d'élèves, et un titre de
  section par défaut destiné à l'enseignant (« Modifiez le titre de votre section »).
- **observé** : le lecteur d'activité affiche l'identifiant technique de sa session, et une
  activité fermée donne une page entièrement blanche.
- **à vérifier** : le code de déblocage à six chiffres arrive sans expliquer pourquoi il est
  demandé ni à qui le demander, au-delà d'une ligne orange.

**Parcours principal**

Connexion (souvent via Moodle), voir ce qui est à faire, lancer l'activité, répondre, valider,
lire le retour, reprendre plus tard, consulter ses résultats et ses corrections.

## Karim, responsable d'une UE de programmation

Karim est maître de conférences. Il pilote Algorithmique et programmation 1 : environ trois cents
étudiants, six chargés de TD. Chaque semaine, il ouvre une ou deux activités, suit les séances de TP
en direct et exporte les notes à la fin du semestre.

**Ce qu'il veut faire**

- préparer la semaine : ajouter une activité à la bonne section, régler ses dates
- voir en un coup d'œil ce qui est ouvert, qui a commencé, qui bloque
- répartir et suivre les corrections
- exporter des notes justes, sans retraitement

**Ce qui le freine aujourd'hui**

- **observé** : son accueil est un sélecteur de modèles d'exercice, vide sur la base de
  démonstration. Il ne voit ni ses cours, ni ses activités ouvertes, ni ses corrections en attente.
- **observé** : ajouter une activité passe par un assistant en quatre étapes (section, activité,
  fonction, configuration) où la première étape n'est qu'un bouton « Semaine 1 » isolé, sans état
  sélectionné lisible.
- **observé** : dans les membres d'un cours, chaque ligne porte un bouton rouge plein de
  suppression, à un clic de l'erreur.
- **observé** : les paramètres du cours empilent trois boutons primaires identiques (Sauvegarder,
  Créer accès démo, Charger un cours) dans des blocs qui se ressemblent.

**Parcours principal**

Accueil, ouvrir un cours, ajouter une activité, régler ses dates et sa notation, suivre la séance,
consulter les statistiques, exporter.

## Hélène, autrice d'exercices

Hélène enseigne les mathématiques et écrit des exercices pour toute l'équipe. Elle travaille dans
l'éditeur ou dans le builder à partir de modèles, teste, publie dans le cercle Mathématiques et
tient à jour le statut de ses exercices (brouillon, prêt, à tester).

**Ce qu'elle veut faire**

- retrouver un exercice existant avant d'en écrire un nouveau
- éditer, prévisualiser, corriger, dans une boucle courte
- savoir quels exercices sont fiables et lesquels sont à reprendre

**Ce qui la freine aujourd'hui**

- **observé** : l'espace de travail affiche le même cercle deux fois, dans les résultats et dans
  le panneau « Mon espace ».
- **observé** : la page d'un exercice aligne onze cartes de statistiques, chacune avec un coin de
  couleur différent, sans hiérarchie.
- **observé** : le suivi des statuts d'un cercle affiche un anneau dont la légende indique « (0%) »
  pour chaque statut, quelle que soit la répartition.
- **observé** : dans l'éditeur, le titre d'accueil est écrit en gris foncé sur fond noir.
- **observé** : la prévisualisation reste sur un squelette de chargement sans limite de temps ni
  message quand l'exécution ne répond pas.

**Parcours principal**

Chercher dans les ressources, ouvrir un exercice, éditer, prévisualiser, changer son statut,
partager dans un cercle.

## Julien, doctorant chargé de corrections

Julien assure des TD et corrige les copies qu'on lui assigne après les examens. Il corrige par
lots, souvent le soir, et veut savoir combien il en reste.

**Ce qu'il veut faire**

- voir sa file de copies à corriger, par activité
- corriger vite, au clavier, sans perdre le fil
- savoir quand il a terminé

**Ce qui le freine aujourd'hui**

- **observé** : sans correction assignée, l'onglet « Corrections en attente » est une zone blanche
  sans message.
- **à vérifier** : la navigation entre les copies et la saisie des étiquettes de correction au
  clavier (écran de correction à explorer avec des corrections assignées).

## Mariam, candidate à l'entrée en Master

Mariam reçoit une invitation par e-mail. Elle ouvre le lien, accepte les conditions et passe un
test chronométré, une seule fois. Elle ne connaît pas la plateforme et n'y reviendra peut-être
jamais.

**Ce qu'elle veut faire**

- comprendre les règles avant de commencer : durée, nombre de tentatives, ce qui met fin au test
- passer le test sans distraction ni doute technique
- savoir que ses réponses sont bien enregistrées

**Ce qui la freine aujourd'hui**

- **à vérifier** : les règles de sécurité du test (fin automatique en cas de perte du focus ou de
  sortie de la page) doivent être énoncées avant le début, en clair. À observer en créant un test
  et un candidat.
- **à vérifier** : le parcours invitation, conditions, test, fin, en entier et sur mobile.

## Sophie, administratrice de la plateforme

Sophie est ingénieure pédagogique. Elle gère les comptes, les groupes, les connexions Moodle et
CAS, les étiquettes de niveaux et de thèmes, et publie les annonces de nouveautés.

**Ce qu'elle veut faire**

- trouver un compte, changer son rôle, le désactiver
- vérifier qu'une connexion LMS fonctionne
- annoncer une nouveauté aux bons publics

**Ce qui la freine aujourd'hui**

- **observé** : un cadre rouge de six pixels entoure tout l'écran en permanence dès qu'elle est
  connectée.
- **observé** : l'administration mélange le français et l'anglais (« Status », « Active »).
- **observé** : dans le formulaire d'un utilisateur, le libellé « Élève » enregistre le rôle
  enseignant (`apps/web/src/app/pages/admin/users/users.page.ts`).

## Le visiteur de démonstration

Un collègue d'une autre université ouvre un lien de démonstration d'un cours. La plateforme lui
crée un compte temporaire et l'inscrit comme élève.

- **à vérifier** : son accueil ne rend rien, car le rôle démo n'est ni étudiant ni enseignant dans
  la logique du tableau de bord. La première impression de la plateforme est un écran vide.

## Ce que les personas imposent au design

- **Deux accueils, pas un** : l'étudiant arrive pour agir (à faire, à reprendre), l'enseignant
  pour piloter (ouvert, à corriger, à préparer). Les chiffres viennent après l'action.
- **Des états honnêtes** : une erreur ne se déguise jamais en absence de contenu, et un chargement
  a une fin.
- **La densité suit le rôle** : confortable pour lire un énoncé, dense pour une liste de trois
  cents étudiants.
- **La confiance d'abord pour les moments à enjeu** : examen noté, test d'entrée, correction.
  Règles visibles avant, enregistrement confirmé pendant, conclusion claire après.
