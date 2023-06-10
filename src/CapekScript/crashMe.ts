import { exit } from 'process';

const CRASH_PROBABILITY = 0;

export function crashMe() {
  const randVal = Math.random();
  if (randVal > CRASH_PROBABILITY) {
    return;
  }
  console.log('Now crashing...');
  exit(69);
}
