import { useState, useEffect } from 'react';

export default function App() {
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);

  const API_URL = 'http://localhost:8000';

  const fetchVideos = async () => {
    try {
      const response = await fetch(`${API_URL}/videos`);
      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      }
    } catch {
      console.error("API_FETCH_ERROR");
    }
  };

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      if (active) await fetchVideos();
    };
    loadData();
    const interval = setInterval(fetchVideos, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setErrorMsg('ERROR: Invalid media container type.');
      setSelectedFile(null);
      return;
    }
    setErrorMsg('');
    setSelectedFile(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSelectedFile(null);
        fetchVideos();
      } else {
        const errData = await response.json();
        setErrorMsg(errData.detail || 'UPLOAD_FAILED');
      }
    } catch {
      setErrorMsg('SERVER_UNREACHABLE');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep-black text-slate-300 font-mono flex flex-col justify-between antialiased selection:bg-cyber-green/20 selection:text-cyber-green">
      
      {/* 1. Vimeo-Style Minimal Top Navigation */}
      <header className="border-b border-cyber-green/10 bg-deep-black/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-black tracking-tighter text-cyber-green">X-STREAM</span>
            <span className="text-[10px] tracking-normal text-slate-600 border border-slate-800 px-1.5 py-0.5 rounded">v1.0.0</span>
          </div>
          <nav className="flex items-center space-x-6 text-xs font-semibold text-slate-400">
            <a href="#how-it-works" className="hover:text-cyber-green transition-colors">Documentation</a>
            <a href="#about" className="hover:text-cyber-green transition-colors">System Core</a>
          </nav>
        </div>
      </header>

      {/* 2. Main Workspace: Large Centered Upload Area */}
      <main className="max-w-4xl mx-auto w-full px-6 py-12 flex-grow space-y-12">
        
        {/* Upload Container Panel */}
        <div className="bg-black border border-cyber-green/20 rounded-xl p-10 shadow-2xl shadow-black/80 text-center max-w-2xl mx-auto">
          <form onSubmit={handleUploadSubmit} className="space-y-6">
            
            {/* Massive Dropzone Component */}
            <div className="border border-dashed border-cyber-green/30 hover:border-cyber-green/60 hover:bg-cyber-green/[0.01] rounded-lg p-12 transition-all duration-300 relative group cursor-pointer">
              <input 
                type="file" 
                accept="video/*" 
                onChange={handleFileChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <div className="space-y-4">
                <div className="text-4xl group-hover:scale-110 transition-transform duration-300 text-cyber-green/80">📥</div>
                <div>
                  <p className="text-sm font-bold text-slate-200">
                    {selectedFile ? selectedFile.name : "Drag and drop video assets here"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">or click to browse local environment storage</p>
                </div>
                <div className="text-[10px] text-slate-600 max-w-sm mx-auto border-t border-slate-900 pt-3">
                  System accepts standard containers. Max chunk allocation bounded by pipeline buffers.
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="text-xs text-rose-400 bg-rose-500/5 border border-rose-500/10 rounded p-3">
                [!] EXCEPTION_LOG :: {errorMsg}
              </div>
            )}

            {/* Clean Minimalist CTA Button */}
            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="px-8 py-2.5 bg-transparent border border-cyber-green/80 text-cyber-green hover:bg-cyber-green hover:text-deep-black disabled:border-slate-800 disabled:text-slate-700 font-bold text-xs tracking-wider uppercase rounded transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
            >
              {uploading ? 'STATUS: INGESTING_PAYLOAD...' : 'Execute Upload'}
            </button>
          </form>
        </div>

        {/* 3. Streamlined Activity Ledger */}
        {videos.length > 0 && (
          <div className="space-y-4 border-t border-slate-900 pt-10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Processing Pipeline Receipts</h3>
              <span className="text-[10px] font-mono text-slate-600">Total Jobs: {videos.length}</span>
            </div>

            <div className="bg-black border border-cyber-green/10 rounded-lg divide-y divide-slate-900 overflow-hidden shadow-xl">
              {videos.map((video) => {
                const isCompleted = video.status === 'COMPLETED';
                const isProcessing = video.status === 'PROCESSING';
                const isFailed = video.status === 'FAILED';

                return (
                  <div key={video.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black hover:bg-cyber-green/[0.01] transition-colors">
                    <div className="truncate space-y-1">
                      <p className="text-xs font-bold text-slate-300 truncate" title={video.filename}>
                        {video.filename}
                      </p>
                      <p className="text-[10px] text-slate-600">
                        UUID: 0x{video.id} &bull; TIMESTAMP: {new Date(video.created_at).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 shrink-0">
                      <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded border ${
                        isCompleted ? 'bg-cyber-green/10 text-cyber-green border-cyber-green/30' :
                        isProcessing ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' :
                        isFailed ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        'bg-slate-900 text-slate-500 border-slate-800'
                      }`}>
                        {video.status}
                      </span>

                      {isCompleted && (
                        <button
                          onClick={() => setActiveVideoUrl(`${API_URL}/static/processed/compressed_${video.filename}`)}
                          className="text-[10px] font-bold text-cyber-green border border-cyber-green/40 hover:bg-cyber-green hover:text-deep-black rounded px-2.5 py-1 transition-all cursor-pointer"
                        >
                          PLAY
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* 4. Professional Information Block (Footer) */}
      <footer className="border-t border-slate-900 bg-black/40 mt-20">
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-slate-500">
          
          {/* Column A: Architecture / Documentation */}
          <div id="how-it-works" className="space-y-3">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">How to Use</h4>
            <p className="leading-relaxed">
              Select or drop a raw video asset into the ingestion terminal above. The asset will be safely piped to an asynchronous execution worker thread where system-level FFmpeg binaries compress and transcode it down to a optimized, web-standard H.264 video.
            </p>
          </div>

          {/* Column B: About the Software Engineer */}
          <div id="about" className="space-y-3">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">System Profile</h4>
            <p className="leading-relaxed">
              X-STREAM is a secure, distributed media engine built using Python with FastAPI, asynchronous Celery worker nodes, Redis distributed event brokers, and PostgreSQL database registries. 
            </p>
          </div>

          {/* Column C: System Integrity / Privacy */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Data Isolation Policy</h4>
            <p className="leading-relaxed">
              All source payloads undergo isolated storage buffering. Processed outputs are written to dedicated local volumes. No tracking assets, cloud analytics telemetry, or external scripts are injected into runtime components.
            </p>
          </div>
        </div>
        
        <div className="max-w-5xl mx-auto px-6 py-4 border-t border-slate-950 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-600 font-mono">
          <span>&copy; {new Date().getFullYear()} X-STREAM CORE. ALL RIGHTS RESERVED.</span>
          <div className="space-x-4 mt-2 sm:mt-0">
            <span>SECURE LINK: ESTABLISHED</span>
          </div>
        </div>
      </footer>

      {/* Full Screen Video Overlay Modal */}
      {activeVideoUrl && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-cyber-green rounded-lg w-full max-w-3xl overflow-hidden shadow-2xl relative">
            <div className="p-3 border-b border-slate-900 flex items-center justify-between bg-black">
              <span className="text-xs text-slate-400 font-mono">/assets/processed/feed.mp4</span>
              <button 
                onClick={() => setActiveVideoUrl(null)}
                className="text-cyber-green hover:bg-cyber-green hover:text-deep-black text-xs font-bold h-6 w-6 rounded border border-cyber-green/40 flex items-center justify-center transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="bg-black aspect-video flex items-center justify-center">
              <video 
                src={activeVideoUrl} 
                controls 
                autoPlay 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}