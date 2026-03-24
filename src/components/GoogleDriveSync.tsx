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
  const [autoSync, setAutoSync] = useState(() => localStorage.getItem('nox_note_auto_sync') === 'true');
  const [lastSync, setLastSync] = useState<string | null>(() => localStorage.getItem('nox_note_last_sync'));
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

  // Auto-sync effect
  useEffect(() => {
    if (!autoSync || !isAuthenticated || isSyncing) return;

    const timeoutId = setTimeout(() => {
      handleBackup(true); // silent backup
    }, 5000); // 5s debounce

    return () => clearTimeout(timeoutId);
  }, [notes, folders, autoSync, isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('nox_note_auto_sync', String(autoSync));
  }, [autoSync]);

  const checkAuthStatus = async () => {
    console.log('Checking auth status...');
    try {
      const res = await fetch(`${window.location.origin}/api/gdrive/auth-status`, { cache: 'no-store' });
      const text = await res.text();
      console.log('Auth status response received');
      
      if (!res.ok) {
        console.error('Auth status error response:', text);
        return;
      }
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse auth status JSON:', text);
        return;
      }

      console.log('Auth status data:', data);
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
    console.log('handleConnect started');
    // Open a blank window immediately to avoid popup blockers
    const authWindow = window.open('about:blank', 'oauth_popup', 'width=600,height=700');
    
    if (!authWindow) {
      console.error('Popup blocked');
      showAlert('Atenção', 'Por favor, permita popups para conectar sua conta do Google.');
      return;
    }

    try {
      authWindow.document.write('<div style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column; gap: 10px;"><h3>Conectando ao Google...</h3><p>Aguarde um momento.</p></div>');
      
      console.log('Fetching auth URL...');
      
      try {
        const res = await fetch(`${window.location.origin}/api/gdrive/auth-url`, { 
          cache: 'no-store',
          headers: {
            'Accept': 'application/json'
          }
        });
        const text = await res.text();
        console.log('Auth URL response received. Status:', res.status);
        
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('Error response body (text):', text);
          authWindow.close();
          if (text.includes('FUNCTION_INVOCATION_FAILED') || text.includes('500: INTERNAL_SERVER_ERROR')) {
            throw new Error('O servidor da Vercel falhou ao processar a requisição (FUNCTION_INVOCATION_FAILED). Verifique os logs da Vercel.');
          }
          throw new Error('Resposta do servidor inválida (não é JSON). Verifique se as variáveis de ambiente GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET estão configuradas.');
        }

        if (!res.ok) {
          console.error('Auth URL request failed:', data);
          authWindow.close();
          throw new Error(data.error || data.message || 'Erro ao obter URL de autenticação');
        }
        
        const { url } = data;
        console.log('Redirecting popup to:', url);
        authWindow.location.href = url;
      } catch (fetchError: any) {
        console.error('Fetch error details:', fetchError);
        if (fetchError.name === 'AbortError') {
          throw new Error('A requisição foi cancelada pelo navegador. Isso pode ser causado por um bloqueador de anúncios ou instabilidade na rede.');
        }
        throw fetchError;
      }
      
    } catch (error) {
      console.error('Error in handleConnect:', error);
      if (authWindow && !authWindow.closed) {
        authWindow.close();
      }
      showAlert('Erro', error instanceof Error ? error.message : 'Erro ao conectar com o Google Drive.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${window.location.origin}/api/gdrive/logout`, { method: 'POST' });
      setIsAuthenticated(false);
      setUser(null);
      setAutoSync(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleBackup = async (silent = false) => {
    if (!isAuthenticated) return;
    if (!silent) setIsSyncing(true);
    try {
      const data = {
        version: 1,
        timestamp: new Date().toISOString(),
        notes,
        folders
      };
      
      const res = await fetch(`${window.location.origin}/api/gdrive/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      });
      
      const text = await res.text();
      let responseData;
      try {
        responseData = JSON.parse(text);
      } catch (e) {
        console.error('Backup error text:', text);
        if (text.includes('FUNCTION_INVOCATION_FAILED')) {
          throw new Error('O servidor da Vercel falhou (FUNCTION_INVOCATION_FAILED).');
        }
        throw new Error('Resposta do servidor inválida ao salvar backup.');
      }

      if (res.ok) {
        const now = new Date().toLocaleString();
        setLastSync(now);
        localStorage.setItem('nox_note_last_sync', now);
        if (!silent) showAlert('Sucesso', 'Backup salvo no Google Drive com sucesso!');
      } else {
        throw new Error(responseData.error || responseData.message || 'Erro ao salvar no Drive');
      }
    } catch (error) {
      console.error('Error backing up to Drive:', error);
      if (!silent) showAlert('Erro', error instanceof Error ? error.message : 'Erro ao salvar backup no Google Drive.');
    } finally {
      if (!silent) setIsSyncing(false);
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
          const res = await fetch(`${window.location.origin}/api/gdrive/sync`, { cache: 'no-store' });
          const text = await res.text();
          
          let responseData;
          try {
            responseData = JSON.parse(text);
          } catch (e) {
            console.error('Restore error text:', text);
            if (text.includes('FUNCTION_INVOCATION_FAILED')) {
              throw new Error('O servidor da Vercel falhou (FUNCTION_INVOCATION_FAILED).');
            }
            throw new Error('Resposta do servidor inválida ao restaurar backup.');
          }

          if (!res.ok) {
            throw new Error(responseData.error || responseData.message || 'Erro ao restaurar do Drive');
          }
          
          const { data, message } = responseData;
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
          showAlert('Erro', error instanceof Error ? error.message : 'Erro ao restaurar backup do Google Drive.');
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
            <div className="px-3 py-2 flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                {user.picture && <img src={user.picture} alt="" className="w-5 h-5 rounded-full" referrerPolicy="no-referrer" />}
                <span className="truncate flex-1">{user.email}</span>
                <button onClick={handleLogout} className="p-1 hover:text-error transition-colors" title="Desconectar">
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
              {lastSync && (
                <span className="text-[10px] text-text-muted italic px-7">
                  Último sync: {lastSync}
                </span>
              )}
            </div>
          )}

          <div className="px-3 py-2 flex items-center justify-between text-sm text-text-secondary">
            <span className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${autoSync ? 'text-accent' : ''}`} />
              Auto-sync
            </span>
            <button
              onClick={() => setAutoSync(!autoSync)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                autoSync ? 'bg-accent' : 'bg-surface-hover'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  autoSync ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <button
            onClick={() => handleBackup(false)}
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
