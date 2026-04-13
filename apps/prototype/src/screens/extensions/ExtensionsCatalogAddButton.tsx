import { useState } from 'react';
import { Button } from '../../components/ui/button';
import {
  AddHookModal,
  AddMcpServerModal,
  AddRepoExtensionModal,
} from './extensionsCatalogAddModals';

const ADD_LABELS = {
  skill: '+ Skill',
  plugin: '+ Plugin',
  mcp: '+ MCP Server',
  hook: '+ Hook',
} as const;

export type ExtensionsCatalogAddKind = keyof typeof ADD_LABELS;

export function ExtensionsCatalogAddButton({ kind }: { kind: ExtensionsCatalogAddKind }) {
  const [open, setOpen] = useState(false);
  const label = ADD_LABELS[kind];

  return (
    <>
      <Button type="button" variant="default" size="sm" className="shrink-0" onClick={() => setOpen(true)}>
        {label}
      </Button>
      {kind === 'skill' || kind === 'plugin' ? (
        <AddRepoExtensionModal open={open} onOpenChange={setOpen} />
      ) : kind === 'mcp' ? (
        <AddMcpServerModal open={open} onOpenChange={setOpen} />
      ) : (
        <AddHookModal open={open} onOpenChange={setOpen} />
      )}
    </>
  );
}
