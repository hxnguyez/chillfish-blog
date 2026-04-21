import { FileQuestionMark, RotateCcw, FileText } from "lucide-react";

import i18n from "@i18n/translation";
import I18nKey from "@i18n/i18nKey";
import { Button } from "@ui/button";

export default function EmptyBlog({}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 rounded-xl border bg-neutral-900">
      <div className="flex size-9 items-center justify-center rounded-lg border bg-neutral-800">
        <FileQuestionMark size={20} />
      </div>
      <div className="text-center text-neutral-400">
        <p className="text-2xl font-bold">{i18n(I18nKey.empty_blog_title)}</p>
        <p className="mt-2 text-sm">{i18n(I18nKey.empty_blog_description)}</p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={() => window.location.reload()}
        >
          <RotateCcw />
          {i18n(I18nKey.empty_blog_refresh)}
        </Button>
        <Button variant="outline" size="sm" className="cursor-pointer" asChild>
          <a
            href="https://github.com/510208/sh-blog-next"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText />
            {i18n(I18nKey.empty_blog_docs)}
          </a>
        </Button>
      </div>
    </div>
  );
}
