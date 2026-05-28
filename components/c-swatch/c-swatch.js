const mounts = new WeakMap();

export function init(root) {
	if (mounts.has(root)) return;
	mounts.set(root, true);

	const label = root.querySelector('[data-c-swatch-label]');
	const buttons = root.querySelectorAll('[data-c-swatch-value]');

	const imageTarget = root.closest('[data-c-swatch-image]') ?? root.parentElement?.closest('[data-c-swatch-image]') ?? findAncestorImage(root);

	root.addEventListener('click', (e) => {
		const btn = e.target.closest('[data-c-swatch-value]');
		if (!btn) return;

		for (const b of buttons) {
			const active = b === btn;
			b.setAttribute('aria-pressed', String(active));
			b.classList.toggle('border-foreground', active);
			b.classList.toggle('border-transparent', !active);
		}

		if (label) label.textContent = btn.dataset.cSwatchValue;

		const variantImage = btn.dataset.variantImage;
		if (variantImage && imageTarget) {
			imageTarget.src = variantImage;
			const srcset = imageTarget.getAttribute('srcset');
			if (srcset) imageTarget.removeAttribute('srcset');
		}
	});
}

function findAncestorImage(root) {
	let el = root.parentElement;
	while (el) {
		const img = el.querySelector('[data-c-swatch-image]');
		if (img) return img;
		el = el.parentElement;
	}
	return null;
}

export function destroy(root) {
	mounts.delete(root);
}
