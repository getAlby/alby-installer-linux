#!/usr/bin/env bash

echo "Welcome to the Alby installer for Linux"
echo "-----------"

installer_path=$(realpath $0)
installer_dir_path=$(dirname $installer_path)

# Download alby companion executable
# TODO: load latest (see: https://github.com/getAlby/alby-installer-macos/blob/main/downloader.rb)
download_url=https://github.com/getAlby/alby-companion-rs/releases/download/v0.5.0/alby-companion-rs_v0.5.0_x86_64-unknown-linux-musl.tar.gz
wget -O alby.tar.gz $download_url
tar -xf alby.tar.gz

# prepare .config/alby folder and copy executable
mkdir -p ~/.config/alby
cp "$installer_dir_path/alby" ~/.config/alby/alby
executable_path=$(realpath ~/.config/alby/alby)

# path for native messaging JSON
native_host_path=~/.mozilla/native-messaging-hosts/alby.json
mkdir -p $(dirname $native_host_path)

echo "{
  \"name\": \"alby\",
  \"description\": \"Alby native messaging to connect to nodes behind Tor\",
  \"path\": \"$executable_path\",
  \"type\": \"stdio\",
  \"allowed_extensions\": [ \"extension@getalby.com\" ]
}" > $native_host_path

echo "DONE. Alby is ready to use in Firefox"
