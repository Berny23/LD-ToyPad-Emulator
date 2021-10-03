<style>
span.tooltip {
    font-weight: bold;
}
[data-tooltip] {
  position: relative;
  cursor: pointer;
}
[data-tooltip]:before,
[data-tooltip]:after {
  line-height: 1;
  font-size: .9em;
  pointer-events: none;
  position: absolute;
  box-sizing: border-box;
  display: none;
  opacity: 0;
}
[data-tooltip]:before {
  content: "";
  border: 5px solid transparent;
  z-index: 100;
}
[data-tooltip]:after {
  content: attr(data-tooltip);
  text-align: center;
  min-width: 3em;
  max-width: 21em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 6px 8px;
  border-radius: 3px;
  background: #bdbdbd;
  color: #000000;
  z-index: 99;
}
[data-tooltip]:hover:before,
[data-tooltip]:hover:after {
  display: block;
  opacity: 1;
}
[data-tooltip]:not([data-flow])::before,
[data-tooltip][data-flow="top"]::before {
  bottom: 100%;
  border-bottom-width: 0;
  border-top-color: #4621FF;
}
[data-tooltip]:not([data-flow])::after,
[data-tooltip][data-flow="top"]::after {
  bottom: calc(100% + 5px);
}
[data-tooltip]:not([data-flow])::before, [tooltip]:not([data-flow])::after,
[data-tooltip][data-flow="top"]::before,
[data-tooltip][data-flow="top"]::after {
  left: 50%;
  -webkit-transform: translate(-50%, -4px);
          transform: translate(-50%, -4px);
}
[data-tooltip][data-flow="bottom"]::before {
  top: 100%;
  border-top-width: 0;
  border-bottom-color: #4621FF;
}
[data-tooltip][data-flow="bottom"]::after {
  top: calc(100% + 5px);
}
[data-tooltip][data-flow="bottom"]::before, [data-tooltip][data-flow="bottom"]::after {
  left: 50%;
  -webkit-transform: translate(-50%, 8px);
          transform: translate(-50%, 8px);
}
[data-tooltip][data-flow="left"]::before {
  top: 50%;
  border-right-width: 0;
  border-left-color: #4621FF;
  left: calc(0em - 5px);
  -webkit-transform: translate(-8px, -50%);
          transform: translate(-8px, -50%);
}
[data-tooltip][data-flow="left"]::after {
  top: 50%;
  right: calc(100% + 5px);
  -webkit-transform: translate(-8px, -50%);
          transform: translate(-8px, -50%);
}
[data-tooltip][data-flow="right"]::before {
  top: 50%;
  border-left-width: 0;
  border-right-color: #4621FF;
  right: calc(0em - 5px);
  -webkit-transform: translate(8px, -50%);
          transform: translate(8px, -50%);
}
[data-tooltip][data-flow="right"]::after {
  top: 50%;
  left: calc(100% + 5px);
  -webkit-transform: translate(8px, -50%);
          transform: translate(8px, -50%);
}
[data-tooltip=""]::after, [data-tooltip=""]::before {
  display: none !important;
}
</style>

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
![](https://i.imgur.com/iyWVObT.png)

Video for Cemu emulator: https://www.youtube.com/watch?v=7CBa9u2ip-Y

## Prerequisites
* **Raspberry Pi Zero W** ($10) or similar single board computer with Network support
* **USB A to micro USB A cable** that supports data transmission (e. g. your phone's charging cable)
* 2 GB+ Micro SD card
* Internet connection on your PC and single board computer

## Installation

1. If you're using a Raspberry Pi Zero W, flash Raspberry Pi OS Lite to your SD card using [the Raspberry Pi Imager tool](https://www.raspberrypi.org/software/) and follow [this](https://www.raspberrypi.org/documentation/configuration/wireless/headless.md) as well as [this](https://www.raspberrypi.org/documentation/remote-access/ssh/README.md) instruction for headless installation.

2. Connect your device to your PC via USB cable (don't use the port on the edge of the Pi Zero!).

4. <span class="tooltip" data-tooltip="like 'ssh pi@192.168.0.165'" data-flow="top">Use SSH</span> to run the following commands:<br>
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
Type your single board computer's IP address in a browser to use the emulator. If you want to turn it off, just use the command from earlier (without -r) to shut the device down via SSH.

Note: Not currently usable on mobile devices.

## Update
To update this software, just pull the latest changes by running the following commands:
````bash
cd LD-ToyPad-Emulator
git pull
npm install
````

## Acknowledgements
* **ags131** for writing one of the main NodeJS libraries I'm using: [https://www.npmjs.com/package/node-ld](https://www.npmjs.com/package/node-ld). My project would've been impossible to create without this guy's research.

* **cort1237** for implementing writing to toy tags as well as several UI updates and support for saving toy tags locally.


## License
[MIT](https://choosealicense.com/licenses/mit/)
