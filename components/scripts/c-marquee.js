import { signal } from "reefjs";

const stripEditorAttributes = (node) => {
	for (const element of [node, ...node.querySelectorAll("*")]) {
		for (const attribute of [...element.attributes]) {
			if (attribute.name.startsWith("data-shopify-editor")) {
				element.removeAttribute(attribute.name);
			}
		}
	}
};

const initMarquee = (root, index) => {
	const track = root.querySelector("[data-marquee-track]");

	if (
		!track ||
		track.children.length === 0 ||
		root.dataset.marqueeReady === "true"
	) {
		return;
	}

	root.dataset.marqueeReady = "true";

	const marqueeState = signal(
		{
			isDragging: false,
			isHovered: false,
		},
		`c-marquee-${index}`,
	);

	const speed = Number(root.dataset.marqueeSpeed || 35);
	const playOnHover = root.dataset.marqueePlayOnHover === "true";
	const originals = [...track.children];
	let contentWidth = 0;
	let offset = 0;
	let velocity = 0;
	let lastFrame = performance.now();
	let lastPointerX = 0;
	let lastPointerTime = 0;
	let pointerStartX = 0;
	let pointerStartY = 0;
	let pointerAxis = null;
	let didDrag = false;
	let suppressClickUntil = 0;
	let pointerId = null;

	const disableNativeMediaDrag = () => {
		for (const element of root.querySelectorAll("img, video")) {
			element.draggable = false;
		}
	};

	const cloneItems = () => {
		for (const clone of track.querySelectorAll("[data-marquee-clone]")) {
			clone.remove();
		}

		for (let repeat = 0; repeat < 3; repeat += 1) {
			for (const item of originals) {
				const clone = item.cloneNode(true);
				clone.dataset.marqueeClone = "true";
				clone.setAttribute("aria-hidden", "true");
				stripEditorAttributes(clone);
				track.append(clone);
			}
		}
	};

	const measure = () => {
		contentWidth = originals.reduce((total, item) => {
			const styles = window.getComputedStyle(track);
			const gap = Number.parseFloat(styles.columnGap || styles.gap || 0);
			return total + item.getBoundingClientRect().width + gap;
		}, 0);
	};

	const wrap = () => {
		if (contentWidth <= 0) {
			return;
		}

		while (offset <= -contentWidth) {
			offset += contentWidth;
		}

		while (offset > 0) {
			offset -= contentWidth;
		}
	};

	const shouldAutoPlay = () => !playOnHover || marqueeState.isHovered;

	const tick = (time) => {
		const delta = Math.min((time - lastFrame) / 1000, 0.05);
		lastFrame = time;

		if (!marqueeState.isDragging && shouldAutoPlay()) {
			offset -= speed * delta;
		}

		if (!marqueeState.isDragging && Math.abs(velocity) > 0.1) {
			offset += velocity * delta;
			velocity *= 0.94;
		}

		wrap();
		track.style.transform = `translate3d(${offset}px, 0, 0)`;
		requestAnimationFrame(tick);
	};

	cloneItems();
	disableNativeMediaDrag();
	measure();

	root.addEventListener("pointerenter", () => {
		marqueeState.isHovered = true;
	});

	root.addEventListener("pointerleave", () => {
		marqueeState.isHovered = false;
	});

	root.addEventListener("pointerdown", (event) => {
		marqueeState.isDragging = true;
		pointerId = event.pointerId;
		pointerStartX = event.clientX;
		pointerStartY = event.clientY;
		lastPointerX = event.clientX;
		lastPointerTime = performance.now();
		pointerAxis = null;
		didDrag = false;
		velocity = 0;
		root.setPointerCapture(pointerId);
	});

	root.addEventListener("pointermove", (event) => {
		if (!marqueeState.isDragging || pointerId !== event.pointerId) {
			return;
		}

		const now = performance.now();
		const deltaX = event.clientX - lastPointerX;
		const totalX = event.clientX - pointerStartX;
		const totalY = event.clientY - pointerStartY;
		const deltaTime = Math.max(now - lastPointerTime, 16);
		const distance = Math.hypot(totalX, totalY);

		if (!pointerAxis && distance > 5) {
			pointerAxis = Math.abs(totalX) > Math.abs(totalY) ? "x" : "y";
		}

		if (pointerAxis !== "x") {
			return;
		}

		if (event.cancelable) {
			event.preventDefault();
		}

		didDrag = true;
		offset += deltaX;
		velocity = (deltaX / deltaTime) * 1000;
		lastPointerX = event.clientX;
		lastPointerTime = now;
	});

	const endDrag = (event) => {
		if (pointerId !== event.pointerId) {
			return;
		}

		marqueeState.isDragging = false;

		if (didDrag) {
			suppressClickUntil = performance.now() + 400;
		}

		root.releasePointerCapture(pointerId);
		pointerId = null;
	};

	root.addEventListener("pointerup", endDrag);
	root.addEventListener("pointercancel", endDrag);
	root.addEventListener(
		"click",
		(event) => {
			if (performance.now() > suppressClickUntil) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
		},
		true,
	);
	root.addEventListener("dragstart", (event) => event.preventDefault());

	root.addEventListener(
		"wheel",
		(event) => {
			const isHorizontalGesture =
				Math.abs(event.deltaX) > Math.abs(event.deltaY);
			const rawDelta = isHorizontalGesture ? event.deltaX : event.deltaY;

			if (rawDelta === 0) {
				return;
			}

			event.preventDefault();
			const delta = -rawDelta;
			offset += delta;
			velocity = delta * 4;
		},
		{ passive: false },
	);

	window.addEventListener("resize", measure);
	requestAnimationFrame(tick);
};

export const initCMarquees = () => {
	document.querySelectorAll("[data-marquee]").forEach(initMarquee);
};
