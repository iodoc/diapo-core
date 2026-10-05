//#region src/default-options.js
var default_options_default = {
	containerSelector: ".diapo",
	progressSelector: ".progress",
	stepSelector: ".next",
	fullModeClass: "full",
	listModeClass: "list",
	mouseHiddenClass: "pointless",
	mouseInactivityTimeout: 5e3,
	slideSelector: ".slide",
	slideTitleSelector: "h2",
	activeSlideClass: "active",
	visitedSlideClass: "visited"
};
//#endregion
//#region src/utils.js
var isInteractiveElement = (element) => element.tabIndex !== -1;
var defineReadOnly = (target, props) => {
	for (const [key, value] of Object.entries(props)) Object.defineProperty(target, key, {
		value,
		writable: false,
		enumerable: true,
		configurable: true
	});
};
var DiapoError = class extends Error {};
//#endregion
//#region src/slide.js
var Slide = class extends EventTarget {
	/**
	* @param {Diapo} diapo
	* @param {HTMLElement} element
	*/
	constructor(diapo, element) {
		super();
		defineReadOnly(this, {
			diapo,
			element,
			state: {
				visitCount: 0,
				innerStepCount: 0
			}
		});
		this._isActive = false;
		this._options = this.diapo.options;
		this.element.addEventListener("click", (event) => {
			if (event.defaultPrevented) return;
			this.activate();
			this.diapo.enterFullMode();
		});
	}
	get isActive() {
		return this._isActive;
	}
	get isVisited() {
		return this.state.visitCount > 0;
	}
	get id() {
		return this.element.id;
	}
	get title() {
		const titleElement = this.element.querySelector(this._options.slideTitleSelector);
		return titleElement ? titleElement.innerText : "";
	}
	/**
	* Deactivates currently active slide (if any) and activates itself.
	* @emits Slide#deactivate
	* @emits Slide#activate
	* @emits Diapo#slidechange
	*/
	activate() {
		if (this._isActive) return;
		const prev = this.diapo.activeSlide;
		if (prev) prev._deactivate();
		this.state.visitCount++;
		this.element.classList.add(this._options.activeSlideClass);
		this._isActive = true;
		this.dispatchEvent(new Event("activate"));
		this.diapo.dispatchEvent(new CustomEvent("slidechange", { detail: { prev } }));
	}
	/**
	* @throws {DiapoError}
	* @emits Slide#deactivate
	*/
	deactivate() {
		if (this.diapo.isFullMode) throw new DiapoError("In full mode, another slide should be activated instead.");
		if (this._isActive) this._deactivate();
	}
	_deactivate() {
		this.element.classList.replace(this._options.activeSlideClass, this._options.visitedSlideClass);
		this._isActive = false;
		this.dispatchEvent(new Event("deactivate"));
	}
};
//#endregion
//#region src/modules/a11y.js
var createLiveRegion = () => {
	const liveRegion = document.createElement("section");
	liveRegion.className = "region";
	liveRegion.setAttribute("role", "region");
	liveRegion.setAttribute("aria-live", "assertive");
	liveRegion.setAttribute("aria-relevant", "all");
	liveRegion.setAttribute("aria-label", "Slide Content: Auto-updating");
	return liveRegion;
};
var a11y_default = (diapo) => {
	const { container } = diapo;
	const liveRegion = createLiveRegion();
	container.appendChild(liveRegion);
	const updateDocumentRole = () => {
		if (diapo.isFullMode) container.setAttribute("role", "application");
		else container.removeAttribute("role");
	};
	const updateLiveRegion = () => {
		const slide = diapo.activeSlide;
		if (slide) liveRegion.innerHTML = slide.element.innerHTML;
	};
	diapo.addEventListener("start", () => {
		updateDocumentRole();
		updateLiveRegion();
	});
	diapo.addEventListener("modechange", updateDocumentRole);
	diapo.addEventListener("slidechange", updateLiveRegion);
};
//#endregion
//#region src/modules/keys.js
var keys_default = (diapo) => {
	const doSlideActions = (event) => {
		const isDiapoAction = !(event.ctrlKey || event.altKey || event.metaKey);
		switch (event.key.toUpperCase()) {
			case "ENTER":
				if (event.metaKey && diapo.isListMode) {
					if (event.shiftKey) {
						event.preventDefault();
						diapo.first();
					}
					break;
				}
				event.preventDefault();
				if (event.shiftKey) diapo.prev();
				else diapo.next();
				break;
			case "BACKSPACE":
			case "PAGEUP":
			case "ARROWUP":
			case "ARROWLEFT":
			case "H":
			case "K":
			case "P":
				if (isDiapoAction) {
					event.preventDefault();
					diapo.prev(event.shiftKey);
				}
				break;
			case "PAGEDOWN":
			case "ARROWDOWN":
			case "ARROWRIGHT":
			case "L":
			case "J":
			case "N":
				if (isDiapoAction) {
					event.preventDefault();
					diapo.next(event.shiftKey);
				}
				break;
			case " ":
				if (isDiapoAction && diapo.isFullMode) {
					event.preventDefault();
					if (event.shiftKey) diapo.prev();
					else diapo.next();
				}
				break;
			case "HOME":
				event.preventDefault();
				diapo.first();
				break;
			case "END":
				event.preventDefault();
				diapo.last();
		}
	};
	const doModeActions = (event) => {
		switch (event.key.toUpperCase()) {
			case "ESCAPE":
				if (diapo.isFullMode) {
					event.preventDefault();
					diapo.exitFullMode();
				}
				break;
			case "ENTER":
				if (event.metaKey && diapo.isListMode) {
					event.preventDefault();
					diapo.enterFullMode();
				}
				break;
			case "P":
				if (event.metaKey && event.altKey && diapo.isListMode) {
					event.preventDefault();
					diapo.enterFullMode();
				}
				break;
			case "F5": if (event.shiftKey && diapo.isListMode) {
				event.preventDefault();
				diapo.enterFullMode();
			}
		}
	};
	diapo.container.addEventListener("keydown", (event) => {
		if (event.defaultPrevented) return;
		if (isInteractiveElement(event.target)) return;
		doSlideActions(event);
		doModeActions(event);
	});
};
//#endregion
//#region src/modules/location.js
var location_default = (diapo) => {
	const composeURL = () => {
		const search = diapo.isFullMode ? "?full" : "";
		const slide = diapo.activeSlide;
		const hash = slide ? `#${slide.id}` : "";
		return location.pathname + search + hash;
	};
	const applyURLMode = () => {
		if (new URLSearchParams(location.search).has("full")) diapo.enterFullMode();
		else diapo.exitFullMode();
	};
	const applyURLSlide = () => {
		const id = location.hash.slice(1);
		if (!id) return;
		const target = diapo.slides.find((slide) => slide.id === id);
		if (target) target.activate();
		else if (!diapo.activeSlide) diapo.first();
	};
	const applyURL = () => {
		applyURLMode();
		applyURLSlide();
	};
	applyURL();
	window.addEventListener("popstate", applyURL);
	diapo.addEventListener("start", () => {
		history.replaceState(null, document.title, composeURL());
	});
	diapo.addEventListener("modechange", () => {
		history.replaceState(null, document.title, composeURL());
	});
	diapo.addEventListener("slidechange", () => {
		const url = composeURL();
		if (!location.href.endsWith(url)) history.pushState(null, document.title, url);
	});
};
//#endregion
//#region src/modules/next.js
var next_default = (diapo) => {
	const { stepSelector, activeSlideClass, visitedSlideClass } = diapo.options;
	let innerSteps;
	let activeIndex;
	const isActive = (step) => step.classList.contains(activeSlideClass);
	const isVisited = (step) => step.classList.contains(visitedSlideClass);
	const setInnerStepsState = () => {
		if (diapo.isListMode) return;
		const slide = diapo.activeSlide;
		innerSteps = [...slide.element.querySelectorAll(stepSelector)];
		activeIndex = innerSteps.length && innerSteps.every(isVisited) ? innerSteps.length : innerSteps.filter(isActive).length - 1;
		slide.state.innerStepCount = innerSteps.length;
	};
	diapo.addEventListener("start", setInnerStepsState);
	diapo.addEventListener("modechange", setInnerStepsState);
	diapo.addEventListener("slidechange", setInnerStepsState);
	diapo.addEventListener("next", (event) => {
		if (diapo.isListMode || event.defaultPrevented || !event.cancelable) return;
		activeIndex++;
		innerSteps.forEach((step, index) => {
			step.classList.toggle(visitedSlideClass, index < activeIndex);
			step.classList.toggle(activeSlideClass, index === activeIndex);
		});
		if (activeIndex < innerSteps.length) event.preventDefault();
	});
	diapo.addEventListener("prev", (event) => {
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
//#endregion
//#region src/modules/progress.js
var progress_default = (diapo) => {
	const { progressSelector } = diapo.options;
	const bar = diapo.container.querySelector(progressSelector);
	if (!bar) return;
	bar.setAttribute("role", "progressbar");
	bar.setAttribute("aria-valuemin", 0);
	bar.setAttribute("aria-valuemax", 100);
	const updateProgress = () => {
		const index = diapo.activeSlideIndex;
		const { length } = diapo.slides;
		const progress = index / (length - 1) * 100;
		bar.style.width = `${progress}%`;
		bar.setAttribute("aria-valuenow", progress);
		bar.setAttribute("aria-valuetext", `Slideshow progress: ${progress}%`);
	};
	diapo.addEventListener("start", updateProgress);
	diapo.addEventListener("slidechange", updateProgress);
};
//#endregion
//#region src/modules/parse-timing.js
var units = [
	"s",
	"m",
	"h"
];
var hasUnits = (timing) => {
	return units.some((unit) => timing.includes(unit));
};
var parseUnits = (timing) => {
	return units.map((unit) => timing.match(`(\\S+)${unit}`)).map((match) => match && match[1]);
};
var parseColons = (timing) => {
	return `::${timing}`.split(":").reverse();
};
var SEC_IN_MIN = 60;
var SEC_IN_HOUR = 3600;
var parse_timing_default = (timing) => {
	if (!timing) return 0;
	let [sec, min, hour] = (hasUnits(timing) ? parseUnits(timing) : parseColons(timing)).map(Number);
	sec += min * SEC_IN_MIN;
	sec += hour * SEC_IN_HOUR;
	return Math.max(sec * 1e3, 0);
};
//#endregion
//#region src/modules/timer.js
var timer_default = (diapo) => {
	let id;
	const resetTimer = () => {
		clearTimeout(id);
		if (diapo.isListMode) return;
		const slide = diapo.activeSlide;
		const { visitCount, innerStepCount } = slide.state;
		if (visitCount > 1) return;
		const timing = parse_timing_default(slide.element.dataset.timing);
		if (!timing) return;
		if (innerStepCount) {
			const stepTiming = timing / (innerStepCount + 1);
			id = setInterval(() => diapo.next(), stepTiming);
		} else id = setTimeout(() => diapo.next(), timing);
	};
	diapo.addEventListener("start", resetTimer);
	diapo.addEventListener("modechange", resetTimer);
	diapo.addEventListener("slidechange", resetTimer);
	diapo.container.addEventListener("keydown", (event) => {
		if (!event.defaultPrevented) clearTimeout(id);
	});
};
//#endregion
//#region src/modules/title.js
var mdash = "—";
var title_default = (diapo) => {
	const { title } = document;
	const updateTitle = () => {
		if (diapo.isFullMode) {
			const slideTitle = diapo.activeSlide.title;
			if (slideTitle) {
				document.title = `${slideTitle} ${mdash} ${title}`;
				return;
			}
		}
		document.title = title;
	};
	diapo.addEventListener("start", updateTitle);
	diapo.addEventListener("modechange", updateTitle);
	diapo.addEventListener("slidechange", updateTitle);
};
//#endregion
//#region src/modules/view.js
var view_default = (diapo) => {
	const { container } = diapo;
	const { fullModeClass, listModeClass } = diapo.options;
	if (container.classList.contains(fullModeClass)) diapo.enterFullMode();
	else container.classList.add(listModeClass);
	const updateScale = () => {
		const firstSlide = diapo.slides[0];
		if (!firstSlide) return;
		const { innerWidth, innerHeight } = window;
		const { offsetWidth, offsetHeight } = firstSlide.element;
		const listScale = 1 / (offsetWidth / innerWidth);
		const fullScale = 1 / Math.max(offsetWidth / innerWidth, offsetHeight / innerHeight);
		container.style.setProperty("--diapo-list-scale", listScale);
		container.style.setProperty("--diapo-full-scale", fullScale);
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
		if (slide) slide.element.scrollIntoView({ block: "center" });
	};
	diapo.addEventListener("start", updateModeView);
	diapo.addEventListener("modechange", updateModeView);
	diapo.addEventListener("slidechange", () => {
		if (diapo.isFullMode) return;
		diapo.activeSlide.element.scrollIntoView({ block: "nearest" });
	});
	window.addEventListener("resize", updateScale);
};
//#endregion
//#region src/modules/touch.js
var touch_default = (diapo) => {
	let exitFullScreen = false;
	let clickable = false;
	document.addEventListener("touchstart", (event) => {
		if (event.touches.length === 1) {
			const touch = event.touches[0];
			const x = touch.clientX;
			const { target } = touch;
			clickable = target.tabIndex !== -1;
			if (!clickable) {
				if (diapo.isFullMode) {
					if (event.cancelable) event.preventDefault();
					if (window.innerWidth / 2 < x) diapo.next();
					else diapo.prev();
				}
			}
		} else if (event.touches.length === 3) exitFullScreen = true;
	});
	diapo.container.addEventListener("touchend", (event) => {
		if (exitFullScreen) {
			event.preventDefault();
			exitFullScreen = false;
			diapo.exitFullMode();
		} else if (event.touches.length === 1 && !clickable && diapo.isFullMode) event.preventDefault();
	});
};
//#endregion
//#region src/modules/mouse.js
var mouse_default = (diapo) => {
	const { mouseHiddenClass, mouseInactivityTimeout } = diapo.options;
	let hideMouseTimeoutId = null;
	const cleanUp = () => {
		diapo.container.classList.remove(mouseHiddenClass);
		clearTimeout(hideMouseTimeoutId);
		hideMouseTimeoutId = null;
	};
	const hideMouseIfInactive = () => {
		if (hideMouseTimeoutId !== null) cleanUp();
		hideMouseTimeoutId = setTimeout(() => {
			diapo.container.classList.add(mouseHiddenClass);
		}, mouseInactivityTimeout);
	};
	const initHideMouseIfInactiveModule = () => {
		diapo.container.addEventListener("mousemove", hideMouseIfInactive);
	};
	const destroyHideMouseIfInactiveModule = () => {
		diapo.container.removeEventListener("mousemove", hideMouseIfInactive);
		cleanUp();
	};
	const handleModeChange = () => {
		if (diapo.isFullMode) initHideMouseIfInactiveModule();
		else destroyHideMouseIfInactiveModule();
	};
	diapo.addEventListener("start", handleModeChange);
	diapo.addEventListener("modechange", handleModeChange);
};
//#endregion
//#region src/modules/install.js
var install_default = (diapo) => {
	a11y_default(diapo);
	progress_default(diapo);
	keys_default(diapo);
	next_default(diapo);
	timer_default(diapo);
	title_default(diapo);
	location_default(diapo);
	view_default(diapo);
	touch_default(diapo);
	mouse_default(diapo);
	if (diapo.isFullMode && !diapo.activeSlide) diapo.first();
};
//#endregion
//#region src/diapo.js
var Diapo = class extends EventTarget {
	/**
	* @param {object=} options
	*/
	constructor(options) {
		super();
		defineReadOnly(this, { options: {
			...default_options_default,
			...options
		} });
		this._mode = "list";
		this._isStarted = false;
		this._container = null;
	}
	/**
	* @param {object=} options
	* @throws {DiapoError}
	*/
	configure(options) {
		if (this._isStarted) throw new DiapoError("Diapo should be configured before it is started.");
		Object.assign(this.options, options);
	}
	/**
	* @throws {DiapoError}
	* @emits Diapo#start
	*/
	start() {
		if (this._isStarted) return;
		const { containerSelector } = this.options;
		this._container = document.querySelector(containerSelector);
		if (!this._container) throw new DiapoError(`Diapo container with selector '${containerSelector}' was not found.`);
		this._initSlides();
		install_default(this);
		this._isStarted = true;
		this.dispatchEvent(new Event("start"));
		this.publishTrackingEvent("start");
	}
	_initSlides() {
		const visibleSlideSelector = `${this.options.slideSelector}:not([hidden])`;
		const visibleSlideElements = this._container.querySelectorAll(visibleSlideSelector);
		this.slides = Array.from(visibleSlideElements, (slideElement, index) => {
			if (!slideElement.id) slideElement.id = index + 1;
			return new Slide(this, slideElement);
		});
	}
	_setMode(mode) {
		if (mode === this._mode) return;
		this._mode = mode;
		this.dispatchEvent(new Event("modechange"));
	}
	/**
	* @param {Event} event
	*/
	dispatchEvent(event) {
		if (!this._isStarted) return false;
		return super.dispatchEvent(event);
	}
	publishTrackingEvent(action, detail = {}) {
		window.dispatchEvent(new CustomEvent("diapo:track", { detail: {
			action,
			...detail
		} }));
	}
	get isStarted() {
		return this._isStarted;
	}
	get container() {
		return this._container;
	}
	get isFullMode() {
		return this._mode === "full";
	}
	get isListMode() {
		return this._mode === "list";
	}
	get activeSlide() {
		return this.slides.find((slide) => slide.isActive);
	}
	get activeSlideIndex() {
		return this.slides.findIndex((slide) => slide.isActive);
	}
	/**
	* Slide fills the maximum area.
	* @emits Diapo#modechange
	*/
	enterFullMode() {
		this._setMode("full");
		this.publishTrackingEvent("enterfullmode");
	}
	/**
	* Diapo returns into list mode.
	* @emits Diapo#modechange
	*/
	exitFullMode() {
		this._setMode("list");
		this.publishTrackingEvent("exitfullmode");
	}
	/**
	* @param {number} index
	*/
	goTo(index) {
		const slide = this.slides[index];
		if (slide) {
			slide.activate();
			this.publishTrackingEvent("goto", { index });
		}
	}
	/**
	* @param {number} delta
	*/
	goBy(delta) {
		this.goTo(this.activeSlideIndex + delta);
		this.publishTrackingEvent("goby", { delta });
	}
	/**
	* @param {boolean} [isForce=false]
	* @emits Diapo#prev
	*/
	prev(isForce) {
		const prev = new Event("prev", { cancelable: !isForce });
		if (this.dispatchEvent(prev)) this.goBy(-1);
	}
	/**
	* @param {boolean} [isForce=false]
	* @emits Diapo#next
	*/
	next(isForce) {
		const next = new Event("next", { cancelable: !isForce });
		if (this.dispatchEvent(next)) this.goBy(1);
	}
	first() {
		this.goTo(0);
	}
	last() {
		this.goTo(this.slides.length - 1);
	}
};
//#endregion
//#region src/index.js
var { diapo: _, ...options } = document.querySelector("script[type='module'][data-diapo]").dataset;
var diapo = new Diapo(options);
Object.defineProperty(window, "diapo", {
	value: diapo,
	configurable: true
});
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => diapo.start());
else diapo.start();
//#endregion
