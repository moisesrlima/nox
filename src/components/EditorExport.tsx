import html2pdf from 'html2pdf.js';

interface ExportOptions {
  note: any;
  editor?: any;
}

export function exportTxt({ note }: ExportOptions) {
  const blob = new Blob([note.content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${note.title || 'nota'}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportHtml({ note, editor }: ExportOptions) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${note.title}</title>
      <style>
        body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; color: #333; }
        pre { background: #f4f4f4; padding: 1rem; border-radius: 4px; overflow-x: auto; }
        code { font-family: monospace; background: #f4f4f4; padding: 0.2rem 0.4rem; border-radius: 3px; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1rem; color: #666; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }
      </style>
    </head>
    <body>
      ${editor?.getHTML() || '<h1>Erro ao gerar HTML</h1>'}
    </body>
    </html>
  `;
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${note.title || 'nota'}.html`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportPdf({ note, editor }: ExportOptions) {
  if (!editor) return;
  
  const element = document.createElement('div');
  element.innerHTML = editor.getHTML();
  element.style.padding = '20px';
  element.style.color = '#000';
  element.style.fontFamily = 'system-ui, sans-serif';
  
  const style = document.createElement('style');
  style.innerHTML = `
    body { color: #000 !important; background: #fff !important; }
    pre { background: #f4f4f4; padding: 1rem; border-radius: 4px; }
    code { font-family: monospace; }
    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1rem; color: #666; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f4f4f4; }
  `;
  element.appendChild(style);
  
  const opt = {
    margin: 10,
    filename: `${note.title || 'nota'}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
  };
  
  html2pdf().set(opt).from(element).save();
}