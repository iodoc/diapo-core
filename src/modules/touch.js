export default (diapo) => {
	let exitFullScreen = false;
	let clickable = false;

	document.addEventListener('touchstart', (event) => {
		if (event.touches.length === 1) {
			const touch = event.touches[0];
			const x = touch.clientX;
			const { target } = touch;
			clickable = target.tabIndex !== -1;
			if (!clickable) {
				if (diapo.isFullMode) {
					if (event.cancelable) event.preventDefault();
					if (window.innerWidth / 2 < x) {
						diapo.next();
					} else {
						diapo.prev();
					}
				}
			}
		} else if (event.touches.length === 3) {
			exitFullScreen = true;
		}
	});

	diapo.container.addEventListener('touchend', (event) => {
		if (exitFullScreen) {
			event.preventDefault();
			exitFullScreen = false;
			diapo.exitFullMode();
		} else if (event.touches.length === 1 && !clickable && diapo.isFullMode)
			event.preventDefault();
	});
};
