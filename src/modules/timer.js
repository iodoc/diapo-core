import parseTiming from './parse-timing.js';

export default (diapo) => {
	let id;

	const resetTimer = () => {
		clearTimeout(id);
		if (diapo.isListMode) return;

		const slide = diapo.activeSlide;
		const { visitCount, innerStepCount } = slide.state;
		if (visitCount > 1) return;

		const timing = parseTiming(slide.element.dataset.timing);
		if (!timing) return;

		if (innerStepCount) {
			const stepTiming = timing / (innerStepCount + 1);
			id = setInterval(() => diapo.next(), stepTiming);
		} else {
			id = setTimeout(() => diapo.next(), timing);
		}
	};

	diapo.addEventListener('start', resetTimer);
	diapo.addEventListener('modechange', resetTimer);
	diapo.addEventListener('slidechange', resetTimer);

	diapo.container.addEventListener('keydown', (event) => {
		if (!event.defaultPrevented) {
			clearTimeout(id);
		}
	});
};
