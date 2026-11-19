/* MC360 look: blades, panels, glass, menus, guide and sounds around an app's own pages.
 * Shared by every web app in the suite. The app's existing pages are shown unchanged
 * inside the open blade (the page host), so every function keeps working.
 *
 *   var mc = MC360.mount({
 *     base: 'mc360/',                         // where the assets are served
 *     app: { name, plat, ver, icon },         // icon: one of the icon names below
 *     blades: [{ key, color, items: [{ id, label, icon, hint }] }],
 *     card: () => ['line', 'line', 'line'],   // status card lines
 *     onOpen: (bladeIndex, item) => {},       // show that page (the engine shows the host)
 *     onHome: (bladeIndex) => {},             // optional: the menu of a blade is showing
 *     host: () => element,                    // optional: element to move into the page host
 *     popupOpen: () => bool,                  // the app has a dialog or menu open
 *     looks: [...], setLook: (name) => {},     // guide
 *     checkUpdates: () => Promise<string>|string, notes: () => [..], signOut: () => {},
 *     calm: () => bool                        // the app's own reduce-motion setting
 *     beforeBack: () => bool                  // optional: handle Esc/back on a page yourself (return true)
 *   });
 *   mc.showPage(bladeIndex, itemId);  mc.home(bladeIndex);  mc.refresh();  mc.toast(t, s);
 *   mc.host (element)  mc.destroy();
 */
(function () {
  'use strict';
  var LAYOUT = {"sprites":{"default:blades-size1-left-nf":["blades-default",0,0,128,1024,1684,1024],"default:blades-size2-left-nf":["blades-default",132,0,128,1024,1684,1024],"default:blades-size3-left-nf":["blades-default",264,0,128,1024,1684,1024],"default:blades-size4-header":["blades-default",396,0,128,1024,1684,1024],"default:blades-size1-right-nf":["blades-default",528,0,128,1024,1684,1024],"default:blades-size2-right-nf":["blades-default",660,0,128,1024,1684,1024],"default:blades-size3-right-nf":["blades-default",792,0,128,1024,1684,1024],"default:blades-blank-left":["blades-default",924,0,64,1024,1684,1024],"default:blades-blank-right":["blades-default",992,0,64,1024,1684,1024],"default:blades-runner-left":["blades-default",1060,0,256,1024,1684,1024],"default:blades-runner-right":["blades-default",1320,0,256,1024,1684,1024],"default:wash-left":["blades-default",1580,0,32,512,1684,1024],"default:wash-right":["blades-default",1616,0,64,512,1684,1024],"glass:blades-size1-left-nf":["blades-glass",0,0,128,1024,1684,1024],"glass:blades-size2-left-nf":["blades-glass",132,0,128,1024,1684,1024],"glass:blades-size3-left-nf":["blades-glass",264,0,128,1024,1684,1024],"glass:blades-size4-header":["blades-glass",396,0,128,1024,1684,1024],"glass:blades-size1-right-nf":["blades-glass",528,0,128,1024,1684,1024],"glass:blades-size2-right-nf":["blades-glass",660,0,128,1024,1684,1024],"glass:blades-size3-right-nf":["blades-glass",792,0,128,1024,1684,1024],"glass:blades-blank-left":["blades-glass",924,0,64,1024,1684,1024],"glass:blades-blank-right":["blades-glass",992,0,64,1024,1684,1024],"glass:blades-runner-left":["blades-glass",1060,0,256,1024,1684,1024],"glass:blades-runner-right":["blades-glass",1320,0,256,1024,1684,1024],"glass:wash-left":["blades-glass",1580,0,32,512,1684,1024],"glass:wash-right":["blades-glass",1616,0,64,512,1684,1024],"carbon:blades-size1-left-nf":["blades-carbon",0,0,128,1024,1684,1024],"carbon:blades-size2-left-nf":["blades-carbon",132,0,128,1024,1684,1024],"carbon:blades-size3-left-nf":["blades-carbon",264,0,128,1024,1684,1024],"carbon:blades-size4-header":["blades-carbon",396,0,128,1024,1684,1024],"carbon:blades-size1-right-nf":["blades-carbon",528,0,128,1024,1684,1024],"carbon:blades-size2-right-nf":["blades-carbon",660,0,128,1024,1684,1024],"carbon:blades-size3-right-nf":["blades-carbon",792,0,128,1024,1684,1024],"carbon:blades-blank-left":["blades-carbon",924,0,64,1024,1684,1024],"carbon:blades-blank-right":["blades-carbon",992,0,64,1024,1684,1024],"carbon:blades-runner-left":["blades-carbon",1060,0,256,1024,1684,1024],"carbon:blades-runner-right":["blades-carbon",1320,0,256,1024,1684,1024],"carbon:wash-left":["blades-carbon",1580,0,32,512,1684,1024],"carbon:wash-right":["blades-carbon",1616,0,64,512,1684,1024],"hl1":["highlights",0,0,256,512,2600,512],"hl2":["highlights",260,0,256,512,2600,512],"hl3":["highlights",520,0,256,512,2600,512],"hl4":["highlights",780,0,256,512,2600,512],"hl5":["highlights",1040,0,256,512,2600,512],"hl6":["highlights",1300,0,256,512,2600,512],"hl7":["highlights",1560,0,256,512,2600,512],"hl8":["highlights",1820,0,256,512,2600,512],"hl9":["highlights",2080,0,256,512,2600,512],"hl10":["highlights",2340,0,256,512,2600,512],"defaultfolderbig":["icons",0,0,64,64,1024,200],"icon-sortby":["icons",68,0,64,64,1024,200],"defaultfolderbackbig":["icons",136,0,64,64,1024,200],"icon-custom":["icons",204,0,64,64,1024,200],"icon-clear":["icons",272,0,64,64,1024,200],"icon-network":["icons",340,0,64,64,1024,200],"icon-scripts":["icons",408,0,64,64,1024,200],"defaultlockedbig":["icons",476,0,64,64,1024,200],"icon-computer":["icons",544,0,64,64,1024,200],"icon-appearance":["icons",612,0,64,64,1024,200],"icon-update":["icons",680,0,64,64,1024,200],"icon-info":["icons",748,0,64,64,1024,200],"defaultfilebig":["icons",816,0,64,64,1024,200],"icon-stack":["icons",884,0,64,64,1024,200],"icon-search":["icons",952,0,64,64,1024,200],"icon-repeat":["icons",0,68,64,64,1024,200],"icon-messages":["icons",68,68,64,64,1024,200],"icon-profile":["icons",136,68,64,64,1024,200],"icon-trailer":["icons",204,68,64,64,1024,200],"icon-viewas":["icons",272,68,64,64,1024,200],"defaultplaylistbig":["icons",340,68,64,64,1024,200],"icon-trophy":["icons",408,68,64,64,1024,200],"defaultharddiskbig":["icons",476,68,64,64,1024,200],"icon-scan":["icons",544,68,64,64,1024,200],"icon-pictures":["icons",612,68,64,64,1024,200],"icon-power":["icons",680,68,64,64,1024,200],"icon-randomize":["icons",748,68,64,64,1024,200],"icon-friends":["icons",816,68,64,64,1024,200],"icon-mute":["icons",884,68,64,64,1024,200],"defaultnetworkbig":["icons",952,68,64,64,1024,200],"icon-switchview":["icons",0,136,64,64,1024,200],"icon-systeminfo":["icons",68,136,64,64,1024,200],"icon-weather":["icons",136,136,64,64,1024,200],"icon-shuffle":["icons",204,136,64,64,1024,200],"defaultvideobig":["icons",272,136,64,64,1024,200],"icon-question":["icons",340,136,64,64,1024,200],"defaultshortcutbig":["icons",408,136,64,64,1024,200],"icon-slideshow":["icons",476,136,64,64,1024,200],"icon-partymode":["icons",544,136,64,64,1024,200],"icon-music":["icons",612,136,64,64,1024,200],"guide-blade-overlay-edge-left":["ui",0,0,256,1024,2048,1900],"guide-blade-overlay-edge-right":["ui",260,0,256,1024,2048,1900],"background-grey":["ui",520,0,512,512,2048,1900],"background-intro":["ui",1036,0,512,512,2048,1900],"dialog-context-middle":["ui",1552,0,256,256,2048,1900],"gamecard_home":["ui",0,1028,512,256,2048,1900],"gamecard_home-focus":["ui",516,1028,512,256,2048,1900],"guide-button-focus":["ui",1032,1028,512,128,2048,1900],"guide-panel1":["ui",0,1288,512,128,2048,1900],"guide-panel1-focus":["ui",516,1288,512,128,2048,1900],"button-focus":["ui",1032,1288,512,128,2048,1900],"big-wide-button-focus":["ui",0,1420,1024,128,2048,1900],"big-wide-button-nofocus":["ui",0,1552,1024,128,2048,1900],"haze-blue-left":["ui",1028,1552,128,128,2048,1900],"haze-blue-right":["ui",1160,1552,128,128,2048,1900],"haze-green-left":["ui",1292,1552,128,128,2048,1900],"haze-green-right":["ui",1424,1552,128,128,2048,1900],"haze-orange-left":["ui",1556,1552,128,128,2048,1900],"haze-orange-right":["ui",1688,1552,128,128,2048,1900],"haze-purple-left":["ui",1820,1552,128,128,2048,1900],"haze-purple-right":["ui",0,1684,128,128,2048,1900],"bkgd-whitewash-glass-top-left":["ui",132,1684,16,64,2048,1900],"bkgd-whitewash-glass-top-right":["ui",152,1684,16,64,2048,1900],"bkgd-whitewash-glass-bottom-left":["ui",172,1684,16,64,2048,1900],"bkgd-whitewash-glass-bottom-right":["ui",192,1684,16,64,2048,1900],"notify-panel":["ui",212,1684,256,64,2048,1900],"button-a":["ui",472,1684,64,64,2048,1900],"button-b":["ui",540,1684,64,64,2048,1900],"button-x":["ui",608,1684,64,64,2048,1900],"button-y":["ui",676,1684,64,64,2048,1900],"button-a-turnedoff":["ui",744,1684,64,64,2048,1900],"button-b-turnedoff":["ui",812,1684,64,64,2048,1900],"button-x-turnedoff":["ui",880,1684,64,64,2048,1900],"button-y-turnedoff":["ui",948,1684,64,64,2048,1900],"guide-selectmediabutton-focus":["ui",1016,1684,512,64,2048,1900],"guide-selectmediabutton-nofocus":["ui",1532,1684,512,64,2048,1900],"dialog-context-button-fo":["ui",0,1816,256,64,2048,1900],"dialog-context-button-nf":["ui",260,1816,256,64,2048,1900],"selectarrow-left":["ui",520,1816,32,64,2048,1900],"selectarrow-right":["ui",556,1816,32,64,2048,1900],"button-back":["ui",592,1816,64,64,2048,1900],"guide-media-button-small-focus":["ui",660,1816,64,32,2048,1900],"guide-media-button-small-nofocus":["ui",728,1816,64,32,2048,1900],"dialog-context-bottom":["ui",796,1816,256,32,2048,1900],"check-box":["ui",1056,1816,32,32,2048,1900],"check-boxnf":["ui",1092,1816,32,32,2048,1900],"iconlist-focus":["ui",1128,1816,512,32,2048,1900],"dialog-context-top":["ui",1644,1816,256,16,2048,1900],"select-left":["ui",1904,1816,16,16,2048,1900],"select-right":["ui",1924,1816,16,16,2048,1900],"select-left-focus":["ui",1944,1816,16,16,2048,1900],"select-right-focus":["ui",1964,1816,16,16,2048,1900],"progress_back":["ui",0,1884,512,16,2048,1900],"progress_mid":["ui",516,1884,512,16,2048,1900],"home_logoshadow":["ui",1032,1884,256,16,2048,1900],"guide-button-seperator":["ui",1292,1884,256,4,2048,1900]},"grads":{"default:tint-blue":"linear-gradient(180deg,rgba(37,51,119,0.820) 0.0%,rgba(36,56,126,0.820) 4.2%,rgba(35,63,135,0.820) 8.3%,rgba(33,71,147,0.820) 12.5%,rgba(31,80,159,0.820) 16.7%,rgba(29,90,172,0.820) 20.8%,rgba(27,100,186,0.820) 25.0%,rgba(25,110,198,0.820) 29.2%,rgba(24,118,210,0.820) 33.3%,rgba(24,126,220,0.820) 37.5%,rgba(24,131,228,0.820) 41.7%,rgba(24,135,233,0.820) 45.8%,rgba(25,135,233,0.820) 50.0%,rgba(27,135,233,0.820) 54.2%,rgba(29,133,231,0.820) 58.3%,rgba(32,130,228,0.820) 62.5%,rgba(36,126,223,0.820) 66.7%,rgba(39,122,217,0.820) 70.8%,rgba(43,117,211,0.820) 75.0%,rgba(47,112,204,0.820) 79.2%,rgba(50,107,198,0.820) 83.3%,rgba(54,102,192,0.820) 87.5%,rgba(56,98,187,0.820) 91.7%,rgba(59,94,182,0.820) 95.8%,rgba(61,92,179,0.820) 100.0%)","default:tint-green":"linear-gradient(180deg,rgba(53,139,37,0.820) 0.0%,rgba(55,144,38,0.820) 4.2%,rgba(58,152,40,0.820) 8.3%,rgba(61,162,42,0.820) 12.5%,rgba(64,172,44,0.820) 16.7%,rgba(68,183,46,0.820) 20.8%,rgba(72,194,48,0.820) 25.0%,rgba(75,204,51,0.820) 29.2%,rgba(78,213,53,0.820) 33.3%,rgba(81,221,55,0.820) 37.5%,rgba(83,226,56,0.820) 41.7%,rgba(85,229,57,0.820) 45.8%,rgba(85,228,58,0.820) 50.0%,rgba(85,226,58,0.820) 54.2%,rgba(85,222,58,0.820) 58.3%,rgba(84,216,58,0.820) 62.5%,rgba(83,208,58,0.820) 66.7%,rgba(81,200,58,0.820) 70.8%,rgba(79,192,58,0.820) 75.0%,rgba(78,183,58,0.820) 79.2%,rgba(76,175,58,0.820) 83.3%,rgba(74,167,58,0.820) 87.5%,rgba(73,160,58,0.820) 91.7%,rgba(72,155,58,0.820) 95.8%,rgba(71,150,58,0.820) 100.0%)","default:tint-orange":"linear-gradient(180deg,rgba(241,123,43,0.820) 0.0%,rgba(242,126,42,0.820) 4.2%,rgba(243,132,41,0.820) 8.3%,rgba(244,138,39,0.820) 12.5%,rgba(246,145,37,0.820) 16.7%,rgba(247,152,35,0.820) 20.8%,rgba(249,160,33,0.820) 25.0%,rgba(251,167,31,0.820) 29.2%,rgba(252,173,29,0.820) 33.3%,rgba(253,179,27,0.820) 37.5%,rgba(254,183,26,0.820) 41.7%,rgba(255,185,26,0.820) 45.8%,rgba(255,185,26,0.820) 50.0%,rgba(255,185,27,0.820) 54.2%,rgba(255,183,28,0.820) 58.3%,rgba(255,180,29,0.820) 62.5%,rgba(254,176,31,0.820) 66.7%,rgba(253,172,33,0.820) 70.8%,rgba(253,168,34,0.820) 75.0%,rgba(252,163,36,0.820) 79.2%,rgba(251,159,38,0.820) 83.3%,rgba(251,155,40,0.820) 87.5%,rgba(250,151,42,0.820) 91.7%,rgba(249,148,43,0.820) 95.8%,rgba(249,146,44,0.820) 100.0%)","default:tint-purple":"linear-gradient(180deg,rgba(112,56,166,0.792) 0.0%,rgba(114,58,170,0.792) 4.2%,rgba(117,61,177,0.792) 8.3%,rgba(121,65,184,0.792) 12.5%,rgba(125,70,192,0.792) 16.7%,rgba(129,74,200,0.792) 20.8%,rgba(134,79,208,0.792) 25.0%,rgba(138,83,216,0.792) 29.2%,rgba(141,87,222,0.792) 33.3%,rgba(143,91,226,0.792) 37.5%,rgba(144,93,226,0.792) 41.7%,rgba(144,95,226,0.792) 45.8%,rgba(142,95,222,0.792) 50.0%,rgba(139,95,216,0.792) 54.2%,rgba(135,94,207,0.792) 58.3%,rgba(130,92,197,0.792) 62.5%,rgba(125,90,184,0.792) 66.7%,rgba(119,88,172,0.792) 70.8%,rgba(112,85,159,0.792) 75.0%,rgba(106,83,145,0.792) 79.2%,rgba(100,80,132,0.792) 83.3%,rgba(94,78,120,0.792) 87.5%,rgba(89,76,110,0.792) 91.7%,rgba(85,74,100,0.792) 95.8%,rgba(82,73,94,0.792) 100.0%)","default:tint-red":"linear-gradient(180deg,rgba(136,5,3,0.976) 0.0%,rgba(144,5,3,1.000) 4.2%,rgba(151,5,3,1.000) 8.3%,rgba(158,5,4,1.000) 12.5%,rgba(166,5,4,1.000) 16.7%,rgba(173,6,4,1.000) 20.8%,rgba(180,6,4,1.000) 25.0%,rgba(187,6,4,1.000) 29.2%,rgba(194,6,5,1.000) 33.3%,rgba(200,7,5,1.000) 37.5%,rgba(204,7,5,1.000) 41.7%,rgba(209,7,5,1.000) 45.8%,rgba(208,7,5,1.000) 50.0%,rgba(203,7,5,1.000) 54.2%,rgba(199,7,5,1.000) 58.3%,rgba(193,6,5,1.000) 62.5%,rgba(186,6,4,1.000) 66.7%,rgba(179,6,4,1.000) 70.8%,rgba(172,6,4,1.000) 75.0%,rgba(165,5,4,1.000) 79.2%,rgba(157,5,4,1.000) 83.3%,rgba(149,5,3,1.000) 87.5%,rgba(141,5,3,1.000) 91.7%,rgba(135,5,3,1.000) 95.8%,rgba(127,5,3,0.976) 100.0%)","default:tint-grey":"linear-gradient(180deg,rgba(185,190,194,1.000) 0.0%,rgba(185,190,194,1.000) 4.2%,rgba(185,190,194,1.000) 8.3%,rgba(185,190,194,1.000) 12.5%,rgba(185,190,194,1.000) 16.7%,rgba(185,190,194,1.000) 20.8%,rgba(185,190,194,1.000) 25.0%,rgba(185,190,194,1.000) 29.2%,rgba(185,190,194,1.000) 33.3%,rgba(185,190,194,1.000) 37.5%,rgba(185,190,194,1.000) 41.7%,rgba(185,190,194,1.000) 45.8%,rgba(185,190,194,1.000) 50.0%,rgba(185,190,194,1.000) 54.2%,rgba(185,190,194,1.000) 58.3%,rgba(185,190,194,1.000) 62.5%,rgba(185,190,194,1.000) 66.7%,rgba(185,190,194,1.000) 70.8%,rgba(185,190,194,1.000) 75.0%,rgba(185,190,194,1.000) 79.2%,rgba(185,190,194,1.000) 83.3%,rgba(185,190,194,1.000) 87.5%,rgba(185,190,194,1.000) 91.7%,rgba(185,190,194,1.000) 95.8%,rgba(164,168,172,1.000) 100.0%)","default:wash-mid":"linear-gradient(180deg,rgba(255,255,255,0.000) 0.0%,rgba(255,255,255,0.000) 4.2%,rgba(255,255,255,0.000) 8.3%,rgba(0,0,0,0.114) 12.5%,rgba(221,220,210,0.502) 16.7%,rgba(223,222,213,0.467) 20.8%,rgba(225,224,217,0.427) 25.0%,rgba(227,226,220,0.388) 29.2%,rgba(230,228,223,0.353) 33.3%,rgba(232,230,227,0.314) 37.5%,rgba(234,231,229,0.286) 41.7%,rgba(235,233,232,0.255) 45.8%,rgba(237,234,234,0.235) 50.0%,rgba(236,234,233,0.239) 54.2%,rgba(235,232,231,0.259) 58.3%,rgba(233,231,229,0.290) 62.5%,rgba(231,229,226,0.325) 66.7%,rgba(229,227,223,0.361) 70.8%,rgba(227,225,219,0.396) 75.0%,rgba(225,223,216,0.439) 79.2%,rgba(222,221,213,0.475) 83.3%,rgba(0,0,0,0.055) 87.5%,rgba(255,255,255,0.000) 91.7%,rgba(255,255,255,0.000) 95.8%,rgba(255,255,255,0.000) 100.0%)","glass:tint-blue":"linear-gradient(180deg,rgba(39,56,167,0.820) 0.0%,rgba(43,64,172,0.820) 4.2%,rgba(48,75,179,0.820) 8.3%,rgba(54,89,188,0.820) 12.5%,rgba(61,104,198,0.820) 16.7%,rgba(68,119,208,0.820) 20.8%,rgba(75,135,219,0.820) 25.0%,rgba(82,150,229,0.820) 29.2%,rgba(88,164,238,0.820) 33.3%,rgba(94,175,245,0.820) 37.5%,rgba(97,184,251,0.820) 41.7%,rgba(100,188,255,0.820) 45.8%,rgba(100,188,255,0.820) 50.0%,rgba(100,186,255,0.820) 54.2%,rgba(98,181,253,0.820) 58.3%,rgba(96,175,249,0.820) 62.5%,rgba(93,166,245,0.820) 66.7%,rgba(89,157,240,0.820) 70.8%,rgba(85,147,235,0.820) 75.0%,rgba(81,136,229,0.820) 79.2%,rgba(77,126,223,0.820) 83.3%,rgba(74,117,218,0.820) 87.5%,rgba(71,108,214,0.820) 91.7%,rgba(68,101,210,0.820) 95.8%,rgba(66,96,207,0.820) 100.0%)","glass:tint-green":"linear-gradient(180deg,rgba(52,186,46,0.820) 0.0%,rgba(61,190,43,0.820) 4.2%,rgba(75,196,38,0.820) 8.3%,rgba(91,203,33,0.820) 12.5%,rgba(108,210,28,0.820) 16.7%,rgba(126,217,22,0.820) 20.8%,rgba(145,226,16,0.820) 25.0%,rgba(162,233,11,0.820) 29.2%,rgba(177,240,6,0.820) 33.3%,rgba(188,246,3,0.820) 37.5%,rgba(196,251,2,0.820) 41.7%,rgba(198,254,2,0.820) 45.8%,rgba(195,254,4,0.820) 50.0%,rgba(188,254,8,0.820) 54.2%,rgba(178,254,13,0.820) 58.3%,rgba(164,253,19,0.820) 62.5%,rgba(147,250,26,0.820) 66.7%,rgba(130,248,34,0.820) 70.8%,rgba(112,244,42,0.820) 75.0%,rgba(93,241,50,0.820) 79.2%,rgba(75,238,58,0.820) 83.3%,rgba(59,235,65,0.820) 87.5%,rgba(43,232,71,0.820) 91.7%,rgba(31,230,77,0.820) 95.8%,rgba(22,228,81,0.820) 100.0%)","glass:tint-orange":"linear-gradient(180deg,rgba(221,108,2,0.820) 0.0%,rgba(223,114,2,0.820) 4.2%,rgba(225,123,2,0.820) 8.3%,rgba(229,134,2,0.820) 12.5%,rgba(232,145,2,0.820) 16.7%,rgba(236,158,2,0.820) 20.8%,rgba(240,171,2,0.820) 25.0%,rgba(243,183,2,0.820) 29.2%,rgba(247,194,2,0.820) 33.3%,rgba(249,204,2,0.820) 37.5%,rgba(252,211,2,0.820) 41.7%,rgba(254,215,2,0.820) 45.8%,rgba(254,215,3,0.820) 50.0%,rgba(254,213,4,0.820) 54.2%,rgba(254,210,6,0.820) 58.3%,rgba(254,205,8,0.820) 62.5%,rgba(254,199,10,0.820) 66.7%,rgba(254,191,12,0.820) 70.8%,rgba(254,183,15,0.820) 75.0%,rgba(254,175,17,0.820) 79.2%,rgba(254,167,19,0.820) 83.3%,rgba(254,159,21,0.820) 87.5%,rgba(254,153,23,0.820) 91.7%,rgba(254,147,24,0.820) 95.8%,rgba(254,144,26,0.820) 100.0%)","glass:tint-purple":"linear-gradient(180deg,rgba(76,62,142,0.820) 0.0%,rgba(83,68,147,0.820) 4.2%,rgba(93,76,154,0.820) 8.3%,rgba(105,85,162,0.820) 12.5%,rgba(118,95,171,0.820) 16.7%,rgba(131,106,181,0.820) 20.8%,rgba(146,117,191,0.820) 25.0%,rgba(159,127,200,0.820) 29.2%,rgba(170,137,209,0.820) 33.3%,rgba(180,145,216,0.820) 37.5%,rgba(187,150,222,0.820) 41.7%,rgba(191,153,226,0.820) 45.8%,rgba(191,153,226,0.820) 50.0%,rgba(188,151,226,0.820) 54.2%,rgba(183,147,225,0.820) 58.3%,rgba(176,141,222,0.820) 62.5%,rgba(168,135,218,0.820) 66.7%,rgba(158,127,214,0.820) 70.8%,rgba(149,120,209,0.820) 75.0%,rgba(138,111,205,0.820) 79.2%,rgba(129,104,200,0.820) 83.3%,rgba(120,97,196,0.820) 87.5%,rgba(112,91,192,0.820) 91.7%,rgba(106,86,189,0.820) 95.8%,rgba(101,82,187,0.820) 100.0%)","glass:tint-red":"linear-gradient(180deg,rgba(136,5,3,0.976) 0.0%,rgba(144,5,3,1.000) 4.2%,rgba(151,5,3,1.000) 8.3%,rgba(158,5,4,1.000) 12.5%,rgba(166,5,4,1.000) 16.7%,rgba(173,6,4,1.000) 20.8%,rgba(180,6,4,1.000) 25.0%,rgba(187,6,4,1.000) 29.2%,rgba(194,6,5,1.000) 33.3%,rgba(200,7,5,1.000) 37.5%,rgba(204,7,5,1.000) 41.7%,rgba(209,7,5,1.000) 45.8%,rgba(208,7,5,1.000) 50.0%,rgba(203,7,5,1.000) 54.2%,rgba(199,7,5,1.000) 58.3%,rgba(193,6,5,1.000) 62.5%,rgba(186,6,4,1.000) 66.7%,rgba(179,6,4,1.000) 70.8%,rgba(172,6,4,1.000) 75.0%,rgba(165,5,4,1.000) 79.2%,rgba(157,5,4,1.000) 83.3%,rgba(149,5,3,1.000) 87.5%,rgba(141,5,3,1.000) 91.7%,rgba(135,5,3,1.000) 95.8%,rgba(127,5,3,0.976) 100.0%)","glass:tint-grey":"linear-gradient(180deg,rgba(81,108,135,1.000) 0.0%,rgba(84,111,138,1.000) 4.2%,rgba(91,118,145,1.000) 8.3%,rgba(100,127,154,1.000) 12.5%,rgba(111,138,164,1.000) 16.7%,rgba(123,150,176,1.000) 20.8%,rgba(135,162,188,1.000) 25.0%,rgba(147,174,199,1.000) 29.2%,rgba(159,185,211,1.000) 33.3%,rgba(169,195,220,1.000) 37.5%,rgba(177,203,228,1.000) 41.7%,rgba(182,208,233,1.000) 45.8%,rgba(185,211,236,1.000) 50.0%,rgba(184,210,235,1.000) 54.2%,rgba(179,205,230,1.000) 58.3%,rgba(172,198,223,1.000) 62.5%,rgba(162,188,213,1.000) 66.7%,rgba(150,177,201,1.000) 70.8%,rgba(138,165,189,1.000) 75.0%,rgba(125,152,176,1.000) 79.2%,rgba(112,140,164,1.000) 83.3%,rgba(101,129,153,1.000) 87.5%,rgba(91,119,143,1.000) 91.7%,rgba(84,112,136,1.000) 95.8%,rgba(82,110,134,1.000) 100.0%)","glass:wash-mid":"linear-gradient(180deg,rgba(255,255,255,0.000) 0.0%,rgba(255,255,255,0.000) 4.2%,rgba(255,255,255,0.000) 8.3%,rgba(0,0,0,0.114) 12.5%,rgba(221,220,210,0.502) 16.7%,rgba(223,222,213,0.467) 20.8%,rgba(225,224,217,0.427) 25.0%,rgba(227,226,220,0.388) 29.2%,rgba(230,228,223,0.353) 33.3%,rgba(232,230,227,0.314) 37.5%,rgba(234,231,229,0.286) 41.7%,rgba(235,233,232,0.255) 45.8%,rgba(237,234,234,0.235) 50.0%,rgba(236,234,233,0.239) 54.2%,rgba(235,232,231,0.259) 58.3%,rgba(233,231,229,0.290) 62.5%,rgba(231,229,226,0.325) 66.7%,rgba(229,227,223,0.361) 70.8%,rgba(227,225,219,0.396) 75.0%,rgba(225,223,216,0.439) 79.2%,rgba(222,221,213,0.475) 83.3%,rgba(0,0,0,0.055) 87.5%,rgba(255,255,255,0.000) 91.7%,rgba(255,255,255,0.000) 95.8%,rgba(255,255,255,0.000) 100.0%)","carbon:tint-blue":"linear-gradient(180deg,rgba(15,57,65,0.820) 0.0%,rgba(14,59,70,0.820) 4.2%,rgba(13,63,77,0.820) 8.3%,rgba(11,68,84,0.820) 12.5%,rgba(9,74,93,0.820) 16.7%,rgba(6,79,101,0.820) 20.8%,rgba(4,85,111,0.820) 25.0%,rgba(2,90,119,0.820) 29.2%,rgba(1,94,126,0.820) 33.3%,rgba(0,98,132,0.820) 37.5%,rgba(0,100,136,0.820) 41.7%,rgba(0,101,138,0.820) 45.8%,rgba(1,100,137,0.820) 50.0%,rgba(3,97,135,0.820) 54.2%,rgba(5,94,131,0.820) 58.3%,rgba(8,90,125,0.820) 62.5%,rgba(12,85,118,0.820) 66.7%,rgba(15,79,111,0.820) 70.8%,rgba(19,74,104,0.820) 75.0%,rgba(23,68,96,0.820) 79.2%,rgba(26,62,89,0.820) 83.3%,rgba(29,57,82,0.820) 87.5%,rgba(32,52,75,0.820) 91.7%,rgba(35,48,70,0.820) 95.8%,rgba(37,45,66,0.820) 100.0%)","carbon:tint-green":"linear-gradient(180deg,rgba(54,101,2,0.820) 0.0%,rgba(59,107,2,0.820) 4.2%,rgba(66,115,2,0.820) 8.3%,rgba(74,125,1,0.820) 12.5%,rgba(83,136,1,0.820) 16.7%,rgba(93,148,1,0.820) 20.8%,rgba(102,160,1,0.820) 25.0%,rgba(111,171,1,0.820) 29.2%,rgba(119,181,0,0.820) 33.3%,rgba(126,189,0,0.820) 37.5%,rgba(130,195,0,0.820) 41.7%,rgba(132,198,0,0.820) 45.8%,rgba(131,198,0,0.820) 50.0%,rgba(129,195,0,0.820) 54.2%,rgba(124,191,0,0.820) 58.3%,rgba(119,185,0,0.820) 62.5%,rgba(111,178,1,0.820) 66.7%,rgba(104,170,1,0.820) 70.8%,rgba(96,162,1,0.820) 75.0%,rgba(88,153,1,0.820) 79.2%,rgba(80,144,1,0.820) 83.3%,rgba(72,137,1,0.820) 87.5%,rgba(66,130,2,0.820) 91.7%,rgba(60,124,2,0.820) 95.8%,rgba(56,119,2,0.820) 100.0%)","carbon:tint-orange":"linear-gradient(180deg,rgba(136,81,2,0.820) 0.0%,rgba(142,86,2,0.820) 4.2%,rgba(152,92,2,0.820) 8.3%,rgba(163,100,2,0.820) 12.5%,rgba(176,108,1,0.820) 16.7%,rgba(189,117,1,0.820) 20.8%,rgba(203,127,1,0.820) 25.0%,rgba(216,136,1,0.820) 29.2%,rgba(228,144,1,0.820) 33.3%,rgba(239,152,0,0.820) 37.5%,rgba(248,157,0,0.820) 41.7%,rgba(254,162,0,0.820) 45.8%,rgba(255,162,0,0.820) 50.0%,rgba(255,162,0,0.820) 54.2%,rgba(255,162,0,0.820) 58.3%,rgba(255,162,0,0.820) 62.5%,rgba(254,162,0,0.820) 66.7%,rgba(251,159,0,0.820) 70.8%,rgba(247,157,0,0.820) 75.0%,rgba(242,154,0,0.820) 79.2%,rgba(238,151,0,0.820) 83.3%,rgba(234,149,0,0.820) 87.5%,rgba(231,146,0,0.820) 91.7%,rgba(228,145,0,0.820) 95.8%,rgba(226,143,0,0.820) 100.0%)","carbon:tint-purple":"linear-gradient(180deg,rgba(40,33,73,0.820) 0.0%,rgba(43,36,81,0.820) 4.2%,rgba(48,39,93,0.820) 8.3%,rgba(53,43,106,0.820) 12.5%,rgba(58,48,121,0.820) 16.7%,rgba(64,53,136,0.820) 20.8%,rgba(71,58,153,0.820) 25.0%,rgba(76,63,168,0.820) 29.2%,rgba(81,67,181,0.820) 33.3%,rgba(86,71,193,0.820) 37.5%,rgba(89,74,202,0.820) 41.7%,rgba(91,76,207,0.820) 45.8%,rgba(91,76,207,0.820) 50.0%,rgba(91,76,206,0.820) 54.2%,rgba(90,76,202,0.820) 58.3%,rgba(88,76,196,0.820) 62.5%,rgba(85,75,188,0.820) 66.7%,rgba(82,74,180,0.820) 70.8%,rgba(79,72,171,0.820) 75.0%,rgba(75,71,161,0.820) 79.2%,rgba(72,69,152,0.820) 83.3%,rgba(69,68,143,0.820) 87.5%,rgba(66,66,135,0.820) 91.7%,rgba(64,65,129,0.820) 95.8%,rgba(62,64,124,0.820) 100.0%)","carbon:tint-red":"linear-gradient(180deg,rgba(136,5,3,0.976) 0.0%,rgba(144,5,3,1.000) 4.2%,rgba(151,5,3,1.000) 8.3%,rgba(158,5,4,1.000) 12.5%,rgba(166,5,4,1.000) 16.7%,rgba(173,6,4,1.000) 20.8%,rgba(180,6,4,1.000) 25.0%,rgba(187,6,4,1.000) 29.2%,rgba(194,6,5,1.000) 33.3%,rgba(200,7,5,1.000) 37.5%,rgba(204,7,5,1.000) 41.7%,rgba(209,7,5,1.000) 45.8%,rgba(208,7,5,1.000) 50.0%,rgba(203,7,5,1.000) 54.2%,rgba(199,7,5,1.000) 58.3%,rgba(193,6,5,1.000) 62.5%,rgba(186,6,4,1.000) 66.7%,rgba(179,6,4,1.000) 70.8%,rgba(172,6,4,1.000) 75.0%,rgba(165,5,4,1.000) 79.2%,rgba(157,5,4,1.000) 83.3%,rgba(149,5,3,1.000) 87.5%,rgba(141,5,3,1.000) 91.7%,rgba(135,5,3,1.000) 95.8%,rgba(127,5,3,0.976) 100.0%)","carbon:tint-grey":"linear-gradient(180deg,rgba(17,17,17,1.000) 0.0%,rgba(19,19,19,1.000) 4.2%,rgba(22,22,22,1.000) 8.3%,rgba(25,25,25,1.000) 12.5%,rgba(28,28,28,1.000) 16.7%,rgba(31,31,31,1.000) 20.8%,rgba(34,34,34,1.000) 25.0%,rgba(36,36,36,1.000) 29.2%,rgba(39,39,39,1.000) 33.3%,rgba(40,40,40,1.000) 37.5%,rgba(42,42,42,1.000) 41.7%,rgba(44,44,44,1.000) 45.8%,rgba(44,44,44,1.000) 50.0%,rgba(44,44,44,1.000) 54.2%,rgba(44,44,44,1.000) 58.3%,rgba(44,44,44,1.000) 62.5%,rgba(44,44,44,1.000) 66.7%,rgba(44,44,44,1.000) 70.8%,rgba(44,44,44,1.000) 75.0%,rgba(44,44,44,1.000) 79.2%,rgba(44,44,44,1.000) 83.3%,rgba(43,43,43,1.000) 87.5%,rgba(39,39,39,1.000) 91.7%,rgba(36,36,36,1.000) 95.8%,rgba(36,36,36,1.000) 100.0%)","carbon:wash-mid":"linear-gradient(180deg,rgba(255,255,255,0.000) 0.0%,rgba(255,255,255,0.000) 4.2%,rgba(255,255,255,0.000) 8.3%,rgba(0,0,0,0.078) 12.5%,rgba(221,220,210,0.353) 16.7%,rgba(223,222,213,0.329) 20.8%,rgba(225,224,217,0.298) 25.0%,rgba(227,226,220,0.271) 29.2%,rgba(230,228,223,0.251) 33.3%,rgba(232,230,227,0.220) 37.5%,rgba(234,231,229,0.200) 41.7%,rgba(235,233,232,0.180) 45.8%,rgba(237,234,234,0.165) 50.0%,rgba(236,234,233,0.165) 54.2%,rgba(235,232,231,0.184) 58.3%,rgba(233,231,229,0.204) 62.5%,rgba(231,229,226,0.227) 66.7%,rgba(229,227,223,0.255) 70.8%,rgba(227,225,219,0.278) 75.0%,rgba(225,223,216,0.306) 79.2%,rgba(222,221,213,0.333) 83.3%,rgba(0,0,0,0.039) 87.5%,rgba(255,255,255,0.000) 91.7%,rgba(255,255,255,0.000) 95.8%,rgba(255,255,255,0.000) 100.0%)","bkgd-whitewash-glass-top-middle":"linear-gradient(180deg,rgba(224,224,212,0.463) 0.0%,rgba(227,226,214,0.439) 4.2%,rgba(228,227,216,0.424) 8.3%,rgba(229,228,218,0.400) 12.5%,rgba(231,230,220,0.384) 16.7%,rgba(232,231,222,0.361) 20.8%,rgba(234,233,225,0.337) 25.0%,rgba(235,234,226,0.318) 29.2%,rgba(237,236,229,0.294) 33.3%,rgba(239,238,232,0.271) 37.5%,rgba(240,239,234,0.255) 41.7%,rgba(242,241,236,0.231) 45.8%,rgba(243,243,239,0.208) 50.0%,rgba(244,244,240,0.192) 54.2%,rgba(246,246,243,0.169) 58.3%,rgba(247,247,244,0.157) 62.5%,rgba(249,249,246,0.133) 66.7%,rgba(250,250,248,0.114) 70.8%,rgba(251,251,250,0.102) 75.0%,rgba(252,252,251,0.086) 79.2%,rgba(253,253,253,0.075) 83.3%,rgba(254,254,253,0.059) 87.5%,rgba(255,255,254,0.047) 91.7%,rgba(255,255,255,0.039) 95.8%,rgba(255,255,255,0.020) 100.0%)","bkgd-whitewash-glass-bottom-middle":"linear-gradient(180deg,rgba(255,255,255,0.031) 0.0%,rgba(255,255,255,0.031) 4.2%,rgba(255,255,255,0.031) 8.3%,rgba(255,255,255,0.031) 12.5%,rgba(255,255,255,0.031) 16.7%,rgba(255,255,255,0.031) 20.8%,rgba(255,255,255,0.031) 25.0%,rgba(255,255,255,0.031) 29.2%,rgba(255,255,255,0.031) 33.3%,rgba(255,255,255,0.035) 37.5%,rgba(255,255,255,0.043) 41.7%,rgba(254,254,254,0.051) 45.8%,rgba(253,253,253,0.067) 50.0%,rgba(253,253,252,0.075) 54.2%,rgba(252,252,251,0.090) 58.3%,rgba(251,251,250,0.098) 62.5%,rgba(250,250,248,0.118) 66.7%,rgba(249,249,246,0.133) 70.8%,rgba(248,247,245,0.145) 75.0%,rgba(246,246,243,0.165) 79.2%,rgba(245,245,242,0.180) 83.3%,rgba(244,244,240,0.196) 87.5%,rgba(242,242,238,0.220) 91.7%,rgba(241,241,236,0.231) 95.8%,rgba(240,239,234,0.255) 100.0%)","guide-blade-overlay-tile":"linear-gradient(180deg,rgba(58,66,55,0.792) 0.0%,rgba(87,96,84,0.529) 4.2%,rgba(108,115,105,0.506) 8.3%,rgba(59,59,58,0.980) 12.5%,rgba(255,255,255,0.192) 16.7%,rgba(255,255,255,0.173) 20.8%,rgba(255,255,255,0.153) 25.0%,rgba(255,255,255,0.141) 29.2%,rgba(255,255,255,0.125) 33.3%,rgba(255,255,255,0.110) 37.5%,rgba(255,255,255,0.102) 41.7%,rgba(255,255,255,0.090) 45.8%,rgba(255,255,255,0.098) 50.0%,rgba(255,255,255,0.110) 54.2%,rgba(255,255,255,0.118) 58.3%,rgba(255,255,255,0.133) 62.5%,rgba(255,255,255,0.149) 66.7%,rgba(255,255,255,0.165) 70.8%,rgba(255,255,255,0.184) 75.0%,rgba(255,255,255,0.227) 79.2%,rgba(43,52,40,0.729) 83.3%,rgba(70,79,66,0.502) 87.5%,rgba(103,110,100,0.498) 91.7%,rgba(116,123,113,0.518) 95.8%,rgba(114,121,112,0.569) 100.0%)","divider":"rgba(0,0,0,0.400)"}};
  var SPR = LAYOUT.sprites, GR = LAYOUT.grads;
  var ICON = {
    list: 'defaultfolderbig', down: 'icon-sortby', up: 'defaultfolderbackbig', plus: 'icon-custom', trash: 'icon-clear',
    rss: 'icon-network', rule: 'icon-scripts', shield: 'defaultlockedbig', net: 'icon-network', gauge: 'icon-computer',
    folder: 'defaultfolderbig', palette: 'icon-appearance', refresh: 'icon-update', info: 'icon-info', doc: 'defaultfilebig',
    alert: 'icon-question', copy: 'icon-stack', gem: 'icon-trophy', search: 'icon-search', clock: 'icon-repeat',
    gear: 'icon-scripts', apps: 'icon-switchview', plug: 'defaultnetworkbig', bell: 'icon-messages', tag: 'icon-profile',
    tv: 'defaultvideobig', film: 'icon-trailer', cal: 'icon-viewas', queue: 'defaultplaylistbig', block: 'icon-clear',
    star: 'icon-trophy', disk: 'defaultharddiskbig', task: 'icon-scan', cc: 'icon-slideshow', eye: 'icon-pictures',
    bolt: 'icon-power', swirl: 'icon-randomize', user: 'icon-friends', music: 'icon-music', mute: 'icon-mute'
  };
  var TINT = { green: 'green', orange: 'orange', blue: 'blue', purple: 'purple', grey: 'grey', red: 'red' };
  var HAZE = { green: 1, orange: 1, blue: 1, purple: 1 };
  var SKINS = ['default', 'glass', 'carbon'];
  var VOLS = [0.2, 0.4, 0.6, 0.8, 1];
  var SOUNDS = ['back', 'bladeslide_1', 'bladeslide_2', 'bladeslide_3', 'bladeslide_4', 'cursor', 'guide_close', 'guide_open',
    'startup', 'notification', 'select', 'tier2_enter', 'tier2_exit', 'tier3_enter', 'tier3_exit'];
  // left edge of the open blade's strip, and of a right-hand blade's strip (measured from the skin art, 128x1024 drawn 80x576)
  var EDGE = [[0, 8], [64, 16], [128, 23], [192, 29], [256, 34], [320, 38], [384, 40], [448, 42], [512, 43], [576, 43], [640, 42], [704, 39], [768, 36], [832, 31], [896, 25], [960, 18], [1024, 11]];
  var EDGE_R = [[0, 54], [64, 45], [128, 38], [192, 32], [256, 28], [320, 24], [384, 21], [448, 19], [512, 19], [576, 19], [640, 20], [704, 22], [768, 25], [832, 30], [896, 35], [960, 42], [1024, 51]];
  var LABY = { 'blades-size4-header': 155, 'blades-size3-left-nf': 163, 'blades-size2-left-nf': 170, 'blades-size1-left-nf': 177, 'blades-size3-right-nf': 163, 'blades-size2-right-nf': 170, 'blades-size1-right-nf': 177 };
  var EASE = 'cubic-bezier(.22,.9,.25,1)';
  var DARK = '#000', SH_GREY = '1px 1px 0 rgba(218,218,218,.63)', SH_BLACK = '1px 1px 0 #000, 0 0 3px rgba(0,0,0,.55)';

  function px(n) { return (Math.round(n * 100) / 100) + 'px'; }
  function curvePts(x, edge, pad) { return edge.map(function (e) { return px(x + e[1] * 0.625 + pad) + ' ' + Math.round(e[0] * 0.5625) + 'px'; }); }
  function edgeClip(x, edge) { return 'polygon(' + curvePts(x, edge || EDGE, 2).join(',') + ',6000px 576px,6000px 0px)'; }
  function leftOfClip(x, edge, pad) { return 'polygon(-10px 0px,' + curvePts(x, edge, pad).join(',') + ',-10px 576px)'; }
  function prefersCalm() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  function isTyping(t) { return !!t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || '')); }
  function el(tag, cls, parent) { var e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; }

  function loadPrefs() { try { return Object.assign({ skin: 'default', sound: true, vol: 0.6, calm: false }, JSON.parse(localStorage.getItem('mc360-prefs') || '{}')); } catch (e) { return { skin: 'default', sound: true, vol: 0.6, calm: false }; } }
  function savePrefs(p) { try { localStorage.setItem('mc360-prefs', JSON.stringify(p)); } catch (e) {} }

  function mount(opts) {
    var base = opts.base == null ? 'mc360/' : opts.base;
    var U = function (f) { return base + f; };
    var prefs = loadPrefs();
    var st = { b: 0, sel: 0, tier: 1, item: null, guide: false, gsel: 0, ghost: null, toast: null, upd: 'idle', lookPick: null, clock: '' };
    var timers = [], audio = {}, destroyed = false, startupDone = false;
    try { startupDone = sessionStorage.getItem('mc360-started') === '1'; } catch (e) {}

    // ---------- DOM ----------
    var root = el('div', 'mc360-root');
    root.setAttribute('role', 'application');
    root.setAttribute('aria-label', (opts.app && opts.app.name) || 'App');
    var stage = el('div', 'mc-stage', root);
    var main = el('div', 'mc-pan trf', stage);
    var video = el('video', 'mc-swirl mc-vid ft', main);
    video.muted = true; video.loop = true; video.autoplay = true; video.playsInline = true; video.setAttribute('playsinline', '');
    var still = el('img', 'mc-swirl mc-still ft', main); still.alt = '';
    var Lframe = { rects: el('div', 'mc-layer', main), sprites: el('div', 'mc-layer', main) };
    var ghostWrap = el('div', 'mc-layer', stage);
    var content = el('div', 'mc-layer mc-content', stage);
    var Lc = { rects: el('div', 'mc-layer', content), sprites: el('div', 'mc-layer', content), shine: el('div', 'mc-layer', content), texts: el('div', 'mc-layer', content), hits: el('div', 'mc-layer', content) };
    var Lrun = el('div', 'mc-layer', stage); Lrun.style.zIndex = 20;
    var Lbl = el('div', 'mc-layer', stage); Lbl.style.zIndex = 30;
    var Lhz = el('div', 'mc-layer', stage); Lhz.style.zIndex = 80;
    var Lbh = el('div', 'mc-layer', stage); Lbh.style.zIndex = 95;
    var host = el('div', 'mc-host', root);
    var front = el('div', 'mc-stage mc-front', root);
    var guideWrap = el('div', 'mc-layer', front);
    var toastWrap = el('div', 'mc-layer', front);
    var shineImg = null;

    var moved = null;
    if (opts.host) { var pe = opts.host(); if (pe) { moved = { el: pe, parent: pe.parentNode, next: pe.nextSibling }; host.appendChild(pe); } }
    document.body.appendChild(root);
    document.body.classList.add('mc360');

    // ---------- helpers ----------
    function skinFile(f) { return f.replace('{skin}', prefs.skin); }
    function S(name, x, y, w, h, z, extra, crop) {
      var a = SPR[name];
      if (!a) return null;
      var c = crop || [0, 0, a[3], a[4]];
      var sx = w / c[2], sy = h / c[3];
      return {
        box: 'left:' + px(x) + ';top:' + px(y) + ';width:' + px(w) + ';height:' + px(h) + ';z-index:' + (z || 0) + ';' + (extra || ''),
        img: 'width:' + px(a[5] * sx) + ';height:' + px(a[6] * sy) + ';left:' + px(-(a[1] + c[0]) * sx) + ';top:' + px(-(a[2] + c[1]) * sy),
        src: U(a[0] + '.png')
      };
    }
    function R(x, y, w, h, bg, z, extra) { return { style: 'left:' + px(x) + ';top:' + px(y) + ';width:' + px(Math.max(0, w)) + ';height:' + px(h) + ';background:' + bg + ';z-index:' + (z || 0) + ';' + (extra || '') }; }
    function Tx(text, x, y, size, color, z, extra) { return { text: text, style: 'left:' + px(x) + ';top:' + px(y) + ';font-size:' + size + 'px;color:' + color + ';z-index:' + (z || 0) + ';' + (extra || '') }; }
    function Hit(x, y, w, h, run, hover, label) { return { style: 'left:' + px(x) + ';top:' + px(y) + ';width:' + px(w) + ';height:' + px(h), run: run, hover: hover, label: label || '' }; }

    // Paint a list into a layer, reusing children by position (each layer's length is stable for its kind).
    function paint(layer, list, kind, cls) {
      list = list.filter(Boolean);
      while (layer.children.length > list.length) layer.removeChild(layer.lastChild);
      list.forEach(function (it, i) {
        var n = layer.children[i];
        if (kind === 'spr') {
          if (!n) { n = el('div', 'mc-spr' + (cls ? ' ' + cls : ''), layer); el('img', '', n).alt = ''; }
          if (n._box !== it.box) { n.style.cssText = it.box; n._box = it.box; }
          var im = n.firstChild;
          if (im.getAttribute('src') !== it.src) im.setAttribute('src', it.src);
          if (n._img !== it.img) { im.style.cssText = it.img; n._img = it.img; }
        } else if (kind === 'rect') {
          if (!n) n = el('div', 'mc-rect' + (cls ? ' ' + cls : ''), layer);
          if (n._s !== it.style) { n.style.cssText = it.style; n._s = it.style; }
        } else if (kind === 'txt') {
          if (!n) n = el('div', 'mc-txt' + (cls ? ' ' + cls : ''), layer);
          if (n._s !== it.style) { n.style.cssText = it.style; n._s = it.style; }
          if (n.textContent !== it.text) n.textContent = it.text;
        } else if (kind === 'hit') {
          if (!n) { n = el('button', 'mc-hit', layer); n.type = 'button'; n.tabIndex = -1; n.onclick = function (e) { e.stopPropagation(); if (n._run) n._run(); }; n.onmouseenter = function () { if (n._hover) n._hover(); }; }
          if (n._s !== it.style) { n.style.cssText = it.style; n._s = it.style; }
          n._run = it.run; n._hover = it.hover;
          if (n.getAttribute('aria-label') !== it.label) n.setAttribute('aria-label', it.label);
        } else if (kind === 'blade') {
          if (!n) { n = el('div', 'mc-layer', layer); var sp = el('div', 'mc-spr tr', n); el('img', '', sp).alt = ''; el('div', 'mc-txt tr', n); }
          n.style.zIndex = it.z;
          var s2 = n.firstChild, t2 = n.lastChild;
          if (s2._box !== it.s.box) { s2.style.cssText = it.s.box; s2._box = it.s.box; }
          if (s2.firstChild.getAttribute('src') !== it.s.src) s2.firstChild.setAttribute('src', it.s.src);
          if (s2._img !== it.s.img) { s2.firstChild.style.cssText = it.s.img; s2._img = it.s.img; }
          if (t2._s !== it.t.style) { t2.style.cssText = it.t.style; t2._s = it.t.style; }
          if (t2.textContent !== it.t.text) t2.textContent = it.t.text;
        }
      });
    }

    // ---------- sound ----------
    SOUNDS.forEach(function (k) { try { var a = new Audio(U('snd/' + k + '.mp3')); a.preload = 'auto'; audio[k] = a; } catch (e) {} });
    function play(k) {
      if (!prefs.sound || destroyed) return;
      var a0 = audio[k]; if (!a0) return;
      try { var a = a0.cloneNode(); a.volume = prefs.vol; var p = a.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
    }
    function firstGesture() {
      if (startupDone) return;
      startupDone = true;
      try { sessionStorage.setItem('mc360-started', '1'); } catch (e) {}
      play('startup');
    }

    // ---------- state ----------
    var W = 1024, s = 1;
    function calm() { return prefs.calm || prefersCalm() || !!(opts.calm && opts.calm()); }
    function blades() { return opts.blades || []; }
    function N() { return blades().length; }
    function blade(i) { return blades()[i === undefined ? st.b : i] || { key: '', color: 'grey', items: [] }; }
    function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
    function xr(j) { return W - 87 - 35 * (N() - 1 - j); }
    function homeGeom(b) { return { xh: 18 + 35 * b, end: b < N() - 1 ? xr(b + 1) + 65 : W }; }
    function bladePos(b, tier) {
      var res = [], n = N();
      var depth = function (d, side) { return d === 1 ? 'blades-size3-' + side + '-nf' : d === 2 ? 'blades-size2-' + side + '-nf' : 'blades-size1-' + side + '-nf'; };
      for (var i = 0; i < n; i++) {
        if (i === b) res.push({ x: tier === 1 ? 18 + 35 * b : -40, tex: 'blades-size4-header', side: 'h' });
        else if (i < b) res.push({ x: tier === 1 ? 18 + 35 * i : -120 - 35 * (b - i), tex: depth(b - i, 'left'), side: 'l' });
        else res.push({ x: tier === 1 ? xr(i) : W + 40 + 35 * (i - b), tex: depth(i - b, 'right'), side: 'r' });
      }
      return res;
    }
    function measure() {
      var h = window.innerHeight || 576, w = window.innerWidth || 1024;
      s = Math.max(0.6, Math.min(3, h / 576));
      W = Math.max(560, w / s);
      [stage, front].forEach(function (x) { x.style.width = px(W); x.style.transform = 'scale(' + s + ')'; });
    }

    // ---------- layout ----------
    function frame(out, x0, end, col, tier, washEnd, into) {
      var v = prefs.skin, T = into || out, we = washEnd || end;
      T.swirl = [x0, end - x0];
      T.clipX = x0;
      var fade = 'mask-image:linear-gradient(90deg,transparent 0,#000 46px,#000 calc(100% - 46px),transparent 100%);-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 46px,#000 calc(100% - 46px),transparent 100%)';
      T.frameRects.push(R(x0, 0, end - x0, 576, GR[v + ':tint-' + TINT[col || 'grey']], 1));
      T.frameRects.push(R(x0 + 30, 0, we - 16 - (x0 + 30), 576, GR[v + ':wash-mid'], 2, fade));
      T.frameRects.push(R(x0 + 40, 0, we - 20 - (x0 + 40), 64, GR['bkgd-whitewash-glass-top-middle'], 3, fade));
      T.frameRects.push(R(x0 + 40, 512, we - 20 - (x0 + 40), 64, GR['bkgd-whitewash-glass-bottom-middle'], 3, fade));
      if (into) return;
      out.runners.push(S(v + ':blades-runner-left', tier === 1 ? -61 : -119, 0, 128, 576, 20));
      out.runners.push(S(v + ':blades-runner-right', tier === 1 ? W - 55 : W + 40, 0, 128, 576, 20));
      var hz = HAZE[col] ? col : 'blue', show = !!HAZE[col] && tier === 1;
      out.hazes.push(S('haze-' + hz + '-left', x0 - 88, 350, 150, 228, 80, show ? '' : 'opacity:0'));
      out.hazes.push(S('haze-' + hz + '-right', end - 41, 350, 150, 228, 80, show ? '' : 'opacity:0'));
    }
    function bladesOut(out, tier) {
      var v = prefs.skin, b = st.b;
      bladePos(b, tier).forEach(function (P, i) {
        var z = P.side === 'l' ? 21 + i : P.side === 'h' ? 50 : 60 - i;
        var lx = P.side === 'r' ? P.x + 39.5 : P.x + 54.5;
        out.bladeItems.push({ z: z, s: S(v + ':' + P.tex, P.x, 0, 80, 576, 0), t: Tx(blade(i).key, lx, LABY[P.tex], 17, P.side === 'h' ? '#000' : '#353535', 1, 'transform:rotate(90deg);transform-origin:0 0') });
        if (tier === 1 && P.side !== 'h') out.bladeHits.push(Hit(P.x + 20, 0, P.side === 'l' ? 35 : 40, 576, function () { go(i); }, null, 'Open ' + blade(i).key));
      });
      if (tier === 2) out.bladeHits.push(Hit(0, 0, 30, 576, function () { back(); }, null, 'Back to ' + blade(b).key));
    }
    function title(k) { return k.charAt(0).toUpperCase() + k.slice(1); }
    function buttons(out, lx, end) {
      var lab = 'text-shadow:' + SH_BLACK;
      out.sprites.push(S('button-y', lx, 505, 21, 21, 40));
      out.sprites.push(S('button-x', lx - 13, 525, 21, 21, 40));
      out.texts.push(Tx('guide', lx + 26, 508, 15, '#fff', 41, lab));
      out.texts.push(Tx('sound ' + (prefs.sound ? 'on' : 'off'), lx + 13, 528, 15, '#fff', 41, lab));
      out.hits.push(Hit(lx - 4, 501, 110, 24, function () { toggleGuide(); }, null, 'Guide'));
      out.hits.push(Hit(lx - 17, 523, 120, 24, function () { toggleSound(); }, null, 'Sound on or off'));
      out.sprites.push(S('button-b', end - 113, 505, 21, 21, 40));
      out.texts.push(Tx('back', end - 238, 508, 15, '#fff', 41, 'width:120px;text-align:right;' + lab));
      out.hits.push(Hit(end - 210, 501, 120, 24, function () { back(); }, null, 'Back'));
      if (st.tier === 1) {
        out.sprites.push(S('button-a', end - 100, 525, 21, 21, 40));
        out.texts.push(Tx('select', end - 230, 528, 15, '#fff', 41, 'width:120px;text-align:right;' + lab));
        out.hits.push(Hit(end - 200, 523, 125, 24, function () { open(st.sel); }, null, 'Select'));
      }
    }
    function homeContent(out, xh, end) {
      var bl = blade(), items = bl.items || [];
      out.texts.push(Tx(title(bl.key), xh + 84, 38, 23, '#fff', 12, 'text-shadow:' + SH_BLACK));
      out.texts.push(Tx(st.clock, end - 188, 44, 17, '#fff', 12, 'width:120px;text-align:right;font-weight:bold;text-shadow:' + SH_BLACK));
      var bx = xh + 92, ry0 = 96, start = Math.max(0, Math.min(items.length - 10, st.sel - 9)), shown = items.slice(start, start + 10), fr = st.sel - start;
      if (shown.length) out.sprites.push(S('hl' + (fr + 1), bx - 35, ry0 - 4, 255, 367, 6));
      shown.forEach(function (it, k) {
        var y = ry0 + 35 * k, idx = start + k, on = idx === st.sel, dx = on ? -3 : 0;
        out.rects.push(R(bx - 10, y - 4, 220, 1, GR.divider, 5));
        out.sprites.push(S(ICON[it.icon] || it.icon || 'icon-info', bx + dx, y, 30, 30, 8));
        out.texts.push(Tx(it.label, bx + 45 + dx, y + 7, 17, DARK, 9, 'max-width:170px;overflow:hidden;text-overflow:ellipsis;text-shadow:' + SH_GREY));
        out.hits.push(Hit(bx - 20, y - 3, 235, 33, function () { open(idx); }, function () { if (st.sel !== idx && st.tier === 1 && !st.guide) { st.sel = idx; play('cursor'); render(); } }, it.label));
      });
      out.shine = shown.length ? [bx + 5, ry0 + 35 * fr - 5, 220, 38] : null;
      if (items.length > 10) out.texts.push(Tx((start + 1) + '–' + (start + shown.length) + ' of ' + items.length, bx + 120, ry0 + 352, 13, DARK, 9, 'text-shadow:' + SH_GREY));
      // status card and description need room beside the menu
      var cx = end - 300;
      if (cx > bx + 230) {
        var cy = 74, lines = (opts.card ? opts.card() : []) || [];
        out.sprites.push(S('gamecard_home', cx, cy, 256, 128, 6));
        out.sprites.push(S('home_logoshadow', cx + 12, cy + 124, 232, 16, 5));
        out.texts.push(Tx((opts.app && opts.app.name) || '', cx + 14, cy + 15, 15, '#111', 8, 'font-weight:bold'));
        out.sprites.push(S(ICON[opts.app && opts.app.icon] || (opts.app && opts.app.icon) || 'icon-randomize', cx + 14, cy + 48, 52, 52, 7));
        lines.slice(0, 3).forEach(function (l, i) { out.texts.push(Tx(String(l), cx + 76, cy + 48 + 19 * i, 12, '#fff', 8, 'text-shadow:' + SH_BLACK + ';line-height:1.3;max-width:160px;overflow:hidden;text-overflow:ellipsis')); });
        var it0 = items[st.sel];
        if (it0 && it0.hint) out.texts.push(Tx(it0.hint, bx + 245, 222, 17, DARK, 9, 'white-space:normal;width:' + px(Math.min(220, cx + 240 - (bx + 245))) + ';line-height:1.25;text-shadow:' + SH_GREY));
      }
      buttons(out, xh + 107, end);
    }
    function emptyOut() { return { frameRects: [], runners: [], hazes: [], bladeItems: [], bladeHits: [], rects: [], sprites: [], texts: [], hits: [], shine: null, swirl: [0, W], clipX: 0, ghost: null }; }
    function layout() {
      var out = emptyOut(), bl = blade(), col = bl.color;
      if (st.tier === 1) {
        var G = homeGeom(st.b);
        frame(out, G.xh, G.end, col, 1);
        if (st.ghost) {
          // the panel being covered or carried off, drawn with its own menu
          var saved = st;
          st = Object.assign({}, saved, { b: st.ghost.b, sel: st.ghost.sel, ghost: null });
          var g = emptyOut(), GG = homeGeom(st.b);
          try { frame(g, GG.xh, W + 900, blade().color, 1, W + 900, g); homeContent(g, GG.xh, GG.end); } finally { st = saved; }
          out.ghost = g;
        }
        bladesOut(out, 1);
        homeContent(out, G.xh, G.end);
      } else {
        frame(out, -40, W + 200, col, 2, W + 90);
        bladesOut(out, 2);
        var it = (bl.items || []).filter(function (x) { return x.id === st.item; })[0];
        out.texts.push(Tx(title(bl.key) + (it ? ' - ' + it.label : ''), 102, 38, 23, '#fff', 12, 'text-shadow:' + SH_BLACK));
        out.texts.push(Tx(st.clock, W - 188, 44, 17, '#fff', 12, 'width:120px;text-align:right;font-weight:bold;text-shadow:' + SH_BLACK));
        buttons(out, 125, W);
      }
      return out;
    }

    // ---------- render ----------
    function render() {
      if (destroyed) return;
      var out = layout();
      // main panel
      main.className = st.ghost ? 'mc-pan' : 'mc-pan trf';
      main.style.clipPath = edgeClip(out.clipX);
      var sw = 'left:' + px(out.swirl[0]) + ';top:0;width:' + px(out.swirl[1]) + ';height:576px';
      if (video._s !== sw) { video.style.cssText = sw; still.style.cssText = sw; video._s = sw; }
      var vs = U('swirl-' + prefs.skin + '.mp4'), ss = U('swirl-' + prefs.skin + '.jpg');
      if (video.getAttribute('src') !== vs) { video.setAttribute('src', vs); try { var pp = video.play(); if (pp && pp.catch) pp.catch(function () {}); } catch (e) {} }
      if (still.getAttribute('src') !== ss) still.setAttribute('src', ss);
      paint(Lframe.rects, out.frameRects, 'rect', 'ft');
      paint(Lframe.sprites, [], 'spr');
      // ghost
      if (out.ghost) {
        var gp = ghostWrap.firstChild;
        if (!gp) {
          gp = el('div', 'mc-pan', ghostWrap);
          var gi = el('img', 'mc-swirl', gp); gi.alt = '';
          el('div', 'mc-layer', gp); el('div', 'mc-layer gc', gp); el('div', 'mc-layer gc', gp); el('div', 'mc-layer gc', gp);
        }
        ghostWrap.style.zIndex = st.ghost.dir < 0 ? 6 : 1;
        gp.style.clipPath = edgeClip(out.ghost.clipX, st.ghost.dir < 0 ? EDGE_R : EDGE);
        gp.children[0].setAttribute('src', ss);
        gp.children[0].style.cssText = 'left:' + px(out.ghost.swirl[0]) + ';top:0;width:' + px(out.ghost.swirl[1]) + ';height:576px';
        paint(gp.children[1], out.ghost.frameRects, 'rect');
        gp.children[2].style.zIndex = 5; paint(gp.children[2], out.ghost.rects, 'rect');
        gp.children[3].style.zIndex = 6; paint(gp.children[3], out.ghost.sprites, 'spr');
        gp.children[4].style.zIndex = 7; paint(gp.children[4], out.ghost.texts, 'txt');
      } else if (ghostWrap.firstChild) {
        ghostWrap.removeChild(ghostWrap.firstChild);
      }
      // content
      paint(Lc.rects, out.rects, 'rect');
      paint(Lc.sprites, out.sprites, 'spr');
      paint(Lc.texts, out.texts, 'txt');
      paint(Lc.hits, out.hits, 'hit');
      var showShine = !!out.shine && !st.guide && !calm();
      if (showShine) {
        if (!shineImg) { shineImg = el('img', 'mc-shine', Lc.shine); shineImg.alt = ''; shineImg.src = U('shine.webp'); }
        shineImg.style.cssText = 'left:' + px(out.shine[0]) + ';top:' + px(out.shine[1]) + ';width:' + px(out.shine[2]) + ';height:' + px(out.shine[3]);
      } else if (shineImg) { shineImg.remove(); shineImg = null; }
      paint(Lrun, out.runners, 'spr', 'tr');
      paint(Lbl, out.bladeItems, 'blade');
      paint(Lhz, out.hazes, 'spr', 'tr');
      paint(Lbh, out.bladeHits, 'hit');
      // page host
      var hostOn = st.tier === 2;
      root.classList.toggle('mc-paged', hostOn);
      root.classList.toggle('calm', calm());
      if (hostOn) {
        host.style.left = px(70 * s); host.style.top = px(70 * s);
        host.style.width = px((W - 110) * s); host.style.height = px(435 * s);
      }
      renderGuide();
      renderToast();
    }

    // ---------- guide ----------
    function guideRows() {
      var rows = [];
      var looks = opts.looks || [];
      if (looks.length) {
        var cur = st.lookPick || 'MC360';
        rows.push({ label: 'Look', value: cur, cycle: function (d) { var i = looks.indexOf(st.lookPick || 'MC360'); st.lookPick = looks[(i + d + looks.length) % looks.length]; play('cursor'); render(); },
          run: function () { var p = st.lookPick; if (p && p !== 'MC360' && opts.setLook) { play('select'); opts.setLook(p); } else play('back'); } });
      }
      rows.push({ label: 'Skin', value: prefs.skin, cycle: function (d) { prefs.skin = SKINS[(SKINS.indexOf(prefs.skin) + d + 3) % 3]; savePrefs(prefs); play('cursor'); render(); } });
      rows.push({ label: 'Sounds', check: prefs.sound, run: function () { toggleSound(); } });
      rows.push({ label: 'Volume', value: Math.round(prefs.vol * 100) + '%', cycle: function (d) { var i = VOLS.indexOf(prefs.vol); i = Math.max(0, Math.min(4, (i < 0 ? 2 : i) + d)); prefs.vol = VOLS[i]; savePrefs(prefs); play('cursor'); render(); } });
      rows.push({ label: 'Calmer motion', check: calm(), run: function () { prefs.calm = !prefs.calm; savePrefs(prefs); play('select'); render(); } });
      if (opts.checkUpdates) rows.push({ label: st.upd === 'checking' ? 'Checking for updates…' : 'Check for updates', run: checkUpdates });
      if (opts.notes) rows.push({ label: 'Notifications (' + (opts.notes() || []).length + ')', run: function () { var n = opts.notes() || []; play('select'); toast('Latest', n[0] || 'Nothing new'); } });
      if (opts.signOut) rows.push({ label: 'Sign out…', run: function () { toggleGuide(); opts.signOut(); } });
      return rows;
    }
    function guideRun(i, d) { var r = guideRows()[i]; if (!r) return; st.gsel = i; if (r.cycle && !r.run) r.cycle(d || 1); else if (r.run) r.run(); else if (r.cycle) r.cycle(d || 1); }
    function renderGuide() {
      if (!st.guide) { if (guideWrap.firstChild) guideWrap.innerHTML = ''; return; }
      var g = guideWrap.firstChild;
      if (!g) {
        var scrim = el('div', 'mc-rect mc-scrim', guideWrap); scrim.onclick = function () { toggleGuide(); };
        g = el('div', 'mc-guide', guideWrap);
        g._r = el('div', 'mc-layer', g); g._s = el('div', 'mc-layer', g); g._t = el('div', 'mc-layer', g); g._h = el('div', 'mc-layer', g);
        g = guideWrap.lastChild;
      }
      g = guideWrap.lastChild;
      var BX = 296, v = prefs.skin, tuck = 'clip-path:' + leftOfClip(BX, EDGE, 22);
      var rs = [], ss = [], ts = [], hs = [];
      ss.push(S('background-grey', 0, 0, BX + 80, 576, 0, tuck));
      rs.push(R(0, 0, BX + 80, 576, 'linear-gradient(180deg,rgba(0,0,0,.30) 0,rgba(0,0,0,.16) 5%,rgba(0,0,0,.05) 11%,rgba(255,255,255,.10) 17%,rgba(255,255,255,.05) 50%,rgba(255,255,255,.08) 80%,rgba(0,0,0,.05) 86%,rgba(0,0,0,.16) 94%,rgba(0,0,0,.30) 100%)', 1, tuck));
      rs.push(R(BX - 40, 0, 120, 576, 'linear-gradient(90deg,rgba(0,0,0,0) 0,rgba(0,0,0,.18) 100%)', 1, tuck));
      ss.push(S(v + ':blades-size4-header', BX, 0, 80, 576, 3));
      ss.push(S(ICON[opts.app && opts.app.icon] || (opts.app && opts.app.icon) || 'icon-randomize', 40, 26, 44, 44, 4));
      ts.push(Tx((opts.app && opts.app.name) || '', 94, 30, 23, '#000', 5, 'text-shadow:' + SH_GREY));
      ts.push(Tx('version ' + ((opts.app && opts.app.ver) || '') + ' · ' + ((opts.app && opts.app.plat) || ''), 95, 57, 13, '#000', 5, 'opacity:.75'));
      var rows = guideRows();
      rows.forEach(function (r, k) {
        var y = 88 + 36 * k, on = st.gsel === k;
        rs.push(R(40, y + 10, 230, 1, GR.divider, 3));
        if (on) ss.push(S('guide-button-focus', 18, y, 280, 59, 3));
        ts.push(Tx(r.label, 46, y + 21, 17, '#000', 5, 'text-shadow:' + SH_GREY));
        var hover = function () { if (st.gsel !== k) { st.gsel = k; play('cursor'); render(); } };
        hs.push(Hit(26, y + 12, 262, 34, function () { guideRun(k, 1); }, hover, r.label));
        if (r.value) {
          ss.push(S('selectarrow-left', 168, y + 20, 9, 18, 5));
          ts.push(Tx(r.value, 181, y + 22, 15, '#000', 5, 'width:68px;text-align:center;overflow:hidden;text-overflow:ellipsis;text-shadow:' + SH_GREY));
          ss.push(S('selectarrow-right', 254, y + 20, 9, 18, 5));
          hs.push(Hit(160, y + 12, 24, 34, function () { st.gsel = k; r.cycle(-1); }, hover, 'Previous ' + r.label));
          hs.push(Hit(248, y + 12, 24, 34, function () { st.gsel = k; r.cycle(1); }, hover, 'Next ' + r.label));
        }
        if ('check' in r) ss.push(S(r.check ? 'check-box' : 'check-boxnf', 244, y + 18, 22, 22, 5));
      });
      var ny = 88 + 36 * rows.length + 30, notes = opts.notes ? (opts.notes() || []) : [];
      if (notes.length) {
        ts.push(Tx('recent', 46, ny, 13, '#000', 5, 'opacity:.6'));
        notes.slice(0, 3).forEach(function (n, i) { ts.push(Tx(String(n), 46, ny + 20 + 19 * i, 13, '#000', 5, 'max-width:230px;overflow:hidden;text-overflow:ellipsis;opacity:.85')); });
      }
      ss.push(S('button-y', 40, 524, 21, 21, 5)); ts.push(Tx('close', 66, 528, 15, '#000', 5, 'text-shadow:' + SH_GREY));
      hs.push(Hit(34, 519, 90, 28, function () { toggleGuide(); }, null, 'Close guide'));
      ss.push(S('button-back', 252, 500, 21, 21, 5)); ts.push(Tx('back', 166, 504, 15, '#000', 5, 'width:80px;text-align:right;text-shadow:' + SH_GREY));
      hs.push(Hit(170, 496, 110, 28, function () { toggleGuide(); }, null, 'Back'));
      ss.push(S('button-a', 252, 524, 21, 21, 5)); ts.push(Tx('select', 166, 528, 15, '#000', 5, 'width:80px;text-align:right;text-shadow:' + SH_GREY));
      hs.push(Hit(170, 520, 110, 28, function () { guideRun(st.gsel, 1); }, null, 'Select'));
      paint(g._s, ss, 'spr'); paint(g._r, rs, 'rect'); paint(g._t, ts, 'txt'); paint(g._h, hs, 'hit');
    }

    // ---------- toast ----------
    function toast(t, text) {
      var n = (st.toast ? st.toast.n : 0) + 1;
      st.toast = { title: t, text: text, n: n };
      play('notification');
      renderToast();
      later(function () { if (st.toast && st.toast.n === n) { st.toast = null; renderToast(); } }, 3600);
    }
    function renderToast() {
      if (!st.toast) { toastWrap.innerHTML = ''; return; }
      var w = toastWrap.firstChild;
      if (!w) {
        w = el('div', 'mc-toast', toastWrap);
        paint(el('div', 'mc-layer', w), [S('notify-panel', 0, 0, 215, 64, 0)], 'spr');
        var ring = el('img', 'mc-ring', w); ring.alt = ''; ring.src = U('notify-ring.webp');
        el('div', 'mc-txt mc-tt', w); el('div', 'mc-txt mc-ts', w);
      }
      w.style.left = px(W / 2 - 107);
      w.children[2].textContent = st.toast.title; w.children[3].textContent = st.toast.text;
    }

    // ---------- actions ----------
    function slideContent(dx) {
      if (calm()) return;
      try { content.animate([{ transform: 'translateX(' + dx + 'px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 700, easing: EASE }); } catch (e) {}
    }
    function go(i) {
      var n = N();
      if (i < 0 || i >= n || i === st.b || st.tier !== 1) return;
      var old = st.b, oldSel = st.sel, dir = i > old ? 1 : -1, c = calm();
      var gn = (st.ghost ? st.ghost.n : 0) + 1;
      var d = dir > 0 ? xr(i) - (18 + 35 * i) : xr(old) - (18 + 35 * old);
      st.b = i; st.sel = 0;
      st.ghost = c ? null : { b: old, sel: oldSel, dir: dir, n: gn };
      render();
      play('bladeslide_' + (1 + Math.floor(Math.random() * 4)));
      if (opts.onHome) opts.onHome(i);
      if (c) return;
      try {
        if (dir > 0) {
          main.animate([{ transform: 'translateX(' + d + 'px)' }, { transform: 'none' }], { duration: 700, easing: EASE });
          content.animate([{ transform: 'translateX(' + (d + 60) + 'px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 700, easing: EASE });
        } else {
          var gp = ghostWrap.firstChild;
          if (gp) gp.animate([{ transform: 'none' }, { transform: 'translateX(' + d + 'px)' }], { duration: 700, easing: EASE, fill: 'forwards' });
          content.animate([{ transform: 'translateX(-60px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 700, easing: EASE });
        }
      } catch (e) {}
      later(function () { if (st.ghost && st.ghost.n === gn) { st.ghost = null; render(); } }, 720);
    }
    function move(dd) {
      var n = (blade().items || []).length, j = Math.max(0, Math.min(n - 1, st.sel + dd));
      if (j !== st.sel) { st.sel = j; st._lastSel = j; play('cursor'); render(); }
    }
    function open(i) {
      var bl = blade(), it = (bl.items || [])[i];
      if (!it) return;
      st.sel = i; st._lastSel = i;
      if (it.action) { play('select'); it.action(); render(); return; }
      if (opts.onOpen) opts.onOpen(st.b, it);
      showPage(st.b, it.id, true);
    }
    function showPage(b, itemId, fromMenu) {
      if (destroyed) return;
      var changed = st.tier !== 2 || st.b !== b || st.item !== itemId;
      if (!changed) return;
      var wasHome = st.tier === 1;
      st.b = b; st.item = itemId; st.tier = 2; st.ghost = null;
      var items = blade().items || [];
      var idx = items.map(function (x) { return x.id; }).indexOf(itemId);
      if (idx >= 0) { st.sel = idx; st._lastSel = idx; }
      render();
      if (wasHome && fromMenu !== 'silent') { play('tier2_enter'); }
      if (wasHome && !calm()) {
        try { host.animate([{ transform: 'translateX(60px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 700, easing: EASE }); } catch (e) {}
      }
    }
    function back() {
      if (st.tier === 2 && opts.beforeBack && opts.beforeBack()) { play('back'); return; }
      if (st.tier === 2) {
        st.tier = 1; render(); play('tier2_exit'); slideContent(-60);
        if (opts.onHome) opts.onHome(st.b);
      } else if (st.b > 0) { play('back'); go(0); }
    }
    function home(b) {
      if (st.tier === 2) { st.tier = 1; }
      if (b !== undefined && b !== st.b) { st.b = b; st.sel = 0; }
      render();
    }
    function toggleGuide() { st.guide = !st.guide; st.gsel = 0; st.lookPick = null; play(st.guide ? 'guide_open' : 'guide_close'); render(); }
    function toggleSound() { prefs.sound = !prefs.sound; savePrefs(prefs); if (prefs.sound) play('select'); render(); }
    function checkUpdates() {
      if (st.upd === 'checking' || !opts.checkUpdates) return;
      st.upd = 'checking'; play('select'); render();
      Promise.resolve().then(function () { return opts.checkUpdates(); }).then(function (msg) {
        st.upd = 'idle'; render(); toast('Updates', msg || 'Checked for updates');
      }, function () { st.upd = 'idle'; render(); toast('Updates', 'Couldn’t check right now'); });
    }

    // ---------- input ----------
    function onKey(e) {
      if (destroyed || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      var k = e.key, typing = isTyping(e.target), pop = !!(opts.popupOpen && opts.popupOpen());
      firstGesture();
      if (st.guide) {
        var n = guideRows().length, handled = true;
        if (k === 'Escape' || k === 'Backspace' || ((k === 'g' || k === 'G') && !typing)) toggleGuide();
        else if (k === 'ArrowUp' || k === 'ArrowDown') { var g = Math.max(0, Math.min(n - 1, st.gsel + (k === 'ArrowUp' ? -1 : 1))); if (g !== st.gsel) { st.gsel = g; play('cursor'); render(); } }
        else if (k === 'ArrowLeft' || k === 'ArrowRight') { var r = guideRows()[st.gsel]; if (r && r.cycle) r.cycle(k === 'ArrowLeft' ? -1 : 1); }
        else if (k === 'Enter' || k === ' ') guideRun(st.gsel, 1);
        else handled = false;
        if (handled) { e.preventDefault(); e.stopPropagation(); }
        return;
      }
      // Esc in a text box on a page: leave the box first; the next Esc goes back.
      if (typing && !pop && k === 'Escape' && st.tier === 2) { try { e.target.blur(); } catch (x) {} e.preventDefault(); return; }
      if (typing || pop) return;
      if (k === 'g' || k === 'G') { toggleGuide(); e.preventDefault(); return; }
      if (st.tier === 1) {
        var h = true;
        if (k === 'ArrowLeft') go(st.b - 1);
        else if (k === 'ArrowRight') go(st.b + 1);
        else if (k === 'ArrowUp') move(-1);
        else if (k === 'ArrowDown') move(1);
        else if (k === 'Enter') open(st.sel);
        else if (k === 'Escape' || k === 'Backspace') back();
        else h = false;
        if (h) e.preventDefault();
      } else if (k === 'Escape') { back(); e.preventDefault(); }
    }
    function onMouseUp(e) {
      if (e.button !== 3 || destroyed) return;
      e.preventDefault();
      if (opts.popupOpen && opts.popupOpen()) return;
      if (st.guide) toggleGuide(); else if (st.tier === 2) back(); else if (st.b > 0) go(st.b - 1);
    }
    function onMouseDown(e) { if (e.button === 3) e.preventDefault(); firstGesture(); }
    function onResize() { measure(); render(); }
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('resize', onResize);
    var tick = function () { var d = new Date(); var h = d.getHours() % 12 || 12; st.clock = h + ':' + ('0' + d.getMinutes()).slice(-2) + (d.getHours() < 12 ? ' AM' : ' PM'); };
    tick();
    var clockTimer = setInterval(function () { tick(); render(); }, 15000);

    measure();
    render();

    function destroy() {
      if (destroyed) return;
      destroyed = true;
      timers.forEach(clearTimeout); clearInterval(clockTimer);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('resize', onResize);
      if (moved) { if (moved.next && moved.next.parentNode === moved.parent) moved.parent.insertBefore(moved.el, moved.next); else if (moved.parent) moved.parent.appendChild(moved.el); }
      try { video.pause(); video.removeAttribute('src'); video.load(); } catch (e) {}
      root.remove();
      document.body.classList.remove('mc360');
    }

    return {
      host: host,
      root: root,
      showPage: function (b, id) { showPage(b, id, 'silent'); },
      home: home,
      refresh: render,
      toast: toast,
      play: play,
      state: function () { return { b: st.b, sel: st.sel, tier: st.tier, item: st.item, guide: st.guide, gsel: st.gsel, ghost: !!st.ghost, prefs: Object.assign({}, prefs) }; },
      // for tests
      _go: go, _open: open, _back: back, _guideRows: guideRows, _bladePos: function () { return bladePos(st.b, st.tier); }, _W: function () { return W; }, _set: function (o) { Object.assign(st, o); render(); },
      setBlades: function (bl) { opts.blades = bl; if (st.b >= N()) st.b = 0; render(); },
      destroy: destroy
    };
  }

  window.MC360 = { mount: mount, version: '1.0.0' };
})();
