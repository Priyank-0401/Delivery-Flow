import { useState } from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable } from '@/components/ui/DataTable';
import { DetailDrawer } from '@/components/ui/DetailDrawer';
import { StandardModal } from '@/components/ui/StandardModal';
import { Button } from '@/components/ui/button';
import { Search, Plus, Calendar, FolderOpen, Bell, Briefcase } from 'lucide-react';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { EntitySelector } from '@/components/ui/EntitySelector';

export function DesignSystemPage() {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isCommandOpen, setCommandOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<string | null>('p1');

  const mockTableData = [
    { id: '1', name: 'Frontend Refactor', status: 'IN_PROGRESS', owner: 'Alex' },
    { id: '2', name: 'Database Migration', status: 'TODO', owner: 'Sarah' },
    { id: '3', name: 'Payment Integration', status: 'BLOCKED', owner: 'Mike' },
  ];

  const SectionHeading = ({ title, description, className }: { title: string, description: string, className?: string }) => (
    <div className={`mb-6 ${className || ''}`}>
      <h2 className="text-xl font-bold text-zinc-900">{title}</h2>
      <p className="text-sm text-zinc-500 font-medium">{description}</p>
    </div>
  );

  const Divider = () => <hr className="border-zinc-200 my-12" />;

  return (
    <div className="flex flex-col pb-32">
      <div className="mb-12">
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">Component Catalog</h1>
        <p className="text-zinc-500 font-medium mt-2">Enterprise Workspace UI Primitives</p>
      </div>

      {/* Badges */}
      <section>
        <SectionHeading title="Status Badges" description="Standardized semantic badges for states and statuses across all entities." />
        <div className="flex gap-4 items-center flex-wrap">
          <StatusBadge status="success" label="Done / Active" showIcon />
          <StatusBadge status="warning" label="At Risk / Review" showIcon />
          <StatusBadge status="danger" label="Blocked / Overloaded" showIcon />
          <StatusBadge status="info" label="In Progress" showIcon />
          <StatusBadge status="neutral" label="Todo / Planned" showIcon />
        </div>
      </section>

      <Divider />

      {/* Buttons */}
      <section>
        <SectionHeading title="Buttons" description="Standard interactive elements for forms and actions." />
        <div className="flex gap-4 items-center flex-wrap">
          <Button className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold">Primary Action</Button>
          <Button variant="outline" className="bg-white border-zinc-200 text-zinc-900 font-semibold shadow-sm">Secondary Action</Button>
          <Button variant="ghost" className="text-zinc-600 font-semibold hover:bg-zinc-100">Ghost Action</Button>
          <Button className="bg-danger text-white font-semibold hover:bg-danger/90">Destructive Action</Button>
        </div>
      </section>

      <Divider />

      {/* Stat Cards */}
      <section>
        <SectionHeading title="Stat Cards" description="High-density metric summaries for top-row health indicators." />
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
          <StatCard 
            title="Total Projects" 
            value="24" 
            icon={FolderOpen} 
            trend={{ value: '+2', isPositive: true }}
            subtitle="Active in portfolio" 
          />
          <StatCard 
            title="Avg Velocity" 
            value="89%" 
            icon={Calendar} 
            trend={{ value: '-5%', isPositive: false }}
            subtitle="Across all teams" 
          />
          <StatCard 
            title="Critical Blockers" 
            value="3" 
            icon={Bell} 
            subtitle="Requires immediate attention" 
          />
        </div>
      </section>

      <Divider />

      {/* Entity Selector (Combobox) */}
      <section>
        <SectionHeading title="Entity Selector (Combobox)" description="Searchable, keyboard-navigable replacement for native dropdowns." />
        <div className="w-72">
          <EntitySelector 
            value={selectedEntity}
            onChange={setSelectedEntity}
            triggerIcon={<Briefcase className="w-4 h-4" />}
            options={[
              { id: 'p1', label: 'Project Phoenix', group: 'Pinned' },
              { id: 'p2', label: 'Apollo Migration', group: 'Pinned' },
              { id: 'p3', label: 'Payment Gateway', group: 'Recent' },
              { id: 'p4', label: 'Mobile Redesign', group: 'Recent' },
            ]}
          />
        </div>
      </section>

      <Divider />

      {/* Empty State */}
      <section>
        <SectionHeading title="Empty States" description="Illustration-free messaging when no data is available." />
        <div className="max-w-2xl">
          <EmptyState 
            icon={FolderOpen}
            title="No projects found"
            description="Get started by creating your first delivery project in the workspace."
            action={<Button className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold shadow-sm"><Plus className="w-4 h-4 mr-2"/>Create Project</Button>}
          />
        </div>
      </section>

      <Divider />

      {/* DataTable */}
      <section>
        <SectionHeading title="Data Table" description="High-density tabular data with sorting, column controls, and sticky headers." />
        <DataTable 
          data={mockTableData}
          onRowClick={() => setDrawerOpen(true)}
          columns={[
            { key: 'id', header: 'ID', cell: (item) => <span className="font-mono text-zinc-500 font-semibold">{item.id}</span> },
            { key: 'name', header: 'Task Name', cell: (item) => <span className="font-bold text-zinc-900">{item.name}</span>, sortable: true },
            { key: 'status', header: 'Status', cell: (item) => <StatusBadge status={item.status === 'BLOCKED' ? 'danger' : item.status === 'IN_PROGRESS' ? 'info' : 'neutral'} label={item.status} /> },
            { key: 'owner', header: 'Owner', cell: (item) => <span className="font-medium text-zinc-600">{item.owner}</span>, sortable: true },
          ]}
        />
      </section>

      <Divider />

      {/* Overlays & Drawers */}
      <section>
        <SectionHeading title="Overlays & Search" className="mb-6" description="Modals for creation, drawers for inspection, and CMD+K for navigation." />
        <div className="flex gap-4">
          <Button onClick={() => setCommandOpen(true)} className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold shadow-sm">
            <Search className="w-4 h-4 mr-2" /> Global Search (CMD+K)
          </Button>
          <Button onClick={() => setModalOpen(true)} variant="outline" className="bg-white border-zinc-200 text-zinc-900 font-semibold shadow-sm">
            Test Standard Modal
          </Button>
          <Button onClick={() => setDrawerOpen(true)} variant="outline" className="bg-white border-zinc-200 text-zinc-900 font-semibold shadow-sm">
            Test Detail Drawer
          </Button>
        </div>
      </section>

      {/* Overlay Instances */}
      <DetailDrawer 
        open={isDrawerOpen} 
        onClose={() => setDrawerOpen(false)}
        title="Frontend Refactor Details"
      >
        <div className="space-y-6">
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
            <h3 className="font-semibold text-zinc-900 mb-2">Drawer Content</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">This drawer is used for inspecting entities (Tasks, Projects, Teams) without navigating away from the parent table view. It persists the URL state (mocked) and closes on ESC or outside click.</p>
          </div>
        </div>
      </DetailDrawer>

      <StandardModal 
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Project"
        primaryAction={{ label: 'Create Project', onClick: () => setModalOpen(false) }}
        secondaryAction={{ label: 'Cancel', onClick: () => setModalOpen(false) }}
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-600">This modal follows the V2 standards: max-width 600px, 16px radius, #FFFFFF background, and primary action aligned to the right.</p>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-widest mb-2">Project Name</label>
            <input type="text" className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Apollo Phase 2" />
          </div>
        </div>
      </StandardModal>

      <CommandPalette 
        open={isCommandOpen}
        onClose={() => setCommandOpen(false)}
      />
    </div>
  );
}
