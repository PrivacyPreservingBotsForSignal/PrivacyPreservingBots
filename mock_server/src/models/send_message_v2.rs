use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct SendMessageV2Request {
    pub base64_attachments: Vec<String>,
    pub message: String,
    pub number: String,
    pub recipients: Vec<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SendMessageV2Response {
    pub timestamp: String,
}
