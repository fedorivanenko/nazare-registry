const accountGate = document.querySelector("[data-account-gate]");

if (accountGate) {
	const syncState = () => {
		accountGate.classList.toggle(
			"is-account-recover-active",
			window.location.hash === "#recover" ||
				Boolean(accountGate.querySelector(".account-gate__message--success")),
		);
	};

	document.addEventListener("click", (event) => {
		const toggle = event.target.closest("[data-account-gate-toggle]");

		if (!toggle || !accountGate.contains(toggle)) {
			return;
		}

		event.preventDefault();

		const nextHash = toggle.getAttribute("data-account-gate-toggle");

		if (nextHash === "#recover") {
			window.location.hash = nextHash;
			syncState();
			return;
		}

		window.history.replaceState(
			{},
			"",
			`${window.location.pathname}${window.location.search}`,
		);
		syncState();
	});

	window.addEventListener("hashchange", syncState);
	syncState();
}
