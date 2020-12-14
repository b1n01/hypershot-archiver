# Hypershot Archiver: archive hypertext to p2p network

Hypershot Archiver let's you make copy of websites and store them on a p2p network via the [dat protocol](https://github.com/datproject/dat). It's part of `reff` project.

> This is still in very early prototype phase, it is still not working

## How it works
It uses [hypershot](https://github.com/chielorenz/hypershot) to create an offline copy of an url, than it creates a [dat](https://github.com/datproject/dat) archive and store it on a [dat-store](https://github.com/datproject/dat-store). It then writes information about the archive on a ledger, so if that website is archived again it can find the old archive, download it from the dat-store, updates it (creating a new version) it uploding the new version.

## Setup
Clone this repo and intall dependencie via `yarn intall`. You need a local [dat-store](https://github.com/datproject/dat-store) running (you can use the one that comes with this repo dependencies `./node_modules/dat-store/bin.js run-service`). Launch the server with `node index.js` and visit [http:localhost:3000](http:localhost:3000).
