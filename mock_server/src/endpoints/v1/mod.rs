use actix_web::{web, Scope};

pub mod receive;

pub fn register(scope: Scope) -> Scope {
    let receive_scope = web::scope("/receive");
    scope.service(receive::register(receive_scope))
}
