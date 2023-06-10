use std::ops::DerefMut;

use actix_web::{web, HttpRequest, Responder, Scope};

use crate::{
    models::{
        receive_v1::ReceiveV1ResponseElement,
        send_message_v2::{SendMessageV2Request, SendMessageV2Response},
    },
    MessageQueue,
};

async fn send(
    _req: HttpRequest,
    data: web::Json<SendMessageV2Request>,
    message_queue: web::Data<MessageQueue>,
) -> impl Responder {
    let req = data.into_inner();
    let mut queues = message_queue.write().unwrap();
    let queues = queues.deref_mut();

    if !queues.contains_key(&req.number) {
        queues.insert(req.number.clone(), Vec::new());
    }

    queues.iter_mut().for_each(|(account, queue)| {
        let receive_elem = ReceiveV1ResponseElement::mock(&req.message, &req.number, account);
        queue.push(receive_elem);
    });

    web::Json(SendMessageV2Response {
        timestamp: "0".to_string(),
    })
}

pub fn register(scope: Scope) -> Scope {
    scope.route("", web::post().to(send))
}
