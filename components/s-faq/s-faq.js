const mounts = new WeakMap();

export function init(root) {
	if (mounts.has(root)) return;

	const items = [...root.querySelectorAll('[data-faq-item]')];
	if (!items.length) return;

	const mount = { active: true, observer: null };
	mounts.set(root, mount);

	root.dataset.faqReady = '';

	if (!('IntersectionObserver' in window)) {
		for (const item of items) item.dataset.faqVisible = '';
		return;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				observer.disconnect();
				mount.observer = null;
				items.forEach((item, i) => {
					setTimeout(() => {
						if (mount.active) item.dataset.faqVisible = '';
					}, i * 80);
				});
			}
		},
		{ threshold: 0.15 },
	);

	mount.observer = observer;
	observer.observe(root);
}

export function destroy(root) {
	const mount = mounts.get(root);
	if (!mount) return;
	mount.active = false;
	mount.observer?.disconnect();
	delete root.dataset.faqReady;
	mounts.delete(root);
}
