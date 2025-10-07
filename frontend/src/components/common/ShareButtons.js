import React, { useState } from 'react';
import { Share2, Mail, Copy, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ShareButtons = ({ hike }) => {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const shareText = `Check out this hike: ${hike.name}\n${hike.description}\nDate: ${new Date(hike.date).toLocaleDateString()}\nDifficulty: ${hike.difficulty}`;
  const shareUrl = window.location.href;

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(shareText + '\n\n' + shareUrl);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Hike: ${hike.name}`);
    const body = encodeURIComponent(shareText + '\n\n' + shareUrl);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="d-flex flex-wrap gap-2">
      <button
        onClick={handleWhatsAppShare}
        className="btn btn-success d-flex align-items-center gap-2"
      >
        <Share2 size={18} />
        WhatsApp
      </button>

      <button
        onClick={handleEmailShare}
        className="btn btn-primary d-flex align-items-center gap-2"
      >
        <Mail size={18} />
        Email
      </button>

      <button
        onClick={handleCopyLink}
        className="btn btn-outline-secondary d-flex align-items-center gap-2"
      >
        {copied ? <Check size={18} /> : <Copy size={18} />}
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  );
};

export default ShareButtons;
