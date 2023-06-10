use std::{
    collections::HashMap,
    sync::{Arc, RwLock},
};

mod endpoints;
mod models;

use actix_files::Files;
use actix_web::{
    middleware::Logger,
    web::{self, PayloadConfig},
    HttpResponse,
};

type MessageQueue = Arc<RwLock<HashMap<String, models::receive_v1::ReceiveV1Response>>>;

use crate::models::receive_v1::ReceiveV1Response;

async fn service() -> anyhow::Result<()> {
    use actix_web::{App, HttpServer};
    dotenv::dotenv().ok();
    env_logger::init();

    log::debug!("Logging initialized!");

    let port = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse::<u16>().ok())
        .unwrap_or_else(|| {
            log::warn!("No port was found in the environment, defaulting to 8080");
            8080
        });

    log::info!("Starting server!");

    let messages = HashMap::<String, ReceiveV1Response>::new();
    let messages: MessageQueue = Arc::new(RwLock::new(messages));

    HttpServer::new(move || {
        App::new()
            .wrap(Logger::default())
            // We need to accept bigger than default (258kb) payloads, as we are expecting image uploads
            .app_data(PayloadConfig::new(1 << 24))
            // We need to accept bigger json payloads than default, as we embed an image (the
            // signature) as part of some json payloads. In the future it may make sense to do it
            // as a multipart upload.
            .app_data(web::JsonConfig::default().limit(1 << 24))
            // Respond correctly to google health checks
            .route("liveness", web::get().to(HttpResponse::Ok))
            .route("readiness", web::get().to(HttpResponse::Ok))
            .app_data(web::Data::new(messages.clone()))
            .service({
                let scope = web::scope("/v1");
                endpoints::v1::register(scope)
            })
            .service({
                let scope = web::scope("/v2");
                endpoints::v2::register(scope)
            })
            .service(Files::new("", "./static/"))
    })
    .bind(("0.0.0.0", port))
    .unwrap()
    .run()
    .await?;
    Ok(())
}

pub fn main() -> anyhow::Result<()> {
    actix_web::rt::System::new().block_on(service())
}
