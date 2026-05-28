const mounts = new WeakMap();
const DURATION = 1000;

function easeOut(t) {
	return 1 - Math.pow(1 - t, 3);
}

function animate(el, target, suffix) {
	const start = performance.now();

	function tick(now) {
		const elapsed = now - start;
		const progress = Math.min(elapsed / DURATION, 1);
		const value = Math.round(easeOut(progress) * target);
		el.textContent = value + suffix;
		if (progress < 1) requestAnimationFrame(tick);
		else el.textContent = target + suffix;
	}

	requestAnimationFrame(tick);
}

export function init(root) {
	if (mounts.has(root)) return;

	const target = parseFloat(root.dataset.cStatTarget);
	const suffix = root.dataset.cStatSuffix ?? '';

	if (isNaN(target)) return;

	mounts.set(root, true);

	if (!('IntersectionObserver' in window)) {
		root.textContent = target + suffix;
		return;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				observer.disconnect();
				animate(root, target, suffix);
			}
		},
		{ threshold: 0.3 },
	);

	observer.observe(root);
}

export function destroy(root) {
	mounts.delete(root);
}
