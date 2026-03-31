export function TelegraphPanel({ targetCountry, messageText, onChange, onSend, onClose }) {
  if (!targetCountry) return null
  return (
    <div className="telegraph-panel-overlay" role="dialog" aria-modal="true">
      <div className="telegraph-panel">
        <h3 className="telegraph-panel-title">TELEGRAF — {targetCountry}</h3>
        <textarea
          className="telegraph-panel-textarea"
          placeholder="Mesajınızı yazın..."
          value={messageText}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          maxLength={2000}
        />
        <div className="telegraph-panel-actions">
          <button type="button" className="telegraph-panel-btn telegraph-panel-btn--primary" onClick={onSend}>
            Gönder
          </button>
          <button type="button" className="telegraph-panel-btn" onClick={onClose}>
            İptal
          </button>
        </div>
      </div>
    </div>
  )
}
