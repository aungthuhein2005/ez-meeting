var HandSignAlphabetKit = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/fingerpose/dist/fingerpose.js
  var require_fingerpose = __commonJS({
    "node_modules/fingerpose/dist/fingerpose.js"(exports, module) {
      !(function(t, e) {
        "object" == typeof exports && "object" == typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define([], e) : "object" == typeof exports ? exports.fp = e() : t.fp = e();
      })("undefined" != typeof self ? self : exports, (function() {
        return (function(t) {
          var e = {};
          function n(r) {
            if (e[r]) return e[r].exports;
            var i = e[r] = { i: r, l: false, exports: {} };
            return t[r].call(i.exports, i, i.exports, n), i.l = true, i.exports;
          }
          return n.m = t, n.c = e, n.d = function(t2, e2, r) {
            n.o(t2, e2) || Object.defineProperty(t2, e2, { enumerable: true, get: r });
          }, n.r = function(t2) {
            "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t2, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(t2, "__esModule", { value: true });
          }, n.t = function(t2, e2) {
            if (1 & e2 && (t2 = n(t2)), 8 & e2) return t2;
            if (4 & e2 && "object" == typeof t2 && t2 && t2.__esModule) return t2;
            var r = /* @__PURE__ */ Object.create(null);
            if (n.r(r), Object.defineProperty(r, "default", { enumerable: true, value: t2 }), 2 & e2 && "string" != typeof t2) for (var i in t2) n.d(r, i, function(e3) {
              return t2[e3];
            }.bind(null, i));
            return r;
          }, n.n = function(t2) {
            var e2 = t2 && t2.__esModule ? function() {
              return t2.default;
            } : function() {
              return t2;
            };
            return n.d(e2, "a", e2), e2;
          }, n.o = function(t2, e2) {
            return Object.prototype.hasOwnProperty.call(t2, e2);
          }, n.p = "", n(n.s = 0);
        })([function(t, e, n) {
          "use strict";
          n.r(e);
          var r = {};
          function i(t2) {
            return (i = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t3) {
              return typeof t3;
            } : function(t3) {
              return t3 && "function" == typeof Symbol && t3.constructor === Symbol && t3 !== Symbol.prototype ? "symbol" : typeof t3;
            })(t2);
          }
          n.r(r), n.d(r, "VictoryGesture", (function() {
            return A;
          })), n.d(r, "ThumbsUpGesture", (function() {
            return E;
          }));
          var a = { Thumb: 0, Index: 1, Middle: 2, Ring: 3, Pinky: 4, all: [0, 1, 2, 3, 4], nameMapping: { 0: "Thumb", 1: "Index", 2: "Middle", 3: "Ring", 4: "Pinky" }, pointsMapping: { 0: [[0, 1], [1, 2], [2, 3], [3, 4]], 1: [[0, 5], [5, 6], [6, 7], [7, 8]], 2: [[0, 9], [9, 10], [10, 11], [11, 12]], 3: [[0, 13], [13, 14], [14, 15], [15, 16]], 4: [[0, 17], [17, 18], [18, 19], [19, 20]] }, getName: function(t2) {
            return void 0 !== i(this.nameMapping[t2]) && this.nameMapping[t2];
          }, getPoints: function(t2) {
            return void 0 !== i(this.pointsMapping[t2]) && this.pointsMapping[t2];
          } }, o = { NoCurl: 0, HalfCurl: 1, FullCurl: 2, nameMapping: { 0: "No Curl", 1: "Half Curl", 2: "Full Curl" }, getName: function(t2) {
            return void 0 !== i(this.nameMapping[t2]) && this.nameMapping[t2];
          } }, l = { VerticalUp: 0, VerticalDown: 1, HorizontalLeft: 2, HorizontalRight: 3, DiagonalUpRight: 4, DiagonalUpLeft: 5, DiagonalDownRight: 6, DiagonalDownLeft: 7, nameMapping: { 0: "Vertical Up", 1: "Vertical Down", 2: "Horizontal Left", 3: "Horizontal Right", 4: "Diagonal Up Right", 5: "Diagonal Up Left", 6: "Diagonal Down Right", 7: "Diagonal Down Left" }, getName: function(t2) {
            return void 0 !== i(this.nameMapping[t2]) && this.nameMapping[t2];
          } };
          function u(t2, e2) {
            var n2 = "undefined" != typeof Symbol && t2[Symbol.iterator] || t2["@@iterator"];
            if (!n2) {
              if (Array.isArray(t2) || (n2 = (function(t3, e3) {
                if (!t3) return;
                if ("string" == typeof t3) return c(t3, e3);
                var n3 = Object.prototype.toString.call(t3).slice(8, -1);
                "Object" === n3 && t3.constructor && (n3 = t3.constructor.name);
                if ("Map" === n3 || "Set" === n3) return Array.from(t3);
                if ("Arguments" === n3 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n3)) return c(t3, e3);
              })(t2)) || e2 && t2 && "number" == typeof t2.length) {
                n2 && (t2 = n2);
                var r2 = 0, i2 = function() {
                };
                return { s: i2, n: function() {
                  return r2 >= t2.length ? { done: true } : { done: false, value: t2[r2++] };
                }, e: function(t3) {
                  throw t3;
                }, f: i2 };
              }
              throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            }
            var a2, o2 = true, l2 = false;
            return { s: function() {
              n2 = n2.call(t2);
            }, n: function() {
              var t3 = n2.next();
              return o2 = t3.done, t3;
            }, e: function(t3) {
              l2 = true, a2 = t3;
            }, f: function() {
              try {
                o2 || null == n2.return || n2.return();
              } finally {
                if (l2) throw a2;
              }
            } };
          }
          function c(t2, e2) {
            (null == e2 || e2 > t2.length) && (e2 = t2.length);
            for (var n2 = 0, r2 = new Array(e2); n2 < e2; n2++) r2[n2] = t2[n2];
            return r2;
          }
          function f(t2, e2) {
            var n2 = Object.keys(t2);
            if (Object.getOwnPropertySymbols) {
              var r2 = Object.getOwnPropertySymbols(t2);
              e2 && (r2 = r2.filter((function(e3) {
                return Object.getOwnPropertyDescriptor(t2, e3).enumerable;
              }))), n2.push.apply(n2, r2);
            }
            return n2;
          }
          function s(t2) {
            for (var e2 = 1; e2 < arguments.length; e2++) {
              var n2 = null != arguments[e2] ? arguments[e2] : {};
              e2 % 2 ? f(Object(n2), true).forEach((function(e3) {
                d(t2, e3, n2[e3]);
              })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t2, Object.getOwnPropertyDescriptors(n2)) : f(Object(n2)).forEach((function(e3) {
                Object.defineProperty(t2, e3, Object.getOwnPropertyDescriptor(n2, e3));
              }));
            }
            return t2;
          }
          function d(t2, e2, n2) {
            return e2 in t2 ? Object.defineProperty(t2, e2, { value: n2, enumerable: true, configurable: true, writable: true }) : t2[e2] = n2, t2;
          }
          function h(t2, e2) {
            for (var n2 = 0; n2 < e2.length; n2++) {
              var r2 = e2[n2];
              r2.enumerable = r2.enumerable || false, r2.configurable = true, "value" in r2 && (r2.writable = true), Object.defineProperty(t2, r2.key, r2);
            }
          }
          var p = (function() {
            function t2(e3) {
              !(function(t3, e4) {
                if (!(t3 instanceof e4)) throw new TypeError("Cannot call a class as a function");
              })(this, t2), this.options = s(s({}, { HALF_CURL_START_LIMIT: 60, NO_CURL_START_LIMIT: 130, DISTANCE_VOTE_POWER: 1.1, SINGLE_ANGLE_VOTE_POWER: 0.9, TOTAL_ANGLE_VOTE_POWER: 1.6 }), e3);
            }
            var e2, n2, r2;
            return e2 = t2, (n2 = [{ key: "estimate", value: function(t3) {
              var e3, n3 = [], r3 = [], i2 = u(a.all);
              try {
                for (i2.s(); !(e3 = i2.n()).done; ) {
                  var o2, l2 = e3.value, c2 = a.getPoints(l2), f2 = [], s2 = [], d2 = u(c2);
                  try {
                    for (d2.s(); !(o2 = d2.n()).done; ) {
                      var h2 = o2.value, p2 = t3[h2[0]], y2 = t3[h2[1]], g2 = this.getSlopes(p2, y2), v2 = g2[0], m2 = g2[1];
                      f2.push(v2), s2.push(m2);
                    }
                  } catch (t4) {
                    d2.e(t4);
                  } finally {
                    d2.f();
                  }
                  n3.push(f2), r3.push(s2);
                }
              } catch (t4) {
                i2.e(t4);
              } finally {
                i2.f();
              }
              var b2, D2 = [], M2 = [], O2 = u(a.all);
              try {
                for (O2.s(); !(b2 = O2.n()).done; ) {
                  var w2 = b2.value, T2 = w2 == a.Thumb ? 1 : 0, S2 = a.getPoints(w2), C2 = t3[S2[T2][0]], A2 = t3[S2[T2 + 1][1]], R2 = t3[S2[3][1]], I2 = this.estimateFingerCurl(C2, A2, R2), L2 = this.calculateFingerDirection(C2, A2, R2, n3[w2].slice(T2));
                  D2[w2] = I2, M2[w2] = L2;
                }
              } catch (t4) {
                O2.e(t4);
              } finally {
                O2.f();
              }
              return { curls: D2, directions: M2 };
            } }, { key: "getSlopes", value: function(t3, e3) {
              var n3 = this.calculateSlope(t3[0], t3[1], e3[0], e3[1]);
              return 2 == t3.length ? n3 : [n3, this.calculateSlope(t3[1], t3[2], e3[1], e3[2])];
            } }, { key: "angleOrientationAt", value: function(t3) {
              var e3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 1, n3 = 0, r3 = 0, i2 = 0;
              return t3 >= 75 && t3 <= 105 ? n3 = 1 * e3 : t3 >= 25 && t3 <= 155 ? r3 = 1 * e3 : i2 = 1 * e3, [n3, r3, i2];
            } }, { key: "estimateFingerCurl", value: function(t3, e3, n3) {
              var r3 = t3[0] - e3[0], i2 = t3[0] - n3[0], a2 = e3[0] - n3[0], l2 = t3[1] - e3[1], u2 = t3[1] - n3[1], c2 = e3[1] - n3[1], f2 = t3[2] - e3[2], s2 = t3[2] - n3[2], d2 = e3[2] - n3[2], h2 = Math.sqrt(r3 * r3 + l2 * l2 + f2 * f2), p2 = Math.sqrt(i2 * i2 + u2 * u2 + s2 * s2), y2 = Math.sqrt(a2 * a2 + c2 * c2 + d2 * d2), g2 = (y2 * y2 + h2 * h2 - p2 * p2) / (2 * y2 * h2);
              g2 > 1 ? g2 = 1 : g2 < -1 && (g2 = -1);
              var v2 = Math.acos(g2);
              return (v2 = 57.2958 * v2 % 180) > this.options.NO_CURL_START_LIMIT ? o.NoCurl : v2 > this.options.HALF_CURL_START_LIMIT ? o.HalfCurl : o.FullCurl;
            } }, { key: "estimateHorizontalDirection", value: function(t3, e3, n3, r3) {
              return r3 == Math.abs(t3) ? t3 > 0 ? l.HorizontalLeft : l.HorizontalRight : r3 == Math.abs(e3) ? e3 > 0 ? l.HorizontalLeft : l.HorizontalRight : n3 > 0 ? l.HorizontalLeft : l.HorizontalRight;
            } }, { key: "estimateVerticalDirection", value: function(t3, e3, n3, r3) {
              return r3 == Math.abs(t3) ? t3 < 0 ? l.VerticalDown : l.VerticalUp : r3 == Math.abs(e3) ? e3 < 0 ? l.VerticalDown : l.VerticalUp : n3 < 0 ? l.VerticalDown : l.VerticalUp;
            } }, { key: "estimateDiagonalDirection", value: function(t3, e3, n3, r3, i2, a2, o2, u2) {
              var c2 = this.estimateVerticalDirection(t3, e3, n3, r3), f2 = this.estimateHorizontalDirection(i2, a2, o2, u2);
              return c2 == l.VerticalUp ? f2 == l.HorizontalLeft ? l.DiagonalUpLeft : l.DiagonalUpRight : f2 == l.HorizontalLeft ? l.DiagonalDownLeft : l.DiagonalDownRight;
            } }, { key: "calculateFingerDirection", value: function(t3, e3, n3, r3) {
              var i2 = t3[0] - e3[0], a2 = t3[0] - n3[0], o2 = e3[0] - n3[0], l2 = t3[1] - e3[1], c2 = t3[1] - n3[1], f2 = e3[1] - n3[1], s2 = Math.max(Math.abs(i2), Math.abs(a2), Math.abs(o2)), d2 = Math.max(Math.abs(l2), Math.abs(c2), Math.abs(f2)), h2 = 0, p2 = 0, y2 = 0, g2 = d2 / (s2 + 1e-5);
              g2 > 1.5 ? h2 += this.options.DISTANCE_VOTE_POWER : g2 > 0.66 ? p2 += this.options.DISTANCE_VOTE_POWER : y2 += this.options.DISTANCE_VOTE_POWER;
              var v2 = Math.sqrt(i2 * i2 + l2 * l2), m2 = Math.sqrt(a2 * a2 + c2 * c2), b2 = Math.sqrt(o2 * o2 + f2 * f2), D2 = Math.max(v2, m2, b2), M2 = t3[0], O2 = t3[1], w2 = n3[0], T2 = n3[1];
              D2 == v2 ? (w2 = n3[0], T2 = n3[1]) : D2 == b2 && (M2 = e3[0], O2 = e3[1]);
              var S2 = [M2, O2], C2 = [w2, T2], A2 = this.getSlopes(S2, C2), R2 = this.angleOrientationAt(A2, this.options.TOTAL_ANGLE_VOTE_POWER);
              h2 += R2[0], p2 += R2[1], y2 += R2[2];
              var I2, L2 = u(r3);
              try {
                for (L2.s(); !(I2 = L2.n()).done; ) {
                  var _2 = I2.value, E2 = this.angleOrientationAt(_2, this.options.SINGLE_ANGLE_VOTE_POWER);
                  h2 += E2[0], p2 += E2[1], y2 += E2[2];
                }
              } catch (t4) {
                L2.e(t4);
              } finally {
                L2.f();
              }
              return h2 == Math.max(h2, p2, y2) ? this.estimateVerticalDirection(c2, l2, f2, d2) : y2 == Math.max(p2, y2) ? this.estimateHorizontalDirection(a2, i2, o2, s2) : this.estimateDiagonalDirection(c2, l2, f2, d2, a2, i2, o2, s2);
            } }, { key: "calculateSlope", value: function(t3, e3, n3, r3) {
              var i2 = (e3 - r3) / (t3 - n3), a2 = 180 * Math.atan(i2) / Math.PI;
              return a2 <= 0 ? a2 = -a2 : a2 > 0 && (a2 = 180 - a2), a2;
            } }]) && h(e2.prototype, n2), r2 && h(e2, r2), t2;
          })();
          function y(t2, e2) {
            var n2 = "undefined" != typeof Symbol && t2[Symbol.iterator] || t2["@@iterator"];
            if (!n2) {
              if (Array.isArray(t2) || (n2 = (function(t3, e3) {
                if (!t3) return;
                if ("string" == typeof t3) return g(t3, e3);
                var n3 = Object.prototype.toString.call(t3).slice(8, -1);
                "Object" === n3 && t3.constructor && (n3 = t3.constructor.name);
                if ("Map" === n3 || "Set" === n3) return Array.from(t3);
                if ("Arguments" === n3 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n3)) return g(t3, e3);
              })(t2)) || e2 && t2 && "number" == typeof t2.length) {
                n2 && (t2 = n2);
                var r2 = 0, i2 = function() {
                };
                return { s: i2, n: function() {
                  return r2 >= t2.length ? { done: true } : { done: false, value: t2[r2++] };
                }, e: function(t3) {
                  throw t3;
                }, f: i2 };
              }
              throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            }
            var a2, o2 = true, l2 = false;
            return { s: function() {
              n2 = n2.call(t2);
            }, n: function() {
              var t3 = n2.next();
              return o2 = t3.done, t3;
            }, e: function(t3) {
              l2 = true, a2 = t3;
            }, f: function() {
              try {
                o2 || null == n2.return || n2.return();
              } finally {
                if (l2) throw a2;
              }
            } };
          }
          function g(t2, e2) {
            (null == e2 || e2 > t2.length) && (e2 = t2.length);
            for (var n2 = 0, r2 = new Array(e2); n2 < e2; n2++) r2[n2] = t2[n2];
            return r2;
          }
          function v(t2, e2) {
            if (!(t2 instanceof e2)) throw new TypeError("Cannot call a class as a function");
          }
          function m(t2, e2) {
            for (var n2 = 0; n2 < e2.length; n2++) {
              var r2 = e2[n2];
              r2.enumerable = r2.enumerable || false, r2.configurable = true, "value" in r2 && (r2.writable = true), Object.defineProperty(t2, r2.key, r2);
            }
          }
          var b = (function() {
            function t2(e3) {
              var n3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
              v(this, t2), this.estimator = new p(n3), this.gestures = e3;
            }
            var e2, n2, r2;
            return e2 = t2, (n2 = [{ key: "estimate", value: function(t3, e3) {
              var n3, r3 = [], i2 = this.estimator.estimate(t3), u2 = [], c2 = y(a.all);
              try {
                for (c2.s(); !(n3 = c2.n()).done; ) {
                  var f2 = n3.value;
                  u2.push([a.getName(f2), o.getName(i2.curls[f2]), l.getName(i2.directions[f2])]);
                }
              } catch (t4) {
                c2.e(t4);
              } finally {
                c2.f();
              }
              var s2, d2 = y(this.gestures);
              try {
                for (d2.s(); !(s2 = d2.n()).done; ) {
                  var h2 = s2.value, p2 = h2.matchAgainst(i2.curls, i2.directions);
                  p2 >= e3 && r3.push({ name: h2.name, score: p2 });
                }
              } catch (t4) {
                d2.e(t4);
              } finally {
                d2.f();
              }
              return { poseData: u2, gestures: r3 };
            } }]) && m(e2.prototype, n2), r2 && m(e2, r2), t2;
          })();
          function D(t2, e2) {
            return (function(t3) {
              if (Array.isArray(t3)) return t3;
            })(t2) || (function(t3, e3) {
              var n2 = null == t3 ? null : "undefined" != typeof Symbol && t3[Symbol.iterator] || t3["@@iterator"];
              if (null == n2) return;
              var r2, i2, a2 = [], o2 = true, l2 = false;
              try {
                for (n2 = n2.call(t3); !(o2 = (r2 = n2.next()).done) && (a2.push(r2.value), !e3 || a2.length !== e3); o2 = true) ;
              } catch (t4) {
                l2 = true, i2 = t4;
              } finally {
                try {
                  o2 || null == n2.return || n2.return();
                } finally {
                  if (l2) throw i2;
                }
              }
              return a2;
            })(t2, e2) || O(t2, e2) || (function() {
              throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            })();
          }
          function M(t2, e2) {
            var n2 = "undefined" != typeof Symbol && t2[Symbol.iterator] || t2["@@iterator"];
            if (!n2) {
              if (Array.isArray(t2) || (n2 = O(t2)) || e2 && t2 && "number" == typeof t2.length) {
                n2 && (t2 = n2);
                var r2 = 0, i2 = function() {
                };
                return { s: i2, n: function() {
                  return r2 >= t2.length ? { done: true } : { done: false, value: t2[r2++] };
                }, e: function(t3) {
                  throw t3;
                }, f: i2 };
              }
              throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            }
            var a2, o2 = true, l2 = false;
            return { s: function() {
              n2 = n2.call(t2);
            }, n: function() {
              var t3 = n2.next();
              return o2 = t3.done, t3;
            }, e: function(t3) {
              l2 = true, a2 = t3;
            }, f: function() {
              try {
                o2 || null == n2.return || n2.return();
              } finally {
                if (l2) throw a2;
              }
            } };
          }
          function O(t2, e2) {
            if (t2) {
              if ("string" == typeof t2) return w(t2, e2);
              var n2 = Object.prototype.toString.call(t2).slice(8, -1);
              return "Object" === n2 && t2.constructor && (n2 = t2.constructor.name), "Map" === n2 || "Set" === n2 ? Array.from(t2) : "Arguments" === n2 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n2) ? w(t2, e2) : void 0;
            }
          }
          function w(t2, e2) {
            (null == e2 || e2 > t2.length) && (e2 = t2.length);
            for (var n2 = 0, r2 = new Array(e2); n2 < e2; n2++) r2[n2] = t2[n2];
            return r2;
          }
          function T(t2, e2) {
            for (var n2 = 0; n2 < e2.length; n2++) {
              var r2 = e2[n2];
              r2.enumerable = r2.enumerable || false, r2.configurable = true, "value" in r2 && (r2.writable = true), Object.defineProperty(t2, r2.key, r2);
            }
          }
          var S = (function() {
            function t2(e3) {
              !(function(t3, e4) {
                if (!(t3 instanceof e4)) throw new TypeError("Cannot call a class as a function");
              })(this, t2), this.name = e3, this.curls = {}, this.directions = {};
            }
            var e2, n2, r2;
            return e2 = t2, (n2 = [{ key: "addCurl", value: function(t3, e3) {
              var n3 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 1;
              void 0 === this.curls[t3] && (this.curls[t3] = []), this.curls[t3].push([e3, n3]);
            } }, { key: "addDirection", value: function(t3, e3) {
              var n3 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 1;
              void 0 === this.directions[t3] && (this.directions[t3] = []), this.directions[t3].push([e3, n3]);
            } }, { key: "matchAgainst", value: function(t3, e3) {
              var n3 = 0, r3 = 0;
              for (var i2 in t3) {
                var a2 = t3[i2], o2 = this.curls[i2];
                if (void 0 !== o2) {
                  r3++;
                  var l2, u2 = false, c2 = 0, f2 = M(o2);
                  try {
                    for (f2.s(); !(l2 = f2.n()).done; ) {
                      var s2 = D(l2.value, 2), d2 = s2[0], h2 = s2[1];
                      if (a2 == d2) {
                        n3 += h2, c2 = Math.max(c2, h2), u2 = true;
                        break;
                      }
                    }
                  } catch (t4) {
                    f2.e(t4);
                  } finally {
                    f2.f();
                  }
                  u2 || (n3 -= c2);
                }
              }
              for (var p2 in e3) {
                var y2 = e3[p2], g2 = this.directions[p2];
                if (void 0 !== g2) {
                  r3++;
                  var v2, m2 = false, b2 = 0, O2 = M(g2);
                  try {
                    for (O2.s(); !(v2 = O2.n()).done; ) {
                      var w2 = D(v2.value, 2), T2 = w2[0], S2 = w2[1];
                      if (y2 == T2) {
                        n3 += S2, b2 = Math.max(b2, S2), m2 = true;
                        break;
                      }
                    }
                  } catch (t4) {
                    O2.e(t4);
                  } finally {
                    O2.f();
                  }
                  m2 || (n3 -= b2);
                }
              }
              return n3 / r3 * 10;
            } }]) && T(e2.prototype, n2), r2 && T(e2, r2), t2;
          })(), C = new S("victory");
          C.addDirection(a.Thumb, l.VerticalUp, 1), C.addDirection(a.Thumb, l.DiagonalUpLeft, 1), C.addDirection(a.Thumb, l.DiagonalUpRight, 1), C.addCurl(a.Index, o.NoCurl, 1), C.addDirection(a.Index, l.VerticalUp, 1), C.addDirection(a.Index, l.DiagonalUpLeft, 1), C.addDirection(a.Index, l.DiagonalUpRight, 1), C.addDirection(a.Index, l.HorizontalLeft, 1), C.addDirection(a.Index, l.HorizontalRight, 1), C.addCurl(a.Middle, o.NoCurl, 1), C.addDirection(a.Middle, l.VerticalUp, 1), C.addDirection(a.Middle, l.DiagonalUpLeft, 1), C.addDirection(a.Middle, l.DiagonalUpRight, 1), C.addDirection(a.Middle, l.HorizontalLeft, 1), C.addDirection(a.Middle, l.HorizontalRight, 1), C.addCurl(a.Ring, o.FullCurl, 1), C.addCurl(a.Ring, o.HalfCurl, 0.9), C.addCurl(a.Pinky, o.FullCurl, 1), C.addCurl(a.Pinky, o.HalfCurl, 0.9);
          var A = C, R = new S("thumbs_up");
          R.addCurl(a.Thumb, o.NoCurl, 1), R.addDirection(a.Thumb, l.VerticalUp, 1), R.addDirection(a.Thumb, l.DiagonalUpLeft, 0.9), R.addDirection(a.Thumb, l.DiagonalUpRight, 0.9);
          for (var I = 0, L = [a.Index, a.Middle, a.Ring, a.Pinky]; I < L.length; I++) {
            var _ = L[I];
            R.addCurl(_, o.FullCurl, 1), R.addCurl(_, o.HalfCurl, 0.9);
          }
          R.addDirection(a.Index, l.DiagonalUpLeft, 1), R.addDirection(a.Index, l.HorizontalLeft, 1), R.addDirection(a.Index, l.HorizontalRight, 1), R.addDirection(a.Index, l.DiagonalUpRight, 1);
          var E = R;
          e.default = { GestureEstimator: b, GestureDescription: S, Finger: a, FingerCurl: o, FingerDirection: l, Gestures: r };
        }]).default;
      }));
    }
  });

  // scripts/handsigns-entry.js
  var handsigns_entry_exports = {};
  __export(handsigns_entry_exports, {
    alphabetGestureList: () => alphabetGestureList,
    fpExports: () => fpExports
  });
  var import_fingerpose27 = __toESM(require_fingerpose());

  // scripts/handsigns-src/Asign.js
  var import_fingerpose = __toESM(require_fingerpose());
  var aSign = new import_fingerpose.GestureDescription("A");
  aSign.addCurl(import_fingerpose.Finger.Thumb, import_fingerpose.FingerCurl.NoCurl, 1);
  aSign.addDirection(import_fingerpose.Finger.Index, import_fingerpose.FingerDirection.DiagonalUpRight, 0.7);
  aSign.addCurl(import_fingerpose.Finger.Index, import_fingerpose.FingerCurl.FullCurl, 1);
  aSign.addDirection(import_fingerpose.Finger.Index, import_fingerpose.FingerDirection.VerticalUp, 0.7);
  aSign.addCurl(import_fingerpose.Finger.Middle, import_fingerpose.FingerCurl.FullCurl, 1);
  aSign.addDirection(import_fingerpose.Finger.Middle, import_fingerpose.FingerDirection.VerticalUp, 0.7);
  aSign.addCurl(import_fingerpose.Finger.Ring, import_fingerpose.FingerCurl.FullCurl, 1);
  aSign.addDirection(import_fingerpose.Finger.Ring, import_fingerpose.FingerDirection.VerticalUp, 0.7);
  aSign.addCurl(import_fingerpose.Finger.Pinky, import_fingerpose.FingerCurl.FullCurl, 1);
  aSign.addDirection(import_fingerpose.Finger.Pinky, import_fingerpose.FingerDirection.VerticalUp, 0.7);

  // scripts/handsigns-src/Bsign.js
  var import_fingerpose2 = __toESM(require_fingerpose());
  var bSign = new import_fingerpose2.GestureDescription("B");
  bSign.addCurl(import_fingerpose2.Finger.Thumb, import_fingerpose2.FingerCurl.HalfCurl, 1);
  bSign.addDirection(import_fingerpose2.Finger.Index, import_fingerpose2.FingerDirection.DiagonalUpLeft, 0.7);
  bSign.addDirection(import_fingerpose2.Finger.Index, import_fingerpose2.FingerDirection.DiagonalUpRight, 0.7);
  bSign.addCurl(import_fingerpose2.Finger.Index, import_fingerpose2.FingerCurl.NoCurl, 1);
  bSign.addDirection(import_fingerpose2.Finger.Index, import_fingerpose2.FingerDirection.VerticalUp, 0.7);
  bSign.addCurl(import_fingerpose2.Finger.Middle, import_fingerpose2.FingerCurl.NoCurl, 1);
  bSign.addDirection(import_fingerpose2.Finger.Middle, import_fingerpose2.FingerDirection.VerticalUp, 0.7);
  bSign.addCurl(import_fingerpose2.Finger.Ring, import_fingerpose2.FingerCurl.NoCurl, 1);
  bSign.addDirection(import_fingerpose2.Finger.Ring, import_fingerpose2.FingerDirection.VerticalUp, 0.7);
  bSign.addCurl(import_fingerpose2.Finger.Pinky, import_fingerpose2.FingerCurl.NoCurl, 1);
  bSign.addDirection(import_fingerpose2.Finger.Pinky, import_fingerpose2.FingerDirection.VerticalUp, 0.7);

  // scripts/handsigns-src/Csign.js
  var import_fingerpose3 = __toESM(require_fingerpose());
  var cSign = new import_fingerpose3.GestureDescription("C");
  cSign.addCurl(import_fingerpose3.Finger.Thumb, import_fingerpose3.FingerCurl.NoCurl, 1);
  cSign.addDirection(import_fingerpose3.Finger.Index, import_fingerpose3.FingerDirection.DiagonalUpRight, 0.7);
  cSign.addCurl(import_fingerpose3.Finger.Index, import_fingerpose3.FingerCurl.NoCurl, 1);
  cSign.addDirection(import_fingerpose3.Finger.Index, import_fingerpose3.FingerDirection.DiagonalUpRight, 0.7);
  cSign.addCurl(import_fingerpose3.Finger.Middle, import_fingerpose3.FingerCurl.HalfCurl, 1);
  cSign.addDirection(import_fingerpose3.Finger.Middle, import_fingerpose3.FingerDirection.DiagonalUpRight, 0.7);
  cSign.addCurl(import_fingerpose3.Finger.Ring, import_fingerpose3.FingerCurl.HalfCurl, 1);
  cSign.addDirection(import_fingerpose3.Finger.Ring, import_fingerpose3.FingerDirection.DiagonalUpRight, 0.7);
  cSign.addCurl(import_fingerpose3.Finger.Pinky, import_fingerpose3.FingerCurl.HalfCurl, 1);
  cSign.addDirection(import_fingerpose3.Finger.Pinky, import_fingerpose3.FingerDirection.DiagonalUpRight, 0.7);

  // scripts/handsigns-src/Dsign.js
  var import_fingerpose4 = __toESM(require_fingerpose());
  var dSign = new import_fingerpose4.GestureDescription("D");
  dSign.addCurl(import_fingerpose4.Finger.Thumb, import_fingerpose4.FingerCurl.HalfCurl, 1);
  dSign.addDirection(import_fingerpose4.Finger.Index, import_fingerpose4.FingerDirection.VerticalUp, 0.7);
  dSign.addCurl(import_fingerpose4.Finger.Index, import_fingerpose4.FingerCurl.NoCurl, 1);
  dSign.addDirection(import_fingerpose4.Finger.Index, import_fingerpose4.FingerDirection.VerticalUp, 0.7);
  dSign.addCurl(import_fingerpose4.Finger.Middle, import_fingerpose4.FingerCurl.FullCurl, 1);
  dSign.addDirection(import_fingerpose4.Finger.Middle, import_fingerpose4.FingerDirection.VerticalUp, 0.7);
  dSign.addCurl(import_fingerpose4.Finger.Ring, import_fingerpose4.FingerCurl.FullCurl, 1);
  dSign.addDirection(import_fingerpose4.Finger.Ring, import_fingerpose4.FingerDirection.VerticalUp, 0.7);
  dSign.addCurl(import_fingerpose4.Finger.Pinky, import_fingerpose4.FingerCurl.FullCurl, 1);
  dSign.addDirection(import_fingerpose4.Finger.Pinky, import_fingerpose4.FingerDirection.VerticalUp, 0.7);

  // scripts/handsigns-src/Esign.js
  var import_fingerpose5 = __toESM(require_fingerpose());
  var eSign = new import_fingerpose5.GestureDescription("E");
  eSign.addCurl(import_fingerpose5.Finger.Thumb, import_fingerpose5.FingerCurl.HalfCurl, 1);
  eSign.addDirection(import_fingerpose5.Finger.Index, import_fingerpose5.FingerDirection.VerticalUp, 0.7);
  eSign.addCurl(import_fingerpose5.Finger.Index, import_fingerpose5.FingerCurl.FullCurl, 1);
  eSign.addDirection(import_fingerpose5.Finger.Index, import_fingerpose5.FingerDirection.VerticalUp, 0.7);
  eSign.addCurl(import_fingerpose5.Finger.Middle, import_fingerpose5.FingerCurl.FullCurl, 1);
  eSign.addDirection(import_fingerpose5.Finger.Middle, import_fingerpose5.FingerDirection.VerticalUp, 0.7);
  eSign.addCurl(import_fingerpose5.Finger.Ring, import_fingerpose5.FingerCurl.FullCurl, 1);
  eSign.addDirection(import_fingerpose5.Finger.Ring, import_fingerpose5.FingerDirection.VerticalUp, 0.7);
  eSign.addCurl(import_fingerpose5.Finger.Pinky, import_fingerpose5.FingerCurl.FullCurl, 1);
  eSign.addDirection(import_fingerpose5.Finger.Pinky, import_fingerpose5.FingerDirection.VerticalUp, 0.7);

  // scripts/handsigns-src/Fsign.js
  var import_fingerpose6 = __toESM(require_fingerpose());
  var fSign = new import_fingerpose6.GestureDescription("F");
  fSign.addCurl(import_fingerpose6.Finger.Thumb, import_fingerpose6.FingerCurl.HalfCurl, 1);
  fSign.addDirection(import_fingerpose6.Finger.Index, import_fingerpose6.FingerDirection.DiagonalUpRight, 0.7);
  fSign.addCurl(import_fingerpose6.Finger.Index, import_fingerpose6.FingerCurl.FullCurl, 1);
  fSign.addDirection(import_fingerpose6.Finger.Index, import_fingerpose6.FingerDirection.DiagonalUpRight, 0.7);
  fSign.addCurl(import_fingerpose6.Finger.Middle, import_fingerpose6.FingerCurl.NoCurl, 1);
  fSign.addDirection(import_fingerpose6.Finger.Middle, import_fingerpose6.FingerDirection.VerticalUp, 0.7);
  fSign.addCurl(import_fingerpose6.Finger.Ring, import_fingerpose6.FingerCurl.NoCurl, 1);
  fSign.addDirection(import_fingerpose6.Finger.Ring, import_fingerpose6.FingerDirection.VerticalUp, 0.7);
  fSign.addCurl(import_fingerpose6.Finger.Pinky, import_fingerpose6.FingerCurl.NoCurl, 1);
  fSign.addDirection(import_fingerpose6.Finger.Pinky, import_fingerpose6.FingerDirection.VerticalUp, 0.7);

  // scripts/handsigns-src/Gsign.js
  var import_fingerpose7 = __toESM(require_fingerpose());
  var gSign = new import_fingerpose7.GestureDescription("G");
  gSign.addCurl(import_fingerpose7.Finger.Thumb, import_fingerpose7.FingerCurl.NoCurl, 1);
  gSign.addDirection(import_fingerpose7.Finger.Index, import_fingerpose7.FingerDirection.DiagonalUpRight, 0.7);
  gSign.addCurl(import_fingerpose7.Finger.Index, import_fingerpose7.FingerCurl.NoCurl, 1);
  gSign.addDirection(import_fingerpose7.Finger.Index, import_fingerpose7.FingerDirection.HorizontalRight, 0.7);
  gSign.addCurl(import_fingerpose7.Finger.Middle, import_fingerpose7.FingerCurl.FullCurl, 1);
  gSign.addDirection(import_fingerpose7.Finger.Middle, import_fingerpose7.FingerDirection.DiagonalUpRight, 0.7);
  gSign.addCurl(import_fingerpose7.Finger.Ring, import_fingerpose7.FingerCurl.FullCurl, 1);
  gSign.addDirection(import_fingerpose7.Finger.Ring, import_fingerpose7.FingerDirection.HorizontalRight, 0.7);
  gSign.addCurl(import_fingerpose7.Finger.Pinky, import_fingerpose7.FingerCurl.FullCurl, 1);
  gSign.addDirection(import_fingerpose7.Finger.Pinky, import_fingerpose7.FingerDirection.HorizontalRight, 0.7);

  // scripts/handsigns-src/Hsign.js
  var import_fingerpose8 = __toESM(require_fingerpose());
  var hSign = new import_fingerpose8.GestureDescription("H");
  hSign.addCurl(import_fingerpose8.Finger.Thumb, import_fingerpose8.FingerCurl.NoCurl, 1);
  hSign.addDirection(import_fingerpose8.Finger.Index, import_fingerpose8.FingerDirection.HorizontalRight, 0.7);
  hSign.addCurl(import_fingerpose8.Finger.Index, import_fingerpose8.FingerCurl.NoCurl, 1);
  hSign.addDirection(import_fingerpose8.Finger.Index, import_fingerpose8.FingerDirection.HorizontalRight, 0.7);
  hSign.addCurl(import_fingerpose8.Finger.Middle, import_fingerpose8.FingerCurl.NoCurl, 1);
  hSign.addDirection(import_fingerpose8.Finger.Middle, import_fingerpose8.FingerDirection.HorizontalRight, 0.7);
  hSign.addCurl(import_fingerpose8.Finger.Ring, import_fingerpose8.FingerCurl.FullCurl, 1);
  hSign.addDirection(import_fingerpose8.Finger.Ring, import_fingerpose8.FingerDirection.HorizontalRight, 0.7);
  hSign.addCurl(import_fingerpose8.Finger.Pinky, import_fingerpose8.FingerCurl.FullCurl, 1);
  hSign.addDirection(import_fingerpose8.Finger.Pinky, import_fingerpose8.FingerDirection.HorizontalRight, 0.7);

  // scripts/handsigns-src/Isign.js
  var import_fingerpose9 = __toESM(require_fingerpose());
  var iSign = new import_fingerpose9.GestureDescription("I");
  iSign.addCurl(import_fingerpose9.Finger.Thumb, import_fingerpose9.FingerCurl.HalfCurl, 1);
  iSign.addDirection(import_fingerpose9.Finger.Index, import_fingerpose9.FingerDirection.DiagonalUpLeft, 0.7);
  iSign.addCurl(import_fingerpose9.Finger.Index, import_fingerpose9.FingerCurl.FullCurl, 1);
  iSign.addDirection(import_fingerpose9.Finger.Index, import_fingerpose9.FingerDirection.VerticalUp, 0.7);
  iSign.addCurl(import_fingerpose9.Finger.Middle, import_fingerpose9.FingerCurl.FullCurl, 1);
  iSign.addDirection(import_fingerpose9.Finger.Middle, import_fingerpose9.FingerDirection.VerticalUp, 0.7);
  iSign.addCurl(import_fingerpose9.Finger.Ring, import_fingerpose9.FingerCurl.FullCurl, 1);
  iSign.addDirection(import_fingerpose9.Finger.Ring, import_fingerpose9.FingerDirection.VerticalUp, 0.7);
  iSign.addCurl(import_fingerpose9.Finger.Pinky, import_fingerpose9.FingerCurl.NoCurl, 1);
  iSign.addDirection(import_fingerpose9.Finger.Pinky, import_fingerpose9.FingerDirection.VerticalUp, 0.7);

  // scripts/handsigns-src/Jsign.js
  var import_fingerpose10 = __toESM(require_fingerpose());
  var jSign = new import_fingerpose10.GestureDescription("J");
  jSign.addCurl(import_fingerpose10.Finger.Thumb, import_fingerpose10.FingerCurl.NoCurl, 1);
  jSign.addDirection(import_fingerpose10.Finger.Index, import_fingerpose10.FingerDirection.DiagonalUpRight, 0.7);
  jSign.addCurl(import_fingerpose10.Finger.Index, import_fingerpose10.FingerCurl.FullCurl, 1);
  jSign.addDirection(import_fingerpose10.Finger.Index, import_fingerpose10.FingerDirection.DiagonalUpRight, 0.7);
  jSign.addCurl(import_fingerpose10.Finger.Middle, import_fingerpose10.FingerCurl.FullCurl, 1);
  jSign.addDirection(import_fingerpose10.Finger.Middle, import_fingerpose10.FingerDirection.DiagonalUpRight, 0.7);
  jSign.addCurl(import_fingerpose10.Finger.Ring, import_fingerpose10.FingerCurl.FullCurl, 1);
  jSign.addDirection(import_fingerpose10.Finger.Ring, import_fingerpose10.FingerDirection.HorizontalRight, 0.7);
  jSign.addCurl(import_fingerpose10.Finger.Pinky, import_fingerpose10.FingerCurl.NoCurl, 1);
  jSign.addDirection(import_fingerpose10.Finger.Pinky, import_fingerpose10.FingerDirection.HorizontalRight, 0.7);

  // scripts/handsigns-src/Ksign.js
  var import_fingerpose11 = __toESM(require_fingerpose());
  var kSign = new import_fingerpose11.GestureDescription("K");
  kSign.addCurl(import_fingerpose11.Finger.Thumb, import_fingerpose11.FingerCurl.NoCurl, 1);
  kSign.addDirection(import_fingerpose11.Finger.Index, import_fingerpose11.FingerDirection.DiagonalUpLeft, 0.7);
  kSign.addCurl(import_fingerpose11.Finger.Index, import_fingerpose11.FingerCurl.NoCurl, 1);
  kSign.addDirection(import_fingerpose11.Finger.Index, import_fingerpose11.FingerDirection.DiagonalUpRight, 0.7);
  kSign.addCurl(import_fingerpose11.Finger.Middle, import_fingerpose11.FingerCurl.NoCurl, 1);
  kSign.addDirection(import_fingerpose11.Finger.Middle, import_fingerpose11.FingerDirection.VerticalUp, 0.7);
  kSign.addCurl(import_fingerpose11.Finger.Ring, import_fingerpose11.FingerCurl.FullCurl, 1);
  kSign.addDirection(import_fingerpose11.Finger.Ring, import_fingerpose11.FingerDirection.VerticalUp, 0.7);
  kSign.addCurl(import_fingerpose11.Finger.Pinky, import_fingerpose11.FingerCurl.FullCurl, 1);
  kSign.addDirection(import_fingerpose11.Finger.Pinky, import_fingerpose11.FingerDirection.VerticalUp, 0.7);

  // scripts/handsigns-src/Lsign.js
  var import_fingerpose12 = __toESM(require_fingerpose());
  var lSign = new import_fingerpose12.GestureDescription("L");
  lSign.addCurl(import_fingerpose12.Finger.Thumb, import_fingerpose12.FingerCurl.NoCurl, 1);
  lSign.addDirection(import_fingerpose12.Finger.Index, import_fingerpose12.FingerDirection.DiagonalUpRight, 0.7);
  lSign.addCurl(import_fingerpose12.Finger.Index, import_fingerpose12.FingerCurl.NoCurl, 1);
  lSign.addDirection(import_fingerpose12.Finger.Index, import_fingerpose12.FingerDirection.VerticalUp, 0.7);
  lSign.addCurl(import_fingerpose12.Finger.Middle, import_fingerpose12.FingerCurl.FullCurl, 1);
  lSign.addDirection(import_fingerpose12.Finger.Middle, import_fingerpose12.FingerDirection.VerticalUp, 0.7);
  lSign.addCurl(import_fingerpose12.Finger.Ring, import_fingerpose12.FingerCurl.FullCurl, 1);
  lSign.addDirection(import_fingerpose12.Finger.Ring, import_fingerpose12.FingerDirection.VerticalUp, 0.7);
  lSign.addCurl(import_fingerpose12.Finger.Pinky, import_fingerpose12.FingerCurl.FullCurl, 1);
  lSign.addDirection(import_fingerpose12.Finger.Pinky, import_fingerpose12.FingerDirection.VerticalUp, 0.7);

  // scripts/handsigns-src/Msign.js
  var import_fingerpose13 = __toESM(require_fingerpose());
  var mSign = new import_fingerpose13.GestureDescription("M");
  mSign.addCurl(import_fingerpose13.Finger.Thumb, import_fingerpose13.FingerCurl.HalfCurl, 1);
  mSign.addDirection(import_fingerpose13.Finger.Index, import_fingerpose13.FingerDirection.DiagonalUpLeft, 0.7);
  mSign.addCurl(import_fingerpose13.Finger.Index, import_fingerpose13.FingerCurl.FullCurl, 1);
  mSign.addDirection(import_fingerpose13.Finger.Index, import_fingerpose13.FingerDirection.DiagonalUpRight, 0.7);
  mSign.addCurl(import_fingerpose13.Finger.Middle, import_fingerpose13.FingerCurl.FullCurl, 1);
  mSign.addDirection(import_fingerpose13.Finger.Middle, import_fingerpose13.FingerDirection.VerticalUp, 0.7);
  mSign.addCurl(import_fingerpose13.Finger.Ring, import_fingerpose13.FingerCurl.FullCurl, 1);
  mSign.addDirection(import_fingerpose13.Finger.Ring, import_fingerpose13.FingerDirection.VerticalUp, 0.7);
  mSign.addCurl(import_fingerpose13.Finger.Pinky, import_fingerpose13.FingerCurl.FullCurl, 1);
  mSign.addDirection(import_fingerpose13.Finger.Pinky, import_fingerpose13.FingerDirection.VerticalUp, 0.7);

  // scripts/handsigns-src/Nsign.js
  var import_fingerpose14 = __toESM(require_fingerpose());
  var nSign = new import_fingerpose14.GestureDescription("N");
  nSign.addCurl(import_fingerpose14.Finger.Thumb, import_fingerpose14.FingerCurl.HalfCurl, 1);
  nSign.addDirection(import_fingerpose14.Finger.Index, import_fingerpose14.FingerDirection.DiagonalUpLeft, 0.7);
  nSign.addCurl(import_fingerpose14.Finger.Index, import_fingerpose14.FingerCurl.FullCurl, 1);
  nSign.addDirection(import_fingerpose14.Finger.Index, import_fingerpose14.FingerDirection.DiagonalUpRight, 0.7);
  nSign.addCurl(import_fingerpose14.Finger.Middle, import_fingerpose14.FingerCurl.FullCurl, 1);
  nSign.addDirection(import_fingerpose14.Finger.Middle, import_fingerpose14.FingerDirection.VerticalUp, 0.7);
  nSign.addCurl(import_fingerpose14.Finger.Ring, import_fingerpose14.FingerCurl.FullCurl, 1);
  nSign.addDirection(import_fingerpose14.Finger.Ring, import_fingerpose14.FingerDirection.VerticalUp, 0.7);
  nSign.addCurl(import_fingerpose14.Finger.Pinky, import_fingerpose14.FingerCurl.FullCurl, 1);
  nSign.addDirection(import_fingerpose14.Finger.Pinky, import_fingerpose14.FingerDirection.DiagonalUpLeft, 0.7);

  // scripts/handsigns-src/Osign.js
  var import_fingerpose15 = __toESM(require_fingerpose());
  var oSign = new import_fingerpose15.GestureDescription("O");
  oSign.addCurl(import_fingerpose15.Finger.Thumb, import_fingerpose15.FingerCurl.NoCurl, 1);
  oSign.addDirection(import_fingerpose15.Finger.Index, import_fingerpose15.FingerDirection.DiagonalUpRight, 0.7);
  oSign.addCurl(import_fingerpose15.Finger.Index, import_fingerpose15.FingerCurl.HalfCurl, 1);
  oSign.addDirection(import_fingerpose15.Finger.Index, import_fingerpose15.FingerDirection.DiagonalUpRight, 0.7);
  oSign.addCurl(import_fingerpose15.Finger.Middle, import_fingerpose15.FingerCurl.HalfCurl, 1);
  oSign.addDirection(import_fingerpose15.Finger.Middle, import_fingerpose15.FingerDirection.DiagonalUpRight, 0.7);
  oSign.addCurl(import_fingerpose15.Finger.Ring, import_fingerpose15.FingerCurl.FullCurl, 1);
  oSign.addDirection(import_fingerpose15.Finger.Ring, import_fingerpose15.FingerDirection.DiagonalUpRight, 0.7);
  oSign.addCurl(import_fingerpose15.Finger.Pinky, import_fingerpose15.FingerCurl.FullCurl, 1);
  oSign.addDirection(import_fingerpose15.Finger.Pinky, import_fingerpose15.FingerDirection.DiagonalUpRight, 0.7);

  // scripts/handsigns-src/Psign.js
  var import_fingerpose16 = __toESM(require_fingerpose());
  var pSign = new import_fingerpose16.GestureDescription("P");
  pSign.addCurl(import_fingerpose16.Finger.Thumb, import_fingerpose16.FingerCurl.NoCurl, 1);
  pSign.addDirection(import_fingerpose16.Finger.Index, import_fingerpose16.FingerDirection.HorizontalRight, 0.7);
  pSign.addCurl(import_fingerpose16.Finger.Index, import_fingerpose16.FingerCurl.NoCurl, 1);
  pSign.addDirection(import_fingerpose16.Finger.Index, import_fingerpose16.FingerDirection.HorizontalRight, 0.7);
  pSign.addCurl(import_fingerpose16.Finger.Middle, import_fingerpose16.FingerCurl.HalfCurl, 1);
  pSign.addDirection(import_fingerpose16.Finger.Middle, import_fingerpose16.FingerDirection.DiagonalDownRight, 0.7);
  pSign.addCurl(import_fingerpose16.Finger.Ring, import_fingerpose16.FingerCurl.FullCurl, 1);
  pSign.addDirection(import_fingerpose16.Finger.Ring, import_fingerpose16.FingerDirection.DiagonalDownRight, 0.7);
  pSign.addCurl(import_fingerpose16.Finger.Pinky, import_fingerpose16.FingerCurl.FullCurl, 1);
  pSign.addDirection(import_fingerpose16.Finger.Pinky, import_fingerpose16.FingerDirection.DiagonalDownRight, 0.7);

  // scripts/handsigns-src/Qsign.js
  var import_fingerpose17 = __toESM(require_fingerpose());
  var qSign = new import_fingerpose17.GestureDescription("Q");
  qSign.addCurl(import_fingerpose17.Finger.Thumb, import_fingerpose17.FingerCurl.NoCurl, 1);
  qSign.addDirection(import_fingerpose17.Finger.Index, import_fingerpose17.FingerDirection.DiagonalDownRight, 0.7);
  qSign.addCurl(import_fingerpose17.Finger.Index, import_fingerpose17.FingerCurl.HalfCurl, 1);
  qSign.addDirection(import_fingerpose17.Finger.Index, import_fingerpose17.FingerDirection.HorizontalRight, 0.7);
  qSign.addCurl(import_fingerpose17.Finger.Middle, import_fingerpose17.FingerCurl.FullCurl, 1);
  qSign.addDirection(import_fingerpose17.Finger.Middle, import_fingerpose17.FingerDirection.HorizontalRight, 0.7);
  qSign.addCurl(import_fingerpose17.Finger.Ring, import_fingerpose17.FingerCurl.FullCurl, 1);
  qSign.addDirection(import_fingerpose17.Finger.Ring, import_fingerpose17.FingerDirection.DiagonalDownRight, 0.7);
  qSign.addCurl(import_fingerpose17.Finger.Pinky, import_fingerpose17.FingerCurl.FullCurl, 1);
  qSign.addDirection(import_fingerpose17.Finger.Pinky, import_fingerpose17.FingerDirection.DiagonalDownRight, 0.7);

  // scripts/handsigns-src/Rsign.js
  var import_fingerpose18 = __toESM(require_fingerpose());
  var rSign = new import_fingerpose18.GestureDescription("R");
  rSign.addCurl(import_fingerpose18.Finger.Thumb, import_fingerpose18.FingerCurl.HalfCurl, 1);
  rSign.addDirection(import_fingerpose18.Finger.Index, import_fingerpose18.FingerDirection.DiagonalUpLeft, 0.7);
  rSign.addCurl(import_fingerpose18.Finger.Index, import_fingerpose18.FingerCurl.NoCurl, 1);
  rSign.addDirection(import_fingerpose18.Finger.Index, import_fingerpose18.FingerDirection.VerticalUp, 0.7);
  rSign.addCurl(import_fingerpose18.Finger.Middle, import_fingerpose18.FingerCurl.NoCurl, 1);
  rSign.addDirection(import_fingerpose18.Finger.Middle, import_fingerpose18.FingerDirection.VerticalUp, 0.7);
  rSign.addCurl(import_fingerpose18.Finger.Ring, import_fingerpose18.FingerCurl.FullCurl, 1);
  rSign.addDirection(import_fingerpose18.Finger.Ring, import_fingerpose18.FingerDirection.VerticalUp, 0.7);
  rSign.addCurl(import_fingerpose18.Finger.Pinky, import_fingerpose18.FingerCurl.FullCurl, 1);
  rSign.addDirection(import_fingerpose18.Finger.Pinky, import_fingerpose18.FingerDirection.VerticalUp, 0.7);

  // scripts/handsigns-src/Ssign.js
  var import_fingerpose19 = __toESM(require_fingerpose());
  var sSign = new import_fingerpose19.GestureDescription("S");
  sSign.addCurl(import_fingerpose19.Finger.Thumb, import_fingerpose19.FingerCurl.HalfCurl, 1);
  sSign.addDirection(import_fingerpose19.Finger.Index, import_fingerpose19.FingerDirection.VerticalUp, 0.7);
  sSign.addCurl(import_fingerpose19.Finger.Index, import_fingerpose19.FingerCurl.FullCurl, 1);
  sSign.addDirection(import_fingerpose19.Finger.Index, import_fingerpose19.FingerDirection.DiagonalUpRight, 0.7);
  sSign.addCurl(import_fingerpose19.Finger.Middle, import_fingerpose19.FingerCurl.FullCurl, 1);
  sSign.addDirection(import_fingerpose19.Finger.Middle, import_fingerpose19.FingerDirection.VerticalUp, 0.7);
  sSign.addCurl(import_fingerpose19.Finger.Ring, import_fingerpose19.FingerCurl.FullCurl, 1);
  sSign.addDirection(import_fingerpose19.Finger.Ring, import_fingerpose19.FingerDirection.VerticalUp, 0.7);
  sSign.addCurl(import_fingerpose19.Finger.Pinky, import_fingerpose19.FingerCurl.FullCurl, 1);
  sSign.addDirection(import_fingerpose19.Finger.Pinky, import_fingerpose19.FingerDirection.DiagonalUpLeft, 0.7);

  // scripts/handsigns-src/Tsign.js
  var import_fingerpose20 = __toESM(require_fingerpose());
  var tSign = new import_fingerpose20.GestureDescription("T");
  tSign.addCurl(import_fingerpose20.Finger.Thumb, import_fingerpose20.FingerCurl.NoCurl, 1);
  tSign.addDirection(import_fingerpose20.Finger.Index, import_fingerpose20.FingerDirection.VerticalUp, 0.7);
  tSign.addCurl(import_fingerpose20.Finger.Index, import_fingerpose20.FingerCurl.FullCurl, 1);
  tSign.addDirection(import_fingerpose20.Finger.Index, import_fingerpose20.FingerDirection.DiagonalUpRight, 0.7);
  tSign.addCurl(import_fingerpose20.Finger.Middle, import_fingerpose20.FingerCurl.FullCurl, 1);
  tSign.addDirection(import_fingerpose20.Finger.Middle, import_fingerpose20.FingerDirection.VerticalUp, 0.7);
  tSign.addCurl(import_fingerpose20.Finger.Ring, import_fingerpose20.FingerCurl.FullCurl, 1);
  tSign.addDirection(import_fingerpose20.Finger.Ring, import_fingerpose20.FingerDirection.VerticalUp, 0.7);
  tSign.addCurl(import_fingerpose20.Finger.Pinky, import_fingerpose20.FingerCurl.FullCurl, 1);
  tSign.addDirection(import_fingerpose20.Finger.Pinky, import_fingerpose20.FingerDirection.DiagonalUpLeft, 0.7);

  // scripts/handsigns-src/Usign.js
  var import_fingerpose21 = __toESM(require_fingerpose());
  var uSign = new import_fingerpose21.GestureDescription("U");
  uSign.addCurl(import_fingerpose21.Finger.Thumb, import_fingerpose21.FingerCurl.HalfCurl, 1);
  uSign.addDirection(import_fingerpose21.Finger.Index, import_fingerpose21.FingerDirection.DiagonalUpLeft, 0.7);
  uSign.addCurl(import_fingerpose21.Finger.Index, import_fingerpose21.FingerCurl.NoCurl, 1);
  uSign.addDirection(import_fingerpose21.Finger.Index, import_fingerpose21.FingerDirection.VerticalUp, 0.7);
  uSign.addCurl(import_fingerpose21.Finger.Middle, import_fingerpose21.FingerCurl.NoCurl, 1);
  uSign.addDirection(import_fingerpose21.Finger.Middle, import_fingerpose21.FingerDirection.VerticalUp, 0.7);
  uSign.addCurl(import_fingerpose21.Finger.Ring, import_fingerpose21.FingerCurl.FullCurl, 1);
  uSign.addDirection(import_fingerpose21.Finger.Ring, import_fingerpose21.FingerDirection.VerticalUp, 0.7);
  uSign.addCurl(import_fingerpose21.Finger.Pinky, import_fingerpose21.FingerCurl.FullCurl, 1);
  uSign.addDirection(import_fingerpose21.Finger.Pinky, import_fingerpose21.FingerDirection.DiagonalUpLeft, 0.7);

  // scripts/handsigns-src/Vsign.js
  var import_fingerpose22 = __toESM(require_fingerpose());
  var vSign = new import_fingerpose22.GestureDescription("V");
  vSign.addCurl(import_fingerpose22.Finger.Thumb, import_fingerpose22.FingerCurl.HalfCurl, 1);
  vSign.addDirection(import_fingerpose22.Finger.Index, import_fingerpose22.FingerDirection.DiagonalUpLeft, 0.7);
  vSign.addCurl(import_fingerpose22.Finger.Index, import_fingerpose22.FingerCurl.NoCurl, 1);
  vSign.addDirection(import_fingerpose22.Finger.Index, import_fingerpose22.FingerDirection.DiagonalUpRight, 0.7);
  vSign.addCurl(import_fingerpose22.Finger.Middle, import_fingerpose22.FingerCurl.NoCurl, 1);
  vSign.addDirection(import_fingerpose22.Finger.Middle, import_fingerpose22.FingerDirection.VerticalUp, 0.7);
  vSign.addCurl(import_fingerpose22.Finger.Ring, import_fingerpose22.FingerCurl.FullCurl, 1);
  vSign.addDirection(import_fingerpose22.Finger.Ring, import_fingerpose22.FingerDirection.VerticalUp, 0.7);
  vSign.addCurl(import_fingerpose22.Finger.Pinky, import_fingerpose22.FingerCurl.FullCurl, 1);
  vSign.addDirection(import_fingerpose22.Finger.Pinky, import_fingerpose22.FingerDirection.DiagonalUpLeft, 0.7);

  // scripts/handsigns-src/Wsign.js
  var import_fingerpose23 = __toESM(require_fingerpose());
  var wSign = new import_fingerpose23.GestureDescription("W");
  wSign.addCurl(import_fingerpose23.Finger.Thumb, import_fingerpose23.FingerCurl.HalfCurl, 1);
  wSign.addDirection(import_fingerpose23.Finger.Index, import_fingerpose23.FingerDirection.DiagonalUpLeft, 0.7);
  wSign.addCurl(import_fingerpose23.Finger.Index, import_fingerpose23.FingerCurl.NoCurl, 1);
  wSign.addDirection(import_fingerpose23.Finger.Index, import_fingerpose23.FingerDirection.DiagonalUpRight, 0.7);
  wSign.addCurl(import_fingerpose23.Finger.Middle, import_fingerpose23.FingerCurl.NoCurl, 1);
  wSign.addDirection(import_fingerpose23.Finger.Middle, import_fingerpose23.FingerDirection.VerticalUp, 0.7);
  wSign.addCurl(import_fingerpose23.Finger.Ring, import_fingerpose23.FingerCurl.NoCurl, 1);
  wSign.addDirection(import_fingerpose23.Finger.Ring, import_fingerpose23.FingerDirection.DiagonalUpLeft, 0.7);
  wSign.addCurl(import_fingerpose23.Finger.Pinky, import_fingerpose23.FingerCurl.FullCurl, 1);
  wSign.addDirection(import_fingerpose23.Finger.Pinky, import_fingerpose23.FingerDirection.DiagonalUpLeft, 0.7);

  // scripts/handsigns-src/Xsign.js
  var import_fingerpose24 = __toESM(require_fingerpose());
  var xSign = new import_fingerpose24.GestureDescription("X");
  xSign.addCurl(import_fingerpose24.Finger.Thumb, import_fingerpose24.FingerCurl.HalfCurl, 1);
  xSign.addDirection(import_fingerpose24.Finger.Index, import_fingerpose24.FingerDirection.VerticalUp, 0.7);
  xSign.addCurl(import_fingerpose24.Finger.Index, import_fingerpose24.FingerCurl.HalfCurl, 1);
  xSign.addDirection(import_fingerpose24.Finger.Index, import_fingerpose24.FingerDirection.VerticalUp, 0.7);
  xSign.addCurl(import_fingerpose24.Finger.Middle, import_fingerpose24.FingerCurl.FullCurl, 1);
  xSign.addDirection(import_fingerpose24.Finger.Middle, import_fingerpose24.FingerDirection.VerticalUp, 0.7);
  xSign.addCurl(import_fingerpose24.Finger.Ring, import_fingerpose24.FingerCurl.FullCurl, 1);
  xSign.addDirection(import_fingerpose24.Finger.Ring, import_fingerpose24.FingerDirection.VerticalUp, 0.7);
  xSign.addCurl(import_fingerpose24.Finger.Pinky, import_fingerpose24.FingerCurl.FullCurl, 1);
  xSign.addDirection(import_fingerpose24.Finger.Pinky, import_fingerpose24.FingerDirection.VerticalUp, 0.7);

  // scripts/handsigns-src/Ysign.js
  var import_fingerpose25 = __toESM(require_fingerpose());
  var ySign = new import_fingerpose25.GestureDescription("Y");
  ySign.addCurl(import_fingerpose25.Finger.Thumb, import_fingerpose25.FingerCurl.NoCurl, 1);
  ySign.addDirection(import_fingerpose25.Finger.Index, import_fingerpose25.FingerDirection.DiagonalUpRight, 0.7);
  ySign.addCurl(import_fingerpose25.Finger.Index, import_fingerpose25.FingerCurl.FullCurl, 1);
  ySign.addDirection(import_fingerpose25.Finger.Index, import_fingerpose25.FingerDirection.VerticalUp, 0.7);
  ySign.addCurl(import_fingerpose25.Finger.Middle, import_fingerpose25.FingerCurl.FullCurl, 1);
  ySign.addDirection(import_fingerpose25.Finger.Middle, import_fingerpose25.FingerDirection.VerticalUp, 0.7);
  ySign.addCurl(import_fingerpose25.Finger.Ring, import_fingerpose25.FingerCurl.FullCurl, 1);
  ySign.addDirection(import_fingerpose25.Finger.Ring, import_fingerpose25.FingerDirection.VerticalUp, 0.7);
  ySign.addCurl(import_fingerpose25.Finger.Pinky, import_fingerpose25.FingerCurl.NoCurl, 1);
  ySign.addDirection(import_fingerpose25.Finger.Pinky, import_fingerpose25.FingerDirection.DiagonalUpLeft, 0.7);

  // scripts/handsigns-src/Zsign.js
  var import_fingerpose26 = __toESM(require_fingerpose());
  var zSign = new import_fingerpose26.GestureDescription("Z");
  zSign.addCurl(import_fingerpose26.Finger.Thumb, import_fingerpose26.FingerCurl.NoCurl, 0.8);
  zSign.addDirection(import_fingerpose26.Finger.Index, import_fingerpose26.FingerDirection.HorizontalLeft, 0.7);
  zSign.addCurl(import_fingerpose26.Finger.Index, import_fingerpose26.FingerCurl.NoCurl, 1);
  zSign.addDirection(import_fingerpose26.Finger.Index, import_fingerpose26.FingerDirection.DiagonalUpLeft, 0.7);
  zSign.addCurl(import_fingerpose26.Finger.Middle, import_fingerpose26.FingerCurl.FullCurl, 1);
  zSign.addDirection(import_fingerpose26.Finger.Middle, import_fingerpose26.FingerDirection.HorizontalLeft, 0.7);
  zSign.addCurl(import_fingerpose26.Finger.Ring, import_fingerpose26.FingerCurl.FullCurl, 1);
  zSign.addDirection(import_fingerpose26.Finger.Ring, import_fingerpose26.FingerDirection.HorizontalLeft, 0.7);
  zSign.addCurl(import_fingerpose26.Finger.Pinky, import_fingerpose26.FingerCurl.FullCurl, 1);
  zSign.addDirection(import_fingerpose26.Finger.Pinky, import_fingerpose26.FingerDirection.HorizontalLeft, 0.7);

  // scripts/handsigns-entry.js
  var fpExports = import_fingerpose27.default.default || import_fingerpose27.default;
  var alphabetGestureList = [
    aSign,
    bSign,
    cSign,
    dSign,
    eSign,
    fSign,
    gSign,
    hSign,
    iSign,
    jSign,
    kSign,
    lSign,
    mSign,
    nSign,
    oSign,
    pSign,
    qSign,
    rSign,
    sSign,
    tSign,
    uSign,
    vSign,
    wSign,
    xSign,
    ySign,
    zSign
  ];
  return __toCommonJS(handsigns_entry_exports);
})();
