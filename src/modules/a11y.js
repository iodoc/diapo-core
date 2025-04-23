const createLiveRegion = () => {
	const liveRegion = document.createElement('section');
	liveRegion.className = 'region';
	liveRegion.setAttribute('role', 'region');
	liveRegion.setAttribute('aria-live', 'assertive');
	liveRegion.setAttribute('aria-relevant', 'all');
	liveRegion.setAttribute('aria-label', 'Slide Content: Auto-updating');
	return liveRegion;
};

export default (diapo) => {
	const { container } = diapo;
	const liveRegion = createLiveRegion();
	container.appendChild(liveRegion);

	const updateDocumentRole = () => {
		if (diapo.isFullMode) {
			container.setAttribute('role', 'application');
		} else {
			container.removeAttribute('role');
		}
	};

	const updateLiveRegion = () => {
		const slide = diapo.activeSlide;
		if (slide) {
			liveRegion.innerHTML = slide.element.innerHTML;
		}
	};

	diapo.addEventListener('start', () => {
		updateDocumentRole();
		updateLiveRegion();
	});

	diapo.addEventListener('modechange', updateDocumentRole);
	diapo.addEventListener('slidechange', updateLiveRegion);
};
