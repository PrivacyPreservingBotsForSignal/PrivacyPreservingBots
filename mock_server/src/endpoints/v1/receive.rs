use std::ops::DerefMut;

use actix_web::{web, HttpRequest, Responder, Scope};

use crate::{models::receive_v1::ReceiveV1Response, MessageQueue};

async fn receive(
    _req: HttpRequest,
    account: web::Path<String>,
    message_queue: web::Data<MessageQueue>,
) -> impl Responder {
    let mut queues = message_queue.write().unwrap();
    let queues = queues.deref_mut();

    let queue = queues.insert(account.to_string(), Vec::new());
    let queue = if let Some(queue) = queue {
        queue
    } else {
        ReceiveV1Response::new()
    };

    web::Json(queue)
}

pub fn register(scope: Scope) -> Scope {
    scope.route("/{account}", web::get().to(receive))
}
