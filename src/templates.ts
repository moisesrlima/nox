import { v4 as uuidv4 } from 'uuid';
import { Note } from './types';

export const TEMPLATES = [
  {
    id: 'gratitude-journal',
    title: '🌸 Diário de Gratidão',
    description: 'Um espaço para focar no que há de bom.',
    content: `
# 🌸 Diário de Gratidão
*Data: ${new Date().toLocaleDateString('pt-BR')}*

### 🌟 3 Coisas pelas quais sou grato hoje:
1. 
2. 
3. 

### ✨ O que faria o dia de hoje incrível?
- [ ] 

### 🌈 Afirmação do dia:
> 

---
[Feito com NoxNote](https://nox-note.vercel.app/)
    `
  },
  {
    id: 'habit-tracker-2026',
    title: '📅 Habit Tracker 2026',
    description: 'Acompanhe sua evolução diária.',
    content: `
# 📅 Habit Tracker 2026
*Mês: ____________*

| Hábito | S | T | Q | Q | S | S | D |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Beber 2L Água | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Exercício | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Leitura | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Meditação | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Dormir 8h | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

---
[Feito com NoxNote](https://nox-note.vercel.app/)
    `
  },
  {
    id: 'pomodoro-weekly',
    title: '⏳ Pomodoro Weekly',
    description: 'Planeje seus blocos de foco.',
    content: `
# ⏳ Pomodoro Weekly
*Semana: ____________*

### 🎯 Objetivos da Semana
- [ ] 
- [ ] 

### 📊 Sessões de Foco (25min)
- **Segunda:** 🍅 🍅 🍅 🍅
- **Terça:** 🍅 🍅 🍅 🍅
- **Quarta:** 🍅 🍅 🍅 🍅
- **Quinta:** 🍅 🍅 🍅 🍅
- **Sexta:** 🍅 🍅 🍅 🍅

---
[Feito com NoxNote](https://nox-note.vercel.app/)
    `
  },
  {
    id: 'brain-dump',
    title: '🧠 Brain Dump',
    description: 'Esvazie sua mente e organize ideias.',
    content: `
# 🧠 Brain Dump
*Tudo o que está na minha cabeça agora:*

### 📂 Tarefas Pendentes
- [ ] 

### 💡 Ideias & Projetos
- 

### ❓ Preocupações
- 

### 📝 Notas Soltas
- 

---
[Feito com NoxNote](https://nox-note.vercel.app/)
    `
  },
  {
    id: 'daily-planner',
    title: '📝 Planejador Diário',
    description: 'Organize seu dia com clareza.',
    content: `
# 📝 Planejador Diário
*Data: ${new Date().toLocaleDateString('pt-BR')}*

### 🔝 Top 3 Prioridades
1. 
2. 
3. 

### 📅 Agenda
- 08:00 - 
- 10:00 - 
- 12:00 - 
- 14:00 - 
- 16:00 - 

### 🗒️ Notas
- 

---
[Feito com NoxNote](https://nox-note.vercel.app/)
    `
  }
];

export const createNoteFromTemplate = (templateId: string): Note => {
  const template = TEMPLATES.find(t => t.id === templateId);
  if (!template) throw new Error('Template not found');

  return {
    id: uuidv4(),
    title: template.title,
    content: template.content,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};
