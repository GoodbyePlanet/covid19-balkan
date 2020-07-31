import axios from 'axios';
import { NovelCovid } from 'novelcovid';
import {
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

jest.mock('NovelCovid');
const historical = jest.fn().mockResolvedValue(historicalDataJson);
NovelCovid.mockImplementation(() => ({ historical }));

beforeEach(() => {
  // Clear all instances
  NovelCovid.mockClear();
});

describe('Test Logarithmic Chart', () => {
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
});
