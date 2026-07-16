import { useRef, useEffect } from 'react';
import api from '../api/axios';

const Player = ({ videoUrl, posterUrl, contentId, contentType }) => {
  const videoRef = useRef(null);

  const syncProgress = async (currentTime) => {
    if (!contentId || currentTime < 5) return; 

    try {
      await api.post('/history/update/', {
        content_id: contentId,
        content_type: contentType,
        watch_time: Math.floor(currentTime)
      });
    } catch (error) {
      console.error('Progress sync failed:', error);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let syncInterval;

    const handlePlay = () => {
      syncInterval = setInterval(() => syncProgress(video.currentTime), 15000);
    };

    const handlePause = () => {
      clearInterval(syncInterval);
      syncProgress(video.currentTime);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      clearInterval(syncInterval);
      if (video) {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        syncProgress(video.currentTime);
      }
    };
  }, [contentId, contentType]);

  return (
    <div className="relative w-full mx-auto rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.6)] border border-gray-700 bg-black">
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        controls
        controlsList="nodownload"
        className="w-full aspect-video outline-none"
      >
        <p className="text-white p-4">Your browser does not support HTML5 video.</p>
      </video>
    </div>
  );
};

export default Player;