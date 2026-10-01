'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';

import { CodeEditor } from '@/components/lab/CodeEditor';
import { Preview } from '@/components/lab/Preview';

type ComponentCategory = 'Buttons' | 'Forms' | 'Cards' | 'Navigation' | 'Feedback' | 'Other';

type ComponentVariant = {
  id: string;
  name: string;
  code: string;
};

type ComponentItem = {
  id: string;
  name: string;
  code: string;
  category?: ComponentCategory;
  description?: string;
  variants?: ComponentVariant[];
};

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

type PreviewPattern = 'none' | 'grid' | 'checker';

type PreviewState = 'default' | 'hover' | 'active' | 'focus' | 'disabled' | 'loading';

type SaveStatus = 'saved' | 'unsaved' | 'saving';

const DEFAULT_CODE = `<button className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
  Click me
</button>`;

const STORAGE_KEY = 'ui-library-components';

const DB_NAME = 'ui-library-db';
const DB_VERSION = 1;
const DB_STORE = 'components';

const CATEGORIES: ComponentCategory[] = ['Buttons', 'Forms', 'Cards', 'Navigation', 'Feedback', 'Other'];

const PREVIEW_STATES: {
  id: PreviewState;
  label: string;
}[] = [
  {
    id: 'default',
    label: 'Default',
  },
  {
    id: 'hover',
    label: 'Hover',
  },
  {
    id: 'active',
    label: 'Active',
  },
  {
    id: 'focus',
    label: 'Focus',
  },
  {
    id: 'disabled',
    label: 'Disabled',
  },
  {
    id: 'loading',
    label: 'Loading',
  },
];

function createDefaultVariant(): ComponentVariant {
  return {
    id: crypto.randomUUID(),
    name: 'Default',
    code: DEFAULT_CODE,
  };
}

function normalizeVariants(value: unknown, fallbackCode: string): ComponentVariant[] {
  if (!Array.isArray(value)) {
    return [
      {
        id: crypto.randomUUID(),
        name: 'Default',
        code: fallbackCode,
      },
    ];
  }

  const variants = value
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .filter((item) => typeof item.id === 'string' && typeof item.name === 'string' && typeof item.code === 'string')
    .map((item) => ({
      id: item.id as string,
      name: item.name as string,
      code: item.code as string,
    }));

  if (variants.length === 0) {
    return [
      {
        id: crypto.randomUUID(),
        name: 'Default',
        code: fallbackCode,
      },
    ];
  }

  return variants;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(DB_STORE)) {
        database.createObjectStore(DB_STORE, {
          keyPath: 'id',
        });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error ?? new Error('Failed to open IndexedDB.'));
    };
  });
}

function getAllComponents(): Promise<ComponentItem[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await openDatabase();

      const transaction = database.transaction(DB_STORE, 'readonly');

      const store = transaction.objectStore(DB_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as ComponentItem[]);
      };

      request.onerror = () => {
        reject(request.error ?? new Error('Failed to read components.'));
      };

      transaction.oncomplete = () => {
        database.close();
      };

      transaction.onerror = () => {
        database.close();
      };
    } catch (error) {
      reject(error);
    }
  });
}

function saveAllComponents(components: ComponentItem[]): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await openDatabase();

      const transaction = database.transaction(DB_STORE, 'readwrite');

      const store = transaction.objectStore(DB_STORE);

      store.clear();

      for (const component of components) {
        store.put(component);
      }

      transaction.oncomplete = () => {
        database.close();
        resolve();
      };

      transaction.onerror = () => {
        database.close();

        reject(transaction.error ?? new Error('Failed to save components.'));
      };

      transaction.onabort = () => {
        database.close();

        reject(transaction.error ?? new Error('Component save transaction was aborted.'));
      };
    } catch (error) {
      reject(error);
    }
  });
}

function normalizeComponents(value: unknown): ComponentItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .filter((item) => typeof item.id === 'string' && typeof item.name === 'string' && typeof item.code === 'string')
    .map((item) => {
      const rawCategory = item.category;

      const normalizedCategory = CATEGORIES.includes(rawCategory as ComponentCategory)
        ? (rawCategory as ComponentCategory)
        : 'Other';

      const code = item.code as string;

      return {
        id: item.id as string,
        name: item.name as string,
        code,
        category: normalizedCategory,
        description: typeof item.description === 'string' ? item.description : '',
        variants: normalizeVariants(item.variants, code),
      };
    });
}

async function loadComponentsWithMigration(): Promise<ComponentItem[]> {
  const indexedComponents = await getAllComponents();

  if (indexedComponents.length > 0) {
    return indexedComponents.map((component) => ({
      ...component,
      variants: normalizeVariants(component.variants, component.code),
    }));
  }

  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);

    const migratedComponents = normalizeComponents(parsed);

    if (migratedComponents.length > 0) {
      await saveAllComponents(migratedComponents);

      localStorage.removeItem(STORAGE_KEY);

      return migratedComponents;
    }

    localStorage.removeItem(STORAGE_KEY);

    return [];
  } catch {
    localStorage.removeItem(STORAGE_KEY);

    return [];
  }
}

export default function LabPage() {
  const [components, setComponents] = useState<ComponentItem[]>([]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const [code, setCode] = useState(DEFAULT_CODE);

  const [name, setName] = useState('New Component');

  const [description, setDescription] = useState('');

  const [category, setCategory] = useState<ComponentCategory>('Buttons');

  const [search, setSearch] = useState('');

  const [activeCategory, setActiveCategory] = useState<ComponentCategory | 'All'>('All');

  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');

  const [previewColor, setPreviewColor] = useState('#171717');

  const [previewPattern, setPreviewPattern] = useState<PreviewPattern>('none');

  const [previewState, setPreviewState] = useState<PreviewState>('default');

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');

  const [isLoaded, setIsLoaded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedComponent = useMemo(
    () => components.find((component) => component.id === selectedId) ?? null,
    [components, selectedId],
  );

  const variants = selectedComponent?.variants ?? [];

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const loaded = await loadComponentsWithMigration();

        if (cancelled) {
          return;
        }

        setComponents(loaded);

        if (loaded.length > 0) {
          const first = loaded[0];

          const firstVariants = first.variants ?? normalizeVariants(undefined, first.code);

          const firstVariant = firstVariants[0];

          setSelectedId(first.id);

          setSelectedVariantId(firstVariant?.id ?? null);

          setName(first.name);

          setCode(firstVariant?.code ?? first.code);

          setCategory(first.category ?? 'Other');

          setDescription(first.description ?? '');
        }
      } catch (error) {
        console.error('Failed to load UI components:', error);
      } finally {
        if (!cancelled) {
          setIsLoaded(true);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function saveComponents(nextComponents: ComponentItem[]) {
    setComponents(nextComponents);

    try {
      await saveAllComponents(nextComponents);
    } catch (error) {
      console.error('Failed to save components:', error);
    }
  }

  function handleNew() {
    setSelectedId(null);

    setSelectedVariantId(null);

    setName('New Component');

    setDescription('');

    setCode(DEFAULT_CODE);

    setCategory('Buttons');

    setPreviewState('default');

    setSaveStatus('saved');
  }

  async function handleSave() {
    const trimmedName = name.trim() || 'Untitled Component';

    if (selectedId) {
      const nextComponents = components.map((component) => {
        if (component.id !== selectedId) {
          return component;
        }

        const currentVariants = component.variants ?? normalizeVariants(undefined, component.code);

        const nextVariants = currentVariants.map((variant) =>
          variant.id === selectedVariantId
            ? {
                ...variant,
                code,
              }
            : variant,
        );

        return {
          ...component,
          name: trimmedName,
          description,
          category,
          code,
          variants: nextVariants,
        };
      });

      setSaveStatus('saving');

      await saveComponents(nextComponents);

      setSaveStatus('saved');

      return;
    }

    const newVariant = createDefaultVariant();

    newVariant.code = code;

    const newComponent: ComponentItem = {
      id: crypto.randomUUID(),
      name: trimmedName,
      description,
      code,
      category,
      variants: [newVariant],
    };

    const nextComponents = [...components, newComponent];

    setSaveStatus('saving');

    await saveComponents(nextComponents);

    setSelectedId(newComponent.id);

    setSelectedVariantId(newVariant.id);

    setSaveStatus('saved');
  }

  function handleSelect(component: ComponentItem) {
    const normalizedVariants = component.variants ?? normalizeVariants(undefined, component.code);

    const firstVariant = normalizedVariants[0];

    setSelectedId(component.id);

    setSelectedVariantId(firstVariant?.id ?? null);

    setName(component.name);

    setCode(firstVariant?.code ?? component.code);

    setCategory(component.category ?? 'Other');

    setDescription(component.description ?? '');

    setPreviewState('default');

    setSaveStatus('saved');
  }

  function handleSelectVariant(variant: ComponentVariant) {
    setSelectedVariantId(variant.id);

    setCode(variant.code);

    setPreviewState('default');

    setSaveStatus('saved');
  }

  async function handleAddVariant() {
    if (!selectedId) {
      return;
    }

    const current = components.find((component) => component.id === selectedId);

    if (!current) {
      return;
    }

    const currentVariants = current.variants ?? normalizeVariants(undefined, current.code);

    const newVariant: ComponentVariant = {
      id: crypto.randomUUID(),
      name: `Variant ${currentVariants.length + 1}`,
      code,
    };

    const nextComponents = components.map((component) =>
      component.id === selectedId
        ? {
            ...component,
            variants: [...currentVariants, newVariant],
            code,
          }
        : component,
    );

    setSaveStatus('saving');

    await saveComponents(nextComponents);

    setSelectedVariantId(newVariant.id);

    setCode(newVariant.code);

    setSaveStatus('saved');
  }

  async function handleDeleteVariant() {
    if (!selectedId || !selectedVariantId) {
      return;
    }

    const current = components.find((component) => component.id === selectedId);

    if (!current) {
      return;
    }

    const currentVariants = current.variants ?? normalizeVariants(undefined, current.code);

    if (currentVariants.length <= 1) {
      return;
    }

    const index = currentVariants.findIndex((variant) => variant.id === selectedVariantId);

    const nextVariants = currentVariants.filter((variant) => variant.id !== selectedVariantId);

    const nextVariant = nextVariants[Math.max(0, index - 1)];

    const nextComponents = components.map((component) =>
      component.id === selectedId
        ? {
            ...component,
            variants: nextVariants,
            code: nextVariant?.code ?? component.code,
          }
        : component,
    );

    setSaveStatus('saving');

    await saveComponents(nextComponents);

    setSelectedVariantId(nextVariant?.id ?? null);

    setCode(nextVariant?.code ?? DEFAULT_CODE);

    setSaveStatus('saved');
  }

  async function handleDelete() {
    if (!selectedId) {
      return;
    }

    const nextComponents = components.filter((component) => component.id !== selectedId);

    setSaveStatus('saving');

    await saveComponents(nextComponents);

    if (nextComponents.length > 0) {
      const next = nextComponents[0];

      const nextVariants = next.variants ?? normalizeVariants(undefined, next.code);

      const nextVariant = nextVariants[0];

      setSelectedId(next.id);

      setSelectedVariantId(nextVariant?.id ?? null);

      setName(next.name);

      setCode(nextVariant?.code ?? next.code);

      setCategory(next.category ?? 'Other');

      setDescription(next.description ?? '');

      setSaveStatus('saved');
    } else {
      handleNew();
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
  }

  async function handleDuplicate() {
    if (!selectedId) {
      return;
    }

    const current = components.find((component) => component.id === selectedId);

    if (!current) {
      return;
    }

    const currentVariants = current.variants ?? normalizeVariants(undefined, current.code);

    const duplicateVariants = currentVariants.map((variant) => ({
      ...variant,
      id: crypto.randomUUID(),
    }));

    const duplicate: ComponentItem = {
      ...current,
      id: crypto.randomUUID(),
      name: `${current.name} Copy`,
      code: duplicateVariants[0]?.code ?? current.code,
      variants: duplicateVariants,
    };

    const nextComponents = [...components, duplicate];

    setSaveStatus('saving');

    await saveComponents(nextComponents);

    setSelectedId(duplicate.id);

    setSelectedVariantId(duplicateVariants[0]?.id ?? null);

    setName(duplicate.name);

    setDescription(duplicate.description ?? '');

    setCode(duplicateVariants[0]?.code ?? duplicate.code);

    setCategory(duplicate.category ?? 'Other');

    setSaveStatus('saved');
  }

  function handleExport() {
    if (components.length === 0) {
      return;
    }

    const data = JSON.stringify(components, null, 2);

    const blob = new Blob([data], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;

    link.download = `ui-library-${new Date().toISOString().slice(0, 10)}.json`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const text = await file.text();

      const parsed = JSON.parse(text);

      const imported = normalizeComponents(parsed);

      if (imported.length === 0) {
        window.alert('No valid components were found in this file.');

        return;
      }

      const existingIds = new Set(components.map((component) => component.id));

      const normalizedImported = imported.map((component) => {
        if (existingIds.has(component.id)) {
          return {
            ...component,
            id: crypto.randomUUID(),
          };
        }

        return component;
      });

      const nextComponents = [...components, ...normalizedImported];

      setSaveStatus('saving');

      await saveComponents(nextComponents);

      const firstImported = normalizedImported[0];

      const firstVariant = firstImported.variants?.[0];

      setSelectedId(firstImported.id);

      setSelectedVariantId(firstVariant?.id ?? null);

      setName(firstImported.name);

      setDescription(firstImported.description ?? '');

      setCode(firstVariant?.code ?? firstImported.code);

      setCategory(firstImported.category ?? 'Other');

      setPreviewState('default');

      setSaveStatus('saved');
    } catch {
      window.alert('Failed to import components. Please select a valid UI Library JSON file.');
    } finally {
      event.target.value = '';
    }
  }

  useEffect(() => {
    if (!isLoaded || !selectedId || !selectedVariantId) {
      return;
    }

    setSaveStatus('unsaved');

    const timeout = window.setTimeout(async () => {
      setSaveStatus('saving');

      const nextComponents = components.map((component) => {
        if (component.id !== selectedId) {
          return component;
        }

        const currentVariants = component.variants ?? normalizeVariants(undefined, component.code);

        const nextVariants = currentVariants.map((variant) =>
          variant.id === selectedVariantId
            ? {
                ...variant,
                code,
              }
            : variant,
        );

        return {
          ...component,
          name: name.trim() || 'Untitled Component',
          description,
          category,
          code,
          variants: nextVariants,
        };
      });

      try {
        await saveAllComponents(nextComponents);

        setComponents(nextComponents);

        setSaveStatus('saved');
      } catch (error) {
        console.error('Failed to auto-save components:', error);

        setSaveStatus('unsaved');
      }
    }, 700);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [code, name, description, category, selectedId, selectedVariantId, isLoaded]);

  const filteredComponents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return components.filter((component) => {
      const componentCategory = component.category ?? 'Other';

      const matchesCategory = activeCategory === 'All' || componentCategory === activeCategory;

      const matchesSearch =
        !normalizedSearch ||
        component.name.toLowerCase().includes(normalizedSearch) ||
        componentCategory.toLowerCase().includes(normalizedSearch) ||
        (component.description ?? '').toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [components, search, activeCategory]);

  const previewModes: {
    id: PreviewMode;
    label: string;
  }[] = [
    {
      id: 'desktop',
      label: 'Desktop',
    },
    {
      id: 'tablet',
      label: 'Tablet',
    },
    {
      id: 'mobile',
      label: 'Mobile',
    },
  ];

  const previewPatterns: {
    id: PreviewPattern;
    label: string;
  }[] = [
    { id: 'none', label: 'Solid' },
    { id: 'grid', label: 'Grid' },
    { id: 'checker', label: 'Checker' },
  ];

  const previewPresetColors: {
    id: string;
    color: string;
  }[] = [
    { id: 'Dark', color: '#171717' },
    { id: 'Light', color: '#f5f5f5' },
    { id: 'Slate', color: '#0f172a' },
    { id: 'Cream', color: '#f5f1e8' },
    { id: 'Mint', color: '#d1fae5' },
    { id: 'Rose', color: '#ffe4e6' },
  ];

  return (
    <main className="h-screen overflow-hidden bg-[#111110] text-white">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
        <div>
          <h1 className="text-sm font-semibold tracking-tight">UI Lab</h1>

          <p className="text-xs text-white/40">Your personal component library</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImport}
            className="hidden"
          />

          <button
            type="button"
            onClick={handleImportClick}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold transition hover:bg-white/10">
            Import
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={components.length === 0}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold transition hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30">
            Export
          </button>

          <button
            type="button"
            onClick={handleNew}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold transition hover:bg-white/10">
            + New Component
          </button>
        </div>
      </header>

      <div className="grid h-[calc(100vh-4rem)] min-h-0 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="min-h-0 overflow-y-auto border-b border-white/10 lg:border-r lg:border-b-0">
          <div className="border-b border-white/10 p-3">
            <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-white/35">Components</p>

            <div className="relative">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30">
                <path
                  d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search..."
                className="h-8 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-8 pr-3 text-xs text-white outline-none placeholder:text-white/25 focus:border-white/20 focus:bg-white/[0.06]"
              />
            </div>
          </div>

          <div className="border-b border-white/10 p-2">
            <button
              type="button"
              onClick={() => setActiveCategory('All')}
              className={[
                'mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition',
                activeCategory === 'All' ? 'bg-white/10 text-white' : 'text-white/45 hover:bg-white/5 hover:text-white',
              ].join(' ')}>
              <span>All components</span>

              <span className="text-[10px] text-white/25">{components.length}</span>
            </button>

            {CATEGORIES.map((item) => {
              const count = components.filter((component) => (component.category ?? 'Other') === item).length;

              const active = activeCategory === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActiveCategory(item)}
                  className={[
                    'mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition',
                    active ? 'bg-white/10 text-white' : 'text-white/45 hover:bg-white/5 hover:text-white',
                  ].join(' ')}>
                  <span>{item}</span>

                  <span className="text-[10px] text-white/25">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="p-2">
            {filteredComponents.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <p className="text-xs text-white/30">{search ? 'No components found' : 'No saved components'}</p>
              </div>
            ) : (
              filteredComponents.map((component) => (
                <button
                  key={component.id}
                  type="button"
                  onClick={() => handleSelect(component)}
                  className={[
                    'mb-1 w-full rounded-lg px-3 py-2 text-left transition',
                    selectedId === component.id
                      ? 'bg-white/10 text-white'
                      : 'text-white/50 hover:bg-white/5 hover:text-white',
                  ].join(' ')}>
                  <div className="truncate text-sm">{component.name}</div>

                  <div className="mt-0.5 truncate text-[10px] text-white/25">
                    {component.description || component.category || 'Other'}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex min-h-0 flex-wrap items-center gap-3 border-b border-white/10 px-4 py-3">
            <div className="min-w-0 flex-1">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-white/25"
                placeholder="Component name"
              />

              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add a short description..."
                className="mt-0.5 w-full bg-transparent text-xs text-white/45 outline-none placeholder:text-white/20"
              />
            </div>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as ComponentCategory)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white outline-none">
              {CATEGORIES.map((item) => (
                <option key={item} value={item} className="bg-[#181817] text-white">
                  {item}
                </option>
              ))}
            </select>

            <div className="hidden items-center gap-1.5 text-[11px] sm:flex">
              <span
                className={[
                  'h-1.5 w-1.5 rounded-full',
                  saveStatus === 'saved'
                    ? 'bg-emerald-400'
                    : saveStatus === 'saving'
                      ? 'animate-pulse bg-amber-400'
                      : 'bg-amber-400',
                ].join(' ')}
              />

              <span className="text-white/35">
                {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved changes'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleDuplicate}
              disabled={!selectedId}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold transition hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30">
              Duplicate
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold transition hover:bg-white/10">
              Copy
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={!selectedId}
              className="rounded-lg border border-red-400/10 bg-red-400/5 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-400/10 disabled:pointer-events-none disabled:opacity-30">
              Delete
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-white/90">
              Save
            </button>
          </div>

          <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] border-b border-white/10">
            <div className="flex min-h-[44px] flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/35">Preview</span>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1">
                  {previewModes.map((mode) => {
                    const active = previewMode === mode.id;

                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setPreviewMode(mode.id)}
                        className={[
                          'rounded-md px-2.5 py-1.5 text-[11px] font-medium transition',
                          active
                            ? 'bg-white/10 text-white shadow-sm'
                            : 'text-white/35 hover:bg-white/5 hover:text-white/70',
                        ].join(' ')}>
                        {mode.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] p-1">
                  {previewPresetColors.map((preset) => {
                    const active = previewColor.toLowerCase() === preset.color.toLowerCase();

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setPreviewColor(preset.color)}
                        title={preset.id}
                        aria-label={preset.id}
                        className={[
                          'h-6 w-6 rounded-md border transition',
                          active
                            ? 'border-white/80 ring-1 ring-white/40'
                            : 'border-white/15 hover:border-white/40',
                        ].join(' ')}
                        style={{ backgroundColor: preset.color }}
                      />
                    );
                  })}

                  <label
                    title="Custom color"
                    className="relative h-6 w-6 cursor-pointer overflow-hidden rounded-md border border-white/15 transition hover:border-white/40"
                    style={{
                      background:
                        'conic-gradient(from 180deg, #f87171, #fbbf24, #34d399, #60a5fa, #a78bfa, #f87171)',
                    }}>
                    <input
                      type="color"
                      value={previewColor}
                      onChange={(event) => setPreviewColor(event.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1">
                  {previewPatterns.map((item) => {
                    const active = previewPattern === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPreviewPattern(item.id)}
                        className={[
                          'rounded-md px-2.5 py-1.5 text-[11px] font-medium transition',
                          active
                            ? 'bg-white/10 text-white shadow-sm'
                            : 'text-white/35 hover:bg-white/5 hover:text-white/70',
                        ].join(' ')}>
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="min-h-0">
              <Preview
                code={code}
                mode={previewMode}
                pattern={previewPattern}
                color={previewColor}
                state={previewState}
              />
            </div>
          </div>

          <div className="grid min-h-0 grid-rows-[auto_33px_minmax(0,1fr)]">
            <div className="flex min-h-[52px] items-center justify-between gap-3 border-b border-white/10 px-4 py-2">
              <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
                <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-white/35">
                  Variants
                </span>

                <div className="flex items-center gap-1">
                  {variants.map((variant) => {
                    const active = selectedVariantId === variant.id;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => handleSelectVariant(variant)}
                        className={[
                          'shrink-0 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition',
                          active ? 'bg-white/10 text-white' : 'text-white/35 hover:bg-white/5 hover:text-white/70',
                        ].join(' ')}>
                        {variant.name}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleAddVariant}
                  disabled={!selectedId}
                  className="shrink-0 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-white/60 transition hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30">
                  + Variant
                </button>

                <button
                  type="button"
                  onClick={handleDeleteVariant}
                  disabled={!selectedId || variants.length <= 1}
                  className="shrink-0 rounded-md border border-red-400/10 bg-red-400/5 px-2.5 py-1.5 text-[11px] font-semibold text-red-300 transition hover:bg-red-400/10 disabled:pointer-events-none disabled:opacity-30">
                  Remove
                </button>
              </div>

              <div className="flex shrink-0 items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1">
                {PREVIEW_STATES.map((item) => {
                  const active = previewState === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPreviewState(item.id)}
                      className={[
                        'rounded-md px-2 py-1.5 text-[10px] font-medium transition',
                        active ? 'bg-white/10 text-white' : 'text-white/35 hover:bg-white/5 hover:text-white/70',
                      ].join(' ')}>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center border-b border-white/10 px-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/35">Code</span>
            </div>

            <div className="min-h-0">
              <CodeEditor value={code} onChange={setCode} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}