import { CheckCircle2, FileText, Upload } from 'lucide-react';

type UploadDropzoneProps = {
  file: File | null;
  isDragging: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onBrowse: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
};

export default function UploadDropzone({
  file,
  isDragging,
  inputRef,
  onBrowse,
  onDragOver,
  onDragLeave,
  onDrop,
}: UploadDropzoneProps) {
  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      className={`min-h-48 cursor-pointer rounded-2xl border-2 border-dashed p-8 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:ring-offset-2 ${
        isDragging
          ? 'scale-[1.02] border-[#FF6B35] bg-[#FFF0E8]'
          : 'border-[#FFB399] bg-white hover:border-[#FF8C00] hover:bg-[#FFF0E8]'
      }`}
    >
      <input ref={inputRef} type="file" accept=".csv" onChange={onBrowse} className="hidden" />

      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <div
          className={`flex size-16 items-center justify-center rounded-full transition-all duration-300 ${
            file ? 'bg-[#F4F5F6] text-[#FF6B35]' : 'bg-[#FFF0E8] text-[#FF6B35]'
          }`}
        >
          {file ? <FileText className="size-7" /> : <Upload className="size-7" />}
        </div>

        <div className="max-w-sm space-y-2">
          <div className="break-words text-lg font-bold text-[#111111]">
            {file ? file.name : 'Upload Your CSV File'}
          </div>
          <p className="text-sm leading-6 text-[#555555]">
            {file
              ? 'Ready for channel detection. Drag another CSV to replace it.'
              : 'Drag and drop your CSV file here, or click to browse.'}
          </p>
        </div>

        {file && (
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FFE8D6] px-4 py-2 text-sm font-medium text-[#FF6B35] shadow-sm">
            <CheckCircle2 className="size-5" />
            File ready for processing
          </div>
        )}
      </div>
    </div>
  );
}
