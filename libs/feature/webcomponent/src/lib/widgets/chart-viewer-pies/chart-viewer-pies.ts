import {
    defineWebComponent,
    IWebComponent,
    WebComponentTypes,
} from '../../web-component';
import {
    ChartViewerBase,
    ChartViewerBaseProperties
} from '../../shared/components/chart-viewer/base';

export interface ChartViewerPiesState extends IWebComponent, ChartViewerBase {
    mode: 'simple' | 'advanced' | 'grid',
    showLegend: boolean,
    showLabels: boolean,
    isDoughnut: boolean,
}


export const ChartViewerPiesComponentDefinition = defineWebComponent({
type: WebComponentTypes.widget,
name: 'ChartViewer-Pies',
icon: 'assets/images/components/forms/code-editor/code-editor.svg',
selector: 'wc-chart-viewer-pies',
description:
    "Permets d'afficher une charte de type `camembert` en fournissant des données",
fullDescriptionUrl:
    'assets/docs/components/widgets/chart-viewer-pies/chart-viewer-pies.md',
schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    title: 'ChartViewer-Pies',
    required: ['data'],
    properties: {
        mode: {
            type: 'string',
            default: 'simple',
            description: 'Mode d\'affichage du graphe : simple ou advanced',
            enum: ['simple', 'advanced']
        },
        showLegend: {
            type: 'boolean',
            default: true,
            description: 'Afficher la légende décrivant les données affichées?',
        },
        showLabels: {
            type: 'boolean',
            default: true,
            description: 'Afficher la légende décrivant les données affichées?',
        },
        isDoughnut: {
            type: 'boolean',
            default: true,
            description: 'La charte doit être elle être creuse à l\'intérieur?',
        },
        ...ChartViewerBaseProperties
    },
},
showcase: {
    data: [
        {
            "name": "Germany",
            "value": 8940000
        },
        {
            "name": "USA",
            "value": 5000000
        },
        {
            "name": "France",
            "value": 7200000
        },
        {
            "name": "UK",
            "value": 6200000
        },
        {
            "name": "Italy",
            "value": 4200000
        },
        {
            "name": "Japan",
            "value": 1285420
        },
        {
            "name": "Spain",
            "value": 8200000
        }
    ]
}
});