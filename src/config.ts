import * as dotenv from 'dotenv';
import SRA from './sra';

export class Config {
  public backendUrlSend: string;
  public backendPortSend: string;
  public backendUrlReceive: string;
  public backendPortReceive: string;
  public signalBotId: string;
  public userNumber: string;
  public groupId: string;
  public urlSend: string;
  public urlReceive: string;
  public api: SRA;
  public isLeader = false;
  public path = './';
  public noElect: boolean;
  public benchmark: boolean;
  public nonCapek: boolean;
  public benchmarkName: string;
  public noOfBots: number;
  public online: number;
  public benchmarkBot = '0';
  public noPersist: boolean;
  public heartbeatInterval: number;
  public electionInterval: number;
  public numberOfHeartbeatsBeforeElection: number;

  constructor() {
    dotenv.config();

    this.backendUrlSend = process.env.BACKEND_SEND_URL as string;
    this.backendPortSend = process.env.BACKEND_SEND_PORT as string;
    this.backendUrlReceive = process.env.BACKEND_RECEIVE_URL as string;
    this.backendPortReceive = process.env.BACKEND_RECEIVE_PORT as string;
    this.signalBotId = process.env.SIGNAL_BOT_ID as string;
    this.userNumber = process.env.USER_NUMBER as string;
    this.groupId = process.env.GROUP_ID as string;
    this.path = process.env.BOTPATH as string;

    this.urlSend = this.backendUrlSend + ':' + this.backendPortSend;
    this.urlReceive = this.backendUrlReceive + ':' + this.backendPortReceive;
    this.api = new SRA(this.urlSend, this.urlReceive);
    this.noElect = process.env.NO_ELECT === 'true';
    this.benchmark = process.env.BENCHMARK === 'true';
    this.nonCapek = process.env.NO_CAPEK === 'true';
    this.benchmarkName = process.env.BENCHMARK_NAME as string;
    this.noOfBots = parseInt(process.env.NO_OF_BOTS as string);
    this.online = parseInt(process.env.ONLINE as string);
    this.benchmarkBot = process.env.BENCHMARK_BOT as string;
    this.noPersist = process.env.NO_PERSIST === 'true';
    this.heartbeatInterval = parseInt(process.env.HEARTBEAT_INTERVAL as string);
    this.electionInterval = parseInt(process.env.ELECTION_INTERVAL as string);
    this.numberOfHeartbeatsBeforeElection = parseInt(process.env.NUMBER_OF_HEARTBEATS_BEFORE_ELECTION as string);
  }
}

export const config: Config = new Config();
