export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4">
            <span className="text-2xl">✦</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">HábitosPro</h1>
          <p className="text-slate-400 text-sm mt-1">Tu desarrollo personal, cada día</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
