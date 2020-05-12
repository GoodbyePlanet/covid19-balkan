import axios from 'axios';
import { getUserLocation, hiddenSeries } from '../logarithmicChart';
import { countryCodes } from '../constants';

const { BA, HR, BG, RS, GR } = countryCodes;

jest.mock('axios');

describe('Test Logarithmic Chart', () => {
  it('should return user location', async () => {
    axios.get.mockResolvedValue({
      city: 'Teslic',
      continent: 'Europe',
      country: 'Bosnia and Herzegovina',
      countryCode: 'BA',
      org: 'Telekom Srpske',
      query: '31.223.143.2',
      region: 'Srpska',
      status: 'success',
    });

    const userLocaltion = await getUserLocation();

    expect(userLocaltion.city).toEqual('Teslic');
    expect(userLocaltion.continent).toEqual('Europe');
    expect(userLocaltion.region).toEqual('Srpska');
  });

  it('should throw an error when getting user location', async () => {
    axios.get.mockResolvedValue(() => {
      throw new Error();
    });

    expect(await getUserLocation()).toThrow();
  });

  it.each`
    userLocationCC | seriesCC | expected
    ${BA}          | ${HR}    | ${true}
    ${BA}          | ${BG}    | ${true}
    ${HR}          | ${BG}    | ${true}
    ${HR}          | ${BA}    | ${true}
    ${BG}          | ${BA}    | ${true}
    ${BG}          | ${HR}    | ${true}
    ${RS}          | ${BA}    | ${true}
    ${RS}          | ${BG}    | ${true}
    ${GR}          | ${BA}    | ${true}
    ${GR}          | ${BG}    | ${true}
    ${'US'}        | ${BA}    | ${true}
    ${'US'}        | ${BG}    | ${true}
    ${'US'}        | ${RS}    | ${false}
    ${'US'}        | ${GR}    | ${false}
    ${'US'}        | ${HR}    | ${false}
    ${BA}          | ${BA}    | ${false}
  `(
    'should hide $seriesCC is user location is $userLocationCC',
    ({ userLocationCC, seriesCC, expected }) => {
      expect(hiddenSeries(userLocationCC, seriesCC)).toBe(expected);
    },
  );
});
