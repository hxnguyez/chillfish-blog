import { Card, CardContent } from "@ui/card.tsx";

interface DiscordCardProps {
  title?: string;
  subtitle: string;
  description: string;
}

export default function DiscordCard({
  title = "Discord",
  subtitle,
  description,
}: DiscordCardProps) {
  return (
    <Card className="relative overflow-hidden rounded-[14px] border border-white/10 bg-indigo-900 p-5">
      <CardContent className="p-0">
        {/* Discord decorative background */}
        {title === "Discord" && (
          <div className="pointer-events-none absolute top-[95px] -right-10">
            <div className="h-[104px] w-[124px] -rotate-10 opacity-60">
              <svg
                viewBox="0 0 71 80"
                fill="none"
                className="h-full w-full text-white"
              >
                <path
                  d="M60.105 7.987A57.626 57.626 0 0045.84 4.007a.267.267 0 00-.29.159 40.156 40.156 0 00-1.774 3.636 53.24 53.24 0 00-15.972 0 36.843 36.843 0 00-1.799-3.636.278.278 0 00-.29-.159 57.46 57.46 0 00-14.266 3.98.252.252 0 00-.117.1C1.663 23.985-.938 39.427.29 54.66a.297.297 0 00.113.202 57.95 57.95 0 0017.447 8.821.28.28 0 00.304-.1 41.385 41.385 0 003.569-5.804.27.27 0 00-.148-.375 38.168 38.168 0 01-5.45-2.596.282.282 0 01-.027-.468c.366-.274.732-.559 1.08-.847a.271.271 0 01.283-.037c11.442 5.22 23.82 5.22 35.106 0a.27.27 0 01.285.035c.348.288.715.575 1.082.849a.282.282 0 01-.025.467 35.857 35.857 0 01-5.453 2.595.28.28 0 00-.15.377 46.435 46.435 0 003.568 5.802.274.274 0 00.305.103 57.6 57.6 0 0017.467-8.821.283.283 0 00.114-.199c1.456-17.767-2.44-33.209-10.334-46.914a.222.222 0 00-.114-.116zM23.726 45.24c-3.444 0-6.283-3.16-6.283-7.043 0-3.883 2.787-7.043 6.283-7.043 3.523 0 6.337 3.186 6.283 7.043 0 3.884-2.787 7.043-6.283 7.043zm23.25 0c-3.444 0-6.283-3.16-6.283-7.043 0-3.883 2.787-7.043 6.283-7.043 3.523 0 6.337 3.186 6.283 7.043 0 3.884-2.76 7.043-6.283 7.043z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
        )}

        <div className="relative">
          <p className="mb-[15px] text-base font-medium tracking-[3.2px] text-white/40 uppercase">
            {title}
          </p>
          <h3 className="mb-2.5 text-[32px] leading-normal font-bold text-white">
            {subtitle}
          </h3>
          <p className="text-base leading-normal whitespace-pre-line text-white">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
