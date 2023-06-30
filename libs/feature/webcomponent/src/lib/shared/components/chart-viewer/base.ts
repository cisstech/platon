import { ScaleType } from '@swimlane/ngx-charts';
import { JSONSchema7 } from 'json-schema';

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

export type availableColorsType = "vivid" | "natural" | "cool" | "fire" | "solar" | "air" |"aqua" | "flame" | "ocean" | "forest" | "horizon" | "neons" | "picnic" | "night" | "nightLights";

export interface ChartViewerBase {
    gradient:  boolean,
    colorScheme: availableColorsType,
    schemeType : ScaleType,
    data : unknown[]
}

export const ChartViewerBaseProperties : Record<string, JSONSchema7> = {
    data: {
        type: 'array',
        default: [],
        description: 'Jeu de donnée à afficher, le format est décrit plus bas'
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
        enum: ['ordinal', 'time', 'linear']
    }, 
}