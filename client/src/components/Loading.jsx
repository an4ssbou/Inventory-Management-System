const Loading = () => (
  <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-slate-50">
    <div role="status" className="surface flex items-center gap-3 rounded-xl px-5 py-4">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-teal-700" />
      <span className="text-sm font-bold text-slate-600">Chargement...</span>
    </div>
  </div>
);

export default Loading;
