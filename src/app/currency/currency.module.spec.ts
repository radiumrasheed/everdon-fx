import { CurrencyModule } from './currency.module';

describe('CurrencyModule', () => {
	let currencyModule: CurrencyModule;

	beforeEach(() => {
		currencyModule = new CurrencyModule();
	});

	it('should create an instance', () => {
		expect(currencyModule).toBeTruthy();
	});
});
