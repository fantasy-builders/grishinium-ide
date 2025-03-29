import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { GrishexCompiler } from '../compiler';
import 'xterm/css/xterm.css';

interface TerminalProps {
  code?: string;
}

const Terminal: React.FC<TerminalProps> = ({ code }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const compilerRef = useRef<GrishexCompiler | null>(null);

  useEffect(() => {
    if (terminalRef.current) {
      const term = new XTerm({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        theme: {
          background: '#1e1e1e',
          foreground: '#ffffff',
        },
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      term.open(terminalRef.current);
      fitAddon.fit();

      xtermRef.current = term;
      fitAddonRef.current = fitAddon;
      compilerRef.current = new GrishexCompiler(term);

      // Write welcome message
      term.writeln('Welcome to Grishex Online Compiler');
      term.writeln('Type your commands here...\r\n');

      // Handle user input
      let currentLine = '';
      term.onData(data => {
        if (data === '\r') {
          // Handle command
          const command = currentLine.trim();
          if (command === 'compile' && code) {
            compilerRef.current?.compile(code);
          } else if (command === 'run' && code) {
            compilerRef.current?.run(code);
          } else if (command === 'clear') {
            term.clear();
            term.writeln('Welcome to Grishex Online Compiler');
            term.writeln('Type your commands here...\r\n');
          } else if (command === 'help') {
            term.writeln('Available commands:');
            term.writeln('  compile - Compile the current code');
            term.writeln('  run     - Run the compiled code');
            term.writeln('  clear   - Clear the terminal');
            term.writeln('  help    - Show this help message');
          } else if (command !== '') {
            term.writeln(`Unknown command: ${command}`);
            term.writeln('Type "help" for available commands');
          }
          term.writeln('');
          currentLine = '';
        } else if (data === '\u007f') {
          // Handle backspace
          if (currentLine.length > 0) {
            currentLine = currentLine.slice(0, -1);
            term.write('\b \b');
          }
        } else {
          // Handle regular input
          currentLine += data;
          term.write(data);
        }
      });

      // Handle window resize
      const handleResize = () => {
        fitAddon.fit();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        term.dispose();
      };
    }
  }, [code]);

  return <div ref={terminalRef} className="terminal" />;
};

export default Terminal; 