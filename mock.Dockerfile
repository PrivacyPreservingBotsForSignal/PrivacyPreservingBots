FROM rust:1.65-slim-buster as planner
WORKDIR /app
RUN cargo install cargo-chef --locked
COPY ./mock_server .
RUN cargo chef prepare --recipe-path recipe.json

FROM rust:1.65-slim-buster as cacher
WORKDIR /app
RUN cargo install cargo-chef
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json

FROM rust:1.65-slim-buster as builder
WORKDIR /app
COPY ./mock_server/Cargo.toml ./
COPY ./mock_server/Cargo.lock ./
COPY ./mock_server/src ./src
COPY --from=cacher /app/target target
COPY --from=cacher $CARGO_HOME $CARGO_HOME
RUN cargo build --release
RUN mv /app/target/release/mock_server ./
RUN strip ./mock_server

FROM debian:bookworm-20220228-slim as runtime
WORKDIR /home/app
RUN apt-get update \
    && apt-get install -y --force-yes --no-install-recommends \
    ca-certificates \
    && apt-get clean \
    && apt-get autoremove \
    && rm -rf /var/lib/apt/lists/*
COPY ./mock_server/static ./static
COPY --from=builder /app/mock_server ./mock_server
ENTRYPOINT ["./mock_server"]