import { FlexLayout, QPixmap, QProgressBar, QScrollArea, QPushButton, QSvgWidget, QIcon, QLabel, QPicture, QGraphicsDropShadowEffect, QMainWindow, QWidget, AspectRatioMode, TransformationMode, AlignmentFlag, QColor, ScrollBarPolicy, Orientation } from '@nodegui/nodegui';
import Fs from 'fs/promises';
import Firefox from './browser/Firefox.js';
import Chrome from './browser/Chrome.js';
import Brave from './browser/Brave.js';
import Chromium from './browser/Chromium.js';
import Companion from './Companion.js';
import Utils from './Utils.js';

const BROWSERS = [
    new Firefox(),
    new Chrome(),
    new Brave(),
    new Chromium()
];

async function createBrowserWidget(browserLayout, browser, progressEl, progressText) {
    // build ui components if needed
    if (!browser.cntEl) {
        const layout = new FlexLayout();

        browser.cntEl = new QWidget();
        browser.cntEl.setLayout(layout);
        browser.cntEl.setObjectName(`browser`);


        const titleEl = new QLabel();
        titleEl.setText(await browser.getName());
        titleEl.setObjectName("browser-title");
        layout.addWidget(titleEl);

        const iconEl = Utils.newResponsiveImage(await browser.getIcon())
        iconEl.setObjectName("browser-icon");
        layout.addWidget(iconEl);

        browser.companionVersionEl = new QLabel();
        browser.companionVersionEl.setAlignment(AlignmentFlag.AlignCenter);
        browser.companionVersionEl.setObjectName("version")
        layout.addWidget(browser.companionVersionEl);

        browser.installBtnEl = new QPushButton();
        browser.installBtnEl.setObjectName("browser-install");
        layout.addWidget(browser.installBtnEl);

        browserLayout.addWidget(browser.cntEl);

        browser.installBtnEl.addEventListener("clicked", async () => {
            if (!browser.found) return;

            const companionPath = await browser.getCompanionPath();
            const latestRelease = await Companion.getLastRelease();

            if (browser.installStatus == 1) {
                await Companion.remove(companionPath);
                await browser.uninstallNativeMessaging();
            } else {
                await Companion.download(latestRelease, companionPath, (desc, progress) => {
                    console.log(desc, progress * 100, "%");
                    progressEl.setValue(Math.floor(progress * 100));
                    progressText.setText(desc);
                });
                await browser.installNativeMessaging();
                await browser.installExtension()
            }
            await reloadBrowsers(browserLayout, progressEl, progressText);
        });
    }

    browser.found = await browser.find();

    if (browser.found) {
        // update ui components
        const companionPath = await browser.getCompanionPath();
        const latestRelease = await Companion.getLastRelease();
        const currentVersion = await Companion.getInstalledVersion(companionPath);

        // 0 = not installed, 1 = installed and updated, 2 = installed outdated
        browser.installStatus = !await browser.isNativeMessagingInstalled() || !currentVersion ? 0 : (currentVersion == latestRelease.version ? 1 : 2);

        browser.companionVersionEl.setText("");
        browser.companionVersionEl.setInlineStyle("");

        switch (browser.installStatus) {
            case 0: {
                browser.installBtnEl.setText("Enable");
                break;
            }
            case 1: {
                browser.companionVersionEl.setText(currentVersion);
                browser.installBtnEl.setText("Disable");
                break;
            }
            case 2: {
                browser.companionVersionEl.setText(currentVersion);
                browser.companionVersionEl.setInlineStyle("color:red;");
                browser.installBtnEl.setText("Update");
                break;
            }
        }
    } else {
        browser.companionVersionEl.setText("Browser not found");
    }

}

async function reloadBrowsers(browserLayout, progressEl, progressText) {
    for (const browser of BROWSERS) {
        await createBrowserWidget(browserLayout, browser, progressEl, progressText);
    }
}

async function main() {
    const win = new QMainWindow();
    win.setWindowTitle("Alby Installer");
    win.setFixedSize(900, 600);

    Utils.setResponsiveStyleSheet(win,
        (await Fs.readFile("./assets/style.css", { encoding: "utf-8" })),
        (await Fs.readFile(await Utils.isDark() ? "./assets/dark.css" : "./assets/light.css", { encoding: "utf-8" }))
    );

    const rootLayout = new FlexLayout();

    const rootView = new QWidget();
    rootView.setLayout(rootLayout);
    rootView.setObjectName("container");

    const iconEl = Utils.newResponsiveImage("./assets/alby_icon.png");
    iconEl.setObjectName("icon");
    rootLayout.addWidget(iconEl);

    const titleEl = new QLabel();
    titleEl.setText("Lightning buzz for your Browser");
    titleEl.setObjectName("title");
    rootLayout.addWidget(titleEl);

    const subtitleEl = new QLabel();
    subtitleEl.setText("Alby brings Bitcoin to the web with in-browser payments and identity, no account required.");
    subtitleEl.setObjectName("subTitle");
    rootLayout.addWidget(subtitleEl);


    const versionEl = new QLabel();
    versionEl.setText((await Companion.getLastRelease()).version);
    versionEl.setAlignment(AlignmentFlag.AlignCenter);
    versionEl.setObjectName("version");
    rootLayout.addWidget(versionEl);


    const browserList = new QWidget();

    rootLayout.addWidget(browserList);


    browserList.setObjectName("browsers");
    const browserLayout = new FlexLayout();
    browserList.setLayout(browserLayout);


    const progressText = new QLabel();
    progressText.setObjectName("progress-text");
    const progressEl = new QProgressBar();
    progressEl.setObjectName("progress");
    progressEl.setRange(0, 100);
    progressEl.setOrientation(Orientation.Horizontal);


    const shadow = new QGraphicsDropShadowEffect();
    shadow.setBlurRadius(12);
    shadow.setColor(new QColor("#fff"))
    shadow.setXOffset(0);
    shadow.setYOffset(0);
    browserList.setGraphicsEffect(shadow);

    await reloadBrowsers(browserLayout, progressEl, progressText);

    rootLayout.addWidget(progressText);

    rootLayout.addWidget(progressEl);


    win.setCentralWidget(rootView);

    win.show();
    global.win = win;
}


main();