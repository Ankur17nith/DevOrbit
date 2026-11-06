import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  ThumbsUp, 
  CheckCircle, 
  Plus, 
  Tag, 
  Search, 
  Sparkles, 
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PageContainer, StatusBadge, Button } from '../components/ui/index.js';
import { apiFetch } from '../lib/api.js';
import { ENDPOINTS } from '../lib/endpoints.js';

export function ForumPage() {
  const { token, user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const fetchPosts = () => {
    setLoading(true);
    apiFetch(ENDPOINTS.forum.posts)
      .then(json => {
        if (json.success) setPosts(json.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const tagArray = tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const json = await apiFetch(ENDPOINTS.forum.posts, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          tags: tagArray,
        }),
      });

      if (json.success) {
        setShowCreateModal(false);
        setTitle('');
        setTags('');
        setContent('');
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpvote = async (postId: string) => {
    if (!token) return;
    try {
      await apiFetch(ENDPOINTS.forum.upvote(postId), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageContainer maxWidth="max-w-[1100px]">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8B5CF6]">Community</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#11141B]">Community</h2>
          <p className="mt-2 text-xs leading-5 text-[#686D79]">
            Focused technical discussion without social engagement clutter.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="size-3.5" />}
        >
          New Discussion
        </Button>
      </div>

      {/* Main Container */}
      <section className="rounded-xl border border-black/7 bg-white mt-6">
        <div className="flex min-h-12 items-center justify-between border-b border-black/7 px-4">
          <h3 className="text-[11px] font-semibold text-[#11141B]">Discussions</h3>
          <span className="text-[9px] text-[#999CA3]">
            {loading ? 'Loading...' : posts.length === 0 ? 'Initial state' : `${posts.length} discussions`}
          </span>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 rounded-xl border border-black/6 bg-[#F7F7F8] animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-5 py-8 text-center">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#F0EDFA] text-[#8B5CF6]">
                <MessageSquare className="size-5" />
              </span>
              <h3 className="mt-4 text-xs font-semibold text-[#11141B]">No community data yet</h3>
              <p className="mt-2 max-w-sm text-[10px] leading-5 text-[#858993]">
                This module is ready for connected or user-created data. DevOrbit does not insert fictional activity into an empty workspace.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-5 rounded-md border border-black/9 bg-[#11141B] px-3.5 py-2 text-[10px] font-semibold text-white hover:bg-black transition-colors"
              >
                Start a discussion
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map(post => (
                <div
                  key={post.id}
                  className="rounded-xl border border-black/7 bg-white p-4 hover:border-[#8B5CF6]/50 transition-all flex items-start justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-[#11141B]">{post.title}</h4>
                    <p className="mt-1 text-xs text-[#686D79] line-clamp-2">{post.content}</p>

                    <div className="mt-3 flex items-center gap-3 text-xs text-[#686D79]">
                      <span className="font-mono text-[11px]">@{post.author?.username || 'developer'}</span>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          {post.tags.map((t: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F7F7F8] text-[#686D79] border border-black/5">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleUpvote(post.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-black/8 bg-[#F7F7F8] text-xs font-mono text-[#686D79] hover:text-[#8B5CF6] hover:border-[#8B5CF6]/30 transition-colors"
                    >
                      <ThumbsUp className="size-3" />
                      <span>{post.upvotes || 0}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* NEW DISCUSSION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-black/10 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-black/7 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#11141B]">New Discussion</h3>
                <p className="text-xs text-[#686D79] mt-0.5">Post an architectural question or contribution experience</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-md text-[#999CA3] hover:text-[#11141B]">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-[#11141B] block mb-1">Title</span>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Tips for GSoC proposal in robotics & ROS"
                  className="h-9 w-full rounded-md border border-black/8 bg-[#F7F7F8] px-3 text-xs text-[#11141B] focus:border-[#8B5CF6] focus:bg-white focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-[#11141B] block mb-1">Content</span>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Provide technical context..."
                  className="w-full rounded-md border border-black/8 bg-[#F7F7F8] p-3 text-xs text-[#11141B] focus:border-[#8B5CF6] focus:bg-white focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-[#11141B] block mb-1">Tags (comma-separated)</span>
                <input
                  type="text"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="gsoc, mentorship, rust"
                  className="h-9 w-full rounded-md border border-black/8 bg-[#F7F7F8] px-3 text-xs font-mono text-[#11141B] focus:border-[#8B5CF6] focus:bg-white focus:outline-none"
                />
              </label>

              <div className="pt-3 border-t border-black/7 flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Publish Discussion
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
