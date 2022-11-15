import { Text } from 'slate'
import type { Node as NodeType } from 'slate'
import { jsx } from 'slate-hyperscript'
import type { Element } from 'slate'

const ELEMENT_TAGS: { [key: string]: () => ({ type: string }) } = {
    // A: el => ({ type: 'link', url: el.getAttribute('href') }),
    A: () => ({ type: 'paragraph' }),
    BLOCKQUOTE: () => ({ type: 'quote' }),
    H1: () => ({ type: 'heading-one' }),
    H2: () => ({ type: 'heading-two' }),
    H3: () => ({ type: 'heading-three' }),
    H4: () => ({ type: 'heading-four' }),
    H5: () => ({ type: 'heading-five' }),
    H6: () => ({ type: 'heading-six' }),
    // IMG: el => ({ type: 'image', url: el.getAttribute('src') }),
    LI: () => ({ type: 'list-item' }),
    OL: () => ({ type: 'numbered-list' }),
    P: () => ({ type: 'paragraph' }),
    PRE: () => ({ type: 'code' }),
    UL: () => ({ type: 'bulleted-list' }),
}

// COMPAT: `B` is omitted here because Google Docs uses `<b>` in weird ways.
const TEXT_TAGS: { [key: string]: () => ({ [key: string]: boolean }) } = {
    CODE: () => ({ code: true }),
    DEL: () => ({ strikethrough: true }),
    EM: () => ({ italic: true }),
    I: () => ({ italic: true }),
    S: () => ({ strikethrough: true }),
    STRONG: () => ({ bold: true }),
    // TO DO: Apparently this has problems when pasting from Google Docs
    B: () => ({ bold: true }),
    U: () => ({ underline: true })
}

export const serialize = (node: NodeType & { bold?: boolean, underline?: boolean, italic?: boolean, type?: string }): string => {
    if (Text.isText(node)) {
        let string = node.text
        if (node.bold) {
            string = `<strong>${string}</strong>`
        }
        if (node.underline) {
            string = `<span class='underline'>${string}</span>`
        }
        if (node.italic) {
            string = `<span class='italic'>${string}</span>`
        }

        return string
    }

    const children = node.children.map(n => serialize(n)).join('')

    switch (node.type) {
        case 'paragraph':
            return `<p>${children}</p>`
        case 'heading-one':
        case 'heading-two':
            return `<p><strong>${children}</strong></p>`
        case 'bulleted-list':
            return `<ul>${children}</ul>`
        case 'numbered-list':
            return `<ol>${children}</ol>`
        case 'list-item':
            return `<li>${children}</li>`
        default:
            return children
    }
}

// @ts-ignore
export const deserialize = el => {
    if (el.nodeType === 3) {
      return el.textContent
    } else if (el.nodeType !== 1) {
      return null
    } else if (el.nodeName === 'BR') {
      return '\n'
    }
  
    const { nodeName } = el
    let parent = el
  
    if (
      nodeName === 'PRE' &&
      el.childNodes[0] &&
      el.childNodes[0].nodeName === 'CODE'
    ) {
      parent = el.childNodes[0]
    }

    // @ts-ignore
    let children = Array.from(parent.childNodes)
      .map(deserialize)
      .flat()
  
    if (children.length === 0) {
      children = [{ text: '' }]
    }
  
    if (el.nodeName === 'BODY') {
      return jsx('fragment', {}, children)
    }
  
    if (ELEMENT_TAGS[nodeName]) {
        // @ts-ignore
      const attrs = ELEMENT_TAGS[nodeName](el)
      return jsx('element', attrs, children)
    }
  
    if (TEXT_TAGS[nodeName]) {
        // @ts-ignore
      const attrs = TEXT_TAGS[nodeName](el)
      // @ts-ignore
      return children.map(child => jsx('text', attrs, child))
    }
  
    return children
}