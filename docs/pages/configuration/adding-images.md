# Adding (custom) Toy Tag images

Depending on your installation method the folder paths might differ:

1. VM installation: `LD-ToyPad-Emulator/server/images`
2. SBC installation: the images path you mounted as a volume while creating the container

Just place the desired images in the folder and reload the page. It should fetch the images automatically. If no images are displayed restart the server / container. If there are still no images displayed, check if you have named your images correctly.

## Naming scheme

Your images need to be named using their respective character / vehicle id.

- Character ids can be found [here](https://github.com/Berny23/LD-ToyPad-Emulator/blob/master/server/json/charactermap.json)

- Vehicle ids can be found [here](https://github.com/Berny23/LD-ToyPad-Emulator/blob/master/server/json/tokenmap.json)
