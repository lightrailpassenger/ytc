# ytc

YouTube caching frontend.

## Introduction

This is a frontend implementation for `yt-dlp`. This project does not aim at
reimplementing logic for downloading videos. Instead, it's a convenient way to
run the command-line application in a browser such as Firefox.

This project is not intended for multi-client usages. Video records are stored
in a SQLite database for offline usage, and the actual files are stored in the
file system.

## Why?

Online videos are not always available because of multiple issues:

- The device might be offline
- The host site may be down
- The author revoked the video
- The host site forces users to watch ads before accessing the video

This implementation is fully offline. The only online part is the creation
process. Note that proxying YouTube does not fully solve the problem, because
the proxy server must be hosted somewhere. When hosted on a third-party service,
we face the same problems when the service provider is down. When self-hosted,
a third-party needs to rely on your service to make things work. As such, the
best way is to make things local.

## Build and run

### Backend

```bash
cd server/Ytc
./gradlew run
```

### Frontend

```bash
cd frontend
yarn # Only need to run once
yarn dev
```

Then, visit `localhost:5173` to see if things work smoothly.

## Caveats

Please make sure downloading YouTube videos does not cause any legal issue in
your jurisdiction.
