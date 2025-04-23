import a11y from './a11y.js';
import keys from './keys.js';
import location from './location.js';
import next from './next.js';
import progress from './progress.js';
import timer from './timer.js';
import title from './title.js';
import view from './view.js';
import touch from './touch.js';
import mouse from './mouse.js';

export default (diapo) => {
	a11y(diapo);
	progress(diapo);
	keys(diapo);
	next(diapo);
	timer(diapo); // should come after `keys` and `next`
	title(diapo);
	location(diapo); // should come after `title`
	view(diapo);
	touch(diapo);
	mouse(diapo);

	// maintains invariant: active slide always exists in `full` mode
	if (diapo.isFullMode && !diapo.activeSlide) {
		diapo.first();
	}
};
