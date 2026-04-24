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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initPagefind = async () => {
      if (typeof window === "undefined") return;

      if (window.pagefind) {
        setPagefindReady(true);
        return;
      }

      try {
        const dynamicImport = new Function('return import("/pagefind/pagefind.js")');
        const pagefindModule = await dynamicImport();

        await pagefindModule.init();
        window.pagefind = pagefindModule;
        setPagefindReady(true);
        setError(null);
      } catch (err) {
        console.error("Pagefind init failed:", err);
        setError("Search index not found. (Normal in dev mode)");
        setPagefindReady(false);
      }
    };

    initPagefind();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (!query || !pagefindReady || !window.pagefind) {
        setResults([]);
        return;
      }

      try {
        const searchResults = await window.pagefind.search(query);

        if (!searchResults?.results) {
          setResults([]);
          return;
        }

        const formattedResults: SearchEntry[] = await Promise.all(
          searchResults.results.slice(0, 15).map(async (result: any) => {
            try {
              const data = await result.data();
              
              // CHỈ TÌM TRONG BLOG VÀ LAB
              if (!data.url || (!data.url.includes("/blog/") && !data.url.includes("/lab/"))) {
                return null;
              }

              return {
                title: data.meta?.title || data.title || "Untitled",
                slug: result.id,
                link: data.url,
                description: data.excerpt || data.meta?.description,
              };
            } catch (err) {
              return null;
            }
          })
        );

        setResults(formattedResults.filter(Boolean) as SearchEntry[]);
      } catch (err) {
        console.error("Pagefind search failed:", err);
        setResults([]);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, pagefindReady]);

  return (
    <div>
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search writeups, posts, or keywords..."
          value={query}
          onValueChange={setQuery}
          disabled={!pagefindReady}
        />
        
        {/* KHU VỰC HIỂN THỊ KẾT QUẢ ĐƯỢC THÊM HIỆU ỨNG DÃN MƯỢT VÀ KHOẢNG TRỐNG */}
        <CommandList className="min-h-[150px] transition-all duration-300 ease-in-out">
          
          {/* Lỗi */}
          {error && (
            <div className="flex h-[150px] items-center justify-center text-sm text-red-500">
              ⚠️ {error}
            </div>
          )}

          {/* Đang tải */}
          {!pagefindReady && !error && (
            <div className="flex h-[150px] items-center justify-center text-sm text-neutral-500">
              Loading search engine...
            </div>
          )}

          {/* Trạng thái trống (Mới mở lên, chưa gõ gì) */}
          {pagefindReady && !query && !error && (
            <div className="flex h-[150px] items-center justify-center text-sm text-neutral-600">
              Type a keyword to start searching...
            </div>
          )}

          {/* Không tìm thấy kết quả */}
          {pagefindReady && query && results.length === 0 && (
            <CommandEmpty className="flex h-[150px] items-center justify-center text-sm text-neutral-500">
              No results found. Try a different keyword.
            </CommandEmpty>
          )}

          {/* Hiển thị kết quả */}
          {results.length > 0 && (
            <CommandGroup heading="Results">
              {results.map((r) => (
                <CommandItem
                  key={r.slug}
                  value={r.title}
                  onSelect={() => {
                    window.location.href = r.link;
                  }}
                  className="cursor-pointer py-3"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-white">{r.title}</span>
                    
                    {r.description ? (
                      <span 
                        className="text-xs text-neutral-400 truncate max-w-[480px]"
                        dangerouslySetInnerHTML={{ __html: r.description }}
                      />
                    ) : null}

                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </div>
  );
}

export function SearchDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          id="search-dialog-trigger"
          variant="ghost"
          size="icon"
          className="hidden sm:flex rounded-lg bg-neutral-950 border border-white/15 hover:bg-neutral-900 cursor-pointer transition-colors"
          title="Search (Ctrl + K)"
        >
          <SearchIcon size={18} />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-xl bg-neutral-950 border border-white/10 p-0 shadow-2xl overflow-hidden">
        <DialogTitle className="hidden">Search Blog</DialogTitle> 
        <SearchCommandBox />
      </DialogContent>
    </Dialog>
  );
}