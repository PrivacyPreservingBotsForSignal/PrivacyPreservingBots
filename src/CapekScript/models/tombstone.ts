import { Context } from '../../CapekScript/Interpreter';
import { MessageEnvelope } from '../../models/ReceiveV1';
import * as fs from 'fs';

export class Tombstone {
  constructor(public context: Context, public messageQueue: Array<MessageEnvelope>) {}

  public static save = (tombstone: Tombstone, path: string): void => {
    const data = JSON.stringify(tombstone, null, 2);
    fs.writeFileSync(path, data);
  };

  public static load = (path: string): Tombstone => {
    const tombstoneJson = fs.readFileSync(path, 'utf8');
    const tombstone = JSON.parse(tombstoneJson) as Tombstone;
    return tombstone;
  };
}
