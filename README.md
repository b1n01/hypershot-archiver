# Hypershot Archiver: archive hypertext to p2p network

Hypershot Archiver let's you make copy of websites and store them on a p2p network via the [dat protocol](https://github.com/datproject/dat). It's part of `reff` project.

## This is still in very early prototype phase, do not use it

## How it works
It uses [hypershot](https://github.com/chielorenz/hypershot) to create an offline copy of an url, than it creates a [dat](https://github.com/datproject/dat) archive and store it on a [dat-store](https://github.com/datproject/dat-store). It then writes information about the archive on a ledger, so when that website will be archived again it can find the old archive, download it from the dat-store, updates it (creating a new version) it uploding the new version.

## Setup
You need to clone the repo, intall dependencie via `npm intall`. You must first run a local [dat-store](https://github.com/datproject/dat-store) server, you can use the one listen on this repo dependencies via `./node_modules/dat-store/bin.js run-service`. Than and run it with node `node index.js`, the server will be listening on [http:localhost:3000](http:localhost:3000).