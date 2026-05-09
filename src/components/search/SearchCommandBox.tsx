import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ui/command";
import { useEffect, useState } from "react";
import { Button } from "@ui/button";
import { SearchIcon } from "@ui/animated/search";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@ui/dialog";
import { TagIcon, FolderIcon } from "lucide-react";

type SearchEntry = {
  title: string;
  slug: string;
  link: string;
  description?: string;
};

declare global {
  interface Window {
    pagefind: any;
  }
}

export function SearchCommandBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [pagefindReady, setPagefindReady] = useState(false);
  const [availableFilters, setAvailableFilters] = useState<{ [key: string]: any }>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    const initPagefind = async () => {
      if (typeof window === "undefined") return;
      try {
        const dynamicImport = new Function('return import("/pagefind/pagefind.js")');
        const pagefindModule = await dynamicImport();
        await pagefindModule.init();
        window.pagefind = pagefindModule;
        
        const filters = await pagefindModule.filters();
        setAvailableFilters(filters || {});
        setPagefindReady(true);
      } catch (err) {
        console.error("Pagefind not found.");
      }
    };
    initPagefind();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (!window.pagefind) return;

      const filters: any = {};
      if (selectedCategory) filters.category = selectedCategory;
      if (selectedTag) filters.tags = selectedTag;

      const searchResults = await window.pagefind.search(query, {
        filters: Object.keys(filters).length > 0 ? filters : undefined
      });

      if (searchResults?.results) {
        const data = await Promise.all(
          searchResults.results.slice(0, 10).map(async (r: any) => {
            const res = await r.data();
            return {
              title: res.meta?.title || "Untitled",
              slug: r.id,
              link: res.url,
              description: res.excerpt,
            };
          })
        );
        setResults(data);
      } else {
        setResults([]);
      }
    };
    
    const timer = setTimeout(() => performSearch(), 200);
    return () => clearTimeout(timer);
  }, [query, selectedCategory, selectedTag, pagefindReady]);

  return (
    <div className="flex flex-col bg-neutral-950 min-h-[400px]">
      <div className="px-4 py-4 border-b border-white/10 bg-neutral-900/60 z-10">
        <div className="mb-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <FolderIcon size={14} className="text-cyan-400 shrink-0" />
          <div className="flex gap-2">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded text-[10px] uppercase font-bold transition-all border ${!selectedCategory ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-neutral-950 text-neutral-400 border-white/10 hover:border-cyan-500/50 hover:text-white'}`}
            >
              All Categories
            </button>
            {availableFilters.category && Object.keys(availableFilters.category).length > 0 ? (
              Object.keys(availableFilters.category).map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded text-[10px] uppercase font-bold whitespace-nowrap transition-all border ${selectedCategory === cat ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-neutral-950 text-neutral-400 border-white/10 hover:text-white hover:border-cyan-500/50'}`}
                >
                  {cat}
                </button>
              ))
            ) : (
              <span className="text-[10px] text-red-400 italic px-2 py-1">Data not found (run npm run build)</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <TagIcon size={14} className="text-purple-400 shrink-0" />
          <div className="flex gap-2">
            <button 
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1.5 rounded text-[10px] uppercase font-bold transition-all border ${!selectedTag ? 'bg-purple-500 text-white border-purple-500' : 'bg-neutral-950 text-neutral-400 border-white/10 hover:border-purple-500/50 hover:text-white'}`}
            >
              Any Tag
            </button>

            {availableFilters.tags && Object.keys(availableFilters.tags).length > 0 ? (
              Object.keys(availableFilters.tags).slice(0, 10).map(tag => (
                <button 
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded text-[10px] font-bold whitespace-nowrap transition-all border ${selectedTag === tag ? 'bg-purple-500 text-white border-purple-500' : 'bg-neutral-950 text-neutral-400 border-white/10 hover:text-white hover:border-purple-500/50'}`}
                >
                  #{tag}
                </button>
              ))
            ) : (
              <span className="text-[10px] text-red-400 italic px-2 py-1">Data not found (run npm run build)</span>
            )}
          </div>
        </div>
      </div>

      <Command shouldFilter={false} className="border-none bg-transparent flex-1">
        <CommandInput
          placeholder="Type to search (e.g. Llama, Buffer Overflow...)"
          value={query}
          onValueChange={setQuery}
          className="h-14 border-none focus:ring-0 text-white"
        />

        <CommandList className="max-h-[350px] custom-scrollbar">
          {!pagefindReady && (
            <div className="flex h-32 items-center justify-center text-sm text-neutral-500">
              Đang khởi tạo Engine tìm kiếm...
            </div>
          )}

          {pagefindReady && results.length === 0 && (
            <div className="flex h-32 items-center justify-center text-sm text-neutral-500">
              No data found or please enter keywords to search.
            </div>
          )}

          <CommandGroup>
            {results.map((r) => (
              <CommandItem
                key={r.slug}
                onSelect={() => window.location.href = r.link}
                className="mx-2 my-1 cursor-pointer p-3 rounded-lg border border-transparent hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all"
              >
                <div className="flex flex-col gap-1 w-full">
                  <span className="font-bold text-white">{r.title}</span>
                  {r.description && (
                    <span className="text-xs text-neutral-400 line-clamp-1 italic" dangerouslySetInnerHTML={{ __html: r.description }} />
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}

// Giữ nguyên Dialog
export function SearchDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button id="search-dialog-trigger" variant="ghost" size="icon" className="hidden sm:flex rounded-lg bg-neutral-950 border border-white/15 hover:bg-neutral-900">
          <SearchIcon size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-neutral-950 border border-white/10 p-0 shadow-2xl overflow-hidden rounded-xl">
        <DialogTitle className="hidden">Search</DialogTitle> 
        <SearchCommandBox />
      </DialogContent>
    </Dialog>
  );
}