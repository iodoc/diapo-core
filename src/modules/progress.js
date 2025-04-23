export default (diapo) => {
	const { progressSelector } = diapo.options;
	const bar = diapo.container.querySelector(progressSelector);
	if (!bar) return;

	bar.setAttribute('role', 'progressbar');
	bar.setAttribute('aria-valuemin', 0);
	bar.setAttribute('aria-valuemax', 100);

	const updateProgress = () => {
		const index = diapo.activeSlideIndex;
		const { length } = diapo.slides;
		const progress = (index / (length - 1)) * 100;

		bar.style.width = `${progress}%`;
		bar.setAttribute('aria-valuenow', progress);
		bar.setAttribute('aria-valuetext', `Slideshow progress: ${progress}%`);
	};

	diapo.addEventListener('start', updateProgress);
	diapo.addEventListener('slidechange', updateProgress);
};
