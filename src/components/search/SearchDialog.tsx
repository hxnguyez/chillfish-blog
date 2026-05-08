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
import { ChevronDown, Check } from "lucide-react";

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
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // UI States cho Dropdown
  const [activeDropdown, setActiveDropdown] = useState<'category' | 'tag' | null>(null);

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

      // Nếu không gõ chữ và cũng không chọn thẻ nào -> Xóa kết quả
      if (!query && !selectedCategory && !selectedTag) {
        setResults([]);
        return;
      }

      const filters: any = {};
      if (selectedCategory) filters.category = selectedCategory;
      if (selectedTag) filters.tags = selectedTag;

      // LOGIC PWN PAGEFIND: Nếu ô search trống, bắt buộc phải truyền `null` để nó lấy theo Filter
      const searchQuery = query.trim() !== "" ? query : null;

      const searchResults = await window.pagefind.search(searchQuery, {
        filters: Object.keys(filters).length > 0 ? filters : undefined
      });

      if (searchResults?.results) {
        const data = await Promise.all(
          searchResults.results.slice(0, 15).map(async (r: any) => {
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
    <div className="flex flex-col bg-neutral-950 min-h-[400px] relative">
      
      {/* Lớp nền tàng hình để bấm ra ngoài là đóng Dropdown */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setActiveDropdown(null)}
        />
      )}

      <Command shouldFilter={false} className="border-none bg-transparent flex-1">
        <CommandInput
          placeholder="Enter keywords to search for articles, CVE..."
          value={query}
          onValueChange={setQuery}
          className="h-14 border-none focus:ring-0 text-white"
        />

        {/* THANH FILTER */}
        <div className="flex items-center gap-6 px-4 py-2 border-b border-white/5 bg-neutral-900/40 text-[11px] uppercase tracking-widest font-semibold z-50">
          
          {/* CATEGORY DROPDOWN */}
          <div className="relative">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
            >
              Category: <span className="text-cyan-400">{selectedCategory || 'All'}</span>
              <ChevronDown size={14} className={`transition-transform ${activeDropdown === 'category' ? 'rotate-180' : ''}`} />
            </button>
            
            {activeDropdown === 'category' && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-neutral-950 border border-white/10 rounded-lg shadow-xl py-1 z-50 overflow-hidden">
                <button 
                  onClick={() => { setSelectedCategory(null); setActiveDropdown(null); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-cyan-500/10 text-left text-neutral-300 transition-colors"
                >
                  ALL CATEGORIES
                  {!selectedCategory && <Check size={14} className="text-cyan-400" />}
                </button>
                {availableFilters.category && Object.keys(availableFilters.category).map(cat => (
                  <button 
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setActiveDropdown(null); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-cyan-500/10 text-left text-neutral-300 transition-colors"
                  >
                    {cat}
                    {selectedCategory === cat && <Check size={14} className="text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* TAG DROPDOWN */}
          <div className="relative border-l border-white/10 pl-6">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'tag' ? null : 'tag')}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
            >
              Tag: <span className="text-purple-400">{selectedTag || 'Any'}</span>
              <ChevronDown size={14} className={`transition-transform ${activeDropdown === 'tag' ? 'rotate-180' : ''}`} />
            </button>
            
            {activeDropdown === 'tag' && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-neutral-950 border border-white/10 rounded-lg shadow-xl py-1 z-50 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar-mini">
                <button 
                  onClick={() => { setSelectedTag(null); setActiveDropdown(null); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-purple-500/10 text-left text-neutral-300 transition-colors"
                >
                  ANY TAG
                  {!selectedTag && <Check size={14} className="text-purple-400" />}
                </button>
                {availableFilters.tags && Object.keys(availableFilters.tags).map(tag => (
                  <button 
                    key={tag}
                    onClick={() => { setSelectedTag(tag); setActiveDropdown(null); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-purple-500/10 text-left text-neutral-300 transition-colors lowercase"
                  >
                    #{tag}
                    {selectedTag === tag && <Check size={14} className="text-purple-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* KẾT QUẢ TÌM KIẾM */}
        <CommandList className="max-h-[350px] custom-scrollbar">
          {!pagefindReady && (
            <div className="flex h-32 items-center justify-center text-sm text-neutral-500">
              Initializing search engine...
            </div>
          )}

          {/* THÔNG BÁO KHI CHƯA LÀM GÌ */}
          {pagefindReady && !query && !selectedCategory && !selectedTag && (
            <div className="flex h-32 items-center justify-center text-sm text-neutral-500 italic">
              Enter keyword or select Category/Tag to start...
            </div>
          )}

          {/* THÔNG BÁO KHI ĐÃ LỌC NHƯNG KHÔNG CÓ KẾT QUẢ */}
          {pagefindReady && (query || selectedCategory || selectedTag) && results.length === 0 && (
            <div className="flex h-32 items-center justify-center text-sm text-neutral-500">
              No data found matching your criteria.
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
                  <span className="font-bold text-white text-base">{r.title}</span>
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

export function SearchDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button id="search-dialog-trigger" variant="ghost" size="icon" className="hidden sm:flex rounded-lg bg-neutral-950 border border-white/15 hover:bg-neutral-900">
          <SearchIcon size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-neutral-950 border border-white/10 p-0 shadow-[0_0_50px_-12px_rgba(34,211,238,0.15)] overflow-hidden rounded-xl">
        <DialogTitle className="hidden">System Search</DialogTitle> 
        <SearchCommandBox />
      </DialogContent>
    </Dialog>
  );
}