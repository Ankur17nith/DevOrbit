import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield, UserPlus, Check, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export function WorkspacesPage() {
  const { token, user } = useAuth();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedWsId, setSelectedWsId] = useState<string | null>(null);

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
      .then(r => r.json())
      .then(json => {
        if (json.success) setWorkspaces(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [token, user?.username]);

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
    <div className="p-6 md:p-8 max-w-[1440px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">Workspaces & Collaboration</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Collaborative environments with role-based access control (RBAC) and data isolation
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-lg bg-[#09AE5B] hover:bg-[#078F4A] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-[#09AE5B]/20"
        >
          <Plus className="size-4" />
          <span>New Workspace</span>
        </button>
      </div>

      {/* Workspaces List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-44 bg-[#181819] border border-[#242424] rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workspaces.map(ws => (
            <div
              key={ws.id}
              className="p-6 rounded-2xl bg-[#181819] border border-[#242424] hover:border-neutral-600 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white font-display">{ws.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 uppercase font-semibold">
                      {ws.role}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">{ws.description || 'No description provided.'}</p>
                </div>

                <div className="size-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400">
                  <Building className="size-4" />
                </div>
              </div>

              {/* Members Section */}
              <div className="pt-3 border-t border-[#242424] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-mono">Members ({ws.membersCount})</span>
                  {['OWNER', 'ADMIN'].includes(ws.role) && (
                    <button
                      onClick={() => {
                        setSelectedWsId(ws.id);
                        setShowInviteModal(true);
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
                    >
                      <UserPlus className="size-3" />
                      <span>Invite Member</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 pt-1">
                  {ws.members?.map((m: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#0E0F10] border border-[#242424] text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{m.name || m.username}</span>
                        <span className="text-neutral-500 font-mono text-[11px]">@{m.username}</span>
                      </div>
                      <span className="font-mono text-[10px] text-neutral-400 uppercase px-1.5 py-0.2 rounded bg-neutral-800">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0E0F10] border border-[#242424] rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-display">Create Collaborative Workspace</h3>
            <form onSubmit={handleCreateWorkspace} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Workspace Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }}
                  placeholder="e.g. Distributed Systems Lab"
                  className="w-full px-3 py-2 rounded-lg bg-[#181819] border border-[#242424] text-white text-xs focus:outline-none focus:border-[#09AE5B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Slug</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="distributed-systems-lab"
                  className="w-full px-3 py-2 rounded-lg bg-[#181819] border border-[#242424] text-white text-xs font-mono focus:outline-none focus:border-[#09AE5B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Workspace purpose and team goals..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-[#181819] border border-[#242424] text-white text-xs focus:outline-none focus:border-[#09AE5B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#181819] text-neutral-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#09AE5B] hover:bg-[#078F4A] text-white text-xs font-semibold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0E0F10] border border-[#242424] rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-display">Invite Team Member</h3>
            <form onSubmit={handleInviteMember} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Target Username</label>
                <input
                  type="text"
                  required
                  value={targetUsername}
                  onChange={e => setTargetUsername(e.target.value)}
                  placeholder="e.g. sara_chen or alex_developer"
                  className="w-full px-3 py-2 rounded-lg bg-[#181819] border border-[#242424] text-white text-xs font-mono focus:outline-none focus:border-[#09AE5B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Role Permission</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#181819] border border-[#242424] text-white text-xs focus:outline-none focus:border-[#09AE5B]"
                >
                  <option value="MEMBER">Member (Full collaboration)</option>
                  <option value="ADMIN">Admin (Manage members & settings)</option>
                  <option value="VIEWER">Viewer (Read-only access)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#181819] text-neutral-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#09AE5B] hover:bg-[#078F4A] text-white text-xs font-semibold"
                >
                  Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
