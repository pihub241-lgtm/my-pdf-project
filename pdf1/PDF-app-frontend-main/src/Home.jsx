import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Sparkles,
  ShieldCheck,
  Zap,
  Infinity,
  Lock,
  WandSparkles,
} from 'lucide-react';
import ToolCard from './components/ToolCard';
import UploadDropzone from './components/UploadDropzone';
import StatusBanner from './components/StatusBanner';
import { TOOL_LIST, TOOL_MAP } from './config/tools';
import { processPdf, downloadBlob } from './services/pdfApi';
import { convertImageFile } from './utils/imageConversion';

function Home() {
  const [selectedToolId, setSelectedToolId] = useState('merge');
  const [files, setFiles] = useState([]);
  const [ranges, setRanges] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [output, setOutput] = useState(null);
  const [jpgQuality, setJpgQuality] = useState(0.92);
  const [jpgBackgroundColor, setJpgBackgroundColor] = useState('#ffffff');
  const [icoSize, setIcoSize] = useState(256);
  const [watermarkText, setWatermarkText] = useState('elexico');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.25);
  const [watermarkScope, setWatermarkScope] = useState('all');
  const [watermarkPage, setWatermarkPage] = useState('1');

  const activeTool = useMemo(() => TOOL_MAP[selectedToolId], [selectedToolId]);

  const handleFileChange = (incomingFiles) => {
    if (!activeTool.allowMultiple && incomingFiles.length > 1) {
      setFiles([incomingFiles[0]]);
      return;
    }
    setFiles(incomingFiles);
  };

  const resetForToolChange = (id) => {
    setSelectedToolId(id);
    setFiles([]);
    setRanges('');
    setStatus('idle');
    setMessage('');
    setOutput(null);
  };

  const handleConvert = async () => {
    if (!files.length) {
      setStatus('error');
      setMessage('Please upload files first.');
      return;
    }

    try {
      setStatus('processing');
      setMessage('Processing your file...');

      let result;

      if (activeTool.mode === 'client-image') {
        result = await convertImageFile(files[0], activeTool.id, {
          quality: jpgQuality,
          backgroundColor: jpgBackgroundColor,
          icoSize,
        });
      } else {
        const formData = new FormData();
        files.forEach((file) => formData.append(activeTool.inputName, file));

        if (activeTool.id === 'split' && ranges.trim()) {
          formData.append('ranges', ranges.trim());
        }

        if (activeTool.mode === 'server-office') {
          formData.append('officeKind', activeTool.officeKind || 'word');
        }

        if (activeTool.id === 'watermark') {
          formData.append('watermarkText', watermarkText.trim() || 'elexico');
          formData.append('watermarkOpacity', String(watermarkOpacity));
          if (watermarkScope === 'single') {
            formData.append('watermarkPage', String(watermarkPage).trim() || '1');
          }
        }

        result = await processPdf({
          endpoint: activeTool.endpoint,
          formData,
          fallbackFileName: `${activeTool.id}-output`,
        });
      }

      setOutput(result);
      setStatus('success');
      setMessage('Done. Click Download file.');
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Processing failed.');
    }
  };

  const handleDownload = () => {
    if (!output?.blob) return;
    downloadBlob(output.blob, output.filename || `${activeTool.id}-output`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent text-slate-900">
      <div className="pointer-events-none absolute -left-36 -top-20 h-[28rem] w-[28rem] rounded-full bg-blue-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-0 h-[26rem] w-[26rem] rounded-full bg-indigo-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 sm:pt-10 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <Sparkles size={14} />
              Modern PDF Toolkit
            </div>

            <h1 className="mt-4 text-4xl font-bold tracking-[0.08em] text-[#1e293b] sm:text-5xl">
              PDF Master
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
              Fast, private, and zero-limits tools to process documents in a few clicks.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#1e293b] p-4 text-white shadow-lg">
                <div className="mb-2 inline-flex rounded-lg bg-white/20 p-2 text-white">
                  <Zap size={14} />
                </div>
                <p className="text-sm font-medium">Fast Processing</p>
              </div>
              <div className="rounded-2xl bg-[#1e293b] p-4 text-white shadow-lg">
                <div className="mb-2 inline-flex rounded-lg bg-white/20 p-2 text-white">
                  <Infinity size={14} />
                </div>
                <p className="text-sm font-medium">Unlimited Usage</p>
              </div>
              <div className="rounded-2xl bg-[#1e293b] p-4 text-white shadow-lg">
                <div className="mb-2 inline-flex rounded-lg bg-white/20 p-2 text-white">
                  <Lock size={14} />
                </div>
                <p className="text-sm font-medium">Privacy First</p>
              </div>
            </div>
          </div>
        </motion.header>

        <section className="mb-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-lg md:p-6">
          <div className="mb-5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-[#1e293b]" />
              <h3 className="text-lg font-semibold text-[#1e293b]">Core Tools</h3>
            </div>
            <span className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 sm:inline-flex">
              <WandSparkles size={12} />
              Choose one to continue
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TOOL_LIST.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.12 + index * 0.04 }}
              >
                <ToolCard
                  tool={tool}
                  isActive={tool.id === selectedToolId}
                  onClick={resetForToolChange}
                />
              </motion.div>
            ))}
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mt-8 rounded-3xl border border-slate-100 bg-white p-5 shadow-lg sm:p-6"
        >
          <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-semibold text-[#1e293b]">{activeTool.title}</h2>
              <p className="text-sm text-slate-600">{activeTool.description}</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700">
              <ShieldCheck size={14} />
              Auto-delete enabled
            </div>
          </div>

          <UploadDropzone
            files={files}
            onFileChange={handleFileChange}
            allowMultiple={activeTool.allowMultiple}
            accept={activeTool.accept}
          />

          {activeTool.id === 'split' && (
            <div className="mt-4">
              <label className="mb-2 block text-sm text-slate-700">Page ranges (optional)</label>
              <input
                value={ranges}
                onChange={(event) => setRanges(event.target.value)}
                placeholder="e.g. 1-3,5,8-10"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-300/40 focus:ring"
              />
            </div>
          )}

          {activeTool.id === 'watermark' && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-slate-700">Watermark text</label>
                <input
                  value={watermarkText}
                  onChange={(event) => setWatermarkText(event.target.value)}
                  placeholder="elexico"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-300/40 focus:ring"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-700">Apply watermark on</label>
                <select
                  value={watermarkScope}
                  onChange={(event) => setWatermarkScope(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  <option value="all">All pages</option>
                  <option value="single">Single page</option>
                </select>
              </div>
              {watermarkScope === 'single' && (
                <div>
                  <label className="mb-2 block text-sm text-slate-700">Page number (1-based)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={watermarkPage}
                    onChange={(event) => setWatermarkPage(event.target.value)}
                    placeholder="1"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-300/40 focus:ring"
                  />
                </div>
              )}
              <div>
                <label className="mb-2 block text-sm text-slate-700">
                  Opacity ({watermarkOpacity.toFixed(2)})
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="0.3"
                  step="0.01"
                  value={watermarkOpacity}
                  onChange={(event) => setWatermarkOpacity(Number(event.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {activeTool.id === 'png-to-jpg' && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-slate-700">
                  JPG quality ({Math.round(jpgQuality * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={jpgQuality}
                  onChange={(event) => setJpgQuality(Number(event.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-700">Background color</label>
                <input
                  type="color"
                  value={jpgBackgroundColor}
                  onChange={(event) => setJpgBackgroundColor(event.target.value)}
                  className="h-10 w-20 rounded border border-slate-300 bg-white"
                />
              </div>
            </div>
          )}

          {activeTool.id === 'png-to-ico' && (
            <div className="mt-4">
              <label className="mb-2 block text-sm text-slate-700">ICO size</label>
              <select
                value={icoSize}
                onChange={(event) => setIcoSize(Number(event.target.value))}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option value={256}>256 x 256</option>
                <option value={32}>32 x 32</option>
              </select>
            </div>
          )}

          <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleConvert}
              disabled={status === 'processing'}
              className="w-full rounded-xl bg-[#1e293b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {status === 'processing' ? 'Processing...' : activeTool.cta}
            </button>

            {output?.blob && (
              <button
                type="button"
                onClick={handleDownload}
                className="w-full rounded-xl bg-[#1e293b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 sm:w-auto"
              >
                Download file
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setFiles([]);
                setRanges('');
                setWatermarkText('elexico');
                setWatermarkOpacity(0.25);
                setWatermarkScope('all');
                setWatermarkPage('1');
                setStatus('idle');
                setMessage('');
                setOutput(null);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 sm:w-auto"
            >
              Clear
            </button>
          </div>

          <div className="mt-4">
            <StatusBanner status={status} message={message} />
          </div>
        </motion.section>
      </div>
    </div>
  );
}

export default Home;
