import React, { useState } from 'react';
import { Share2, Calendar, MessageCircle, Mail, Download } from 'lucide-react';
import {
  shareEvent,
  shareViaWhatsApp,
  shareViaSMS,
  shareViaEmail,
  addToCalendar,
  canShare
} from '../../utils/nativeFeatures';
import { haptics } from '../../utils/haptics';

/**
 * Share button with native sharing and calendar export
 */
const ShareButton = ({ event, url, variant = 'primary', size = 'md', showLabel = true }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleNativeShare = async () => {
    setIsSharing(true);
    haptics.light();

    const result = await shareEvent(event, url);

    if (result.success) {
      if (result.fallback === 'clipboard') {
        alert('Link copied to clipboard!');
      }
    } else {
      alert('Unable to share. Please try another method.');
    }

    setIsSharing(false);
    setShowMenu(false);
  };

  const handleAddToCalendar = async () => {
    haptics.medium();
    const result = await addToCalendar(event);

    if (result.success) {
      if (result.method === 'download') {
        alert('Calendar file downloaded! Open it to add to your calendar.');
      }
    }

    setShowMenu(false);
  };

  const handleWhatsAppShare = () => {
    haptics.light();
    shareViaWhatsApp(event, url);
    setShowMenu(false);
  };

  const handleSMSShare = () => {
    haptics.light();
    shareViaSMS(event, url);
    setShowMenu(false);
  };

  const handleEmailShare = () => {
    haptics.light();
    shareViaEmail(event, url);
    setShowMenu(false);
  };

  const buttonSizeClass = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg'
  }[size];

  return (
    <div className="position-relative">
      <button
        className={`btn btn-${variant} ${buttonSizeClass}`}
        onClick={() => setShowMenu(!showMenu)}
        disabled={isSharing}
      >
        <Share2 size={size === 'sm' ? 16 : 18} className={showLabel ? 'me-2' : ''} />
        {showLabel && 'Share'}
      </button>

      {showMenu && (
        <>
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ zIndex: 1040 }}
            onClick={() => setShowMenu(false)}
          />

          <div
            className="card position-absolute shadow-lg"
            style={{
              zIndex: 1041,
              top: '100%',
              right: 0,
              marginTop: '8px',
              minWidth: '200px'
            }}
          >
            <div className="card-body p-2">
              <div className="list-group list-group-flush">
                {canShare() && (
                  <button
                    className="list-group-item list-group-item-action d-flex align-items-center border-0"
                    onClick={handleNativeShare}
                  >
                    <Share2 size={18} className="me-2" />
                    Share...
                  </button>
                )}

                <button
                  className="list-group-item list-group-item-action d-flex align-items-center border-0"
                  onClick={handleAddToCalendar}
                >
                  <Calendar size={18} className="me-2" />
                  Add to Calendar
                </button>

                <button
                  className="list-group-item list-group-item-action d-flex align-items-center border-0"
                  onClick={handleWhatsAppShare}
                >
                  <MessageCircle size={18} className="me-2" />
                  WhatsApp
                </button>

                <button
                  className="list-group-item list-group-item-action d-flex align-items-center border-0"
                  onClick={handleSMSShare}
                >
                  <MessageCircle size={18} className="me-2" />
                  SMS
                </button>

                <button
                  className="list-group-item list-group-item-action d-flex align-items-center border-0"
                  onClick={handleEmailShare}
                >
                  <Mail size={18} className="me-2" />
                  Email
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ShareButton;
