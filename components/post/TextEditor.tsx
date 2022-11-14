import { Box, FilledInput, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react'
import { createEditor, Editor, Text, Transforms } from 'slate';
import { withHistory } from 'slate-history'
import { Editable, Slate, useSlate, withReact } from 'slate-react';
import isHotkey from 'is-hotkey'
import { FaBold, FaItalic, FaUnderline } from 'react-icons/fa'
import { MdFormatListNumbered, MdList } from 'react-icons/md'
import { jsx } from 'slate-hyperscript'
import type { Node as NodeType } from 'slate'

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
    editor: EditorType,
    error: boolean,
    slateValue: SlateValue,
    setSlateValue: (value: SlateValue) => void
}

const TextEditor = ({ editor, error, slateValue, setSlateValue }: TextEditorProps) => {
    const [showHoverState, setShowHoverState] = useState(false)

    // const editor = useMemo(
    //     () => withHtml(withReact(withHistory(createEditor()))),
    //     []
    // ) as EditorType
    const showPlaceholder = slateValue.length === 1 && slateValue[0].children[0].text && !slateValue[0].children[0].text.length

    const renderLeaf = useCallback((props: any) => <SlateLeaf {...props} />, [])
    const renderElement = useCallback((props: any) => <SlateElement {...props} />, [])

    return (
        <Box>
            <Box 
                onMouseEnter={() => !showHoverState && setShowHoverState(true)}
                onMouseLeave={() => showHoverState && setShowHoverState(false)}
                onClick={() => setShowHoverState(false)}
                sx={{ position: 'relative', borderBottom: error ? '2px solid #ff1644' : 'none', borderTopLeftRadius: '4px', borderTopRightRadius: '4px', backgroundColor: showHoverState ? 'rgba(0, 0, 0, 0.09)' : 'rgba(0, 0, 0, 0.06)' }}
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
                <Box width='1rem' />
                {BlockButton({
                    format: "numbered-list",
                    icon: <MdFormatListNumbered size={24} />,
                })}
                {BlockButton({
                    format: "bulleted-list",
                    icon: <MdList size={30} />,
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

export const isBlockActive = (editor: any, format: any) => {
    // @ts-ignore
    const [match] = Editor.nodes(editor, {
    // @ts-ignore
      match: (n) => n.type === format
    })
    return !!match;
}
  
export const toggleMark = (editor: any, format: any) => {
    const isActive = isMarkActive(editor, format);

    if (isActive) {
        Editor.removeMark(editor, format);
    } else {
        Editor.addMark(editor, format, true);
    }
}

export const toggleBlock = (editor: any, format: any) => {
    const LIST_TYPES = ["numbered-list", "bulleted-list"]
    const isActive = isBlockActive(editor, format);
    const isList = LIST_TYPES.includes(format);
  
    Transforms.unwrapNodes(editor, {
        // @ts-ignore
        match: n => LIST_TYPES.includes(n.type),
        split: true
    })
  
    Transforms.setNodes(editor, {
      type: isActive ? "paragraph" : isList ? "list-item" : format
    });
  
    if (!isActive && isList) {
      const block = { type: format, children: [] };
      Transforms.wrapNodes(editor, block);
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

const BlockButton = ({ format, icon }: any) => {
    const editor = useSlate();
    return (
        <ToggleButton
            style={{ border: 0, padding: 0, height: 36, width: 36 }}
            value={format}
            selected={isBlockActive(editor, format)}
            onMouseDown={(event: any) => {
                event.preventDefault();
                toggleBlock(editor, format);
            }}
        >
            {icon}
        </ToggleButton>
    );
}

export const TextEditorPlaceholder = () => {
    return (
        <Box>
            <Box sx={{ backgroundColor: 'lightgrey', display: 'flex', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}>
                <ToggleButton
                    disabled={true}
                    style={{ border: 0 }}
                    value={'bold'}
                    selected={false}
                >
                    <FaBold size={14} />
                </ToggleButton>
                <ToggleButton
                    disabled={true}
                    style={{ border: 0 }}
                    value={'italic'}
                    selected={false}
                >
                    <FaItalic size={14} />
                </ToggleButton>
                <ToggleButton
                    disabled={true}
                    style={{ border: 0 }}
                    value={'underline'}
                    selected={false}
                >
                    <FaUnderline size={14} />
                </ToggleButton>
                <Box width='1rem' />
                <ToggleButton
                    disabled={true}
                    style={{ border: 0, padding: 0, height: 36, width: 36 }}
                    value={'numbered-list'}
                    selected={false}
                >
                    <MdFormatListNumbered size={24} />
                </ToggleButton>
                <ToggleButton
                    disabled={true}
                    style={{ border: 0, padding: 0, height: 36, width: 36 }}
                    value={'bulleted-list'}
                    selected={false}
                >
                    <MdList size={30} />
                </ToggleButton>
            </Box>
            <FilledInput sx={{ borderRadius: 0 }} disabled disableUnderline fullWidth multiline rows={10} />
        </Box>
    )
}
