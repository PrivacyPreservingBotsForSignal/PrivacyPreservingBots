import { createProgramFromSources } from './CapekScript/Parser';
import { evalProgram } from './CapekScript/Interpreter';
import { config } from './config';
import { runCounterBot } from './Bots/SimpleCounter';

export let startTime = Date.now();

async function capekTest() {
  console.log(`Start time: ${startTime}`);
  console.log('Spawning bot from source dir: ' + config.path);
  const program = createProgramFromSources(config.path);
  console.log('Generated from source');

  console.log('Evaluating');
  console.log('BOT ID = ' + config.signalBotId);
  console.log('USER NUMBER = ' + config.userNumber);

  if (config.nonCapek) {
    await runCounterBot();
    return;
  }

  startTime += 6000;
  await evalProgram(program);
}

async function main() {
  capekTest();
}

main();
