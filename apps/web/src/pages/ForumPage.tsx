import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  ThumbsUp, 
  CheckCircle, 
  Plus, 
  Tag, 
  Search,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

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
    fetch('/api/v1/forum/posts')
      .then(res => res.json())
      .then(json => {
        if (json.success) setPosts(json.data);
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

      const res = await fetch('/api/v1/forum/posts', {
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

      const json = await res.json();
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

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#F8FAFC] tracking-tight">Community Forum & Discussions</h1>
          <p className="text-xs text-[#686D79] mt-1">
            Exchange contribution advice, GSoC proposal feedback, and technical architecture questions
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#A78BFA] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shadow-[#8B5CF6]/20 active:scale-98"
        >
          <Plus className="size-4" />
          <span>New Discussion</span>
        </button>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-[#12151D] border border-[#1F2430] rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(p => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-[#12151D] border border-[#1F2430] hover:border-[#2E364A] transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={p.user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=faces'}
                    alt={p.user?.name}
                    className="size-7 rounded-full object-cover border border-[#8B5CF6]/30"
                  />
                  <div>
                    <span className="text-xs font-semibold text-[#F8FAFC]">{p.user?.name || p.user?.username}</span>
                    <span className="text-[11px] font-mono text-[#686D79] ml-1.5">@{p.user?.username}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {p.isSolved && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] flex items-center gap-1">
                      <CheckCircle className="size-3" />
                      <span>Solved</span>
                    </span>
                  )}
                  <span className="text-xs font-mono text-[#686D79]">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-[#F8FAFC] leading-snug">{p.title}</h3>
                <p className="mt-1.5 text-xs text-[#C5C8D0] leading-relaxed">{p.content}</p>
              </div>

              <div className="pt-2 border-t border-[#1F2430] flex items-center justify-between text-xs">
                <div className="flex flex-wrap gap-1">
                  {p.tags?.map((t: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#181C26] text-[#A78BFA] border border-[#1F2430]">
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-[#686D79] font-mono text-xs">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="size-3 text-[#686D79]" />
                    <span>{p.upvotes}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="size-3 text-[#686D79]" />
                    <span>{p.replyCount || 0} replies</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Discussion Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#12151D] border border-[#1F2430] rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-[#F8FAFC] font-display">Start a New Discussion</h3>
            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#C5C8D0] mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="What is your question or topic?"
                  className="w-full px-3 py-2 rounded-lg bg-[#181C26] border border-[#1F2430] text-[#F8FAFC] text-xs focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C5C8D0] mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="gsoc, mentorship, rust"
                  className="w-full px-3 py-2 rounded-lg bg-[#181C26] border border-[#1F2430] text-[#F8FAFC] text-xs font-mono focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C5C8D0] mb-1">Content</label>
                <textarea
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Elaborate on your question or proposal..."
                  rows={5}
                  className="w-full px-3 py-2 rounded-lg bg-[#181C26] border border-[#1F2430] text-[#F8FAFC] text-xs focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#181C26] text-[#686D79] hover:text-[#F8FAFC] text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#A78BFA] text-white text-xs font-semibold"
                >
                  Post Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
