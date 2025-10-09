import React, { useState, useEffect } from 'react';
import { Info, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getContent } from '../services/contentApi';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

function AboutPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [missionVision, setMissionVision] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const [aboutData, missionData] = await Promise.all([
        getContent('about_us'),
        getContent('mission_vision')
      ]);
      setContent(aboutData);
      setMissionVision(missionData);
    } catch (err) {
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #2d5a7c 0%, #4a7c59 100%)'}}>
      <div className="container py-5">
        {/* Header with Edit Button */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-white mb-3">
            <Info size={48} className="me-3" style={{verticalAlign: 'middle'}} />
            Walking the Narrow Trail
          </h1>
          <p className="lead text-white-50 mb-4">
            Learn more about The Narrow Trail community
          </p>
          {currentUser?.role === 'admin' && (
            <button
              className="btn btn-light"
              onClick={() => navigate('/admin/content')}
            >
              <Edit size={18} className="me-2" />
              Edit Content
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Mission & Vision Section */}
            {missionVision && (
              <div className="row mb-4">
                <div className="col-lg-10 col-xl-8 mx-auto">
                  <div className="card border-0" style={{
                    borderRadius: '15px',
                    background: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div className="card-body p-4 p-md-5">
                      {/* Quote Box */}
                      <div className="text-center mb-4 pb-4" style={{borderBottom: '1px solid rgba(255, 255, 255, 0.2)'}}>
                        <p className="mb-1" style={{
                          fontStyle: 'italic',
                          color: 'rgba(255, 255, 255, 0.95)',
                          fontWeight: '500',
                          fontSize: '1.1rem'
                        }}>
                          "Dit bou karakter" - Jan
                        </p>
                        <small style={{color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem'}}>
                          Remember: Dit is maklikker as wat dit lyk
                        </small>
                      </div>

                      {/* Mission & Vision Content */}
                      <ReactMarkdown className="about-content">
                        {missionVision.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="row">
              <div className="col-lg-10 col-xl-8 mx-auto">
                <div className="card border-0" style={{
                  borderRadius: '15px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}>
                  <div className="card-body p-4 p-md-5">
                    {content && (
                      <ReactMarkdown className="about-content">
                        {content.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .about-content h2 {
          color: rgba(255, 255, 255, 0.95);
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 600;
          font-size: 1.5rem;
          letter-spacing: 0.3px;
        }

        .about-content h2:first-child {
          margin-top: 0;
        }

        .about-content ul {
          list-style: none;
          padding-left: 0;
          color: rgba(255, 255, 255, 0.85);
        }

        .about-content ul li {
          padding: 0.75rem 0;
          padding-left: 1.5rem;
          position: relative;
          line-height: 1.7;
        }

        .about-content ul li::before {
          content: '→';
          position: absolute;
          left: 0;
          color: rgba(255, 255, 255, 0.7);
          font-weight: bold;
        }

        .about-content strong {
          color: rgba(255, 255, 255, 0.95);
          font-weight: 600;
        }

        .about-content p {
          margin-bottom: 1rem;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.85);
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
}

export default AboutPage;
