export default function InfoPage() {
  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      <div style={{ height: '54px' }} />

      {/* Hero */}
      <div className="relative overflow-hidden flex flex-col items-center justify-center py-10"
        style={{ background: 'linear-gradient(180deg, #1a1208 0%, #0a0a0a 100%)' }}>
        <div className="text-center px-6">
          <h1 className="text-3xl font-black" style={{ color: '#c9a84c' }}>
            Lido Arcobaleno Gate 1
          </h1>
          <p className="mt-2" style={{ color: '#888' }}>Dal 1985, sul mare più bello</p>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">

        {/* Orari */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: '#c9a84c' }}>
            🕐 Orari
          </h2>
          <div className="space-y-2">
            {[
              { label: 'Apertura lido',  valore: '09:00 – 20:00' },
              { label: 'Bar e snack',    valore: '09:00 – 19:30' },
              { label: 'Cucina calda',   valore: '12:00 – 15:00' },
              { label: 'Aperitivi',      valore: '17:30 – 19:30' },
            ].map((r) => (
              <div key={r.label} className="flex justify-between text-sm">
                <span style={{ color: '#888' }}>{r.label}</span>
                <span className="font-semibold" style={{ color: '#e8e8e8' }}>{r.valore}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Servizi */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: '#c9a84c' }}>
            ⭐ Servizi inclusi
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
              <div key={s} className="px-3 py-2 rounded-xl text-sm"
                style={{ backgroundColor: 'rgba(201,168,76,0.08)', color: '#e8e8e8', border: '1px solid rgba(201,168,76,0.15)' }}>
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Contatti */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: '#c9a84c' }}>
            📞 Contatti
          </h2>
          <div className="space-y-3">
            <a href="tel:+390512345678"
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ backgroundColor: '#2a2a2a' }}>
              <span className="text-2xl">📱</span>
              <div>
                <p className="text-xs" style={{ color: '#666' }}>Telefono</p>
                <p className="font-semibold" style={{ color: '#e8e8e8' }}>051 234 5678</p>
              </div>
            </a>
            <a href="mailto:info@lidoarcobaleno.it"
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ backgroundColor: '#2a2a2a' }}>
              <span className="text-2xl">✉️</span>
              <div>
                <p className="text-xs" style={{ color: '#666' }}>Email</p>
                <p className="font-semibold" style={{ color: '#e8e8e8' }}>info@lidoarcobaleno.it</p>
              </div>
            </a>
            <a href="https://maps.google.com/?q=Viale+del+Mare+303+Castel+Volturno"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ backgroundColor: '#2a2a2a' }}>
              <span className="text-2xl">📍</span>
              <div>
                <p className="text-xs" style={{ color: '#666' }}>Indirizzo</p>
                <p className="font-semibold" style={{ color: '#e8e8e8' }}>Viale del Mare 303, Castel Volturno (CE)</p>
              </div>
            </a>
          </div>
        </div>

        {/* Social */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <h2 className="font-bold text-lg mb-3" style={{ color: '#c9a84c' }}>
            Seguici sui social
          </h2>
          <div className="flex gap-3">
         <a href="https://www.instagram.com/lidoarcobalenogate1?igsh=dHE4MG14bGtsa3U2"
         target="_blank" rel="noopener noreferrer"
         className="flex-1 py-3 rounded-xl text-center font-semibold text-sm"
        style={{ background: 'linear-gradient(135deg, #e91e8c, #f97316)', color: 'white' }}>
        📸 Instagram
        </a>
        <a href="https://www.facebook.com/share/1FSQQQPqFL/?mibextid=wwXIfr"
        target="_blank" rel="noopener noreferrer"
        className="flex-1 py-3 rounded-xl text-center font-semibold text-sm"
        style={{ backgroundColor: '#1877f2', color: 'white' }}>
        👍 Facebook
        </a>
        </div>
        </div>

        {/* Footer legale */}
        <div className="rounded-2xl p-5 text-center space-y-2"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <p style={{ color: '#555', fontSize: '0.75rem' }}>
            Lido Arcobaleno Gate 1
          </p>
          <p style={{ color: '#555', fontSize: '0.75rem' }}>
            P.IVA: 12345678901
          </p>
          <p style={{ color: '#555', fontSize: '0.75rem' }}>
            Viale del Mare 303, 81030 Castel Volturno (CE)
          </p>
          <div className="mt-6 text-center">
  {/* Link policy */}
  <div className="flex justify-center gap-4 pt-2">
    <a
      href="#"
      className="text-[#c9a84c] text-xs hover:underline"
    >
      Privacy Policy
    </a>
    <a
      href="#"
      className="text-[#c9a84c] text-xs hover:underline"
    >
      Cookie Policy
    </a>
  </div>

  {/* Divider */}
  <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
    <p className="text-[#333] text-[0.68rem]">
      Sito sviluppato da{" "}
      <a
        href="https://www.instagram.com/fr4nzis_official?igsh=MXBvbnFnMTB4Z29jNw%3D%3D&utm_source=qr"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#c9a84c] font-semibold hover:underline"
      >
        @fr4nzis_official
      </a>
    </p>
  </div>
</div>
        </div>

        {/* Staff access */}
        <div className="text-center pt-2 pb-4">
          <a href="/staff/login" style={{ color: '#333', fontSize: '0.75rem' }}>
            Accesso staff
          </a>
        </div>

      </div>
    </div>
  );
}