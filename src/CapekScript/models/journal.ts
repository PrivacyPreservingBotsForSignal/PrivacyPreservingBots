import { FETCH_JOURNAL_PATH, OUTPUT_JOURNAL_PATH } from '../../CapekScript/Parser';
import { config } from '../../config';
import * as fs from 'fs';

export class OutputJournal {
  private entries = 0;
  private static instance_: OutputJournal | undefined = undefined;

  private constructor() {
    return;
  }

  static instance(): OutputJournal {
    if (OutputJournal.instance_ !== undefined) {
      return OutputJournal.instance_;
    }

    try {
      OutputJournal.instance_ = OutputJournal.load();
    } catch (e) {}
    OutputJournal.instance_ = new OutputJournal();
    OutputJournal.instance_.save();
    return OutputJournal.instance_;
  }

  public increment(): void {
    this.entries++;
    this.save();
  }

  public reset(): void {
    this.entries = 0;
    this.save();
  }

  public length(): number {
    return this.entries;
  }

  private save = (): void => {
    if (config.noPersist) {
      return;
    }
    const data = JSON.stringify(this);
    fs.writeFileSync(config.path + OUTPUT_JOURNAL_PATH, data);
  };

  private static load = (): OutputJournal => {
    const journalJson = fs.readFileSync(config.path + OUTPUT_JOURNAL_PATH, 'utf8');
    const journal = JSON.parse(journalJson) as OutputJournal;
    return journal;
  };
}

export class FetchJournal {
  private entries: Array<string> = [];
  private static instance_: FetchJournal | undefined = undefined;

  private constructor() {
    return;
  }

  public static instance(): FetchJournal {
    if (FetchJournal.instance_ !== undefined) {
      return FetchJournal.instance_;
    }

    try {
      FetchJournal.instance_ = FetchJournal.load();
    } catch (e) {}
    FetchJournal.instance_ = new FetchJournal();
    FetchJournal.instance_.save();
    return FetchJournal.instance_;
  }

  public addEntry(entry: string): void {
    this.entries.push(entry);
    this.save();
  }

  public reset(): void {
    this.entries = [];
    this.save();
  }

  public length(): number {
    return this.entries.length;
  }

  public getEntry(index: number): string {
    return this.entries[index];
  }

  private save = (): void => {
    if (config.noPersist) {
      return;
    }
    const data = JSON.stringify(this);
    fs.writeFileSync(config.path + FETCH_JOURNAL_PATH, data);
  };

  private static load = (): FetchJournal => {
    const journalJson = fs.readFileSync(config.path + FETCH_JOURNAL_PATH, 'utf8');
    const journal = JSON.parse(journalJson) as FetchJournal;
    return journal;
  };
}
