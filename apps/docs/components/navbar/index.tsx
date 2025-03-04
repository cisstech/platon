import { Navbar as BaseNavBar } from 'nextra-theme-docs'
import { Item, MenuItem, PageItem } from 'nextra/normalize-pages'
import React from 'react'

type Props = {
  flatDirectories: Item[]
  items: (PageItem | MenuItem)[]
}

export const Navbar: React.FC<Props> = (props) => {
  return <BaseNavBar {...props} />
}
