const mdash = '\u2014';

export default (diapo) => {
	const { title } = document;
	const updateTitle = () => {
		if (diapo.isFullMode) {
			const slide = diapo.activeSlide;
			const slideTitle = slide.title;
			if (slideTitle) {
				document.title = `${slideTitle} ${mdash} ${title}`;
				return;
			}
		}

		document.title = title;
	};

	diapo.addEventListener('start', updateTitle);
	diapo.addEventListener('modechange', updateTitle);
	diapo.addEventListener('slidechange', updateTitle);
};
