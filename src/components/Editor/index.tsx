import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';

// Dynamically import the entire editor component to avoid SSR issues
const CustomEditorComponent = dynamic(() => import('./EditorComponent'), {
    ssr: false,
    loading: () => <div className="border rounded p-3 bg-light">Loading editor...</div>
});

interface propsTypes {
    setEdit: (num: string) => void;
    getEdit: string;
}

const CustomEditor = ({ setEdit, getEdit }: propsTypes) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <div className="border rounded p-3 bg-light">Loading editor...</div>;
    }

    return <CustomEditorComponent setEdit={setEdit} getEdit={getEdit} />;
}

export default CustomEditor;