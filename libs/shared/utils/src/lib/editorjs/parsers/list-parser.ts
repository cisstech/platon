interface ListItem {
  content: string
  items: ListItem[]
}

/** A nested list gives objects; a flat list, written by the older list tool, gives strings. */
interface ListData {
  style: 'ordered' | 'unordered'
  items: (ListItem | string)[]
}

const listOf = (tag: 'ol' | 'ul', items: (ListItem | string)[]): string => {
  const children = items.map((item) =>
    typeof item === 'string'
      ? `<li>${item}</li>`
      : `<li>${item.content}${item.items?.length ? listOf(tag, item.items) : ''}</li>`
  )
  return `<${tag} style="padding-left: 1em;">${children.join('')}</${tag}>`
}

export const ListParser = function (data: ListData): string {
  return listOf(data.style === 'ordered' ? 'ol' : 'ul', data.items)
}
