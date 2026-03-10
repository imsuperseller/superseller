#!/bin/bash
# SuperSeller AI Worker: FFmpeg Management Script
#
# IMPORTANT (Mar 4, 2026): This script is DISABLED in cron.
# The johnvansickle static builds (both "release" and "git/full" variants)
# do NOT include the drawtext filter, which is essential for VideoForge
# text overlays (address, price, room labels, CTA).
#
# We now use the Ubuntu apt-installed FFmpeg (/usr/bin/ffmpeg) which includes
# libfreetype and the drawtext filter. The static build was previously installed
# to /usr/local/bin/ffmpeg and shadowed the apt version.
#
# To update FFmpeg on the server, use: apt update && apt upgrade ffmpeg
#
# DO NOT re-enable the cron job for this script without verifying
# that the replacement build includes drawtext:
#   ffmpeg -filters 2>/dev/null | grep drawtext
#
echo "⚠️  This script is DISABLED. See comments in file header."
echo "The server uses apt-installed FFmpeg with drawtext support."
echo "To update: apt update && apt upgrade ffmpeg"
exit 0
