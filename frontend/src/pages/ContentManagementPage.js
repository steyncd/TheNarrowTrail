import React, { useState, useEffect } from 'react';
import { FileText, Save, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAllContent, updateContent } from '../services/contentApi';
import PageHeader from '../components/common/PageHeader';
import ReactMarkdown from 'react-markdown';

function ContentManagementPage() {
  const { token } = useAuth();
  const [contents, setContents] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_published: true
  });

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const data = await getAllContent(token);
      setContents(data);
      if (data.length > 0 && !selectedContent) {
        selectContent(data[0]);
      }
    } catch (err) {
      setError('Failed to load content');
      console.error('Fetch contents error:', err);
    }
  };

  const selectContent = (content) => {
    setSelectedContent(content);
    setFormData({
      title: content.title || '',
      content: content.content || '',
      is_published: content.is_published !== false
    });
    setEditMode(false);
    setPreviewMode(false);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateContent(selectedContent.content_key, formData, token);
      setSuccess('Content updated successfully!');
      setEditMode(false);
      fetchContents();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update content');
      console.error('Update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const contentLabels = {
    'mission_vision': 'Mission & Vision (Landing Page)',
    'about_us': 'About Us Page'
  };

  return (
    <div>
      <PageHeader
        icon={FileText}
        title="Content Management"
        subtitle="Edit site content, mission, vision, and About Us page"
      />

      <div className="container-fluid py-4">
        {error && (
          <div className="alert alert-danger alert-dismissible">
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}

        {success && (
          <div className="alert alert-success alert-dismissible">
            {success}
            <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
          </div>
        )}

        <div className="row">
          {/* Sidebar - Content List */}
          <div className="col-md-3">
            <div className="card shadow-sm">
              <div className="card-header">
                <h6 className="mb-0">Content Sections</h6>
              </div>
              <div className="list-group list-group-flush">
                {contents.map(content => (
                  <button
                    key={content.id}
                    className={`list-group-item list-group-item-action ${
                      selectedContent?.id === content.id ? 'active' : ''
                    }`}
                    onClick={() => selectContent(content)}
                  >
                    <div className="fw-bold">{contentLabels[content.content_key] || content.content_key}</div>
                    <small className={selectedContent?.id === content.id ? 'text-white-50' : 'text-muted'}>
                      Updated {new Date(content.updated_at).toLocaleDateString()}
                    </small>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Editor */}
          <div className="col-md-9">
            {selectedContent ? (
              <div className="card shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{contentLabels[selectedContent.content_key] || selectedContent.content_key}</h5>
                  <div className="btn-group">
                    <button
                      className={`btn btn-sm ${editMode && !previewMode ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => {
                        setEditMode(true);
                        setPreviewMode(false);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className={`btn btn-sm ${previewMode ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setPreviewMode(!previewMode)}
                    >
                      <Eye size={16} className="me-1" />
                      Preview
                    </button>
                  </div>
                </div>

                <div className="card-body">
                  {!editMode && !previewMode ? (
                    <div>
                      <div className="mb-3">
                        <label className="text-muted small">TITLE</label>
                        <div className="fw-bold">{selectedContent.title}</div>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">CONTENT</label>
                        <div className="border rounded p-3 bg-light" style={{maxHeight: '500px', overflowY: 'auto'}}>
                          <pre className="mb-0" style={{whiteSpace: 'pre-wrap', fontFamily: 'inherit'}}>
                            {selectedContent.content}
                          </pre>
                        </div>
                      </div>
                      <div>
                        <label className="text-muted small">STATUS</label>
                        <div>
                          <span className={`badge ${selectedContent.is_published ? 'bg-success' : 'bg-secondary'}`}>
                            {selectedContent.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : previewMode ? (
                    <div className="border rounded p-4 bg-light" style={{maxHeight: '600px', overflowY: 'auto'}}>
                      <ReactMarkdown>{formData.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label">Title</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">
                          Content
                          <small className="text-muted ms-2">(Markdown supported)</small>
                        </label>
                        <textarea
                          className="form-control font-monospace"
                          rows="20"
                          value={formData.content}
                          onChange={(e) => setFormData({...formData, content: e.target.value})}
                          required
                          style={{fontSize: '0.9rem'}}
                        ></textarea>
                        <small className="text-muted">
                          Use ## for headings, ** for bold, - for lists
                        </small>
                      </div>

                      <div className="mb-3 form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="is_published"
                          checked={formData.is_published}
                          onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                        />
                        <label className="form-check-label" htmlFor="is_published">
                          Published (visible to all users)
                        </label>
                      </div>

                      <div className="d-flex gap-2">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={saving}
                        >
                          <Save size={16} className="me-2" />
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            setEditMode(false);
                            setFormData({
                              title: selectedContent.title || '',
                              content: selectedContent.content || '',
                              is_published: selectedContent.is_published !== false
                            });
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              <div className="card shadow-sm">
                <div className="card-body text-center py-5">
                  <p className="text-muted">Select a content section to edit</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContentManagementPage;
