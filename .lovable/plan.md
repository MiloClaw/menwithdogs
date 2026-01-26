

# Settings Page Intelligence Audit — Redundancy & Gap Analysis

## Summary

After reviewing all preference questions across the Settings page, I've identified **6 redundancies** where similar questions are asked in multiple places, and **2 potential gaps** where the intelligence system could benefit from additional signals.

---

## Current Architecture (4 Layers)

```text
┌─────────────────────────────────────────────────────────────────┐
│  Layer 1: TOP-LEVEL FREE PREFERENCES                           │
│  ─────────────────────────────────────────────────────────────  │
│  Profile Basics, Distance, Time of Day, Geo Affinity,          │
│  Activities, Place Usage, Timing, Openness                     │
│  → Stored in user_preferences table                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Layer 2: INTENT GRID (Free)                                   │
│  ─────────────────────────────────────────────────────────────  │
│  "What draws you outside?" — 7 category options                 │
│  → Stored in user_preferences.intent_preferences               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Layer 3: HOW YOU EXPLORE (Collapsible Phase 3)                │
│  ─────────────────────────────────────────────────────────────  │
│  Adventure Style, Trail Companions, Effort Preference,         │
│  Weather Flexibility, Gear Readiness, Nature Priorities        │
│  → Stored in repurposed user_preferences columns               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Layer 4: PRO "SPACES THAT FEEL RIGHT" (Paid/Preview)          │
│  ─────────────────────────────────────────────────────────────  │
│  Step 1: Age, Relationship, Experience (overlap mode)          │
│  Step 2: Social, Pace, Crowds (boost mode)                     │
│  Step 3: Connection Intent, Vibe (boost mode)                  │
│  Step 4: Activities (boost mode)                               │
│  → Stored as user_signals with pro_selection type              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Redundancies Identified

### 1. Activities — Asked Twice

| Free Section | PRO Section |
|--------------|-------------|
| `ActivitiesSection`: Walking/hiking, Running, Gym, Climbing, Swimming, Camping, Casual outdoor | PRO Step 4: Hiking, Running, Cycling, Outdoor Fitness, Swimming, Climbing, Paddling, Winter Sports, Photography |

**Problem:** User sees overlapping activity questions. PRO version is more comprehensive with Google Place type mappings that power the affinity engine.

**Recommendation:** Hide `ActivitiesSection` (Layer 1) when PRO Step 4 has selections, or remove it entirely since PRO covers this better with intelligence integration.

---

### 2. Timing — Asked Twice

| Free Section | Also Free Section |
|--------------|-------------------|
| `TimeOfDaySection` (single-select): Dawn, Daytime, Golden hour, Flexible | `TimingSection` (multi-select): Early mornings, Late mornings, Afternoons, Evenings, Weekdays, Weekends |

**Problem:** Two timing questions with overlapping concepts (dawn ≈ early mornings, daytime ≈ afternoons).

**Recommendation:** Consolidate into one section. Keep single-select `TimeOfDaySection` (powers opening hours boost) and remove multi-select `TimingSection`, OR merge them logically.

---

### 3. Social Style — Asked Three Times

| Location | Question |
|----------|----------|
| `OpennessSection` | "Keep to myself", "Comfortable with familiar faces", "Open to meeting others" |
| `TrailCompanionsSection` (Phase 3) | "Usually solo", "With 1-2 close friends", "Larger groups" |
| PRO Step 2 `style.social` | "Solo seeker", "Small crew", "The more the merrier" |

**Problem:** Three places asking essentially the same question about social preferences.

**Recommendation:**
- Keep PRO `style.social` (powers place rankings)
- Consider conditional logic: hide `TrailCompanionsSection` when PRO Step 2 is answered
- Refocus `OpennessSection` purely on "openness to meeting new people" (connection intent)

---

### 4. Pace/Effort — Asked Twice

| Free Section | PRO Section |
|--------------|-------------|
| `EffortPreferenceSection` (Phase 3): Easy, Moderate, Strenuous, Varies | PRO Step 2 `style.pace`: Slow and scenic, Balanced, Fast and intense |

**Problem:** Overlapping intensity/pace questions.

**Recommendation:** Hide `EffortPreferenceSection` when PRO Step 2 `style.pace` is selected, or consolidate.

---

### 5. Intent/Vibe — Asked Twice

| Free Section | PRO Section |
|--------------|-------------|
| `INTENT_PROMPT` grid: Trails, Campgrounds, Water, Scenic, Outdoor fitness, Wildlife, Provisions | PRO Step 3 `intent.vibe`: Quiet contemplation, Adventure, Learning, Accomplishment |

**Problem:** Both sections ask "what draws you outside" with different framings. The free grid focuses on *place categories*, while PRO focuses on *emotional intent*.

**Recommendation:** These are actually complementary, not redundant. Keep both — the free grid powers category filtering while PRO powers affinity scoring.

---

### 6. Crowd Preference — Partially Redundant

| Location | Question |
|----------|----------|
| PRO Step 2 `style.crowds` | "Avoid crowds", "Don't mind them", "Energy of a crowd" |
| `NaturePrioritiesSection` option | "Solitude & quiet" |

**Problem:** Crowd preference appears in both PRO Step 2 and as a nature priority option.

**Recommendation:** This is acceptable — different contexts (general crowd tolerance vs. nature-specific solitude seeking). No action needed.

---

## Intelligence Gaps Identified

### Gap 1: Accessibility Needs

**Current state:** No question about accessibility requirements (wheelchair access, stroller-friendly, etc.)

**Impact:** Cannot boost accessible trails/parks for users who need them.

**Recommendation:** Add to PRO Step 1 (identity/overlap mode) or Phase 3 as single-select:
- "I need accessible paths/trails"
- "Stroller-friendly spots"
- "No special requirements"

### Gap 2: Seasonal Activity Preference

**Current state:** No question about seasonal preferences.

**Impact:** Cannot recommend winter vs. summer activities intelligently.

**Recommendation:** Consider adding to PRO Step 4 or Phase 3:
- "I'm most active in: Spring / Summer / Fall / Winter / Year-round"

---

## Recommended Changes

### Priority 1: Consolidate Timing (Quick Win)
Remove `TimingSection` (multi-select early/late mornings, weekdays/weekends) since `TimeOfDaySection` (single-select dawn/daytime/golden hour) already captures the primary signal.

### Priority 2: Add Conditional Hiding for Redundant Sections
When PRO Step 2 has `style.social` selected:
- Add subtle visual indicator to `TrailCompanionsSection` that it's "covered by PRO"
- Or hide it entirely to reduce cognitive load

When PRO Step 4 has activity selections:
- Consider hiding/dimming `ActivitiesSection` to avoid re-answering

### Priority 3: Rename for Clarity
- `OpennessSection` → Focus on "Openness to meeting new people" (connection readiness)
- This differentiates it from `TrailCompanionsSection` (who you go with) and PRO `style.social` (group size preference)

### Priority 4: Future — Add Accessibility Question
Add to PRO Step 1 with `influence_mode = 'overlap'`:
```sql
INSERT INTO pro_context_definitions (key, label, section, step, influence_mode)
VALUES 
  ('acc_standard', 'No accessibility needs', 'about.accessibility', 1, 'overlap'),
  ('acc_wheelchair', 'Wheelchair/mobility accessible', 'about.accessibility', 1, 'overlap'),
  ('acc_stroller', 'Stroller-friendly preferred', 'about.accessibility', 1, 'overlap');
```

---

## Files to Modify

| Action | File | Purpose |
|--------|------|---------|
| Remove | `src/components/profile/TimingSection.tsx` | Consolidate with TimeOfDaySection |
| Modify | `src/components/settings/SettingsPreferencesTab.tsx` | Remove TimingSection import/usage |
| Modify | `src/components/profile/OpennessSection.tsx` | Rename/refocus copy |
| Consider | `src/components/profile/ActivitiesSection.tsx` | Add conditional hiding when PRO Step 4 answered |
| Future | Database migration | Add accessibility options to PRO Step 1 |

---

## Summary Decision Matrix

| Redundancy | Action | Effort |
|------------|--------|--------|
| Activities (free vs PRO) | Conditional hide or remove | Medium |
| Timing (two sections) | Remove `TimingSection` | Low |
| Social (three sections) | Rename/refocus `OpennessSection` | Low |
| Pace/Effort | Conditional hide | Medium |
| Intent/Vibe | Keep both (complementary) | None |
| Crowds | Keep both (different contexts) | None |

