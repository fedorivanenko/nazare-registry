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
  - Cancels the click event in capture phase only when pointer has moved beyond threshold
  - Does not own scroll logic — callers provide onDelta to decide how to consume the drag delta
  - Works for both scrollLeft-based (static carousel) and transform-based (marquee) consumers

---

## Overview

Reusable pointer drag utility. Attaches pointer event listeners to an element and fires callbacks for drag lifecycle events. The caller is responsible for translating the delta into scroll or transform updates.

## API

```js
import { attachDrag } from './c-drag-scroll.js';

const destroy = attachDrag(el, {
  onStart() { /* called on pointerdown */ },
  onDelta(dx) { /* called on pointermove when hasMoved; dx = clientX - startX */ },
  onEnd() { /* called on pointerup / pointercancel */ },
});

destroy(); // removes all listeners, resets cursor classes
```

- `dx` is the raw delta from the initial `pointerdown` position (not incremental per move)
- A `click` event fired after a drag is cancelled in the capture phase so child interactive elements (buttons, videos) are not accidentally triggered
- Adds `cursor-grab` on attach; switches to `cursor-grabbing` while dragging

## Component metadata

```yaml
components:
  c-drag-scroll:
    version: 1.0.0-dev.0
    type: snippet
    dependencies: []
    files:
      - from: components/c-drag-scroll/c-drag-scroll.js
        to: scripts/snippets/c-drag-scroll.js
        checksum:
          algorithm: sha256
          value: 07dfdad506775630f4c5f8001a831b36ccaa028cb260b2926a247923dd7aaa19
```
