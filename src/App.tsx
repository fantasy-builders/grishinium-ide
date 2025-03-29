import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import Terminal from './components/Terminal';
import FileExplorer, { FileTab } from './components/FileExplorer';
import FileTabs from './components/FileTabs';
import Toolbar from './components/Toolbar';
import ExamplesModal from './components/ExamplesModal';
import './App.css';

function App() {
  const [code, setCode] = useState<string>('// Welcome to Grishex Online Compiler\n// Select a file or write your own code\n');
  const [openTabs, setOpenTabs] = useState<FileTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorHeight, setEditorHeight] = useState('500px');
  const [showExamples, setShowExamples] = useState(false);
  const monacoRef = useRef<any>(null);

  useEffect(() => {
    const updateEditorHeight = () => {
      if (editorRef.current) {
        const containerHeight = editorRef.current.clientHeight;
        setEditorHeight(`${containerHeight}px`);
      }
    };

    updateEditorHeight();
    window.addEventListener('resize', updateEditorHeight);

    return () => {
      window.removeEventListener('resize', updateEditorHeight);
    };
  }, []);

  const handleEditorChange = (value: string | undefined) => {
    if (value) {
      setCode(value);
      
      // Update the content of the active tab
      if (activeTabId) {
        setOpenTabs(prevTabs => 
          prevTabs.map(tab => 
            tab.id === activeTabId 
              ? { ...tab, content: value } 
              : tab
          )
        );
      }
    }
  };

  const handleFileSelect = (fileTab: FileTab) => {
    // Check if the file is already open
    const existingTabIndex = openTabs.findIndex(tab => tab.id === fileTab.id);
    
    if (existingTabIndex >= 0) {
      // File already open, just activate it
      setActiveTabId(fileTab.id);
      setCode(openTabs[existingTabIndex].content);
    } else {
      // Add new tab
      setOpenTabs(prevTabs => [...prevTabs, fileTab]);
      setActiveTabId(fileTab.id);
      setCode(fileTab.content);
    }
  };

  const handleTabSelect = (tabId: string) => {
    setActiveTabId(tabId);
    const tab = openTabs.find(tab => tab.id === tabId);
    if (tab) {
      setCode(tab.content);
    }
  };

  const handleTabClose = (tabId: string) => {
    setOpenTabs(prevTabs => prevTabs.filter(tab => tab.id !== tabId));
    
    // If we're closing the active tab
    if (activeTabId === tabId) {
      // Activate the next tab, or the previous if there's no next
      const tabIndex = openTabs.findIndex(tab => tab.id === tabId);
      if (openTabs.length > 1) {
        const newTabIndex = tabIndex === openTabs.length - 1 ? tabIndex - 1 : tabIndex + 1;
        setActiveTabId(openTabs[newTabIndex].id);
        setCode(openTabs[newTabIndex].content);
      } else {
        // No more tabs
        setActiveTabId(null);
        setCode('// Welcome to Grishex Online Compiler\n// Select a file or write your own code\n');
      }
    }
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    monacoRef.current = monaco;
    // Force a layout update after mounting
    setTimeout(() => {
      editor.layout();
    }, 100);
  };

  const handleSave = () => {
    if (activeTabId) {
      const activeTab = openTabs.find(tab => tab.id === activeTabId);
      if (activeTab) {
        // Save to localStorage using the file path as key
        const key = `grishex_file_${activeTab.path.join('/')}`;
        localStorage.setItem(key, code);
      }
    }
  };

  const handleSaveAs = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Use the file name from active tab or default
    let filename = 'contract.grx';
    if (activeTabId) {
      const activeTab = openTabs.find(tab => tab.id === activeTabId);
      if (activeTab) {
        filename = activeTab.name;
      }
    }
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileOpen = (content: string, fileName: string) => {
    // Create a new tab for the opened file
    const id = `${fileName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    const newTab: FileTab = {
      id,
      name: fileName,
      content,
      path: [fileName]
    };
    
    handleFileSelect(newTab);
  };

  const handleExampleSelect = (exampleCode: string) => {
    // Create a new tab for the example
    const timestamp = Date.now();
    const id = `example-${timestamp}`;
    const newTab: FileTab = {
      id,
      name: `Example-${timestamp}.grx`,
      content: exampleCode,
      path: [`Example-${timestamp}.grx`]
    };
    
    handleFileSelect(newTab);
    setShowExamples(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Grishex Online Compiler</h1>
      </header>
      <Toolbar
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onOpen={handleFileOpen}
        onShowExamples={() => setShowExamples(true)}
      />
      <main className="App-main">
        <FileExplorer onFileSelect={handleFileSelect} />
        <div className="editor-container">
          <FileTabs 
            tabs={openTabs} 
            activeTab={activeTabId} 
            onTabSelect={handleTabSelect} 
            onTabClose={handleTabClose} 
          />
          <div className="monaco-container" ref={editorRef}>
            <Editor
              height={editorHeight}
              defaultLanguage="grishex"
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                scrollbar: {
                  vertical: 'visible',
                  horizontal: 'visible'
                },
                wordWrap: 'on',
                wrappingIndent: 'indent',
                renderWhitespace: 'selection',
                tabSize: 4,
                insertSpaces: true,
                folding: true,
                foldingStrategy: 'indentation',
                showFoldingControls: 'always',
                lineDecorationsWidth: 0,
                lineNumbersMinChars: 3,
                renderLineHighlight: 'all',
                fixedOverflowWidgets: true
              }}
            />
          </div>
        </div>
      </main>
      <div className="terminal-container">
        <Terminal code={code} />
      </div>
      <footer className="App-footer">
        <div className="footer-content">
          <span>Made for Grishinium Blockchain</span>
          <span className="version">v1.0.0</span>
        </div>
      </footer>
      <ExamplesModal
        isOpen={showExamples}
        onClose={() => setShowExamples(false)}
        onSelect={handleExampleSelect}
      />
    </div>
  );
}

export default App;
