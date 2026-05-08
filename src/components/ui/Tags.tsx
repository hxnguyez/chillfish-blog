"use client";

import { Hash, MoreHorizontal } from "lucide-react";
import { Badge } from "./badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip";
import { slugTag } from "@lib/tag";

interface TagsProps {
  tags?: string[] | null;
  collection?: "blog" | "lab" | "research";
}

export default function Tags({ tags, collection = "blog" }: TagsProps) {
  if (!tags || tags.length === 0) return null;

  const [first, ...rest] = tags;

  return (
    <div className="tags-list flex items-center gap-2">
      <a href={`/tags/${slugTag(first)}`} className="tag-link">
        <Badge variant="secondary" className="px-2 text-sm">
          <Hash size={14} />
          {first}
        </Badge>
      </a>

      {rest.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              aria-haspopup="true"
              aria-label="View more tag"
              className="tag-more inline-flex items-center rounded bg-neutral-800 px-2 py-1 text-sm transition hover:bg-neutral-700"
              tabIndex={0}
            >
              <MoreHorizontal size={14} />
            </button>
          </TooltipTrigger>

          <TooltipContent
            sideOffset={8}
            className="z-999 min-w-40 rounded-md border border-white/10 bg-neutral-900 p-2 shadow-lg"
          >
            <div className="flex flex-col gap-2">
              {rest.map((tag) => (
                <a
                  key={tag}
                  href={`/tags/${slugTag(tag)}`}
                  className="inline-flex"
                >
                  <Badge variant="secondary" className="px-2 text-sm">
                    <Hash size={14} />
                    {tag}
                  </Badge>
                </a>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
