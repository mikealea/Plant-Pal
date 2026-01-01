
import React, { useCallback, useState } from 'react';
import { Upload, Camera, Loader2, Stethoscope, Search, Clapperboard } from 'lucide-react';
import { ScanMode } from '../types';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  isLoading: boolean;
  mode: ScanMode;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, isLoading, mode }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageSelected(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [onImageSelected]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const isDiagnose = mode === 'diagnose';
  const isAnimate = mode === 'animate';

  let borderColorClass = 'border-transparent';
  if (dragActive) {
    if (isDiagnose) borderColorClass = 'border-amber-500';
    else if (isAnimate) borderColorClass = 'border-purple-500';
    else borderColorClass = 'border-emerald-500';
  }

  const getIconColor = () => {
    if (isDiagnose) return 'text-amber-600 dark:text-amber-500';
    if (isAnimate) return 'text-purple-600 dark:text-purple-500';
    return 'text-emerald-600 dark:text-emerald-500';
  };

  const getBgColor = () => {
    if (isDiagnose) return 'bg-amber-50 dark:bg-amber-900/20';
    if (isAnimate) return 'bg-purple-50 dark:bg-purple-900/20';
    return 'bg-emerald-50 dark:bg-emerald-900/20';
  };

  const getButtonColor = () => {
    if (isDiagnose) return 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500';
    if (isAnimate) return 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500';
    return 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500';
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 md:px-0">
      <div 
        className={`relative group bg-white dark:bg-slate-800 rounded-3xl shadow-xl transition-all duration-300 overflow-hidden border-2 ${borderColorClass} ${dragActive ? 'scale-[1.02]' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="p-6 py-10 md:p-16 text-center">
          
          <div className={`mx-auto w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${getBgColor()}`}>
             {isLoading ? (
               <Loader2 className={`w-8 h-8 md:w-10 md:h-10 animate-spin ${getIconColor()}`} />
             ) : (
               isDiagnose ? (
                 <Stethoscope className={`w-8 h-8 md:w-10 md:h-10 ${getIconColor()}`} />
               ) : isAnimate ? (
                  <Clapperboard className={`w-8 h-8 md:w-10 md:h-10 ${getIconColor()}`} />
               ) : (
                 <Search className={`w-8 h-8 md:w-10 md:h-10 ${getIconColor()}`} />
               )
             )}
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            {isLoading 
              ? (isDiagnose ? 'Diagnosing Issue...' : isAnimate ? 'Generating Video...' : 'Identifying Plant...') 
              : (isDiagnose ? 'Upload Sick Plant Photo' : isAnimate ? 'Upload Photo to Animate' : 'Snap or Upload a Photo')}
          </h3>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto leading-relaxed">
             {isLoading 
              ? (isAnimate ? 'This may take a minute. Veo is creating your video.' : 'Our AI botanist is studying your image.')
              : (isDiagnose 
                  ? 'Get detailed diagnosis, causes, and treatment plans.' 
                  : isAnimate 
                    ? 'Turn your plant photo into a cinematic video with Veo.'
                    : 'Identify detailed care tips, scientific names, and more.')}
          </p>

          {!isLoading && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <label className={`cursor-pointer text-white font-medium py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2 w-full sm:w-auto justify-center ${getButtonColor()}`}>
                <Camera className="w-5 h-5" />
                <span>Camera</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  className="hidden" 
                  onChange={handleChange} 
                />
              </label>

              <label className="cursor-pointer bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium py-3 px-6 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2 w-full sm:w-auto justify-center">
                <Upload className="w-5 h-5" />
                <span>Upload</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleChange} 
                />
              </label>
            </div>
          )}
          
          {!isLoading && (
             <p className="mt-6 text-xs text-slate-400 dark:text-slate-500 font-medium">
               Supports JPG, PNG, WEBP
             </p>
          )}
        </div>

        {/* Loading Overlay with Scan Effect */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[2px] z-10">
             <div className={`absolute inset-x-0 h-1 bg-gradient-to-r from-transparent to-transparent animate-scan shadow-[0_0_15px_rgba(0,0,0,0.2)] ${
               isDiagnose 
                 ? 'via-amber-500' 
                 : isAnimate
                   ? 'via-purple-500'
                   : 'via-emerald-500'
             }`}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
