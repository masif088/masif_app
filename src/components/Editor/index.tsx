import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';

// Dynamically import CKEditor to avoid SSR issues
const CKEditorComponent = dynamic(() => import('./CKEditorComponent'), {
    ssr: false,
    loading: () => (
        <div className="border rounded p-3 bg-light d-flex align-items-center justify-content-center" style={{ minHeight: '200px' }}>
            <div className="text-center">
                <div className="spinner-border text-primary mb-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <div className="text-muted">Loading CKEditor...</div>
            </div>
        </div>
    )
});

interface propsTypes {
    setEdit: (num: string) => void;
    getEdit: string;
    clearEditor?: () => void;
}

const CustomEditor = ({ setEdit, getEdit, clearEditor }: propsTypes) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className="border rounded p-3 bg-light d-flex align-items-center justify-content-center" style={{ minHeight: '200px' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="text-muted">Initializing editor...</div>
                </div>
            </div>
        );
    }

    return (
        <CKEditorComponent
            setEdit={setEdit}
            getEdit={getEdit}
            placeholder="Start typing your note..."
        />
    );
}

export default CustomEditor;