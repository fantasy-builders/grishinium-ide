import React, { useState } from 'react';
import './FileExplorer.css';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  isEditing?: boolean;
  id?: string;
}

export interface FileTab {
  id: string;
  name: string;
  content: string;
  path: string[];
}

interface FileExplorerProps {
  onFileSelect: (fileTab: FileTab) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ onFileSelect }) => {
  const [files, setFiles] = useState<FileNode[]>([
    {
      name: 'src',
      type: 'folder',
      children: [
        {
          name: 'contracts',
          type: 'folder',
          children: [
            {
              name: 'token.grx',
              type: 'file',
              id: 'token-1',
              content: `contract SimpleToken {
    state {
        name: string;
        symbol: string;
        decimals: uint;
        total_supply: uint;
        balances: map<address, uint>;
    }
    
    constructor(name: string, symbol: string, decimals: uint, initial_supply: uint) {
        self.name = name;
        self.symbol = symbol;
        self.decimals = decimals;
        total_supply = initial_supply;
        balances[msg.sender] = initial_supply;
    }
    
    function transfer(to: address, amount: uint) returns bool {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        balances[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    view function balance_of(account: address) returns uint {
        return balances[account];
    }
    
    event Transfer(from: address, to: address, amount: uint);
}`
            }
          ]
        }
      ]
    }
  ]);

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'src/contracts']));
  const [creatingItem, setCreatingItem] = useState<{
    parentPath: string[];
    type: 'file' | 'folder';
  } | null>(null);

  const toggleFolder = (path: string[]) => {
    const folderPath = path.join('/');
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const startCreatingItem = (parentPath: string[], type: 'file' | 'folder') => {
    setCreatingItem({ parentPath, type });
    
    // Ensure the parent folder is expanded
    if (parentPath.length > 0) {
      const folderPath = parentPath.join('/');
      if (!expandedFolders.has(folderPath)) {
        const newExpanded = new Set(expandedFolders);
        newExpanded.add(folderPath);
        setExpandedFolders(newExpanded);
      }
    }
  };

  const cancelCreatingItem = () => {
    setCreatingItem(null);
  };

  const createNewItem = (name: string) => {
    if (!creatingItem || name.trim() === '') {
      setCreatingItem(null);
      return;
    }

    const { parentPath, type } = creatingItem;
    
    // Generate a unique ID
    const id = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    
    const newItem: FileNode = {
      name: name,
      type: type,
      children: type === 'folder' ? [] : undefined,
      content: type === 'file' ? '// New file\n' : undefined,
      id: type === 'file' ? id : undefined
    };

    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      
      if (parentPath.length === 0) {
        newFiles.push(newItem);
        return newFiles;
      }
      
      let current = newFiles;
      for (const segment of parentPath) {
        const node = current.find(n => n.name === segment);
        if (node && node.type === 'folder') {
          current = node.children!;
        }
      }
      current.push(newItem);
      return newFiles;
    });

    setCreatingItem(null);
    
    // If it's a file, open it right away
    if (type === 'file') {
      onFileSelect({
        id,
        name,
        content: '// New file\n',
        path: [...parentPath, name]
      });
    }
  };

  const handleNodeClick = (node: FileNode, path: string[]) => {
    if (node.type === 'file' && node.content) {
      onFileSelect({
        id: node.id || `${node.name}-${Date.now()}`,
        name: node.name,
        content: node.content,
        path: path
      });
    } else if (node.type === 'folder') {
      toggleFolder(path);
    }
  };

  const startEditing = (node: FileNode, path: string[]) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      let current = newFiles;
      for (let i = 0; i < path.length - 1; i++) {
        const foundNode = current.find(n => n.name === path[i]);
        if (foundNode && foundNode.type === 'folder') {
          current = foundNode.children!;
        }
      }
      const targetNode = current.find(n => n.name === path[path.length - 1]);
      if (targetNode) {
        targetNode.isEditing = true;
      }
      return newFiles;
    });
  };

  const finishEditing = (path: string[], newName: string) => {
    if (newName.trim() === '') return;
    
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      let current = newFiles;
      for (let i = 0; i < path.length - 1; i++) {
        const node = current.find(n => n.name === path[i]);
        if (node && node.type === 'folder') {
          current = node.children!;
        }
      }
      const node = current.find(n => n.name === path[path.length - 1]);
      if (node) {
        node.name = newName;
        node.isEditing = false;
      }
      return newFiles;
    });
  };

  const deleteNode = (path: string[]) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      if (path.length === 1) {
        return newFiles.filter(node => node.name !== path[0]);
      }
      
      let current = newFiles;
      for (let i = 0; i < path.length - 1; i++) {
        const node = current.find(n => n.name === path[i]);
        if (node && node.type === 'folder') {
          current = node.children!;
        }
      }
      const index = current.findIndex(n => n.name === path[path.length - 1]);
      if (index !== -1) {
        current.splice(index, 1);
      }
      return newFiles;
    });
  };

  const renderFileNode = (node: FileNode, path: string[], level: number = 0) => {
    const isExpanded = expandedFolders.has(path.join('/'));
    const isFolder = node.type === 'folder';
    const isEditing = node.isEditing === true;
    const fullPath = path.join('/');

    return (
      <div key={fullPath} className="file-node-wrapper">
        <div 
          className={`file-node ${isFolder ? 'folder' : 'file'}`} 
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          <span className="file-icon">
            {isFolder ? (isExpanded ? '📂' : '📁') : '📄'}
          </span>
          {isEditing ? (
            <input
              type="text"
              defaultValue={node.name}
              onBlur={(e) => finishEditing(path, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  finishEditing(path, e.currentTarget.value);
                } else if (e.key === 'Escape') {
                  setFiles(prev => {
                    const newFiles = [...prev];
                    let current = newFiles;
                    for (let i = 0; i < path.length - 1; i++) {
                      const node = current.find(n => n.name === path[i]);
                      if (node && node.type === 'folder') {
                        current = node.children!;
                      }
                    }
                    const node = current.find(n => n.name === path[path.length - 1]);
                    if (node) {
                      node.isEditing = false;
                    }
                    return newFiles;
                  });
                }
              }}
              autoFocus
            />
          ) : (
            <span
              className="file-name"
              onClick={() => handleNodeClick(node, path)}
              onDoubleClick={() => startEditing(node, path)}
            >
              {node.name}
            </span>
          )}
          <div className="file-actions">
            <button onClick={() => startEditing(node, path)} title="Rename">✎</button>
            <button onClick={() => deleteNode(path)} title="Delete">🗑</button>
            <button onClick={() => startCreatingItem(path, 'file')} title="New File">+</button>
            {isFolder && (
              <button onClick={() => startCreatingItem(path, 'folder')} title="New Folder">📁</button>
            )}
          </div>
        </div>
        {isFolder && isExpanded && (
          <div className="file-node-children">
            {creatingItem && path.join('/') === creatingItem.parentPath.join('/') && (
              <div 
                className="file-node new-item"
                style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }}
              >
                <span className="file-icon">
                  {creatingItem.type === 'folder' ? '📁' : '📄'}
                </span>
                <input
                  type="text"
                  placeholder={`New ${creatingItem.type}`}
                  onBlur={(e) => createNewItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      createNewItem(e.currentTarget.value);
                    } else if (e.key === 'Escape') {
                      cancelCreatingItem();
                    }
                  }}
                  autoFocus
                />
              </div>
            )}
            {node.children?.map(child => renderFileNode(child, [...path, child.name], level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <h2>EXPLORER</h2>
        <div className="file-explorer-actions">
          <button onClick={() => startCreatingItem([], 'file')} title="New File">+</button>
          <button onClick={() => startCreatingItem([], 'folder')} title="New Folder">📁</button>
        </div>
      </div>
      <div className="file-explorer-content">
        {files.map((file) => renderFileNode(file, [file.name]))}
        {creatingItem && creatingItem.parentPath.length === 0 && (
          <div className="file-node new-item" style={{ paddingLeft: '8px' }}>
            <span className="file-icon">
              {creatingItem.type === 'folder' ? '📁' : '📄'}
            </span>
            <input
              type="text"
              placeholder={`New ${creatingItem.type}`}
              onBlur={(e) => createNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  createNewItem(e.currentTarget.value);
                } else if (e.key === 'Escape') {
                  cancelCreatingItem();
                }
              }}
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer; 