class SendMessageV2Request {
  public base64_attachments: Array<string>;
  public message: string;
  public number: string;
  public recipients: Array<string>;

  constructor(base64_attachments: Array<string>, message: string, number: string, recipients: Array<string>) {
    this.base64_attachments = base64_attachments;
    this.message = message;
    this.number = number;
    this.recipients = recipients;
  }
}

interface SendMessageV2Response {
  timestamp: string;
}

export { SendMessageV2Request, SendMessageV2Response };
