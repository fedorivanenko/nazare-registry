---
schemaVersion: 1

id: c-drag-scroll
title: Drag Scroll Utility
status: done

dependencies:
  - component-registry
  - component-add

surfaces:
  storefront:
    - scripts/snippets/c-drag-scroll.js

invariants:
  - Component ID is c-drag-scroll
  - Installs through nazare add c-drag-scroll
  - Pure JS utility — no Liquid, no DOM element required
  - Exported function: attachDrag(el, { onStart, onDelta, onEnd })
  - Returns a destroy() function that removes all listeners and cursor classes
  - Pointer capture is deferred until the drag threshold is crossed — plain clicks never trigger capture, so child buttons and interactive elements receive their full pointer and click event sequence
  - onStart fires when movement exceeds threshold, not on pointerdown; receives initialDx (the dx at the moment of confirmation) so callers can avoid a jump on the first onDelta tick
  - onDelta receives dx measured from the original pointerdown position (not incremental per move event)
  - click events fired after a drag are cancelled in capture phase; click events from plain taps pass through untouched
  - Does not own scroll or transform logic — callers provide onDelta to decide how to consume the drag delta
  - Works for both scrollLeft-based (static carousel) and transform-based (marquee) consumers

---

## Overview

Reusable pointer drag utility. Attaches pointer event listeners to an element and fires callbacks for drag lifecycle events. The caller is responsible for translating the delta into scroll or transform updates.

Pointer capture and `onStart` are intentionally deferred to the first `pointermove` that crosses the threshold. This keeps child interactive elements (buttons, video controls) fully functional — a tap never captures the pointer and never suppresses the resulting click.

## API

```js
import { attachDrag } from './c-drag-scroll.js';

const destroy = attachDrag(el, {
  onStart(initialDx) { /* fires when threshold is crossed; seed any prevDx state with initialDx */ },
  onDelta(dx) { /* fires every pointermove after threshold; dx = clientX - pointerdown startX */ },
  onEnd() { /* fires on pointerup / pointercancel after a confirmed drag */ },
});

destroy(); // removes all listeners, resets cursor classes
```

- `initialDx` in `onStart` equals the `dx` of the confirming `pointermove`; callers that track a previous-delta value should initialise it to `initialDx` to avoid a position jump on the first `onDelta` call
- `dx` in `onDelta` is the raw delta from the original `pointerdown` position (not incremental)
- `onEnd` only fires if a drag was confirmed; a plain click does not trigger `onStart` or `onEnd`
- Adds `cursor-grab` on attach; switches to `cursor-grabbing` while dragging

## Component metadata

```yaml
components:
  c-drag-scroll:
    version: 1.0.1-dev.0
    type: snippet
    dependencies: []
    files:
      - from: components/c-drag-scroll/c-drag-scroll.js
        to: scripts/snippets/c-drag-scroll.js
        checksum:
          algorithm: sha256
          value: 3ee270db4f7eb0facec7529d8ce76c4a26975ce137c2a9b352f5d2180ae4f208
```
