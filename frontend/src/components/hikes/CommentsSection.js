import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const CommentsSection = ({ hikeId }) => {
  const { token, currentUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [hikeId]);

  const fetchComments = async () => {
    try {
      const data = await api.getComments(hikeId, token);
      setComments(data);
    } catch (err) {
      console.error('Fetch comments error:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const result = await api.addComment(hikeId, newComment, token);
      if (result.success) {
        setNewComment('');
        fetchComments();
      }
    } catch (err) {
      console.error('Add comment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    setLoading(true);
    try {
      await api.deleteComment(hikeId, commentId, token);
      fetchComments();
    } catch (err) {
      console.error('Delete comment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h5 className="mb-3">Comments</h5>

      {/* Add Comment Form */}
      <form onSubmit={handleAddComment} className="mb-4">
        <div className="mb-2">
          <textarea
            className="form-control"
            rows="3"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={loading}
          />
        </div>
        <button type="submit" className="btn btn-primary btn-sm" disabled={loading || !newComment.trim()}>
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {/* Comments List */}
      {comments.length === 0 ? (
        <p className="text-muted">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="list-group">
          {comments.map(comment => (
            <div key={comment.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-1">
                    <strong className="me-2">{comment.user_name}</strong>
                    <small className="text-muted">
                      {new Date(comment.created_at).toLocaleString()}
                    </small>
                  </div>
                  <p className="mb-0">{comment.comment}</p>
                </div>
                {(currentUser.role === 'admin' || comment.user_id === currentUser.id) && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteComment(comment.id)}
                    disabled={loading}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
