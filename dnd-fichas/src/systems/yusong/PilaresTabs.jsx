export default function PilaresTabs({ label, tabs, activeTab, onChange }) {
  function handleKeyDown(event) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const current = tabs.findIndex((tab) => tab.id === activeTab);
    const next = event.key === "Home"
      ? 0
      : event.key === "End"
        ? tabs.length - 1
        : (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    onChange(tabs[next].id);
    event.currentTarget.querySelector(`[data-tab-id="${tabs[next].id}"]`)?.focus();
  }

  return (
    <div className="pilares-tabs" role="tablist" aria-label={label} onKeyDown={handleKeyDown}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`${label}-${tab.id}-tab`}
          data-tab-id={tab.id}
          aria-selected={activeTab === tab.id}
          aria-controls={`${label}-${tab.id}-panel`}
          tabIndex={activeTab === tab.id ? 0 : -1}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
