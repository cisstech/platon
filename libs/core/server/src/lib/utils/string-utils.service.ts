import { Injectable } from '@nestjs/common'

@Injectable()
export class StringUtilsService {
  normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[^a-z0-9]/g, '') // Garde uniquement les lettres et chiffres
  }

  calculateSimilarity(str1: string, str2: string): number {
    // Distance de Levenshtein
    const levenshteinDistance = (s1: string, s2: string): number => {
      const matrix: number[][] = Array(s1.length + 1)
        .fill(null)
        .map(() => Array(s2.length + 1).fill(null))

      for (let i = 0; i <= s1.length; i++) {
        matrix[i][0] = i
      }
      for (let j = 0; j <= s2.length; j++) {
        matrix[0][j] = j
      }

      for (let i = 1; i <= s1.length; i++) {
        for (let j = 1; j <= s2.length; j++) {
          const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
          matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost)
        }
      }

      return matrix[s1.length][s2.length]
    }

    // Calcul de la similarité basé sur la distance de Levenshtein
    const maxLength = Math.max(str1.length, str2.length)
    if (maxLength === 0) return 1.0

    const distance = levenshteinDistance(str1, str2)
    return 1 - distance / maxLength
  }
}
