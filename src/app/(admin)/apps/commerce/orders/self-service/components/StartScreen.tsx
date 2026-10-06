interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="flex h-[75vh] min-h-[32rem] w-full flex-col items-center justify-center gap-10 overflow-y-auto rounded-2xl bg-gradient-to-br from-primary to-primary-focus p-8 text-primary-content">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="iconify lucide--utensils-crossed size-20"></span>
        <h1 className="text-5xl font-bold">Bienvenido</h1>
        <p className="text-xl opacity-90">Toca la pantalla para comenzar tu pedido</p>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="btn btn-lg h-auto rounded-3xl bg-base-100 px-16 py-8 text-3xl font-bold text-primary shadow-2xl hover:scale-105 active:scale-95"
      >
        Nueva Orden
      </button>
    </div>
  );
}
