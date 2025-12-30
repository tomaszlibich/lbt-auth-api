# lbt-auth-api

A NodeJS Express driven Auth API application.

# Running the app

There are several ways of running the app, depending on environment and needs:

1. Directly by `npm start` - in this case the app is running directly on the host machine, without `Docker`. In such case, remember to run `npm i` first.

2. By `docker:start`. In that case, `Docker` command is executed under the hood and the application is dockerized. See `docker-compose.yml` for more details.

3. By running `./scripts/.deploy.sh`. This method is recommended after SSH to inside the remote server, as the script also gets the latest from the Github repository, before executing the respective `npm run` command.

PLEASE NOTE

The containers are running in detached mode.

To list all the running containers, execute `docker ps`.
To stop all the running containers, execute `docker stop $(docker ps -a -q)`.

# ENV variables

All ENV variables specific for different environments are located in the `.env` file. These are utilised inside `docker-compose.yml`, when running `Docker` commands.

When running `npm start` (without Docker), the `.env` file is read by the `dotenv` library.
