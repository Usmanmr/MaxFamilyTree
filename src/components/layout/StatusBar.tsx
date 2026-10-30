
export default function StatusBar() {
  return (
    <footer className="h-8 flex items-center justify-between px-6 bg-slate-900 text-[10px] text-slate-500 z-50">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Sync Active</span>
        <span>PostgreSQL • Redis • AWS S3</span>
      </div>
      <div className="flex gap-4">
        <span>X: 142.4Y | Y: -88.12</span>
        <span>Zoom: 85%</span>
      </div>
    </footer>
  );
}
