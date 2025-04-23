import { contentLoaded } from './utils.js';
import Diapo from './diapo.js';

const options = document.currentScript.dataset;
const diapo = new Diapo(options);

Object.defineProperty(window, 'diapo', {
	value: diapo,
	configurable: true,
});

contentLoaded(() => {
	diapo.start();
});