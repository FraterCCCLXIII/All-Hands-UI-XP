import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import { SearchInput, Button, cn } from '@all-hands/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../prototype/src/components/ui/dropdown-menu';
import { Logo } from '../../../prototype/src/components/common/Logo';
import { MOCK_USER_NAME } from '../data/plugins';

type MarketplaceHeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
  /** When false, omits the centered search (detail page uses compact header). */
  showSearch?: boolean;
  className?: string;
};

export function MarketplaceHeader({
  search,
  onSearchChange,
  showSearch = true,
  className,
}: MarketplaceHeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        'sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80',
        className
      )}
    >
      <div className="relative flex w-full items-center justify-between gap-3 px-2 py-2 md:px-3">
        <Link
          to="/"
          className="relative z-10 flex min-w-0 shrink-0 items-center gap-2.5 text-foreground no-underline hover:opacity-90"
          aria-label="Plugins — home"
        >
          <span className="flex h-6 w-auto shrink-0 items-center" aria-hidden>
            <Logo className="h-5 w-auto text-foreground" />
          </span>
          <span className="text-sm font-semibold tracking-tight">Plugins</span>
        </Link>

        {showSearch ? (
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 hidden w-[min(100%-1rem,24rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 md:block">
            <div className="pointer-events-auto">
              <SearchInput
                value={search}
                onValueChange={onSearchChange}
                placeholder="Search"
                aria-label="Search plugins"
              />
            </div>
          </div>
        ) : null}

        <div className="relative z-10 flex shrink-0 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 px-2 text-muted-foreground hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground"
                aria-label="Account menu"
              >
                <UserRound className="h-4 w-4 shrink-0" aria-hidden />
                <span className="hidden max-w-[10rem] truncate text-sm sm:inline">{MOCK_USER_NAME}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 border-border bg-popover text-popover-foreground shadow-lg"
            >
              <DropdownMenuLabel className="font-normal">
                <span className="block truncate text-xs text-muted-foreground">Signed in as</span>
                <span className="block truncate text-sm font-medium text-foreground">{MOCK_USER_NAME}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2"
                onSelect={() => {
                  navigate('/');
                }}
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {showSearch ? (
        <div className="border-t border-border px-2 pb-2 pt-2 md:hidden">
          <SearchInput
            value={search}
            onValueChange={onSearchChange}
            placeholder="Search"
            aria-label="Search plugins"
          />
        </div>
      ) : null}
    </header>
  );
}
