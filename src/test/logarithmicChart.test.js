import axios from 'axios';
import { NovelCovid } from 'novelcovid';
import {
  getUserLocation,
  hiddenSeries,
  getHistoryTimelineData,
  getHistoricalDataForCountry,
  getHistoricalData,
  findByPropertyName,
} from '../logarithmicChart';
import { countryCodes, balkanCountries } from '../constants';
import historicalDataJson from './historicalData.json';
import groupsDataJson from './groupsData.json';

const { BA, HR, BG, RS, GR } = countryCodes;
const { SERBIA } = balkanCountries;

jest.mock('axios');
jest.mock('NovelCovid');
const historical = jest.fn().mockResolvedValue(historicalDataJson);
NovelCovid.mockImplementation(() => ({ historical }));

beforeEach(() => {
  // Clear all instances
  NovelCovid.mockClear();
});

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

  it('should get Serbia historical data for a new cases', async () => {
    const timelineCases = await getHistoryTimelineData('cases', SERBIA);

    expect(timelineCases).toEqual(historicalDataJson.timeline.cases);
  });

  it('should get Serbia historical data for a deaths', async () => {
    const timelineDeaths = await getHistoryTimelineData('deaths', SERBIA);

    expect(timelineDeaths).toEqual(historicalDataJson.timeline.deaths);
  });

  it('should get Serbia history data structured in array of data for the last 30 days', async () => {
    const historyData = await getHistoricalDataForCountry('cases', SERBIA, RS);

    expect(historyData).toHaveLength(30);
    expect(historyData[0]).toHaveProperty('date');
    expect(historyData[0]).toHaveProperty(RS);
  });

  it("should find element by it's property name", async () => {
    expect(findByPropertyName(groupsDataJson, '5/8/20', RS)).toEqual({
      date: '5/8/20',
      RS: 9943,
    });
  });

  it("should return structured historical data", async () => {
    const historyData = await getHistoricalData('cases');

    expect(historyData[0]).toHaveProperty('date');
    expect(historyData[0]).toHaveProperty(RS);
    expect(historyData[0]).toHaveProperty(GR);
  });
});
