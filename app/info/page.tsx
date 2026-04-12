export default function InfoPage() {
  return (
    <div className="animate-fade-in pb-8">
      <div className="relative h-48 bg-gradient-to-br from-sky-400 to-cyan-600 overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
          <div className="text-5xl mb-2">🌊</div>
          <h1 className="text-3xl font-black">Lido Azzurro</h1>
          <p className="text-sky-100 mt-1">Dal 1985, sul mare più bello</p>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 text-lg mb-3 flex items-center gap-2">
            <span>🕐</span> Orari
          </h2>
          <div className="space-y-2">
            {[
              { label: 'Apertura lido',  valore: '09:00 – 20:00' },
              { label: 'Bar e snack',    valore: '09:00 – 19:30' },
              { label: 'Cucina calda',   valore: '12:00 – 15:00' },
              { label: 'Aperitivi',      valore: '17:30 – 19:30' },
            ].map((r) => (
              <div key={r.label} className="flex justify-between text-sm">
                <span className="text-gray-600">{r.label}</span>
                <span className="font-semibold text-gray-800">{r.valore}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-bold text-gray-800 text-lg mb-3 flex items-center gap-2">
            <span>⭐</span> Servizi inclusi
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              '🚿 Docce calde',
              '🏄 Sport acquatici',
              '🅿️ Parcheggio',
              '📶 Wi-Fi gratuito',
              '🧒 Area bimbi',
              '♿ Accesso disabili',
              '🔒 Cassette sicurezza',
              '🏐 Beach Volley',
            ].map((s) => (
              <div key={s} className="bg-sky-50 rounded-xl px-3 py-2 text-sm text-gray-700">
                {s}
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-bold text-gray-800 text-lg mb-3 flex items-center gap-2">
            <span>📞</span> Contatti
          </h2>
          <div className="space-y-3">
            <a href="tel:+390512345678" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-2xl">📱</span>
              <div>
                <p className="text-xs text-gray-500">Telefono</p>
                <p className="font-semibold text-gray-800">051 234 5678</p>
              </div>
            </a>
            <a href="mailto:info@lidoazzurro.it" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-2xl">✉️</span>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-semibold text-gray-800">info@lidoazzurro.it</p>
              </div>
            </a>
            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-2xl">📍</span>
              <div>
                <p className="text-xs text-gray-500">Indirizzo</p>
                <p className="font-semibold text-gray-800">Lungomare Azzurro 1, Rimini</p>
              </div>
            </a>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-bold text-gray-800 text-lg mb-3">Seguici sui social</h2>
          <div className="flex gap-3">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
              className="flex-1 bg-gradient-to-br from-pink-500 to-orange-400 text-white rounded-xl py-3 text-center font-semibold text-sm">
              📸 Instagram
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
              className="flex-1 bg-blue-600 text-white rounded-xl py-3 text-center font-semibold text-sm">
              👍 Facebook
            </a>
          </div>
        </div>

        <div className="text-center pt-2">
          <a href="/staff" className="text-xs text-gray-300 underline">
            Accesso staff
          </a>
        </div>
      </div>
    </div>
  );
}