import React, { useMemo, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './WysiwygEditor.css';
import { notify } from '../../../utils/util';

// Define proper TypeScript interfaces for Quill formats
interface QuillFontFormat {
  whitelist: string[];
}

// Register custom fonts with Quill - Fixed TypeScript typing
const Font = ReactQuill.Quill.import('formats/font') as QuillFontFormat;
Font.whitelist = [
  'arial', 'comic-sans', 'courier-new', 'georgia',
  'helvetica', 'lucida', 'times-new-roman', 'trebuchet-ms', 'verdana'
];
ReactQuill.Quill.register('formats/font', Font, true);


interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  className?: string;
  disabled?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
}

const WysiwygEditor: React.FC<WysiwygEditorProps> = ({
  value,
  onChange,
  placeholder = "Describe your product features, benefits, and specifications...",
  height = 300,
  className = "",
  disabled = false,
  onImageUpload
}) => {
  const quillRef = useRef<ReactQuill>(null);

  // Apply font styles to the document head
  useEffect(() => {
    // Check if styles are already added
    if (!document.getElementById('quill-custom-fonts')) {
      const style = document.createElement('style');
      style.id = 'quill-custom-fonts';
      style.textContent = `
        /* Font family styles for Quill editor - FIXED VERSION */
        .ql-font-arial span, .ql-font-arial { font-family: Arial, sans-serif !important; }
        .ql-font-comic-sans span, .ql-font-comic-sans { font-family: 'Comic Sans MS', cursive, fantasy !important; }
        .ql-font-courier-new span, .ql-font-courier-new { font-family: 'Courier New', monospace !important; }
        .ql-font-georgia span, .ql-font-georgia { font-family: Georgia, serif !important; }
        .ql-font-helvetica span, .ql-font-helvetica { font-family: Helvetica, Arial, sans-serif !important; }
        .ql-font-lucida span, .ql-font-lucida { font-family: 'Lucida Sans Unicode', 'Lucida Grande', sans-serif !important; }
        .ql-font-times-new-roman span, .ql-font-times-new-roman { font-family: 'Times New Roman', Times, serif !important; }
        .ql-font-trebuchet-ms span, .ql-font-trebuchet-ms { font-family: 'Trebuchet MS', sans-serif !important; }
        .ql-font-verdana span, .ql-font-verdana { font-family: Verdana, Geneva, sans-serif !important; }
        
        /* Apply to nested elements as well */
        .ql-font-arial * { font-family: Arial, sans-serif !important; }
        .ql-font-comic-sans * { font-family: 'Comic Sans MS', cursive, fantasy !important; }
        .ql-font-courier-new * { font-family: 'Courier New', monospace !important; }
        .ql-font-georgia * { font-family: Georgia, serif !important; }
        .ql-font-helvetica * { font-family: Helvetica, Arial, sans-serif !important; }
        .ql-font-lucida * { font-family: 'Lucida Sans Unicode', 'Lucida Grande', sans-serif !important; }
        .ql-font-times-new-roman * { font-family: 'Times New Roman', Times, serif !important; }
        .ql-font-trebuchet-ms * { font-family: 'Trebuchet MS', sans-serif !important; }
        .ql-font-verdana * { font-family: Verdana, Geneva, sans-serif !important; }
        
        /* Size styles */
        .ql-size-small { font-size: 0.75em !important; }
        .ql-size-large { font-size: 1.5em !important; }
        .ql-size-huge { font-size: 2.5em !important; }
        
        /* Ensure multiple formats work together */
        .ql-editor span[class*="ql-font"] { display: inline !important; }
        .ql-editor span[class*="ql-size"] { display: inline !important; }
        .ql-editor span[style*="color"] { display: inline !important; }
        
        /* Font dropdown labels - Show actual fonts in dropdown */
        .ql-picker.ql-font .ql-picker-label[data-value="arial"]::before,
        .ql-picker.ql-font .ql-picker-item[data-value="arial"]::before {
          content: 'Arial' !important;
          font-family: Arial, sans-serif !important;
        }
        .ql-picker.ql-font .ql-picker-label[data-value="comic-sans"]::before,
        .ql-picker.ql-font .ql-picker-item[data-value="comic-sans"]::before {
          content: 'Comic Sans' !important;
          font-family: 'Comic Sans MS', cursive, fantasy !important;
        }
        .ql-picker.ql-font .ql-picker-label[data-value="courier-new"]::before,
        .ql-picker.ql-font .ql-picker-item[data-value="courier-new"]::before {
          content: 'Courier New' !important;
          font-family: 'Courier New', monospace !important;
        }
        .ql-picker.ql-font .ql-picker-label[data-value="georgia"]::before,
        .ql-picker.ql-font .ql-picker-item[data-value="georgia"]::before {
          content: 'Georgia' !important;
          font-family: Georgia, serif !important;
        }
        .ql-picker.ql-font .ql-picker-label[data-value="helvetica"]::before,
        .ql-picker.ql-font .ql-picker-item[data-value="helvetica"]::before {
          content: 'Helvetica' !important;
          font-family: Helvetica, Arial, sans-serif !important;
        }
        .ql-picker.ql-font .ql-picker-label[data-value="lucida"]::before,
        .ql-picker.ql-font .ql-picker-item[data-value="lucida"]::before {
          content: 'Lucida Sans' !important;
          font-family: 'Lucida Sans Unicode', 'Lucida Grande', sans-serif !important;
        }
        .ql-picker.ql-font .ql-picker-label[data-value="times-new-roman"]::before,
        .ql-picker.ql-font .ql-picker-item[data-value="times-new-roman"]::before {
          content: 'Times New Roman' !important;
          font-family: 'Times New Roman', Times, serif !important;
        }
        .ql-picker.ql-font .ql-picker-label[data-value="trebuchet-ms"]::before,
        .ql-picker.ql-font .ql-picker-item[data-value="trebuchet-ms"]::before {
          content: 'Trebuchet MS' !important;
          font-family: 'Trebuchet MS', sans-serif !important;
        }
        .ql-picker.ql-font .ql-picker-label[data-value="verdana"]::before,
        .ql-picker.ql-font .ql-picker-item[data-value="verdana"]::before {
          content: 'Verdana' !important;
          font-family: Verdana, Geneva, sans-serif !important;
        }
        
        /* Default font label */
        .ql-picker.ql-font .ql-picker-label:not([data-value])::before,
        .ql-picker.ql-font .ql-picker-item[data-value=""]::before {
          content: 'Sans Serif' !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Custom image handler
  const imageHandler = () => {
    if (!onImageUpload) {
      notify('Image upload is not configured. Please use the main product image upload section.', 'warning');
      return;
    }

    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        notify('Image size should be less than 2MB', 'warning');
        return;
      }

      try {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;

        const range = quill.getSelection(true);
        quill.insertText(range.index, 'Uploading image...', 'user');

        const imageUrl = await onImageUpload(file);

        quill.deleteText(range.index, 'Uploading image...'.length);
        quill.insertEmbed(range.index, 'image', imageUrl, 'user');
        quill.setSelection(range.index + 1, 'user');
      } catch (error) {
        console.error('Image upload failed:', error);
        notify('Image upload failed. Please try again.', 'error');
      }
    };
  };

  // Enhanced toolbar configuration
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{
          'font': [
            'arial', 'comic-sans', 'courier-new', 'georgia',
            'helvetica', 'lucida', 'times-new-roman', 'trebuchet-ms',
            'verdana', false
          ]
        }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'align': [] }],
        [{ 'direction': 'rtl' }],
        ['blockquote', 'code-block'],
        ['link', ...(onImageUpload ? ['image'] : []), 'video'],
        ['clean']
      ],
      handlers: {
        ...(onImageUpload ? { image: imageHandler } : {})
      }
    },
    clipboard: {
      matchVisual: false,
    }
  }), [onImageUpload]);

  const formats = [
    'font', 'size',
    'header',
    'bold', 'italic', 'underline', 'strike',
    'script',
    'color', 'background',
    'list', 'bullet', 'check',
    'indent',
    'align', 'direction',
    'blockquote', 'code-block',
    'link', 'video',
    ...(onImageUpload ? ['image'] : [])
  ];

  return (
    <div className={`wysiwyg-editor-container ${className}`}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={disabled}
        style={{
          height: `${height}px`,
          marginBottom: '42px'
        }}
        className="wysiwyg-editor enhanced-fonts"
      />

      {!onImageUpload && (
        <p className="text-xs text-orange-600 mt-2">
          💡 Tip: Use the main image upload section above for product images. Text formatting only available here.
        </p>
      )}
    </div>
  );
};

export default WysiwygEditor;