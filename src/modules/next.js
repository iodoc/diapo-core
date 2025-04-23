export default (diapo) => {
	const { stepSelector, activeSlideClass, visitedSlideClass } = diapo.options;

	let innerSteps;
	let activeIndex;

	const isActive = (step) => step.classList.contains(activeSlideClass);
	const isVisited = (step) => step.classList.contains(visitedSlideClass);

	const setInnerStepsState = () => {
		if (diapo.isListMode) return;

		const slide = diapo.activeSlide;

		innerSteps = [...slide.element.querySelectorAll(stepSelector)];
		activeIndex =
			innerSteps.length && innerSteps.every(isVisited)
				? innerSteps.length
				: innerSteps.filter(isActive).length - 1;

		slide.state.innerStepCount = innerSteps.length;
	};

	diapo.addEventListener('start', setInnerStepsState);
	diapo.addEventListener('modechange', setInnerStepsState);
	diapo.addEventListener('slidechange', setInnerStepsState);

	diapo.addEventListener('next', (event) => {
		if (diapo.isListMode || event.defaultPrevented || !event.cancelable) return;

		activeIndex++;
		innerSteps.forEach((step, index) => {
			step.classList.toggle(visitedSlideClass, index < activeIndex);
			step.classList.toggle(activeSlideClass, index === activeIndex);
		});

		if (activeIndex < innerSteps.length) {
			event.preventDefault();
		}
	});

	diapo.addEventListener('prev', (event) => {
		if (diapo.isListMode || event.defaultPrevented || !event.cancelable) return;
		if (activeIndex === -1 || activeIndex === innerSteps.length) return;

		activeIndex--;
		innerSteps.forEach((step, index) => {
			step.classList.toggle(visitedSlideClass, index < activeIndex + 1);
			step.classList.toggle(activeSlideClass, index === activeIndex);
		});

		event.preventDefault();
	});
};
