import { LegendPosition, ScaleType } from '@swimlane/ngx-charts';
import {
  defineWebComponent,
  IWebComponent,
  WebComponentTypes,
} from '../../web-component';

export interface ChartViewerState extends IWebComponent {
  mode?: 'horizontal' | 'vertical',
  showXAxis?: boolean,
  showXAxisLabel?: boolean,
  xAxisLabel?: string,
  showYAxis?: boolean,
  showYAxisLabel?: boolean,
  yAxisLabel?: string,
  showLegend?: boolean,
  legendPosition?: LegendPosition,
  gradient?:  boolean,
  colorScheme?:   "vivid" | "natural" | "cool" | "fire" | "solar" | "air" |"aqua" | "flame" | "ocean" | "forest" | "horizon" | "neons" | "picnic" | "night" | "nightLights",
  schemeType? : ScaleType,
  data : any[]
}

export const ChartViewerComponentDefinition = defineWebComponent({
  type: WebComponentTypes.widget,
  name: 'ChartViewer',
  icon: 'assets/images/components/forms/code-editor/code-editor.svg',
  selector: 'wc-chart-viewer',
  description:
    "Permets d'afficher un graph de type spécifier",
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    title: 'ChartViewer',
    required: ['chart'],
    properties: {
      mode: {
        type: 'string',
        default: 'vertical',
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
        type: 'object',
        default: 'Right',
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
        default: 'nightLights',
        description: 'Thème de couleur utilisé pour afficher les données',
        enum: [
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
