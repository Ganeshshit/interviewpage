import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

const CodeEditor = ({
  value,
  language,
  onChange,
  onLanguageChange,
  readOnly = false,
}) => {
  const [mounted, setMounted] = useState(false);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "csharp", label: "C#" },
    { value: "ruby", label: "Ruby" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
  ];

  const handleEditorChange = (val) => {
    if (onChange) onChange(val);
  };

  const handleLanguageChange = (e) => {
    if (onLanguageChange) onLanguageChange(e.target.value);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("Running...");

    try {
      const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
        language,
        version: "*",
        files: [
          {
            name: `main.${language === 'python' ? 'py' : language === 'javascript' ? 'js' : 'txt'}`,
            content: value,
          },
        ],
      });
      setOutput(response.data.run.output || "No output");
    }
    catch (error) {
      setOutput("Error running code");
      console.error("Execution error:", error);
    }

    setIsRunning(false);
  };

  if (!mounted) return <div>Loading editor...</div>;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between p-2 bg-gray-800 text-white">
        <select
          value={language}
          onChange={handleLanguageChange}
          className="px-3 py-1 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={readOnly}
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>

        {!readOnly && (
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="ml-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            {isRunning ? "Running..." : "Run"}
          </button>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly,
            automaticLayout: true,
          }}
        />
      </div>

      {/* Output */}
      {!readOnly && (
        <div className="mt-2 p-2 bg-gray-900 text-green-400 font-mono text-sm rounded">
          <h3 className="text-white font-bold mb-1">Output:</h3>
          <pre>{output}</pre>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
