import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Users, 
  Plus, 
  ShieldCheck, 
  UserPlus, 
  Layers, 
  Check, 
  Clock,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PageContainer, PageHeading, StatusBadge, Button, EmptyState } from '../components/ui/index.js';

export function WorkspacesPage() {
  const { token, user } = useAuth();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedWsId, setSelectedWsId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [targetUsername, setTargetUsername] = useState('');
  const [role, setRole] = useState('MEMBER');

  const fetchWorkspaces = () => {
    if (!token) return;
    setLoading(true);
    fetch('/api/v1/workspaces', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) setWorkspaces(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [token]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch('/api/v1/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, slug, description }),
      });
      const json = await res.json();
      if (json.success) {
        setShowCreateModal(false);
        setName('');
        setSlug('');
        setDescription('');
        fetchWorkspaces();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedWsId) return;

    try {
      const res = await fetch(`/api/v1/workspaces/${selectedWsId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUsername, role }),
      });
      const json = await res.json();
      if (json.success) {
        setShowInviteModal(false);
        setTargetUsername('');
        fetchWorkspaces();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageContainer>
      <PageHeading
        title="Workspaces & Collaboration"
        description="Collaborative developer environments with role-based access control (RBAC) and team isolation"
        badges={[
          <StatusBadge key="badge" variant="violet">
            Team Workspaces
          </StatusBadge>
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            icon={<Plus className="size-4" />}
          >
            New Workspace
          </Button>
        }
      />

      {/* Workspaces List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-44 bg-[#12151D] border border-[#1F2430] rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <EmptyState
          title="No workspaces created yet"
          description="Create your first collaborative workspace to share project resources, notes, and track progress with teammates."
          icon={<Building className="size-8 text-[#686D79]" />}
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              icon={<Plus className="size-4" />}
            >
              Create Workspace
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workspaces.map(ws => (
            <div
              key={ws.id}
              className="p-6 rounded-2xl bg-[#12151D] border border-[#1F2430] hover:border-[#2E364A] transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[#F8FAFC] font-display">{ws.name}</h3>
                    <StatusBadge
                      variant={
                        ws.role === 'OWNER' ? 'violet' :
                        ws.role === 'ADMIN' ? 'warning' : 'default'
                      }
                    >
                      {ws.role}
                    </StatusBadge>
                  </div>
                  <p className="text-xs text-[#686D79] mt-1">{ws.description || 'No description provided.'}</p>
                </div>

                <div className="size-8 rounded-lg bg-[#181C26] border border-[#1F2430] flex items-center justify-center text-[#8B5CF6]">
                  <Building className="size-4" />
                </div>
              </div>

              {/* Members Section */}
              <div className="pt-3 border-t border-[#1F2430] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#686D79] font-mono">Members ({ws.membersCount || ws.members?.length || 0})</span>
                  {['OWNER', 'ADMIN'].includes(ws.role) && (
                    <button
                      onClick={() => {
                        setSelectedWsId(ws.id);
                        setShowInviteModal(true);
                      }}
                      className="text-xs text-[#A78BFA] hover:text-white font-medium flex items-center gap-1 transition-colors"
                    >
                      <UserPlus className="size-3" />
                      <span>Invite Member</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 pt-1">
                  {ws.members?.map((m: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#0B0D12] border border-[#1F2430] text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#F8FAFC]">{m.name || m.username}</span>
                        <span className="text-[#686D79] font-mono text-[11px]">@{m.username}</span>
                      </div>
                      <span className="font-mono text-[10px] text-[#A78BFA] uppercase px-1.5 py-0.2 rounded bg-[#181C26] border border-[#1F2430]">
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#12151D] border border-[#1F2430] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2430] pb-3">
              <h3 className="text-base font-bold text-[#F8FAFC] font-display">Create Collaborative Workspace</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-[#686D79] hover:text-[#F8FAFC] transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleCreateWorkspace} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#C5C8D0] mb-1">Workspace Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }}
                  placeholder="e.g. Distributed Systems Lab"
                  className="w-full px-3 py-2 rounded-lg bg-[#181C26] border border-[#1F2430] text-[#F8FAFC] text-xs focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C5C8D0] mb-1">Slug</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="distributed-systems-lab"
                  className="w-full px-3 py-2 rounded-lg bg-[#181C26] border border-[#1F2430] text-[#F8FAFC] text-xs font-mono focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C5C8D0] mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Workspace purpose and team goals..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-[#181C26] border border-[#1F2430] text-[#F8FAFC] text-xs focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1F2430]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                >
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#12151D] border border-[#1F2430] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2430] pb-3">
              <h3 className="text-base font-bold text-[#F8FAFC] font-display">Invite Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1 rounded-lg text-[#686D79] hover:text-[#F8FAFC] transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleInviteMember} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#C5C8D0] mb-1">Target Username</label>
                <input
                  type="text"
                  required
                  value={targetUsername}
                  onChange={e => setTargetUsername(e.target.value)}
                  placeholder="e.g. sara_chen or alex_developer"
                  className="w-full px-3 py-2 rounded-lg bg-[#181C26] border border-[#1F2430] text-[#F8FAFC] text-xs font-mono focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C5C8D0] mb-1">Role Permission</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#181C26] border border-[#1F2430] text-[#F8FAFC] text-xs focus:outline-none focus:border-[#8B5CF6] transition-colors"
                >
                  <option value="MEMBER">Member (Full collaboration)</option>
                  <option value="ADMIN">Admin (Manage members & settings)</option>
                  <option value="VIEWER">Viewer (Read-only access)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1F2430]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                >
                  Invite
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
