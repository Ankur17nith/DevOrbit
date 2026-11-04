# DevOrbit Component Guidelines & Patterns

---

## 1. Buttons

```tsx
// Primary Brand Action Button
<button className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#A78BFA] text-white rounded-lg text-sm font-medium transition-all shadow-sm shadow-[#8B5CF6]/20 active:scale-[0.98]">
  Run Analysis
</button>

// Secondary / Ghost Action Button
<button className="px-3.5 py-1.5 bg-[#181C26] hover:bg-[#202431] text-[#F8FAFC] border border-[#1F2430] hover:border-[#2E364A] rounded-lg text-sm font-medium transition-all">
  Filter Repos
</button>

// Subdued / Icon Action Button
<button className="p-2 text-[#686D79] hover:text-[#F8FAFC] hover:bg-[#181C26] rounded-lg transition-colors">
  <Icon className="h-4 w-4" />
</button>
```

---

## 2. Cards & Containers

```tsx
<div className="bg-[#12151D] border border-[#1F2430] rounded-xl p-5 hover:border-[#2E364A] transition-all duration-200">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-sm font-semibold text-[#F8FAFC]">Widget Header</h3>
    <span className="text-xs text-[#686D79]">Real-time</span>
  </div>
  {/* Content */}
</div>
```

---

## 3. Badges & Status Pills

```tsx
// Electric Violet Accent Pill (Category / Platform)
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30">
  LeetCode
</span>

// Success Status (Solved, Active)
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
  Solved
</span>

// Warning Status (Revision Due, Approaching Deadline)
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
  Revise Due
</span>
```

---

## 4. Input Fields & Search

```tsx
<div className="relative">
  <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#686D79]" />
  <input
    type="text"
    placeholder="Search 606+ GSoC organizations or repositories..."
    className="w-full bg-[#181C26] border border-[#1F2430] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-lg pl-9 pr-4 py-2 text-sm text-[#F8FAFC] placeholder-[#686D79] outline-none transition-all"
  />
</div>
```
