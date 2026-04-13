import { useState } from 'react';
import { SettingsScreen } from './SettingsScreen';
import { PrototypeControlsFab } from '../components/common/PrototypeControlsFab';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';

const roleOptions = ['Personal', 'Org User', 'Org Admin'] as const;
type RoleOption = (typeof roleOptions)[number];

export function NewLlmSwitcherScreen() {
  const [selectedRole, setSelectedRole] = useState<RoleOption>('Personal');

  return (
    <div className="flex h-full w-full min-w-0 bg-background">
      <SettingsScreen initialTab="llm" />
      <Popover>
        <PopoverTrigger asChild>
          <PrototypeControlsFab isActive aria-label="Role controls" title="Role controls" />
        </PopoverTrigger>
        <PopoverContent side="top" align="end" className="w-56 p-3 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Role
          </div>
          <div className="space-y-1">
            {roleOptions.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
                  selectedRole === role
                    ? 'bg-muted/60 text-foreground'
                    : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                }`}
              >
                <span>{role}</span>
                {selectedRole === role && (
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Active</span>
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
