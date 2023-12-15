import Link from 'next/link'
import Image from 'next/image'
import { DocsThemeConfig } from 'nextra-theme-docs'
import React from 'react'
import Logo from './public/platon.svg'

const config: DocsThemeConfig = {
  logo: (
    <Link
      href="/"
      prefetch={false}
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
      legacyBehavior
    >
      <div>
        <Image src={Logo} alt="Logo" width={64} height={64} />
        PLaTon
      </div>
    </Link>
  ),
  project: {
    link: 'https://github.com/cisstech/platon',
  },
  chat: {
    link: 'https://discord.com',
  },
  docsRepositoryBase: 'https://github.com/cisstech/platon',
  footer: {
    text: 'CISSTECH © 2023',
  },
}

export default config
