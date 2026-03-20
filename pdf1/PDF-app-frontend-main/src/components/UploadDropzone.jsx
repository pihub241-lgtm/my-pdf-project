import { UploadCloud } from 'lucide-react';

function UploadDropzone({ files, onFileChange, allowMultiple, accept }) {
  const handleDrop = (event) => {
    event.preventDefault();
    const dropped = Array.from(event.dataTransfer.files || []);
    onFileChange(dropped);
  };

  return (
    <label
      className="block cursor-pointer rounded-2xl border-2 border-dashed border-blue-400 bg-blue-50 p-5 text-center transition hover:bg-blue-100/60 sm:p-6"
      onDrop={handleDrop}
      onDragOver={(event) => event.preventDefault()}
    >
      <input
        className="hidden"
        type="file"
        multiple={allowMultiple}
        accept={accept}
        onChange={(event) => onFileChange(Array.from(event.target.files || []))}
      />
      <div className="mx-auto mb-3 inline-flex rounded-full bg-gradient-to-br from-blue-100 via-indigo-100 to-sky-100 p-3 text-blue-700">
        <UploadCloud size={22} />
      </div>
      <p className="text-sm text-slate-700">Drag & drop files here or click to browse</p>
      {files.length > 0 && (
        <ul className="mt-4 max-h-40 space-y-1 overflow-auto rounded-xl border border-slate-200 bg-white p-3 text-left text-xs text-slate-700">
          {files.map((file) => (
            <li
              key={`${file.name}-${file.size}`}
              className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-2 py-1"
            >
              <span className="truncate">{file.name}</span>
              <span className="shrink-0 text-[11px] text-slate-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </li>
          ))}
        </ul>
      )}
    </label>
  );
}

export default UploadDropzone;
