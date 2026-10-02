import React, { useState, useEffect } from 'react';
import type { MediaAsset, MediaAssetType } from '../../types';
import { mediaGenerationService } from '../../services/mediaGenerationService';
import { useApp } from '../../context/AppContext';
import {
  X,
  Upload,
  Image as ImageIcon,
  Film,
  Trash2,
  Search,
  Loader2,
  FolderOpen
} from 'lucide-react';

interface AssetLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset?: (asset: MediaAsset) => void;
}

export const AssetLibraryModal: React.FC<AssetLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectAsset
}) => {
  const { showToast } = useApp();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAssets();
    }
  }, [isOpen]);

  const loadAssets = async () => {
    setIsLoading(true);
    try {
      const list = await mediaGenerationService.getAssets();
      setAssets(list);
    } catch (err) {
      console.error('Failed to load assets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      showToast('File too large (Max size: 25MB).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setIsUploading(true);
        const base64Data = (reader.result as string).split(',')[1];
        const isVideo = file.type.startsWith('video/');
        const assetType: MediaAssetType = isVideo ? 'user_video' : 'user_image';

        const newAsset = await mediaGenerationService.uploadAsset(
          file.name,
          base64Data,
          assetType
        );

        setAssets((prev) => [newAsset, ...prev]);
        showToast(`Uploaded ${file.name} to Asset Library`, 'success');
      } catch (err: any) {
        showToast(err.message || 'Upload failed', 'error');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAsset = async (assetId: string, name: string) => {
    if (!confirm(`Delete asset "${name}"?`)) return;
    try {
      const success = await mediaGenerationService.deleteAsset(assetId);
      if (success) {
        setAssets((prev) => prev.filter((a) => a.id !== assetId));
        showToast('Asset deleted.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete asset', 'error');
    }
  };

  const filteredAssets = assets.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || a.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-card rounded-3xl border border-cyan-500/40 w-full max-w-4xl bg-[#090d16] p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">FLASH.Ai Media Asset Library</h2>
              <p className="text-xs text-slate-400">
                Manage uploaded b-roll clips, UI screenshots, mockups, and AI background assets.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search, Filter & Upload */}
        <div className="py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets by filename..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
            >
              <option value="all">All Types</option>
              <option value="user_image">Images</option>
              <option value="user_video">Videos</option>
              <option value="ai_image">AI Graphics</option>
              <option value="gradient_bg">Backdrops</option>
            </select>
          </div>

          <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-bold cursor-pointer transition-colors">
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload Asset
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,video/mp4,video/quicktime,image/svg+xml"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Grid List */}
        <div className="flex-1 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
              <p className="text-xs text-slate-400">Loading asset library...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No assets found</p>
              <p className="text-xs text-slate-500">
                Upload images or video clips to reuse across your Reels.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredAssets.map((asset) => {
                const isVideo = asset.type === 'user_video';
                return (
                  <div
                    key={asset.id}
                    className="glass-card rounded-2xl border border-slate-800 p-2.5 flex flex-col justify-between group hover:border-cyan-500/40 transition-all relative overflow-hidden"
                  >
                    {/* Media Preview Box */}
                    <div className="aspect-[9/16] rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden relative">
                      {isVideo ? (
                        <div className="flex flex-col items-center gap-1 text-slate-400">
                          <Film className="w-8 h-8 text-purple-400" />
                          <span className="text-[10px] font-mono">MP4 CLIP</span>
                        </div>
                      ) : (
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}

                      {/* Select Action Overlay */}
                      {onSelectAsset && (
                        <button
                          onClick={() => onSelectAsset(asset)}
                          className="absolute inset-0 bg-cyan-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-cyan-300 transition-opacity"
                        >
                          Select Asset
                        </button>
                      )}
                    </div>

                    <div className="pt-2">
                      <p className="text-[11px] font-semibold text-slate-200 truncate">
                        {asset.name}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1">
                        <span>{asset.fileSize ? `${Math.round(asset.fileSize / 1024)} KB` : 'Local'}</span>
                        <button
                          onClick={() => handleDeleteAsset(asset.id, asset.name)}
                          className="text-slate-500 hover:text-rose-400 transition-colors p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
