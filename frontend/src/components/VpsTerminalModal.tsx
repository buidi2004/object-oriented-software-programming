'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Terminal as TerminalIcon } from 'lucide-react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import * as signalR from '@microsoft/signalr';
import 'xterm/css/xterm.css';

interface VpsTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  vpsInstanceId: string;
}

export default function VpsTerminalModal({ isOpen, onClose, vpsInstanceId }: VpsTerminalModalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !terminalRef.current) return;

    // Initialize xterm.js
    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#1e1e1e',
        foreground: '#f8f8f2'
      },
      fontFamily: '"Fira Code", monospace',
    });
    
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    term.open(terminalRef.current);

    const safeFit = () => {
      try {
        if (terminalRef.current && terminalRef.current.clientWidth > 0 && terminalRef.current.clientHeight > 0) {
          fitAddon.fit();
        }
      } catch (e) {
        // Safe ignore initial render measurement race
      }
    };

    const fitTimer = setTimeout(safeFit, 60);
    xtermRef.current = term;

    // Connect to SignalR
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/hubs/vps-terminal` : '/hubs/vps-terminal', {
        accessTokenFactory: () => token || ''
      })
      .configureLogging(signalR.LogLevel.None)
      .withAutomaticReconnect([0, 1000, 3000, 5000])
      .build();

    connectionRef.current = connection;
    const isConnectedRef = { current: false };

    term.writeln('\x1b[33mConnecting to VPS...\x1b[0m');

    connection.start()
      .then(() => {
        isConnectedRef.current = true;
        setIsConnected(true);
        term.writeln('\x1b[32mConnected successfully.\x1b[0m');
        term.write('root@vps:~# ');
        safeFit();
        term.focus();
      })
      .catch((err: any) => {
        if (err?.name === 'AbortError' || err?.message?.includes('stopped during negotiation')) {
          return;
        }
        console.error('SignalR Connection Error: ', err);
        setError('Failed to connect to terminal server.');
        term.writeln('\x1b[31mFailed to connect to VPS.\x1b[0m');
      });

    connection.on('ReceiveOutput', (output: string) => {
      // Fix newlines for xterm
      const formattedOutput = output.replace(/\n/g, '\r\n');
      term.write(formattedOutput);
      term.write('\r\nroot@vps:~# ');
    });

    let currentInput = '';
    
    term.onData(data => {
      if (!isConnectedRef.current && connection.state !== signalR.HubConnectionState.Connected) return;
      
      const char = data;
      // Handle enter
      if (char === '\r') {
        term.write('\r\n');
        if (currentInput.trim()) {
          connection.invoke('SendCommand', vpsInstanceId, currentInput).catch(err => {
            console.error('Failed to send command:', err);
            term.writeln('\r\n\x1b[31mError sending command\x1b[0m');
            term.write('root@vps:~# ');
          });
        } else {
          term.write('root@vps:~# ');
        }
        currentInput = '';
      } else if (char === '\x7F' || char === '\b') {
        // Backspace
        if (currentInput.length > 0) {
          term.write('\b \b');
          currentInput = currentInput.slice(0, -1);
        }
      } else if (char >= ' ' || char === '\t') {
        term.write(char);
        currentInput += char;
      }
    });

    const handleResize = () => safeFit();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(fitTimer);
      window.removeEventListener('resize', handleResize);
      if (connection.state !== signalR.HubConnectionState.Disconnected) {
        connection.stop().catch(() => {});
      }
      try {
        term.dispose();
      } catch (e) {}
      xtermRef.current = null;
      connectionRef.current = null;
    };
  }, [isOpen, vpsInstanceId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1e1e1e] w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col h-[80vh] border border-slate-300">
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-300">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <TerminalIcon className="w-4 h-4" />
            VPS Terminal
            {isConnected ? (
              <span className="flex items-center gap-1.5 ml-3 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Connected
              </span>
            ) : (
              <span className="flex items-center gap-1.5 ml-3 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Connecting...
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {error && (
          <div className="px-4 py-2 bg-rose-500/10 text-rose-400 text-xs border-b border-rose-500/20">
            {error}
          </div>
        )}
        
        <div className="flex-1 p-2 overflow-hidden bg-[#1e1e1e]">
          <div ref={terminalRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
