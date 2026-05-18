const createVideoStore = () => {
	const roots = new Set();

	return {
		register(root) {
			roots.add(root);
		},
		unregister(root) {
			roots.delete(root);
		},
		muteOthers(activeRoot) {
			for (const root of roots) {
				if (root === activeRoot) {
					continue;
				}

				const video = root.querySelector("video");

				if (video) {
					video.muted = true;
				}
			}
		},
	};
};

const getVideoStore = () => {
	window.NazareVideoStore = window.NazareVideoStore || createVideoStore();
	return window.NazareVideoStore;
};

const initializedRoots = new WeakSet();
let videosObserver = null;

const initVideo = (root) => {
	if (initializedRoots.has(root)) {
		return;
	}

	const video = root.querySelector("video");
	const playToggle = root.querySelector("[data-video-play-toggle]");
	const muteToggle = root.querySelector("[data-video-mute-toggle]");
	const playIcon = root.querySelector("[data-video-play-icon]");
	const pauseIcon = root.querySelector("[data-video-pause-icon]");
	const muteIcon = root.querySelector("[data-video-mute-icon]");
	const unmuteIcon = root.querySelector("[data-video-unmute-icon]");
	const playLabel = root.querySelector("[data-video-play-label]");
	const muteLabel = root.querySelector("[data-video-mute-label]");

	if (!video) {
		return;
	}

	initializedRoots.add(root);
	getVideoStore().register(root);

	const syncPlayState = () => {
		if (!playToggle) {
			return;
		}

		const isPlaying = !video.paused && !video.ended;
		playToggle.setAttribute(
			"aria-label",
			isPlaying ? "Pause video" : "Play video",
		);
		playToggle.setAttribute("aria-pressed", String(isPlaying));
		playIcon?.classList.toggle("hidden", isPlaying);
		pauseIcon?.classList.toggle("hidden", !isPlaying);

		if (playLabel) {
			playLabel.textContent = isPlaying ? "Pause video" : "Play video";
		}
	};

	const syncMuteState = () => {
		if (!muteToggle) {
			return;
		}

		muteToggle.setAttribute(
			"aria-label",
			video.muted ? "Unmute video" : "Mute video",
		);
		muteToggle.setAttribute("aria-pressed", String(!video.muted));
		muteIcon?.classList.toggle("hidden", video.muted);
		unmuteIcon?.classList.toggle("hidden", !video.muted);

		if (muteLabel) {
			muteLabel.textContent = video.muted ? "Unmute video" : "Mute video";
		}
	};

	playToggle?.addEventListener("click", () => {
		if (video.paused || video.ended) {
			video.play().catch(() => {});
			return;
		}

		video.pause();
	});

	muteToggle?.addEventListener("click", () => {
		video.muted = !video.muted;

		if (!video.muted) {
			getVideoStore().muteOthers(root);
		}

		syncMuteState();
	});

	video.addEventListener("play", syncPlayState);
	video.addEventListener("pause", syncPlayState);
	video.addEventListener("ended", syncPlayState);
	video.addEventListener("volumechange", () => {
		if (!video.muted) {
			getVideoStore().muteOthers(root);
		}

		syncMuteState();
	});

	if (root.dataset.videoAutoplay === "true") {
		video.play().catch(() => {});
	}

	syncPlayState();
	syncMuteState();
};

const forEachVideoRoot = (node, callback) => {
	if (!(node instanceof HTMLElement)) {
		return;
	}

	if (node.matches("[data-video]")) {
		callback(node);
	}

	node.querySelectorAll("[data-video]").forEach(callback);
};

export const initCVideos = () => {
	document.querySelectorAll("[data-video]").forEach(initVideo);

	if (videosObserver) {
		return;
	}

	videosObserver = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			for (const node of mutation.addedNodes) {
				forEachVideoRoot(node, initVideo);
			}

			for (const node of mutation.removedNodes) {
				forEachVideoRoot(node, (root) => getVideoStore().unregister(root));
			}
		}
	});

	videosObserver.observe(document.documentElement, {
		childList: true,
		subtree: true,
	});
};
