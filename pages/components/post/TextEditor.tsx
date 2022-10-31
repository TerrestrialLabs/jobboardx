import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react'
import { createEditor, Editor, Text, Transforms } from 'slate';
import { withHistory } from 'slate-history'
import { Editable, Slate, useSlate, withReact } from 'slate-react';
import isHotkey from 'is-hotkey'
import { FaBold, FaItalic, FaUnderline } from 'react-icons/fa'
import { jsx } from 'slate-hyperscript'

import type { Element } from 'slate'
import { BaseEditor } from 'slate'
import { ReactEditor } from 'slate-react'
import { HistoryEditor } from 'slate-history'


export const HOTKEYS: any = {
    "mod+b": "bold",
    "mod+i": "italic",
    "mod+u": "underline"
}

declare module 'slate' {
    export interface BaseElement {
        type?: string;
    }
}

type EditorType = BaseEditor & ReactEditor & HistoryEditor

type SlateValue = { type: string, children: { text: string }[] }[]

type TextEditorProps = {
    slateValue: SlateValue,
    setSlateValue: (value: SlateValue) => void
}

const TextEditor = ({ slateValue, setSlateValue }: TextEditorProps) => {
    const [showHoverState, setShowHoverState] = useState(false)

    const editor = useMemo(
        () => withHtml(withReact(withHistory(createEditor()))),
        []
    ) as EditorType
    const showPlaceholder = slateValue.length === 1 && !slateValue[0].children[0].text.length

    const renderLeaf = useCallback((props: any) => <SlateLeaf {...props} />, [])
    const renderElement = useCallback((props: any) => <SlateElement {...props} />, [])

    return (
        <Box>
            <Box 
                onMouseEnter={() => !showHoverState && setShowHoverState(true)}
                onMouseLeave={() => showHoverState && setShowHoverState(false)}
                onClick={() => setShowHoverState(false)}
                sx={{ position: 'relative', borderTopLeftRadius: '4px', borderTopRightRadius: '4px', backgroundColor: showHoverState ? 'rgba(0, 0, 0, 0.09)' : 'rgba(0, 0, 0, 0.06)' }}
            >
                <Slate
                    editor={editor}
                    value={slateValue}
                    onChange={(value: any) => setSlateValue(value)}
                >
                <Toolbar />

                <Editable
                    renderLeaf={renderLeaf}
                    renderElement={renderElement}
                    onBlur={() => setShowHoverState(false)}
                    onKeyDown={(event: any) => {
                        for (const hotkey in HOTKEYS) {
                            if (isHotkey(hotkey, event)) {
                                event.preventDefault();
                                const mark = HOTKEYS[hotkey];
                                toggleMark(editor, mark);
                            }
                        }
                    }}
                    style={{ 
                        height: 259,
                        padding: '2px 12px 17px',
                        fontFamily: 'Poppins',
                        overflowY: 'scroll'
                    }}
                />

                {showPlaceholder && <Typography style={{ position: 'absolute', top: '54px', left: '12px', pointerEvents: 'none' }} color='#999'>{'Job Description'}</Typography>}
            </Slate>
        </Box>
      </Box>
    )
}

export default TextEditor

const SlateLeaf = ({ attributes, children, leaf }: any) => {
    if (leaf.bold) {
      children = <strong>{children}</strong>;
    }
  
    if (leaf.italic) {
      children = <em>{children}</em>;
    }
  
    if (leaf.underline) {
      children = <u>{children}</u>;
    }
  
    return <span {...attributes}>{children}</span>;
}

const SlateElement = ({ attributes, children, element }: any) => {
    switch (element.type) {
      default:
        return <p {...attributes}>{children}</p>
      case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>
    //   case 'heading-one':
    //     return <h1 {...attributes}>{children}</h1>
    //   case 'heading-two':
    //     return <h2 {...attributes}>{children}</h2>
    //   case 'heading-three':
    //     return <h3 {...attributes}>{children}</h3>
    //   case 'heading-four':
    //     return <h4 {...attributes}>{children}</h4>
    //   case 'heading-five':
    //     return <h5 {...attributes}>{children}</h5>
    //   case 'heading-six':
    //     return <h6 {...attributes}>{children}</h6>
      case 'list-item':
        return <li {...attributes}>{children}</li>
      case 'numbered-list':
        return <ol {...attributes}>{children}</ol>
    //   case 'link':
    //     return (
    //       <a href={element.url} {...attributes}>
    //         {children}
    //       </a>
    //     )
    }
}

const Toolbar = () => {
    return (
        <Box sx={{ backgroundColor: 'lightgrey', display: 'flex', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}>
            <ToggleButtonGroup>
                {MarkButton({ 
                    format: "bold", 
                    icon: <FaBold size={14} /> 
                })}
                {MarkButton({
                    format: "italic",
                    icon: <FaItalic size={14} />,
                })}
                {MarkButton({
                    format: "underline",
                    icon: <FaUnderline size={14} />,
                })}
            </ToggleButtonGroup>
        </Box>
    )
}

export const isMarkActive = (editor: any, format: any) => {
    const marks = Editor.marks(editor);
    // @ts-ignore
    return marks ? marks[format] === true : false;
  }
  
export const toggleMark = (editor: any, format: any) => {
    const isActive = isMarkActive(editor, format);

    if (isActive) {
        Editor.removeMark(editor, format);
    } else {
        Editor.addMark(editor, format, true);
    }
}

export const MarkButton = ({ format, icon }: any) => {
    const editor = useSlate();
    return (
        <ToggleButton
            style={{ border: 0 }}
            value={format}
            selected={isMarkActive(editor, format)}
            onMouseDown={(event: any) => {
                event.preventDefault();
                toggleMark(editor, format);
            }}
        >
            {icon}
        </ToggleButton>
    )
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

export const deserialize = (el: Node): any => {
    if (el.nodeType === 3) {
        return el.textContent
    } else if (el.nodeType !== 1) {
        return null
    } 
    // else if (el.nodeName === 'BR') {
    //     return '\n'
    // }

    const { nodeName } = el
    let parent = el

console.log("NODE NAME: ", nodeName)

    if (
        nodeName === 'PRE' &&
        el.childNodes[0] &&
        el.childNodes[0].nodeName === 'CODE'
    ) {
        parent = el.childNodes[0]
    }
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
        const attrs = ELEMENT_TAGS[nodeName]()
        return jsx('element', attrs, children)
    }

    if (TEXT_TAGS[nodeName]) {
        const attrs = TEXT_TAGS[nodeName]()
        return children.map(child => jsx('text', attrs, child))
    }

    // if (ELEMENT_TAGS[nodeName]) {
    //     const attrs = ELEMENT_TAGS[nodeName](el)
    //     return jsx('element', attrs, children)
    // }

    // if (TEXT_TAGS[nodeName]) {
    //     const attrs = TEXT_TAGS[nodeName](el)
    //     return children.map(child => jsx('text', attrs, child))
    // }

    return children
}

const withHtml = (editor: EditorType) => {
    const { insertData, isInline, isVoid } = editor

console.log('withHTML')

    editor.isInline = element => {
        return element.type === 'link' ? true : isInline(element)
    }

    editor.isVoid = element => {
        return element.type === 'image' ? true : isVoid(element)
    }

    editor.insertData = data => {
        const html = data.getData('text/html')

console.log("PASTE")

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