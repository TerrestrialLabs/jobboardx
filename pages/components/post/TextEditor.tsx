import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react'
import { createEditor, Editor, Text, Transforms } from 'slate';
import { withHistory } from 'slate-history'
import { Editable, Slate, useSlate, withReact } from 'slate-react';
import isHotkey from 'is-hotkey'
import { FaBold, FaItalic, FaUnderline } from 'react-icons/fa'

export const HOTKEYS: any = {
    "mod+b": "bold",
    "mod+i": "italic",
    "mod+u": "underline"
}

type SlateValue = { type: string, children: { text: string }[] }[]

type TextEditorProps = {
    slateValue: SlateValue,
    setSlateValue: (value: SlateValue) => void
}

const TextEditor = ({ slateValue, setSlateValue }: TextEditorProps) => {
    const [showHoverState, setShowHoverState] = useState(false)
    
    const editor = useMemo(
        () => withHistory(withReact(createEditor())),
        []
    )
    const showPlaceholder = slateValue.length === 1 && !slateValue[0].children[0].text.length

    const renderLeaf = useCallback((props: any) => {
        return <SlateLeaf {...props} />
      }, [])

    return (
        <Box>
            <Box 
                onMouseEnter={() => !showHoverState && setShowHoverState(true)}
                onMouseLeave={() => showHoverState && setShowHoverState(false)}
                onClick={() => setShowHoverState(false)}
                sx={{ position: 'relative', borderTopLeftRadius: '4px', borderTopRightRadius: '4px', backgroundColor: showHoverState ? 'rgba(0, 0, 0, 0.09)' : 'rgba(0, 0, 0, 0.06)', cursor: showHoverState ? 'pointer' : 'normal' }}
            >
                <Slate
                    editor={editor}
                    value={slateValue}
                    onChange={(value: any) => setSlateValue(value)}
                >
                <Toolbar />

                <Editable
                    renderLeaf={renderLeaf}
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
                        padding: '16px 12px 17px',
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