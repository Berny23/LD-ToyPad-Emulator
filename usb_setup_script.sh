#!/bin/bash

# Created by ags131

cd /sys/kernel/config/usb_gadget
mkdir g1
cd g1
echo "0x0E6F" > idVendor
echo "0x0241" > idProduct

mkdir strings/0x409
echo "P.D.P.000000" > strings/0x409/serialnumber
echo "PDP LIMITED. " > strings/0x409/manufacturer
echo "LEGO READER V2.10" > strings/0x409/product

mkdir functions/hid.g0
echo 32 > functions/hid.g0/report_length
echo -ne "\x06\x00\xFF\x09\x01\xA1\x01\x19\x01\x29\x20\x15\x00\x26\xFF\x00\x75\x08\x95\x20\x81\x00\x19\x01\x29\x20\x91\x00\xC0" > functions/hid.g0/report_desc
#mkdir functions/acm.g1
#mkdir functions/ecm.g2

mkdir configs/c.1
mkdir configs/c.1/strings/0x409
echo "LEGO READER V2.10" > configs/c.1/strings/0x409/configuration 
ln -s functions/hid.g0/ configs/c.1/
#ln -s functions/acm.g1/ configs/c.1/
#ln -s functions/ecm.g2/ configs/c.1/
UDC=$(ls /sys/class/udc)
#rmmod libcomposite g_ether u_ether usb_f_rndis
sleep 3;
chmod a+rw /dev/hidg0
