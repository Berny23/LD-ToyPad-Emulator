# ToyPad Emulator for Lego Dimensions

<a href="https://www.buymeacoffee.com/Berny23" title="Donate to this project using Buy Me A Coffee"><img src="https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg" alt="Buy Me A Coffee donate button" /></a>
</span>

Allows you to connect an emulated ToyPad to your PC or video-game console.

## Features
- Supports all available characters and vehicles
- Save vehicle upgrades
- Supports most if not all of the consoles the game is available for (please test if you're able)
- Confirmed working on [Cemu](https://www.youtube.com/watch?v=7CBa9u2ip-Y), real Wii U, [real PS3](https://github.com/Berny23/LD-ToyPad-Emulator/issues/10#issuecomment-933027554) and [real PS4](https://www.reddit.com/r/Legodimensions/comments/pb32zg/comment/hamfj29/?utm_source=share&utm_medium=web2x&context=3)
- Can be configured easily by following the instructions below

## Demo
![image](https://user-images.githubusercontent.com/59704055/140558356-6e876aac-b2fc-4f6c-83d8-78398b755a75.png)


Video for Cemu emulator: https://www.youtube.com/watch?v=7CBa9u2ip-Y

## Prerequisites
* **Raspberry Pi Zero W** ($10) or similar single board computer with Network support
* **USB A to micro USB A cable** that supports data transmission (e. g. your phone's charging cable)
* 2 GB+ Micro SD card
* Internet connection on your PC and single board computer

## Installation

1. If you're using a Raspberry Pi Zero W, flash Raspberry Pi OS Lite to your SD card using [the Raspberry Pi Imager tool](https://www.raspberrypi.org/software/) and follow [this](https://www.raspberrypi.org/documentation/configuration/wireless/headless.md) as well as [this](https://www.raspberrypi.org/documentation/remote-access/ssh/README.md) instruction for headless installation.

2. Connect your device to your PC via USB cable (don't use the port on the edge of the Pi Zero!).

4. Use SSH to run the following commands:<br>
   ```bash
   echo "dtoverlay=dwc2" | sudo tee -a /boot/config.txt
   echo "dwc2" | sudo tee -a /etc/modules
   echo "libcomposite" | sudo tee -a /etc/modules
   echo "usb_f_rndis" | sudo tee -a /etc/modules
   
   sudo apt install -y git
   git clone https://github.com/Berny23/LD-ToyPad-Emulator.git
   cd LD-ToyPad-Emulator
   
   sudo cp usb_setup_script.sh /usr/local/bin/toypad_usb_setup.sh
   sudo chmod +x /usr/local/bin/toypad_usb_setup.sh
   (sudo crontab -l 2>/dev/null; echo "@reboot sudo /usr/local/bin/toypad_usb_setup.sh") | sudo crontab -
   ```
   
5. Reboot you device with this command:
   ```bash
   sudo shutdown -r now
   ```
   
6. Connect via SSH again and run the following commands:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
   
   nvm install 11
   sudo setcap cap_net_bind_service=+ep `readlink -f \`which node\``
   
   cd LD-ToyPad-Emulator
   npm install
   ```
   
7. Run the emulator server with this command:
   ```bash
   node index.js
   ```

## Usage
Type your single board computer's IP address in a browser to use the emulator.

If you want to turn it off, just press `Ctrl + C` in the cmd window, then use the command `sudo shutdown now` to safely power off the device.

Note: Not currently usable on mobile devices.

## Update
To update this software, just pull the latest changes by running the following 3 commands:
````bash
cd LD-ToyPad-Emulator
git pull
npm install
````

**Only use the following command if you get an error**, then run the last two lines from above again:
````bash
git reset --hard
````

## Acknowledgements
* **ags131** for writing one of the main NodeJS libraries I'm using: [https://www.npmjs.com/package/node-ld](https://www.npmjs.com/package/node-ld). My project would've been impossible to create without this guy's research.

* **cort1237** for implementing writing to toy tags as well as several UI updates and support for saving toy tags locally.


## License
[MIT](https://choosealicense.com/licenses/mit/)
