set -e
npm i

rm -Rf deploy/linux/build || true
rm -Rf dist || true
rm deploy/linux/alby-installer-linux/.env.sh || true

npm run build
rm -Rf deploy/linux/alby-installer-linux/assets || true
cp -Rf src/assets deploy/linux/alby-installer-linux


if [ "$ALBY_COMPANION_VERSION" != "" ]
then
    if [ "$ALBY_COMPANION_REPO" = "" ];
    then
        ALBY_COMPANION_REPO="getAlby/alby-companion-rs"
    fi

    if [ "$ALBY_COMPANION_VERSION" = "latest" ];
    then
        curl -L "https://api.github.com/repos/$ALBY_COMPANION_REPO/releases/latest" -o deploy/linux/alby-installer-linux/version.json        
    else 
        curl -L "https://api.github.com/repos/$ALBY_COMPANION_REPO/releases/tags/$ALBY_COMPANION_VERSION" -o deploy/linux/alby-installer-linux/version.json        
    fi

    echo "export ALBY_COMPANION_VERSION_FILE='version.json'" >> deploy/linux/alby-installer-linux/.env.sh

    if [ "$ALBY_COMPANION_FILE" != "" ];
    then
        osarch=`echo $ALBY_COMPANION_FILE | cut -d'.' -f1`
        ext=`echo $ALBY_COMPANION_FILE | cut -d'.' -f2-`
        os=`echo $osarch | cut -d"-" -f1`
        arch=`echo $osarch | cut -d"-" -f2`
 
        releases=`cat deploy/linux/alby-installer-linux/version.json  | grep browser_download_url | cut -d'"' -f4`
        for release in $releases;
        do
            if [[ "$release" == *"-$os"* ]] && [[ "$release" == *"_$arch"* ]] && [[ "$release" == *"_$arch"* ]]  && [[ "$release" == *".$ext" ]] ;
            then
                echo "Dwonload release $release"
                curl -L "$release" -o deploy/linux/alby-installer-linux/$ALBY_COMPANION_FILE
                echo "export ALBY_COMPANION_FILE='$ALBY_COMPANION_FILE'" >> deploy/linux/alby-installer-linux/.env.sh  
            fi
        done

    fi
fi

if [ "$DARK_MODE" != "" ];
then
    echo "export DARK_MODE='$DARK_MODE'" >> deploy/linux/alby-installer-linux/.env.sh  
fi

if [ "$ALBY_COMPANION_REPO" != "" ];
then
    echo "export ALBY_COMPANION_REPO='$ALBY_COMPANION_REPO'" >> deploy/linux/alby-installer-linux/.env.sh  
fi


npx nodegui-packer --pack dist

# Workaround nodegui-packer issue(?) rebuild appimage
rm -Rf deploy/appimage || true
mkdir -p deploy/appimage
cd deploy/appimage
cp ../linux/build/alby-installer-linux/AlbyInstaller-x86_64.AppImage AlbyInstaller-x86_64.AppImage-broken 
./AlbyInstaller-x86_64.AppImage-broken  --appimage-extract
rm squashfs-root/AppRun || true
rm squashfs-root/*.AppImage || true 
cp ../linux/alby-installer-linux/AppRun squashfs-root/

# Repack
mkdir -p tmp
curl -L "https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage" -o tmp/appimagetool
chmod +x tmp/appimagetool
./tmp/appimagetool squashfs-root/
