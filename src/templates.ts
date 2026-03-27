import { v4 as uuidv4 } from 'uuid';
import { Note } from './types';

export const TEMPLATES = [
  {
    id: 'gratitude-journal',
    title: '🌸 Diário de Gratidão',
    description: 'Um espaço para focar no que há de bom.',
    category: 'Pessoal',
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
    category: 'Produtividade',
    content: `
# 📅 Habit Tracker 2026
*Mês: ____________*

| Hábito | S | T | Q | Q | S | S | D |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Beber 2L Água | - [ ] | - [ ] | - [ ] | - [ ] | - [ ] | - [ ] | - [ ] |
| Exercício | - [ ] | - [ ] | - [ ] | - [ ] | - [ ] | - [ ] | - [ ] |
| Leitura | - [ ] | - [ ] | - [ ] | - [ ] | - [ ] | - [ ] | - [ ] |
| Meditação | - [ ] | - [ ] | - [ ] | - [ ] | - [ ] | - [ ] | - [ ] |
| Dormir 8h | - [ ] | - [ ] | - [ ] | - [ ] | - [ ] | - [ ] | - [ ] |

---
[Feito com NoxNote](https://nox-note.vercel.app/)
    `
  },
  {
    id: 'pomodoro-weekly',
    title: '⏳ Pomodoro Weekly',
    description: 'Planeje seus blocos de foco.',
    category: 'Produtividade',
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
    category: 'Organização',
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
    category: 'Produtividade',
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
  },
  {
    id: 'crm-vendas',
    title: '💰 CRM de Vendas',
    description: 'Gerencie seus leads e funil de vendas.',
    category: 'Profissional',
    content: `
# CRM de Vendas 💰

## 🚀 Funil de Vendas

### 🆕 Leads (Prospecção)
- [ ] Cliente A - Contato inicial
- [ ] Cliente B - Pesquisa de perfil

### 📞 Qualificação
- [ ] Cliente C - Reunião agendada
- [ ] Cliente D - Aguardando retorno

### 📑 Proposta Enviada
- [ ] Cliente E - Valor: R$ ____
- [ ] Cliente F - Valor: R$ ____

### 🤝 Fechamento
- [ ] Cliente G - Contrato em assinatura

## 📊 Métricas do Mês
- **Total em Propostas:** R$ ____
- **Meta de Vendas:** R$ ____
- **Conversão:** ____%
    `
  },
  {
    id: 'youtube-planner',
    title: '📹 YouTube Planner',
    description: 'Centralize todo o fluxo de produção de vídeos.',
    category: 'Criadores',
    content: `
# YouTube Content Planner 📹

## 🎬 Próximos Vídeos
- [ ] Título: 
  - Status: (Ideia / Roteiro / Gravando / Editando / Publicado)
  - Data de Publicação: 
  - Palavras-chave: 

## 📝 Roteiro Estruturado
1. **Hook (Gancho):** 
2. **Introdução:** 
3. **Conteúdo Principal:** 
4. **CTA (Chamada para Ação):** 
5. **Outro (Encerramento):** 

## ✅ Checklist de Publicação
- [ ] Thumbnail criada
- [ ] Título otimizado (SEO)
- [ ] Descrição com links
- [ ] Tags adicionadas
- [ ] Cards e Tela Final configurados
    `
  },
  {
    id: 'social-media-hub',
    title: '📱 Central de Conteúdo',
    description: 'Calendário editorial e banco de ideias.',
    category: 'Criadores',
    content: `
# Central de Redes Sociais 📱

## 💡 Banco de Ideias
- 

## 📅 Calendário Editorial
- **Segunda (Instagram):** 
- **Quarta (TikTok):** 
- **Sexta (YouTube Shorts):** 

## 🏷️ Gerenciador de Hashtags
- **Nicho:** #hashtag1 #hashtag2
- **Engajamento:** #hashtag3 #hashtag4

## 📈 Métricas de Crescimento
- Seguidores: 
- Alcance: 
- Engajamento: 
    `
  },
  {
    id: 'sponsorship-manager',
    title: '🤝 Gestão de Patrocínios',
    description: 'Organize contatos com marcas e prazos.',
    category: 'Criadores',
    content: `
# Gestão de Patrocínios e Colabs 🤝

## 🏢 Marcas em Contato
- **Marca X:** Status (Proposta enviada / Negociando / Fechado)
- **Marca Y:** Status (...)

## 📅 Entregas e Prazos
- [ ] Vídeo Patrocinado - Data: 
- [ ] Post Instagram - Data: 

## 💰 Controle Financeiro
- Valor Total: R$ ____
- Status de Pagamento: (Pendente / Recebido)
    `
  },
  {
    id: 'student-os',
    title: '🎓 Student OS',
    description: 'Painel completo para organização acadêmica.',
    category: 'Estudantes',
    content: `
# Student OS 🎓

## 📚 Matérias do Semestre
- Matéria 1
- Matéria 2

## 📅 Cronograma de Aulas
- Seg: 
- Ter: 

## 📝 Notas de Aula Recentes
- 

## 🎯 Metas Acadêmicas
- [ ] 
    `
  },
  {
    id: 'para-system',
    title: '📂 Sistema PARA',
    description: 'Gerenciador de notas baseado no método PARA.',
    category: 'Organização',
    content: `
# Sistema PARA 📂

## 🚀 Projetos (Ativos com prazo)
- 

## 🏗️ Áreas (Responsabilidades contínuas)
- 

## 📚 Recursos (Interesses e referências)
- 

## 📦 Arquivo (Projetos finalizados)
- 
    `
  },
  {
    id: 'exam-tracker',
    title: '📝 Rastreador de Provas',
    description: 'Controle de datas de provas e notas.',
    category: 'Estudantes',
    content: `
# Rastreador de Tarefas e Provas 📝

## 📅 Próximas Avaliações
- [ ] Prova de ____ - Data: 
- [ ] Trabalho de ____ - Entrega: 

## 📊 Notas e Desempenho
- Matéria A: ____
- Matéria B: ____

## ✍️ Plano de Estudos
- 
    `
  },
  {
    id: 'second-brain',
    title: '🧠 Segundo Cérebro (PKM)',
    description: 'Gestão de conhecimento pessoal.',
    category: 'Organização',
    content: `
# Segundo Cérebro (PKM) 🧠

## 📥 Inbox (Captura)
- 

## 💡 Insights e Reflexões
- 

## 📖 Notas de Leitura / Cursos
- 

## 🔗 Conexões e Ideias
- 
    `
  },
  {
    id: 'project-kanban',
    title: '📋 Gestão de Projetos',
    description: 'Quadro Kanban para gestão de tarefas.',
    category: 'Profissional',
    content: `
# Gestão de Projetos (Kanban) 📋

## 📝 Backlog
- [ ] Tarefa 1
- [ ] Tarefa 2

## 🏃 Em Andamento
- [ ] Tarefa 3

## ✅ Concluído
- [ ] Tarefa 4

## 🚩 Impedimentos
- 
    `
  },
  {
    id: 'tech-wiki',
    title: '💻 Wiki Técnica',
    description: 'Documentação de projetos e referências de TI.',
    category: 'Profissional',
    content: `
# Wiki Técnica / Documentação 💻

## 🛠️ Stack Tecnológica
- 

## 📖 Documentação de API
- 

## 🚀 Comandos Úteis / Snippets
\`\`\`bash
# Exemplo
npm run dev
\`\`\`

## 🐛 Debug Log / Soluções
- 
    `
  },
  {
    id: 'finance-tracker',
    title: '💰 Painel de Finanças',
    description: 'Controle de gastos e metas financeiras.',
    category: 'Pessoal',
    content: `
# Finance Tracker 💰

## 📥 Receitas
- Salário: R$ ____
- Extras: R$ ____

## 📤 Despesas Fixas
- Aluguel: R$ ____
- Contas: R$ ____

## 🎯 Metas de Economia
- [ ] Reserva de Emergência: ____%
- [ ] Investimentos: R$ ____

## 📊 Resumo do Mês
- Saldo Atual: R$ ____
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
