# Installation

The preferred way is to use the container which can be obtained from the repositories container registry. This page will focus on preparation of the systems (either [sbc](#sbc) or [vm](#vm)) and then make use of those containers. You can also locally build the server and frontend, but this is not recommended. Instructions can be found under [building yourself](/advanced/building-yourself)

## VM

## SBC

In this guide we will focus on the setup on a Raspberry Pi.

1. Flash a recent version of Raspberry Pi OS Lite (if supported 64-bit) to an SD card.
   ::: info
   if you use the Raspberry Pi Zero, Docker stopped supporting this hardware after Bookworm (see [Docker support](https://docs.docker.com/engine/install/raspberry-pi-os/#installation-methods))
   :::

2. Connect via SSH to your Pi.

3. Run the install script

   ```bash
   curl -sSL https://raw.githubusercontent.com/Berny23/LD-ToyPad-Emulator/master/pi_setup.sh | bash
   ```

   ::: info
   We highly encourage you to check what the script does before running it. Never run untrusted scripts from the internet.
   :::

4. Reboot your Pi

   ```bash
   sudo shutdown -r now
   ```

5. After reconnecting to your Pi via ssh, you can pull the latest version of the container image

   ```bash
   podman pull ghcr.io/berny23/ld-toypad-emulator:latest
   ```

   It should automatically detect your platform and pull the correct version, if you encounter any errors skip to [troubleshooting](/usage/troubleshooting)

6. Create a named volume for persistent app data (like your created toy tags):

   ```bash
   podman volume create ld-toypad-data
   ```

   ::: details
   This is needed to persist this data when updating the container
   :::

7. Create the container

   ```bash
   podman create \
    --name ld-toypad-emulator \
    -p 8080:80 \
    --device /dev/hidg0:/dev/hidg0 \
    -v ld-toypad-data:/app/server/json:Z \
    -v /path/to/images:/app/server/images:Z  \
    ghcr.io/berny23/ld-toypad-emulator:latest
   ```

   ::: info
   You are free to omit the volume mount to the images directory. If you remove it from the container creation you will not be able to add any images until you recreate the container.
   :::

8. Start the container

   ```bash
   podman run ld-toypad-emulator
   ```

   ::: warning
   Podman (by default using the commands above) runs as your currently logged in ssh user. Therefore it will not be possible to disconnect from the ssh session and simultaneously have the server running. To get around that please see how to configure your pi to run [systemd user instances](https://wiki.archlinux.org/title/Systemd/User#Automatic_start-up_of_systemd_user_instances) (and create a systemd instance for your container).
   :::

9. If there are no errors while installing continue with [post installation](#post-installation). Otherwise check [troubleshooting](/getting-started/troubleshooting)

## Post Installation

Now you can enter the IP address of your toypad emulator into the browser (for sbc setup this would be: http://your-pi-ip-address:8080 amd for the vm image it would be http://debian). If you want you can now configure custom images for your toytags. See [configuration](/configuration/adding-images) on how to do that.
