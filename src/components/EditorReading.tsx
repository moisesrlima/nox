export interface ReadingState {
  isReading: boolean;
  isGlobalPlaying: boolean;
}

export interface ReadingHandlers {
  onReadingChange: (isReading: boolean) => void;
  onGlobalPlayingChange: (isPlaying: boolean) => void;
}

export function readNote({
  note,
  mode,
  editor,
  speed = 1,
  onReadingChange,
  onGlobalPlayingChange
}: {
  note: any;
  mode: 'visual' | 'markdown';
  editor?: any;
  speed?: number;
  onReadingChange: (isReading: boolean) => void;
  onGlobalPlayingChange: (isPlaying: boolean) => void;
}) {
  if (!note) return;
  
  const textToRead = mode === 'visual' && editor 
    ? editor.getText()
    : note.content;
  
  if (!textToRead.trim()) {
    alert('A nota está vazia!');
    return;
  }
  
  if ('speechSynthesis' in window) {
    // Cancelar qualquer leitura anterior
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'pt-BR';
    utterance.rate = speed;
    utterance.pitch = 1;
    
    utterance.onstart = () => {
      onReadingChange(true);
      onGlobalPlayingChange(false); // Pausar rádio se estiver tocando
    };
    utterance.onend = () => onReadingChange(false);
    utterance.onerror = () => onReadingChange(false);
    
    window.speechSynthesis.speak(utterance);
  } else {
    alert('Seu navegador não suporta leitura em voz alta.');
  }
}

export function stopReading({
  onReadingChange,
  onGlobalPlayingChange
}: {
  onReadingChange: (isReading: boolean) => void;
  onGlobalPlayingChange: (isPlaying: boolean) => void;
}) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    onReadingChange(false);
    onGlobalPlayingChange(false);
  }
}