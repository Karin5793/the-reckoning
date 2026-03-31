import { UNIT_TYPES, RES_LABELS } from '../../constants/gameConstants'

export function ContextMenu({ menu, resources, onSelectUnit, onDeclareWar }) {
  if (!menu) return null
  const kind = menu.type || 'units'
  return (
    <div
      className="context-menu"
      style={{ left: menu.x, top: menu.y }}
      onClick={(e) => e.stopPropagation()}
      role="presentation"
    >
      {kind === 'war' ? (
        <>
          <div className="context-menu-header">{menu.defender}</div>
          <button type="button" className="context-menu-item" onClick={onDeclareWar}>
            <span className="cm-label">Savaş İlan Et</span>
          </button>
        </>
      ) : (
        <>
          <div className="context-menu-header">{menu.headerTitle ?? menu.country}</div>
          {Object.entries(UNIT_TYPES).map(([type, { label, icon, cost }]) => {
            const canAfford = Object.entries(cost).every(([res, amt]) => resources[res] >= amt)
            const costStr = Object.entries(cost)
              .map(([res, amt]) => `${RES_LABELS[res]} ${amt}`)
              .join(', ')
            return (
              <button
                key={type}
                type="button"
                className={`context-menu-item${canAfford ? '' : ' context-menu-item--disabled'}`}
                onClick={() => canAfford && onSelectUnit(type)}
                disabled={!canAfford}
              >
                <span className="cm-icon">{icon}</span>
                <span className="cm-label">{label}</span>
                <span className="cm-cost">{costStr}</span>
              </button>
            )
          })}
        </>
      )}
    </div>
  )
}
