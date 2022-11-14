import { useMemo } from 'react'
import { BaseEditor } from 'slate'
import { ReactEditor } from 'slate-react'
import { HistoryEditor } from 'slate-history'
import { createEditor, Transforms } from 'slate'
import { withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { jsx } from 'slate-hyperscript'

type EditorType = BaseEditor & ReactEditor & HistoryEditor

export function useEditor() {
    const editor = useMemo(
        () => withHtml(withReact(withHistory(createEditor()))),
        []
    ) as EditorType

    return editor
}

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
    U: () => ({ underline: true }),
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
        debugger
        // @ts-ignore
      const attrs = TEXT_TAGS[nodeName](el)
      // @ts-ignore
      return children.map(child => jsx('text', attrs, child))
    }
  
    return children
}

// export const deserialize = (el: Node): any => {
//     if (el.nodeType === 3) {
//         return el.textContent
//     } else if (el.nodeType !== 1) {
//         return null
//     } 
//     // else if (el.nodeName === 'BR') {
//     //     return '\n'
//     // }

//     const { nodeName } = el
//     let parent = el

//     if (
//         nodeName === 'PRE' &&
//         el.childNodes[0] &&
//         el.childNodes[0].nodeName === 'CODE'
//     ) {
//         parent = el.childNodes[0]
//     }
//     let children = Array.from(parent.childNodes)
//         .map(deserialize)
//         .flat()

//     if (children.length === 0) {
//         children = [{ text: '' }]
//     }

//     if (el.nodeName === 'BODY') {
//         return jsx('fragment', {}, children)
//     }

//     if (ELEMENT_TAGS[nodeName]) {
//         const attrs = ELEMENT_TAGS[nodeName]()
//         return jsx('element', attrs, children)
//     }

//     if (TEXT_TAGS[nodeName]) {
//         const attrs = TEXT_TAGS[nodeName]()
//         return children.map(child => jsx('text', attrs, child))
//     }

//     return children
// }

const withHtml = (editor: EditorType) => {
    const { insertData, isInline, isVoid } = editor

    editor.isInline = element => {
        return element.type === 'link' ? true : isInline(element)
    }

    editor.isVoid = element => {
        return element.type === 'image' ? true : isVoid(element)
    }

    editor.insertData = data => {
        const html = data.getData('text/html')

        if (html) {
            const parsed = new DOMParser().parseFromString(html, 'text/html')
            const fragment = deserialize(parsed.body)
            Transforms.insertFragment(editor, fragment)
            return
        }

        insertData(data)
    }

    return editor
}