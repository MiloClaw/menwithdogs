

# Plan: FAQ Page — Refined & Aligned

## Summary

Complete refresh of FAQ content to align with harmonized messaging. All answers will describe current features, avoid absolutist language that blocks future features, and emphasize place-based intelligence over social outcomes.

---

## Principles Applied

- **Describe what exists now**, not promises
- **Avoid absolutist language** that blocks future features
- **Be clear, not defensive**
- **Use "designed for" instead of "only for"** when possible
- **Emphasize place-based intelligence** over social outcomes

---

## Section-by-Section Changes

### 01 — The Directory

| Question | Current Issue | Refinement |
|----------|---------------|------------|
| "What is this platform, exactly?" | Uses "It's not a social network" defensively | Positive framing: describes what it IS |
| "How do I use it?" | Missing contribution angle | Adds "contribute new places" and PRO mention |
| "Is this a social network?" | Too rigid ("No profiles. No feeds. No DMs.") | Softer: "designed as a real-world discovery tool" |

**New Q&A:**

```tsx
{
  question: "What is ThickTimber, exactly?",
  answer: [
    "ThickTimber is a place-based directory designed to help men connect more organically through shared interests, outdoor activities, and the real places where their community gathers.",
    "Instead of centering interaction around profiles or feeds, the directory highlights trails, campsites, beaches, and outdoor spaces based on where people actually go and return to over time."
  ]
},
{
  question: "How do I use the directory?",
  answer: [
    "You browse outdoor places in your area, save the ones you enjoy, and optionally contribute new places you think others would appreciate.",
    "As you use the directory, recommendations quietly refine—based on shared patterns across the community and, if you choose PRO, your private preferences."
  ]
},
{
  question: "Is this a social network or dating app?",
  answer: [
    "No. ThickTimber is designed as a real-world discovery tool.",
    "While it can support connection by helping you understand where your community gathers, it doesn't revolve around browsing people, feeds, or public profiles. Interaction is optional and centered around places, not performance."
  ]
}
```

---

### 02 — Personalization & Intelligence

| Question | Current Issue | Refinement |
|----------|---------------|------------|
| "How does personalization work?" | Doesn't mention PRO clearly | Separates Free (community) from PRO (private) |
| "What data do you use?" | Missing structured list | Clearer with bullet-style list |
| "What's the difference..." | Good, but slightly long | Tightened to three focused paragraphs |

**New Q&A:**

```tsx
{
  question: "How does personalization work?",
  answer: [
    "The free directory reflects community-level patterns—highlighting places people tend to enjoy and return to.",
    "If you subscribe to PRO, you can add more context privately, such as outdoor interests, activity preferences, or routines. This helps the directory surface places that align more closely with how you like to spend your time."
  ]
},
{
  question: "What data does the system use?",
  answer: [
    "The system uses: places saved or contributed, general usage patterns at the community level, and optional preferences you choose to add privately (PRO).",
    "It does not use public profiles, social graphs, or advertising data."
  ]
},
{
  question: "What's the difference between Free and PRO?",
  answer: [
    "Free gives you full access to the directory, powered by shared community behavior.",
    "PRO adds private tuning—helping the directory understand your specific interests more precisely so recommendations align more closely with you.",
    "Both contribute to making the directory better. PRO simply makes it more precise for the individual."
  ]
}
```

---

### 03 — Privacy & Trust

| Question | Current Issue | Refinement |
|----------|---------------|------------|
| "Are my preferences visible..." | Says "Pro preferences" only | Expands to all saved places and preferences |
| "Do you share my data?" | Could be more specific | Adds: no ad networks, no surveillance |
| "Can other users see..." | Good, minor polish | Adds clarity about aggregate patterns |

**New Q&A:**

```tsx
{
  question: "Are my preferences visible to other users?",
  answer: [
    "No. Your saved places and preferences are never visible to others.",
    "Even when using PRO, your information is used only to refine recommendations for you. There are no public profiles or exposed activity."
  ]
},
{
  question: "Do you sell or share my data?",
  answer: [
    "No. ThickTimber does not sell user data, share it with ad networks, or use it for targeted advertising.",
    "The platform is designed to operate without social metrics or surveillance-based incentives."
  ]
},
{
  question: "Can other users see where I go or what I save?",
  answer: [
    "No. The directory reflects shared patterns at a high level, not individual behavior.",
    "Your activity remains private."
  ]
}
```

---

### 04 — Community & Inclusion

| Question | Current Issue | Refinement |
|----------|---------------|------------|
| "Who is this platform for?" | "friendship-only connections" too rigid | "designed specifically for gay men" + outdoor focus |
| "Is this a dating or hookup app?" | "by design" feels defensive | Softer: "doesn't facilitate" + respects offline autonomy |
| "Why is the platform focused..." | Good but could be clearer | Emphasizes language, privacy, safety, place types |
| LGBTQ+ question | Remove | Consolidates into expansion question |
| "Will you expand..." | Too certain ("Yes. Once we have...") | Softer: "Possibly. If ThickTimber expands..." |
| "Can single men and couples..." | Mentions "profile" and "platonic friendship" | Removes profile mention, focuses on places |

**New Q&A (restructured):**

```tsx
{
  question: "Who is ThickTimber designed for?",
  answer: [
    "ThickTimber is currently designed specifically for gay men who enjoy outdoor and active lifestyles.",
    "This focus allows the directory, language, and intelligence to reflect the needs, experiences, and cultural context of that community."
  ]
},
{
  question: "Is this platform open to single men, couples, or friends?",
  answer: [
    "Yes. Single men, couples, and friends all use the directory in different ways—whether exploring individually or planning experiences together.",
    "The platform is designed around places, not relationship status."
  ]
},
{
  question: "Is this a hookup or dating platform?",
  answer: [
    "No. ThickTimber doesn't facilitate dating or sexual interaction.",
    "It's built to support real-world discovery and organic connection through shared interests and places. What happens offline is always up to the individuals involved."
  ]
},
{
  question: "Why focus specifically on gay men?",
  answer: [
    "Community forms differently across cultures and identities.",
    "By focusing on gay men, ThickTimber can be intentional about language, privacy expectations, safety, and the types of places highlighted—rather than trying to be everything to everyone.",
    "This focus allows the platform to work better for the people it's designed for."
  ]
},
{
  question: "Will you expand to other communities in the future?",
  answer: [
    "Possibly.",
    "If ThickTimber expands, it will do so intentionally—designing each version around the specific needs, values, and contexts of that community, rather than applying a one-size-fits-all approach."
  ]
}
```

**Removed question:** "Is this platform open to the broader LGBTQ+ community?" — consolidated into the expansion question.

---

### Still Have Questions CTA (Minor Polish)

| Element | Current | New |
|---------|---------|-----|
| Subtext | "We're here to help. Reach out and we'll get back to you." | "We're happy to help. Reach out anytime." |

---

## Technical Implementation Summary

| Section | Line Range | Change Type |
|---------|------------|-------------|
| Section 01 items | 25-47 | Full content replacement (3 Q&As) |
| Section 02 items | 51-74 | Full content replacement (3 Q&As) |
| Section 03 items | 78-100 | Full content replacement (3 Q&As) |
| Section 04 items | 104-147 | Full restructure (5 Q&As, removed 1) |
| CTA subtext | 284-285 | Text polish |

---

## Key Messaging Improvements

| Before | After |
|--------|-------|
| "It's not a social network" | "Designed as a real-world discovery tool" |
| "This is not a dating app" | "Doesn't facilitate dating or sexual interaction" |
| "Dating...is not part of this platform — by design" | "What happens offline is up to the individuals involved" |
| "Yes. Once we have successfully developed..." | "Possibly. If ThickTimber expands..." |
| "friendship-only connections" | "organic connection through shared interests" |
| "No profiles. No feeds. No DMs." | Removed rigid framing |

---

## Guardrails Applied

- Removed all "not a dating app / not a social network" defensiveness
- Changed "only for" language to "designed for"
- Softened future expansion commitment from certainty to possibility
- Added autonomy-respecting language ("What happens offline...")
- Kept privacy promises accurate and verifiable
- Removed the LGBTQ+ question (consolidates into expansion question)

---

## Net Result

The FAQ now:
- Describes actual current features
- Avoids blocking future social/connection features
- Uses "designed for" framing consistently
- Emphasizes place-based intelligence
- Maintains trust without defensiveness
- Functions as onboarding support + legal-adjacent clarity

