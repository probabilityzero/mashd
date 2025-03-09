import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange }) => {
  return (
    <CodeMirror
      value={code}
      height="300px"
      theme="dark"
      extensions={[javascript()]}
      onChange={(value) => onChange(value)}
      className="overflow-hidden rounded-b-md"
    />
  );
};
