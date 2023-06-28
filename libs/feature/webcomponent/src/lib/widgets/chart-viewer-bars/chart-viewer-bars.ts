import { LegendPosition, ScaleType } from '@swimlane/ngx-charts';
import {
  defineWebComponent,
  IWebComponent,
  WebComponentTypes,
} from '../../web-component';

export interface ChartViewerBarsState extends IWebComponent {
  mode: 'horizontal' | 'vertical',
  showXAxis: boolean,
  showXAxisLabel: boolean,
  xAxisLabel: string,
  showYAxis: boolean,
  showYAxisLabel: boolean,
  yAxisLabel: string,
  showLegend: boolean,
  legendPosition: LegendPosition,
  gradient:  boolean,
  colorScheme:   "vivid" | "natural" | "cool" | "fire" | "solar" | "air" |"aqua" | "flame" | "ocean" | "forest" | "horizon" | "neons" | "picnic" | "night" | "nightLights",
  schemeType : ScaleType,
  data : any[]
}

export const availableColors = [
  "vivid",
  "natural",
  "cool",
  "fire",
  "solar",
  "air",
  "aqua",
  "flame",
  "ocean",
  "forest",
  "horizon",
  "neons",
  "picnic",
  "night",
  "nightLights"
]

export const ChartViewerBarsComponentDefinition = defineWebComponent({
  type: WebComponentTypes.widget,
  name: 'ChartViewer-Bars',
  icon: 'assets/images/components/forms/code-editor/code-editor.svg',
  selector: 'wc-chart-viewer-bars',
  description:
    "Permets d'afficher une charte de type `histogramme` en fournissant des données",
  fullDescriptionUrl:
    'assets/docs/components/widgets/chart-viewer-bars/chart-viewer-bars.md',
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    title: 'ChartViewer-Bars',
    required: ['data'],
    properties: {
      mode: {
        type: 'string',
        default: 'horizontal',
        description: 'Mode d\'affichage du graphe : horizontal ou vertical',
        enum: ['horizontal', 'vertical']
      },
      data: {
        type: 'array',
        default: [],
        description: 'Jeu de donnée à afficher, le format est décrit plus bas'
      },
      showXAxis: {
        type: 'boolean',
        default: true,
        description: 'Afficher l\'axe horizontal?',
      },
      xAxisLabel: {
        type: 'string',
        default: 'Axe X',
        description: 'Label de l\'axe horizontal',
      },
      showXAxisLabel: {
        type: 'boolean',
        default: true,
        description: 'Afficher le label de l\'axe horizontal?',
      },
      showYAxis: {
        type: 'boolean',
        default: true,
        description: 'Afficher l\'axe vertical?',
      },
      yAxisLabel: {
        type: 'string',
        default: 'Axe Y',
        description: 'Label de l\'axe vertical',
      },
      showYAxisLabel: {
        type: 'boolean',
        default: true,
        description: 'Afficher le label de l\'axe vertical?',
      },
      showLegend: {
        type: 'boolean',
        default: true,
        description: 'Afficher la légende décrivant les données affichées?',
      },
      legendPosition: {
        type: 'string',
        default: 'right',
        description: 'Position de la légende dans l\'affichage du graphe',
        enum: ["below", "right"]
      },
      gradient: {
        type: 'boolean',
        default: false,
        description: 'utiliser un gradian pour les couleurs des données?',
      },
      colorScheme: {
        type: 'string',
        default: 'horizon',
        description: 'Thème de couleur utilisé pour afficher les données',
        enum: availableColors
      },
      schemeType: {
        type: 'string',
        default: 'ordinal',
        description: 'Type d\'affichage du graphe',
        enum: ['ordinal', 'time', 'linear', 'quantile']
      }
    },
  },
  showcase: {
    data: [
      {
        "name": "ValueA",
        "series": [
          {
            "name": "Set1",
            "value": 7300000
          },
          {
            "name": "Set2",
            "value": 8940000
          }
        ]
      },
    
      {
        "name": "ValueB",
        "series": [
          {
            "name": "Set1",
            "value": 7870000
          },
          {
            "name": "Set2",
            "value": 8270000
          }
        ]
      },
      {
        "name": "ValueC",
        "series": [
          {
            "name": "Set1",
            "value": 5000002
          },
          {
            "name": "Set2",
            "value": 5800000
          },
          {
            "name": "Set3",
            "value": 4269000
          }
        ]
      }
    ]
  },
});
