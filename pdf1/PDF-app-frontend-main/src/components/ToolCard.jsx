import { motion } from 'framer-motion';

function ToolCard({ tool, isActive, onClick }) {
  const Icon = tool.icon;

  const getIconTone = () => {
    if (tool.id.includes('excel')) {
      return 'bg-emerald-100 text-emerald-600';
    }
    if (tool.id.includes('word')) {
      return 'bg-blue-100 text-blue-600';
    }
    if (tool.id.includes('pdf') || tool.id === 'merge' || tool.id === 'split' || tool.id === 'compress') {
      return 'bg-orange-100 text-orange-600';
    }
    return 'bg-indigo-100 text-indigo-600';
  };

  return (
    <motion.button
      type="button"
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={() => onClick(tool.id)}
      className={`group relative h-full w-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-lg transition-all duration-300 hover:shadow-2xl ${
        isActive
          ? 'ring-2 ring-slate-300'
          : 'hover:-translate-y-[2px]'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/40 to-indigo-50/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div
        className={`relative mb-3 inline-flex rounded-xl p-2 ${getIconTone()}`}
      >
        <Icon size={18} />
      </div>
      <h3 className="relative text-base font-medium text-slate-900">{tool.title}</h3>
      <p className="relative mt-1 text-sm text-slate-600">{tool.description}</p>
    </motion.button>
  );
}

export default ToolCard;
