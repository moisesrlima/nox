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
