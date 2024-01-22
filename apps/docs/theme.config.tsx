import { DocsThemeConfig } from 'nextra-theme-docs'
import React from 'react'
import { Copyright, Logo, Navbar } from './components'

const config: DocsThemeConfig = {
  logo: <Logo />,
  logoLink: false,
  project: {
    link: 'https://github.com/cisstech/platon',
  },
  docsRepositoryBase: 'https://github.com/cisstech/platon/tree/main/apps/docs/',
  footer: {
    text: <Copyright />,
  },
  search: {
    placeholder: 'Rechercher...',
    emptyResult: 'Aucun résultat',
  },
  toc: {
    title: 'Sur cette page',
  },
  editLink: {
    text: 'Modifier cette page sur GitHub',
  },
  feedback: {
    content: 'Une question ? Envoyez-nous un message',
  },
  navbar: {
    component: (props) => <Navbar {...props} />,
  },
  gitTimestamp: ({ timestamp }) => {
    return <>Dernière date de modification {timestamp.toLocaleString()}</>
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s | PLaTon',
      defaultTitle: 'PLaTon - Platform for Learning and Teaching Online.',
      description:
        'PLaTon is an open-source online learning and teaching platform designed to facilitate the creation, management, and sharing of educational resources.',
      openGraph: {
        type: 'website',
        siteName: 'PLaTon | Documentation',
        images: [
          { url: 'https://raw.githubusercontent.com/cisstech/platon/main/shared/assets/images/illustrations/hero.png' },
        ],
      },
    }
  },
}

export default config
