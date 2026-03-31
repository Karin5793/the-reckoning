import { BOTTOM_BAR_ITEMS } from '../../constants/gameConstants'

export function BottomBar({ resources }) {
  return (
    <div className="bottom-bar">
      {BOTTOM_BAR_ITEMS.map(({ icon, label, key }) => (
        <div key={key} className="resource-item">
          <span className="resource-icon">{icon}</span>
          <span className="resource-label">{label}</span>
          <span className="resource-value">{resources[key]}</span>
        </div>
      ))}
    </div>
  )
}
