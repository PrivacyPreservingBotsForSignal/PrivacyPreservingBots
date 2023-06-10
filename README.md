# Signal-Bot-Client

A signal client with bot support
Reimplementing a signal client but adding support for bots

### Notes on setup

The docker-compose file in this repo has fields for environment variables that must be filled out before it can be used. Specifically, the bots will need to be assigned an account phone number to function. Furthermore, registration and linking must have happened for this phone number with the relevant signal-cli-config and a group must be joined and entered for the group id. See the signal-cli-rest-api documentation for instructions on linking, getting group IDs, etc.
