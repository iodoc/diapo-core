export default (diapo) => {
	const { mouseHiddenClass, mouseInactivityTimeout } = diapo.options;

	let hideMouseTimeoutId = null;

	const cleanUp = () => {
		diapo.container.classList.remove(mouseHiddenClass);
		clearTimeout(hideMouseTimeoutId);
		hideMouseTimeoutId = null;
	};

	const hideMouseIfInactive = () => {
		if (hideMouseTimeoutId !== null) {
			cleanUp();
		}

		hideMouseTimeoutId = setTimeout(() => {
			diapo.container.classList.add(mouseHiddenClass);
		}, mouseInactivityTimeout);
	};

	const initHideMouseIfInactiveModule = () => {
		diapo.container.addEventListener('mousemove', hideMouseIfInactive);
	};

	const destroyHideMouseIfInactiveModule = () => {
		diapo.container.removeEventListener('mousemove', hideMouseIfInactive);
		cleanUp();
	};

	const handleModeChange = () => {
		if (diapo.isFullMode) {
			initHideMouseIfInactiveModule();
		} else {
			destroyHideMouseIfInactiveModule();
		}
	};

	diapo.addEventListener('start', handleModeChange);
	diapo.addEventListener('modechange', handleModeChange);
};
