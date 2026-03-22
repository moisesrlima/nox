import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, UploadCloud, DownloadCloud, LogOut } from 'lucide-react';
import { Note, Folder } from '../types';

interface GoogleDriveSyncProps {
  notes: Note[];
  folders: Folder[];
  onRestore: (data: { notes: Note[], folders: Folder[] }) => void;
}

export function GoogleDriveSync({ notes, folders, onRestore }: GoogleDriveSyncProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; picture: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [modalState, setModalState] = useState<{ isOpen: boolean; title: string; message: string; type: 'alert' | 'confirm'; onConfirm?: () => void }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert'
  });

  const showAlert = (title: string, message: string) => {
    setModalState({ isOpen: true, title, message, type: 'alert' });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModalState({ isOpen: true, title, message, type: 'confirm', onConfirm });
  };

  useEffect(() => {
    checkAuthStatus();

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        checkAuthStatus();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      if (!res.ok) {
        const text = await res.text();
        console.error('Auth status error response:', text);
        return;
      }
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
      if (data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleConnect = async () => {
    try {
      const res = await fetch('/api/auth/url');
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Erro desconhecido no servidor' }));
        throw new Error(data.error || data.message || 'Erro ao obter URL de autenticação');
      }
      
      const { url } = await res.json();
      
      const authWindow = window.open(
        url,
        'oauth_popup',
        'width=600,height=700'
      );

      if (!authWindow) {
        showAlert('Atenção', 'Por favor, permita popups para conectar sua conta do Google.');
      }
    } catch (error) {
      console.error('Error getting auth URL:', error);
      showAlert('Erro', error instanceof Error ? error.message : 'Erro ao conectar com o Google Drive.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleBackup = async () => {
    if (!isAuthenticated) return;
    setIsSyncing(true);
    try {
      const data = {
        version: 1,
        timestamp: new Date().toISOString(),
        notes,
        folders
      };
      
      const res = await fetch('/api/drive/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      });
      
      if (res.ok) {
        showAlert('Sucesso', 'Backup salvo no Google Drive com sucesso!');
      } else {
        throw new Error('Failed to upload');
      }
    } catch (error) {
      console.error('Error backing up to Drive:', error);
      showAlert('Erro', 'Erro ao salvar backup no Google Drive.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRestore = async () => {
    if (!isAuthenticated) return;
    
    showConfirm(
      'Restaurar Backup',
      'Isso irá substituir suas notas atuais pelas notas do Google Drive. Deseja continuar?',
      async () => {
        setIsSyncing(true);
        try {
          const res = await fetch('/api/drive/sync');
          if (!res.ok) throw new Error('Failed to download');
          
          const { data, message } = await res.json();
          if (!data) {
            showAlert('Aviso', message || 'Nenhum backup encontrado no Google Drive.');
            return;
          }

          if (data.notes && data.folders) {
            onRestore(data);
            showAlert('Sucesso', 'Backup restaurado com sucesso!');
          } else {
            showAlert('Erro', 'Arquivo de backup inválido.');
          }
        } catch (error) {
          console.error('Error restoring from Drive:', error);
          showAlert('Erro', 'Erro ao restaurar backup do Google Drive.');
        } finally {
          setIsSyncing(false);
        }
      }
    );
  };

  return (
    <div className="mt-4">
      <h4 className="px-3 pb-2 text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
        <Cloud className="w-4 h-4" />
        Google Drive
      </h4>
      
      {!isAuthenticated ? (
        <button
          onClick={handleConnect}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-accent hover:text-accent-contrast rounded-lg transition-colors"
        >
          <CloudOff className="w-4 h-4" />
          Conectar Conta
        </button>
      ) : (
        <div className="space-y-1">
          {user && (
            <div className="px-3 py-2 flex items-center gap-2 text-xs text-text-muted">
              {user.picture && <img src={user.picture} alt="" className="w-5 h-5 rounded-full" referrerPolicy="no-referrer" />}
              <span className="truncate flex-1">{user.email}</span>
              <button onClick={handleLogout} className="p-1 hover:text-error transition-colors" title="Desconectar">
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          )}
          <button
            onClick={handleBackup}
            disabled={isSyncing}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-accent hover:text-accent-contrast rounded-lg transition-colors disabled:opacity-50"
          >
            {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            Salvar no Drive
          </button>
          <button
            onClick={handleRestore}
            disabled={isSyncing}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-accent hover:text-accent-contrast rounded-lg transition-colors disabled:opacity-50"
          >
            {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
            Restaurar do Drive
          </button>
        </div>
      )}

      {modalState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-border">
            <div className="p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-text-primary">{modalState.title}</h3>
            </div>
            <div className="p-4">
              <p className="text-text-secondary text-sm">{modalState.message}</p>
            </div>
            <div className="p-4 bg-surface-hover flex justify-end gap-2">
              {modalState.type === 'confirm' && (
                <button
                  onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={() => {
                  setModalState(prev => ({ ...prev, isOpen: false }));
                  if (modalState.type === 'confirm' && modalState.onConfirm) {
                    modalState.onConfirm();
                  }
                }}
                className="px-4 py-2 text-sm font-medium bg-accent text-accent-contrast rounded-lg hover:opacity-90 transition-opacity"
              >
                {modalState.type === 'confirm' ? 'Confirmar' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
