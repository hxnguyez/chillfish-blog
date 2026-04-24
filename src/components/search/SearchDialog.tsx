import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ui/command";
import { useEffect, useRef, useState } from "react";
import { Button } from "@ui/button";
import { SearchIcon } from "@ui/animated/search";
import { Dialog, DialogTrigger, DialogContent } from "@ui/dialog";

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

// 1. COMPONENT BẢNG TÌM KIẾM
export function SearchCommandBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [pagefindReady, setPagefindReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<number | null>(null);

  useEffect(() => {
    const initPagefind = async () => {
      try {
        let attempts = 0;
        while (!window.pagefind && attempts < 30) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          attempts++;
        }

        if (!window.pagefind) {
          setError("Pagefind not loaded. Please run pnpm build first.");
          return;
        }

        await window.pagefind.init();
        setPagefindReady(true);
        setError(null);
      } catch (err) {
        console.error("Pagefind init failed:", err);
        setError("Failed to initialize search functionality.");
        setPagefindReady(false);
      }
    };

    initPagefind();
  }, []);

  const handleSearchChange = async (search: string) => {
    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current);
    }

    if (!search || !pagefindReady) {
      setResults([]);
      return;
    }

    debounceTimer.current = window.setTimeout(async () => {
      try {
        const searchResults = await window.pagefind.search(search);

        if (!searchResults?.results) {
          setResults([]);
          return;
        }

        const formattedResults: SearchEntry[] = await Promise.all(
          searchResults.results.slice(0, 10).map(async (result: any) => {
            try {
              const data = await result.data();
              return {
                title: data.meta?.title || data.title || "Untitled",
                slug: result.id,
                link: data.url || `/blog/${result.id}`,
                description: data.excerpt || data.meta?.description,
              };
            } catch (err) {
              console.error("Failed to parse search result:", err);
              return null;
            }
          }),
        );

        setResults(formattedResults.filter(Boolean) as SearchEntry[]);
      } catch (err) {
        console.error("Pagefind search failed:", err);
        setResults([]);
      }
    }, 500);
  };

  return (
    <div>
      <Command
        filter={(value, search, keywords) => {
          handleSearchChange(search);
          const extendValue = value + " " + (keywords?.join(" ") || "");
          if (extendValue.toLowerCase().includes(search.toLowerCase())) {
            return 1;
          }
          return 0;
        }}
      >
        <CommandInput
          placeholder="Search for writeups, posts, or keywords..."
          value={query}
          onValueChange={setQuery}
          disabled={!pagefindReady}
        />
        <CommandList>
          {error && (
            <div className="px-2 py-2 text-sm text-red-500">⚠️ {error}</div>
          )}

          {!pagefindReady && !error && (
            <div className="text-muted-foreground px-2 py-2 text-sm">
              Loading search engine...
            </div>
          )}

          {pagefindReady && query && results.length === 0 && (
            <CommandEmpty>
              No results found. Try a different keyword.
            </CommandEmpty>
          )}

          {results.length > 0 && (
            <CommandGroup heading="Results">
              {results.map((r) => (
                <CommandItem
                  key={r.slug}
                  value={r.title}
                  keywords={[r.description || ""]}
                  onSelect={() => {
                    window.location.href = r.link;
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{r.title}</span>
                    {r.description ? (
                      <span className="text-sm opacity-70">
                        {r.description}
                      </span>
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

// 2. COMPONENT NÚT BẤM HIỂN THỊ POPUP
export function SearchDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex rounded-lg bg-neutral-950 border border-white/15 hover:bg-neutral-900 cursor-pointer"
          aria-label="Search"
        >
          <SearchIcon size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg p-0 border border-white/10 bg-neutral-950">
        <SearchCommandBox />
      </DialogContent>
    </Dialog>
  );
}