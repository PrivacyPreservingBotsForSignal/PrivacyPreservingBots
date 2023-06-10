use serde::Serialize;

pub type ReceiveV1Response = Vec<ReceiveV1ResponseElement>;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReceiveV1ResponseElement {
    pub envelope: MessageEnvelope,
    pub account: String,
}

impl ReceiveV1ResponseElement {
    pub fn mock(message: &str, source_number: &str, account: &str) -> Self {
        let datamessage = DataMessage {
            timestamp: 0,
            message: message.to_string(),
            expires_in_seconds: 0,
            view_once: false,
            group_info: "".to_string(),
        };

        let message_envelope = MessageEnvelope {
            source: "".to_string(),
            source_number: source_number.to_string(),
            source_uuid: "".to_string(),
            source_name: "".to_string(),
            source_device: 0,
            timestamp: 0,
            data_message: datamessage,
        };

        ReceiveV1ResponseElement {
            envelope: message_envelope,
            account: account.to_string(),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MessageEnvelope {
    pub source: String,
    pub source_number: String,
    pub source_uuid: String,
    pub source_name: String,
    pub source_device: u32,
    pub timestamp: u64,
    pub data_message: DataMessage,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DataMessage {
    pub timestamp: u64,
    pub message: String,
    pub expires_in_seconds: u64,
    pub view_once: bool,
    pub group_info: String,
}
