
// const VideoComponent = () => {
//   return (
//     <div className="flex flex-col items-center justify-center p-4">
//       <h1 className="text-xl font-bold mb-4 text-white">This is my video</h1>
      
//       {/* Instagram Post/Reel Container */}
//       <div className="w-full max-w-sm flex justify-center">
//         <iframe 
//           src="https://www.instagram.com/reel/DaBDYC2p3GD/embed" 
//           width="400" 
//           height="480" 
//           frameBorder="0" 
//           scrolling="no" 
//           allowTransparency={true}
//           title="Instagram Reel"
//         ></iframe>
//       </div>
//     </div>
//   )
// }

// export default VideoComponent
// const VideoComponent = () => {
//   return (
//     <div className="flex justify-center p-4">
//       <div className="relative w-[400px] h-[480px] overflow-hidden">
//         <iframe
//           src="https://www.instagram.com/reel/DaBDYC2p3GD/embed"
//           className="absolute -top-[65px] left-0"
//           width="400"
//           height="550"
//           frameBorder="0"
//           scrolling="no"
//           allowTransparency
//           allowFullScreen
//           title="Instagram Reel"
//         />
//       </div>
//     </div>
//   );
// };

// export default VideoComponent;

import { Dumbbell, ExternalLink } from 'lucide-react';

const ExerciseVideoPlayer = ({ title, url }) => {
  // Helper function to convert Instagram Reel URL into embed URL
  const getInstagramEmbedUrl = (link) => {
    if (!link) return '';
    // Clean trailing slashes or queries and append /embed
    const cleanUrl = link.split('?')[0].replace(/\/$/, '');
    return `${cleanUrl}/embed`;
  };

  // Helper function to convert YouTube Short URL into embed URL
  const getYouTubeEmbedUrl = (link) => {
    if (!link) return '';
    // Handles formats like https://youtube.com/shorts/VIDEO_ID or standard watch URLs
    let videoId = '';
    if (link.includes('/shorts/')) {
      videoId = link.split('/shorts/')[1]?.split('?')[0];
    } else if (link.includes('watch?v=')) {
      videoId = link.split('watch?v=')[1]?.split('&')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  const isYouTube = url?.includes('youtube.com') || url?.includes('youtu.be');
  const isInstagram = url?.includes('instagram.com');

  const embedUrl = isYouTube 
    ? getYouTubeEmbedUrl(url) 
    : isInstagram 
    ? getInstagramEmbedUrl(url) 
    : '';

  return (
    <div className="bg-[#111827] border border-slate-800/80 rounded-3xl p-5 max-w-sm flex flex-col justify-between shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Dumbbell className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-white truncate max-w-[180px]">
            {title || 'Exercise Tutorial'}
          </h3>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 uppercase tracking-wider">
          {isYouTube ? 'YouTube Short' : isInstagram ? 'Instagram Reel' : 'Video'}
        </span>
      </div>

      {/* Video Embed Box (Vertical 9:16 ratio style) */}
      <div className="relative w-full h-[420px] my-4 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={title || 'Exercise Video'}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <p className="text-xs text-slate-500 text-center p-4">
            Invalid or unsupported video link provided.
          </p>
        )}
      </div>

      {/* Footer / Original Link Button */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-xs text-slate-400">Proper form guide</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:underline"
        >
          Open Original <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};

export default ExerciseVideoPlayer;

// const VideoComponent = ({ url }) => {
//   const getVideoType = (url) => {
//     if (!url) return null;

//     if (url.includes("instagram.com")) {
//       return "instagram";
//     }

//     if (
//       url.includes("youtube.com") ||
//       url.includes("youtu.be")
//     ) {
//       return "youtube";
//     }

//     if (
//       url.endsWith(".mp4") ||
//       url.endsWith(".webm") ||
//       url.endsWith(".ogg")
//     ) {
//       return "direct";
//     }

//     return "unknown";
//   };

//   const getYouTubeId = (url) => {
//     try {
//       const parsedUrl = new URL(url);

//       if (parsedUrl.hostname.includes("youtu.be")) {
//         return parsedUrl.pathname.slice(1);
//       }

//       if (parsedUrl.hostname.includes("youtube.com")) {
//         return parsedUrl.searchParams.get("v");
//       }

//       return null;
//     } catch {
//       return null;
//     }
//   };

//   const type = getVideoType(url);

//   return (
//     <div className="flex justify-center p-4">

//       {/* Instagram */}
//       {type === "instagram" && (
//         <iframe
//           src={`${url.replace(/\/$/, "")}/embed`}
//           width="400"
//           height="500"
//           frameBorder="0"
//           scrolling="no"
//           allowTransparency
//           allowFullScreen
//           title="Instagram Video"
//         />
//       )}

//       {/* YouTube */}
//       {type === "youtube" && (
//         <iframe
//           src={`https://www.youtube-nocookie.com/embed/${getYouTubeId(url)}`}
//           width="560"
//           height="315"
//           frameBorder="0"
//           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//           allowFullScreen
//           title="YouTube Video"
//           className="rounded-lg"
//         />
//       )}

//       {/* Direct Video */}
//       {type === "direct" && (
//         <video
//           src={url}
//           controls
//           className="max-w-full rounded-lg"
//         />
//       )}

//       {/* Unsupported */}
//       {type === "unknown" && (
//         <div className="text-red-500">
//           Unsupported video URL
//         </div>
//       )}

//     </div>
//   );
// };

// export default VideoComponent;