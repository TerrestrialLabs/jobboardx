import { useMemo } from 'react'
import { BaseEditor, BaseElement, Descendant, Element, Editor, Node as SlateNode, Range, Text } from 'slate'
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
    // @ts-ignore
    A: (el: Node) => ({ type: 'link', url: el.getAttribute('href') }),
    // A: () => ({ type: 'paragraph' }),
    BLOCKQUOTE: () => ({ type: 'quote' }),
    H1: () => ({ type: 'heading-one' }),
    H2: () => ({ type: 'heading-two' }),
    // H3: () => ({ type: 'heading-three' }),
    // H4: () => ({ type: 'heading-four' }),
    // H5: () => ({ type: 'heading-five' }),
    // H6: () => ({ type: 'heading-six' }),
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
    // Just show these as bold instead of <h1>, <h2>
    // H1: () => ({ bold: true }),
    // H2: () => ({ bold: true }),
}

// Passing isGoogleDocs to disallow <b> tag since Google Docs uses it in a way that breaks copy/paste
// @ts-ignore
export const deserialize = (el: any, index: number, array: unknown[], isGoogleDocs?: boolean) => {
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
    let children: any = Array.from(parent.childNodes)
      .map((el, index, array) => deserialize(el, index, array, isGoogleDocs))
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
    // const attrs = ELEMENT_TAGS[nodeName]()
      return jsx('element', attrs, children)
    }

    if (TEXT_TAGS[nodeName]) {
        if (nodeName !== 'B' || (nodeName === 'B' && !isGoogleDocs)) {
            //   const attrs = TEXT_TAGS[nodeName](el)
            const attrs = TEXT_TAGS[nodeName]()
            // return children.map((child: Node) => jsx('text', attrs, child))
            return children.map((child: Node) => {
                if (Element.isElement(child)) {
                return jsx('element', child)
                }
                return jsx('text', attrs, child)
            })
        }
    }
  
    return children
}

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
        const googleDocs = data.getData('application/x-vnd.google-docs-document-slice-clip+wrapped')

        if (html) {
            const parsed = new DOMParser().parseFromString(html, 'text/html')
            let fragment = deserialize(parsed.body, 0, [], !!googleDocs)
            // Remove trailing lines after pasting
            fragment = fragment.filter((node: any) => node?.text !== '\n')
            Transforms.insertFragment(editor, fragment)
            return
        }

        insertData(data)
    }



    return editor
}