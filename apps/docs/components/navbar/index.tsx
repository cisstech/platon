import { Navbar as BaseNavBar } from 'nextra-theme-docs'
import { Item, MenuItem, PageItem } from 'nextra/normalize-pages'
import React, { useMemo } from 'react'
import { useBaseUrl } from '../../hooks'

type Props = {
  flatDirectories: Item[]
  items: (PageItem | MenuItem)[]
}

export const Navbar: React.FC<Props> = (props) => {
  const baseUrl = useBaseUrl()
  let newProps = useMemo(() => {
    const href = `${baseUrl === '/' ? '' : baseUrl}/docs/components`
    const components = {
      name: 'components',
      route: href,
      title: 'Composants',
      type: 'page' as const,
      href,
      newWindow: false,
    } as any

    return {
      ...props,
      flatDirectories: [...props.flatDirectories, components],
      items: [...props.items.slice(0, props.items.length - 1), components, props.items[props.items.length - 1]],
    }
  }, [baseUrl, props])

  return <BaseNavBar {...newProps} />
}
