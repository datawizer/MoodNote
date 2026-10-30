import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Entry, Tag } from '../types/journal';
import { MOOD_DEFINITIONS, escapeHtml, formatLongDate, validateBackupData } from '../lib/journalLogic';
import { exportBackup } from '../lib/db';

const stamp = () => new Date().toISOString().slice(0, 10);

async function shareText(filename: string, content: string, mimeType: string, UTI: string) {
  const file = new File(Paths.cache, filename);
  if (file.exists) file.delete();
  file.create();
  file.write(content);
  await Sharing.shareAsync(file.uri, { mimeType, UTI, dialogTitle: 'Export MoodNote' });
}

function tagNames(entry: Entry, tags: Tag[]) {
  const map = new Map(tags.map((t) => [t.id, t.name]));
  return entry.tagIds.map((id) => map.get(id) ?? id);
}

export function buildMarkdown(entries: Entry[], tags: Tag[]): string {
  const lines = [`# MoodNote Journal`, ``, `Exported ${new Date().toLocaleString()} · ${entries.length} entries`, ``];
  for (const e of entries) {
    const mood = MOOD_DEFINITIONS[e.mood];
    lines.push(`## ${formatLongDate(e.date)}${e.title ? ` — ${e.title}` : ''}`, '');
    let meta = `${mood.emoji} ${mood.label} (${e.mood}/5)`;
    if (e.energy) meta += ` · Energy ${e.energy}/5`;
    const names = tagNames(e, tags);
    if (names.length) meta += ` · ${names.map((n) => `#${n}`).join(' ')}`;
    lines.push(`*${meta}*`, '');
    if (e.prompt) lines.push(`> ${e.prompt}`, '');
    lines.push(e.body, '', '---', '');
  }
  return lines.join('\n');
}

export async function exportMarkdown(entries: Entry[], tags: Tag[]) {
  await shareText(`moodnote-journal-${stamp()}.md`, buildMarkdown(entries, tags), 'text/markdown', 'net.daringfireball.markdown');
}

export async function exportJson() {
  await shareText(`moodnote-backup-${stamp()}.json`, JSON.stringify(exportBackup(), null, 2), 'application/json', 'public.json');
}

export async function exportPdf(entries: Entry[], tags: Tag[]) {
  const body = entries
    .map((e) => {
      const mood = MOOD_DEFINITIONS[e.mood];
      const names = tagNames(e, tags);
      return `
        <section class="entry">
          <div class="meta"><span class="date">${escapeHtml(formatLongDate(e.date))}</span>
            <span class="mood">${mood.emoji} ${mood.label}${e.energy ? ` · Energy ${e.energy}/5` : ''}</span></div>
          ${e.title ? `<h2>${escapeHtml(e.title)}</h2>` : ''}
          ${e.prompt ? `<p class="prompt">${escapeHtml(e.prompt)}</p>` : ''}
          <p class="body">${escapeHtml(e.body)}</p>
          ${names.length ? `<p class="tags">${names.map((n) => `#${escapeHtml(n)}`).join(' ')}</p>` : ''}
        </section>`;
    })
    .join('');

  const html = `<!doctype html><html><head><meta charset="utf-8"/>
    <style>
      @page { margin: 22mm 20mm; }
      body { font-family: Georgia, serif; color: #2b2622; line-height: 1.6; }
      header { text-align: center; border-bottom: 1px solid #e6dfd5; padding-bottom: 18px; margin-bottom: 26px; }
      h1 { font-size: 26px; margin: 0; }
      .sub { color: #8a8077; font-size: 13px; margin-top: 4px; font-family: -apple-system, Helvetica, sans-serif; }
      .entry { page-break-inside: avoid; border-bottom: 1px solid #f0ebe3; padding-bottom: 18px; margin-bottom: 18px; }
      .meta { display: flex; justify-content: space-between; font-family: -apple-system, Helvetica, sans-serif; font-size: 12px; color: #8a8077; }
      .date { font-weight: 600; color: #4a423b; }
      h2 { font-size: 18px; margin: 6px 0 4px; }
      .prompt { font-style: italic; color: #8a8077; margin: 4px 0; }
      .body { white-space: pre-wrap; font-size: 14px; margin: 6px 0; }
      .tags { font-size: 11px; color: #a39a90; font-family: -apple-system, Helvetica, sans-serif; }
    </style></head><body>
    <header><h1>MoodNote Journal</h1><div class="sub">${entries.length} entries · exported ${escapeHtml(new Date().toLocaleDateString())}</div></header>
    ${body}
    </body></html>`;

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Export MoodNote' });
}

export type PickedBackup =
  | { status: 'cancelled' }
  | { status: 'invalid'; error: string }
  | { status: 'ok'; entries: Entry[]; tags?: Tag[] };

export async function pickBackup(): Promise<PickedBackup> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.length) return { status: 'cancelled' };

  let parsed: unknown;
  try {
    parsed = JSON.parse(await new File(result.assets[0].uri).text());
  } catch {
    return { status: 'invalid', error: 'That file is not a MoodNote JSON backup.' };
  }
  const check = validateBackupData(parsed);
  if (!check.isValid || !check.entries) return { status: 'invalid', error: check.error ?? 'Invalid backup.' };
  return { status: 'ok', entries: check.entries, tags: check.tags };
}
