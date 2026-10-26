import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export class ExportService {
  public static async exportToJson(data: any): Promise<void> {
    const jsonStr = JSON.stringify(data, null, 2);
    const filename = `moodnote-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const filePath = `${FileSystem.documentDirectory}${filename}`;

    await FileSystem.writeAsStringAsync(filePath, jsonStr, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: 'Export MoodNote Backup',
        UTI: 'public.json',
      });
    }
  }

  public static async exportToMarkdown(markdownContent: string): Promise<void> {
    const filename = `moodnote-journal-${new Date().toISOString().slice(0, 10)}.md`;
    const filePath = `${FileSystem.documentDirectory}${filename}`;

    await FileSystem.writeAsStringAsync(filePath, markdownContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'text/markdown',
        dialogTitle: 'Export MoodNote Journal',
        UTI: 'net.daringfireball.markdown',
      });
    }
  }
}
