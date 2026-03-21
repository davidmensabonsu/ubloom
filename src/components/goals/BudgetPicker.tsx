import { cn } from '@/lib/utils';

const currencyOptions = [
  { value: '£', label: '£ GBP' },
  { value: '$', label: '$ USD' },
  { value: '€', label: '€ EUR' },
  { value: '¥', label: '¥ JPY' },
  { value: 'A$', label: 'A$ AUD' },
];

const budgetRanges = [
  { value: '0-100', label: '0–100' },
  { value: '100-500', label: '100–500' },
  { value: '500-1000', label: '500–1,000' },
  { value: '1000-1500', label: '1,000–1,500' },
  { value: '1500-2000', label: '1,500–2,000' },
  { value: '2000-2500', label: '2,000–2,500' },
  { value: '2500-3000', label: '2,500–3,000' },
  { value: '3000-3500', label: '3,000–3,500' },
  { value: '3500-4000', label: '3,500–4,000' },
  { value: '4000-4500', label: '4,000–4,500' },
  { value: '4500-5000', label: '4,500–5,000' },
  { value: '5000+', label: '5,000+' },
];

interface BudgetPickerProps {
  currency?: string;
  budget?: string;
  onCurrencyChange: (currency: string) => void;
  onBudgetChange: (budget: string) => void;
}

export default function BudgetPicker({ currency, budget, onCurrencyChange, onBudgetChange }: BudgetPickerProps) {
  const symbol = currency || '£';

  return (
    <div className="space-y-3">
      {/* Currency selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Currency</label>
        <div className="flex flex-wrap gap-2">
          {currencyOptions.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => onCurrencyChange(c.value)}
              className={cn("mood-pill text-sm", currency === c.value && "selected")}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Budget range pills */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Budget range</label>
        <div className="flex flex-wrap gap-2">
          {budgetRanges.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => onBudgetChange(budget === r.value ? '' : r.value)}
              className={cn("mood-pill text-sm", budget === r.value && "selected")}
            >
              {symbol}{r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
