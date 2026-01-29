import * as React from 'react';
import { Search, XCircle } from 'lucide-react';
import { Input } from './input';
import { cn } from '../../lib/utils';

type InputProps = React.ComponentProps<typeof Input>;
export type SearchInputProps = Omit<InputProps, 'type' | 'size'> & {
  value: string;
  onValueChange: (value: string) => void;
  /** Size: sm (h-9), default (h-10), lg (h-11) */
  size?: 'sm' | 'default' | 'lg';
};

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onValueChange,
      placeholder,
      'aria-label': ariaLabel,
      className,
      size = 'default',
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'h-9 pl-9 pr-9',
      default: 'h-10 pl-10 pr-10',
      lg: 'h-11 pl-11 pr-11 text-base',
    };
    const iconSizes = {
      sm: 'h-4 w-4',
      default: 'h-4 w-4',
      lg: 'h-5 w-5',
    };
    const hasValue = value.length > 0;

    return (
      <div className={cn('relative w-full', className)}>
        <Search
          className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none',
            iconSizes[size]
          )}
          aria-hidden
        />
        <Input
          ref={ref}
          type="search"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className={cn(sizeClasses[size])}
          {...props}
        />
        {hasValue && (
          <button
            type="button"
            onClick={() => onValueChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Clear search"
          >
            <XCircle className={cn(iconSizes[size])} strokeWidth={2} />
          </button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';

export { SearchInput };
