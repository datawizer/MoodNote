import React, { useState, useEffect, useRef } from 'react';
import { Entry, EnergyLevel, MoodLevel, Tag } from '../types/journal';
import { MOOD_DEFINITIONS, getTodayDateString } from '../utils/journalLogic';
import { MoodSelector } from './MoodSelector';
import { X, Trash2, Check, Clock, Plus } from 'lucide-react';
import { storage } from '../db/storage';

interface EntryEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Entry) => void;
  onDelete?: (id: string) => void;
  initialEntry?: Entry | null;
  initialPrompt?: string;
  tags: Tag[];
  onAddCustomTag?: (name: string, color: string) => Tag;
  themeCardBg: string;
  themeCardBorder: string;
  themeTextPrimary: string;
  themeTextSecondary: string;
}

export const EntryEditorModal: React.FC<EntryEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialEntry,
  initialPrompt,
  tags,
  onAddCustomTag,
  themeCardBg,
  themeCardBorder,
  themeTextPrimary,
  themeTextSecondary,
}) => {
  const [date, setDate] = useState<string>(getTodayDateString());
  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [mood, setMood] = useState<MoodLevel>(4);
  const [energy, setEnergy] = useState<EnergyLevel | undefined>(3);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [draftSavedTime, setDraftSavedTime] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (initialEntry) {
      setDate(initialEntry.date);
      setTitle(initialEntry.title || '');
      setBody(initialEntry.body || '');
      setMood(initialEntry.mood);
      setEnergy(initialEntry.energy);
      setSelectedTagIds(initialEntry.tagIds || []);
      setDraftSavedTime(null);
    } else {
      const draft = storage.getDraft();
      const todayStr = getTodayDateString();
      setDate(todayStr);

      if (draft && !initialPrompt) {
        setTitle(draft.title || '');
        setBody(draft.body || '');
        setMood(draft.mood || 4);
        setEnergy(draft.energy || 3);
        setSelectedTagIds(draft.tagIds || []);
        setDraftSavedTime('Draft restored');
      } else {
        setTitle('');
        setBody(initialPrompt ? `Prompt reflection: ${initialPrompt}\n\n` : '');
        setMood(4);
        setEnergy(3);
        setSelectedTagIds([]);
        setDraftSavedTime(null);
      }
    }
    setShowDeleteConfirm(false);
  }, [isOpen, initialEntry, initialPrompt]);

  useEffect(() => {
    if (!isOpen || initialEntry) return;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      if (title.trim() || body.trim() || selectedTagIds.length > 0) {
        storage.saveDraft({
          date,
          title,
          body,
          mood,
          energy,
          tagIds: selectedTagIds,
        });
        const now = new Date();
        setDraftSavedTime(`Saved at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      }
    }, 1200);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [title, body, mood, energy, selectedTagIds, date, isOpen, initialEntry]);

  if (!isOpen) return null;

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleCreateTag = () => {
    if (!newTagName.trim() || !onAddCustomTag) return;
    const colors = ['#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#f59e0b', '#06b6d4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const created = onAddCustomTag(newTagName.trim(), randomColor);
    setSelectedTagIds((prev) => [...prev, created.id]);
    setNewTagName('');
    setShowNewTagInput(false);
  };

  const handleSave = () => {
    if (!body.trim()) {
      alert('Please write a reflection or note before saving.');
      return;
    }

    const savedEntry: Entry = {
      id: initialEntry ? initialEntry.id : `entry-${Date.now()}`,
      date,
      title: title.trim(),
      body: body.trim(),
      mood,
      energy,
      tagIds: selectedTagIds,
      createdAt: initialEntry ? initialEntry.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.saveDraft(null);
    onSave(savedEntry);
    onClose();
  };

  const handleDelete = () => {
    if (!initialEntry || !onDelete) return;
    onDelete(initialEntry.id);
    onClose();
  };

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const moodMeta = MOOD_DEFINITIONS[mood];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div
        className={`w-full max-w-xl h-full sm:h-[88vh] sm:max-h-[800px] rounded-3xl flex flex-col shadow-xl overflow-hidden border ${themeCardBg} ${themeCardBorder}`}
      >
        {/* Editor Top Bar */}
        <div className="px-5 py-3.5 border-b border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-stone-500"
              aria-label="Close editor"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-serif font-medium ${themeTextPrimary}`}>
                {initialEntry ? 'Edit Reflection' : 'New Reflection'}
              </span>
              {draftSavedTime && (
                <span className="text-[11px] text-stone-400 font-normal">
                  · {draftSavedTime}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {initialEntry && onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                aria-label="Delete entry"
                title="Delete reflection"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium shadow-xs transition-all cursor-pointer"
              aria-label="Save entry"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Editor Canvas */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Date & Mood Barometer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-zinc-400">
              <span className="font-medium">Mood: {moodMeta.emoji} {moodMeta.label}</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-xs text-stone-500 dark:text-zinc-400 focus:outline-hidden cursor-pointer"
              />
            </div>
            <MoodSelector selectedMood={mood} onSelectMood={setMood} size="compact" />
          </div>

          {/* Energy Level Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-zinc-400">
              <span>Energy: {energy ? `${energy}/5` : 'None'}</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {([1, 2, 3, 4, 5] as EnergyLevel[]).map((level) => {
                const isSelected = energy === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setEnergy(isSelected ? undefined : level)}
                    className={`py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-700 text-white font-semibold shadow-xs'
                        : 'bg-black/[0.02] dark:bg-white/[0.03] text-stone-500 dark:text-zinc-400 hover:bg-black/[0.04]'
                    }`}
                  >
                    ⚡ {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className={`w-full text-lg sm:text-xl font-serif font-semibold placeholder:font-normal placeholder:text-stone-300 dark:placeholder:text-zinc-600 bg-transparent border-b border-black/[0.04] dark:border-white/[0.05] pb-2 focus:outline-hidden ${themeTextPrimary}`}
            />
          </div>

          {/* Body Text */}
          <div className="relative">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What thoughts are gently lingering? How was your day?"
              rows={7}
              className={`w-full font-serif text-base sm:text-lg leading-relaxed placeholder:font-normal placeholder:text-stone-300 dark:placeholder:text-zinc-600 bg-transparent resize-none focus:outline-hidden ${themeTextPrimary}`}
            />
            <div className="flex justify-between items-center pt-2 text-[11px] text-stone-400 dark:text-zinc-500">
              <span>{wordCount} words</span>
              <span>Encrypted on device</span>
            </div>
          </div>

          {/* Activities / Tags */}
          <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.05]">
            <div className="flex items-center justify-between mb-2 text-xs text-stone-500 dark:text-zinc-400">
              <span className="font-medium">Activities & Context</span>
              <button
                type="button"
                onClick={() => setShowNewTagInput(!showNewTagInput)}
                className="text-amber-700 dark:text-amber-500 inline-flex items-center gap-1 hover:underline cursor-pointer font-medium"
              >
                <Plus className="w-3 h-3" />
                <span>Add tag</span>
              </button>
            </div>

            {showNewTagInput && (
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="New tag name (e.g. Yoga, Walk)"
                  className={`text-xs px-3 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-transparent ${themeTextPrimary} flex-1 focus:outline-hidden`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateTag();
                  }}
                />
                <button
                  type="button"
                  onClick={handleCreateTag}
                  className="px-3 py-1.5 rounded-lg bg-amber-700 text-white text-xs font-medium cursor-pointer"
                >
                  Create
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`text-xs px-2.5 py-1 rounded-full transition-all cursor-pointer font-medium ${
                      isSelected
                        ? 'bg-amber-700 text-white'
                        : 'bg-black/[0.02] dark:bg-white/[0.03] text-stone-500 dark:text-zinc-400 hover:text-stone-800 border border-stone-200/50 dark:border-zinc-800'
                    }`}
                  >
                    #{tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-20">
            <div className={`p-6 rounded-2xl max-w-xs w-full shadow-lg border text-center ${themeCardBg} ${themeCardBorder}`}>
              <h3 className={`text-sm font-semibold mb-1 ${themeTextPrimary}`}>Delete this reflection?</h3>
              <p className="text-xs text-stone-400 mb-4">
                This action is irreversible and will remove all recorded notes.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-stone-200 dark:border-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
