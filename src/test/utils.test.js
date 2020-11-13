import { getCovidDataWithNamesRenamed } from '../utils';
import { balkanCountries } from '../constants';

const { MACEDONIA, BOSNIA } = balkanCountries;

describe('Test country name renaming', () => {
  it('should rename country names', () => {
    const data = [
      {
        country: 'Bosnia',
      },
      { country: 'Macedonia' },
    ];
    const renamedItems = getCovidDataWithNamesRenamed(data, MACEDONIA, BOSNIA);

    expect(renamedItems[0].country).toEqual(BOSNIA);
    expect(renamedItems[1].country).toEqual(MACEDONIA);
  });
});
