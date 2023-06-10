use actix_web::{web, Scope};

pub mod send;

pub fn register(scope: Scope) -> Scope {
    let send_scope = web::scope("/send");
    scope.service(send::register(send_scope))
}
