"use client";

import { Card, CardContent, CardHeader } from "@ui/card.tsx";
import { Tag } from "lucide-react";
import Tags from "@ui/Tags.tsx";
import { useEffect, useState } from "react";
import config from "@shConfig";
import { CalendarDaysIcon } from "@ui/animated/calendar-days.tsx";

import { navigate } from "astro:transitions/client";

interface BlogCardProps {
  title: string;
  description?: string;
  pubDate: string; // ISO string from server
  heroImage?: string;
  href: string;
  isLoading?: boolean;
  category: string | string[] | null;
  tags: string[] | null;
  collection?: "blog" | "lab" | "research";
}

export default function BlogCard({
  title,
  description,
  pubDate,
  heroImage,
  href,
  category,
  tags,
  collection = "blog",
  isLoading = false,
}: BlogCardProps) {
  // TÍNH TOÁN NGAY LÚC RENDER ĐỂ SSR CÓ DỮ LIỆU LUÔN
  const dateObj = new Date(pubDate);
  const initialFormattedDate = dateObj.toLocaleDateString(config.lang || "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [formattedDate, setFormattedDate] = useState<string>(initialFormattedDate);

  useEffect(() => {
    // Đảm bảo format lại ở client nếu có sự khác biệt về locale
    const date = new Date(pubDate);
    setFormattedDate(
      date.toLocaleDateString(config.lang || "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );
  }, [pubDate]);

  const handleCardClick = () => {
    if (config.style.enableTransitions) {
      navigate(href);
    } else {
      window.location.href = href;
    }
  };

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div onClick={handleCardClick} className="block cursor-pointer">
      <Card
        className={`min-h-110 gap-3 overflow-hidden rounded-[14px] border border-white/10 p-0 backdrop-blur-[10px] transition-all hover:border-white/20 ${
          isLoading ? "bg-neutral-800" : "bg-neutral-900"
        } group relative flex h-full flex-col`}
      >
        {/* 背景圖層 */}
        {!isLoading && heroImage && (
          <div className="absolute inset-0 z-0 overflow-hidden rounded-[14px]">
            <img
              src={heroImage}
              alt=""
              role="presentation"
              className="h-full w-full scale-110 object-cover opacity-10 blur-[20px] transition-all duration-300 group-hover:opacity-15 group-hover:blur-[3px]"
            />
          </div>
        )}

        <CardHeader className="relative z-10 p-0 pb-0">
          <div className="h-50 overflow-hidden bg-neutral-700">
            {!isLoading && heroImage && (
              <img
                src={heroImage}
                alt={title}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </CardHeader>

        <CardContent className="relative z-10 flex flex-1 flex-col gap-2.5 p-6 pt-0">
          <div className="flex-1">
            {category && (
              <div>
                <span className="tracking-[0.5em] text-sm text-neutral-400">
                  {Array.isArray(category) ? category[0] : category}
                </span>
              </div>
            )}
            <h3
              className={`text-xl leading-normal font-bold ${
                isLoading
                  ? "h-8 animate-pulse rounded-md bg-neutral-700"
                  : "text-white"
              }`}
            >
              {!isLoading && title}
            </h3>
            {!isLoading && description && (
              <p className="line-clamp-2 text-sm leading-relaxed text-neutral-400">
                {description}
              </p>
            )}
          </div>

          {/* Metadata - ĐÃ FIX ĐỂ LUÔN HIỆN DATE */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
            {!isLoading ? (
              <>
                <div className="flex items-center gap-1.5">
                  <CalendarDaysIcon size={16} />
                  <time dateTime={pubDate}>{formattedDate}</time>
                </div>

                {tags && (
                  <div
                    className="flex items-center gap-1.5"
                    onClick={handleCategoryClick}
                  >
                    <Tag size={16} />
                    <Tags tags={tags} collection={collection} />
                  </div>
                )}
              </>
            ) : (
              <div className="h-5 w-32 animate-pulse rounded-md bg-neutral-700" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}