import {
  renameCountryNames,
  getCountryData,
  getTransformedCountryData,
} from '../radarChart';
import { balkanCountries } from '../constants';
import { NovelCovid } from 'novelcovid';
import novelCovidData from './novelCovidData.json';

const { MACEDONIA, BOSNIA } = balkanCountries;

jest.mock('NovelCovid');
const countries = jest.fn().mockResolvedValue(novelCovidData);
NovelCovid.mockImplementation(() => ({ countries }));

beforeEach(() => {
  // Clear all instances
  NovelCovid.mockClear();
});

describe('Test Radar Chart', () => {
  it('should rename country names', () => {
    const renamedItems = renameCountryNames([
      {
        country: 'Bosnia',
      },
      { country: 'Macedonia' },
    ]);

    expect(renamedItems[0].country).toEqual(BOSNIA);
    expect(renamedItems[1].country).toEqual(MACEDONIA);
  });

  it('should return countries data', async () => {
    const countriesData = await getCountryData();

    expect(NovelCovid).toHaveBeenCalled();
    expect(countriesData).toHaveLength(2);
    expect(countriesData[0].country).toEqual('Serbia');
  });

  it('should transform data for radar chart', async () => {
    const transformedData = await getTransformedCountryData();

    expect(transformedData).toHaveLength(2);
    expect(transformedData[0]).toEqual({
      countryFlag: 'https://disease.sh/assets/img/flags/rs.png',
      country: 'Serbia',
      cases: 10114,
      todayCases: 0,
      deaths: 215,
      recovered: 3006,
      tests: 140592,
      critical: 43,
    });
  });
});
