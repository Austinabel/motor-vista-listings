import { BadgeCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Shown only for dealers an admin has approved after reviewing their CAC registration number and
// the owner's ID document. It says nothing about individual cars, and the tooltip says so.
export const VerifiedBusinessBadge = ({ className = "" }: { className?: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span
        tabIndex={0}
        className={`inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary ${className}`}
      >
        <BadgeCheck className="h-3.5 w-3.5" />
        Verified business
      </span>
    </TooltipTrigger>
    <TooltipContent className="max-w-xs">
      Motorcars reviewed this business's CAC registration number and the owner's ID. Individual cars are not checked:
      inspect any car before you pay.
    </TooltipContent>
  </Tooltip>
);
