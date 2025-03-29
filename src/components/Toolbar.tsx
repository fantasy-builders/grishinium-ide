import React, { useRef } from 'react';
import './Toolbar.css';

interface ToolbarProps {
  onSave: () => void;
  onSaveAs: () => void;
  onOpen: (content: string, fileName: string) => void;
  onShowExamples: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onSave, onSaveAs, onOpen, onShowExamples }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileOpen = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content !== undefined) {
          onOpen(content, file.name);
        }
      };
      reader.readAsText(file);
    }
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button className="toolbar-button" onClick={handleFileOpen} title="Open File">
          <span>Open</span>
        </button>
        <button className="toolbar-button" onClick={onSave} title="Save">
          <span>Save</span>
        </button>
        <button className="toolbar-button" onClick={onSaveAs} title="Save As">
          <span>Save As...</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".grx"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
      <div className="toolbar-group">
        <button className="toolbar-button" onClick={onShowExamples} title="Browse Examples">
          <span>Examples</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar; 