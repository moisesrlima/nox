export type ThemeId = 'zinc' | 'sapphire' | 'olive' | 'sakura';

export interface Theme {
  id: ThemeId;
  name: string;
  colors: {
    primary: string;
    surface: string;
    hover: string;
    active: string;
    accent: string;
    accentSoft: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
  };
  font: string;
}

export const THEMES: Theme[] = [
  {
    id: 'zinc',
    name: 'Zinc (Padrão)',
    colors: {
      primary: '#09090b',
      surface: '#18181b',
      hover: '#27272a',
      active: '#3f3f46',
      accent: '#000000',
      accentSoft: '#27272a',
      textPrimary: '#f4f4f5',
      textSecondary: '#a1a1aa',
      textMuted: '#52525b',
      border: '#27272a',
    },
    font: 'Inter',
  },
  {
    id: 'sapphire',
    name: 'Sapphire',
    colors: {
      primary: '#e7edfe',
      surface: '#f0f4ff',
      hover: '#dbe4ff',
      active: '#c1d0ff',
      accent: '#3c61dd',
      accentSoft: '#E7EDFE',
      textPrimary: '#0f172a',
      textSecondary: '#1e293b',
      textMuted: '#64748b',
      border: '#e2e8f0',
    },
    font: 'Inter',
  },
  {
    id: 'olive',
    name: 'Olive',
    colors: {
      primary: '#f5f5f1',
      surface: '#fafaf8',
      hover: '#f0f0e8',
      active: '#e8e8e0',
      accent: '#5a5a43',
      accentSoft: '#F5F5F1',
      textPrimary: '#161814',
      textSecondary: '#2d3029',
      textMuted: '#8a8f7d',
      border: '#e8e8e0',
    },
    font: 'Manrope',
  },
  {
    id: 'sakura',
    name: 'Sakura',
    colors: {
      primary: '#F4C6CF',
      surface: '#F8D4DA',
      hover: '#FCE2E7',
      active: '#e9bdc5',
      accent: '#3A2A2E',
      accentSoft: '#F4C6CF',
      textPrimary: '#3A2A2E',
      textSecondary: '#4A3A3E',
      textMuted: '#8A7A7E',
      border: '#E4B6BF',
    },
    font: 'Inter',
  },
];

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export const INITIAL_NOTE: Note = {
  id: 'initial-note-1',
  title: 'Bem-vindo ao Nox',
  content: `# Bem-vindo ao Nox

Este é o seu novo bloco de notas focado em privacidade, velocidade e simplicidade.

## Recursos Principais

- **Seguro e Local**: Seus dados nunca saem do seu dispositivo. Tudo é salvo no \`localStorage\` do seu navegador.
- **Sem Senhas**: Sem contas, sem logins. Apenas abra e comece a escrever.
- **Markdown**: Suporte completo a formatação Markdown.
  - *Itálico*, **Negrito**, ~~Tachado~~
  - Listas, links, blocos de código e muito mais.
- **Exportação**: Exporte suas notas como TXT, HTML ou PDF.
- **Backup**: Faça backup de todas as suas notas em um arquivo JSON.

## Exemplos de Markdown

Aqui estão alguns exemplos do que você pode fazer com Markdown:

### Citação
> "Não há nada tão inútil quanto fazer com grande eficiência algo que não deveria ser feito."
> — *Peter Drucker*

### Imagem
![Galáxia](https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80)

### Link
Conheça o [Apps For All](https://appsforall.vercel.app/) para mais aplicativos incríveis.

### Tabela
| Funcionalidade | Status | Descrição |
| :--- | :---: | :--- |
| Markdown | ✅ | Suporte completo a GFM |
| Exportação | ✅ | TXT, HTML e PDF |
| Nuvem | ❌ | 100% Local e Privado |

## Aviso Importante

Como os dados são salvos localmente no seu navegador:
1. O limite de armazenamento é de aproximadamente **5MB**.
2. **Se você limpar o cache/dados do navegador, suas notas serão perdidas.**
3. Recomendamos usar a função de **Backup** regularmente.

Comece a editar esta nota ou crie uma nova no menu lateral!
`,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};