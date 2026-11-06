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
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PageContainer, StatusBadge, Button } from '../components/ui/index.js';
import { apiFetch } from '../lib/api.js';

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
    apiFetch('/api/v1/workspaces')
      .then(json => {
        if (json.success && json.data) setWorkspaces(json.data);
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
      const json = await apiFetch('/api/v1/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, slug, description }),
      });
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
      const json = await apiFetch(`/api/v1/workspaces/${selectedWsId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUsername, role }),
      });
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
    <PageContainer maxWidth="max-w-[1100px]">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8B5CF6]">Collaboration</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#11141B]">Workspaces</h2>
          <p className="mt-2 text-xs leading-5 text-[#686D79]">
            Permission-aware spaces for shared repositories, tasks, members, and activity.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="size-3.5" />}
        >
          Create Workspace
        </Button>
      </div>

      {/* Main Container */}
      <section className="rounded-xl border border-black/7 bg-white mt-6">
        <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
          <h3 className="text-[11px] font-semibold text-[#11141B]">Workspaces</h3>
          <span className="text-[9px] text-[#999CA3]">
            {loading ? 'Loading...' : workspaces.length === 0 ? 'Initial state' : `${workspaces.length} active`}
          </span>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="h-32 rounded-xl border border-black/6 bg-[#F7F7F8] animate-pulse" />
              ))}
            </div>
          ) : workspaces.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-5 py-8 text-center">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#F0EDFA] text-[#8B5CF6]">
                <Building className="size-5" />
              </span>
              <h3 className="mt-4 text-xs font-semibold text-[#11141B]">No workspaces data yet</h3>
              <p className="mt-2 max-w-sm text-[10px] leading-5 text-[#858993]">
                This module is ready for connected or user-created data. DevOrbit does not insert fictional activity into an empty workspace.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-5 rounded-md border border-black/9 bg-[#11141B] px-3.5 py-2 text-[10px] font-semibold text-white hover:bg-black transition-colors"
              >
                Create your first workspace
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workspaces.map(ws => (
                <div
                  key={ws.id}
                  className="rounded-xl border border-black/7 bg-white p-4 hover:border-[#8B5CF6]/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-[#8B5CF6] font-semibold">/{ws.slug}</span>
                        <h4 className="text-sm font-semibold text-[#11141B] mt-0.5">{ws.name}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-[#F0EDFA] text-[#8B5CF6]">
                        {ws.currentUserRole || 'Owner'}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[#686D79] line-clamp-2">
                      {ws.description || 'Collaborative team development workspace.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-[#686D79]">
                      <Users className="size-3.5" />
                      <span>{ws.memberCount || 1} members</span>
                    </span>

                    <button
                      onClick={() => {
                        setSelectedWsId(ws.id);
                        setShowInviteModal(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs text-[#8B5CF6] hover:underline"
                    >
                      <UserPlus className="size-3" />
                      <span>Invite Member</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CREATE WORKSPACE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-black/7 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#11141B]">Create Workspace</h3>
                <p className="text-xs text-[#686D79] mt-0.5">Initialize a collaborative team environment</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-md text-[#999CA3] hover:text-[#11141B]">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-[#11141B] block mb-1">Workspace Name</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }}
                  placeholder="e.g. Core Engineering"
                  className="h-9 w-full rounded-md border border-black/8 bg-[#F7F7F8] px-3 text-xs text-[#11141B] focus:border-[#8B5CF6] focus:bg-white focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-[#11141B] block mb-1">Slug</span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="e.g. core-eng"
                  className="h-9 w-full rounded-md border border-black/8 bg-[#F7F7F8] px-3 text-xs font-mono text-[#11141B] focus:border-[#8B5CF6] focus:bg-white focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-[#11141B] block mb-1">Description</span>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Short description..."
                  rows={2}
                  className="w-full rounded-md border border-black/8 bg-[#F7F7F8] p-3 text-xs text-[#11141B] focus:border-[#8B5CF6] focus:bg-white focus:outline-none"
                />
              </label>

              <div className="pt-3 border-t border-black/7 flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVITE MEMBER MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-black/7 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#11141B]">Invite Member</h3>
                <p className="text-xs text-[#686D79] mt-0.5">Add an existing user to this workspace</p>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="p-1 rounded-md text-[#999CA3] hover:text-[#11141B]">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleInviteMember} className="space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-[#11141B] block mb-1">Username</span>
                <input
                  type="text"
                  required
                  value={targetUsername}
                  onChange={e => setTargetUsername(e.target.value)}
                  placeholder="username"
                  className="h-9 w-full rounded-md border border-black/8 bg-[#F7F7F8] px-3 text-xs text-[#11141B] focus:border-[#8B5CF6] focus:bg-white focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-[#11141B] block mb-1">Role</span>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="h-9 w-full rounded-md border border-black/8 bg-[#F7F7F8] px-2 text-xs text-[#11141B] focus:border-[#8B5CF6] focus:bg-white focus:outline-none"
                >
                  <option value="MEMBER">Member (Read & Write)</option>
                  <option value="ADMIN">Admin (Full Control)</option>
                </select>
              </label>

              <div className="pt-3 border-t border-black/7 flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Send Invite
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
