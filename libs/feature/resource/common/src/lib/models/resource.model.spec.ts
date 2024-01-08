import { resourceAncestors, CircleTree } from './resource.model'

describe('resourceAncestors', () => {
  const tree = {
    id: '1',
    children: [
      {
        id: '2',
        children: [{ id: '3' }, { id: '4' }],
      },
      { id: '5' },
    ],
  } as CircleTree

  it('should return empty array if includeSelf is false and tree id matches resourceId', () => {
    expect(resourceAncestors(tree, '1', false)).toEqual([])
  })

  it('should return array with tree if includeSelf is true and tree id matches resourceId', () => {
    expect(resourceAncestors(tree, '1', true)).toEqual([tree])
  })

  it('should return array with ancestors if tree id does not match resourceId', () => {
    const result = resourceAncestors(tree, '3', true).map((ancestor) => ancestor.id)
    expect(result).toEqual(['3', '2', '1'])
  })

  it('should return empty array if resourceId does not exist in tree', () => {
    expect(resourceAncestors(tree, '6', true)).toEqual([])
  })
})
