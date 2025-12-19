import React, { useEffect } from 'react';

// Declare custom Wistia element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'wistia-player': {
        'media-id': string;
        aspect: string;
      };
    }
  }
}

interface WistiaVideoProps {
  mediaId: string;
  aspectRatio?: number;
  className?: string;
}

const WistiaVideo: React.FC<WistiaVideoProps> = ({
  mediaId,
  aspectRatio = 1.7777777777777777, // 16:9 default
  className = ''
}) => {
  useEffect(() => {
    // Load Wistia scripts
    const script1 = document.createElement('script');
    script1.src = 'https://fast.wistia.com/player.js';
    script1.async = true;
    document.body.appendChild(script1);

    const script2 = document.createElement('script');
    script2.src = `https://fast.wistia.com/embed/${mediaId}.js`;
    script2.async = true;
    script2.type = 'module';
    document.body.appendChild(script2);

    // Cleanup
    return () => {
      document.body.removeChild(script1);
      document.body.removeChild(script2);
    };
  }, [mediaId]);

  return (
    <div className={`wistia-video-wrapper ${className}`}>
      <style>{`
        wistia-player[media-id='${mediaId}']:not(:defined) {
          background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/${mediaId}/swatch');
          display: block;
          filter: blur(5px);
          padding-top: ${(1 / aspectRatio) * 100}%;
        }
      `}</style>
      {React.createElement('wistia-player', {
        'media-id': mediaId,
        aspect: aspectRatio.toString()
      })}
    </div>
  );
};

export default WistiaVideo;
