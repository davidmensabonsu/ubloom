import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck, CheckCircle2, Circle } from 'lucide-react';
import { typeLabels, type WonderResource } from '@/lib/wonderResources';
import { useUserStore } from '@/stores/userStore';

interface ResourceDetailSheetProps {
  resource: WonderResource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ResourceDetailSheet({ resource, open, onOpenChange }: ResourceDetailSheetProps) {
  const { profile, saveResource, unsaveResource, markResourceUsed, unmarkResourceUsed } = useUserStore();

  if (!resource) return null;

  const isSaved = profile.savedResources?.includes(resource.id);
  const isUsed = profile.usedResources?.includes(resource.id);
  const typeInfo = typeLabels[resource.type];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-left pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span>{typeInfo.emoji}</span>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{typeInfo.label}</span>
          </div>
          <SheetTitle className="font-display text-xl">{resource.title}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 pb-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {resource.description}
          </p>

          {resource.content && (
            <div className="p-4 rounded-2xl bg-muted/50 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">How to practice</h4>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                {resource.content}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {resource.tags.map((tag) => (
              <span key={tag} className="mood-pill text-xs">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl gap-2"
              onClick={() => isSaved ? unsaveResource(resource.id) : saveResource(resource.id)}
            >
              {isSaved ? <BookmarkCheck size={16} className="text-primary" /> : <Bookmark size={16} />}
              {isSaved ? 'Saved' : 'Save for later'}
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-xl gap-2"
              onClick={() => isUsed ? unmarkResourceUsed(resource.id) : markResourceUsed(resource.id)}
            >
              {isUsed ? <CheckCircle2 size={16} className="text-primary" /> : <Circle size={16} />}
              {isUsed ? 'Used' : 'Mark as used'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
