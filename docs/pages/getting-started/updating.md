# How to update

## AMD64 / VM

Run the following commands while inside the LD-Toypad-Emulator folder:

```bash
git pull
npm install
```

## SBC

Updating is as simply as running:

```bash
podman stop ld-toypad-emulator # only if the container is currently running
podman rm ld-toypad-emulator
podman image rm ghcr.io/berny23/ld-toypad-emulator:latest
```

And then starting from step 5 from the [installation guide](/usage/installation)
