import React from "react";
import {CKEditor} from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface propsTypes {
    setEdit: (num: string) => void;
    getEdit: string;
}

const CustomEditor = ({ setEdit,getEdit }: propsTypes) => {
    return (<CKEditor
        editor={ClassicEditor as any}
        onReady={(editor) => {
            console.log('Editor is ready to use!', editor);
        }}
        config={{
            toolbar: {
                items: ['undo', 'redo', '|', 'heading', '|', 'bold', 'italic', 'underline', '|', 'link', 'insertImageViaUrl', 'mediaEmbed', 'insertTable', 'blockQuote', '|', 'bulletedList', 'numberedList', 'outdent', 'indent'],
            },
            initialData: getEdit,
        }}
        onChange={(event, editor) => {
            setEdit(editor.getData())
        }}
    />);
}

export default CustomEditor;