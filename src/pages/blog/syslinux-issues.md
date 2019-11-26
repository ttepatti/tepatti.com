---
layout: blog
title: 2019-11-07 - Syslinux Issues
description: A short debugging guide for syslinux issues with the PC Engines APU1.
date: 2019-11-07
type: blog
---

## Syslinux Issues
### 2019-11-07

Recently, I was attempting to flash an operating system onto my PC Engines APU1 system.

Part of that involved following PC Engines' instructions on flashing TinyCore Linux onto a USB device to later install on the APU1.

Interestingly, their instructions specified using syslinux to make the flash drive bootable. Maybe it's because I'm a young'in, but I've never had to make a flash drive bootable by hand before! My usual go-to is just dd-ing a premade ISO image straight to a block device, running 'sync' to make sure everything is good, and popping it out.

I read some documentation on syslinux, and it seemed to be as easy as running 'syslinux -i /dev/sdX1' on the flash drive!

I checked /dev/ but only found a listing for sdb, not sdb1. "Should be fine," I thought to myself, and pushed ahead.

    syslinux -i /dev/sdb

    Error: Device Temporarily Unavailable

Uhh, what? What made it break?

I searched far and wide but couldn't find anything. What could be wrong? I tried formatting my USB a number of times, with different filesystems, everything I could think of. Nothing would get it working!

But then I remembered.

I used sdb, not sdb1.

Why didn't my flashdrive have a '1' after the block device?

Because it's missing a partition table!

I whipped open gparted, selected /dev/sdb, and clicked 'Device' -> 'Create Partition Table'. Created the partition table, assigned the free space to a new FAT16 partition, and what do you know? The new FAT16 partition is /dev/sdb1!

I ran syslinux again

    syslinux -i /dev/sdb1

No error messages! I browsed the flash drive, and what do you know! It has ldlinux.sys and ldlinux.c32, the two syslinux files that I needed. Sweet!

From here, all I had to do was copy the files out of TinyCore6.4_2017.tar.bz2 and into the root of the flash drive. Now, my flash drive contained:

    autostart.sh
    core.gz
    ldlinux.c32
    ldlinux.sys
    syslinux.cfg
    vmlinuz

Sweet, that's everything I need! Pop it into the APU1, and everything boots up as it should! (Note: I had to plug it into the LOWER USB port to get it to work. It did not work in the upper USB port, for some reason.)

Hopefully this helps out someone else who has issues with syslinux or setting up TinyCore Linux on a PC Engines APU.

Cheers!