import { Entry, Tag } from '../types/journal';
import { MOOD_DEFINITIONS } from '../utils/journalLogic';

export class ExportService {
  /**
   * Generates a beautifully formatted Plain Text / Markdown journal summary
   */
  public static exportToTxt(entries: Entry[], tags: Tag[]): string {
    const tagMap = new Map(tags.map((t) => [t.id, t.name]));
    let output = `# MoodNote Journal Export\nGenerated: ${new Date().toLocaleString()}\nTotal Entries: ${entries.length}\n\n========================================\n\n`;

    for (const e of entries) {
      const moodInfo = MOOD_DEFINITIONS[e.mood];
      const entryTags = e.tagIds.map((id) => tagMap.get(id) || id).join(', ');

      output += `Date: ${e.date}\n`;
      if (e.title) output += `Title: ${e.title}\n`;
      output += `Mood: ${moodInfo.emoji} ${moodInfo.label} (${e.mood}/5)`;
      if (e.energy) output += ` | Energy: ${e.energy}/5`;
      output += '\n';
      if (entryTags) output += `Tags: ${entryTags}\n`;
      output += `\n${e.body}\n\n`;
      output += '----------------------------------------\n\n';
    }

    return output;
  }

  /**
   * Downloads a plain text / markdown file to device
   */
  public static downloadTxt(entries: Entry[], tags: Tag[]): void {
    const content = this.exportToTxt(entries, tags);
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moodnote-journal-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Downloads JSON backup
   */
  public static downloadJson(jsonString: string): void {
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moodnote-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Generates a printable PDF view formatted as an elegant journal book
   */
  public static printOrSavePdf(entries: Entry[], tags: Tag[]): void {
    const tagMap = new Map(tags.map((t) => [t.id, t.name]));
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to generate PDF');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>MoodNote Journal Archive</title>
        <style>
          @page { margin: 20mm; size: A4; }
          body {
            font-family: 'Georgia', serif;
            line-height: 1.6;
            color: #2b2b2b;
            background: #fff;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #e5e5e5;
            padding-bottom: 24px;
            margin-bottom: 30px;
          }
          .title { font-size: 28px; font-weight: bold; margin: 0; color: #1c1917; }
          .subtitle { font-size: 14px; color: #78716c; margin-top: 6px; }
          .entry {
            page-break-inside: avoid;
            border-bottom: 1px solid #f0eee9;
            padding-bottom: 24px;
            margin-bottom: 24px;
          }
          .entry-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 8px;
          }
          .date { font-weight: bold; font-size: 16px; color: #44403c; }
          .mood-badge {
            font-size: 13px;
            background: #f5f5f4;
            padding: 3px 8px;
            border-radius: 12px;
            color: #57534e;
          }
          .entry-title { font-size: 18px; font-weight: 600; margin: 4px 0 10px 0; color: #0c0a09; }
          .body { font-size: 15px; white-space: pre-wrap; color: #292524; }
          .tags { margin-top: 10px; font-size: 12px; color: #a8a29e; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">MoodNote Journal Archive</h1>
          <div class="subtitle">Generated ${new Date().toLocaleDateString()} • ${entries.length} reflections recorded</div>
        </div>
        ${entries
          .map((e) => {
            const mood = MOOD_DEFINITIONS[e.mood];
            const entryTags = e.tagIds.map((id) => tagMap.get(id) || id).join(', ');
            return `
            <div class="entry">
              <div class="entry-header">
                <span class="date">${e.date}</span>
                <span class="mood-badge">${mood.emoji} ${mood.label} (${e.mood}/5)${e.energy ? ` • Energy ${e.energy}/5` : ''}</span>
              </div>
              ${e.title ? `<div class="entry-title">${e.title}</div>` : ''}
              <div class="body">${e.body}</div>
              ${entryTags ? `<div class="tags">Activities: ${entryTags}</div>` : ''}
            </div>
          `;
          })
          .join('')}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
