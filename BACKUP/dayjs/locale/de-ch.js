!function(e,_){"object"==typeof exports&&"undefined"!=typeof module?module.exports=_(require("dayjs")):"function"==typeof define&&define.amd?define(["dayjs"],_):(e="undefined"!=typeof globalThis?globalThis:e||self).dayjs_locale_de_ch=_(e.dayjs)}(this,(function(e){"use strict";function _(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var t=_(e),o={name:"de-ch",weekdays:"Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag".split("_"),months:"Januar_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember".split("_"),weekStart:1,weekdaysShort:"So_Mo_Di_Mi_Do_Fr_Sa".split("_"),monthsShort:"Jan._Feb._März_Apr._Mai_Juni_Juli_Aug._Sep._Okt._Nov._Dez.".split("_"),weekdaysMin:"So_Mo_Di_Mi_Do_Fr_Sa".split("_"),ordinal:function(e){return e},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY HH:mm",LLLL:"dddd, D. MMMM YYYY HH:mm"}};return t.default.locale(o,null,!0),o}));