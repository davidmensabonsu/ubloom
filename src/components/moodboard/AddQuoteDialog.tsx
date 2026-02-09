import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface AddQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (text: string) => void;
  boards: string[];
  selectedBoard: string;
  onBoardChange: (board: string) => void;
}

export default function AddQuoteDialog({
  open,
  onOpenChange,
  onAdd,
  boards,
  selectedBoard,
  onBoardChange,
}: AddQuoteDialogProps) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim()) return;
    onAdd(text.trim());
    setText('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border-primary/20 bg-background max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Add a Quote</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Add an inspirational quote to your moodboard
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your quote here..."
            className="min-h-[100px] rounded-2xl border-primary/20 bg-muted/30 resize-none"
            maxLength={280}
          />

          <div className="flex flex-wrap gap-2">
            {boards.map((b) => (
              <button
                key={b}
                onClick={() => onBoardChange(b)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  selectedBoard === b
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-primary/20 text-muted-foreground hover:bg-muted'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="soft-button w-full disabled:opacity-40"
          >
            Add Quote
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
