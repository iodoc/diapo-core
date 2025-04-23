import { isInteractiveElement } from '../utils.js';

export default (diapo) => {
	const doSlideActions = (event) => {
		const isDiapoAction = !(event.ctrlKey || event.altKey || event.metaKey);

		switch (event.key.toUpperCase()) {
			case 'ENTER':
				if (event.metaKey && diapo.isListMode) {
					if (event.shiftKey) {
						event.preventDefault();
						diapo.first();
					}

					break;
				}

				event.preventDefault();
				if (event.shiftKey) {
					diapo.prev();
				} else {
					diapo.next();
				}
				break;

			case 'BACKSPACE':
			case 'PAGEUP':
			case 'ARROWUP':
			case 'ARROWLEFT':
			case 'H':
			case 'K':
			case 'P':
				if (isDiapoAction) {
					event.preventDefault();
					diapo.prev(event.shiftKey);
				}
				break;

			case 'PAGEDOWN':
			case 'ARROWDOWN':
			case 'ARROWRIGHT':
			case 'L':
			case 'J':
			case 'N':
				if (isDiapoAction) {
					event.preventDefault();
					diapo.next(event.shiftKey);
				}
				break;

			case ' ':
				if (isDiapoAction && diapo.isFullMode) {
					event.preventDefault();
					if (event.shiftKey) {
						diapo.prev();
					} else {
						diapo.next();
					}
				}
				break;

			case 'HOME':
				event.preventDefault();
				diapo.first();
				break;

			case 'END':
				event.preventDefault();
				diapo.last();
				break;
		}
	};

	const doModeActions = (event) => {
		switch (event.key.toUpperCase()) {
			case 'ESCAPE':
				if (diapo.isFullMode) {
					event.preventDefault();
					diapo.exitFullMode();
				}
				break;

			case 'ENTER':
				if (event.metaKey && diapo.isListMode) {
					event.preventDefault();
					diapo.enterFullMode();
				}
				break;

			case 'P':
				if (event.metaKey && event.altKey && diapo.isListMode) {
					event.preventDefault();
					diapo.enterFullMode();
				}
				break;

			case 'F5':
				if (event.shiftKey && diapo.isListMode) {
					event.preventDefault();
					diapo.enterFullMode();
				}
				break;
		}
	};

	diapo.container.addEventListener('keydown', (event) => {
		if (event.defaultPrevented) return;
		if (isInteractiveElement(event.target)) return;

		doSlideActions(event);
		doModeActions(event);
	});
};
