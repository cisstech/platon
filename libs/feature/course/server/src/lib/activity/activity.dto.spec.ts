import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { UpdateCourseActivityDTO } from './activity.dto'

const isValid = async (dto: object) => (await validate(dto)).length === 0

describe('UpdateCourseActivityDTO', () => {
  describe('code', () => {
    it('accepte un code de 6 caractères alphanumériques majuscules', async () => {
      const dto = plainToInstance(UpdateCourseActivityDTO, { code: 'AB12CD' })
      expect(await isValid(dto)).toBe(true)
    })

    it('accepte un DTO sans code (champ optionnel)', async () => {
      const dto = plainToInstance(UpdateCourseActivityDTO, {})
      expect(await isValid(dto)).toBe(true)
    })

    it('rejette un code en minuscules', async () => {
      const dto = plainToInstance(UpdateCourseActivityDTO, { code: 'ab12cd' })
      expect(await isValid(dto)).toBe(false)
    })

    it("rejette un code trop court (ex: '123456' évitable mais volontairement trop court ici)", async () => {
      const dto = plainToInstance(UpdateCourseActivityDTO, { code: 'AB12' })
      expect(await isValid(dto)).toBe(false)
    })

    it('rejette un code trop long', async () => {
      const dto = plainToInstance(UpdateCourseActivityDTO, { code: 'AB12CD34' })
      expect(await isValid(dto)).toBe(false)
    })

    it('rejette un code contenant des caractères spéciaux', async () => {
      const dto = plainToInstance(UpdateCourseActivityDTO, { code: 'AB-2CD' })
      expect(await isValid(dto)).toBe(false)
    })
  })

  describe('graded', () => {
    it('accepte une activité notée ou non', async () => {
      expect(await isValid(plainToInstance(UpdateCourseActivityDTO, { graded: true }))).toBe(true)
      expect(await isValid(plainToInstance(UpdateCourseActivityDTO, { graded: false }))).toBe(true)
    })

    it('rejette une valeur qui n’est pas un booléen', async () => {
      expect(await isValid(plainToInstance(UpdateCourseActivityDTO, { graded: 'oui' }))).toBe(false)
    })
  })
})
