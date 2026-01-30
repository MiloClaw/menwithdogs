

# Trail Markers UX/UI Improvement Plan

## Current State Analysis

After reviewing the implementation, here's what exists:

| Component | Current State |
|-----------|---------------|
| **Map Markers** | White circles with footprint icon, 44px touch targets, scale on hover |
| **Desktop Interaction** | Click opens Mapbox popup with trail info, photo, directions button |
| **Mobile Interaction** | Click opens bottom sheet drawer with trail details |
| **Trail List** | Collapsible panel below map with photo cards, difficulty filters |
| **OSM Polylines** | Color-coded by difficulty (green/yellow/red) |
| **Legend** | Shows difficulty color key |

## Identified Problems (from session replay)

1. **Generic tooltips** - Mapbox popups show "div" placeholders during rapid interactions
2. **No visual connection** - Selected trail in list has no visible link to its marker on map
3. **Markers lack context** - All markers look identical regardless of trail difficulty
4. **No hover preview** - Users must click to see any trail information
5. **Missing active state sync** - Clicking a marker doesn't highlight the trail card in the list

---

## Recommended Improvements

### 1. Difficulty-Coded Marker Colors

**Problem**: All markers use the same emerald color, making it hard to identify trail difficulty at a glance.

**Solution**: Color-code marker borders/fills to match difficulty:

```text
┌─────────────────────────────────────────────┐
│  Current          →    Improved             │
│  ●○●○●             ●🟢 ●🟡 ●🔴              │
│  (all emerald)     (easy) (mod) (hard)      │
└─────────────────────────────────────────────┘
```

**Implementation**:
- Pass `trail.difficulty` to `createTrailheadMarkerElement()`
- Apply corresponding border color from `DIFFICULTY_COLORS`
- Add small difficulty label badge below marker on zoom

### 2. Hover Preview Cards (Desktop Only)

**Problem**: Users must click every marker to see trail info.

**Solution**: Show a lightweight preview on hover before committing to click.

```text
┌───────────────────────────────┐
│ Ryan Mountain Trail           │
│ 3.0 mi • Strenuous            │
│ Click for details →           │
└───────────────────────────────┘
```

**Implementation**:
- Add `mouseenter`/`mouseleave` events to markers
- Display a smaller, non-blocking tooltip positioned above marker
- Full popup opens on click as before

### 3. Bi-Directional List-Map Sync

**Problem**: Clicking a trail card flies to the marker, but the reverse isn't true. Users lose context.

**Solution**: Implement full sync between list and map:

| Action | Result |
|--------|--------|
| Click trail card | Map flies to marker, marker highlights, popup opens |
| Click map marker | Scroll list to trail card, highlight card |
| Hover card (desktop) | Subtly pulse the marker on map |

**Implementation**:
- Add `selectedTrailId` state at page level
- Pass to both `TrailListPanel` and `NationalParkMap`
- Fire callbacks in both directions

### 4. Trail Label Clusters at High Zoom

**Problem**: At zoom level 12+, markers overlap and become confusing.

**Solution**: At lower zooms, cluster nearby markers. At higher zooms, show trail name labels.

```text
Zoom < 11:  [🥾 4]  ← clustered count
Zoom 11-13:  ●       ← individual markers
Zoom > 13:   ● Ryan Mountain  ← with labels
```

**Implementation**:
- Use Mapbox's native clustering on the featured trails source
- Add a symbol layer for trail names at high zoom levels
- Configure `minzoom` and `maxzoom` per layer

### 5. Persistent Marker Tooltips on Selection

**Problem**: Popups disappear too quickly on mobile interactions.

**Solution**: Keep the popup open until explicitly dismissed or another marker is selected.

**Implementation**:
- Prevent `closeOnClick: false` when marker is programmatically selected
- Add explicit close button
- Ensure only one popup can be open at a time

### 6. Trail Name Mini-Labels on Markers

**Problem**: Users can't distinguish trails without clicking.

**Solution**: Add small text labels below or beside markers showing truncated trail names.

```text
     ●
 Ryan Mtn
```

**Implementation**:
- Create Mapbox symbol layer with `text-field` property
- Use `text-size: 10`, `text-anchor: top`
- Apply `text-halo-color: white` for contrast

### 7. Trail Polyline Highlight on Selection

**Problem**: When a featured trail is selected, the OSM polyline for that trail doesn't highlight.

**Solution**: Highlight the relevant trail segment when a featured trail is selected.

**Implementation**:
- Match featured trail trailhead to nearest OSM LineString
- Apply thicker line-width and glow effect when active
- Dim other polylines when one is selected

### 8. Accessible Loading States

**Problem**: No feedback when OSM trails are loading.

**Solution**: Add skeleton/shimmer on the map while trails fetch.

**Implementation**:
- Show a subtle overlay with "Loading trails..." message
- Use Framer Motion fade transition when trails appear

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/map/TrailMarker.tsx` | Add difficulty-based coloring, hover preview, label support |
| `src/components/map/NationalParkMap.tsx` | Implement bi-directional sync, clustering, polyline highlighting |
| `src/components/map/TrailListPanel.tsx` | Accept `highlightedTrailId`, scroll to card on marker click |
| `src/pages/NationalParkDetail.tsx` | Lift `selectedTrailId` state, wire up two-way callbacks |
| `src/components/map/TrailLegend.tsx` | Update to include marker shape explanation |

---

## Priority Recommendation

For immediate impact, I recommend implementing in this order:

1. **Difficulty-colored markers** - Low effort, high clarity
2. **Bi-directional list-map sync** - Core UX improvement
3. **Hover previews** - Desktop polish
4. **Polyline highlighting** - Visual connection
5. **Clustering/labels** - Advanced refinement

---

## Technical Notes

### Marker Element Updates

The current `createTrailheadMarkerElement` function needs to accept a `difficulty` parameter:

```javascript
// Before
export function createTrailheadMarkerElement(isActive = false)

// After
export function createTrailheadMarkerElement(
  difficulty: TrailDifficulty = 'moderate',
  isActive = false
)
```

### State Lifting for Sync

The page needs to manage shared state:

```javascript
const [selectedTrailId, setSelectedTrailId] = useState<string | null>(null);
const [highlightedTrailId, setHighlightedTrailId] = useState<string | null>(null);
```

### Mapbox Event Handlers

For hover previews, attach to marker elements:

```javascript
el.addEventListener('mouseenter', () => showMiniTooltip(trail));
el.addEventListener('mouseleave', () => hideMiniTooltip());
```

