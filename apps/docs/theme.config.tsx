import Link from 'next/link'
import Image from 'next/image'
import { DocsThemeConfig } from 'nextra-theme-docs'
import React from 'react'
import Logo from './public/platon.svg'

const config: DocsThemeConfig = {
  logo: (
    <Link href="/" prefetch={false} legacyBehavior>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Image src={Logo} alt="Logo" width={48} height={48} />
        Documentation PLaTon
      </div>
    </Link>
  ),
  project: {
    link: 'https://github.com/cisstech/platon',
  },
  docsRepositoryBase: 'https://github.com/cisstech/platon/tree/main/apps/docs/',
  footer: {
    text: 'CISSTECH © 2023',
  },
}

export default config
