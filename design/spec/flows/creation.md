# creation

Karim n'écrira pas de PLE. Pour lui, créer un exercice, c'est choisir un modèle, le remplir et
voir tout de suite ce que verront ses étudiants. Hélène, elle, veut l'éditeur complet. Le flow
sert les deux, sans que l'un paie la complexité de l'autre.

Le chemin du modèle part de trois endroits : Créer puis Exercice sur la couverture, le bloc
Partir d'un modèle de l'accueil enseignant, et Créer à partir sur une ressource paramétrable. La
galerie montre d'abord les modèles certifiés (ceux qu'un administrateur a marqués), puis les
modèles paramétrables des cercles de l'enseignant. Elle recommande un modèle pour commencer, le QCM,
le plus simple à remplir et le plus utilisé : il est en tête, avec son action Commencer avec un QCM,
et les cinq autres restent juste dessous, à égalité. Chaque carte a un aperçu jouable et une vignette
neutre : la teinte identifie un cours, jamais un type de modèle. Le mot cercle y est défini en une
ligne, sous Modèles de vos cercles. Quand la plateforme n'a encore aucun
modèle, la page le dit avec la copie vierge et renvoie vers les ressources. Choisir un
modèle crée l'exercice en brouillon dans le cercle personnel et ouvre l'atelier, comme le fait
déjà la sélection de modèles du tableau de bord.

L'atelier est le builder actuel : à gauche les variables du modèle (lues dans `main.plc`), au
centre l'éditeur de la variable choisie (texte, liste, code, booléen, automate, expression…), à
droite l'aperçu étudiant, rechargé à chaque modification. L'aperçu rend une question à une seule
bonne réponse avec des boutons radio, et des cases à cocher seulement quand plusieurs réponses sont
justes, comme le lecteur. L'en-tête garde le retour, le titre et une seule action principale :
Enregistrer tant qu'il reste des modifications, signalées par l'étiquette neutre Modifications non
enregistrées (icône `edit_note`) ; tant qu'un bloc empêche l'aperçu de se construire, Enregistrer est
désactivé et dit pourquoi à côté (« Corrigez le bloc Choix pour enregistrer »). L'éditeur de code est
un bouton icône libellé, le plein écran vit dans l'en-tête de l'aperçu. Dans l'aperçu, les boutons
de l'étudiant (Valider) sont rendus en secondaire : l'aperçu montre, il ne concurrence pas l'action
de la page. Le premier enregistrement demande un nom et une description, parce qu'un nom par défaut
du type « Exercice du 29 sept. 2026 à 10 h 42 » ne se retrouve pas dans le catalogue ; le dialogue
définit les topics en une ligne (les thèmes de l'exercice) et range le brouillon sous l'icône `save`. Une fois enregistré,
Enregistrer devient un état calme (Enregistré) et la suite devient l'action principale : Ajouter à
un cours, où chaque cours se reconnaît à sa marque. Il propose les trois usages de l'ajout d'activité
dans un cours : Entraînement, Notée, Challenge. Le dialogue dit aussi quand l'activité s'ouvre
et jusqu'à quand, parce qu'une activité sans dates est ouverte aux étudiants dès son ajout
(`calculateActivityOpenState`). Un entraînement s'ouvre maintenant ; sa fermeture est un choix
explicite, dont le défaut s'écrit en toutes lettres : « Sans fermeture : ouverte jusqu'à ce que vous
la fermiez ». Une épreuve notée a le formulaire de l'ajout d'activité, en court : ses deux dates, vides et
obligatoires, sa durée maximale (facultative : sans elle, l'épreuve dure jusqu'à sa fermeture), et en
une ligne ses réglages par défaut, ceux du formulaire complet (une tentative par exercice, plein écran
obligatoire, copier-coller bloqué, arrêt si l'étudiant quitte la page, code de reprise créé). Régler
ouvre ce formulaire complet, prérempli. Le dialogue n'ajoute rien tant que les dates manquent, et une
épreuve créée depuis l'atelier n'a jamais de sécurité inconnue. Quitter un exercice jamais enregistré le supprime, après
confirmation.

Le chemin de l'éditeur (Partir d'une page blanche, en code) est un formulaire unique, en quatre
questions : que créer, où la ranger, comment la décrire, par où commencer. Il remplace l'assistant
en six étapes sans changer ce qui est envoyé à l'API. Un enseignant y crée un exercice ou une
activité ; un cercle ne se crée que par un administrateur, comme aujourd'hui
(`ResourceService.canUserCreateResource`), et comme le dit le menu Créer de l'accueil. Le mot cercle
est défini en une ligne là où il apparaît : un dossier partagé avec des collègues, qui voient et
peuvent modifier ce qu'on y range. Les libellés ne parlent ni de PLE ni de PLA.

## Rules

- un enseignant non auteur peut créer un exercice sans voir une ligne de code
- l'aperçu de l'atelier montre toujours l'état courant, ou dit pourquoi il ne peut pas
- un exercice jamais enregistré n'est pas laissé en brouillon orphelin
- le chemin en code (Partir d'une page blanche, en code) n'est jamais l'action principale de la galerie
- l'atelier a une seule action principale : Enregistrer avant l'enregistrement, Ajouter à un cours
  après ; Ajouter à un cours n'apparaît qu'une fois l'exercice enregistré
- une variable qui empêche l'aperçu de se construire est marquée dans la navigation (icône et mot),
  et le message à côté du bloc nomme le problème et la correction
- les choix d'une liste se réordonnent à la souris et au clavier (poignées, indice clavier)
- une vignette de modèle est neutre : la teinte de cours n'identifie qu'un cours
- la galerie recommande un modèle pour commencer, sans masquer ni rapetisser les autres
- l'état vide de la galerie (aucun modèle sur la plateforme) porte la copie vierge, pas un glyphe
- l'aperçu d'une question à une seule bonne réponse montre des boutons radio ; à plusieurs, des
  cases à cocher
- des modifications en attente se signalent par l'étiquette neutre Modifications non enregistrées,
  avec l'icône `edit_note` ; un brouillon porte `save`, et Enregistrer ne porte aucune icône d'état
- un nom par défaut écrit sa date en lettres (« Exercice du 29 sept. 2026 à 10 h 42 »)
- tant qu'un bloc empêche l'aperçu, Enregistrer est désactivé et sa raison est écrite à côté
- chaque écran de l'atelier a un titre de niveau 1 (le nom de l'exercice) et un lien d'évitement
  vers l'éditeur
- l'atelier a trois tailles de titre distinctes : le nom de l'exercice (title), le bloc (heading), le
  message d'un bloc (subheading)
- l'ajout à un cours ne crée jamais une activité ouverte sans le dire : un entraînement s'ouvre
  maintenant et sa fermeture est un choix, par défaut « Sans fermeture : ouverte jusqu'à ce que vous
  la fermiez » ; une épreuve notée exige une ouverture et une fermeture, et Ajouter au cours dit ce
  qui manque
- l'ajout à un cours propose les usages de l'ajout d'activité (Entraînement, Notée, Challenge) ; une
  épreuve notée y montre aussi sa durée et, en une ligne, ses réglages de sécurité par défaut, avec
  Régler vers le formulaire complet : jamais une épreuve aux réglages inconnus
- un mot technique (cercle, topic, modèle) a un mot simple ou une définition d'une ligne là où un
  débutant le rencontre
- Nouvelle ressource ne propose Cercle qu'à l'administrateur, seul autorisé à en créer ; le mot
  cercle y est défini en une ligne

spec:
  screens:
    - { id: modeles, states: [default, empty] }
    - { id: apercu, overlay: true, states: [default] }
    - { id: atelier, states: [default, error] }
    - { id: enregistrer, overlay: true, states: [default] }
    - { id: enregistre, states: [default] }
    - { id: atelier-quitter, overlay: true, states: [default] }
    - { id: ajouter-au-cours, overlay: true, states: [default, notee] }
    - { id: nouvelle, states: [default] }
  edges:
    - { from: modeles, to: apercu, on: preview }
    - { from: modeles, to: atelier, on: pick }
    - { from: modeles, to: nouvelle, on: code }
    - { from: apercu, to: atelier, on: pick }
    - { from: apercu, to: modeles, on: dismiss }
    - { from: atelier, to: enregistrer, on: save }
    - { from: atelier, to: atelier-quitter, on: leave }
    - { from: enregistrer, to: enregistre, on: save }
    - { from: enregistrer, to: atelier, on: dismiss }
    - { from: enregistre, to: ajouter-au-cours, on: add }
    - { from: atelier-quitter, to: modeles, on: discard }
    - { from: atelier-quitter, to: atelier, on: dismiss }
    - { from: ajouter-au-cours, to: detail, on: add }
    - { from: ajouter-au-cours, to: enregistre, on: dismiss }
    - { from: ajouter-au-cours, to: ajouter-fonction, on: settings }
    - { from: nouvelle, to: ressources, on: dismiss }
