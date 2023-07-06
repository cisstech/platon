import { LegendPosition } from '@swimlane/ngx-charts';
import {
    defineWebComponent,
    IWebComponent,
    WebComponentTypes,
} from '../../web-component';
import {
    ChartViewerBase,
    ChartViewerBaseProperties
} from '../../shared/components/chart-viewer/base';

export interface ChartViewerRadarState extends IWebComponent, ChartViewerBase {
    showXAxis: boolean,
    showXAxisLabel: boolean,
    xAxisLabel: string,
    showYAxis: boolean,
    showYAxisLabel: boolean,
    yAxisLabel: string,
    showLegend: boolean,
    legendPosition: LegendPosition,
    legend: string,
    //mode: 'linear' | 'basis' | 'cardinal'
}

export const ChartViewerRadarComponentDefinition = defineWebComponent({
    type: WebComponentTypes.widget,
    name: 'ChartViewer-Radar',
    icon: 'assets/images/components/forms/code-editor/code-editor.svg',
    selector: 'wc-chart-viewer-radar',
    description:
      "Permets d'afficher une charte de type `radar` en fournissant des données",
    fullDescriptionUrl:
      'assets/docs/components/widgets/chart-viewer-radar/chart-viewer-radar.md',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema',
      type: 'object',
      title: 'ChartViewer-Radar',
      required: ['data'],
      properties: {
        // mode: {
        //   type: 'string',
        //   default: 'linear',
        //   description: 'Décris le modèle de courbe à utiliser pour afficher le graphe',
        //   enum: ['linear', 'basis', 'cardinal']
        // },
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
        legend: {
          type: 'string',
          default: 'Légende',
          description: 'Titre de la légende'
        },
        ...ChartViewerBaseProperties
      }
    },
    showcase: {
      data: [
        {
          "name": "Germany",
          "series": [
            {
              "name": "1990",
              "value": 62000000
            },
            {
              "name": "2010",
              "value": 73000000
            },
            {
              "name": "2011",
              "value": 89400000
            }
          ]
        },
      
        {
          "name": "USA",
          "series": [
            {
              "name": "1990",
              "value": 250000000
            },
            {
              "name": "2010",
              "value": 309000000
            },
            {
              "name": "2011",
              "value": 311000000
            }
          ]
        },
      
        {
          "name": "France",
          "series": [
            {
              "name": "1990",
              "value": 58000000
            },
            {
              "name": "2010",
              "value": 50000020
            },
            {
              "name": "2011",
              "value": 58000000
            }
          ]
        },
        {
          "name": "UK",
          "series": [
            {
              "name": "1990",
              "value": 57000000
            },
            {
              "name": "2010",
              "value": 62000000
            },
            {
              "name": "2011",
              "value": 72000000
            }
          ]
        }
      ]
    },
  });
  