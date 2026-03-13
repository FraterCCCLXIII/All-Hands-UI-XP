import React, { useMemo, useState, useCallback, useEffect } from 'react';
import type { Node } from '@xyflow/react';
import type { WorkflowNodeData } from '../types/workflow';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  WorkflowNode,
  WorkflowToolbar,
  WorkflowNodeInspector,
  NewWorkflowWizard,
  DeleteWorkflowDialog,
  RenameWorkflowDialog,
} from '../components/workflow';
import { Settings2 } from 'lucide-react';
import {
  defaultWorkflowEdgeOptions,
  createWorkflowFromWizardData,
  createInitialWorkflow,
  type Workflow,
} from '../data/workflowData';

const nodeTypes = { workflowNode: WorkflowNode };

export const WorkflowsScreen: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>(() => [createInitialWorkflow()]);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(
    () => workflows[0]?.id ?? null
  );
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const activeWorkflow = workflows.find((w) => w.id === activeWorkflowId) ?? null;

  useEffect(() => {
    if (workflows.length > 0 && !activeWorkflow) {
      setActiveWorkflowId(workflows[0].id);
    }
  }, [workflows, activeWorkflow]);

  const handleSelectWorkflow = useCallback((workflow: Workflow) => {
    setActiveWorkflowId(workflow.id);
  }, []);

  const handleRenameWorkflow = useCallback((workflowId: string, newName: string) => {
    setWorkflows((prev) =>
      prev.map((w) => {
        if (w.id !== workflowId) return w;
        const updated = { ...w, name: newName };
        updated.nodes = updated.nodes.map((n) => {
          if (n.id === 'repo') {
            return { ...n, data: { ...n.data, workflowName: newName } };
          }
          return n;
        });
        return updated;
      })
    );
    setRenameDialogOpen(false);
  }, []);

  const handleToggleWorkflow = useCallback((workflowId: string, enabled: boolean) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === workflowId ? { ...w, enabled } : w))
    );
  }, []);

  const handleDeleteWorkflow = useCallback(() => {
    if (!activeWorkflow) return;
    const filtered = workflows.filter((w) => w.id !== activeWorkflow.id);
    if (filtered.length === 0) {
      const newWf = createInitialWorkflow();
      setWorkflows([newWf]);
      setActiveWorkflowId(newWf.id);
    } else {
      const idx = workflows.findIndex((w) => w.id === activeWorkflow.id);
      const next = filtered[Math.min(idx, filtered.length - 1)];
      setWorkflows(filtered);
      setActiveWorkflowId(next.id);
    }
    setDeleteDialogOpen(false);
  }, [activeWorkflow, workflows]);

  const handleNewWorkflowComplete = useCallback(
    (data: Parameters<typeof createWorkflowFromWizardData>[0]) => {
      const { nodes: newNodes, edges: newEdges } = createWorkflowFromWizardData(data);
      const name = data.name ?? 'Untitled workflow';
      const newWorkflow: Workflow = {
        id: `wf-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name,
        enabled: true,
        nodes: newNodes.map((n) => {
          if (n.id === 'repo') {
            return { ...n, data: { ...n.data, workflowName: name } };
          }
          return n;
        }),
        edges: newEdges,
      };
      setWorkflows((prev) => [...prev, newWorkflow]);
      setActiveWorkflowId(newWorkflow.id);
    },
    []
  );

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setInspectorOpen(true);
  }, []);

  const handleNodeSave = useCallback(
    (nodeId: string, data: WorkflowNodeData) => {
      if (!activeWorkflow) return;
      setWorkflows((prev) =>
        prev.map((w) => {
          if (w.id !== activeWorkflow.id) return w;
          return {
            ...w,
            nodes: w.nodes.map((n) =>
              n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
            ),
          };
        })
      );
    },
    [activeWorkflow]
  );

  const handleWorkflowCanvasUpdate = useCallback(
    (workflowId: string, nodes: Node[], edges: ReturnType<typeof useEdgesState>[0]) => {
      setWorkflows((prev) =>
        prev.map((w) =>
          w.id === workflowId ? { ...w, nodes, edges } : w
        )
      );
    },
    []
  );

  const defaultViewport = useMemo(
    () => ({ x: 0, y: 0, zoom: 0.55 }),
    []
  );

  return (
    <main className="relative flex-1 overflow-hidden flex flex-col min-h-0" data-workflows="true">
      <div className="workflow-canvas overflow-hidden border-border bg-card flex-1 min-h-0 rounded-none border-0">
        {activeWorkflow ? (
          <WorkflowCanvas
            key={activeWorkflow.id}
            workflow={activeWorkflow}
            workflows={workflows}
            onUpdate={handleWorkflowCanvasUpdate}
            onNodeClick={handleNodeClick}
            onSelectWorkflow={handleSelectWorkflow}
            onToggleWorkflow={handleToggleWorkflow}
            onNewWorkflow={() => setWizardOpen(true)}
            onRenameClick={() => setRenameDialogOpen(true)}
            onDeleteClick={() => setDeleteDialogOpen(true)}
            defaultViewport={defaultViewport}
          />
        ) : (
          <>
            <div className="absolute left-4 top-4 z-20">
              <WorkflowToolbar
                workflows={workflows}
                activeWorkflow={null}
                onSelectWorkflow={handleSelectWorkflow}
                onToggleWorkflow={handleToggleWorkflow}
                onNewWorkflow={() => setWizardOpen(true)}
                onRenameClick={() => setRenameDialogOpen(true)}
                onDeleteClick={() => setDeleteDialogOpen(true)}
              />
            </div>
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">No workflow selected</p>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => setInspectorOpen((o) => !o)}
          className={`pointer-events-auto fixed z-50 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/95 backdrop-blur transition-all hover:bg-accent hover:text-accent-foreground ${
            inspectorOpen ? 'right-[calc(28rem+0.5rem)]' : 'right-4'
          } top-4`}
          aria-label={inspectorOpen ? 'Hide inspector' : 'Show inspector'}
          title={inspectorOpen ? 'Hide inspector' : 'Show inspector'}
        >
          <Settings2 className="h-4 w-4" />
        </button>

      </div>

      <WorkflowNodeInspector
        node={selectedNode}
        open={inspectorOpen}
        onOpenChange={setInspectorOpen}
        onSave={handleNodeSave}
      />

      <NewWorkflowWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onComplete={handleNewWorkflowComplete}
      />

      {activeWorkflow && (
        <>
          <RenameWorkflowDialog
            open={renameDialogOpen}
            onOpenChange={setRenameDialogOpen}
            currentName={activeWorkflow.name}
            onRename={(newName) => handleRenameWorkflow(activeWorkflow.id, newName)}
          />
          <DeleteWorkflowDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            workflowName={activeWorkflow.name}
            onConfirm={handleDeleteWorkflow}
          />
        </>
      )}
    </main>
  );
};

interface WorkflowCanvasProps {
  workflow: Workflow;
  workflows: Workflow[];
  onUpdate: (workflowId: string, nodes: Node[], edges: ReturnType<typeof useEdgesState>[0]) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onSelectWorkflow: (workflow: Workflow) => void;
  onToggleWorkflow: (workflowId: string, enabled: boolean) => void;
  onNewWorkflow: () => void;
  onRenameClick: () => void;
  onDeleteClick: () => void;
  defaultViewport: { x: number; y: number; zoom: number };
}

function WorkflowCanvas({
  workflow,
  workflows,
  onUpdate,
  onNodeClick,
  onSelectWorkflow,
  onToggleWorkflow,
  onNewWorkflow,
  onRenameClick,
  onDeleteClick,
  defaultViewport,
}: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(workflow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow.edges);

  useEffect(() => {
    onUpdate(workflow.id, nodes, edges);
  }, [workflow.id, nodes, edges, onUpdate]);

  useEffect(() => {
    setNodes(workflow.nodes);
    setEdges(workflow.edges);
  }, [workflow.nodes, workflow.edges]);

  return (
    <ReactFlow
      proOptions={{ hideAttribution: true }}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      defaultEdgeOptions={defaultWorkflowEdgeOptions}
      defaultViewport={defaultViewport}
      fitView
      fitViewOptions={{ padding: 0.2, maxZoom: 0.6 }}
      minZoom={0.2}
      maxZoom={1.5}
      className="light"
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={20}
        size={2}
        color="hsl(var(--muted-foreground) / 0.35)"
      />
      <Controls position="bottom-left" className="workflow-canvas-controls" showInteractive={false} />
      <MiniMap
        className="!bg-background"
        nodeColor="hsl(var(--muted))"
        maskColor="hsl(var(--background) / 0.8)"
      />
      <Panel position="top-left" className="pointer-events-none left-4 top-4 z-20">
        <div className="pointer-events-auto">
          <WorkflowToolbar
            workflows={workflows}
            activeWorkflow={workflow}
            onSelectWorkflow={onSelectWorkflow}
            onToggleWorkflow={onToggleWorkflow}
            onNewWorkflow={onNewWorkflow}
            onRenameClick={onRenameClick}
            onDeleteClick={onDeleteClick}
          />
        </div>
      </Panel>
    </ReactFlow>
  );
}
