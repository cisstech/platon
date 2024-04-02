import { emptyResourcePermissions } from './permissions.model'
import {
  CircleTree,
  Resource,
  branchFromCircleTree,
  circleAncestors,
  circleTreeFromCircleList,
  flattenCircleTree,
} from './resource.model'

describe('circleAncestors', () => {
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
    expect(circleAncestors(tree, '1', false)).toEqual([])
  })

  it('should return array with tree if includeSelf is true and tree id matches resourceId', () => {
    expect(circleAncestors(tree, '1', true)).toEqual([tree])
  })

  it('should return array with ancestors if tree id does not match resourceId', () => {
    const result = circleAncestors(tree, '3', true).map((ancestor) => ancestor.id)
    expect(result).toEqual(['3', '2', '1'])
  })

  it('should return empty array if resourceId does not exist in tree', () => {
    expect(circleAncestors(tree, '6', true)).toEqual([])
  })
})

describe('flattenCircleTree', () => {
  it('should return a flat array of circle trees', () => {
    const node5: Partial<CircleTree> = { id: '5' }
    const node4: Partial<CircleTree> = { id: '4' }
    const node3: Partial<CircleTree> = { id: '3' }
    const node2: Partial<CircleTree> = { id: '2', children: [node3 as CircleTree, node4 as CircleTree] }

    const tree: CircleTree = {
      id: '1',
      children: [node2, node5],
    } as CircleTree

    const expectedFlatTree: Partial<CircleTree>[] = [
      { id: '1', children: tree.children },
      { id: '2', children: node2.children },
      { id: '3' },
      { id: '4' },
      { id: '5' },
    ]

    const result = flattenCircleTree(tree)
    expect(result).toEqual(expectedFlatTree)
  })
})

describe('branchFromCircleTree', () => {
  const tree: CircleTree = {
    id: '1',
    children: [
      {
        id: '2',
        children: [{ id: '3' } as CircleTree, { id: '4' } as CircleTree],
      } as CircleTree,
      { id: '5' } as CircleTree,
    ],
  } as CircleTree

  it('should return the circle with the specified id if it exists in the tree', () => {
    const result = branchFromCircleTree(tree, '3')
    expect(result).toEqual({ id: '3' })
  })

  it('should return undefined if the circle with the specified id does not exist in the tree', () => {
    const result = branchFromCircleTree(tree, '6')
    expect(result).toBeUndefined()
  })

  it('should return the root circle if the specified id is the id of the root circle', () => {
    const result = branchFromCircleTree(tree, '1')
    expect(result).toEqual(tree)
  })
})

describe('circleTreeFromCircleList', () => {
  it('should throw an error if root circle is not found', () => {
    const circles: Resource[] = []
    const versions: Record<string, string[]> = {}
    expect(() => circleTreeFromCircleList(circles, versions)).toThrow('Root circle not found')
  })

  it('should return the correct circle tree', () => {
    const circles: Partial<Resource>[] = [
      { id: '1', name: 'Circle 1', code: 'C1' },
      { id: '2', name: 'Circle 2', code: 'C2', parentId: '1' },
      { id: '3', name: 'Circle 3', code: 'C3', parentId: '2' },
      { id: '4', name: 'Circle 4', code: 'C4', parentId: '2' },
      { id: '5', name: 'Circle 5', code: 'C5', parentId: '1' },
    ]
    const versions: Record<string, string[]> = {
      '1': ['v1', 'v2'],
      '2': ['v3'],
      '3': [],
      '4': ['v4'],
      '5': [],
    }
    const expectedTree: CircleTree = {
      id: '1',
      name: 'Circle 1',
      code: 'C1',
      versions: ['v1', 'v2'],
      permissions: emptyResourcePermissions(),
      children: [
        {
          id: '2',
          name: 'Circle 2',
          code: 'C2',
          versions: ['v3'],
          permissions: emptyResourcePermissions(),
          children: [
            {
              id: '3',
              name: 'Circle 3',
              code: 'C3',
              versions: [],
              permissions: emptyResourcePermissions(),
            },
            {
              id: '4',
              name: 'Circle 4',
              code: 'C4',
              versions: ['v4'],
              permissions: emptyResourcePermissions(),
            },
          ],
        },
        {
          id: '5',
          name: 'Circle 5',
          code: 'C5',
          versions: [],
          permissions: emptyResourcePermissions(),
        },
      ],
    }
    expect(circleTreeFromCircleList(circles as unknown as Resource[], versions)).toEqual(expectedTree)
  })
})
