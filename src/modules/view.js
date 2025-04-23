export default (diapo) => {
	const { container } = diapo;
	const { fullModeClass, listModeClass } = diapo.options;

	if (container.classList.contains(fullModeClass)) {
		diapo.enterFullMode();
	} else {
		container.classList.add(listModeClass);
	}

	const updateScale = () => {
		const firstSlide = diapo.slides[0];
		if (!firstSlide) return;

		const { innerWidth, innerHeight } = window;
		const { offsetWidth, offsetHeight } = firstSlide.element;

		const listScale = 1 / (offsetWidth / innerWidth);
		const fullScale = 1 / Math.max(offsetWidth / innerWidth, offsetHeight / innerHeight);

		container.style.setProperty('--diapo-list-scale', listScale);
		container.style.setProperty('--diapo-full-scale', fullScale);
	};

	const updateModeView = () => {
		if (diapo.isFullMode) {
			container.classList.remove(listModeClass);
			container.classList.add(fullModeClass);
		} else {
			container.classList.remove(fullModeClass);
			container.classList.add(listModeClass);
		}

		updateScale();

		if (diapo.isFullMode) return;

		const slide = diapo.activeSlide;
		if (slide) {
			slide.element.scrollIntoView({ block: 'center' });
		}
	};

	diapo.addEventListener('start', updateModeView);
	diapo.addEventListener('modechange', updateModeView);
	diapo.addEventListener('slidechange', () => {
		if (diapo.isFullMode) return;

		const slide = diapo.activeSlide;
		slide.element.scrollIntoView({ block: 'nearest' });
	});

	window.addEventListener('resize', updateScale);
};
