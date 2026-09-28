---
name: PLaTon
description: Plateforme d'apprentissage et d'enseignement en ligne. On y écrit des exercices, on les fait, on les corrige.
colors:
  encre-50: '#faf4ff'
  encre-100: '#f5e7ff'
  encre-200: '#ebcdff'
  encre-300: '#dbaaf9'
  encre-400: '#be80e3'
  encre-500: '#a25cc8'
  encre-600: '#8742ac'
  encre-700: '#712f93'
  encre-800: '#592474'
  encre-900: '#401a54'
  encre-950: '#2a1038'
  graphite-0: '#ffffff'
  graphite-25: '#fbf9ff'
  graphite-50: '#f6f4fa'
  graphite-100: '#edecf2'
  graphite-150: '#e4e2e8'
  graphite-200: '#dad8de'
  graphite-300: '#bebcc3'
  graphite-400: '#9c9aa0'
  graphite-450: '#8e8c92'
  graphite-500: '#7b797f'
  graphite-600: '#615f65'
  graphite-700: '#4a484d'
  graphite-800: '#353338'
  graphite-900: '#222125'
  graphite-950: '#141317'
  validation-50: '#effaf1'
  validation-100: '#dcf4e2'
  validation-200: '#bde7c7'
  validation-500: '#2a9754'
  validation-600: '#027c3e'
  validation-700: '#006531'
  correction-50: '#fff4f2'
  correction-100: '#ffe6e3'
  correction-200: '#ffcdc6'
  correction-300: '#ffa69b'
  correction-500: '#db423c'
  correction-600: '#bc2122'
  correction-700: '#a0020f'
  attention-50: '#fff5ea'
  attention-100: '#fde9d2'
  attention-200: '#f7d4aa'
  attention-400: '#d18f2b'
  attention-700: '#744a02'
  attention-800: '#5b3900'
  repere-50: '#f1f8ff'
  repere-100: '#dfefff'
  repere-200: '#bedfff'
  repere-600: '#026bb2'
  repere-700: '#025792'
  ground: '{colors.graphite-50}'
  surface: '{colors.graphite-0}'
  surface-muted: '{colors.graphite-25}'
  line: '{colors.graphite-150}'
  line-strong: '{colors.graphite-200}'
  control: '{colors.graphite-450}'
  text: '{colors.graphite-900}'
  muted: '{colors.graphite-600}'
  subtle: '{colors.graphite-500}'
  primary: '{colors.encre-700}'
  primary-hover: '{colors.encre-800}'
  primary-soft: '{colors.encre-50}'
  primary-soft-strong: '{colors.encre-100}'
  focus: '{colors.encre-600}'
  success: '{colors.validation-600}'
  success-ink: '{colors.validation-700}'
  success-soft: '{colors.validation-50}'
  danger: '{colors.correction-600}'
  danger-ink: '{colors.correction-700}'
  danger-soft: '{colors.correction-50}'
  warning: '{colors.attention-400}'
  warning-ink: '{colors.attention-700}'
  warning-soft: '{colors.attention-50}'
  info: '{colors.repere-600}'
  info-ink: '{colors.repere-700}'
  info-soft: '{colors.repere-50}'
  margin: '{colors.correction-300}'
typography:
  display:
    fontFamily: "'Atkinson Hyperlegible Next', system-ui, sans-serif"
    fontSize: 28px
    fontWeight: 600
    lineHeight: 36px
    letterSpacing: -0.015em
  title:
    fontFamily: "'Atkinson Hyperlegible Next', system-ui, sans-serif"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 30px
    letterSpacing: -0.01em
  heading:
    fontFamily: "'Atkinson Hyperlegible Next', system-ui, sans-serif"
    fontSize: 17px
    fontWeight: 600
    lineHeight: 24px
  subheading:
    fontFamily: "'Atkinson Hyperlegible Next', system-ui, sans-serif"
    fontSize: 15px
    fontWeight: 600
    lineHeight: 22px
  body:
    fontFamily: "'Atkinson Hyperlegible Next', system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 21px
  reading:
    fontFamily: "'Atkinson Hyperlegible Next', system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 26px
  small:
    fontFamily: "'Atkinson Hyperlegible Next', system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 18px
  caption:
    fontFamily: "'Atkinson Hyperlegible Next', system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 16px
    letterSpacing: 0.01em
  figure:
    fontFamily: "'Atkinson Hyperlegible Next', system-ui, sans-serif"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 28px
    fontFeature: "'tnum' 1"
  mono:
    fontFamily: "'Atkinson Hyperlegible Mono', ui-monospace, monospace"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 20px
rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  full: 999px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 20px
  '6': 24px
  '8': 32px
  '10': 40px
  '12': 48px
  '16': 64px
statusBar:
  background: '{colors.surface}'
  tint: dark
---

## Encre et copie

PLaTon est l'endroit où l'on écrit, fait et corrige des exercices. Le design reprend les gestes de
l'école française sans en imiter le décor : l'encre pour ce que l'on écrit et ce que l'on choisit,
le rouge du correcteur pour ce qui est faux, le vert pour ce qui est juste, la marge de la copie
pour les annotations. Pas de papier jauni, pas d'écriture manuscrite, pas de texture : des gestes,
pas un costume.

## Couleur

Un seul accent, l'**encre violette**. C'est la teinte prune du logo (`#821b90`), décalée vers
l'encre et assourdie, et c'est aussi l'encre des cahiers des écoles de la Troisième République.
Elle fait une seule chose : désigner ce que l'on peut faire et ce qui est sélectionné. Bouton
primaire, lien, élément de navigation actif, anneau de focus. Jamais un fond décoratif, jamais un
titre.

Les **neutres graphite** portent une pointe de la même teinte, à moins de 1 % de chroma. Ils
restent froids et clairs : le fond de l'application n'est pas beige, il est à peine teinté.

Les couleurs d'état ont un sens fixe, le même partout, et viennent toujours avec une icône ou un
mot :

- **validation** (vert) : réussi, prêt, ouvert.
- **correction** (rouge) : échoué, erreur, suppression, en retard. C'est le rouge du stylo du
  correcteur ; il n'habille rien d'autre.
- **attention** (ocre) : partiellement réussi, à tester, échéance proche.
- **repère** (bleu) : information neutre, planifié.

Contrastes vérifiés : texte courant 16:1, texte secondaire 6,3:1, primaire sous texte blanc 8,3:1,
contour de champ 3,3:1 sur blanc et 3,05:1 sur le fond, texte d'état sur fond d'état entre 6,7:1
et 9,6:1.

## Typographie

Une seule famille, **Atkinson Hyperlegible Next**, et sa version **Mono** pour le code. Elle a été
dessinée par le Braille Institute pour distinguer les caractères qui se confondent : `l`, `I` et
`1`, `O` et `0`. Sur une plateforme où l'on lit du code, des formules, des notes et des codes
d'accès à six chiffres, c'est un choix fonctionnel avant d'être un style.

Échelle fermée : `display` 28, `title` 22, `heading` 17, `subheading` 15, `body` 14, `reading` 16
pour les énoncés et les textes longs, `small` 13, `caption` 12. Les chiffres des notes et des
statistiques sont tabulaires (`figure`), pour s'aligner d'une ligne à l'autre. Graisses 400 et 600,
rien d'autre.

## La marge

Le seul motif de l'identité est la marge de la copie : un filet rouge clair de 1 px, placé à 48 px
du bord gauche des surfaces où l'élève répond. La marge n'est pas un décor, elle a une fonction :
c'est là que s'inscrivent le numéro de la question et son résultat (juste, faux, partiel),
comme les annotations d'un correcteur. Elle n'apparaît que sur ces surfaces-là, jamais dans une
liste ni dans l'administration.

## Formes

Rayons nets : 6 px pour les boutons et les champs, 8 px pour les menus, 12 px pour les cartes et
les dialogues. Les cartes posées sur le fond ont un filet, pas d'ombre. L'ombre est réservée à ce
qui flotte au-dessus de la page : menus, bulles, dialogues, panneaux.

## Mouvement

Court et utile. 120 ms pour un survol ou un changement de couleur, 180 ms pour l'apparition d'un
menu ou d'une bulle, 260 ms pour un panneau ou un dialogue. Une sortie dure environ 70 % de
l'entrée. Rien ne rebondit. Avec `prefers-reduced-motion`, seules les opacités changent.

## Faire

- une action principale par écran, libellée, au même endroit
- la couleur d'état accompagnée d'un mot ou d'une icône
- des données réelles dans les maquettes : noms d'UE, échéances, notes sur 100
- l'insécable avant `: ; ! ?` et les majuscules accentuées

## Ne pas faire

Les signes qui feraient ressembler PLaTon à n'importe quelle application générée, écartés une fois
pour toutes :

- pas de fond crème ni beige, pas de dégradé d'accent, pas d'effet de verre
- pas de ruban, de pastille ni de coin coloré qui ne signale pas un état
- pas de bouton rond avec une icône seule pour une action principale
- pas de centrage par défaut : on lit de gauche à droite
- pas de majuscules pour les boutons et les libellés, pas de casse anglaise dans les titres
- pas de lorem, pas de « Cours 1 » : chaque texte est un texte réel
- pas de tiret cadratin ni demi-cadratin dans les textes
