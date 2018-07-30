import {ProductPipe} from './product.pipe';

describe('CurrencyPipe', () => {
	it('create an instance', () => {
		const pipe = new ProductPipe();
		expect(pipe).toBeTruthy();
	});
});
