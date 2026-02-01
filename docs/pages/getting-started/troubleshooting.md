# Troubleshooting

:::warning
This troubleshooting guide might be outdated and incomplete
:::

## RPCS3 cannot detect the Toy Pad

### Windows solution

::: warning
This solution works only for RPCS3 and will break the Toy Pad detection with every other emulator!
:::

Download and run [Zadig](https://zadig.akeo.ie).

Click on `Options` and tick `List All Devices`. Select `LEGO READER V2.10` in the dropdown menu, then select `WinUSB` if it's not already selected, click on the `Replace Driver` button and on `Yes` in the dialog.

After the installation has finished, exit Zadig and restart RPCS3. If you get stuck on the main menu, just close the game, right-click on it in the RPCS3 games list, select `Change Custom Configuration`, switch to the `Network` tab and choose `Disconnected` in both drop-down menus. The game will now correctly detect the Toy Pad.

To undo the changes from Zadig, you have to rollback the driver:

1. Open `Device Manager`, scroll down to `USB devices` and expand the section.
2. Double-click `LEGO READER V2.10`.
3. Switch to the `Driver` tab, click `Previous Driver`, select the first option and click yes.

### Linux solution

In order to fix this, you will need to add a custom udev rule in your system, so the software can communicate with the game. The udev rule is in the root of the server folder. (thanks to wof for sharing the rule).

To add the rule, simply just move the `99-dimensions.rules` file to `/etc/udev/rules.d/` (a reboot might be required)

If moving the file is not allowed, just open a terminal inside the `rules.d` folder and run this command: `sudo nano 99-dimensions.rule`, open the rule file in the server root in a text editor, copy the contents and paste it in the terminal then press Ctrl + X to save the file.

## Webpage not reachable (Oracle VirtualBox)

Shutdown your virtual machine (icon in the upper right corner). In VirtualBox's manager, click your image and open `Settings`. Under `Network` change `Attached to:` to `Bridged Adapter` and click `ok`. Start your virtual machine.

## Webpage not reachable (VMware)

Shutdown your virtual machine (icon in the upper right corner). Right-click on your virtual machine's name in VMware Workstation or VMware Player and click `Settings...`. Click on `Network Adapter` and select `Bridged`. Click `OK` and start your virtual machine.

## Error: listen EADDRINUSE: address already in use :::80

Either close any other software that is using the port 80 or manually edit the last line of index.js (with `nano index.js`, edit the line, then press `Ctrl + O`, `Enter` and `Ctrl + X`).

If you did this, you may need to append your selected port to the address in the browser (like `http://debian:500` or `http://192.168.0.165:500` if your port is 500).

## VirtualHere USB Client doesn't show LEGO READER V2.10

When installing the virtual machine, you have to set the hostname to `debian`.

Alternatively, copy the following command and replace `YOUR_IP_ADDRESS` with your virtual machine's IP address (it looks like `192.168.X.X`, run `hostname -I` to show it). After you've done this, run the modified command while you're inside the `LD-ToyPad-Emulator` folder.

```bash
git reset --hard ; printf '\necho "usbip-vudc.0" > UDC\nusbipd -D --device\nsleep 2;\nusbip attach -r YOUR_IP_ADDRESS -b usbip-vudc.0\nchmod a+rw /dev/hidg0' >> usb_setup_script.sh ; sudo cp usb_setup_script.sh /usr/local/bin/toypad_usb_setup.sh
```

## VirtualHere shows LEGO READER V2.10, but fails with "Operation not permitted"

When double clicking on "LEGO READER V2.10", if it returns `Error "Operation not permitted" (-1) trying to use this device.`. Try these steps:

1. Right click the device in the VirtualHere Client and select "Custom Event Handler..."
2. Add `onReset.$VENDOR_ID$.$PRODUCT_ID$=`

Then try using the device again.

## Webpage not reachable under http://debian/

If you're using a virtual machine, make sure you've applied the solution specific to your software first ([VirtualBox](#webpage-not-reachable-oracle-virtualbox) or [VMware](#webpage-not-reachable-vmware))!

After that, run the command `hostname -I` in your virtual machine (or on your single board computer) and type the IP address that looks like `192.168.X.X` in your webbrowser.

## Cannot pull image

Retry pulling the image using this command:

```
podman pull --arch=your-architecture ghcr.io/berny23/ld-toypad-emulator:latest
```

Be sure to substitute in your architecture. Raspberry Pi OS 64bit uses the arm64 architecture as platform, Raspberry Pi OS 32bit uses linux/arm/v7 as platform, the Raspberry Pi Zero uses linux/arm/v6 as platform, and x86_64 based machines will use linux/amd64 as platform.
