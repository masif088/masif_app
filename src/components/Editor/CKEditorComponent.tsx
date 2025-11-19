import React, { useCallback, useMemo } from "react";
import {CKEditor} from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface CKEditorProps {
    setEdit: (value: string) => void;
    getEdit: string;
    placeholder?: string;
}

const CKEditorComponent = ({ setEdit, getEdit, placeholder = "Start typing..." }: CKEditorProps) => {
    // Memoize the editor configuration to prevent unnecessary re-renders
    const editorConfig = useMemo(() => ({
        placeholder: placeholder,
        resize_enabled: true,
        removePlugins: ['resize'],
        
        toolbar: {
            items: ['undo', 'redo', '|', 'heading', '|', 'bold', 'italic', 'underline', '|', 'link', 'insertImageViaUrl', 'mediaEmbed', 'insertTable', 'blockQuote', '|', 'bulletedList', 'numberedList', 'outdent', 'indent'],
        },
        height: 400,
        // Only remove plugins that don't have dependencies
        // removePlugins: ['Title', 'MediaEmbed', 'Table'],
    }), [placeholder]);

    // Memoize the onChange handler to prevent unnecessary re-renders
    const handleChange = useCallback((event: any, editor: any) => {
        const data = editor.getData();
        setEdit(data);
    }, [setEdit]);

    return (
        <CKEditor
            editor={ClassicEditor as any}
            data={getEdit}
            // config={editorConfig}
            
            onChange={handleChange}
            
        />
    );
};

export default CKEditorComponent;
