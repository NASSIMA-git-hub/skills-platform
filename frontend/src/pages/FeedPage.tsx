import { useEffect, useState } from "react";
import { feedAPI } from "../services/api";
import type { FeedPost } from "../types";
import { Heart, MessageCircle, Share2, Send, Image, Tag } from "lucide-react";

export default function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ title: "", content: "", tags: "" });
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await feedAPI.getPosts(20, 0);
        setPosts(res.data.posts);
      } catch (err) {
        console.error("Failed to fetch posts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;

    setPosting(true);
    try {
      const tags = newPost.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const res = await feedAPI.createPost({
        title: newPost.title,
        content: newPost.content,
        tags,
      });
      setPosts([res.data.post, ...posts]);
      setNewPost({ title: "", content: "", tags: "" });
    } catch (err) {
      console.error("Failed to create post", err);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await feedAPI.likePost(postId);
      setPosts(posts.map((p) => 
        p.id === postId ? { ...p, likes: p.likes + 1 } : p
      ));
    } catch (err) {
      console.error("Failed to like post", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Feed</h1>
          <p className="text-gray-500">Stay updated with the latest trends and news</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Create Post */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Post</h2>
          <form onSubmit={handlePost}>
            <input
              type="text"
              placeholder="Post title"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="w-full mb-3 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="What's on your mind?"
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              rows={4}
              className="w-full mb-3 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={newPost.tags}
              onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
              className="w-full mb-4 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <button type="button" className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Image size={20} />
                </button>
                <button type="button" className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Tag size={20} />
                </button>
              </div>
              <button
                type="submit"
                disabled={posting || !newPost.title || !newPost.content}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Send size={18} />
                {posting ? "Posting..." : "Post"}
              </button>
            </div>
          </form>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {post.authorName[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{post.authorName}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h2>
                <p className="text-gray-600 mb-4">{post.content}</p>

                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full rounded-xl mb-4"
                  />
                )}

                <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Heart size={20} className={post.likes > 0 ? "fill-red-500 text-red-500" : ""} />
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
                    <MessageCircle size={20} />
                    <span>{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500">Be the first to share something!</p>
          </div>
        )}
      </main>
    </div>
  );
}