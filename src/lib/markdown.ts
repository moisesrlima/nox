import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { marked } from 'marked';

/**
 * Bidirectional markdown <-> HTML conversion for the Tiptap editor.
 *
 * Why this exists:
 *   - `tiptap-markdown@0.9` (community lib, written for Tiptap v2) was
 *     deprecated by its own author and is broken on Tiptap v3 (the version
 *     this project uses). Every release brought a new edge case.
 *   - Tiptap v3 ships utilities for building markdown-aware extensions
 *     (`createBlockMarkdownSpec` etc.) but no end-to-end extension that
 *     round-trips bold/italic/lists/tables/etc. out of the box.
 *   - Using two battle-tested, single-purpose libraries (`marked` +
 *     `turndown`) gives us a deterministic, predictable conversion in both
 *     directions and zero magic inside Tiptap.
 *
 * The editor instance stays vanilla Tiptap (StarterKit + extensions). The
 * two conversion helpers below are the only place where markdown lives.
 */

const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  strongDelimiter: '**',
  linkStyle: 'inlined',
});

// Enable GFM extensions: tables, strikethrough, task lists.
turndownService.use(gfm);

// Tiptap emits <p> around single text blocks inside list items, quotes,
// and table cells. Strip them so we keep the markdown compact.
turndownService.addRule('paragraph-in-block', {
  filter: (node) => {
    const el = node as HTMLElement;
    return (
      el.nodeName === 'P' &&
      el.parentNode !== null &&
      (el.parentNode.nodeName === 'LI' ||
        el.parentNode.nodeName === 'BLOCKQUOTE' ||
        el.parentNode.nodeName === 'TD' ||
        el.parentNode.nodeName === 'TH')
    );
  },
  replacement: (content) => content + '\n\n',
});

turndownService.addRule('paragraph-empty', {
  filter: (node) => node.nodeName === 'P' && !(node as HTMLElement).textContent,
  replacement: () => '',
});

// Tiptap's StarterKit emits <ul><li>... for nested lists with extra
// indent on the rendered text. Collapse the extra whitespace turndown
// injects between the bullet marker and the content.
turndownService.addRule('compact-list-item', {
  filter: (node) => node.nodeName === 'LI',
  replacement: (content, node) => {
    const el = node as HTMLElement;
    const parent = el.parentNode as HTMLElement;
    const isOrdered = parent?.nodeName === 'OL';
    const index = Array.from(parent?.children ?? []).indexOf(el);
    const prefix = isOrdered ? `${index + 1}.` : '-';
    let depth = 0;
    let p: Node | null = el.parentNode;
    while (p && (p.nodeName === 'UL' || p.nodeName === 'OL')) {
      depth++;
      p = p.parentNode?.parentNode ?? null;
    }
    const indent = '  '.repeat(Math.max(0, depth - 1));
    const trimmed = content.replace(/^\s+/, '').replace(/\s+$/, '');
    return `${indent}${prefix} ${trimmed}\n`;
  },
});

// Task list items: turn `<li data-type="taskItem" data-checked="true">x</li>`
// into `- [x] x` so GFM readers understand them.
turndownService.addRule('taskListItem', {
  filter: (node) => {
    const el = node as HTMLElement;
    return (
      el.nodeName === 'LI' &&
      (el.getAttribute('data-type') === 'taskItem' ||
        el.classList.contains('task-item'))
    );
  },
  replacement: (content, node) => {
    const el = node as HTMLElement;
    const checked = el.getAttribute('data-checked') === 'true';
    const checkbox = checked ? '[x] ' : '[ ] ';
    const trimmed = content.replace(/^\s+/, '').replace(/\s+$/, '');
    return `- ${checkbox}${trimmed}\n`;
  },
});

// Hard breaks -> two trailing spaces (markdown line break).
turndownService.addRule('hardBreak', {
  filter: (node) =>
    node.nodeName === 'BR' && (node as HTMLElement).classList.contains('hard-break'),
  replacement: () => '  \n',
});

/**
 * Convert Tiptap-generated HTML to markdown.
 */
export function htmlToMarkdown(html: string): string {
  if (!html) return '';
  const md = turndownService.turndown(html);
  return md.replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Convert a markdown string to the HTML that Tiptap parses natively.
 * Performs a post-processing pass on the marked output so the HTML matches
 * Tiptap's expected schema for task lists.
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  const rawHtml = marked.parse(markdown, {
    async: false,
    gfm: true,
    breaks: true,
  }) as string;

  return normalizeForTiptap(rawHtml);
}

/**
 * Adapt the HTML produced by `marked` to the schema Tiptap expects.
 * Only transforms nodes that need it (currently: task lists).
 */
function normalizeForTiptap(html: string): string {
  // Guard for environments without DOMParser (SSR/build). Fall back to raw HTML.
  if (typeof DOMParser === 'undefined') return html;

  const doc = new DOMParser().parseFromString(
    `<!doctype html><html><body><div id="root">${html}</div></body></html>`,
    'text/html',
  );
  const root = doc.getElementById('root');
  if (!root) return html;

  const ulElements = Array.from(root.querySelectorAll('ul'));
  for (const ul of ulElements) {
    const items = Array.from(ul.children).filter(
      (child) => child.nodeName === 'LI',
    ) as HTMLElement[];
    if (items.length === 0) continue;

    const allHaveCheckbox = items.every((li) =>
      li.querySelector('input[type="checkbox"]'),
    );
    if (!allHaveCheckbox) continue;

    ul.setAttribute('data-type', 'taskList');
    if (!ul.classList.contains('task-list')) {
      ul.classList.add('task-list');
    }

    for (const li of items) {
      const checkbox = li.querySelector(
        'input[type="checkbox"]',
      ) as HTMLInputElement | null;
      const isChecked = checkbox?.hasAttribute('checked') ?? false;
      checkbox?.remove();
      li.setAttribute('data-type', 'taskItem');
      li.setAttribute('data-checked', String(isChecked));
      if (!li.classList.contains('task-item')) {
        li.classList.add('task-item');
      }
    }
  }

  return root.innerHTML;
}