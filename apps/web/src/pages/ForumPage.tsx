import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  ThumbsUp, 
  CheckCircle, 
  Plus, 
  Tag, 
  Search,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PageContainer, PageHeading, StatusBadge, Button, EmptyState } from '../components/ui/index.js';

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
    <PageContainer>
      <PageHeading
        title="Community Forum & Discussions"
        description="Exchange contribution advice, GSoC proposal feedback, and technical architecture questions"
        badges={[
          <StatusBadge key="badge" variant="violet">
            Developer Discussions
          </StatusBadge>
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            icon={<Plus className="size-4" />}
          >
            New Discussion
          </Button>
        }
      />

      {/* Posts List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-[#12151D] border border-[#1F2430] rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          title="No discussions started yet"
          description="Start a new discussion thread to ask questions, share insights, or get feedback on your open source proposals."
          icon={<MessageSquare className="size-8 text-[#686D79]" />}
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              icon={<Plus className="size-4" />}
            >
              Start First Discussion
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {posts.map(p => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-[#12151D] border border-[#1F2430] hover:border-[#2E364A] transition-all space-y-3 group"
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
                    <StatusBadge variant="success">
                      Solved
                    </StatusBadge>
                  )}
                  <span className="text-xs font-mono text-[#686D79]">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-[#F8FAFC] leading-snug group-hover:text-[#A78BFA] transition-colors">{p.title}</h3>
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
            <div className="flex items-center justify-between border-b border-[#1F2430] pb-3">
              <h3 className="text-base font-bold text-[#F8FAFC] font-display">Start a New Discussion</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-[#686D79] hover:text-[#F8FAFC] transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#C5C8D0] mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="What is your question or topic?"
                  className="w-full px-3 py-2 rounded-lg bg-[#181C26] border border-[#1F2430] text-[#F8FAFC] text-xs focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C5C8D0] mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="gsoc, mentorship, rust"
                  className="w-full px-3 py-2 rounded-lg bg-[#181C26] border border-[#1F2430] text-[#F8FAFC] text-xs font-mono focus:outline-none focus:border-[#8B5CF6] transition-colors"
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
                  Post Discussion
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
