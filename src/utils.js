export const isInteractiveElement = (element) => element.tabIndex !== -1;

export const defineReadOnly = (target, props) => {
	for (const [key, value] of Object.entries(props)) {
		Object.defineProperty(target, key, {
			value,
			writable: false,
			enumerable: true,
			configurable: true,
		});
	}
};

export class DiapoError extends Error {}
