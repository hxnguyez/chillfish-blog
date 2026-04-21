import { MessageCircleMoreIcon } from "@ui/animated/message-circle-more";
import { Button } from "@ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";

export const ToCommentButton = ({ className }: { className?: string }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <>
          {/* Jump to comments button for desktop */}
          <Button
            id="to-comment-button"
            aria-label="Jump to comments"
            variant={"ghost"}
            className={`hidden backdrop-blur-md lg:block ${className}`}
            asChild
          >
            <MessageCircleMoreIcon
              size={20}
              className="text-white lg:rotate-90"
            />
          </Button>

          {/* Jump to comments button for mobile */}
          <Button
            id="to-comment-button-mobile"
            aria-label="Jump to comments"
            variant={"outline"}
            className={`block backdrop-blur-md lg:hidden ${className}`}
            asChild
          >
            <MessageCircleMoreIcon
              size={20}
              className="text-white lg:rotate-90"
            />
          </Button>
        </>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>Jump to comments</p>
      </TooltipContent>
    </Tooltip>
  );
};
