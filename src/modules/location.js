export default (diapo) => {
	const composeURL = () => {
		const search = diapo.isFullMode ? '?full' : '';
		const slide = diapo.activeSlide;
		const hash = slide ? `#${slide.id}` : '';

		return location.pathname + search + hash; // path is required to clear search params
	};

	const applyURLMode = () => {
		const isFull = new URLSearchParams(location.search).has('full');
		if (isFull) {
			diapo.enterFullMode();
		} else {
			diapo.exitFullMode();
		}
	};

	const applyURLSlide = () => {
		const id = location.hash.slice(1);
		if (!id) return;

		const target = diapo.slides.find((slide) => slide.id === id);
		if (target) {
			target.activate();
		} else if (!diapo.activeSlide) {
			diapo.first(); // invalid hash
		}
	};

	const applyURL = () => {
		applyURLMode();
		applyURLSlide();
	};

	applyURL();
	window.addEventListener('popstate', applyURL);

	diapo.addEventListener('start', () => {
		history.replaceState(null, document.title, composeURL());
	});

	diapo.addEventListener('modechange', () => {
		history.replaceState(null, document.title, composeURL());
	});

	diapo.addEventListener('slidechange', () => {
		const url = composeURL();
		if (!location.href.endsWith(url)) {
			history.pushState(null, document.title, url);
		}
	});
};
