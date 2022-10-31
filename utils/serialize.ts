import { Text } from 'slate'
import type { Node } from 'slate'

export const serialize = (node: Node & { bold?: boolean, underline?: boolean, italic?: boolean, type?: string }): string => {
    if (Text.isText(node)) {
        let string = node.text
        if (node.bold) {
            string = `<strong>${string}</strong>`
        }
        if (node.underline) {
            string = `<span class='underline'>${string}</span>`
        }
        if (node.italic) {
            string = `<span class='italic>${string}</span>`
        }

        return string
    }

    const children = node.children.map(n => serialize(n)).join('')

    switch (node.type) {
        case 'paragraph':
            return `<p>${children}</p>`
        default:
            return children
    }
}