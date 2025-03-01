import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing'
import { Tree, readProjectConfiguration } from '@nx/devkit'

import { wcBuildDocsGenerator } from './generator'
import { WcBuildDocsGeneratorSchema } from './schema'

describe('wc-build-docs generator', () => {
  let tree: Tree
  const options: WcBuildDocsGeneratorSchema = { name: 'test' }

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace()
  })

  it('should run successfully', async () => {
    await wcBuildDocsGenerator(tree, options)
    const config = readProjectConfiguration(tree, 'test')
    expect(config).toBeDefined()
  })
})
