import Diapo from './diapo.js';

const script = document.querySelector("script[type='module'][data-diapo]");
const { diapo: _, ...options } = script.dataset; // suppress data-diapo attribute

const diapo = new Diapo(options);

Object.defineProperty(window, 'diapo', {
	value: diapo,
	configurable: true,
});

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => diapo.start());
} else {
	diapo.start();
}
