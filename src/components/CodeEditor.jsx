import React, { useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';

const CodeEditor = ({ value, onChange, language = 'javascript' }) => {
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleEditorChange = (value) => {
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div className="h-[500px] border rounded-lg overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage={language}
        defaultValue={value}
        theme="vs-dark"
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor; 