"use client";

import Editor from "@monaco-editor/react";

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function CodeEditor({
  value,
  onChange,
}: CodeEditorProps) {
  return (
    <Editor
      height="100%"
      language="javascript"
      theme="vs-dark"
      value={value}
      onChange={(value) => onChange(value ?? "")}
      options={{
        minimap: {
          enabled: false,
        },
        fontSize: 13,
        lineNumbers: "on",
        wordWrap: "on",
        padding: {
          top: 16,
          bottom: 16,
        },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        formatOnPaste: true,
        formatOnType: true,
      }}
    />
  );
}