import { EXPLORER_CONTAINER_ID } from '@cisstech/nge-ide/explorer'
import { SEARCH_CONTAINER_ID } from '@cisstech/nge-ide/search'
import type { Step } from 'intro.js'
import { DOCS_CONTAINER_ID } from './contributions/sidebar/pl-sidebar.contribution'
import { SETTINGS_CONTAINER_ID } from '@cisstech/nge-ide/settings'

export const EDITOR_TOUR: Step[] = [
  {
    title: 'Barre latérale',
    element: 'ide-sidebar',
    intro: `Sur le côté gauche, vous trouverez la barre latérale, un hub de navigation polyvalent avec plusieurs sections :`,
  },
  {
    title: 'Explorateur',
    element: `[id="${EXPLORER_CONTAINER_ID}"]`,
    intro: `
      <p>Votre point d'interaction principal pour tous vos fichiers.</p>
      <ul>
        <li>Par défaut, l'explorateur affiche uniquement l'arborescence de la ressource courante.</li>
        <li> Pour ajouter l'arborescence d'un cercle parent de la ressouce courante, cliquez sur le bouton <span class="codicon codicon-root-folder"/></li>
        <li>Vous pouvez faire un clique droit sur les fichiers pour avoir accès à des actions spécifiques dans un menu contextuel.</li>
        <li>Pour importer un dossier, importez un fichier zip, puis décompressez-le en choissant l'option "Extraire ici" dans le menu contextuel.</li>
      </ul>
    `,
  },
  {
    title: 'Recherche',
    element: `[id="${SEARCH_CONTAINER_ID}"]`,
    intro: `
      <p>Trouvez rapidement du code, des fichiers ou même un texte spécifique dans les fichiers de la ressource actuellement ouverte.</p>
      <ul>
        <li>La recherche se limite pour le moment aux fichiers de la ressource courante et non aux cercles parents.</li>
      </ul>
    `,
  },
  {
    title: 'Documentation',
    element: `[id="${DOCS_CONTAINER_ID}"]`,
    intro: `Accédez aux différentes documentation de PLaTon directement dans l'éditeur pour vous aider dans la création de vos ressources.`,
  },

  {
    title: 'Paramètres',
    element: `[id="${SETTINGS_CONTAINER_ID}"]`,
    intro: `Personnalisez l'environnement de développement selon vos préférences, en adaptant l'expérience à votre flux de travail.`,
  },
  {
    title: `Espace d'information`,
    element: `ide-infobar`,
    intro: `
      La zone d'information, vous permet de naviguez rapidement vers les erreurs et les avertissements dans vos fichiers.
    `,
  },
  {
    title: "Barre d'état",
    intro: `
    La barre d'état, vous donne des informations sur le fichier courant comme le langage, la ligne courante, ou encore l'indentation que vous pouvez modifier.
    `,
    element: 'ide-statusbar',
  },
  {
    title: `Espace d'édition`,
    element: `.container-welcome`,
    intro: `
      <p>Le cœur de l'IDE est l'espace d'édition centrale, où la polyvalence rencontre la puissance :</p>
      <ul>
        <li>
          Prise en charge de l'édition et de la visualisation d'une large gamme de fichiers, y compris le code, les PDF, les vidéos et les images.
        </li>
        <li>
          Une barre d'outils adaptative qui fournit des actions spécifiques au fichier, comme des aperçus améliorés pour les fichiers markdown, HTML, SVG et les différents fichiers PLaTon.
        </li>
      </ul>
      `,
  },
  {
    title: 'Documentation complémentaire',
    intro: `
      <p>Ce tour d'horizon rapide ne couvre que les bases de l'IDE. Pour en savoir plus, consultez la documentation complète de l'IDE <a href="/docs/main/programing/ide" target="_blank">sur cette page</a>.</p>
    `,
  },
]
