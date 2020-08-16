"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.fetchFrame = void 0;
var is_url_1 = __importDefault(require("is-url"));
var cheerio_1 = __importDefault(require("cheerio"));
var node_cache_1 = __importDefault(require("node-cache"));
var isomorphic_unfetch_1 = __importDefault(require("isomorphic-unfetch"));
var not_found_1 = require("./templates/not-found");
var config_1 = require("./config");
var cache = new node_cache_1["default"]({ stdTTL: config_1.stdTTL, checkperiod: config_1.checkperiod });
function manipulateSource(i, src, url, $html) {
    if (src) {
        var isSlash_1 = src && src[0] === "/";
        if (isSlash_1) {
            try {
                void (function grabData() {
                    return __awaiter(this, void 0, void 0, function () {
                        var pathUrl, scriptCode, scriptText;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    pathUrl = "" + url + (isSlash_1 ? "" : "/") + src;
                                    return [4, isomorphic_unfetch_1["default"](pathUrl, {
                                            uri: pathUrl,
                                            headers: config_1.headers
                                        })];
                                case 1:
                                    scriptCode = _a.sent();
                                    return [4, scriptCode.text()];
                                case 2:
                                    scriptText = _a.sent();
                                    $html("script[src=\"" + src + "\"]").html(scriptText);
                                    return [2];
                            }
                        });
                    });
                })();
            }
            catch (e) {
                console.error(e);
            }
        }
        return src;
    }
    return null;
}
function renderHtml(_a) {
    var url = _a.url, baseHref = _a.baseHref;
    return __awaiter(this, void 0, void 0, function () {
        var cachedHtml, e_1, response, html, $html_1, e_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!is_url_1["default"](url)) {
                        return [2, null];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4, cache.get(url)];
                case 2:
                    cachedHtml = _b.sent();
                    if (cachedHtml) {
                        return [2, cheerio_1["default"].load(cachedHtml)];
                    }
                    return [3, 4];
                case 3:
                    e_1 = _b.sent();
                    console.error(e_1);
                    return [3, 4];
                case 4:
                    _b.trys.push([4, 7, , 8]);
                    return [4, isomorphic_unfetch_1["default"](url, {
                            uri: url,
                            headers: config_1.headers
                        })];
                case 5:
                    response = _b.sent();
                    return [4, response.text()];
                case 6:
                    html = _b.sent();
                    $html_1 = cheerio_1["default"].load(html);
                    if ($html_1) {
                        $html_1("head").prepend("<base target=\"_self\" href=\"" + url + "\">");
                        if (typeof baseHref !== "undefined" && baseHref !== "false") {
                            $html_1("script").attr("src", function (i, src) {
                                return manipulateSource(i, src, url, $html_1);
                            });
                        }
                        cache.set(url, $html_1.html());
                    }
                    return [2, $html_1];
                case 7:
                    e_2 = _b.sent();
                    console.error(e_2);
                    return [3, 8];
                case 8: return [2, false];
            }
        });
    });
}
var renderError = function (res) { return res.status(400).send(not_found_1.WEBSITE_NOT_FOUND_TEMPLATE); };
function createIframe(req, res, next) {
    var _this = this;
    res.createIframe = function (model) { return __awaiter(_this, void 0, void 0, function () {
        var $html, er_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!model.url) {
                        renderError(res);
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4, renderHtml(model)];
                case 2:
                    $html = _a.sent();
                    if ($html && typeof $html.html === "function") {
                        res.status(200).send($html.html());
                    }
                    else {
                        renderError(res);
                    }
                    return [3, 4];
                case 3:
                    er_1 = _a.sent();
                    console.error(er_1);
                    renderError(res);
                    return [3, 4];
                case 4: return [2];
            }
        });
    }); };
    next();
}
function fetchFrame(model) {
    return __awaiter(this, void 0, void 0, function () {
        var $html, er_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!model.url) {
                        return [2, not_found_1.WEBSITE_NOT_FOUND_TEMPLATE];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4, renderHtml(model)];
                case 2:
                    $html = _a.sent();
                    if ($html && typeof $html.html === "function") {
                        return [2, $html.html()];
                    }
                    else {
                        return [2, not_found_1.WEBSITE_NOT_FOUND_TEMPLATE];
                    }
                    return [3, 4];
                case 3:
                    er_2 = _a.sent();
                    console.error(er_2);
                    return [2, not_found_1.WEBSITE_NOT_FOUND_TEMPLATE];
                case 4: return [2];
            }
        });
    });
}
exports.fetchFrame = fetchFrame;
exports["default"] = createIframe;
//# sourceMappingURL=iframe.js.map