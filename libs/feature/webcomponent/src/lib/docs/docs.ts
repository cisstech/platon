import { Injector } from '@angular/core'
import { NgeDocLink, NgeDocMeta, NgeDocSettings } from '@cisstech/nge/doc'
import { WebComponentTypes } from '../web-component'
import { WebComponentService } from '../web-component.service'

export function createWebComponentDoc(meta?: Partial<NgeDocMeta>): NgeDocSettings {
  return {
    meta: {
      name: 'Composants',
      root: '/docs/components/',
      logo: 'assets/images/logo/platon.svg',
      backUrl: '/docs',
      repo: {
        name: 'platon-front',
        url: 'https://github.com/PremierLangage/platon-front',
      },
      ...(meta || {}),
    },
    pages: [
      {
        title: 'Présentation',
        href: 'presentation',
        renderer: 'assets/docs/components/docs/presentation.md',
      },
      {
        title: 'CSS',
        href: 'css',
        renderer: () => import('./css/css.module').then((m) => m.CssModule),
      },
      //{
      //  title: 'Playground',
      //  href: 'playground',
      //  renderer: () => import('./playground/playground.module').then((m) => m.PlaygroundModule),
      //},
      (injector: Injector) => {
        const api = injector.get(WebComponentService)
        return {
          title: 'Forms',
          href: 'forms',
          renderer: () => import('./listing/listing.module').then((m) => m.ListingModule),
          inputs: { type: WebComponentTypes.form },
          children: links(api, WebComponentTypes.form),
        }
      },
      (injector: Injector) => {
        const api = injector.get(WebComponentService)
        return {
          title: 'Widgets',
          href: 'widgets',
          renderer: () => import('./listing/listing.module').then((m) => m.ListingModule),
          inputs: { type: WebComponentTypes.widget },
          children: links(api, WebComponentTypes.widget),
        }
      },
    ],
  }
}

function links(api: WebComponentService, type: WebComponentTypes): NgeDocLink[] {
  return api.ofType(type).map((e) => {
    const name = e.selector.replace('wc-', '')
    return {
      href: e.selector,
      title: e.name,
      icon: e.icon,
      renderer: () => import('./docs.module').then((m) => m.DocsModule),
      actions: [
        {
          title: 'Éditer sur Github',
          icon: 'https://icongr.am/octicons/mark-github.svg',
          run: `https://github.com/cisstech/platon/blob/main/libs/feature/webcomponent/src/lib/${type}s/${name}`,
        },
      ],
      inputs: {
        definition: e,
      },
    }
  })
}
