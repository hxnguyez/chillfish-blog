import { Card } from "@ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import React, { useMemo, lazy } from "react";
import { buttonVariants } from "@ui/button";
import { cn } from "@/lib/utils";

interface LinksProp {
  icon: string;
  to: string;
  label: string;
}

interface AuthorCardProps {
  image: string;
  name: string;
  slug: string;
  description: React.ReactNode;
  links: LinksProp[];
}

const isImageUrl = (str: string): boolean => {
  return /^\/.*\.(png|jpg|jpeg|gif|svg|webp)$/i.test(str);
};

const getSimpleIconComponentName = (iconName: string): string => {

  return `Si${iconName}`;
};

const DynamicIcon = ({
  iconName,
  size = 20,
}: {
  iconName: string;
  size?: number;
}) => {
  const IconComponent = useMemo(() => {
    return lazy(() =>
      import("@icons-pack/react-simple-icons")
        .then((mod) => {
          const componentName = getSimpleIconComponentName(iconName);
          const Icon = mod[componentName as keyof typeof mod];
          if (!Icon) throw new Error(`Icon ${componentName} not found`);
          return { default: Icon as React.ComponentType<any> };
        })
        .catch(async () => {
          const mod = await import("lucide-react");
          return {
            default: mod.Earth,
          };
        }),
    );
  }, [iconName]);

  return (
    <React.Suspense fallback={<div style={{ width: size, height: size }} />}>
      <IconComponent size={size} />
    </React.Suspense>
  );
};

function AuthorCard({
  image,
  name,
  slug,
  description,
  links,
}: AuthorCardProps) {
  return (
    <Card className="relative overflow-hidden bg-gray-800 p-4">
      {/* Decorative background image - lower right corner */}
      <div className="pointer-events-none absolute right-0 bottom-0 h-[171px] w-[171px] opacity-40">
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at bottom right, rgba(31,41,55,0) 0%, rgba(31,41,55,1) 68.75%)",
          }}
        />
      </div>

      {/* Card Content */}
      <div className="relative z-10 flex justify-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="w-full space-y-1">
          <h3 className="text-lg font-bold">{name}</h3>
          <h4 className="text-sm font-semibold opacity-30">@{slug}</h4>
          <p className="text-sm">{description}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {links.map((link) => (
              <Tooltip key={link.label}>
                <TooltipTrigger asChild>
                  <a
                    href={link.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                    )}
                  >
                    {isImageUrl(link.icon) ? (
                      <img
                        src={link.icon}
                        alt=""
                        className="h-4.5 w-4.5 object-contain"
                      />
                    ) : link.icon ? (
                      <DynamicIcon iconName={link.icon} size={18} />
                    ) : null}
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{link.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default AuthorCard;
