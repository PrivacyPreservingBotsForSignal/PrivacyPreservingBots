import { config } from '../config';
import * as fs from 'fs';
import { startTime } from '../index';

const counterFilePath = () => `./benchmarks/results/${config.benchmarkName}-counter.csv`;
const timeTo100FilePath = () => `./benchmarks/results/${config.benchmarkName}-timeTo100.csv`;

export function appendCounterFile(counter: number) {
  const diff = Date.now() - startTime;
  fs.appendFileSync(counterFilePath(), `${counter},${diff}\n`);
}

export function appendTimeTo100File() {
  const noOfBots = config.noOfBots;
  const diff = Date.now() - startTime;
  fs.appendFileSync(timeTo100FilePath(), `${noOfBots},${diff}\n`);
}
