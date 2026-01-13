import React, { useState, useRef, useEffect, useCallback } from 'react';
import { __ } from '@wordpress/i18n';
import Quill from 'quill';
// import ImageResize from 'quill-image-resize-module-react';
// import ImageUploader from 'quill-image-uploader';
// import BlotFormatter from 'quill-blot-formatter';
// import Table from 'quill-table';
// import htmlEditButton from 'quill-html-edit-button';
// import Button from '@Components/Button';
// import ReactModal from '@Components/Modal/ReactModal';
import 'quill/dist/quill.snow.css';
import './styles.scss';

// custom HTML
const BlockEmbed = Quill.import('blots/block/embed');
// video
class CustomVideoBlot extends BlockEmbed {
    static create(value) {
        const node = super.create();
        node.setAttribute('src', value);
        node.setAttribute('controls', true);
        node.setAttribute('class', 'ablocks-custom-video');
        node.setAttribute('data-blot-formatter-unclickable-bound', true); // Remove this attribute
        return node;
    }

    static value(node) {
        return node.getAttribute('src');
    }
}

CustomVideoBlot.blotName = 'customVideo';
CustomVideoBlot.tagName = 'video';
Quill.register(CustomVideoBlot);

// audio
class CustomAudioBlot extends BlockEmbed {
    static create(value) {
        const node = super.create();
        node.setAttribute('src', value);
        node.setAttribute('controls', true);
        node.setAttribute('class', 'ablocks-custom-audio');
        node.setAttribute('data-blot-formatter-unclickable-bound', true); // Remove this attribute
        return node;
    }

    static value(node) {
        return node.getAttribute('src');
    }
}

CustomAudioBlot.blotName = 'customAudio';
CustomAudioBlot.tagName = 'audio';
Quill.register(CustomAudioBlot);

class CustomHTMLBlot extends BlockEmbed {
    static create(value) {
        const node = super.create();
        node.innerHTML = value;
        return node;
    }

    static value(node) {
        return node.innerHTML;
    }
}

CustomHTMLBlot.blotName = 'customHTML';
CustomHTMLBlot.tagName = 'div'; // You can change the tag as needed

Quill.register(CustomHTMLBlot);

// image upload
const Image = Quill.import('formats/image');
class CustomImage extends Image {
    static create(value) {
        const node = super.create(value);
        if (typeof value === 'object') {
            node.setAttribute('src', value.url);
            if (value.width) {
                node.setAttribute('width', value.width);
            }
            if (value.height) {
                node.setAttribute('height', value.height);
            }
            if (value.style) {
                node.setAttribute('style', value.style);
            }
        }
        return node;
    }

    static value(domNode) {
        return {
            url: domNode.getAttribute('src'),
            width: domNode.getAttribute('width'),
            height: domNode.getAttribute('height'),
            style: domNode.getAttribute('style'),
        };
    }

    format(name, value) {
        if (name === 'width' || name === 'height') {
            if (value) {
                this.domNode.setAttribute(name, value);
            } else {
                this.domNode.removeAttribute(name);
            }
        } else {
            super.format(name, value);
        }
    }
}

// Register modules
// Quill.register('modules/imageUploader', ImageUploader);
// // Quill.register('modules/imageResize', ImageResize);
// Quill.register('modules/blotFormatter', BlotFormatter);
// Quill.register('modules/htmlEditButton', htmlEditButton);
// Quill.register('modules/table', Table);
// Quill.register(CustomImage, true);

 const GamifyEditor=({
    name,
    defaultValue = '',
    saveValueHandler,
    suffix,
    isCustomHTML = false,
})=> {
    const quillRef = useRef(null);
    const [customHTML, setCustomHTML] = useState('');
    const [showCustomInserter, isShowCustomInserter] = useState(false);
    const isInitialized = useRef(false);
    const showCustomHTML = isCustomHTML ? [['customHTML']] : [];

    useEffect(() => {
        if (isInitialized.current) return;

        // Clean up any existing editor with same ID
        const existingContainer = document.getElementById(`gamify--${suffix}`);
        if (existingContainer && existingContainer.querySelector('.ql-editor')) {
            existingContainer.innerHTML = '';
        }

        const quill = new Quill(`#gamify--${suffix}`, {
            modules: {
                toolbar: {
                    container: [
                        [{ font: [] }],
                        [{ header: ['1', '2', '3', '4', '5', '6'] }],
                        [{ size: [] }],
                        [
                            'bold',
                            'italic',
                            'underline',
                            'strike',
                            'blockquote',
                            'code-block',
                        ],
                        [{ color: [] }, { background: [] }],
                        [
                            { list: 'ordered' },
                            { list: 'bullet' },
                            { indent: '-1' },
                            { indent: '+1' },
                            { align: [] },
                        ],
                        [{ script: 'sub' }, { script: 'super' }],
                        [{ direction: 'rtl' }],
                        ['link'],
                        ['clean'],
                        ...showCustomHTML,
                    ],
                    handlers: {
                        
                    },
                },
                clipboard: {
                    matchVisual: false,
                },
                blotFormatter: {},
                htmlEditButton: {
                    syntax: false,
                },
                'better-table': {
                    operationMenu: {
                        items: {
                            unmergeCells: {
                                text: 'Unmerge Cells',
                            },
                        },
                    },
                    table: true, // Enable table support
                },
            },
            theme: 'snow',
        });

        quillRef.current = quill;
        isInitialized.current = true;

        if (defaultValue) {
            quill.clipboard.dangerouslyPasteHTML(defaultValue);
        }

        const handleChange = () => {
            const content = quill.root.innerHTML;
            saveValueHandler(name,content);
        };

        quill.on('text-change', handleChange);

        return () => {
            if (quill) {
                quill.off('text-change', handleChange);
            }
        };
    }, [suffix]);

    useEffect(() => {
        if (!isInitialized.current || !quillRef.current) return;

        const quill = quillRef.current;
        const currentContent = quill.root.innerHTML;
        // Filter out empty paragraph tags with br and merge multiple paragraphs into one
        let normalizedDefault = (defaultValue || '').replace(/<p><br><\/p>/g, '');
        
        // Merge multiple paragraphs into single paragraph
        if (normalizedDefault.includes('<p>') && normalizedDefault.includes('</p>')) {
            const paragraphContent = normalizedDefault.match(/<p>(.*?)<\/p>/g);
            if (paragraphContent && paragraphContent.length > 1) {
                const combinedContent = paragraphContent
                    .map(p => p.replace(/<\/?p>/g, ''))
                    .join('');
                normalizedDefault = `<p>${combinedContent}</p>`;
            }
        }
        
        if (currentContent !== normalizedDefault && normalizedDefault) {
            const selection = quill.getSelection();
            quill.clipboard.dangerouslyPasteHTML(normalizedDefault);

            if (selection) {
                setTimeout(() =>
                    quill.setSelection(selection.index, selection.length)
                );
            }
        }
    }, [defaultValue]);

    return (
        <React.Fragment>
            <div id={`gamify--${suffix}`}></div>
       
        </React.Fragment>
    );
}
export default GamifyEditor
