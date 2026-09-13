import React from 'react';
import { RichTextEditor } from '@kodezen/editor';
import './styles.scss';

// GameEngine rich-text field. Thin adapter over @kodezen/editor's
// `RichTextEditor` (the shared Quill replacement also used by Academy,
// GemCRM, StoreEngine and Zaplane) onto GameEngine's editor contract:
// saveValueHandler(name, html). `suffix` is fixed to "gameengine" (not the
// per-field suffix call sites pass in) so every instance shares one
// `.kzeditor-embed-root--gameengine` theming hook — see styles.scss.
const GameEngineEditor = ({
    name,
    defaultValue = '',
    saveValueHandler,
    suffix, // eslint-disable-line no-unused-vars
    isCustomHTML = false, // eslint-disable-line no-unused-vars
}) => {
    return (
        <RichTextEditor
            value={defaultValue}
            onChange={({ html }) => saveValueHandler(name, html)}
            suffix="gameengine"
        />
    );
};

export default GameEngineEditor;
