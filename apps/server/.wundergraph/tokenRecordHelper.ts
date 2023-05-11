import { TokenRecordsLatestResponseData } from "./generated/models";

type TokenRecord = TokenRecordsLatestResponseData["treasuryEthereum_tokenRecords"][0];

type TokenRecordByDate = {
  date: string;
  block: number;
  records: TokenRecord[];
};

export const filterLatestBlockByDay = (records: TokenRecord[]): TokenRecord[] => {
  const filteredData = Object.values(records.reduce((acc: Record<string, TokenRecordByDate>, curr: TokenRecord) => {
    const { date, block } = curr;
    const blockNumber = parseInt(block);
    if (!acc[date] || acc[date].block < blockNumber) {
      acc[date] = { date, block: blockNumber, records: [curr] };
    } else if (acc[date].block === blockNumber) {
      acc[date].records.push(curr);
    }
    return acc;
  }, {})).flatMap((record: TokenRecordByDate) => record.records);

  return filteredData;
};

export const sortRecordsDescending = (records: TokenRecord[]): TokenRecord[] => {
  return records.sort((a, b) => {
    const aTime = new Date(a.date).getTime();
    const bTime = new Date(b.date).getTime();

    if (aTime > bTime) {
      return -1;
    } else if (aTime < bTime) {
      return 1;
    } else {
      return 0;
    }
  });
};

export const flattenRecords = (records: TokenRecordsLatestResponseData, latestBlock: boolean): TokenRecord[] => {
  const combinedRecords: TokenRecord[] = [];

  const mapping = {
    Arbitrum: records.treasuryArbitrum_tokenRecords,
    Ethereum: records.treasuryEthereum_tokenRecords,
    Fantom: records.treasuryFantom_tokenRecords,
    Polygon: records.treasuryPolygon_tokenRecords,
  };

  for (const [key, value] of Object.entries(mapping)) {
    console.log(`Got ${value.length} ${key} records.`);
    let currentRecords: TokenRecord[] = value;

    if (latestBlock) {
      currentRecords = filterLatestBlockByDay(currentRecords);
    }

    combinedRecords.push(...currentRecords);
  }

  return combinedRecords;
};
