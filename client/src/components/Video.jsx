import { useRef, useState } from 'react';

const Video = ({ src, poster, className = '', width, height }) => {
  const videoRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-900 ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        width={width}
        height={height}
        preload="metadata"
        loading="lazy"
        playsInline
        onLoadedData={() => setLoaded(true)}
        className={`w-full h-full object-cover ${loaded ? 'block' : 'invisible'}`}
        controls
      />
    </div>
  );
};

export default Video;
