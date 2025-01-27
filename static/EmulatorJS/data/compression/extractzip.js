var Module,
  Module = Module || (void 0 !== Module ? Module : null) || {},
  moduleOverrides = {},
  key
for (key in Module) Module.hasOwnProperty(key) && (moduleOverrides[key] = Module[key])
var ENVIRONMENT_IS_WEB = !1,
  ENVIRONMENT_IS_WORKER = !1,
  ENVIRONMENT_IS_NODE = !1,
  ENVIRONMENT_IS_SHELL = !1,
  nodeFS,
  nodePath,
  TRY_USE_DUMP,
  key
if (Module.ENVIRONMENT)
  if ('WEB' === Module.ENVIRONMENT) ENVIRONMENT_IS_WEB = !0
  else if ('WORKER' === Module.ENVIRONMENT) ENVIRONMENT_IS_WORKER = !0
  else if ('NODE' === Module.ENVIRONMENT) ENVIRONMENT_IS_NODE = !0
  else {
    if ('SHELL' !== Module.ENVIRONMENT)
      throw new Error(
        "The provided Module['ENVIRONMENT'] value is not valid. It must be one of: WEB|WORKER|NODE|SHELL."
      )
    ENVIRONMENT_IS_SHELL = !0
  }
else
  (ENVIRONMENT_IS_WEB = 'object' == typeof window),
    (ENVIRONMENT_IS_WORKER = 'function' == typeof importScripts),
    (ENVIRONMENT_IS_NODE =
      'object' == typeof process && 'function' == typeof require && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER),
    (ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER)
if (ENVIRONMENT_IS_NODE)
  Module.print || (Module.print = console.log),
    Module.printErr || (Module.printErr = console.warn),
    (Module.read = function (e, r) {
      ;(nodeFS = nodeFS || require('fs')), (e = (nodePath = nodePath || require('path')).normalize(e))
      e = nodeFS.readFileSync(e)
      return r ? e : e.toString()
    }),
    (Module.readBinary = function (e) {
      e = Module.read(e, !0)
      return e.buffer || (e = new Uint8Array(e)), assert(e.buffer), e
    }),
    (Module.load = function (e) {
      globalEval(read(e))
    }),
    Module.thisProgram ||
      (1 < process.argv.length
        ? (Module.thisProgram = process.argv[1].replace(/\\/g, '/'))
        : (Module.thisProgram = 'unknown-program')),
    (Module.arguments = process.argv.slice(2)),
    'undefined' != typeof module && (module.exports = Module),
    process.on('uncaughtException', function (e) {
      if (!(e instanceof ExitStatus)) throw e
    }),
    (Module.inspect = function () {
      return '[Emscripten Module object]'
    })
else if (ENVIRONMENT_IS_SHELL)
  Module.print || (Module.print = print),
    'undefined' != typeof printErr && (Module.printErr = printErr),
    'undefined' != typeof read
      ? (Module.read = read)
      : (Module.read = function () {
          throw 'no read() available'
        }),
    (Module.readBinary = function (e) {
      if ('function' == typeof readbuffer) return new Uint8Array(readbuffer(e))
      e = read(e, 'binary')
      return assert('object' == typeof e), e
    }),
    'undefined' != typeof scriptArgs
      ? (Module.arguments = scriptArgs)
      : 'undefined' != typeof arguments && (Module.arguments = arguments),
    'function' == typeof quit &&
      (Module.quit = function (e, r) {
        quit(e)
      })
else {
  if (!ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) throw 'Unknown runtime environment. Where are we?'
  ;(Module.read = function (e) {
    var r = new XMLHttpRequest()
    return r.open('GET', e, !1), r.send(null), r.responseText
  }),
    ENVIRONMENT_IS_WORKER &&
      (Module.readBinary = function (e) {
        var r = new XMLHttpRequest()
        return r.open('GET', e, !1), (r.responseType = 'arraybuffer'), r.send(null), new Uint8Array(r.response)
      }),
    (Module.readAsync = function (e, r, t) {
      var n = new XMLHttpRequest()
      n.open('GET', e, !0),
        (n.responseType = 'arraybuffer'),
        (n.onload = function () {
          200 == n.status || (0 == n.status && n.response) ? r(n.response) : t()
        }),
        (n.onerror = t),
        n.send(null)
    }),
    'undefined' != typeof arguments && (Module.arguments = arguments),
    'undefined' != typeof console
      ? (Module.print ||
          (Module.print = function (e) {
            console.log(e)
          }),
        Module.printErr ||
          (Module.printErr = function (e) {
            console.warn(e)
          }))
      : ((TRY_USE_DUMP = !1),
        Module.print ||
          (Module.print =
            TRY_USE_DUMP && 'undefined' != typeof dump
              ? function (e) {
                  dump(e)
                }
              : function (e) {})),
    ENVIRONMENT_IS_WORKER && (Module.load = importScripts),
    void 0 === Module.setWindowTitle &&
      (Module.setWindowTitle = function (e) {
        document.title = e
      })
}
function globalEval(e) {
  eval.call(null, e)
}
for (key in (!Module.load &&
  Module.read &&
  (Module.load = function (e) {
    globalEval(Module.read(e))
  }),
Module.print || (Module.print = function () {}),
Module.printErr || (Module.printErr = Module.print),
Module.arguments || (Module.arguments = []),
Module.thisProgram || (Module.thisProgram = './this.program'),
Module.quit ||
  (Module.quit = function (e, r) {
    throw r
  }),
(Module.print = Module.print),
(Module.printErr = Module.printErr),
(Module.preRun = []),
(Module.postRun = []),
moduleOverrides))
  moduleOverrides.hasOwnProperty(key) && (Module[key] = moduleOverrides[key])
moduleOverrides = void 0
var Runtime = {
  setTempRet0: function (e) {
    return (tempRet0 = e)
  },
  getTempRet0: function () {
    return tempRet0
  },
  stackSave: function () {
    return STACKTOP
  },
  stackRestore: function (e) {
    STACKTOP = e
  },
  getNativeTypeSize: function (e) {
    switch (e) {
      case 'i1':
      case 'i8':
        return 1
      case 'i16':
        return 2
      case 'i32':
        return 4
      case 'i64':
        return 8
      case 'float':
        return 4
      case 'double':
        return 8
      default:
        if ('*' === e[e.length - 1]) return Runtime.QUANTUM_SIZE
        if ('i' !== e[0]) return 0
        var r = parseInt(e.substr(1))
        return assert(r % 8 == 0), r / 8
    }
  },
  getNativeFieldSize: function (e) {
    return Math.max(Runtime.getNativeTypeSize(e), Runtime.QUANTUM_SIZE)
  },
  STACK_ALIGN: 16,
  prepVararg: function (e, r) {
    return 'double' === r || 'i64' === r ? 7 & e && (assert(4 == (7 & e)), (e += 4)) : assert(0 == (3 & e)), e
  },
  getAlignSize: function (e, r, t) {
    return t || ('i64' != e && 'double' != e)
      ? e
        ? Math.min(r || (e ? Runtime.getNativeFieldSize(e) : 0), Runtime.QUANTUM_SIZE)
        : Math.min(r, 8)
      : 8
  },
  dynCall: function (e, r, t) {
    return t && t.length
      ? (assert(t.length == e.length - 1),
        assert('dynCall_' + e in Module, "bad function pointer type - no table for sig '" + e + "'"),
        Module['dynCall_' + e].apply(null, [r].concat(t)))
      : (assert(1 == e.length),
        assert('dynCall_' + e in Module, "bad function pointer type - no table for sig '" + e + "'"),
        Module['dynCall_' + e].call(null, r))
  },
  functionPointers: [],
  addFunction: function (e) {
    for (var r = 0; r < Runtime.functionPointers.length; r++)
      if (!Runtime.functionPointers[r]) return (Runtime.functionPointers[r] = e), 2 * (1 + r)
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.'
  },
  removeFunction: function (e) {
    Runtime.functionPointers[(e - 2) / 2] = null
  },
  warnOnce: function (e) {
    Runtime.warnOnce.shown || (Runtime.warnOnce.shown = {}),
      Runtime.warnOnce.shown[e] || ((Runtime.warnOnce.shown[e] = 1), Module.printErr(e))
  },
  funcWrappers: {},
  getFuncWrapper: function (r, t) {
    if (r) {
      assert(t), Runtime.funcWrappers[t] || (Runtime.funcWrappers[t] = {})
      var e = Runtime.funcWrappers[t]
      return (
        e[r] ||
          (1 === t.length
            ? (e[r] = function () {
                return Runtime.dynCall(t, r)
              })
            : 2 === t.length
              ? (e[r] = function (e) {
                  return Runtime.dynCall(t, r, [e])
                })
              : (e[r] = function () {
                  return Runtime.dynCall(t, r, Array.prototype.slice.call(arguments))
                })),
        e[r]
      )
    }
  },
  getCompilerSetting: function (e) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work'
  },
  stackAlloc: function (e) {
    var r = STACKTOP
    return assert(((0 | (STACKTOP = ((STACKTOP = (STACKTOP + e) | 0) + 15) & -16)) < (0 | STACK_MAX)) | 0), r
  },
  staticAlloc: function (e) {
    var r = STATICTOP
    return (STATICTOP = ((STATICTOP = (STATICTOP + (assert(!staticSealed), e)) | 0) + 15) & -16), r
  },
  dynamicAlloc: function (e) {
    assert(DYNAMICTOP_PTR)
    var r = HEAP32[DYNAMICTOP_PTR >> 2],
      e = -16 & ((r + e + 15) | 0)
    if (((HEAP32[DYNAMICTOP_PTR >> 2] = e), TOTAL_MEMORY <= e) && !enlargeMemory())
      return (HEAP32[DYNAMICTOP_PTR >> 2] = r), 0
    return r
  },
  alignMemory: function (e, r) {
    return (e = Math.ceil(e / (r || 16)) * (r || 16))
  },
  makeBigInt: function (e, r, t) {
    return t ? +(e >>> 0) + 4294967296 * (r >>> 0) : +(e >>> 0) + 4294967296 * (0 | r)
  },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0,
}
Module.Runtime = Runtime
var ABORT = 0,
  EXITSTATUS = 0,
  cwrap,
  ccall
function assert(e, r) {
  e || abort('Assertion failed: ' + r)
}
function getCFunc(_0x5d9040) {
  var _0x23b817 = Module['_' + _0x5d9040]
  if (!_0x23b817)
    try {
      _0x23b817 = eval('_' + _0x5d9040)
    } catch (_0x2989f0) {}
  return (
    assert(
      _0x23b817,
      'Cannot call unknown function ' + _0x5d9040 + ' (perhaps LLVM optimizations or closure removed it?)'
    ),
    _0x23b817
  )
}
function setValue(e, r, t, n) {
  switch (('*' === (t = t || 'i8').charAt(t.length - 1) && (t = 'i32'), t)) {
    case 'i1':
    case 'i8':
      HEAP8[e >> 0] = r
      break
    case 'i16':
      HEAP16[e >> 1] = r
      break
    case 'i32':
      HEAP32[e >> 2] = r
      break
    case 'i64':
      ;(tempI64 = [
        r >>> 0,
        ((tempDouble = r),
        1 <= +Math_abs(tempDouble)
          ? 0 < tempDouble
            ? (0 | Math_min(+Math_floor(tempDouble / 4294967296), 4294967295)) >>> 0
            : ~~+Math_ceil((tempDouble - (~~tempDouble >>> 0)) / 4294967296) >>> 0
          : 0),
      ]),
        (HEAP32[e >> 2] = tempI64[0]),
        (HEAP32[(e + 4) >> 2] = tempI64[1])
      break
    case 'float':
      HEAPF32[e >> 2] = r
      break
    case 'double':
      HEAPF64[e >> 3] = r
      break
    default:
      abort('invalid type for setValue: ' + t)
  }
}
function getValue(e, r, t) {
  switch (('*' === (r = r || 'i8').charAt(r.length - 1) && (r = 'i32'), r)) {
    case 'i1':
    case 'i8':
      return HEAP8[e >> 0]
    case 'i16':
      return HEAP16[e >> 1]
    case 'i32':
    case 'i64':
      return HEAP32[e >> 2]
    case 'float':
      return HEAPF32[e >> 2]
    case 'double':
      return HEAPF64[e >> 3]
    default:
      abort('invalid type for setValue: ' + r)
  }
  return null
}
!(function () {
  var _0x2ad24a = {
      stackSave: function () {
        Runtime.stackSave()
      },
      stackRestore: function () {
        Runtime.stackRestore()
      },
      arrayToC: function (e) {
        var r = Runtime.stackAlloc(e.length)
        return writeArrayToMemory(e, r), r
      },
      stringToC: function (e) {
        var r,
          t = 0
        return null != e && 0 !== e && ((r = 1 + (e.length << 2)), stringToUTF8(e, (t = Runtime.stackAlloc(r)), r)), t
      },
    },
    _0x3c7171 = { string: _0x2ad24a.stringToC, array: _0x2ad24a.arrayToC }
  ccall = function (e, r, t, n, o) {
    var e = getCFunc(e),
      i = [],
      a = 0
    if ((assert('array' !== r, 'Return type should not be "array".'), n))
      for (var s = 0; s < n.length; s++) {
        var u = _0x3c7171[t[s]]
        u ? (0 === a && (a = Runtime.stackSave()), (i[s] = u(n[s]))) : (i[s] = n[s])
      }
    e = e.apply(null, i)
    if (
      ((o && o.async) ||
        'object' != typeof EmterpreterAsync ||
        assert(!EmterpreterAsync.state, 'cannot start async op with normal JS calling ccall'),
      o && o.async && assert(!r, 'async ccalls cannot return values'),
      'string' === r && (e = Pointer_stringify(e)),
      0 !== a)
    ) {
      if (o && o.async)
        return void EmterpreterAsync.asyncFinalizers.push(function () {
          Runtime.stackRestore(a)
        })
      Runtime.stackRestore(a)
    }
    return e
  }
  var _0x4e9080 = /^function\s*[a-zA-Z$_0-9]*\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/
  function _0x525a72(e) {
    e = e.toString().match(_0x4e9080).slice(1)
    return { arguments: e[0], body: e[1], returnValue: e[2] }
  }
  var _0x5507b1 = null
  function _0x576877() {
    if (!_0x5507b1)
      for (var e in ((_0x5507b1 = {}), _0x2ad24a))
        _0x2ad24a.hasOwnProperty(e) && (_0x5507b1[e] = _0x525a72(_0x2ad24a[e]))
  }
  cwrap = function cwrap(_0x557d23, _0x36bd20, _0x501373) {
    _0x501373 = _0x501373 || []
    var _0xc18cca = getCFunc(_0x557d23),
      _0x10a9e9 = _0x501373.every(function (e) {
        return 'number' === e
      }),
      _0xda1dce = 'string' !== _0x36bd20
    if (_0xda1dce && _0x10a9e9) return _0xc18cca
    var _0x3c93ad = _0x501373.map(function (e, r) {
        return '$' + r
      }),
      _0x6f14b3 = '(function(' + _0x3c93ad.join(',') + ') {',
      _0x2c5f4f = _0x501373.length
    if (!_0x10a9e9) {
      _0x576877(), (_0x6f14b3 += 'var stack = ' + _0x5507b1.stackSave.body + ';')
      for (var _0x32e944 = 0; _0x32e944 < _0x2c5f4f; _0x32e944++) {
        var _0x596eed = _0x3c93ad[_0x32e944],
          _0x31887c = _0x501373[_0x32e944],
          _0x2abb1c
        'number' !== _0x31887c &&
          ((_0x2abb1c = _0x5507b1[_0x31887c + 'ToC']),
          (_0x6f14b3 += 'var ' + _0x2abb1c.arguments + ' = ' + _0x596eed + ';'),
          (_0x6f14b3 += _0x2abb1c.body + ';'),
          (_0x6f14b3 += _0x596eed + '=(' + _0x2abb1c.returnValue + ');'))
      }
    }
    var _0x7f6ef = _0x525a72(function () {
        return _0xc18cca
      }).returnValue,
      _0x296ada
    return (
      (_0x6f14b3 += 'var ret = ' + _0x7f6ef + '(' + _0x3c93ad.join(',') + ');'),
      _0xda1dce ||
        ((_0x296ada = _0x525a72(function () {
          return Pointer_stringify
        }).returnValue),
        (_0x6f14b3 += 'ret = ' + _0x296ada + '(ret);')),
      (_0x6f14b3 +=
        "if (typeof EmterpreterAsync === 'object') { assert(!EmterpreterAsync.state, 'cannot start async op with normal JS calling cwrap') }"),
      _0x10a9e9 || (_0x576877(), (_0x6f14b3 += _0x5507b1.stackRestore.body.replace('()', '(stack)') + ';')),
      (_0x6f14b3 += 'return ret})'),
      eval(_0x6f14b3)
    )
  }
})(),
  (Module.ccall = ccall),
  (Module.cwrap = cwrap),
  (Module.setValue = setValue),
  (Module.getValue = getValue)
var ALLOC_NORMAL = 0,
  ALLOC_STACK = 1,
  ALLOC_STATIC = 2,
  ALLOC_DYNAMIC = 3,
  ALLOC_NONE = 4
function allocate(e, r, t, n) {
  var o,
    i = 'number' == typeof e ? ((o = !0), e) : ((o = !1), e.length),
    a = 'string' == typeof r ? r : null,
    s =
      t == ALLOC_NONE
        ? n
        : [
            'function' == typeof _malloc ? _malloc : Runtime.staticAlloc,
            Runtime.stackAlloc,
            Runtime.staticAlloc,
            Runtime.dynamicAlloc,
          ][void 0 === t ? ALLOC_STATIC : t](Math.max(i, a ? 1 : r.length))
  if (o) {
    var u,
      n = s
    for (assert(0 == (3 & s)), u = s + (-4 & i); n < u; n += 4) HEAP32[n >> 2] = 0
    for (u = s + i; n < u; ) HEAP8[n++ >> 0] = 0
    return s
  }
  if ('i8' === a) return e.subarray || e.slice ? HEAPU8.set(e, s) : HEAPU8.set(new Uint8Array(e), s), s
  for (var c, l, f, d = 0; d < i; ) {
    var E = e[d]
    'function' == typeof E && (E = Runtime.getFunctionIndex(E)),
      0 !== (c = a || r[d])
        ? (assert(c, 'Must know what type to store in allocate!'),
          'i64' == c && (c = 'i32'),
          setValue(s + d, E, c),
          f !== c && ((l = Runtime.getNativeTypeSize(c)), (f = c)),
          (d += l))
        : d++
  }
  return s
}
function getMemory(e) {
  return staticSealed ? (runtimeInitialized ? _malloc(e) : Runtime.dynamicAlloc(e)) : Runtime.staticAlloc(e)
}
function Pointer_stringify(e, r) {
  if (0 === r || !e) return ''
  for (
    var t, n = 0, o = 0;
    assert(e + o < TOTAL_MEMORY), (n |= t = HEAPU8[(e + o) >> 0]), (0 != t || r) && (o++, !r || o != r);

  );
  r = r || o
  var i = ''
  if (n < 128) {
    for (var a; 0 < r; )
      (a = String.fromCharCode.apply(String, HEAPU8.subarray(e, e + Math.min(r, 1024)))),
        (i = i ? i + a : a),
        (e += 1024),
        (r -= 1024)
    return i
  }
  return Module.UTF8ToString(e)
}
function AsciiToString(e) {
  for (var r = ''; ; ) {
    var t = HEAP8[e++ >> 0]
    if (!t) return r
    r += String.fromCharCode(t)
  }
}
function stringToAscii(e, r) {
  return writeAsciiToMemory(e, r, !1)
}
;(Module.ALLOC_NORMAL = ALLOC_NORMAL),
  (Module.ALLOC_STACK = ALLOC_STACK),
  (Module.ALLOC_STATIC = ALLOC_STATIC),
  (Module.ALLOC_DYNAMIC = ALLOC_DYNAMIC),
  (Module.ALLOC_NONE = ALLOC_NONE),
  (Module.allocate = allocate),
  (Module.getMemory = getMemory),
  (Module.Pointer_stringify = Pointer_stringify),
  (Module.AsciiToString = AsciiToString),
  (Module.stringToAscii = stringToAscii)
var UTF8Decoder = 'undefined' != typeof TextDecoder ? new TextDecoder('utf8') : void 0
function UTF8ArrayToString(e, r) {
  for (var t = r; e[t]; ) ++t
  if (16 < t - r && e.subarray && UTF8Decoder) return UTF8Decoder.decode(e.subarray(r, t))
  for (var n, o, i, a, s, u = ''; ; ) {
    if (!(a = e[r++])) return u
    128 & a
      ? ((s = 63 & e[r++]),
        192 != (224 & a)
          ? ((i = 63 & e[r++]),
            (a =
              224 == (240 & a)
                ? ((15 & a) << 12) | (s << 6) | i
                : ((n = 63 & e[r++]),
                  240 == (248 & a)
                    ? ((7 & a) << 18) | (s << 12) | (i << 6) | n
                    : ((o = 63 & e[r++]),
                      248 == (252 & a)
                        ? ((3 & a) << 24) | (s << 18) | (i << 12) | (n << 6) | o
                        : ((1 & a) << 30) | (s << 24) | (i << 18) | (n << 12) | (o << 6) | (63 & e[r++])))) < 65536
              ? (u += String.fromCharCode(a))
              : ((o = a - 65536), (u += String.fromCharCode(55296 | (o >> 10), 56320 | (1023 & o)))))
          : (u += String.fromCharCode(((31 & a) << 6) | s)))
      : (u += String.fromCharCode(a))
  }
}
function UTF8ToString(e) {
  return UTF8ArrayToString(HEAPU8, e)
}
function stringToUTF8Array(e, r, t, n) {
  if (!(0 < n)) return 0
  for (var o = t, i = t + n - 1, a = 0; a < e.length; ++a) {
    var s = e.charCodeAt(a)
    if ((55296 <= s && s <= 57343 && (s = (65536 + ((1023 & s) << 10)) | (1023 & e.charCodeAt(++a))), s <= 127)) {
      if (i <= t) break
      r[t++] = s
    } else if (s <= 2047) {
      if (i <= t + 1) break
      ;(r[t++] = 192 | (s >> 6)), (r[t++] = 128 | (63 & s))
    } else if (s <= 65535) {
      if (i <= t + 2) break
      ;(r[t++] = 224 | (s >> 12)), (r[t++] = 128 | ((s >> 6) & 63)), (r[t++] = 128 | (63 & s))
    } else if (s <= 2097151) {
      if (i <= t + 3) break
      ;(r[t++] = 240 | (s >> 18)),
        (r[t++] = 128 | ((s >> 12) & 63)),
        (r[t++] = 128 | ((s >> 6) & 63)),
        (r[t++] = 128 | (63 & s))
    } else if (s <= 67108863) {
      if (i <= t + 4) break
      ;(r[t++] = 248 | (s >> 24)),
        (r[t++] = 128 | ((s >> 18) & 63)),
        (r[t++] = 128 | ((s >> 12) & 63)),
        (r[t++] = 128 | ((s >> 6) & 63)),
        (r[t++] = 128 | (63 & s))
    } else {
      if (i <= t + 5) break
      ;(r[t++] = 252 | (s >> 30)),
        (r[t++] = 128 | ((s >> 24) & 63)),
        (r[t++] = 128 | ((s >> 18) & 63)),
        (r[t++] = 128 | ((s >> 12) & 63)),
        (r[t++] = 128 | ((s >> 6) & 63)),
        (r[t++] = 128 | (63 & s))
    }
  }
  return (r[t] = 0), t - o
}
function stringToUTF8(e, r, t) {
  return (
    assert(
      'number' == typeof t,
      'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!'
    ),
    stringToUTF8Array(e, HEAPU8, r, t)
  )
}
function lengthBytesUTF8(e) {
  for (var r = 0, t = 0; t < e.length; ++t) {
    var n = e.charCodeAt(t)
    55296 <= n && n <= 57343 && (n = (65536 + ((1023 & n) << 10)) | (1023 & e.charCodeAt(++t))),
      n <= 127 ? ++r : (r += n <= 2047 ? 2 : n <= 65535 ? 3 : n <= 2097151 ? 4 : n <= 67108863 ? 5 : 6)
  }
  return r
}
;(Module.UTF8ArrayToString = UTF8ArrayToString),
  (Module.UTF8ToString = UTF8ToString),
  (Module.stringToUTF8Array = stringToUTF8Array),
  (Module.stringToUTF8 = stringToUTF8),
  (Module.lengthBytesUTF8 = lengthBytesUTF8)
var UTF16Decoder = 'undefined' != typeof TextDecoder ? new TextDecoder('utf-16le') : void 0
function demangle(e) {
  var r = Module.___cxa_demangle || Module.__cxa_demangle
  if (r) {
    try {
      var t = e.substr(1),
        n = lengthBytesUTF8(t) + 1,
        o = _malloc(n)
      stringToUTF8(t, o, n)
      var i = _malloc(4),
        a = r(o, 0, 0, i)
      if (0 === getValue(i, 'i32') && a) return Pointer_stringify(a)
    } catch (e) {
    } finally {
      o && _free(o), i && _free(i), a && _free(a)
    }
    return e
  }
  return Runtime.warnOnce('warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling'), e
}
function demangleAll(e) {
  return e.replace(/__Z[\w\d_]+/g, function (e) {
    var r = demangle(e)
    return e === r ? e : e + ' [' + r + ']'
  })
}
function jsStackTrace() {
  var r = new Error()
  if (!r.stack) {
    try {
      throw new Error(0)
    } catch (e) {
      r = e
    }
    if (!r.stack) return '(no stack trace available)'
  }
  return r.stack.toString()
}
function stackTrace() {
  var e = jsStackTrace()
  return Module.extraStackTrace && (e += '\n' + Module.extraStackTrace()), demangleAll(e)
}
Module.stackTrace = stackTrace
var WASM_PAGE_SIZE = 65536,
  ASMJS_PAGE_SIZE = 16777216,
  MIN_TOTAL_MEMORY = 16777216,
  HEAP,
  buffer,
  HEAP8,
  HEAPU8,
  HEAP16,
  HEAPU16,
  HEAP32,
  HEAPU32,
  HEAPF32,
  HEAPF64,
  STATIC_BASE,
  STATICTOP,
  staticSealed,
  STACK_BASE,
  STACKTOP,
  STACK_MAX,
  DYNAMIC_BASE,
  DYNAMICTOP_PTR,
  byteLength
function alignUp(e, r) {
  return 0 < e % r && (e += r - (e % r)), e
}
function updateGlobalBuffer(e) {
  Module.buffer = buffer = e
}
function updateGlobalBufferViews() {
  ;(Module.HEAP8 = HEAP8 = new Int8Array(buffer)),
    (Module.HEAP16 = HEAP16 = new Int16Array(buffer)),
    (Module.HEAP32 = HEAP32 = new Int32Array(buffer)),
    (Module.HEAPU8 = HEAPU8 = new Uint8Array(buffer)),
    (Module.HEAPU16 = HEAPU16 = new Uint16Array(buffer)),
    (Module.HEAPU32 = HEAPU32 = new Uint32Array(buffer)),
    (Module.HEAPF32 = HEAPF32 = new Float32Array(buffer)),
    (Module.HEAPF64 = HEAPF64 = new Float64Array(buffer))
}
function writeStackCookie() {
  assert(0 == (3 & STACK_MAX)), (HEAPU32[(STACK_MAX >> 2) - 1] = 34821223), (HEAPU32[(STACK_MAX >> 2) - 2] = 2310721022)
}
function checkStackCookie() {
  if (
    ((34821223 == HEAPU32[(STACK_MAX >> 2) - 1] && 2310721022 == HEAPU32[(STACK_MAX >> 2) - 2]) ||
      abort(
        'Stack overflow! Stack cookie has been overwritten, expected hex dwords 0x89BACDFE and 0x02135467, but received 0x' +
          HEAPU32[(STACK_MAX >> 2) - 2].toString(16) +
          ' ' +
          HEAPU32[(STACK_MAX >> 2) - 1].toString(16)
      ),
    1668509029 !== HEAP32[0])
  )
    throw 'Runtime error: The application has corrupted its heap memory area (address zero)!'
}
function abortStackOverflow(e) {
  abort(
    'Stack overflow! Attempted to allocate ' +
      e +
      ' bytes on the stack, but stack has only ' +
      (STACK_MAX - Module.asm.stackSave() + e) +
      ' bytes available!'
  )
}
function abortOnCannotGrowMemory() {
  abort(
    'Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value ' +
      TOTAL_MEMORY +
      ', (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or (4) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 '
  )
}
function enlargeMemory() {
  assert(HEAP32[DYNAMICTOP_PTR >> 2] > TOTAL_MEMORY)
  var e = Module.usingWasm ? WASM_PAGE_SIZE : ASMJS_PAGE_SIZE,
    r = 2147483648 - e
  if (HEAP32[DYNAMICTOP_PTR >> 2] > r)
    return (
      Module.printErr(
        'Cannot enlarge memory, asked to go up to ' +
          HEAP32[DYNAMICTOP_PTR >> 2] +
          ' bytes, but the limit is ' +
          r +
          ' bytes!'
      ),
      !1
    )
  var t = TOTAL_MEMORY
  for (TOTAL_MEMORY = Math.max(TOTAL_MEMORY, MIN_TOTAL_MEMORY); TOTAL_MEMORY < HEAP32[DYNAMICTOP_PTR >> 2]; )
    TOTAL_MEMORY =
      TOTAL_MEMORY <= 536870912
        ? alignUp(2 * TOTAL_MEMORY, e)
        : Math.min(alignUp((3 * TOTAL_MEMORY + 2147483648) / 4, e), r)
  var n = Date.now(),
    o = Module.reallocBuffer(TOTAL_MEMORY)
  return o && o.byteLength == TOTAL_MEMORY
    ? (updateGlobalBuffer(o),
      updateGlobalBufferViews(),
      Module.printErr(
        'enlarged memory arrays from ' +
          t +
          ' to ' +
          TOTAL_MEMORY +
          ', took ' +
          (Date.now() - n) +
          ' ms (has ArrayBuffer.transfer? ' +
          !!ArrayBuffer.transfer +
          ')'
      ),
      Module.usingWasm || Module.printErr('Warning: Enlarging memory arrays, this is not fast! ' + [t, TOTAL_MEMORY]),
      !0)
    : (Module.printErr(
        'Failed to grow the heap from ' + t + ' bytes to ' + TOTAL_MEMORY + ' bytes, not enough memory!'
      ),
      o &&
        Module.printErr(
          'Expected to get back a buffer of size ' +
            TOTAL_MEMORY +
            ' bytes, but instead got back a buffer of size ' +
            o.byteLength
        ),
      (TOTAL_MEMORY = t),
      !1)
}
;(STATIC_BASE = STATICTOP = STACK_BASE = STACKTOP = STACK_MAX = DYNAMIC_BASE = DYNAMICTOP_PTR = 0),
  (staticSealed = !1),
  Module.reallocBuffer ||
    (Module.reallocBuffer = function (e) {
      var r, t
      try {
        ArrayBuffer.transfer
          ? (t = ArrayBuffer.transfer(buffer, e))
          : ((r = HEAP8), (t = new ArrayBuffer(e)), new Int8Array(t).set(r))
      } catch (e) {
        return !1
      }
      return !!_emscripten_replace_memory(t) && t
    })
try {
  ;(byteLength = Function.prototype.call.bind(
    Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, 'byteLength').get
  )),
    byteLength(new ArrayBuffer(4))
} catch (_0x5226f8) {
  byteLength = function (e) {
    return e.byteLength
  }
}
var TOTAL_STACK = Module.TOTAL_STACK || 5242880,
  TOTAL_MEMORY = Module.TOTAL_MEMORY || 16777216
function getTotalMemory() {
  return TOTAL_MEMORY
}
if (
  (TOTAL_MEMORY < TOTAL_STACK &&
    Module.printErr(
      'TOTAL_MEMORY should be larger than TOTAL_STACK, was ' + TOTAL_MEMORY + '! (TOTAL_STACK=' + TOTAL_STACK + ')'
    ),
  assert(
    'undefined' != typeof Int32Array &&
      'undefined' != typeof Float64Array &&
      void 0 !== Int32Array.prototype.subarray &&
      void 0 !== Int32Array.prototype.set,
    'JS engine does not provide full typed array support'
  ),
  Module.buffer
    ? ((buffer = Module.buffer),
      assert(
        buffer.byteLength === TOTAL_MEMORY,
        'provided buffer should be ' + TOTAL_MEMORY + ' bytes, but it is ' + buffer.byteLength
      ))
    : ((buffer = new ArrayBuffer(TOTAL_MEMORY)), assert(buffer.byteLength === TOTAL_MEMORY)),
  updateGlobalBufferViews(),
  (HEAP32[0] = 1668509029),
  (HEAP16[1] = 25459),
  115 !== HEAPU8[2] || 99 !== HEAPU8[3])
)
  throw 'Runtime error: expected the system to be little-endian!'
function callRuntimeCallbacks(e) {
  for (; 0 < e.length; ) {
    var r,
      t = e.shift()
    'function' != typeof t
      ? 'number' == typeof (r = t.func)
        ? void 0 === t.arg
          ? Module.dynCall_v(r)
          : Module.dynCall_vi(r, t.arg)
        : r(void 0 === t.arg ? null : t.arg)
      : t()
  }
}
;(Module.HEAP = HEAP),
  (Module.buffer = buffer),
  (Module.HEAP8 = HEAP8),
  (Module.HEAP16 = HEAP16),
  (Module.HEAP32 = HEAP32),
  (Module.HEAPU8 = HEAPU8),
  (Module.HEAPU16 = HEAPU16),
  (Module.HEAPU32 = HEAPU32),
  (Module.HEAPF32 = HEAPF32),
  (Module.HEAPF64 = HEAPF64)
var __ATPRERUN__ = [],
  __ATINIT__ = [],
  __ATMAIN__ = [],
  __ATEXIT__ = [],
  __ATPOSTRUN__ = [],
  runtimeInitialized = !1,
  runtimeExited = !1
function preRun() {
  if (Module.preRun)
    for ('function' == typeof Module.preRun && (Module.preRun = [Module.preRun]); Module.preRun.length; )
      addOnPreRun(Module.preRun.shift())
  callRuntimeCallbacks(__ATPRERUN__)
}
function ensureInitRuntime() {
  checkStackCookie(), runtimeInitialized || ((runtimeInitialized = !0), callRuntimeCallbacks(__ATINIT__))
}
function preMain() {
  checkStackCookie(), callRuntimeCallbacks(__ATMAIN__)
}
function exitRuntime() {
  checkStackCookie(), callRuntimeCallbacks(__ATEXIT__), (runtimeExited = !0)
}
function postRun() {
  if ((checkStackCookie(), Module.postRun))
    for ('function' == typeof Module.postRun && (Module.postRun = [Module.postRun]); Module.postRun.length; )
      addOnPostRun(Module.postRun.shift())
  callRuntimeCallbacks(__ATPOSTRUN__)
}
function addOnPreRun(e) {
  __ATPRERUN__.unshift(e)
}
function addOnInit(e) {
  __ATINIT__.unshift(e)
}
function addOnPreMain(e) {
  __ATMAIN__.unshift(e)
}
function addOnExit(e) {
  __ATEXIT__.unshift(e)
}
function addOnPostRun(e) {
  __ATPOSTRUN__.unshift(e)
}
function intArrayFromString(e, r, t) {
  ;(t = 0 < t ? t : lengthBytesUTF8(e) + 1), (t = new Array(t)), (e = stringToUTF8Array(e, t, 0, t.length))
  return r && (t.length = e), t
}
function intArrayToString(e) {
  for (var r = [], t = 0; t < e.length; t++) {
    var n = e[t]
    255 < n &&
      (assert(!1, 'Character code ' + n + ' (' + String.fromCharCode(n) + ')  at offset ' + t + ' not in 0x00-0xFF.'),
      (n &= 255)),
      r.push(String.fromCharCode(n))
  }
  return r.join('')
}
function writeStringToMemory(e, r, t) {
  var n, o
  Runtime.warnOnce('writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!'),
    t && ((o = r + lengthBytesUTF8(e)), (n = HEAP8[o])),
    stringToUTF8(e, r, 1 / 0),
    t && (HEAP8[o] = n)
}
function writeArrayToMemory(e, r) {
  assert(0 <= e.length, 'writeArrayToMemory array must have a length (should be an array or typed array)'),
    HEAP8.set(e, r)
}
function writeAsciiToMemory(e, r, t) {
  for (var n = 0; n < e.length; ++n)
    assert((e.charCodeAt(n) === e.charCodeAt(n)) & 255), (HEAP8[r++ >> 0] = e.charCodeAt(n))
  t || (HEAP8[r >> 0] = 0)
}
;(Module.addOnPreRun = addOnPreRun),
  (Module.addOnInit = addOnInit),
  (Module.addOnPreMain = addOnPreMain),
  (Module.addOnExit = addOnExit),
  (Module.addOnPostRun = addOnPostRun),
  (Module.intArrayFromString = intArrayFromString),
  (Module.intArrayToString = intArrayToString),
  (Module.writeStringToMemory = writeStringToMemory),
  (Module.writeArrayToMemory = writeArrayToMemory),
  (Module.writeAsciiToMemory = writeAsciiToMemory),
  (Math.imul && -5 === Math.imul(4294967295, 5)) ||
    (Math.imul = function (e, r) {
      var t = 65535 & e,
        n = 65535 & r
      return (t * n + (((e >>> 16) * n + t * (r >>> 16)) << 16)) | 0
    }),
  (Math.imul = Math.imul),
  Math.clz32 ||
    (Math.clz32 = function (e) {
      e >>>= 0
      for (var r = 0; r < 32; r++) if (e & (1 << (31 - r))) return r
      return 32
    }),
  (Math.clz32 = Math.clz32),
  Math.trunc ||
    (Math.trunc = function (e) {
      return e < 0 ? Math.ceil(e) : Math.floor(e)
    }),
  (Math.trunc = Math.trunc)
var Math_abs = Math.abs,
  Math_cos = Math.cos,
  Math_sin = Math.sin,
  Math_tan = Math.tan,
  Math_acos = Math.acos,
  Math_asin = Math.asin,
  Math_atan = Math.atan,
  Math_atan2 = Math.atan2,
  Math_exp = Math.exp,
  Math_log = Math.log,
  Math_sqrt = Math.sqrt,
  Math_ceil = Math.ceil,
  Math_floor = Math.floor,
  Math_pow = Math.pow,
  Math_imul = Math.imul,
  Math_fround = Math.fround,
  Math_round = Math.round,
  Math_min = Math.min,
  Math_clz32 = Math.clz32,
  Math_trunc = Math.trunc,
  runDependencies = 0,
  runDependencyWatcher = null,
  dependenciesFulfilled = null,
  runDependencyTracking = {}
function getUniqueRunDependency(e) {
  for (var r = e; ; ) {
    if (!runDependencyTracking[e]) return e
    e = r + Math.random()
  }
  return e
}
function addRunDependency(e) {
  runDependencies++,
    Module.monitorRunDependencies && Module.monitorRunDependencies(runDependencies),
    e
      ? (assert(!runDependencyTracking[e]),
        (runDependencyTracking[e] = 1),
        null === runDependencyWatcher &&
          'undefined' != typeof setInterval &&
          (runDependencyWatcher = setInterval(function () {
            if (ABORT) return clearInterval(runDependencyWatcher), void (runDependencyWatcher = null)
            var e,
              r = !1
            for (e in runDependencyTracking)
              r || ((r = !0), Module.printErr('still waiting on run dependencies:')),
                Module.printErr('dependency: ' + e)
            r && Module.printErr('(end of list)')
          }, 1e4)))
      : Module.printErr('warning: run dependency added without ID')
}
function removeRunDependency(e) {
  runDependencies--,
    Module.monitorRunDependencies && Module.monitorRunDependencies(runDependencies),
    e
      ? (assert(runDependencyTracking[e]), delete runDependencyTracking[e])
      : Module.printErr('warning: run dependency removed without ID'),
    0 == runDependencies &&
      (null !== runDependencyWatcher && (clearInterval(runDependencyWatcher), (runDependencyWatcher = null)),
      dependenciesFulfilled && ((e = dependenciesFulfilled), (dependenciesFulfilled = null), e()))
}
;(Module.addRunDependency = addRunDependency),
  (Module.removeRunDependency = removeRunDependency),
  (Module.preloadedImages = {}),
  (Module.preloadedAudios = {})
var ASM_CONSTS = [
  function (e, r, t) {
    for (var n = new Uint8Array(r), o = 0; o < r; o++) n[o] = getValue(t + o)
    postMessage({ t: 2, file: Pointer_stringify(e), size: r, data: n }), (n = null)
  },
  function () {
    postMessage({ t: 1 })
  },
  function (e, r) {
    postMessage({ t: 4, current: e, total: r })
  },
]
function _emscripten_asm_const_i(e) {
  return ASM_CONSTS[e]()
}
function _emscripten_asm_const_iiii(e, r, t, n) {
  return ASM_CONSTS[e](r, t, n)
}
function _emscripten_asm_const_iii(e, r, t) {
  return ASM_CONSTS[e](r, t)
}
;(STATIC_BASE = Runtime.GLOBAL_BASE),
  (STATICTOP = STATIC_BASE + 5408),
  __ATINIT__.push(),
  allocate(
    [
      0, 0, 0, 0, 100, 16, 183, 29, 200, 32, 110, 59, 172, 48, 217, 38, 144, 65, 220, 118, 244, 81, 107, 107, 88, 97,
      178, 77, 60, 113, 5, 80, 32, 131, 184, 237, 68, 147, 15, 240, 232, 163, 214, 214, 140, 179, 97, 203, 176, 194,
      100, 155, 212, 210, 211, 134, 120, 226, 10, 160, 28, 242, 189, 189, 1, 1, 0, 0, 1, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1,
      0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0,
      0, 4, 0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0, 5, 0, 0, 0, 5, 0, 0, 0, 5, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0, 5, 0, 0, 0, 6, 0, 0, 0, 7, 0, 0, 0, 8, 0, 0, 0, 9, 0, 0, 0, 10, 0, 0,
      0, 11, 0, 0, 0, 13, 0, 0, 0, 15, 0, 0, 0, 17, 0, 0, 0, 19, 0, 0, 0, 23, 0, 0, 0, 27, 0, 0, 0, 31, 0, 0, 0, 35, 0,
      0, 0, 43, 0, 0, 0, 51, 0, 0, 0, 59, 0, 0, 0, 67, 0, 0, 0, 83, 0, 0, 0, 99, 0, 0, 0, 115, 0, 0, 0, 131, 0, 0, 0,
      163, 0, 0, 0, 195, 0, 0, 0, 227, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0, 5, 0,
      0, 0, 5, 0, 0, 0, 6, 0, 0, 0, 6, 0, 0, 0, 7, 0, 0, 0, 7, 0, 0, 0, 8, 0, 0, 0, 8, 0, 0, 0, 9, 0, 0, 0, 9, 0, 0, 0,
      10, 0, 0, 0, 10, 0, 0, 0, 11, 0, 0, 0, 11, 0, 0, 0, 12, 0, 0, 0, 12, 0, 0, 0, 13, 0, 0, 0, 13, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0, 5, 0, 0, 0, 7, 0, 0, 0, 9, 0, 0, 0, 13, 0, 0, 0,
      17, 0, 0, 0, 25, 0, 0, 0, 33, 0, 0, 0, 49, 0, 0, 0, 65, 0, 0, 0, 97, 0, 0, 0, 129, 0, 0, 0, 193, 0, 0, 0, 1, 1, 0,
      0, 129, 1, 0, 0, 1, 2, 0, 0, 1, 3, 0, 0, 1, 4, 0, 0, 1, 6, 0, 0, 1, 8, 0, 0, 1, 12, 0, 0, 1, 16, 0, 0, 1, 24, 0,
      0, 1, 32, 0, 0, 1, 48, 0, 0, 1, 64, 0, 0, 1, 96, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 232, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 68, 3, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 20, 17, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 68, 3, 0, 0, 114, 98, 0, 32, 37, 100, 46, 10,
      0, 123, 32, 118, 97, 114, 32, 100, 97, 116, 97, 32, 61, 32, 110, 101, 119, 32, 85, 105, 110, 116, 56, 65, 114,
      114, 97, 121, 40, 36, 49, 41, 59, 32, 102, 111, 114, 40, 118, 97, 114, 32, 105, 61, 48, 59, 105, 60, 36, 49, 59,
      105, 43, 43, 41, 32, 123, 32, 100, 97, 116, 97, 91, 105, 93, 32, 61, 32, 103, 101, 116, 86, 97, 108, 117, 101, 40,
      36, 50, 43, 105, 41, 59, 32, 125, 32, 112, 111, 115, 116, 77, 101, 115, 115, 97, 103, 101, 40, 123, 34, 116, 34,
      58, 50, 44, 32, 34, 102, 105, 108, 101, 34, 58, 80, 111, 105, 110, 116, 101, 114, 95, 115, 116, 114, 105, 110,
      103, 105, 102, 121, 40, 36, 48, 41, 44, 32, 34, 115, 105, 122, 101, 34, 58, 36, 49, 44, 32, 34, 100, 97, 116, 97,
      34, 58, 100, 97, 116, 97, 125, 41, 59, 32, 100, 97, 116, 97, 32, 61, 32, 110, 117, 108, 108, 59, 32, 125, 0, 123,
      32, 112, 111, 115, 116, 77, 101, 115, 115, 97, 103, 101, 40, 123, 34, 116, 34, 58, 49, 125, 41, 59, 32, 125, 0,
      70, 105, 108, 101, 32, 67, 82, 67, 32, 100, 105, 102, 102, 101, 114, 115, 32, 102, 114, 111, 109, 32, 90, 73, 80,
      32, 67, 82, 67, 46, 32, 70, 105, 108, 101, 58, 32, 48, 120, 37, 120, 44, 32, 90, 73, 80, 58, 32, 48, 120, 37, 120,
      46, 10, 0, 67, 111, 117, 108, 100, 110, 39, 116, 32, 97, 108, 108, 111, 99, 97, 116, 101, 32, 109, 101, 109, 111,
      114, 121, 46, 0, 68, 105, 100, 110, 39, 116, 32, 114, 101, 97, 100, 32, 119, 104, 111, 108, 101, 32, 102, 105,
      108, 101, 46, 0, 123, 32, 112, 111, 115, 116, 77, 101, 115, 115, 97, 103, 101, 40, 123, 34, 116, 34, 58, 52, 44,
      32, 34, 99, 117, 114, 114, 101, 110, 116, 34, 58, 36, 48, 44, 32, 34, 116, 111, 116, 97, 108, 34, 58, 36, 49, 125,
      41, 32, 125, 0, 5, 5, 4, 0, 16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15, 2, 3, 7, 0, 3, 3,
      11, 0, 17, 0, 10, 0, 17, 17, 17, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 17,
      0, 15, 10, 17, 17, 17, 3, 10, 7, 0, 1, 19, 9, 11, 11, 0, 0, 9, 6, 11, 0, 0, 11, 0, 6, 17, 0, 0, 0, 17, 17, 17, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 10, 10, 17, 17, 17, 0, 10, 0, 0,
      2, 0, 9, 11, 0, 0, 0, 9, 0, 11, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 12, 0, 0, 0, 0, 9, 12, 0, 0, 0, 0, 0, 12, 0, 0, 12, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 0,
      0, 0, 4, 13, 0, 0, 0, 0, 9, 14, 0, 0, 0, 0, 0, 14, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 15, 0, 0, 0, 0, 9, 16, 0, 0, 0, 0, 0,
      16, 0, 0, 16, 0, 0, 18, 0, 0, 0, 18, 18, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 18, 0, 0, 0, 18, 18, 18, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 10, 0, 0, 0, 0, 9,
      11, 0, 0, 0, 0, 0, 11, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 12, 0, 0, 0, 0, 9, 12, 0, 0, 0, 0, 0, 12, 0, 0, 12, 0, 0, 45, 43,
      32, 32, 32, 48, 88, 48, 120, 0, 40, 110, 117, 108, 108, 41, 0, 45, 48, 88, 43, 48, 88, 32, 48, 88, 45, 48, 120,
      43, 48, 120, 32, 48, 120, 0, 105, 110, 102, 0, 73, 78, 70, 0, 110, 97, 110, 0, 78, 65, 78, 0, 48, 49, 50, 51, 52,
      53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70, 46, 0, 84, 33, 34, 25, 13, 1, 2, 3, 17, 75, 28, 12, 16, 4, 11, 29, 18,
      30, 39, 104, 110, 111, 112, 113, 98, 32, 5, 6, 15, 19, 20, 21, 26, 8, 22, 7, 40, 36, 23, 24, 9, 10, 14, 27, 31,
      37, 35, 131, 130, 125, 38, 42, 43, 60, 61, 62, 63, 67, 71, 74, 77, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 99,
      100, 101, 102, 103, 105, 106, 107, 108, 114, 115, 116, 121, 122, 123, 124, 0, 73, 108, 108, 101, 103, 97, 108, 32,
      98, 121, 116, 101, 32, 115, 101, 113, 117, 101, 110, 99, 101, 0, 68, 111, 109, 97, 105, 110, 32, 101, 114, 114,
      111, 114, 0, 82, 101, 115, 117, 108, 116, 32, 110, 111, 116, 32, 114, 101, 112, 114, 101, 115, 101, 110, 116, 97,
      98, 108, 101, 0, 78, 111, 116, 32, 97, 32, 116, 116, 121, 0, 80, 101, 114, 109, 105, 115, 115, 105, 111, 110, 32,
      100, 101, 110, 105, 101, 100, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 110, 111, 116, 32, 112, 101, 114,
      109, 105, 116, 116, 101, 100, 0, 78, 111, 32, 115, 117, 99, 104, 32, 102, 105, 108, 101, 32, 111, 114, 32, 100,
      105, 114, 101, 99, 116, 111, 114, 121, 0, 78, 111, 32, 115, 117, 99, 104, 32, 112, 114, 111, 99, 101, 115, 115, 0,
      70, 105, 108, 101, 32, 101, 120, 105, 115, 116, 115, 0, 86, 97, 108, 117, 101, 32, 116, 111, 111, 32, 108, 97,
      114, 103, 101, 32, 102, 111, 114, 32, 100, 97, 116, 97, 32, 116, 121, 112, 101, 0, 78, 111, 32, 115, 112, 97, 99,
      101, 32, 108, 101, 102, 116, 32, 111, 110, 32, 100, 101, 118, 105, 99, 101, 0, 79, 117, 116, 32, 111, 102, 32,
      109, 101, 109, 111, 114, 121, 0, 82, 101, 115, 111, 117, 114, 99, 101, 32, 98, 117, 115, 121, 0, 73, 110, 116,
      101, 114, 114, 117, 112, 116, 101, 100, 32, 115, 121, 115, 116, 101, 109, 32, 99, 97, 108, 108, 0, 82, 101, 115,
      111, 117, 114, 99, 101, 32, 116, 101, 109, 112, 111, 114, 97, 114, 105, 108, 121, 32, 117, 110, 97, 118, 97, 105,
      108, 97, 98, 108, 101, 0, 73, 110, 118, 97, 108, 105, 100, 32, 115, 101, 101, 107, 0, 67, 114, 111, 115, 115, 45,
      100, 101, 118, 105, 99, 101, 32, 108, 105, 110, 107, 0, 82, 101, 97, 100, 45, 111, 110, 108, 121, 32, 102, 105,
      108, 101, 32, 115, 121, 115, 116, 101, 109, 0, 68, 105, 114, 101, 99, 116, 111, 114, 121, 32, 110, 111, 116, 32,
      101, 109, 112, 116, 121, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 114, 101, 115, 101, 116, 32, 98,
      121, 32, 112, 101, 101, 114, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 116, 105, 109, 101, 100, 32, 111,
      117, 116, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 114, 101, 102, 117, 115, 101, 100, 0, 72, 111,
      115, 116, 32, 105, 115, 32, 100, 111, 119, 110, 0, 72, 111, 115, 116, 32, 105, 115, 32, 117, 110, 114, 101, 97,
      99, 104, 97, 98, 108, 101, 0, 65, 100, 100, 114, 101, 115, 115, 32, 105, 110, 32, 117, 115, 101, 0, 66, 114, 111,
      107, 101, 110, 32, 112, 105, 112, 101, 0, 73, 47, 79, 32, 101, 114, 114, 111, 114, 0, 78, 111, 32, 115, 117, 99,
      104, 32, 100, 101, 118, 105, 99, 101, 32, 111, 114, 32, 97, 100, 100, 114, 101, 115, 115, 0, 66, 108, 111, 99,
      107, 32, 100, 101, 118, 105, 99, 101, 32, 114, 101, 113, 117, 105, 114, 101, 100, 0, 78, 111, 32, 115, 117, 99,
      104, 32, 100, 101, 118, 105, 99, 101, 0, 78, 111, 116, 32, 97, 32, 100, 105, 114, 101, 99, 116, 111, 114, 121, 0,
      73, 115, 32, 97, 32, 100, 105, 114, 101, 99, 116, 111, 114, 121, 0, 84, 101, 120, 116, 32, 102, 105, 108, 101, 32,
      98, 117, 115, 121, 0, 69, 120, 101, 99, 32, 102, 111, 114, 109, 97, 116, 32, 101, 114, 114, 111, 114, 0, 73, 110,
      118, 97, 108, 105, 100, 32, 97, 114, 103, 117, 109, 101, 110, 116, 0, 65, 114, 103, 117, 109, 101, 110, 116, 32,
      108, 105, 115, 116, 32, 116, 111, 111, 32, 108, 111, 110, 103, 0, 83, 121, 109, 98, 111, 108, 105, 99, 32, 108,
      105, 110, 107, 32, 108, 111, 111, 112, 0, 70, 105, 108, 101, 110, 97, 109, 101, 32, 116, 111, 111, 32, 108, 111,
      110, 103, 0, 84, 111, 111, 32, 109, 97, 110, 121, 32, 111, 112, 101, 110, 32, 102, 105, 108, 101, 115, 32, 105,
      110, 32, 115, 121, 115, 116, 101, 109, 0, 78, 111, 32, 102, 105, 108, 101, 32, 100, 101, 115, 99, 114, 105, 112,
      116, 111, 114, 115, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 66, 97, 100, 32, 102, 105, 108, 101, 32, 100,
      101, 115, 99, 114, 105, 112, 116, 111, 114, 0, 78, 111, 32, 99, 104, 105, 108, 100, 32, 112, 114, 111, 99, 101,
      115, 115, 0, 66, 97, 100, 32, 97, 100, 100, 114, 101, 115, 115, 0, 70, 105, 108, 101, 32, 116, 111, 111, 32, 108,
      97, 114, 103, 101, 0, 84, 111, 111, 32, 109, 97, 110, 121, 32, 108, 105, 110, 107, 115, 0, 78, 111, 32, 108, 111,
      99, 107, 115, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 82, 101, 115, 111, 117, 114, 99, 101, 32, 100, 101,
      97, 100, 108, 111, 99, 107, 32, 119, 111, 117, 108, 100, 32, 111, 99, 99, 117, 114, 0, 83, 116, 97, 116, 101, 32,
      110, 111, 116, 32, 114, 101, 99, 111, 118, 101, 114, 97, 98, 108, 101, 0, 80, 114, 101, 118, 105, 111, 117, 115,
      32, 111, 119, 110, 101, 114, 32, 100, 105, 101, 100, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 99, 97,
      110, 99, 101, 108, 101, 100, 0, 70, 117, 110, 99, 116, 105, 111, 110, 32, 110, 111, 116, 32, 105, 109, 112, 108,
      101, 109, 101, 110, 116, 101, 100, 0, 78, 111, 32, 109, 101, 115, 115, 97, 103, 101, 32, 111, 102, 32, 100, 101,
      115, 105, 114, 101, 100, 32, 116, 121, 112, 101, 0, 73, 100, 101, 110, 116, 105, 102, 105, 101, 114, 32, 114, 101,
      109, 111, 118, 101, 100, 0, 68, 101, 118, 105, 99, 101, 32, 110, 111, 116, 32, 97, 32, 115, 116, 114, 101, 97,
      109, 0, 78, 111, 32, 100, 97, 116, 97, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 68, 101, 118, 105, 99, 101,
      32, 116, 105, 109, 101, 111, 117, 116, 0, 79, 117, 116, 32, 111, 102, 32, 115, 116, 114, 101, 97, 109, 115, 32,
      114, 101, 115, 111, 117, 114, 99, 101, 115, 0, 76, 105, 110, 107, 32, 104, 97, 115, 32, 98, 101, 101, 110, 32,
      115, 101, 118, 101, 114, 101, 100, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 101, 114, 114, 111, 114, 0, 66,
      97, 100, 32, 109, 101, 115, 115, 97, 103, 101, 0, 70, 105, 108, 101, 32, 100, 101, 115, 99, 114, 105, 112, 116,
      111, 114, 32, 105, 110, 32, 98, 97, 100, 32, 115, 116, 97, 116, 101, 0, 78, 111, 116, 32, 97, 32, 115, 111, 99,
      107, 101, 116, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 97, 100, 100, 114, 101, 115, 115, 32,
      114, 101, 113, 117, 105, 114, 101, 100, 0, 77, 101, 115, 115, 97, 103, 101, 32, 116, 111, 111, 32, 108, 97, 114,
      103, 101, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 119, 114, 111, 110, 103, 32, 116, 121, 112, 101, 32, 102,
      111, 114, 32, 115, 111, 99, 107, 101, 116, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 110, 111, 116, 32, 97,
      118, 97, 105, 108, 97, 98, 108, 101, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 110, 111, 116, 32, 115, 117,
      112, 112, 111, 114, 116, 101, 100, 0, 83, 111, 99, 107, 101, 116, 32, 116, 121, 112, 101, 32, 110, 111, 116, 32,
      115, 117, 112, 112, 111, 114, 116, 101, 100, 0, 78, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 0,
      80, 114, 111, 116, 111, 99, 111, 108, 32, 102, 97, 109, 105, 108, 121, 32, 110, 111, 116, 32, 115, 117, 112, 112,
      111, 114, 116, 101, 100, 0, 65, 100, 100, 114, 101, 115, 115, 32, 102, 97, 109, 105, 108, 121, 32, 110, 111, 116,
      32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 32, 98, 121, 32, 112, 114, 111, 116, 111, 99, 111, 108, 0, 65,
      100, 100, 114, 101, 115, 115, 32, 110, 111, 116, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 78, 101, 116,
      119, 111, 114, 107, 32, 105, 115, 32, 100, 111, 119, 110, 0, 78, 101, 116, 119, 111, 114, 107, 32, 117, 110, 114,
      101, 97, 99, 104, 97, 98, 108, 101, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 114, 101, 115, 101,
      116, 32, 98, 121, 32, 110, 101, 116, 119, 111, 114, 107, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32,
      97, 98, 111, 114, 116, 101, 100, 0, 78, 111, 32, 98, 117, 102, 102, 101, 114, 32, 115, 112, 97, 99, 101, 32, 97,
      118, 97, 105, 108, 97, 98, 108, 101, 0, 83, 111, 99, 107, 101, 116, 32, 105, 115, 32, 99, 111, 110, 110, 101, 99,
      116, 101, 100, 0, 83, 111, 99, 107, 101, 116, 32, 110, 111, 116, 32, 99, 111, 110, 110, 101, 99, 116, 101, 100, 0,
      67, 97, 110, 110, 111, 116, 32, 115, 101, 110, 100, 32, 97, 102, 116, 101, 114, 32, 115, 111, 99, 107, 101, 116,
      32, 115, 104, 117, 116, 100, 111, 119, 110, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 97, 108, 114, 101,
      97, 100, 121, 32, 105, 110, 32, 112, 114, 111, 103, 114, 101, 115, 115, 0, 79, 112, 101, 114, 97, 116, 105, 111,
      110, 32, 105, 110, 32, 112, 114, 111, 103, 114, 101, 115, 115, 0, 83, 116, 97, 108, 101, 32, 102, 105, 108, 101,
      32, 104, 97, 110, 100, 108, 101, 0, 82, 101, 109, 111, 116, 101, 32, 73, 47, 79, 32, 101, 114, 114, 111, 114, 0,
      81, 117, 111, 116, 97, 32, 101, 120, 99, 101, 101, 100, 101, 100, 0, 78, 111, 32, 109, 101, 100, 105, 117, 109,
      32, 102, 111, 117, 110, 100, 0, 87, 114, 111, 110, 103, 32, 109, 101, 100, 105, 117, 109, 32, 116, 121, 112, 101,
      0, 78, 111, 32, 101, 114, 114, 111, 114, 32, 105, 110, 102, 111, 114, 109, 97, 116, 105, 111, 110, 0, 0, 114, 119,
      97, 0,
    ],
    'i8',
    ALLOC_NONE,
    Runtime.GLOBAL_BASE
  )
var tempDoublePtr = STATICTOP
;(STATICTOP += 16), assert(tempDoublePtr % 8 == 0)
var ERRNO_CODES = {
    EPERM: 1,
    ENOENT: 2,
    ESRCH: 3,
    EINTR: 4,
    EIO: 5,
    ENXIO: 6,
    E2BIG: 7,
    ENOEXEC: 8,
    EBADF: 9,
    ECHILD: 10,
    EAGAIN: 11,
    EWOULDBLOCK: 11,
    ENOMEM: 12,
    EACCES: 13,
    EFAULT: 14,
    ENOTBLK: 15,
    EBUSY: 16,
    EEXIST: 17,
    EXDEV: 18,
    ENODEV: 19,
    ENOTDIR: 20,
    EISDIR: 21,
    EINVAL: 22,
    ENFILE: 23,
    EMFILE: 24,
    ENOTTY: 25,
    ETXTBSY: 26,
    EFBIG: 27,
    ENOSPC: 28,
    ESPIPE: 29,
    EROFS: 30,
    EMLINK: 31,
    EPIPE: 32,
    EDOM: 33,
    ERANGE: 34,
    ENOMSG: 42,
    EIDRM: 43,
    ECHRNG: 44,
    EL2NSYNC: 45,
    EL3HLT: 46,
    EL3RST: 47,
    ELNRNG: 48,
    EUNATCH: 49,
    ENOCSI: 50,
    EL2HLT: 51,
    EDEADLK: 35,
    ENOLCK: 37,
    EBADE: 52,
    EBADR: 53,
    EXFULL: 54,
    ENOANO: 55,
    EBADRQC: 56,
    EBADSLT: 57,
    EDEADLOCK: 35,
    EBFONT: 59,
    ENOSTR: 60,
    ENODATA: 61,
    ETIME: 62,
    ENOSR: 63,
    ENONET: 64,
    ENOPKG: 65,
    EREMOTE: 66,
    ENOLINK: 67,
    EADV: 68,
    ESRMNT: 69,
    ECOMM: 70,
    EPROTO: 71,
    EMULTIHOP: 72,
    EDOTDOT: 73,
    EBADMSG: 74,
    ENOTUNIQ: 76,
    EBADFD: 77,
    EREMCHG: 78,
    ELIBACC: 79,
    ELIBBAD: 80,
    ELIBSCN: 81,
    ELIBMAX: 82,
    ELIBEXEC: 83,
    ENOSYS: 38,
    ENOTEMPTY: 39,
    ENAMETOOLONG: 36,
    ELOOP: 40,
    EOPNOTSUPP: 95,
    EPFNOSUPPORT: 96,
    ECONNRESET: 104,
    ENOBUFS: 105,
    EAFNOSUPPORT: 97,
    EPROTOTYPE: 91,
    ENOTSOCK: 88,
    ENOPROTOOPT: 92,
    ESHUTDOWN: 108,
    ECONNREFUSED: 111,
    EADDRINUSE: 98,
    ECONNABORTED: 103,
    ENETUNREACH: 101,
    ENETDOWN: 100,
    ETIMEDOUT: 110,
    EHOSTDOWN: 112,
    EHOSTUNREACH: 113,
    EINPROGRESS: 115,
    EALREADY: 114,
    EDESTADDRREQ: 89,
    EMSGSIZE: 90,
    EPROTONOSUPPORT: 93,
    ESOCKTNOSUPPORT: 94,
    EADDRNOTAVAIL: 99,
    ENETRESET: 102,
    EISCONN: 106,
    ENOTCONN: 107,
    ETOOMANYREFS: 109,
    EUSERS: 87,
    EDQUOT: 122,
    ESTALE: 116,
    ENOTSUP: 95,
    ENOMEDIUM: 123,
    EILSEQ: 84,
    EOVERFLOW: 75,
    ECANCELED: 125,
    ENOTRECOVERABLE: 131,
    EOWNERDEAD: 130,
    ESTRPIPE: 86,
  },
  ERRNO_MESSAGES = {
    0: 'Success',
    1: 'Not super-user',
    2: 'No such file or directory',
    3: 'No such process',
    4: 'Interrupted system call',
    5: 'I/O error',
    6: 'No such device or address',
    7: 'Arg list too long',
    8: 'Exec format error',
    9: 'Bad file number',
    10: 'No children',
    11: 'No more processes',
    12: 'Not enough core',
    13: 'Permission denied',
    14: 'Bad address',
    15: 'Block device required',
    16: 'Mount device busy',
    17: 'File exists',
    18: 'Cross-device link',
    19: 'No such device',
    20: 'Not a directory',
    21: 'Is a directory',
    22: 'Invalid argument',
    23: 'Too many open files in system',
    24: 'Too many open files',
    25: 'Not a typewriter',
    26: 'Text file busy',
    27: 'File too large',
    28: 'No space left on device',
    29: 'Illegal seek',
    30: 'Read only file system',
    31: 'Too many links',
    32: 'Broken pipe',
    33: 'Math arg out of domain of func',
    34: 'Math result not representable',
    35: 'File locking deadlock error',
    36: 'File or path name too long',
    37: 'No record locks available',
    38: 'Function not implemented',
    39: 'Directory not empty',
    40: 'Too many symbolic links',
    42: 'No message of desired type',
    43: 'Identifier removed',
    44: 'Channel number out of range',
    45: 'Level 2 not synchronized',
    46: 'Level 3 halted',
    47: 'Level 3 reset',
    48: 'Link number out of range',
    49: 'Protocol driver not attached',
    50: 'No CSI structure available',
    51: 'Level 2 halted',
    52: 'Invalid exchange',
    53: 'Invalid request descriptor',
    54: 'Exchange full',
    55: 'No anode',
    56: 'Invalid request code',
    57: 'Invalid slot',
    59: 'Bad font file fmt',
    60: 'Device not a stream',
    61: 'No data (for no delay io)',
    62: 'Timer expired',
    63: 'Out of streams resources',
    64: 'Machine is not on the network',
    65: 'Package not installed',
    66: 'The object is remote',
    67: 'The link has been severed',
    68: 'Advertise error',
    69: 'Srmount error',
    70: 'Communication error on send',
    71: 'Protocol error',
    72: 'Multihop attempted',
    73: 'Cross mount point (not really error)',
    74: 'Trying to read unreadable message',
    75: 'Value too large for defined data type',
    76: 'Given log. name not unique',
    77: 'f.d. invalid for this operation',
    78: 'Remote address changed',
    79: 'Can   access a needed shared lib',
    80: 'Accessing a corrupted shared lib',
    81: '.lib section in a.out corrupted',
    82: 'Attempting to link in too many libs',
    83: 'Attempting to exec a shared library',
    84: 'Illegal byte sequence',
    86: 'Streams pipe error',
    87: 'Too many users',
    88: 'Socket operation on non-socket',
    89: 'Destination address required',
    90: 'Message too long',
    91: 'Protocol wrong type for socket',
    92: 'Protocol not available',
    93: 'Unknown protocol',
    94: 'Socket type not supported',
    95: 'Not supported',
    96: 'Protocol family not supported',
    97: 'Address family not supported by protocol family',
    98: 'Address already in use',
    99: 'Address not available',
    100: 'Network interface is not configured',
    101: 'Network is unreachable',
    102: 'Connection reset by network',
    103: 'Connection aborted',
    104: 'Connection reset by peer',
    105: 'No buffer space available',
    106: 'Socket is already connected',
    107: 'Socket is not connected',
    108: "Can't send after socket shutdown",
    109: 'Too many references',
    110: 'Connection timed out',
    111: 'Connection refused',
    112: 'Host is down',
    113: 'Host is unreachable',
    114: 'Socket already connected',
    115: 'Connection already in progress',
    116: 'Stale file handle',
    122: 'Quota exceeded',
    123: 'No medium (in tape drive)',
    125: 'Operation canceled',
    130: 'Previous owner died',
    131: 'State not recoverable',
  }
function ___setErrNo(e) {
  return (
    Module.___errno_location
      ? (HEAP32[Module.___errno_location() >> 2] = e)
      : Module.printErr('failed to set errno from JS'),
    e
  )
}
var PATH = {
    splitPath: function (e) {
      return /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(e).slice(1)
    },
    normalizeArray: function (e, r) {
      for (var t = 0, n = e.length - 1; 0 <= n; n--) {
        var o = e[n]
        '.' === o ? e.splice(n, 1) : '..' === o ? (e.splice(n, 1), t++) : t && (e.splice(n, 1), t--)
      }
      if (r) for (; t; t--) e.unshift('..')
      return e
    },
    normalize: function (e) {
      var r = '/' === e.charAt(0),
        t = '/' === e.substr(-1)
      return (
        (e = PATH.normalizeArray(
          e.split('/').filter(function (e) {
            return !!e
          }),
          !r
        ).join('/')) ||
          r ||
          (e = '.'),
        e && t && (e += '/'),
        (r ? '/' : '') + e
      )
    },
    dirname: function (e) {
      var r = PATH.splitPath(e),
        e = r[0],
        r = r[1]
      return e || r ? e + (r = r && r.substr(0, r.length - 1)) : '.'
    },
    basename: function (e) {
      if ('/' === e) return '/'
      var r = e.lastIndexOf('/')
      return -1 === r ? e : e.substr(r + 1)
    },
    extname: function (e) {
      return PATH.splitPath(e)[3]
    },
    join: function () {
      var e = Array.prototype.slice.call(arguments, 0)
      return PATH.normalize(e.join('/'))
    },
    join2: function (e, r) {
      return PATH.normalize(e + '/' + r)
    },
    resolve: function () {
      for (var e = '', r = !1, t = arguments.length - 1; -1 <= t && !r; t--) {
        var n = 0 <= t ? arguments[t] : FS.cwd()
        if ('string' != typeof n) throw new TypeError('Arguments to path.resolve must be strings')
        if (!n) return ''
        ;(e = n + '/' + e), (r = '/' === n.charAt(0))
      }
      return (
        (r ? '/' : '') +
          (e = PATH.normalizeArray(
            e.split('/').filter(function (e) {
              return !!e
            }),
            !r
          ).join('/')) || '.'
      )
    },
    relative: function (e, r) {
      function t(e) {
        for (var r = 0; r < e.length && '' === e[r]; r++);
        for (var t = e.length - 1; 0 <= t && '' === e[t]; t--);
        return t < r ? [] : e.slice(r, t - r + 1)
      }
      ;(e = PATH.resolve(e).substr(1)), (r = PATH.resolve(r).substr(1))
      for (var n = t(e.split('/')), o = t(r.split('/')), i = Math.min(n.length, o.length), a = i, s = 0; s < i; s++)
        if (n[s] !== o[s]) {
          a = s
          break
        }
      for (var u = [], s = a; s < n.length; s++) u.push('..')
      return (u = u.concat(o.slice(a))).join('/')
    },
  },
  TTY = {
    ttys: [],
    init: function () {},
    shutdown: function () {},
    register: function (e, r) {
      ;(TTY.ttys[e] = { input: [], output: [], ops: r }), FS.registerDevice(e, TTY.stream_ops)
    },
    stream_ops: {
      open: function (e) {
        var r = TTY.ttys[e.node.rdev]
        if (!r) throw new FS.ErrnoError(ERRNO_CODES.ENODEV)
        ;(e.tty = r), (e.seekable = !1)
      },
      close: function (e) {
        e.tty.ops.flush(e.tty)
      },
      flush: function (e) {
        e.tty.ops.flush(e.tty)
      },
      read: function (e, r, t, n, o) {
        if (!e.tty || !e.tty.ops.get_char) throw new FS.ErrnoError(ERRNO_CODES.ENXIO)
        for (var i, a = 0, s = 0; s < n; s++) {
          try {
            i = e.tty.ops.get_char(e.tty)
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO)
          }
          if (void 0 === i && 0 === a) throw new FS.ErrnoError(ERRNO_CODES.EAGAIN)
          if (null == i) break
          a++, (r[t + s] = i)
        }
        return a && (e.node.timestamp = Date.now()), a
      },
      write: function (e, r, t, n, o) {
        if (!e.tty || !e.tty.ops.put_char) throw new FS.ErrnoError(ERRNO_CODES.ENXIO)
        for (var i = 0; i < n; i++)
          try {
            e.tty.ops.put_char(e.tty, r[t + i])
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO)
          }
        return n && (e.node.timestamp = Date.now()), i
      },
    },
    default_tty_ops: {
      get_char: function (e) {
        if (!e.input.length) {
          var r = null
          if (ENVIRONMENT_IS_NODE) {
            var t = new Buffer(256),
              n = 0,
              o = 'win32' != process.platform,
              i = process.stdin.fd
            if (o) {
              var a = !1
              try {
                ;(i = fs.openSync('/dev/stdin', 'r')), (a = !0)
              } catch (e) {}
            }
            try {
              n = fs.readSync(i, t, 0, 256, null)
            } catch (e) {
              if (-1 == e.toString().indexOf('EOF')) throw e
              n = 0
            }
            a && fs.closeSync(i), (r = 0 < n ? t.slice(0, n).toString('utf-8') : null)
          } else
            'undefined' != typeof window && 'function' == typeof window.prompt
              ? null !== (r = window.prompt('Input: ')) && (r += '\n')
              : 'function' == typeof readline && null !== (r = readline()) && (r += '\n')
          if (!r) return null
          e.input = intArrayFromString(r, !0)
        }
        return e.input.shift()
      },
      put_char: function (e, r) {
        null === r || 10 === r
          ? (Module.print(UTF8ArrayToString(e.output, 0)), (e.output = []))
          : 0 != r && e.output.push(r)
      },
      flush: function (e) {
        e.output && 0 < e.output.length && (Module.print(UTF8ArrayToString(e.output, 0)), (e.output = []))
      },
    },
    default_tty1_ops: {
      put_char: function (e, r) {
        null === r || 10 === r
          ? (Module.printErr(UTF8ArrayToString(e.output, 0)), (e.output = []))
          : 0 != r && e.output.push(r)
      },
      flush: function (e) {
        e.output && 0 < e.output.length && (Module.printErr(UTF8ArrayToString(e.output, 0)), (e.output = []))
      },
    },
  },
  MEMFS = {
    ops_table: null,
    mount: function (e) {
      return MEMFS.createNode(null, '/', 16895, 0)
    },
    createNode: function (e, r, t, n) {
      if (FS.isBlkdev(t) || FS.isFIFO(t)) throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      MEMFS.ops_table ||
        (MEMFS.ops_table = {
          dir: {
            node: {
              getattr: MEMFS.node_ops.getattr,
              setattr: MEMFS.node_ops.setattr,
              lookup: MEMFS.node_ops.lookup,
              mknod: MEMFS.node_ops.mknod,
              rename: MEMFS.node_ops.rename,
              unlink: MEMFS.node_ops.unlink,
              rmdir: MEMFS.node_ops.rmdir,
              readdir: MEMFS.node_ops.readdir,
              symlink: MEMFS.node_ops.symlink,
            },
            stream: { llseek: MEMFS.stream_ops.llseek },
          },
          file: {
            node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr },
            stream: {
              llseek: MEMFS.stream_ops.llseek,
              read: MEMFS.stream_ops.read,
              write: MEMFS.stream_ops.write,
              allocate: MEMFS.stream_ops.allocate,
              mmap: MEMFS.stream_ops.mmap,
              msync: MEMFS.stream_ops.msync,
            },
          },
          link: {
            node: {
              getattr: MEMFS.node_ops.getattr,
              setattr: MEMFS.node_ops.setattr,
              readlink: MEMFS.node_ops.readlink,
            },
            stream: {},
          },
          chrdev: {
            node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr },
            stream: FS.chrdev_stream_ops,
          },
        })
      n = FS.createNode(e, r, t, n)
      return (
        FS.isDir(n.mode)
          ? ((n.node_ops = MEMFS.ops_table.dir.node), (n.stream_ops = MEMFS.ops_table.dir.stream), (n.contents = {}))
          : FS.isFile(n.mode)
            ? ((n.node_ops = MEMFS.ops_table.file.node),
              (n.stream_ops = MEMFS.ops_table.file.stream),
              (n.usedBytes = 0),
              (n.contents = null))
            : FS.isLink(n.mode)
              ? ((n.node_ops = MEMFS.ops_table.link.node), (n.stream_ops = MEMFS.ops_table.link.stream))
              : FS.isChrdev(n.mode) &&
                ((n.node_ops = MEMFS.ops_table.chrdev.node), (n.stream_ops = MEMFS.ops_table.chrdev.stream)),
        (n.timestamp = Date.now()),
        e && (e.contents[r] = n),
        n
      )
    },
    getFileDataAsRegularArray: function (e) {
      if (e.contents && e.contents.subarray) {
        for (var r = [], t = 0; t < e.usedBytes; ++t) r.push(e.contents[t])
        return r
      }
      return e.contents
    },
    getFileDataAsTypedArray: function (e) {
      return e.contents
        ? e.contents.subarray
          ? e.contents.subarray(0, e.usedBytes)
          : new Uint8Array(e.contents)
        : new Uint8Array()
    },
    expandFileStorage: function (e, r) {
      if (
        (e.contents &&
          e.contents.subarray &&
          r > e.contents.length &&
          ((e.contents = MEMFS.getFileDataAsRegularArray(e)), (e.usedBytes = e.contents.length)),
        !e.contents || e.contents.subarray)
      ) {
        var t = e.contents ? e.contents.length : 0
        if (r <= t) return
        ;(r = Math.max(r, (t * (t < 1048576 ? 2 : 1.125)) | 0)), 0 != t && (r = Math.max(r, 256))
        t = e.contents
        return (e.contents = new Uint8Array(r)), void (0 < e.usedBytes && e.contents.set(t.subarray(0, e.usedBytes), 0))
      }
      for (!e.contents && 0 < r && (e.contents = []); e.contents.length < r; ) e.contents.push(0)
    },
    resizeFileStorage: function (e, r) {
      if (e.usedBytes != r) {
        if (0 == r) return (e.contents = null), void (e.usedBytes = 0)
        if (!e.contents || e.contents.subarray) {
          var t = e.contents
          return (
            (e.contents = new Uint8Array(new ArrayBuffer(r))),
            t && e.contents.set(t.subarray(0, Math.min(r, e.usedBytes))),
            void (e.usedBytes = r)
          )
        }
        if ((e.contents || (e.contents = []), e.contents.length > r)) e.contents.length = r
        else for (; e.contents.length < r; ) e.contents.push(0)
        e.usedBytes = r
      }
    },
    node_ops: {
      getattr: function (e) {
        var r = {}
        return (
          (r.dev = FS.isChrdev(e.mode) ? e.id : 1),
          (r.ino = e.id),
          (r.mode = e.mode),
          (r.nlink = 1),
          (r.uid = 0),
          (r.gid = 0),
          (r.rdev = e.rdev),
          FS.isDir(e.mode)
            ? (r.size = 4096)
            : FS.isFile(e.mode)
              ? (r.size = e.usedBytes)
              : FS.isLink(e.mode)
                ? (r.size = e.link.length)
                : (r.size = 0),
          (r.atime = new Date(e.timestamp)),
          (r.mtime = new Date(e.timestamp)),
          (r.ctime = new Date(e.timestamp)),
          (r.blksize = 4096),
          (r.blocks = Math.ceil(r.size / r.blksize)),
          r
        )
      },
      setattr: function (e, r) {
        void 0 !== r.mode && (e.mode = r.mode),
          void 0 !== r.timestamp && (e.timestamp = r.timestamp),
          void 0 !== r.size && MEMFS.resizeFileStorage(e, r.size)
      },
      lookup: function (e, r) {
        throw FS.genericErrors[ERRNO_CODES.ENOENT]
      },
      mknod: function (e, r, t, n) {
        return MEMFS.createNode(e, r, t, n)
      },
      rename: function (e, r, t) {
        if (FS.isDir(e.mode)) {
          var n
          try {
            n = FS.lookupNode(r, t)
          } catch (e) {}
          if (n) for (var o in n.contents) throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)
        }
        delete e.parent.contents[e.name], (e.name = t), ((r.contents[t] = e).parent = r)
      },
      unlink: function (e, r) {
        delete e.contents[r]
      },
      rmdir: function (e, r) {
        for (var t in FS.lookupNode(e, r).contents) throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)
        delete e.contents[r]
      },
      readdir: function (e) {
        var r,
          t = ['.', '..']
        for (r in e.contents) e.contents.hasOwnProperty(r) && t.push(r)
        return t
      },
      symlink: function (e, r, t) {
        r = MEMFS.createNode(e, r, 41471, 0)
        return (r.link = t), r
      },
      readlink: function (e) {
        if (!FS.isLink(e.mode)) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
        return e.link
      },
    },
    stream_ops: {
      read: function (e, r, t, n, o) {
        var i = e.node.contents
        if (o >= e.node.usedBytes) return 0
        var a = Math.min(e.node.usedBytes - o, n)
        if ((assert(0 <= a), 8 < a && i.subarray)) r.set(i.subarray(o, o + a), t)
        else for (var s = 0; s < a; s++) r[t + s] = i[o + s]
        return a
      },
      write: function (e, r, t, n, o, i) {
        if (!n) return 0
        var a = e.node
        if (((a.timestamp = Date.now()), r.subarray && (!a.contents || a.contents.subarray))) {
          if (i)
            return (
              assert(0 === o, 'canOwn must imply no weird position inside the file'),
              (a.contents = r.subarray(t, t + n)),
              (a.usedBytes = n)
            )
          if (0 === a.usedBytes && 0 === o)
            return (a.contents = new Uint8Array(r.subarray(t, t + n))), (a.usedBytes = n)
          if (o + n <= a.usedBytes) return a.contents.set(r.subarray(t, t + n), o), n
        }
        if ((MEMFS.expandFileStorage(a, o + n), a.contents.subarray && r.subarray))
          a.contents.set(r.subarray(t, t + n), o)
        else for (var s = 0; s < n; s++) a.contents[o + s] = r[t + s]
        return (a.usedBytes = Math.max(a.usedBytes, o + n)), n
      },
      llseek: function (e, r, t) {
        if ((1 === t ? (r += e.position) : 2 === t && FS.isFile(e.node.mode) && (r += e.node.usedBytes), r < 0))
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
        return r
      },
      allocate: function (e, r, t) {
        MEMFS.expandFileStorage(e.node, r + t), (e.node.usedBytes = Math.max(e.node.usedBytes, r + t))
      },
      mmap: function (e, r, t, n, o, i, a) {
        if (!FS.isFile(e.node.mode)) throw new FS.ErrnoError(ERRNO_CODES.ENODEV)
        var s,
          u,
          c = e.node.contents
        if (2 & a || (c.buffer !== r && c.buffer !== r.buffer)) {
          if (
            ((0 < o || o + n < e.node.usedBytes) &&
              (c = c.subarray ? c.subarray(o, o + n) : Array.prototype.slice.call(c, o, o + n)),
            (u = !0),
            !(s = _malloc(n)))
          )
            throw new FS.ErrnoError(ERRNO_CODES.ENOMEM)
          r.set(c, s)
        } else (u = !1), (s = c.byteOffset)
        return { ptr: s, allocated: u }
      },
      msync: function (e, r, t, n, o) {
        if (!FS.isFile(e.node.mode)) throw new FS.ErrnoError(ERRNO_CODES.ENODEV)
        if (2 & o) return 0
        MEMFS.stream_ops.write(e, r, 0, n, t, !1)
        return 0
      },
    },
  },
  IDBFS = {
    dbs: {},
    indexedDB: function () {
      if ('undefined' != typeof indexedDB) return indexedDB
      var e = null
      return (
        'object' == typeof window &&
          (e = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB),
        assert(e, 'IDBFS used, but indexedDB not supported'),
        e
      )
    },
    DB_VERSION: 21,
    DB_STORE_NAME: 'FILE_DATA',
    mount: function (e) {
      return MEMFS.mount.apply(null, arguments)
    },
    syncfs: function (r, n, o) {
      IDBFS.getLocalSet(r, function (e, t) {
        return e
          ? o(e)
          : void IDBFS.getRemoteSet(r, function (e, r) {
              if (e) return o(e)
              ;(e = n ? r : t), (r = n ? t : r)
              IDBFS.reconcile(e, r, o)
            })
      })
    },
    getDB: function (e, r) {
      var t,
        n = IDBFS.dbs[e]
      if (n) return r(null, n)
      try {
        t = IDBFS.indexedDB().open(e, IDBFS.DB_VERSION)
      } catch (e) {
        return r(e)
      }
      if (!t) return r('Unable to connect to IndexedDB')
      ;(t.onupgradeneeded = function (e) {
        var r = e.target.result,
          e = e.target.transaction,
          r = r.objectStoreNames.contains(IDBFS.DB_STORE_NAME)
            ? e.objectStore(IDBFS.DB_STORE_NAME)
            : r.createObjectStore(IDBFS.DB_STORE_NAME)
        r.indexNames.contains('timestamp') || r.createIndex('timestamp', 'timestamp', { unique: !1 })
      }),
        (t.onsuccess = function () {
          ;(n = t.result), (IDBFS.dbs[e] = n), r(null, n)
        }),
        (t.onerror = function (e) {
          r(this.error), e.preventDefault()
        })
    },
    getLocalSet: function (e, r) {
      var t = {}
      function n(e) {
        return '.' !== e && '..' !== e
      }
      function o(r) {
        return function (e) {
          return PATH.join2(r, e)
        }
      }
      for (var i = FS.readdir(e.mountpoint).filter(n).map(o(e.mountpoint)); i.length; ) {
        var a,
          s = i.pop()
        try {
          a = FS.stat(s)
        } catch (e) {
          return r(e)
        }
        FS.isDir(a.mode) && i.push.apply(i, FS.readdir(s).filter(n).map(o(s))), (t[s] = { timestamp: a.mtime })
      }
      return r(null, { type: 'local', entries: t })
    },
    getRemoteSet: function (e, t) {
      var n = {}
      IDBFS.getDB(e.mountpoint, function (e, r) {
        if (e) return t(e)
        e = r.transaction([IDBFS.DB_STORE_NAME], 'readonly')
        ;(e.onerror = function (e) {
          t(this.error), e.preventDefault()
        }),
          (e.objectStore(IDBFS.DB_STORE_NAME).index('timestamp').openKeyCursor().onsuccess = function (e) {
            e = e.target.result
            if (!e) return t(null, { type: 'remote', db: r, entries: n })
            ;(n[e.primaryKey] = { timestamp: e.key }), e.continue()
          })
      })
    },
    loadLocalEntry: function (e, r) {
      try {
        var t = FS.lookupPath(e).node,
          n = FS.stat(e)
      } catch (e) {
        return r(e)
      }
      return FS.isDir(n.mode)
        ? r(null, { timestamp: n.mtime, mode: n.mode })
        : FS.isFile(n.mode)
          ? ((t.contents = MEMFS.getFileDataAsTypedArray(t)),
            r(null, { timestamp: n.mtime, mode: n.mode, contents: t.contents }))
          : r(new Error('node type not supported'))
    },
    storeLocalEntry: function (e, r, t) {
      try {
        if (FS.isDir(r.mode)) FS.mkdir(e, r.mode)
        else {
          if (!FS.isFile(r.mode)) return t(new Error('node type not supported'))
          FS.writeFile(e, r.contents, { encoding: 'binary', canOwn: !0 })
        }
        FS.chmod(e, r.mode), FS.utime(e, r.timestamp, r.timestamp)
      } catch (e) {
        return t(e)
      }
      t(null)
    },
    removeLocalEntry: function (e, r) {
      try {
        FS.lookupPath(e)
        var t = FS.stat(e)
        FS.isDir(t.mode) ? FS.rmdir(e) : FS.isFile(t.mode) && FS.unlink(e)
      } catch (e) {
        return r(e)
      }
      r(null)
    },
    loadRemoteEntry: function (e, r, t) {
      r = e.get(r)
      ;(r.onsuccess = function (e) {
        t(null, e.target.result)
      }),
        (r.onerror = function (e) {
          t(this.error), e.preventDefault()
        })
    },
    storeRemoteEntry: function (e, r, t, n) {
      r = e.put(t, r)
      ;(r.onsuccess = function () {
        n(null)
      }),
        (r.onerror = function (e) {
          n(this.error), e.preventDefault()
        })
    },
    removeRemoteEntry: function (e, r, t) {
      r = e.delete(r)
      ;(r.onsuccess = function () {
        t(null)
      }),
        (r.onerror = function (e) {
          t(this.error), e.preventDefault()
        })
    },
    reconcile: function (n, o, r) {
      var i = 0,
        a = []
      Object.keys(n.entries).forEach(function (e) {
        var r = n.entries[e],
          t = o.entries[e]
        ;(!t || r.timestamp > t.timestamp) && (a.push(e), i++)
      })
      var t = []
      if (
        (Object.keys(o.entries).forEach(function (e) {
          o.entries[e]
          n.entries[e] || (t.push(e), i++)
        }),
        !i)
      )
        return r(null)
      var s = 0,
        e = ('remote' === n.type ? n : o).db.transaction([IDBFS.DB_STORE_NAME], 'readwrite'),
        u = e.objectStore(IDBFS.DB_STORE_NAME)
      function c(e) {
        return e ? (c.errored ? void 0 : ((c.errored = !0), r(e))) : ++s >= i ? r(null) : void 0
      }
      ;(e.onerror = function (e) {
        c(this.error), e.preventDefault()
      }),
        a.sort().forEach(function (t) {
          'local' === o.type
            ? IDBFS.loadRemoteEntry(u, t, function (e, r) {
                return e ? c(e) : void IDBFS.storeLocalEntry(t, r, c)
              })
            : IDBFS.loadLocalEntry(t, function (e, r) {
                return e ? c(e) : void IDBFS.storeRemoteEntry(u, t, r, c)
              })
        }),
        t
          .sort()
          .reverse()
          .forEach(function (e) {
            'local' === o.type ? IDBFS.removeLocalEntry(e, c) : IDBFS.removeRemoteEntry(u, e, c)
          })
    },
  },
  NODEFS = {
    isWindows: !1,
    staticInit: function () {
      NODEFS.isWindows = !!process.platform.match(/^win/)
    },
    mount: function (e) {
      return assert(ENVIRONMENT_IS_NODE), NODEFS.createNode(null, '/', NODEFS.getMode(e.opts.root), 0)
    },
    createNode: function (e, r, t, n) {
      if (!FS.isDir(t) && !FS.isFile(t) && !FS.isLink(t)) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
      t = FS.createNode(e, r, t)
      return (t.node_ops = NODEFS.node_ops), (t.stream_ops = NODEFS.stream_ops), t
    },
    getMode: function (e) {
      var r
      try {
        ;(r = fs.lstatSync(e)), NODEFS.isWindows && (r.mode = r.mode | ((146 & r.mode) >> 1))
      } catch (e) {
        if (!e.code) throw e
        throw new FS.ErrnoError(ERRNO_CODES[e.code])
      }
      return r.mode
    },
    realPath: function (e) {
      for (var r = []; e.parent !== e; ) r.push(e.name), (e = e.parent)
      return r.push(e.mount.opts.root), r.reverse(), PATH.join.apply(null, r)
    },
    flagsToPermissionStringMap: {
      0: 'r',
      1: 'r+',
      2: 'r+',
      64: 'r',
      65: 'r+',
      66: 'r+',
      129: 'rx+',
      193: 'rx+',
      514: 'w+',
      577: 'w',
      578: 'w+',
      705: 'wx',
      706: 'wx+',
      1024: 'a',
      1025: 'a',
      1026: 'a+',
      1089: 'a',
      1090: 'a+',
      1153: 'ax',
      1154: 'ax+',
      1217: 'ax',
      1218: 'ax+',
      4096: 'rs',
      4098: 'rs+',
    },
    flagsToPermissionString: function (e) {
      if (((e &= -2097153), (e &= -2049), (e &= -32769), (e &= -524289) in NODEFS.flagsToPermissionStringMap))
        return NODEFS.flagsToPermissionStringMap[e]
      throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
    },
    node_ops: {
      getattr: function (e) {
        var r,
          t = NODEFS.realPath(e)
        try {
          r = fs.lstatSync(t)
        } catch (e) {
          if (!e.code) throw e
          throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
        return (
          NODEFS.isWindows && !r.blksize && (r.blksize = 4096),
          NODEFS.isWindows && !r.blocks && (r.blocks = ((r.size + r.blksize - 1) / r.blksize) | 0),
          {
            dev: r.dev,
            ino: r.ino,
            mode: r.mode,
            nlink: r.nlink,
            uid: r.uid,
            gid: r.gid,
            rdev: r.rdev,
            size: r.size,
            atime: r.atime,
            mtime: r.mtime,
            ctime: r.ctime,
            blksize: r.blksize,
            blocks: r.blocks,
          }
        )
      },
      setattr: function (e, r) {
        var t,
          n = NODEFS.realPath(e)
        try {
          void 0 !== r.mode && (fs.chmodSync(n, r.mode), (e.mode = r.mode)),
            void 0 !== r.timestamp && ((t = new Date(r.timestamp)), fs.utimesSync(n, t, t)),
            void 0 !== r.size && fs.truncateSync(n, r.size)
        } catch (e) {
          if (!e.code) throw e
          throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
      },
      lookup: function (e, r) {
        var t = PATH.join2(NODEFS.realPath(e), r),
          t = NODEFS.getMode(t)
        return NODEFS.createNode(e, r, t)
      },
      mknod: function (e, r, t, n) {
        var o = NODEFS.createNode(e, r, t, n),
          i = NODEFS.realPath(o)
        try {
          FS.isDir(o.mode) ? fs.mkdirSync(i, o.mode) : fs.writeFileSync(i, '', { mode: o.mode })
        } catch (e) {
          if (!e.code) throw e
          throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
        return o
      },
      rename: function (e, r, t) {
        var n = NODEFS.realPath(e),
          o = PATH.join2(NODEFS.realPath(r), t)
        try {
          fs.renameSync(n, o)
        } catch (e) {
          if (!e.code) throw e
          throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
      },
      unlink: function (e, r) {
        var t = PATH.join2(NODEFS.realPath(e), r)
        try {
          fs.unlinkSync(t)
        } catch (e) {
          if (!e.code) throw e
          throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
      },
      rmdir: function (e, r) {
        var t = PATH.join2(NODEFS.realPath(e), r)
        try {
          fs.rmdirSync(t)
        } catch (e) {
          if (!e.code) throw e
          throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
      },
      readdir: function (e) {
        var r = NODEFS.realPath(e)
        try {
          return fs.readdirSync(r)
        } catch (e) {
          if (!e.code) throw e
          throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
      },
      symlink: function (e, r, t) {
        var n = PATH.join2(NODEFS.realPath(e), r)
        try {
          fs.symlinkSync(t, n)
        } catch (e) {
          if (!e.code) throw e
          throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
      },
      readlink: function (e) {
        var r = NODEFS.realPath(e)
        try {
          return (r = fs.readlinkSync(r)), NODEJS_PATH.relative(NODEJS_PATH.resolve(e.mount.opts.root), r)
        } catch (e) {
          if (!e.code) throw e
          throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
      },
    },
    stream_ops: {
      open: function (e) {
        var r = NODEFS.realPath(e.node)
        try {
          FS.isFile(e.node.mode) && (e.nfd = fs.openSync(r, NODEFS.flagsToPermissionString(e.flags)))
        } catch (e) {
          if (!e.code) throw e
          throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
      },
      close: function (e) {
        try {
          FS.isFile(e.node.mode) && e.nfd && fs.closeSync(e.nfd)
        } catch (e) {
          if (!e.code) throw e
          throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
      },
      read: function (e, r, t, n, o) {
        if (0 === n) return 0
        var i,
          a = new Buffer(n)
        try {
          i = fs.readSync(e.nfd, a, 0, n, o)
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
        if (0 < i) for (var s = 0; s < i; s++) r[t + s] = a[s]
        return i
      },
      write: function (e, r, t, n, o) {
        var i,
          a = new Buffer(r.subarray(t, t + n))
        try {
          i = fs.writeSync(e.nfd, a, 0, n, o)
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
        return i
      },
      llseek: function (e, r, t) {
        var n = r
        if (1 === t) n += e.position
        else if (2 === t && FS.isFile(e.node.mode))
          try {
            n += fs.fstatSync(e.nfd).size
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code])
          }
        if (n < 0) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
        return n
      },
    },
  },
  WORKERFS = {
    DIR_MODE: 16895,
    FILE_MODE: 33279,
    reader: null,
    mount: function (e) {
      assert(ENVIRONMENT_IS_WORKER), WORKERFS.reader || (WORKERFS.reader = new FileReaderSync())
      var i = WORKERFS.createNode(null, '/', WORKERFS.DIR_MODE, 0),
        a = {}
      function n(e) {
        for (var r = e.split('/'), t = i, n = 0; n < r.length - 1; n++) {
          var o = r.slice(0, n + 1).join('/')
          a[o] || (a[o] = WORKERFS.createNode(t, r[n], WORKERFS.DIR_MODE, 0)), (t = a[o])
        }
        return t
      }
      function o(e) {
        e = e.split('/')
        return e[e.length - 1]
      }
      return (
        Array.prototype.forEach.call(e.opts.files || [], function (e) {
          WORKERFS.createNode(n(e.name), o(e.name), WORKERFS.FILE_MODE, 0, e, e.lastModifiedDate)
        }),
        (e.opts.blobs || []).forEach(function (e) {
          WORKERFS.createNode(n(e.name), o(e.name), WORKERFS.FILE_MODE, 0, e.data)
        }),
        (e.opts.packages || []).forEach(function (t) {
          t.metadata.files.forEach(function (e) {
            var r = e.filename.substr(1)
            WORKERFS.createNode(n(r), o(r), WORKERFS.FILE_MODE, 0, t.blob.slice(e.start, e.end))
          })
        }),
        i
      )
    },
    createNode: function (e, r, t, n, o, i) {
      var a = FS.createNode(e, r, t)
      return (
        (a.mode = t),
        (a.node_ops = WORKERFS.node_ops),
        (a.stream_ops = WORKERFS.stream_ops),
        (a.timestamp = (i || new Date()).getTime()),
        assert(WORKERFS.FILE_MODE !== WORKERFS.DIR_MODE),
        t === WORKERFS.FILE_MODE ? ((a.size = o.size), (a.contents = o)) : ((a.size = 4096), (a.contents = {})),
        e && (e.contents[r] = a),
        a
      )
    },
    node_ops: {
      getattr: function (e) {
        return {
          dev: 1,
          ino: void 0,
          mode: e.mode,
          nlink: 1,
          uid: 0,
          gid: 0,
          rdev: void 0,
          size: e.size,
          atime: new Date(e.timestamp),
          mtime: new Date(e.timestamp),
          ctime: new Date(e.timestamp),
          blksize: 4096,
          blocks: Math.ceil(e.size / 4096),
        }
      },
      setattr: function (e, r) {
        void 0 !== r.mode && (e.mode = r.mode), void 0 !== r.timestamp && (e.timestamp = r.timestamp)
      },
      lookup: function (e, r) {
        throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
      },
      mknod: function (e, r, t, n) {
        throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      },
      rename: function (e, r, t) {
        throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      },
      unlink: function (e, r) {
        throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      },
      rmdir: function (e, r) {
        throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      },
      readdir: function (e) {
        var r,
          t = ['.', '..']
        for (r in e.contents) e.contents.hasOwnProperty(r) && t.push(r)
        return t
      },
      symlink: function (e, r, t) {
        throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      },
      readlink: function (e) {
        throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      },
    },
    stream_ops: {
      read: function (e, r, t, n, o) {
        if (o >= e.node.size) return 0
        ;(o = e.node.contents.slice(o, o + n)), (n = WORKERFS.reader.readAsArrayBuffer(o))
        return r.set(new Uint8Array(n), t), o.size
      },
      write: function (e, r, t, n, o) {
        throw new FS.ErrnoError(ERRNO_CODES.EIO)
      },
      llseek: function (e, r, t) {
        if ((1 === t ? (r += e.position) : 2 === t && FS.isFile(e.node.mode) && (r += e.node.size), r < 0))
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
        return r
      },
    },
  }
;(STATICTOP += 16), (STATICTOP += 16), (STATICTOP += 16)
var FS = {
    root: null,
    mounts: [],
    devices: [null],
    streams: [],
    nextInode: 1,
    nameTable: null,
    currentPath: '/',
    initialized: !1,
    ignorePermissions: !0,
    trackingDelegate: {},
    tracking: { openFlags: { READ: 1, WRITE: 2 } },
    ErrnoError: null,
    genericErrors: {},
    filesystems: null,
    syncFSRequests: 0,
    handleFSError: function (e) {
      if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace()
      return ___setErrNo(e.errno)
    },
    lookupPath: function (e, r) {
      if (((r = r || {}), !(e = PATH.resolve(FS.cwd(), e)))) return { path: '', node: null }
      var t,
        n = { follow_mount: !0, recurse_count: 0 }
      for (t in n) void 0 === r[t] && (r[t] = n[t])
      if (8 < r.recurse_count) throw new FS.ErrnoError(ERRNO_CODES.ELOOP)
      for (
        var o = PATH.normalizeArray(
            e.split('/').filter(function (e) {
              return !!e
            }),
            !1
          ),
          i = FS.root,
          a = '/',
          s = 0;
        s < o.length;
        s++
      ) {
        var u = s === o.length - 1
        if (u && r.parent) break
        if (
          ((i = FS.lookupNode(i, o[s])),
          (a = PATH.join2(a, o[s])),
          FS.isMountpoint(i) && (!u || (u && r.follow_mount)) && (i = i.mounted.root),
          !u || r.follow)
        )
          for (var c = 0; FS.isLink(i.mode); ) {
            var l = FS.readlink(a),
              a = PATH.resolve(PATH.dirname(a), l),
              i = FS.lookupPath(a, { recurse_count: r.recurse_count }).node
            if (40 < c++) throw new FS.ErrnoError(ERRNO_CODES.ELOOP)
          }
      }
      return { path: a, node: i }
    },
    getPath: function (e) {
      for (var r; ; ) {
        if (FS.isRoot(e)) {
          var t = e.mount.mountpoint
          return r ? ('/' !== t[t.length - 1] ? t + '/' + r : t + r) : t
        }
        ;(r = r ? e.name + '/' + r : e.name), (e = e.parent)
      }
    },
    hashName: function (e, r) {
      for (var t = 0, n = 0; n < r.length; n++) t = ((t << 5) - t + r.charCodeAt(n)) | 0
      return ((e + t) >>> 0) % FS.nameTable.length
    },
    hashAddNode: function (e) {
      var r = FS.hashName(e.parent.id, e.name)
      ;(e.name_next = FS.nameTable[r]), (FS.nameTable[r] = e)
    },
    hashRemoveNode: function (e) {
      var r = FS.hashName(e.parent.id, e.name)
      if (FS.nameTable[r] === e) FS.nameTable[r] = e.name_next
      else
        for (var t = FS.nameTable[r]; t; ) {
          if (t.name_next === e) {
            t.name_next = e.name_next
            break
          }
          t = t.name_next
        }
    },
    lookupNode: function (e, r) {
      var t = FS.mayLookup(e)
      if (t) throw new FS.ErrnoError(t, e)
      for (var t = FS.hashName(e.id, r), n = FS.nameTable[t]; n; n = n.name_next) {
        var o = n.name
        if (n.parent.id === e.id && o === r) return n
      }
      return FS.lookup(e, r)
    },
    createNode: function (e, r, t, n) {
      FS.FSNode ||
        ((FS.FSNode = function (e, r, t, n) {
          ;(e = e || this),
            (this.parent = e),
            (this.mount = e.mount),
            (this.mounted = null),
            (this.id = FS.nextInode++),
            (this.name = r),
            (this.mode = t),
            (this.node_ops = {}),
            (this.stream_ops = {}),
            (this.rdev = n)
        }),
        (FS.FSNode.prototype = {}),
        Object.defineProperties(FS.FSNode.prototype, {
          read: {
            get: function () {
              return 365 == (365 & this.mode)
            },
            set: function (e) {
              e ? (this.mode |= 365) : (this.mode &= -366)
            },
          },
          write: {
            get: function () {
              return 146 == (146 & this.mode)
            },
            set: function (e) {
              e ? (this.mode |= 146) : (this.mode &= -147)
            },
          },
          isFolder: {
            get: function () {
              return FS.isDir(this.mode)
            },
          },
          isDevice: {
            get: function () {
              return FS.isChrdev(this.mode)
            },
          },
        }))
      n = new FS.FSNode(e, r, t, n)
      return FS.hashAddNode(n), n
    },
    destroyNode: function (e) {
      FS.hashRemoveNode(e)
    },
    isRoot: function (e) {
      return e === e.parent
    },
    isMountpoint: function (e) {
      return !!e.mounted
    },
    isFile: function (e) {
      return 32768 == (61440 & e)
    },
    isDir: function (e) {
      return 16384 == (61440 & e)
    },
    isLink: function (e) {
      return 40960 == (61440 & e)
    },
    isChrdev: function (e) {
      return 8192 == (61440 & e)
    },
    isBlkdev: function (e) {
      return 24576 == (61440 & e)
    },
    isFIFO: function (e) {
      return 4096 == (61440 & e)
    },
    isSocket: function (e) {
      return 49152 == (49152 & e)
    },
    flagModes: {
      r: 0,
      rs: 1052672,
      'r+': 2,
      w: 577,
      wx: 705,
      xw: 705,
      'w+': 578,
      'wx+': 706,
      'xw+': 706,
      a: 1089,
      ax: 1217,
      xa: 1217,
      'a+': 1090,
      'ax+': 1218,
      'xa+': 1218,
    },
    modeStringToFlags: function (e) {
      var r = FS.flagModes[e]
      if (void 0 === r) throw new Error('Unknown file open mode: ' + e)
      return r
    },
    flagsToPermissionString: function (e) {
      var r = ['r', 'w', 'rw'][3 & e]
      return 512 & e && (r += 'w'), r
    },
    nodePermissions: function (e, r) {
      return FS.ignorePermissions ||
        ((-1 === r.indexOf('r') || 292 & e.mode) &&
          (-1 === r.indexOf('w') || 146 & e.mode) &&
          (-1 === r.indexOf('x') || 73 & e.mode))
        ? 0
        : ERRNO_CODES.EACCES
    },
    mayLookup: function (e) {
      var r = FS.nodePermissions(e, 'x')
      return r || (e.node_ops.lookup ? 0 : ERRNO_CODES.EACCES)
    },
    mayCreate: function (e, r) {
      try {
        FS.lookupNode(e, r)
        return ERRNO_CODES.EEXIST
      } catch (e) {}
      return FS.nodePermissions(e, 'wx')
    },
    mayDelete: function (e, r, t) {
      var n
      try {
        n = FS.lookupNode(e, r)
      } catch (e) {
        return e.errno
      }
      var o = FS.nodePermissions(e, 'wx')
      if (o) return o
      if (t) {
        if (!FS.isDir(n.mode)) return ERRNO_CODES.ENOTDIR
        if (FS.isRoot(n) || FS.getPath(n) === FS.cwd()) return ERRNO_CODES.EBUSY
      } else if (FS.isDir(n.mode)) return ERRNO_CODES.EISDIR
      return 0
    },
    mayOpen: function (e, r) {
      return e
        ? FS.isLink(e.mode)
          ? ERRNO_CODES.ELOOP
          : FS.isDir(e.mode) && ('r' !== FS.flagsToPermissionString(r) || 512 & r)
            ? ERRNO_CODES.EISDIR
            : FS.nodePermissions(e, FS.flagsToPermissionString(r))
        : ERRNO_CODES.ENOENT
    },
    MAX_OPEN_FDS: 4096,
    nextfd: function (e, r) {
      ;(e = e || 0), (r = r || FS.MAX_OPEN_FDS)
      for (var t = e; t <= r; t++) if (!FS.streams[t]) return t
      throw new FS.ErrnoError(ERRNO_CODES.EMFILE)
    },
    getStream: function (e) {
      return FS.streams[e]
    },
    createStream: function (e, r, t) {
      FS.FSStream ||
        ((FS.FSStream = function () {}),
        (FS.FSStream.prototype = {}),
        Object.defineProperties(FS.FSStream.prototype, {
          object: {
            get: function () {
              return this.node
            },
            set: function (e) {
              this.node = e
            },
          },
          isRead: {
            get: function () {
              return 1 != (2097155 & this.flags)
            },
          },
          isWrite: {
            get: function () {
              return 0 != (2097155 & this.flags)
            },
          },
          isAppend: {
            get: function () {
              return 1024 & this.flags
            },
          },
        }))
      var n,
        o = new FS.FSStream()
      for (n in e) o[n] = e[n]
      e = o
      t = FS.nextfd(r, t)
      return (e.fd = t), (FS.streams[t] = e)
    },
    closeStream: function (e) {
      FS.streams[e] = null
    },
    chrdev_stream_ops: {
      open: function (e) {
        var r = FS.getDevice(e.node.rdev)
        ;(e.stream_ops = r.stream_ops), e.stream_ops.open && e.stream_ops.open(e)
      },
      llseek: function () {
        throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)
      },
    },
    major: function (e) {
      return e >> 8
    },
    minor: function (e) {
      return 255 & e
    },
    makedev: function (e, r) {
      return (e << 8) | r
    },
    registerDevice: function (e, r) {
      FS.devices[e] = { stream_ops: r }
    },
    getDevice: function (e) {
      return FS.devices[e]
    },
    getMounts: function (e) {
      for (var r = [], t = [e]; t.length; ) {
        var n = t.pop()
        r.push(n), t.push.apply(t, n.mounts)
      }
      return r
    },
    syncfs: function (r, t) {
      'function' == typeof r && ((t = r), (r = !1)),
        FS.syncFSRequests++,
        1 < FS.syncFSRequests &&
          console.log(
            'warning: ' + FS.syncFSRequests + ' FS.syncfs operations in flight at once, probably just doing extra work'
          )
      var n = FS.getMounts(FS.root.mount),
        o = 0
      function i(e) {
        return assert(0 < FS.syncFSRequests), FS.syncFSRequests--, t(e)
      }
      function a(e) {
        if (e) return a.errored ? void 0 : ((a.errored = !0), i(e))
        ++o >= n.length && i(null)
      }
      n.forEach(function (e) {
        return e.type.syncfs ? void e.type.syncfs(e, r, a) : a(null)
      })
    },
    mount: function (e, r, t) {
      var n = '/' === t,
        o = !t
      if (n && FS.root) throw new FS.ErrnoError(ERRNO_CODES.EBUSY)
      if (!n && !o) {
        var i = FS.lookupPath(t, { follow_mount: !1 })
        if (((t = i.path), (i = i.node), FS.isMountpoint(i))) throw new FS.ErrnoError(ERRNO_CODES.EBUSY)
        if (!FS.isDir(i.mode)) throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)
      }
      ;(t = { type: e, opts: r, mountpoint: t, mounts: [] }), (e = e.mount(t))
      return ((e.mount = t).root = e), n ? (FS.root = e) : i && ((i.mounted = t), i.mount && i.mount.mounts.push(t)), e
    },
    unmount: function (e) {
      var r = FS.lookupPath(e, { follow_mount: !1 })
      if (!FS.isMountpoint(r.node)) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
      var e = r.node,
        r = e.mounted,
        n = FS.getMounts(r)
      Object.keys(FS.nameTable).forEach(function (e) {
        for (var r = FS.nameTable[e]; r; ) {
          var t = r.name_next
          ;-1 !== n.indexOf(r.mount) && FS.destroyNode(r), (r = t)
        }
      }),
        (e.mounted = null)
      r = e.mount.mounts.indexOf(r)
      assert(-1 !== r), e.mount.mounts.splice(r, 1)
    },
    lookup: function (e, r) {
      return e.node_ops.lookup(e, r)
    },
    mknod: function (e, r, t) {
      var n = FS.lookupPath(e, { parent: !0 }).node,
        o = PATH.basename(e)
      if (!o || '.' === o || '..' === o) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
      e = FS.mayCreate(n, o)
      if (e) throw new FS.ErrnoError(e)
      if (!n.node_ops.mknod) throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      return n.node_ops.mknod(n, o, r, t)
    },
    create: function (e, r) {
      return (r = void 0 !== r ? r : 438), (r &= 4095), (r |= 32768), FS.mknod(e, r, 0)
    },
    mkdir: function (e, r) {
      return (r = void 0 !== r ? r : 511), (r &= 1023), (r |= 16384), FS.mknod(e, r, 0)
    },
    mkdirTree: function (e, r) {
      for (var t = e.split('/'), n = '', o = 0; o < t.length; ++o)
        if (t[o]) {
          n += '/' + t[o]
          try {
            FS.mkdir(n, r)
          } catch (e) {
            if (e.errno != ERRNO_CODES.EEXIST) throw e
          }
        }
    },
    mkdev: function (e, r, t) {
      return void 0 === t && ((t = r), (r = 438)), (r |= 8192), FS.mknod(e, r, t)
    },
    symlink: function (e, r) {
      if (!PATH.resolve(e)) throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
      var t = FS.lookupPath(r, { parent: !0 }).node
      if (!t) throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
      var n = PATH.basename(r),
        r = FS.mayCreate(t, n)
      if (r) throw new FS.ErrnoError(r)
      if (!t.node_ops.symlink) throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      return t.node_ops.symlink(t, n, e)
    },
    rename: function (r, t) {
      var e,
        n,
        o = PATH.dirname(r),
        i = PATH.dirname(t),
        a = PATH.basename(r),
        s = PATH.basename(t)
      try {
        ;(e = FS.lookupPath(r, { parent: !0 }).node), (n = FS.lookupPath(t, { parent: !0 }).node)
      } catch (e) {
        throw new FS.ErrnoError(ERRNO_CODES.EBUSY)
      }
      if (!e || !n) throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
      if (e.mount !== n.mount) throw new FS.ErrnoError(ERRNO_CODES.EXDEV)
      var u,
        c = FS.lookupNode(e, a),
        i = PATH.relative(r, i)
      if ('.' !== i.charAt(0)) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
      if ('.' !== (i = PATH.relative(t, o)).charAt(0)) throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)
      try {
        u = FS.lookupNode(n, s)
      } catch (e) {}
      if (c !== u) {
        ;(i = FS.isDir(c.mode)), (a = FS.mayDelete(e, a, i))
        if (a) throw new FS.ErrnoError(a)
        if ((a = u ? FS.mayDelete(n, s, i) : FS.mayCreate(n, s))) throw new FS.ErrnoError(a)
        if (!e.node_ops.rename) throw new FS.ErrnoError(ERRNO_CODES.EPERM)
        if (FS.isMountpoint(c) || (u && FS.isMountpoint(u))) throw new FS.ErrnoError(ERRNO_CODES.EBUSY)
        if (n !== e && (a = FS.nodePermissions(e, 'w'))) throw new FS.ErrnoError(a)
        try {
          FS.trackingDelegate.willMovePath && FS.trackingDelegate.willMovePath(r, t)
        } catch (e) {
          console.log("FS.trackingDelegate['willMovePath']('" + r + "', '" + t + "') threw an exception: " + e.message)
        }
        FS.hashRemoveNode(c)
        try {
          e.node_ops.rename(c, n, s)
        } catch (e) {
          throw e
        } finally {
          FS.hashAddNode(c)
        }
        try {
          FS.trackingDelegate.onMovePath && FS.trackingDelegate.onMovePath(r, t)
        } catch (e) {
          console.log("FS.trackingDelegate['onMovePath']('" + r + "', '" + t + "') threw an exception: " + e.message)
        }
      }
    },
    rmdir: function (r) {
      var e = FS.lookupPath(r, { parent: !0 }).node,
        t = PATH.basename(r),
        n = FS.lookupNode(e, t),
        o = FS.mayDelete(e, t, !0)
      if (o) throw new FS.ErrnoError(o)
      if (!e.node_ops.rmdir) throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      if (FS.isMountpoint(n)) throw new FS.ErrnoError(ERRNO_CODES.EBUSY)
      try {
        FS.trackingDelegate.willDeletePath && FS.trackingDelegate.willDeletePath(r)
      } catch (e) {
        console.log("FS.trackingDelegate['willDeletePath']('" + r + "') threw an exception: " + e.message)
      }
      e.node_ops.rmdir(e, t), FS.destroyNode(n)
      try {
        FS.trackingDelegate.onDeletePath && FS.trackingDelegate.onDeletePath(r)
      } catch (e) {
        console.log("FS.trackingDelegate['onDeletePath']('" + r + "') threw an exception: " + e.message)
      }
    },
    readdir: function (e) {
      e = FS.lookupPath(e, { follow: !0 }).node
      if (!e.node_ops.readdir) throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)
      return e.node_ops.readdir(e)
    },
    unlink: function (r) {
      var e = FS.lookupPath(r, { parent: !0 }).node,
        t = PATH.basename(r),
        n = FS.lookupNode(e, t),
        o = FS.mayDelete(e, t, !1)
      if (o) throw new FS.ErrnoError(o)
      if (!e.node_ops.unlink) throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      if (FS.isMountpoint(n)) throw new FS.ErrnoError(ERRNO_CODES.EBUSY)
      try {
        FS.trackingDelegate.willDeletePath && FS.trackingDelegate.willDeletePath(r)
      } catch (e) {
        console.log("FS.trackingDelegate['willDeletePath']('" + r + "') threw an exception: " + e.message)
      }
      e.node_ops.unlink(e, t), FS.destroyNode(n)
      try {
        FS.trackingDelegate.onDeletePath && FS.trackingDelegate.onDeletePath(r)
      } catch (e) {
        console.log("FS.trackingDelegate['onDeletePath']('" + r + "') threw an exception: " + e.message)
      }
    },
    readlink: function (e) {
      e = FS.lookupPath(e).node
      if (!e) throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
      if (!e.node_ops.readlink) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
      return PATH.resolve(FS.getPath(e.parent), e.node_ops.readlink(e))
    },
    stat: function (e, r) {
      r = FS.lookupPath(e, { follow: !r }).node
      if (!r) throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
      if (!r.node_ops.getattr) throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      return r.node_ops.getattr(r)
    },
    lstat: function (e) {
      return FS.stat(e, !0)
    },
    chmod: function (e, r, t) {
      if (!(e = 'string' == typeof e ? FS.lookupPath(e, { follow: !t }).node : e).node_ops.setattr)
        throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      e.node_ops.setattr(e, { mode: (4095 & r) | (-4096 & e.mode), timestamp: Date.now() })
    },
    lchmod: function (e, r) {
      FS.chmod(e, r, !0)
    },
    fchmod: function (e, r) {
      e = FS.getStream(e)
      if (!e) throw new FS.ErrnoError(ERRNO_CODES.EBADF)
      FS.chmod(e.node, r)
    },
    chown: function (e, r, t, n) {
      if (!(e = 'string' == typeof e ? FS.lookupPath(e, { follow: !n }).node : e).node_ops.setattr)
        throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      e.node_ops.setattr(e, { timestamp: Date.now() })
    },
    lchown: function (e, r, t) {
      FS.chown(e, r, t, !0)
    },
    fchown: function (e, r, t) {
      e = FS.getStream(e)
      if (!e) throw new FS.ErrnoError(ERRNO_CODES.EBADF)
      FS.chown(e.node, r, t)
    },
    truncate: function (e, r) {
      if (r < 0) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
      var t
      if (!(t = 'string' == typeof e ? FS.lookupPath(e, { follow: !0 }).node : e).node_ops.setattr)
        throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      if (FS.isDir(t.mode)) throw new FS.ErrnoError(ERRNO_CODES.EISDIR)
      if (!FS.isFile(t.mode)) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
      e = FS.nodePermissions(t, 'w')
      if (e) throw new FS.ErrnoError(e)
      t.node_ops.setattr(t, { size: r, timestamp: Date.now() })
    },
    ftruncate: function (e, r) {
      e = FS.getStream(e)
      if (!e) throw new FS.ErrnoError(ERRNO_CODES.EBADF)
      if (0 == (2097155 & e.flags)) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
      FS.truncate(e.node, r)
    },
    utime: function (e, r, t) {
      e = FS.lookupPath(e, { follow: !0 }).node
      e.node_ops.setattr(e, { timestamp: Math.max(r, t) })
    },
    open: function (r, e, t, n, o) {
      if ('' === r) throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
      if (
        ((t = void 0 === t ? 438 : t),
        (t = 64 & (e = 'string' == typeof e ? FS.modeStringToFlags(e) : e) ? (4095 & t) | 32768 : 0),
        'object' == typeof r)
      )
        i = r
      else {
        r = PATH.normalize(r)
        try {
          var i = FS.lookupPath(r, { follow: !(131072 & e) }).node
        } catch (e) {}
      }
      var a = !1
      if (64 & e)
        if (i) {
          if (128 & e) throw new FS.ErrnoError(ERRNO_CODES.EEXIST)
        } else (i = FS.mknod(r, t, 0)), (a = !0)
      if (!i) throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
      if ((FS.isChrdev(i.mode) && (e &= -513), 65536 & e && !FS.isDir(i.mode)))
        throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)
      if (!a) {
        a = FS.mayOpen(i, e)
        if (a) throw new FS.ErrnoError(a)
      }
      512 & e && FS.truncate(i, 0), (e &= -641)
      var s,
        o = FS.createStream(
          {
            node: i,
            path: FS.getPath(i),
            flags: e,
            seekable: !0,
            position: 0,
            stream_ops: i.stream_ops,
            ungotten: [],
            error: !1,
          },
          n,
          o
        )
      o.stream_ops.open && o.stream_ops.open(o),
        !Module.logReadFiles ||
          1 & e ||
          (FS.readFiles || (FS.readFiles = {}),
          r in FS.readFiles || ((FS.readFiles[r] = 1), Module.printErr('read file: ' + r)))
      try {
        FS.trackingDelegate.onOpenFile &&
          ((s = 0),
          1 != (2097155 & e) && (s |= FS.tracking.openFlags.READ),
          0 != (2097155 & e) && (s |= FS.tracking.openFlags.WRITE),
          FS.trackingDelegate.onOpenFile(r, s))
      } catch (e) {
        console.log("FS.trackingDelegate['onOpenFile']('" + r + "', flags) threw an exception: " + e.message)
      }
      return o
    },
    close: function (e) {
      e.getdents && (e.getdents = null)
      try {
        e.stream_ops.close && e.stream_ops.close(e)
      } catch (e) {
        throw e
      } finally {
        FS.closeStream(e.fd)
      }
    },
    llseek: function (e, r, t) {
      if (!e.seekable || !e.stream_ops.llseek) throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)
      return (e.position = e.stream_ops.llseek(e, r, t)), (e.ungotten = []), e.position
    },
    read: function (e, r, t, n, o) {
      if (n < 0 || o < 0) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
      if (1 == (2097155 & e.flags)) throw new FS.ErrnoError(ERRNO_CODES.EBADF)
      if (FS.isDir(e.node.mode)) throw new FS.ErrnoError(ERRNO_CODES.EISDIR)
      if (!e.stream_ops.read) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
      var i = !0
      if (void 0 === o) (o = e.position), (i = !1)
      else if (!e.seekable) throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)
      o = e.stream_ops.read(e, r, t, n, o)
      return i || (e.position += o), o
    },
    write: function (e, r, t, n, o, i) {
      if (n < 0 || o < 0) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
      if (0 == (2097155 & e.flags)) throw new FS.ErrnoError(ERRNO_CODES.EBADF)
      if (FS.isDir(e.node.mode)) throw new FS.ErrnoError(ERRNO_CODES.EISDIR)
      if (!e.stream_ops.write) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
      1024 & e.flags && FS.llseek(e, 0, 2)
      var a = !0
      if (void 0 === o) (o = e.position), (a = !1)
      else if (!e.seekable) throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)
      i = e.stream_ops.write(e, r, t, n, o, i)
      a || (e.position += i)
      try {
        e.path && FS.trackingDelegate.onWriteToFile && FS.trackingDelegate.onWriteToFile(e.path)
      } catch (e) {
        console.log("FS.trackingDelegate['onWriteToFile']('" + path + "') threw an exception: " + e.message)
      }
      return i
    },
    allocate: function (e, r, t) {
      if (r < 0 || t <= 0) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
      if (0 == (2097155 & e.flags)) throw new FS.ErrnoError(ERRNO_CODES.EBADF)
      if (!FS.isFile(e.node.mode) && !FS.isDir(e.node.mode)) throw new FS.ErrnoError(ERRNO_CODES.ENODEV)
      if (!e.stream_ops.allocate) throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP)
      e.stream_ops.allocate(e, r, t)
    },
    mmap: function (e, r, t, n, o, i, a) {
      if (1 == (2097155 & e.flags)) throw new FS.ErrnoError(ERRNO_CODES.EACCES)
      if (!e.stream_ops.mmap) throw new FS.ErrnoError(ERRNO_CODES.ENODEV)
      return e.stream_ops.mmap(e, r, t, n, o, i, a)
    },
    msync: function (e, r, t, n, o) {
      return e && e.stream_ops.msync ? e.stream_ops.msync(e, r, t, n, o) : 0
    },
    munmap: function (e) {
      return 0
    },
    ioctl: function (e, r, t) {
      if (!e.stream_ops.ioctl) throw new FS.ErrnoError(ERRNO_CODES.ENOTTY)
      return e.stream_ops.ioctl(e, r, t)
    },
    readFile: function (e, r) {
      if (
        (((r = r || {}).flags = r.flags || 'r'),
        (r.encoding = r.encoding || 'binary'),
        'utf8' !== r.encoding && 'binary' !== r.encoding)
      )
        throw new Error('Invalid encoding type "' + r.encoding + '"')
      var t,
        n = FS.open(e, r.flags),
        o = FS.stat(e).size,
        e = new Uint8Array(o)
      return (
        FS.read(n, e, 0, o, 0),
        'utf8' === r.encoding ? (t = UTF8ArrayToString(e, 0)) : 'binary' === r.encoding && (t = e),
        FS.close(n),
        t
      )
    },
    writeFile: function (e, r, t) {
      if (
        (((t = t || {}).flags = t.flags || 'w'),
        (t.encoding = t.encoding || 'utf8'),
        'utf8' !== t.encoding && 'binary' !== t.encoding)
      )
        throw new Error('Invalid encoding type "' + t.encoding + '"')
      var n,
        o = FS.open(e, t.flags, t.mode)
      'utf8' === t.encoding
        ? ((e = stringToUTF8Array(r, (n = new Uint8Array(lengthBytesUTF8(r) + 1)), 0, n.length)),
          FS.write(o, n, 0, e, 0, t.canOwn))
        : 'binary' === t.encoding && FS.write(o, r, 0, r.length, 0, t.canOwn),
        FS.close(o)
    },
    cwd: function () {
      return FS.currentPath
    },
    chdir: function (e) {
      var r = FS.lookupPath(e, { follow: !0 })
      if (null === r.node) throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
      if (!FS.isDir(r.node.mode)) throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)
      e = FS.nodePermissions(r.node, 'x')
      if (e) throw new FS.ErrnoError(e)
      FS.currentPath = r.path
    },
    createDefaultDirectories: function () {
      FS.mkdir('/tmp'), FS.mkdir('/home'), FS.mkdir('/home/web_user')
    },
    createDefaultDevices: function () {
      var e, r
      FS.mkdir('/dev'),
        FS.registerDevice(FS.makedev(1, 3), {
          read: function () {
            return 0
          },
          write: function (e, r, t, n, o) {
            return n
          },
        }),
        FS.mkdev('/dev/null', FS.makedev(1, 3)),
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops),
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops),
        FS.mkdev('/dev/tty', FS.makedev(5, 0)),
        FS.mkdev('/dev/tty1', FS.makedev(6, 0)),
        (r =
          'undefined' != typeof crypto
            ? ((e = new Uint8Array(1)),
              function () {
                return crypto.getRandomValues(e), e[0]
              })
            : ENVIRONMENT_IS_NODE
              ? function () {
                  return require('crypto').randomBytes(1)[0]
                }
              : function () {
                  return (256 * Math.random()) | 0
                }),
        FS.createDevice('/dev', 'random', r),
        FS.createDevice('/dev', 'urandom', r),
        FS.mkdir('/dev/shm'),
        FS.mkdir('/dev/shm/tmp')
    },
    createSpecialDirectories: function () {
      FS.mkdir('/proc'),
        FS.mkdir('/proc/self'),
        FS.mkdir('/proc/self/fd'),
        FS.mount(
          {
            mount: function () {
              var e = FS.createNode('/proc/self', 'fd', 16895, 73)
              return (
                (e.node_ops = {
                  lookup: function (e, r) {
                    var r = +r,
                      t = FS.getStream(r)
                    if (!t) throw new FS.ErrnoError(ERRNO_CODES.EBADF)
                    r = {
                      parent: null,
                      mount: { mountpoint: 'fake' },
                      node_ops: {
                        readlink: function () {
                          return t.path
                        },
                      },
                    }
                    return (r.parent = r)
                  },
                }),
                e
              )
            },
          },
          {},
          '/proc/self/fd'
        )
    },
    createStandardStreams: function () {
      Module.stdin ? FS.createDevice('/dev', 'stdin', Module.stdin) : FS.symlink('/dev/tty', '/dev/stdin'),
        Module.stdout ? FS.createDevice('/dev', 'stdout', null, Module.stdout) : FS.symlink('/dev/tty', '/dev/stdout'),
        Module.stderr ? FS.createDevice('/dev', 'stderr', null, Module.stderr) : FS.symlink('/dev/tty1', '/dev/stderr')
      var e = FS.open('/dev/stdin', 'r')
      assert(0 === e.fd, 'invalid handle for stdin (' + e.fd + ')')
      e = FS.open('/dev/stdout', 'w')
      assert(1 === e.fd, 'invalid handle for stdout (' + e.fd + ')')
      e = FS.open('/dev/stderr', 'w')
      assert(2 === e.fd, 'invalid handle for stderr (' + e.fd + ')')
    },
    ensureErrnoError: function () {
      FS.ErrnoError ||
        ((FS.ErrnoError = function (e, r) {
          ;(this.node = r),
            (this.setErrno = function (e) {
              for (var r in ((this.errno = e), ERRNO_CODES))
                if (ERRNO_CODES[r] === e) {
                  this.code = r
                  break
                }
            }),
            this.setErrno(e),
            (this.message = ERRNO_MESSAGES[e]),
            this.stack && (this.stack = demangleAll(this.stack))
        }),
        (FS.ErrnoError.prototype = new Error()),
        (FS.ErrnoError.prototype.constructor = FS.ErrnoError),
        [ERRNO_CODES.ENOENT].forEach(function (e) {
          ;(FS.genericErrors[e] = new FS.ErrnoError(e)), (FS.genericErrors[e].stack = '<generic error, no stack>')
        }))
    },
    staticInit: function () {
      FS.ensureErrnoError(),
        (FS.nameTable = new Array(4096)),
        FS.mount(MEMFS, {}, '/'),
        FS.createDefaultDirectories(),
        FS.createDefaultDevices(),
        FS.createSpecialDirectories(),
        (FS.filesystems = { MEMFS: MEMFS, IDBFS: IDBFS, NODEFS: NODEFS, WORKERFS: WORKERFS })
    },
    init: function (e, r, t) {
      assert(
        !FS.init.initialized,
        'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)'
      ),
        (FS.init.initialized = !0),
        FS.ensureErrnoError(),
        (Module.stdin = e || Module.stdin),
        (Module.stdout = r || Module.stdout),
        (Module.stderr = t || Module.stderr),
        FS.createStandardStreams()
    },
    quit: function () {
      FS.init.initialized = !1
      var e = Module._fflush
      e && e(0)
      for (var r = 0; r < FS.streams.length; r++) {
        var t = FS.streams[r]
        t && FS.close(t)
      }
    },
    getMode: function (e, r) {
      var t = 0
      return e && (t |= 365), r && (t |= 146), t
    },
    joinPath: function (e, r) {
      e = PATH.join.apply(null, e)
      return r && '/' == e[0] && (e = e.substr(1)), e
    },
    absolutePath: function (e, r) {
      return PATH.resolve(r, e)
    },
    standardizePath: function (e) {
      return PATH.normalize(e)
    },
    findObject: function (e, r) {
      r = FS.analyzePath(e, r)
      return r.exists ? r.object : (___setErrNo(r.error), null)
    },
    analyzePath: function (e, r) {
      try {
        e = (n = FS.lookupPath(e, { follow: !r })).path
      } catch (e) {}
      var t = {
        isRoot: !1,
        exists: !1,
        error: 0,
        name: null,
        path: null,
        object: null,
        parentExists: !1,
        parentPath: null,
        parentObject: null,
      }
      try {
        var n = FS.lookupPath(e, { parent: !0 })
        ;(t.parentExists = !0),
          (t.parentPath = n.path),
          (t.parentObject = n.node),
          (t.name = PATH.basename(e)),
          (n = FS.lookupPath(e, { follow: !r })),
          (t.exists = !0),
          (t.path = n.path),
          (t.object = n.node),
          (t.name = n.node.name),
          (t.isRoot = '/' === n.path)
      } catch (e) {
        t.error = e.errno
      }
      return t
    },
    createFolder: function (e, r, t, n) {
      ;(r = PATH.join2('string' == typeof e ? e : FS.getPath(e), r)), (n = FS.getMode(t, n))
      return FS.mkdir(r, n)
    },
    createPath: function (e, r, t, n) {
      e = 'string' == typeof e ? e : FS.getPath(e)
      for (var o = r.split('/').reverse(); o.length; ) {
        var i = o.pop()
        if (i) {
          var a = PATH.join2(e, i)
          try {
            FS.mkdir(a)
          } catch (e) {}
          e = a
        }
      }
      return a
    },
    createFile: function (e, r, t, n, o) {
      ;(r = PATH.join2('string' == typeof e ? e : FS.getPath(e), r)), (o = FS.getMode(n, o))
      return FS.create(r, o)
    },
    createDataFile: function (e, r, t, n, o, i) {
      ;(e = r ? PATH.join2('string' == typeof e ? e : FS.getPath(e), r) : e),
        (n = FS.getMode(n, o)),
        (o = FS.create(e, n))
      if (t) {
        if ('string' == typeof t) {
          for (var a = new Array(t.length), s = 0, u = t.length; s < u; ++s) a[s] = t.charCodeAt(s)
          t = a
        }
        FS.chmod(o, 146 | n)
        e = FS.open(o, 'w')
        FS.write(e, t, 0, t.length, 0, i), FS.close(e), FS.chmod(o, n)
      }
      return o
    },
    createDevice: function (e, r, u, a) {
      var t = PATH.join2('string' == typeof e ? e : FS.getPath(e), r),
        e = FS.getMode(!!u, !!a)
      FS.createDevice.major || (FS.createDevice.major = 64)
      r = FS.makedev(FS.createDevice.major++, 0)
      return (
        FS.registerDevice(r, {
          open: function (e) {
            e.seekable = !1
          },
          close: function (e) {
            a && a.buffer && a.buffer.length && a(10)
          },
          read: function (e, r, t, n, o) {
            for (var i, a = 0, s = 0; s < n; s++) {
              try {
                i = u()
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO)
              }
              if (void 0 === i && 0 === a) throw new FS.ErrnoError(ERRNO_CODES.EAGAIN)
              if (null == i) break
              a++, (r[t + s] = i)
            }
            return a && (e.node.timestamp = Date.now()), a
          },
          write: function (e, r, t, n, o) {
            for (var i = 0; i < n; i++)
              try {
                a(r[t + i])
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO)
              }
            return n && (e.node.timestamp = Date.now()), i
          },
        }),
        FS.mkdev(t, e, r)
      )
    },
    createLink: function (e, r, t, n, o) {
      r = PATH.join2('string' == typeof e ? e : FS.getPath(e), r)
      return FS.symlink(t, r)
    },
    forceLoadFile: function (e) {
      if (e.isDevice || e.isFolder || e.link || e.contents) return !0
      var r = !0
      if ('undefined' != typeof XMLHttpRequest)
        throw new Error(
          'Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.'
        )
      if (!Module.read) throw new Error('Cannot load without read() or XMLHttpRequest.')
      try {
        ;(e.contents = intArrayFromString(Module.read(e.url), !0)), (e.usedBytes = e.contents.length)
      } catch (e) {
        r = !1
      }
      return r || ___setErrNo(ERRNO_CODES.EIO), r
    },
    createLazyFile: function (e, r, a, t, n) {
      function o() {
        ;(this.lengthKnown = !1), (this.chunks = [])
      }
      if (
        ((o.prototype.get = function (e) {
          if (!(e > this.length - 1 || e < 0)) {
            var r = e % this.chunkSize,
              e = (e / this.chunkSize) | 0
            return this.getter(e)[r]
          }
        }),
        (o.prototype.setDataGetter = function (e) {
          this.getter = e
        }),
        (o.prototype.cacheLength = function () {
          var e = new XMLHttpRequest()
          if ((e.open('HEAD', a, !1), e.send(null), !((200 <= e.status && e.status < 300) || 304 === e.status)))
            throw new Error("Couldn't load " + a + '. Status: ' + e.status)
          var n = Number(e.getResponseHeader('Content-length')),
            r = (t = e.getResponseHeader('Accept-Ranges')) && 'bytes' === t,
            t = (t = e.getResponseHeader('Content-Encoding')) && 'gzip' === t,
            o = 1048576
          r || (o = n)
          var i = this
          i.setDataGetter(function (e) {
            var r = e * o,
              t = (e + 1) * o - 1,
              t = Math.min(t, n - 1)
            if (
              (void 0 === i.chunks[e] &&
                (i.chunks[e] = (function (e, r) {
                  if (r < e) throw new Error('invalid range (' + e + ', ' + r + ') or no bytes requested!')
                  if (n - 1 < r) throw new Error('only ' + n + ' bytes available! programmer error!')
                  var t = new XMLHttpRequest()
                  if (
                    (t.open('GET', a, !1),
                    n !== o && t.setRequestHeader('Range', 'bytes=' + e + '-' + r),
                    'undefined' != typeof Uint8Array && (t.responseType = 'arraybuffer'),
                    t.overrideMimeType && t.overrideMimeType('text/plain; charset=x-user-defined'),
                    t.send(null),
                    !((200 <= t.status && t.status < 300) || 304 === t.status))
                  )
                    throw new Error("Couldn't load " + a + '. Status: ' + t.status)
                  return void 0 !== t.response
                    ? new Uint8Array(t.response || [])
                    : intArrayFromString(t.responseText || '', !0)
                })(r, t)),
              void 0 === i.chunks[e])
            )
              throw new Error('doXHR failed!')
            return i.chunks[e]
          }),
            (!t && n) ||
              ((o = n = 1),
              (n = this.getter(0).length),
              (o = n),
              console.log('LazyFiles on gzip forces download of the whole file when length is accessed')),
            (this._length = n),
            (this._chunkSize = o),
            (this.lengthKnown = !0)
        }),
        'undefined' != typeof XMLHttpRequest)
      ) {
        if (!ENVIRONMENT_IS_WORKER)
          throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc'
        var i = new o()
        Object.defineProperties(i, {
          length: {
            get: function () {
              return this.lengthKnown || this.cacheLength(), this._length
            },
          },
          chunkSize: {
            get: function () {
              return this.lengthKnown || this.cacheLength(), this._chunkSize
            },
          },
        })
        i = { isDevice: !1, contents: i }
      } else i = { isDevice: !1, url: a }
      var u = FS.createFile(e, r, i, t, n)
      i.contents ? (u.contents = i.contents) : i.url && ((u.contents = null), (u.url = i.url)),
        Object.defineProperties(u, {
          usedBytes: {
            get: function () {
              return this.contents.length
            },
          },
        })
      var s = {}
      return (
        Object.keys(u.stream_ops).forEach(function (e) {
          var r = u.stream_ops[e]
          s[e] = function () {
            if (!FS.forceLoadFile(u)) throw new FS.ErrnoError(ERRNO_CODES.EIO)
            return r.apply(null, arguments)
          }
        }),
        (s.read = function (e, r, t, n, o) {
          if (!FS.forceLoadFile(u)) throw new FS.ErrnoError(ERRNO_CODES.EIO)
          var i = e.node.contents
          if (o >= i.length) return 0
          var a = Math.min(i.length - o, n)
          if ((assert(0 <= a), i.slice)) for (var s = 0; s < a; s++) r[t + s] = i[o + s]
          else for (s = 0; s < a; s++) r[t + s] = i.get(o + s)
          return a
        }),
        (u.stream_ops = s),
        u
      )
    },
    createPreloadedFile: function (o, i, e, a, s, u, c, l, f, d) {
      Browser.init()
      var E = i ? PATH.resolve(PATH.join2(o, i)) : o,
        S = getUniqueRunDependency('cp ' + E)
      function r(r) {
        function t(e) {
          d && d(), l || FS.createDataFile(o, i, e, a, s, f), u && u(), removeRunDependency(S)
        }
        var n = !1
        Module.preloadPlugins.forEach(function (e) {
          n ||
            (e.canHandle(E) &&
              (e.handle(r, E, t, function () {
                c && c(), removeRunDependency(S)
              }),
              (n = !0)))
        }),
          n || t(r)
      }
      addRunDependency(S),
        'string' == typeof e
          ? Browser.asyncLoad(
              e,
              function (e) {
                r(e)
              },
              c
            )
          : r(e)
    },
    indexedDB: function () {
      return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
    },
    DB_NAME: function () {
      return 'EM_FS_' + window.location.pathname
    },
    DB_VERSION: 20,
    DB_STORE_NAME: 'FILE_DATA',
    saveFilesToDB: function (a, s, u) {
      ;(s = s || function () {}), (u = u || function () {})
      var e = FS.indexedDB()
      try {
        var c = e.open(FS.DB_NAME(), FS.DB_VERSION)
      } catch (e) {
        return u(e)
      }
      ;(c.onupgradeneeded = function () {
        console.log('creating db'), c.result.createObjectStore(FS.DB_STORE_NAME)
      }),
        (c.onsuccess = function () {
          var e = c.result.transaction([FS.DB_STORE_NAME], 'readwrite'),
            r = e.objectStore(FS.DB_STORE_NAME),
            t = 0,
            n = 0,
            o = a.length
          function i() {
            ;(0 == n ? s : u)()
          }
          a.forEach(function (e) {
            e = r.put(FS.analyzePath(e).object.contents, e)
            ;(e.onsuccess = function () {
              ++t + n == o && i()
            }),
              (e.onerror = function () {
                t + ++n == o && i()
              })
          }),
            (e.onerror = u)
        }),
        (c.onerror = u)
    },
    loadFilesFromDB: function (s, u, c) {
      ;(u = u || function () {}), (c = c || function () {})
      var e = FS.indexedDB()
      try {
        var l = e.open(FS.DB_NAME(), FS.DB_VERSION)
      } catch (e) {
        return c(e)
      }
      ;(l.onupgradeneeded = c),
        (l.onsuccess = function () {
          var e = l.result
          try {
            var r = e.transaction([FS.DB_STORE_NAME], 'readonly')
          } catch (e) {
            return void c(e)
          }
          var t = r.objectStore(FS.DB_STORE_NAME),
            n = 0,
            o = 0,
            i = s.length
          function a() {
            ;(0 == o ? u : c)()
          }
          s.forEach(function (e) {
            var r = t.get(e)
            ;(r.onsuccess = function () {
              FS.analyzePath(e).exists && FS.unlink(e),
                FS.createDataFile(PATH.dirname(e), PATH.basename(e), r.result, !0, !0, !0),
                ++n + o == i && a()
            }),
              (r.onerror = function () {
                n + ++o == i && a()
              })
          }),
            (r.onerror = c)
        }),
        (l.onerror = c)
    },
  },
  SYSCALLS = {
    DEFAULT_POLLMASK: 5,
    mappings: {},
    umask: 511,
    calculateAt: function (e, r) {
      if ('/' !== r[0]) {
        var t
        if (-100 === e) t = FS.cwd()
        else {
          e = FS.getStream(e)
          if (!e) throw new FS.ErrnoError(ERRNO_CODES.EBADF)
          t = e.path
        }
        r = PATH.join2(t, r)
      }
      return r
    },
    doStat: function (e, r, t) {
      try {
        var n = e(r)
      } catch (e) {
        if (e && e.node && PATH.normalize(r) !== PATH.normalize(FS.getPath(e.node))) return -ERRNO_CODES.ENOTDIR
        throw e
      }
      return (
        (HEAP32[t >> 2] = n.dev),
        (HEAP32[(t + 4) >> 2] = 0),
        (HEAP32[(t + 8) >> 2] = n.ino),
        (HEAP32[(t + 12) >> 2] = n.mode),
        (HEAP32[(t + 16) >> 2] = n.nlink),
        (HEAP32[(t + 20) >> 2] = n.uid),
        (HEAP32[(t + 24) >> 2] = n.gid),
        (HEAP32[(t + 28) >> 2] = n.rdev),
        (HEAP32[(t + 32) >> 2] = 0),
        (HEAP32[(t + 36) >> 2] = n.size),
        (HEAP32[(t + 40) >> 2] = 4096),
        (HEAP32[(t + 44) >> 2] = n.blocks),
        (HEAP32[(t + 48) >> 2] = (n.atime.getTime() / 1e3) | 0),
        (HEAP32[(t + 52) >> 2] = 0),
        (HEAP32[(t + 56) >> 2] = (n.mtime.getTime() / 1e3) | 0),
        (HEAP32[(t + 60) >> 2] = 0),
        (HEAP32[(t + 64) >> 2] = (n.ctime.getTime() / 1e3) | 0),
        (HEAP32[(t + 68) >> 2] = 0),
        (HEAP32[(t + 72) >> 2] = n.ino),
        0
      )
    },
    doMsync: function (e, r, t, n) {
      e = new Uint8Array(HEAPU8.subarray(e, e + t))
      FS.msync(r, e, 0, t, n)
    },
    doMkdir: function (e, r) {
      return '/' === (e = PATH.normalize(e))[e.length - 1] && (e = e.substr(0, e.length - 1)), FS.mkdir(e, r, 0), 0
    },
    doMknod: function (e, r, t) {
      switch (61440 & r) {
        case 32768:
        case 8192:
        case 24576:
        case 4096:
        case 49152:
          break
        default:
          return -ERRNO_CODES.EINVAL
      }
      return FS.mknod(e, r, t), 0
    },
    doReadlink: function (e, r, t) {
      if (t <= 0) return -ERRNO_CODES.EINVAL
      var n = FS.readlink(e),
        o = Math.min(t, lengthBytesUTF8(n)),
        e = HEAP8[r + o]
      return stringToUTF8(n, r, t + 1), (HEAP8[r + o] = e), o
    },
    doAccess: function (e, r) {
      if (-8 & r) return -ERRNO_CODES.EINVAL
      var t = FS.lookupPath(e, { follow: !0 }).node,
        e = ''
      return (
        4 & r && (e += 'r'),
        2 & r && (e += 'w'),
        1 & r && (e += 'x'),
        e && FS.nodePermissions(t, e) ? -ERRNO_CODES.EACCES : 0
      )
    },
    doDup: function (e, r, t) {
      var n = FS.getStream(t)
      return n && FS.close(n), FS.open(e, r, 0, t, t).fd
    },
    doReadv: function (e, r, t, n) {
      for (var o = 0, i = 0; i < t; i++) {
        var a = HEAP32[(r + 8 * i) >> 2],
          s = HEAP32[(r + (8 * i + 4)) >> 2],
          a = FS.read(e, HEAP8, a, s, n)
        if (a < 0) return -1
        if (((o += a), a < s)) break
      }
      return o
    },
    doWritev: function (e, r, t, n) {
      for (var o = 0, i = 0; i < t; i++) {
        var a = HEAP32[(r + 8 * i) >> 2],
          s = HEAP32[(r + (8 * i + 4)) >> 2],
          s = FS.write(e, HEAP8, a, s, n)
        if (s < 0) return -1
        o += s
      }
      return o
    },
    varargs: 0,
    get: function (e) {
      return (SYSCALLS.varargs += 4), HEAP32[(SYSCALLS.varargs - 4) >> 2]
    },
    getStr: function () {
      return Pointer_stringify(SYSCALLS.get())
    },
    getStreamFromFD: function () {
      var e = FS.getStream(SYSCALLS.get())
      if (!e) throw new FS.ErrnoError(ERRNO_CODES.EBADF)
      return e
    },
    getSocketFromFD: function () {
      var e = SOCKFS.getSocket(SYSCALLS.get())
      if (!e) throw new FS.ErrnoError(ERRNO_CODES.EBADF)
      return e
    },
    getSocketAddress: function (e) {
      var r = SYSCALLS.get(),
        t = SYSCALLS.get()
      if (e && 0 === r) return null
      t = __read_sockaddr(r, t)
      if (t.errno) throw new FS.ErrnoError(t.errno)
      return (t.addr = DNS.lookup_addr(t.addr) || t.addr), t
    },
    get64: function () {
      var e = SYSCALLS.get(),
        r = SYSCALLS.get()
      return assert(0 <= e ? 0 === r : -1 === r), e
    },
    getZero: function () {
      assert(0 === SYSCALLS.get())
    },
  }
function ___syscall5(e, r) {
  SYSCALLS.varargs = r
  try {
    var t = SYSCALLS.getStr(),
      n = SYSCALLS.get(),
      o = SYSCALLS.get()
    return FS.open(t, n, o).fd
  } catch (e) {
    return (void 0 !== FS && e instanceof FS.ErrnoError) || abort(e), -e.errno
  }
}
function ___lock() {}
function ___unlock() {}
function ___syscall6(e, r) {
  SYSCALLS.varargs = r
  try {
    var t = SYSCALLS.getStreamFromFD()
    return FS.close(t), 0
  } catch (e) {
    return (void 0 !== FS && e instanceof FS.ErrnoError) || abort(e), -e.errno
  }
}
var cttz_i8 = allocate(
    [
      8, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0,
      1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 6, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0,
      2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0,
      1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 7, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0,
      3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0,
      1, 0, 6, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0,
      2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0,
    ],
    'i8',
    ALLOC_STATIC
  ),
  fs,
  NODEJS_PATH
function _emscripten_memcpy_big(e, r, t) {
  return HEAPU8.set(HEAPU8.subarray(r, r + t), e), e
}
function ___syscall140(e, r) {
  SYSCALLS.varargs = r
  try {
    var t = SYSCALLS.getStreamFromFD(),
      n = (SYSCALLS.get(), SYSCALLS.get()),
      o = SYSCALLS.get(),
      i = SYSCALLS.get(),
      n = n
    return FS.llseek(t, n, i), (HEAP32[o >> 2] = t.position), t.getdents && 0 === n && 0 === i && (t.getdents = null), 0
  } catch (e) {
    return (void 0 !== FS && e instanceof FS.ErrnoError) || abort(e), -e.errno
  }
}
function ___syscall146(e, r) {
  SYSCALLS.varargs = r
  try {
    var t = SYSCALLS.getStreamFromFD(),
      n = SYSCALLS.get(),
      o = SYSCALLS.get()
    return SYSCALLS.doWritev(t, n, o)
  } catch (e) {
    return (void 0 !== FS && e instanceof FS.ErrnoError) || abort(e), -e.errno
  }
}
function ___syscall54(e, r) {
  SYSCALLS.varargs = r
  try {
    var t = SYSCALLS.getStreamFromFD(),
      n = SYSCALLS.get()
    switch (n) {
      case 21505:
      case 21506:
        return t.tty ? 0 : -ERRNO_CODES.ENOTTY
      case 21519:
        if (!t.tty) return -ERRNO_CODES.ENOTTY
        var o = SYSCALLS.get()
        return (HEAP32[o >> 2] = 0)
      case 21520:
        return t.tty ? -ERRNO_CODES.EINVAL : -ERRNO_CODES.ENOTTY
      case 21531:
        o = SYSCALLS.get()
        return FS.ioctl(t, n, o)
      case 21523:
        return t.tty ? 0 : -ERRNO_CODES.ENOTTY
      default:
        abort('bad ioctl syscall ' + n)
    }
  } catch (e) {
    return (void 0 !== FS && e instanceof FS.ErrnoError) || abort(e), -e.errno
  }
}
function ___syscall221(e, r) {
  SYSCALLS.varargs = r
  try {
    var t = SYSCALLS.getStreamFromFD()
    switch (SYSCALLS.get()) {
      case 0:
        return (n = SYSCALLS.get()) < 0 ? -ERRNO_CODES.EINVAL : FS.open(t.path, t.flags, 0, n).fd
      case 1:
      case 2:
        return 0
      case 3:
        return t.flags
      case 4:
        var n = SYSCALLS.get()
        return (t.flags |= n), 0
      case 12:
      case 12:
        n = SYSCALLS.get()
        return (HEAP16[(n + 0) >> 1] = 2), 0
      case 13:
      case 14:
      case 13:
      case 14:
        return 0
      case 16:
      case 8:
        return -ERRNO_CODES.EINVAL
      case 9:
        return ___setErrNo(ERRNO_CODES.EINVAL), -1
      default:
        return -ERRNO_CODES.EINVAL
    }
  } catch (e) {
    return (void 0 !== FS && e instanceof FS.ErrnoError) || abort(e), -e.errno
  }
}
function ___syscall145(e, r) {
  SYSCALLS.varargs = r
  try {
    var t = SYSCALLS.getStreamFromFD(),
      n = SYSCALLS.get(),
      o = SYSCALLS.get()
    return SYSCALLS.doReadv(t, n, o)
  } catch (e) {
    return (void 0 !== FS && e instanceof FS.ErrnoError) || abort(e), -e.errno
  }
}
function nullFunc_ii(e) {
  Module.printErr(
    "Invalid function pointer called with signature 'ii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
  ),
    Module.printErr('Build with ASSERTIONS=2 for more info.'),
    abort(e)
}
function nullFunc_iiii(e) {
  Module.printErr(
    "Invalid function pointer called with signature 'iiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
  ),
    Module.printErr('Build with ASSERTIONS=2 for more info.'),
    abort(e)
}
function invoke_ii(e, r) {
  try {
    return Module.dynCall_ii(e, r)
  } catch (e) {
    if ('number' != typeof e && 'longjmp' !== e) throw e
    Module.setThrew(1, 0)
  }
}
function invoke_iiii(e, r, t, n) {
  try {
    return Module.dynCall_iiii(e, r, t, n)
  } catch (e) {
    if ('number' != typeof e && 'longjmp' !== e) throw e
    Module.setThrew(1, 0)
  }
}
FS.staticInit(),
  __ATINIT__.unshift(function () {
    Module.noFSInit || FS.init.initialized || FS.init()
  }),
  __ATMAIN__.push(function () {
    FS.ignorePermissions = !1
  }),
  __ATEXIT__.push(function () {
    FS.quit()
  }),
  (Module.FS_createFolder = FS.createFolder),
  (Module.FS_createPath = FS.createPath),
  (Module.FS_createDataFile = FS.createDataFile),
  (Module.FS_createPreloadedFile = FS.createPreloadedFile),
  (Module.FS_createLazyFile = FS.createLazyFile),
  (Module.FS_createLink = FS.createLink),
  (Module.FS_createDevice = FS.createDevice),
  (Module.FS_unlink = FS.unlink),
  __ATINIT__.unshift(function () {
    TTY.init()
  }),
  __ATEXIT__.push(function () {
    TTY.shutdown()
  }),
  ENVIRONMENT_IS_NODE && ((fs = require('fs')), (NODEJS_PATH = require('path')), NODEFS.staticInit()),
  (DYNAMICTOP_PTR = allocate(1, 'i32', ALLOC_STATIC)),
  (STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP)),
  (STACK_MAX = STACK_BASE + TOTAL_STACK),
  (DYNAMIC_BASE = Runtime.alignMemory(STACK_MAX)),
  (HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE),
  (staticSealed = !0),
  assert(DYNAMIC_BASE < TOTAL_MEMORY, 'TOTAL_MEMORY not big enough for stack'),
  (Module.asmGlobalArg = {
    Math: Math,
    Int8Array: Int8Array,
    Int16Array: Int16Array,
    Int32Array: Int32Array,
    Uint8Array: Uint8Array,
    Uint16Array: Uint16Array,
    Uint32Array: Uint32Array,
    Float32Array: Float32Array,
    Float64Array: Float64Array,
    NaN: NaN,
    Infinity: 1 / 0,
    byteLength: byteLength,
  }),
  (Module.asmLibraryArg = {
    abort: abort,
    assert: assert,
    enlargeMemory: enlargeMemory,
    getTotalMemory: getTotalMemory,
    abortOnCannotGrowMemory: abortOnCannotGrowMemory,
    abortStackOverflow: abortStackOverflow,
    nullFunc_ii: nullFunc_ii,
    nullFunc_iiii: nullFunc_iiii,
    invoke_ii: invoke_ii,
    invoke_iiii: invoke_iiii,
    ___syscall221: ___syscall221,
    _emscripten_asm_const_iiii: _emscripten_asm_const_iiii,
    _emscripten_asm_const_i: _emscripten_asm_const_i,
    ___lock: ___lock,
    ___syscall6: ___syscall6,
    ___setErrNo: ___setErrNo,
    ___syscall140: ___syscall140,
    ___syscall146: ___syscall146,
    ___syscall5: ___syscall5,
    _emscripten_memcpy_big: _emscripten_memcpy_big,
    ___syscall54: ___syscall54,
    ___unlock: ___unlock,
    ___syscall145: ___syscall145,
    _emscripten_asm_const_iii: _emscripten_asm_const_iii,
    DYNAMICTOP_PTR: DYNAMICTOP_PTR,
    tempDoublePtr: tempDoublePtr,
    ABORT: ABORT,
    STACKTOP: STACKTOP,
    STACK_MAX: STACK_MAX,
    cttz_i8: cttz_i8,
  })
var asm = (function (e, r, t) {
    var n = e.Int8Array,
      Xe = new n(t),
      o = e.Int16Array,
      je = new o(t),
      i = e.Int32Array,
      Ge = new i(t),
      a = e.Uint8Array,
      qe = new a(t),
      s = e.Uint16Array,
      u = (new s(t), e.Uint32Array),
      c = (new u(t), e.Float32Array),
      l = (new c(t), e.Float64Array),
      Te = new l(t),
      f = e.byteLength,
      d = 0 | r.DYNAMICTOP_PTR,
      ge = 0 | r.tempDoublePtr,
      Ze = (r.ABORT, 0 | r.STACKTOP),
      Je = 0 | r.STACK_MAX,
      E = 0 | r.cttz_i8,
      S = 0,
      ve = (e.NaN, e[1 / 0], 0),
      Ne =
        (e.Math.floor,
        e.Math.abs,
        e.Math.sqrt,
        e.Math.pow,
        e.Math.cos,
        e.Math.sin,
        e.Math.tan,
        e.Math.acos,
        e.Math.asin,
        e.Math.atan,
        e.Math.atan2,
        e.Math.exp,
        e.Math.log,
        e.Math.ceil,
        e.Math.imul),
      D = (e.Math.min, e.Math.max, e.Math.clz32),
      _ = (r.abort, r.assert, r.enlargeMemory),
      m = r.getTotalMemory,
      h = r.abortOnCannotGrowMemory,
      Qe = r.abortStackOverflow,
      p = r.nullFunc_ii,
      F = r.nullFunc_iiii,
      M = (r.invoke_ii, r.invoke_iiii, r.___syscall221),
      P = r._emscripten_asm_const_iiii,
      C = r._emscripten_asm_const_i,
      b = r.___lock,
      y = r.___syscall6,
      O = r.___setErrNo,
      w = r.___syscall140,
      R = r.___syscall146,
      A = r.___syscall5,
      k = r._emscripten_memcpy_big,
      T = r.___syscall54,
      g = r.___unlock,
      v = r.___syscall145,
      $e = r._emscripten_asm_const_iii
    function I(e, r) {
      r |= 0
      var t,
        n,
        o,
        i,
        a,
        s =
          0 |
          (function (e, r) {
            ;(e |= 0), (r |= 0)
            var t = 0,
              n = 0,
              o = 0,
              i = 0,
              a = 0,
              s = 0
            ;(0 | (Ze = ((t = Ze) + 48) | 0)) >= (0 | Je) && Qe(48)
            ;(n = (t + 32) | 0),
              (o = (t + 16) | 0),
              (i = t),
              (s =
                0 | Le(3788, 0 | Xe[r >> 0], 4)
                  ? ((a =
                      0 |
                      (function (e) {
                        var r = 0,
                          t = 0,
                          n = 0,
                          o = 0
                        return (
                          (r = 0 == (0 | G((e = e | 0), 43))),
                          (t = 0 | Xe[e >> 0]),
                          (n = r ? ((t << 24) >> 24 != 114) & 1 : 2),
                          (r = 0 == (0 | G(e, 120))),
                          (o = r ? n : 128 | n),
                          (n = 0 == (0 | G(e, 101))),
                          (e = n ? o : 524288 | o),
                          (o = (t << 24) >> 24 == 114 ? e : 64 | e),
                          (e = (t << 24) >> 24 == 119 ? 512 | o : o),
                          0 | ((t << 24) >> 24 == 97 ? 1024 | e : e)
                        )
                      })(r)),
                    (Ge[i >> 2] = e),
                    (Ge[(i + 4) >> 2] = 32768 | a),
                    (Ge[(i + 8) >> 2] = 438),
                    (e = 0 | U(0 | A(5, 0 | i))),
                    0 <= (0 | e)
                      ? ((524288 & a) | 0 &&
                          ((Ge[o >> 2] = e), (Ge[(o + 4) >> 2] = 2), (Ge[(o + 8) >> 2] = 1), M(221, 0 | o)),
                        (o =
                          0 |
                          (function (e, r) {
                            ;(e |= 0), (r |= 0)
                            var t = 0,
                              n = 0,
                              o = 0,
                              i = 0,
                              a = 0,
                              s = 0,
                              u = 0,
                              c = 0,
                              l = 0,
                              f = 0,
                              d = 0,
                              E = 0,
                              S = 0
                            ;(0 | (Ze = ((t = Ze) + 64) | 0)) >= (0 | Je) && Qe(64)
                            if (
                              ((n = (t + 40) | 0),
                              (o = (t + 24) | 0),
                              (i = (t + 16) | 0),
                              (s = ((a = t) + 56) | 0),
                              0 | Le(3788, ((u = 0 | Xe[r >> 0]) << 24) >> 24, 4))
                            )
                              if ((c = 0 | x(1156))) {
                                for (
                                  f = c, d = (f + 124) | 0;
                                  (Ge[f >> 2] = 0), (f = (f + 4) | 0), (0 | f) < (0 | d);

                                );
                                0 | G(r, 43) || (Ge[c >> 2] = (u << 24) >> 24 == 114 ? 8 : 4),
                                  (E =
                                    0 | G(r, 101)
                                      ? ((Ge[a >> 2] = e),
                                        (Ge[(a + 4) >> 2] = 2),
                                        (Ge[(a + 8) >> 2] = 1),
                                        M(221, 0 | a),
                                        0 | Xe[r >> 0])
                                      : u),
                                  (S =
                                    (E << 24) >> 24 == 97
                                      ? ((Ge[i >> 2] = e),
                                        (Ge[(4 + i) >> 2] = 3),
                                        1024 & (E = 0 | M(221, 0 | i)) ||
                                          ((Ge[o >> 2] = e),
                                          (Ge[(o + 4) >> 2] = 4),
                                          (Ge[(o + 8) >> 2] = 1024 | E),
                                          M(221, 0 | o)),
                                        (o = 128 | Ge[c >> 2]),
                                        (Ge[c >> 2] = o))
                                      : 0 | Ge[c >> 2]),
                                  (Ge[(c + 60) >> 2] = e),
                                  (Ge[(c + 44) >> 2] = c + 132),
                                  (Ge[(c + 48) >> 2] = 1024),
                                  (Xe[(o = (c + 75) | 0) >> 0] = -1),
                                  0 == ((8 & S) | 0) &&
                                    ((Ge[n >> 2] = e),
                                    (Ge[(4 + n) >> 2] = 21523),
                                    (Ge[(8 + n) >> 2] = s),
                                    0 == (0 | T(54, 0 | n))) &&
                                    (Xe[o >> 0] = 10),
                                  (Ge[(c + 32) >> 2] = 4),
                                  (Ge[(c + 36) >> 2] = 3),
                                  (Ge[(c + 40) >> 2] = 2),
                                  (Ge[(c + 12) >> 2] = 1),
                                  0 | Ge[1073] || (Ge[(c + 76) >> 2] = -1),
                                  (function (e) {
                                    e |= 0
                                    var r = 0,
                                      t = 0
                                    ;(r = 0 | Q()),
                                      (Ge[(e + 56) >> 2] = Ge[r >> 2]),
                                      0 | (t = 0 | Ge[r >> 2]) && (Ge[(52 + t) >> 2] = e),
                                      (Ge[r >> 2] = e),
                                      $()
                                  })(c),
                                  (l = c)
                              } else l = 0
                            else (Ge[(c = 652) >> 2] = 22), (l = 0)
                            return (Ze = t), 0 | l
                          })(e, r)) || ((Ge[n >> 2] = e), y(6, 0 | n), 0))
                      : 0)
                  : ((Ge[(o = 652) >> 2] = 22), 0))
            return (Ze = t), 0 | s
          })((e |= 0), 964)
      do {
        if (0 | s) {
          if (
            ((o = s),
            (a = 2),
            (function (e, r, t) {
              ;(r |= 0), (t |= 0)
              var n = 0,
                o = 0
              ;-1 < (0 | Ge[(76 + (e |= 0)) >> 2])
                ? ((n = 0 == (0 | V())), (o = 0 | ne(e, r, t)), n || K())
                : ne(e, r, t)
            })((o |= i = 0), (i |= 0), (a |= 0)),
            (e =
              0 |
              ((i = s),
              0 |
                (function (e) {
                  var r = 0,
                    t = 0,
                    n = 0
                  n =
                    -1 < (0 | Ge[(76 + (e |= 0)) >> 2])
                      ? ((r = 0 == (0 | V())), (t = 0 | oe(e)), r || K(), t)
                      : 0 | oe(e)
                  return 0 | n
                })((i |= 0)))),
            (a = s),
            (i = void 0),
            -1 < ((i = 0) | Ge[(76 + (a |= 0)) >> 2])
              ? ((i = 0 == (0 | V())), ne(a, 0, 0), (Ge[a >> 2] = -33 & Ge[a >> 2]), i || K())
              : (ne(a, 0, 0), (Ge[a >> 2] = -33 & Ge[a >> 2])),
            (t = 0 | x((e + 1) | 0)))
          )
            return (
              (0 |
                (n =
                  0 |
                  (function (e, r, t, n) {
                    ;(e |= 0), (n |= 0)
                    var o = 0,
                      i = 0,
                      a = 0,
                      s = 0,
                      u = 0,
                      c = 0,
                      l = 0,
                      f = 0,
                      d = 0,
                      E = 0
                    ;(o = 0 | Ne((t |= 0), (r |= 0))),
                      (i = 0 == (0 | r) ? 0 : t),
                      (a = -1 < (0 | Ge[(n + 76) >> 2]) ? 0 | V() : 0)
                    ;(s = 0 | Xe[(t = (n + 74) | 0) >> 0]),
                      (Xe[t >> 0] = (s + 255) | s),
                      (t = 0 | Ge[(s = (n + 4) | 0) >> 2]),
                      (u = ((0 | Ge[(n + 8) >> 2]) - t) | 0),
                      (c = u >>> 0 < o >>> 0 ? u : o),
                      (f =
                        0 < (0 | u)
                          ? (tr(0 | e, 0 | t, 0 | c), (Ge[s >> 2] = t + c), (l = (o - c) | 0), (e + c) | 0)
                          : ((l = o), e))
                    e: do {
                      if (l) {
                        for (
                          e = (n + 32) | 0, c = l, t = f;
                          !(
                            0 |
                              (function (e) {
                                var r = 0,
                                  t = 0,
                                  n = 0
                                ;(t = 0 | Xe[(r = (74 + (e |= 0)) | 0) >> 0]),
                                  (Xe[r >> 0] = (255 + t) | t),
                                  (r = (e + 28) | 0),
                                  (0 | Ge[(t = (e + 20) | 0) >> 2]) >>> 0 > (0 | Ge[r >> 2]) >>> 0 &&
                                    de[7 & Ge[(e + 36) >> 2]](e, 0, 0)
                                ;(Ge[(e + 16) >> 2] = 0),
                                  (Ge[r >> 2] = 0),
                                  (Ge[t >> 2] = 0),
                                  (n =
                                    4 & (t = 0 | Ge[e >> 2])
                                      ? ((Ge[e >> 2] = 32 | t), -1)
                                      : ((r = ((0 | Ge[(e + 44) >> 2]) + (0 | Ge[(e + 48) >> 2])) | 0),
                                        (Ge[(e + 8) >> 2] = r),
                                        (Ge[(e + 4) >> 2] = r),
                                        (t << 27) >> 31))
                                return 0 | n
                              })(n) || (((s = 0 | de[7 & Ge[e >> 2]](n, t, c)) + 1) | 0) >>> 0 < 2
                          );

                        ) {
                          if (!(u = (c - s) | 0)) {
                            d = 13
                            break e
                          }
                          ;(c = u), (t = (t + s) | 0)
                        }
                        0 | a && K(), (E = ((((o - c) | 0) >>> 0) / (r >>> 0)) | 0)
                      } else d = 13
                    } while (0)
                    13 == (0 | d) && (E = (a && K(), i))
                    return 0 | E
                  })(t, 1, e, s))) <
                (0 | e) && ae(1256),
              (Ge[r >> 2] = t),
              (Xe[(t + e) >> 0] = 0),
              ee(s),
              0 | n
            )
          ae(1230), ee(s)
          break
        }
      } while (0)
      return (Ge[r >> 2] = 0) | -1
    }
    function N(e, r) {
      ;(e |= 0), (r |= 0)
      var t,
        n,
        o,
        i,
        a,
        s,
        u,
        c,
        l,
        f,
        d,
        E,
        S,
        _,
        m,
        h,
        p,
        F,
        M,
        b = 0,
        y = 0,
        O = 0,
        w = 0,
        R = 0,
        A = 0,
        k = 0,
        T = 0,
        g = 0,
        v = 0,
        N = 0,
        D = 0
      if (
        ((0 | Je) <= (0 | (Ze = ((r = Ze) + 4192) | 0)) && Qe(4192),
        (t = (r + 32) | 0),
        (n = (r + 24) | 0),
        (o = (r + 16) | 0),
        (i = (r + 8) | 0),
        (a = ((b = r) + 40) | 0),
        (u = (r + 88) | 0),
        ((Ge[(s = (r + 36) | 0) >> 2] = 0) | (c = 0 | I(e, s))) < 22)
      )
        return (Ge[b >> 2] = 182), ie(967, b), B(0 | Ge[s >> 2]), (Ze = r), 0
      b = (c - 22) | 0
      e: do {
        if (22 < (0 | b)) {
          for (
            y = ((e = 0 | Ge[s >> 2]) + c) | 0, O = b;
            101010256 !=
              (((0 | qe[((A = ((R = ((w = (e + O) | 0) + 1) | 0) + 1) | 0) + 1) >> 0]) << 24) |
                (((0 | qe[A >> 0]) << 16) | (((0 | qe[R >> 0]) << 8) | 0 | qe[w >> 0])) |
                0) || ((w + 22 + (((0 | qe[((R = (w + 20) | 0) + 1) >> 0]) << 8) | 0 | qe[R >> 0])) | 0) != (0 | y);

          )
            if ((0 | (O = (O + -1) | 0)) <= 22) break e
          if (
            ((A =
              (e +
                (((0 | qe[((R = ((y = ((O = (w + 16) | 0) + 1) | 0) + 1) | 0) + 1) >> 0]) << 24) |
                  (((0 | qe[R >> 0]) << 16) | (((0 | qe[y >> 0]) << 8) | 0 | qe[O >> 0])))) |
              0),
            33639248 ==
              (((0 | qe[(A + 3) >> 0]) << 24) |
                (((0 | qe[(A + 2) >> 0]) << 16) | (((0 | qe[(A + 1) >> 0]) << 8) | 0 | qe[A >> 0])) |
                0))
          )
            for (O = A, y = 0; ; ) {
              if (
                ((R =
                  ((((0 | qe[(O + 27) >> 0]) << 24) |
                    (((0 | qe[(O + 26) >> 0]) << 16) | (((0 | qe[(O + 25) >> 0]) << 8) | 0 | qe[(O + 24) >> 0]))) +
                    y) |
                  0),
                (O =
                  (O +
                    (46 +
                      (((0 | qe[(O + 29) >> 0]) << 8) | 0 | qe[(O + 28) >> 0]) +
                      (((0 | qe[(O + 31) >> 0]) << 8) | 0 | qe[(O + 30) >> 0]) +
                      (((0 | qe[(O + 33) >> 0]) << 8) | 0 | qe[(O + 32) >> 0]))) |
                  0),
                33639248 !=
                  (((0 | qe[(O + 3) >> 0]) << 24) |
                    (((0 | qe[(O + 2) >> 0]) << 16) | (((0 | qe[(O + 1) >> 0]) << 8) | 0 | qe[O >> 0])) |
                    0))
              ) {
                k = R
                break
              }
              y = R
            }
          else k = 0
          ;(y = (4 + a) | 0), (O = (12 + a) | 0), (R = (16 + a) | 0)
          r: do {
            if (
              33639248 ==
              (((0 | qe[(A + 3) >> 0]) << 24) |
                (((0 | qe[(A + 2) >> 0]) << 16) | (((0 | qe[(A + 1) >> 0]) << 8) | 0 | qe[A >> 0])) |
                0)
            ) {
              for (
                T = 0, g = A;
                (v = 0 | Xe[(g + 10) >> 0]),
                  (N = 0 | Xe[(g + 11) >> 0]),
                  (l =
                    ((0 | qe[(g + 19) >> 0]) << 24) |
                    (((0 | qe[(g + 18) >> 0]) << 16) | (((0 | qe[(g + 17) >> 0]) << 8) | 0 | qe[(g + 16) >> 0]))),
                  (f =
                    ((0 | qe[(g + 23) >> 0]) << 24) |
                    (((0 | qe[(g + 22) >> 0]) << 16) | (((0 | qe[(g + 21) >> 0]) << 8) | 0 | qe[(g + 20) >> 0]))),
                  (d =
                    ((0 | qe[(g + 27) >> 0]) << 24) |
                    (((0 | qe[(g + 26) >> 0]) << 16) | (((0 | qe[(g + 25) >> 0]) << 8) | 0 | qe[(g + 24) >> 0]))),
                  (E = ((0 | qe[(g + 29) >> 0]) << 8) | 0 | qe[(g + 28) >> 0]),
                  (S = ((0 | qe[(g + 33) >> 0]) << 8) | 0 | qe[(g + 32) >> 0]),
                  (_ = ((0 | qe[(g + 31) >> 0]) << 8) | 0 | qe[(g + 30) >> 0]),
                  er(0 | u, 0, 4096),
                  !(4095 < E >>> 0);

              ) {
                switch (
                  (tr(0 | u, (g + 46) | 0, 0 | E),
                  (p =
                    (28 +
                      (m =
                        (e +
                          (((0 | qe[(g + 45) >> 0]) << 24) |
                            (((0 | qe[(g + 44) >> 0]) << 16) |
                              (((0 | qe[(g + 43) >> 0]) << 8) | 0 | qe[(g + 42) >> 0])))) |
                        0)) |
                    0),
                  (F =
                    (30 +
                      m +
                      (((0 | qe[(1 + (h = (26 + m) | 0)) >> 0]) << 8) | 0 | qe[h >> 0]) +
                      (((0 | qe[(1 + p) >> 0]) << 8) | 0 | qe[p >> 0])) |
                    0),
                  ((65535 & (((255 & N) << 8) | (255 & v))) << 16) >> 16)
                ) {
                  case 0:
                    P(0, 0 | u, 0 | d, 0 | F), (D = 15)
                    break
                  case 8:
                    D = 15
                }
                if (15 == (0 | D) && (D = 0) | (v = 0 | x(d))) {
                  for (N = a, p = (N + 48) | 0; (N = (N + 4) | (Ge[N >> 2] = 0)), (0 | N) < (0 | p); );
                  do {
                    if (
                      !(
                        0 |
                        (function (e, r) {
                          ;(e |= 0), (r |= 0)
                          var t = 0,
                            n = 0,
                            o = 0,
                            i = 0,
                            a = 0,
                            s = 0
                          ;(0 | (Ze = ((t = Ze) + 16) | 0)) >= (0 | Je) && Qe(16)
                          if (
                            ((n = (t + 12) | 0),
                            (i = (t + 4) | 0),
                            (Ge[(o = ((a = t) + 8) | 0) >> 2] = e),
                            (Ge[i >> 2] = r),
                            !(0 | Ge[o >> 2]))
                          )
                            return (Ge[n >> 2] = -2), (s = 0 | Ge[n >> 2]), (Ze = t), 0 | s
                          if (15 != (0 | Ge[i >> 2]) && 15 != ((0 - (0 | Ge[i >> 2])) | 0))
                            return (Ge[n >> 2] = -1e4), (s = 0 | Ge[n >> 2]), (Ze = t), 0 | s
                          return (
                            (Ge[(36 + (0 | Ge[o >> 2])) >> 2] = 0),
                            (Ge[(40 + (0 | Ge[o >> 2])) >> 2] = 0),
                            (Ge[(24 + (0 | Ge[o >> 2])) >> 2] = 0),
                            (Ge[(8 + (0 | Ge[o >> 2])) >> 2] = 0),
                            (Ge[(20 + (0 | Ge[o >> 2])) >> 2] = 0),
                            (Ge[(44 + (0 | Ge[o >> 2])) >> 2] = 0),
                            (r = 0 | x(43784)),
                            (Ge[a >> 2] = r),
                            (Ze =
                              ((s =
                                (0 | Ge[a >> 2]
                                  ? ((Ge[(28 + (0 | Ge[o >> 2])) >> 2] = Ge[a >> 2]),
                                    (Ge[Ge[a >> 2] >> 2] = 0),
                                    (Ge[(10992 + (0 | Ge[a >> 2])) >> 2] = 0),
                                    (Ge[(10996 + (0 | Ge[a >> 2])) >> 2] = 0),
                                    (Ge[(43780 + (0 | Ge[a >> 2])) >> 2] = 1),
                                    (Ge[(11e3 + (0 | Ge[a >> 2])) >> 2] = 1),
                                    (Ge[(11004 + (0 | Ge[a >> 2])) >> 2] = 0),
                                    (Ge[(11008 + (0 | Ge[a >> 2])) >> 2] = Ge[i >> 2]),
                                    (Ge[n >> 2] = 0))
                                  : (Ge[n >> 2] = -4),
                                0 | Ge[n >> 2])),
                              t)),
                            0 | s
                          )
                        })(a, -15)
                      )
                    ) {
                      if (
                        ((Ge[a >> 2] = F),
                        (Ge[y >> 2] = f),
                        (Ge[O >> 2] = v),
                        (Ge[R >> 2] = d),
                        (N =
                          1 ==
                          (0 |
                            (function (e, r, t, n) {
                              ;(e |= 0), (r |= 0), (t |= 0), (n |= 0)
                              var o = 0,
                                i = 0,
                                a = 0,
                                s = 0,
                                u = 0,
                                c = 0,
                                l = 0,
                                f = 0,
                                d = 0,
                                E = 0,
                                S = 0,
                                _ = 0,
                                m = 0,
                                h = 0,
                                p = 0,
                                F = 0,
                                M = 0,
                                b = 0
                              ;(0 | (Ze = ((o = Ze) + 64) | 0)) >= (0 | Je) && Qe(64)
                              if (
                                ((i = (o + 48) | 0),
                                (s = (o + 40) | 0),
                                (u = (o + 36) | 0),
                                (c = (o + 32) | 0),
                                (l = (o + 28) | 0),
                                (f = (o + 24) | 0),
                                (d = (o + 20) | 0),
                                (E = (o + 16) | 0),
                                (S = (o + 12) | 0),
                                (_ = (o + 8) | 0),
                                (m = (o + 4) | 0),
                                (Ge[(a = ((h = o) + 44) | 0) >> 2] = e),
                                (Ge[s >> 2] = r),
                                (Ge[u >> 2] = t),
                                (Ge[c >> 2] = n),
                                (Ge[E >> 2] = 8),
                                0 | Ge[a >> 2] && 0 | Ge[(28 + (0 | Ge[a >> 2])) >> 2])
                              ) {
                                if (
                                  (1 == (0 | Ge[s >> 2]) && (Ge[s >> 2] = 2),
                                  (0 != (0 | Ge[s >> 2])) & (2 != (0 | Ge[s >> 2])) & (4 != (0 | Ge[s >> 2])))
                                )
                                  return (Ge[i >> 2] = -2), (p = 0 | Ge[i >> 2]), (Ze = o), 0 | p
                                if (
                                  ((Ge[l >> 2] = Ge[(28 + (0 | Ge[a >> 2])) >> 2]),
                                  0 < (0 | Ge[(11008 + (0 | Ge[l >> 2])) >> 2]) && (Ge[E >> 2] = 1 | Ge[E >> 2]),
                                  (Ge[m >> 2] = Ge[(4 + (0 | Ge[a >> 2])) >> 2]),
                                  (Ge[d >> 2] = Ge[(11e3 + (0 | Ge[l >> 2])) >> 2]),
                                  ((Ge[(11e3 + (0 | Ge[l >> 2])) >> 2] = 0) | Ge[(43780 + (0 | Ge[l >> 2])) >> 2]) < 0)
                                )
                                  return (Ge[i >> 2] = -3), (p = 0 | Ge[i >> 2]), (Ze = o), 0 | p
                                if (4 != (0 | Ge[s >> 2]) && 0 != (0 | Ge[(11004 + (0 | Ge[l >> 2])) >> 2]))
                                  return (Ge[i >> 2] = -2), (p = 0 | Ge[i >> 2]), (Ze = o), 0 | p
                                if (
                                  ((n = (11004 + (0 | Ge[l >> 2])) | 0),
                                  (Ge[n >> 2] = Ge[n >> 2] | (4 == (0 | Ge[s >> 2]))),
                                  (4 == (0 | Ge[s >> 2])) & (0 != (0 | Ge[d >> 2])))
                                )
                                  return (
                                    (Ge[E >> 2] = 4 | Ge[E >> 2]),
                                    (Ge[S >> 2] = Ge[(4 + (0 | Ge[a >> 2])) >> 2]),
                                    (Ge[_ >> 2] = Ge[(16 + (0 | Ge[a >> 2])) >> 2]),
                                    (d =
                                      0 |
                                      L(
                                        0 | Ge[l >> 2],
                                        0 | Ge[Ge[a >> 2] >> 2],
                                        S,
                                        0 | Ge[(12 + (0 | Ge[a >> 2])) >> 2],
                                        0 | Ge[(12 + (0 | Ge[a >> 2])) >> 2],
                                        _,
                                        0 | Ge[E >> 2],
                                        0 | Ge[u >> 2],
                                        0 | Ge[c >> 2]
                                      )),
                                    (Ge[h >> 2] = d),
                                    (Ge[(43780 + (0 | Ge[l >> 2])) >> 2] = Ge[h >> 2]),
                                    (d = 0 | Ge[a >> 2]),
                                    (Ge[d >> 2] = (0 | Ge[d >> 2]) + (0 | Ge[S >> 2])),
                                    (d = (4 + (0 | Ge[a >> 2])) | 0),
                                    (Ge[d >> 2] = (0 | Ge[d >> 2]) - (0 | Ge[S >> 2])),
                                    (d = (8 + (0 | Ge[a >> 2])) | 0),
                                    (Ge[d >> 2] = (0 | Ge[d >> 2]) + (0 | Ge[S >> 2])),
                                    (Ge[(40 + (0 | Ge[a >> 2])) >> 2] = Ge[(28 + (0 | Ge[l >> 2])) >> 2]),
                                    (d = (12 + (0 | Ge[a >> 2])) | 0),
                                    (Ge[d >> 2] = (0 | Ge[d >> 2]) + (0 | Ge[_ >> 2])),
                                    (d = (16 + (0 | Ge[a >> 2])) | 0),
                                    (Ge[d >> 2] = (0 | Ge[d >> 2]) - (0 | Ge[_ >> 2])),
                                    (d = (20 + (0 | Ge[a >> 2])) | 0),
                                    (Ge[d >> 2] = (0 | Ge[d >> 2]) + (0 | Ge[_ >> 2])),
                                    (Ze =
                                      ((p =
                                        ((0 | Ge[h >> 2]) < 0
                                          ? (Ge[i >> 2] = -3)
                                          : 0 | Ge[h >> 2]
                                            ? ((Ge[(43780 + (0 | Ge[l >> 2])) >> 2] = -1), (Ge[i >> 2] = -5))
                                            : (Ge[i >> 2] = 1),
                                        0 | Ge[i >> 2])),
                                      o)),
                                    0 | p
                                  )
                                if (
                                  (4 != (0 | Ge[s >> 2]) && (Ge[E >> 2] = 2 | Ge[E >> 2]),
                                  0 | Ge[(10996 + (0 | Ge[l >> 2])) >> 2])
                                )
                                  return (
                                    (Ge[f >> 2] =
                                      Ge[
                                        ((0 | Ge[(10996 + (0 | Ge[l >> 2])) >> 2]) >>> 0 <
                                        (0 | Ge[(16 + (0 | Ge[a >> 2])) >> 2]) >>> 0
                                          ? (10996 + (0 | Ge[l >> 2])) | 0
                                          : (16 + (0 | Ge[a >> 2])) | 0) >> 2
                                      ]),
                                    tr(
                                      0 | Ge[(12 + (0 | Ge[a >> 2])) >> 2],
                                      (11012 + (0 | Ge[l >> 2]) + (0 | Ge[(10992 + (0 | Ge[l >> 2])) >> 2])) | 0,
                                      0 | Ge[f >> 2]
                                    ),
                                    (d = (12 + (0 | Ge[a >> 2])) | 0),
                                    (Ge[d >> 2] = (0 | Ge[d >> 2]) + (0 | Ge[f >> 2])),
                                    (d = (16 + (0 | Ge[a >> 2])) | 0),
                                    (Ge[d >> 2] = (0 | Ge[d >> 2]) - (0 | Ge[f >> 2])),
                                    (d = (20 + (0 | Ge[a >> 2])) | 0),
                                    (Ge[d >> 2] = (0 | Ge[d >> 2]) + (0 | Ge[f >> 2])),
                                    (d = (10996 + (0 | Ge[l >> 2])) | 0),
                                    (Ge[d >> 2] = (0 | Ge[d >> 2]) - (0 | Ge[f >> 2])),
                                    (Ge[(10992 + (0 | Ge[l >> 2])) >> 2] =
                                      ((0 | Ge[(10992 + (0 | Ge[l >> 2])) >> 2]) + (0 | Ge[f >> 2])) & 32767),
                                    (F =
                                      0 | Ge[(43780 + (0 | Ge[l >> 2])) >> 2]
                                        ? 0
                                        : (0 != (0 | Ge[(10996 + (0 | Ge[l >> 2])) >> 2])) ^ 1),
                                    (Ge[i >> 2] = F ? 1 : 0),
                                    (p = 0 | Ge[i >> 2]),
                                    (Ze = o),
                                    0 | p
                                  )
                                for (;;) {
                                  if (
                                    ((Ge[S >> 2] = Ge[(4 + (0 | Ge[a >> 2])) >> 2]),
                                    (Ge[_ >> 2] = 32768 - (0 | Ge[(10992 + (0 | Ge[l >> 2])) >> 2])),
                                    (F =
                                      0 |
                                      L(
                                        0 | Ge[l >> 2],
                                        0 | Ge[Ge[a >> 2] >> 2],
                                        S,
                                        (11012 + (0 | Ge[l >> 2])) | 0,
                                        (11012 + (0 | Ge[l >> 2]) + (0 | Ge[(10992 + (0 | Ge[l >> 2])) >> 2])) | 0,
                                        _,
                                        0 | Ge[E >> 2],
                                        0 | Ge[u >> 2],
                                        0 | Ge[c >> 2]
                                      )),
                                    (Ge[h >> 2] = F),
                                    (Ge[(43780 + (0 | Ge[l >> 2])) >> 2] = Ge[h >> 2]),
                                    (F = 0 | Ge[a >> 2]),
                                    (Ge[F >> 2] = (0 | Ge[F >> 2]) + (0 | Ge[S >> 2])),
                                    (F = (4 + (0 | Ge[a >> 2])) | 0),
                                    (Ge[F >> 2] = (0 | Ge[F >> 2]) - (0 | Ge[S >> 2])),
                                    (F = (8 + (0 | Ge[a >> 2])) | 0),
                                    (Ge[F >> 2] = (0 | Ge[F >> 2]) + (0 | Ge[S >> 2])),
                                    (Ge[(40 + (0 | Ge[a >> 2])) >> 2] = Ge[(28 + (0 | Ge[l >> 2])) >> 2]),
                                    (Ge[(10996 + (0 | Ge[l >> 2])) >> 2] = Ge[_ >> 2]),
                                    (Ge[f >> 2] =
                                      Ge[
                                        ((0 | Ge[(10996 + (0 | Ge[l >> 2])) >> 2]) >>> 0 <
                                        (0 | Ge[(16 + (0 | Ge[a >> 2])) >> 2]) >>> 0
                                          ? (10996 + (0 | Ge[l >> 2])) | 0
                                          : (16 + (0 | Ge[a >> 2])) | 0) >> 2
                                      ]),
                                    tr(
                                      0 | Ge[(12 + (0 | Ge[a >> 2])) >> 2],
                                      (11012 + (0 | Ge[l >> 2]) + (0 | Ge[(10992 + (0 | Ge[l >> 2])) >> 2])) | 0,
                                      0 | Ge[f >> 2]
                                    ),
                                    (F = (12 + (0 | Ge[a >> 2])) | 0),
                                    (Ge[F >> 2] = (0 | Ge[F >> 2]) + (0 | Ge[f >> 2])),
                                    (F = (16 + (0 | Ge[a >> 2])) | 0),
                                    (Ge[F >> 2] = (0 | Ge[F >> 2]) - (0 | Ge[f >> 2])),
                                    (F = (20 + (0 | Ge[a >> 2])) | 0),
                                    (Ge[F >> 2] = (0 | Ge[F >> 2]) + (0 | Ge[f >> 2])),
                                    (F = (10996 + (0 | Ge[l >> 2])) | 0),
                                    (Ge[F >> 2] = (0 | Ge[F >> 2]) - (0 | Ge[f >> 2])),
                                    (Ge[(10992 + (0 | Ge[l >> 2])) >> 2] =
                                      ((0 | Ge[(10992 + (0 | Ge[l >> 2])) >> 2]) + (0 | Ge[f >> 2])) & 32767),
                                    (0 | Ge[h >> 2]) < 0)
                                  ) {
                                    M = 27
                                    break
                                  }
                                  if (!((1 != (0 | Ge[h >> 2])) | (0 != (0 | Ge[m >> 2])))) {
                                    M = 29
                                    break
                                  }
                                  if (((F = 0 == (0 | Ge[h >> 2])), 4 == (0 | Ge[s >> 2]))) {
                                    if (F) {
                                      M = 32
                                      break
                                    }
                                    if (0 | Ge[(16 + (0 | Ge[a >> 2])) >> 2]) continue
                                    M = 34
                                    break
                                  }
                                  if (F) {
                                    M = 39
                                    break
                                  }
                                  if (!(0 | Ge[(4 + (0 | Ge[a >> 2])) >> 2])) {
                                    M = 39
                                    break
                                  }
                                  if (!(0 | Ge[(16 + (0 | Ge[a >> 2])) >> 2])) {
                                    M = 39
                                    break
                                  }
                                  if (0 | Ge[(10996 + (0 | Ge[l >> 2])) >> 2]) {
                                    M = 39
                                    break
                                  }
                                }
                                if (27 == (0 | M)) return (Ge[i >> 2] = -3), (p = 0 | Ge[i >> 2]), (Ze = o), 0 | p
                                if (29 == (0 | M)) return (Ge[i >> 2] = -5), (p = 0 | Ge[i >> 2]), (Ze = o), 0 | p
                                if (32 == (0 | M))
                                  return (
                                    (Ge[i >> 2] = 0 | Ge[(10996 + (0 | Ge[l >> 2])) >> 2] ? -5 : 1),
                                    (p = 0 | Ge[i >> 2]),
                                    (Ze = o),
                                    0 | p
                                  )
                                if (34 == (0 | M)) return (Ge[i >> 2] = -5), (p = 0 | Ge[i >> 2]), (Ze = o), 0 | p
                                if (39 == (0 | M))
                                  return (
                                    (b = 0 | Ge[h >> 2] ? 0 : (0 != (0 | Ge[(10996 + (0 | Ge[l >> 2])) >> 2])) ^ 1),
                                    (Ge[i >> 2] = b ? 1 : 0),
                                    (p = 0 | Ge[i >> 2]),
                                    (Ze = o),
                                    0 | p
                                  )
                              }
                              return (Ge[i >> 2] = -2), (p = 0 | Ge[i >> 2]), (Ze = o), 0 | p
                            })(a, 4, k, T))),
                        (function (e) {
                          e |= 0
                          var r = 0,
                            t = 0,
                            n = 0
                          if (
                            ((0 | (Ze = ((r = Ze) + 16) | 0)) >= (0 | Je) && Qe(16),
                            (t = (r + 4) | 0),
                            (Ge[(n = r) >> 2] = e),
                            !(0 | Ge[n >> 2]))
                          )
                            return (Ge[t >> 2] = -2), Ge[t >> 2], (Ze = r)
                          0 | Ge[(28 + (0 | Ge[n >> 2])) >> 2] &&
                            (B(0 | Ge[(28 + (0 | Ge[n >> 2])) >> 2]), (Ge[(28 + (0 | Ge[n >> 2])) >> 2] = 0)),
                            (Ge[t >> 2] = 0),
                            Ge[t >> 2],
                            (Ze = r)
                        })(a),
                        !N)
                      ) {
                        B(v)
                        break
                      }
                      if (
                        (0 |
                          (N =
                            0 |
                            (function (e, r, t) {
                              ;(e |= 0), (r |= 0), (t |= 0)
                              var n = 0,
                                o = 0,
                                i = 0,
                                a = 0,
                                s = 0,
                                u = 0,
                                c = 0,
                                l = 0,
                                f = 0
                              ;(0 | (Ze = ((n = Ze) + 32) | 0)) >= (0 | Je) && Qe(32)
                              if (
                                ((o = (n + 20) | 0),
                                (a = (n + 12) | 0),
                                (s = (n + 8) | 0),
                                (u = (n + 4) | 0),
                                (l = ((c = n) + 24) | 0),
                                (Ge[(i = (n + 16) | 0) >> 2] = e),
                                (Ge[a >> 2] = r),
                                (Ge[s >> 2] = t),
                                (Ge[u >> 2] = Ge[a >> 2]),
                                (Ge[c >> 2] = Ge[i >> 2]),
                                !(0 | Ge[u >> 2]))
                              )
                                return (Ge[o >> 2] = 0), (f = 0 | Ge[o >> 2]), (Ze = n), 0 | f
                              Ge[c >> 2] = ~Ge[c >> 2]
                              for (; (i = 0 | Ge[s >> 2]), (Ge[s >> 2] = i - 1), i; )
                                (i = 0 | Ge[u >> 2]),
                                  (Ge[u >> 2] = 1 + i),
                                  (Xe[l >> 0] = 0 | Xe[i >> 0]),
                                  (Ge[c >> 2] =
                                    ((0 | Ge[c >> 2]) >>> 4) ^
                                    Ge[(8 + (((15 & Ge[c >> 2]) ^ (15 & (0 | qe[l >> 0]))) << 2)) >> 2]),
                                  (Ge[c >> 2] =
                                    ((0 | Ge[c >> 2]) >>> 4) ^
                                    Ge[(8 + (((15 & Ge[c >> 2]) ^ ((0 | qe[l >> 0]) >> 4)) << 2)) >> 2])
                              return (Ge[o >> 2] = ~Ge[c >> 2]), (f = 0 | Ge[o >> 2]), (Ze = n), 0 | f
                            })(0, v, d))) ==
                        (0 | l)
                      ) {
                        P(0, 0 | u, 0 | d, 0 | v), B(v)
                        break
                      }
                      ;(Ge[o >> 2] = N), (Ge[(4 + o) >> 2] = l), ie(1175, o), B(v)
                      break
                    }
                  } while ((B(v), 0))
                }
                if (
                  ((M = 10),
                  (function (e, r) {
                    var t = 0,
                      n = 0,
                      o = 0,
                      i = 0,
                      a = 0,
                      s = 0
                    ;(n = t = 255 & (e |= 0)),
                      0 <= (0 | Ge[(76 + (r |= 0)) >> 2]) && 0 != (0 | V())
                        ? ((a =
                            (0 | n) != (0 | Xe[(r + 75) >> 0]) &&
                            (i = 0 | Ge[(o = (r + 20) | 0) >> 2]) >>> 0 < (0 | Ge[(r + 16) >> 2]) >>> 0
                              ? ((Ge[o >> 2] = i + 1), (Xe[i >> 0] = t), n)
                              : 0 | J(r, e)),
                          K())
                        : (s = 3)
                    do {
                      if (3 == (0 | s)) {
                        if (
                          (0 | n) != (0 | Xe[(r + 75) >> 0]) &&
                          (i = 0 | Ge[(a = (r + 20) | 0) >> 2]) >>> 0 < (0 | Ge[(r + 16) >> 2]) >>> 0
                        ) {
                          ;(Ge[a >> 2] = i + 1), (Xe[i >> 0] = t), 0
                          break
                        }
                        J(r, e)
                      }
                    } while (0)
                  })((M |= 0), 0 | Ge[208]),
                  33639248 !=
                    (((0 | qe[((g = (g + (46 + E + _ + S)) | 0) + 3) >> 0]) << 24) |
                      (((0 | qe[(g + 2) >> 0]) << 16) | (((0 | qe[(g + 1) >> 0]) << 8) | 0 | qe[g >> 0])) |
                      0))
                )
                  break r
                T = (d + T) | 0
              }
              return (Ge[n >> 2] = 240), ie(967, n), B(0 | Ge[s >> 2]), (Ze = r), 0
            }
          } while (0)
          return C(1), (Ge[t >> 2] = 307), ie(967, t), B(0 | Ge[s >> 2]), (Ze = r), 0
        }
      } while (0)
      return (Ge[i >> 2] = 188), ie(967, i), B(0 | Ge[s >> 2]), (Ze = r), 0
    }
    function L(e, r, t, n, o, i, a, s, u) {
      ;(e |= 0), (r |= 0), (t |= 0), (n |= 0), (o |= 0), (i |= 0), (a |= 0), (s |= 0), (u |= 0)
      var c,
        l,
        f,
        d,
        E,
        S,
        _,
        m,
        h,
        p,
        F,
        M,
        b,
        y,
        O,
        w,
        R,
        A,
        k,
        T,
        g,
        v,
        N,
        D,
        P,
        C,
        I,
        L,
        x,
        B,
        H,
        U,
        Y,
        z,
        V,
        K,
        W,
        X,
        j,
        G,
        q,
        Z,
        J,
        Q,
        $,
        ee,
        re,
        te,
        ne,
        oe,
        ie,
        ae,
        se,
        ue,
        ce,
        le,
        fe,
        de,
        Ee,
        Se,
        _e,
        me,
        he,
        pe,
        Fe,
        Me,
        be,
        ye,
        Oe,
        we,
        Re,
        Ae,
        ke,
        Te = 0,
        ge = 0,
        ve = 0,
        Ne = 0,
        De = 0,
        Pe = 0,
        Ce = 0,
        Ie = 0,
        Le = 0,
        xe = 0,
        Be = 0,
        He = 0,
        Ue = 0,
        Ye = 0,
        ze = 0,
        Ve = 0,
        Ke = 0,
        We = Ze
      if (
        ((0 | Je) <= (0 | (Ze = (Ze + 432) | 0)) && Qe(432),
        (c = (We + 416) | 0),
        (f = (We + 408) | 0),
        (d = (We + 404) | 0),
        (E = (We + 400) | 0),
        (Te = (We + 396) | 0),
        (S = (We + 392) | 0),
        (_ = (We + 388) | 0),
        (m = (We + 384) | 0),
        (h = (We + 380) | 0),
        (p = (We + 376) | 0),
        (F = (We + 372) | 0),
        (M = (We + 368) | 0),
        (b = (We + 364) | 0),
        (y = (We + 360) | 0),
        (O = (We + 356) | 0),
        (w = (We + 352) | 0),
        (R = (We + 348) | 0),
        (A = (We + 344) | 0),
        (k = (We + 340) | 0),
        (T = (We + 336) | 0),
        (g = (We + 332) | 0),
        (v = (We + 328) | 0),
        (N = (We + 324) | 0),
        (D = (We + 320) | 0),
        (P = (We + 316) | 0),
        (C = (We + 312) | 0),
        (I = (We + 308) | 0),
        (L = (We + 304) | 0),
        (x = (We + 300) | 0),
        (B = (We + 296) | 0),
        (H = (We + 292) | 0),
        (U = (We + 288) | 0),
        (Y = (We + 284) | 0),
        (z = (We + 280) | 0),
        (V = (We + 276) | 0),
        (K = (We + 272) | 0),
        (W = (We + 268) | 0),
        (X = (We + 264) | 0),
        (j = (We + 260) | 0),
        (G = (We + 192) | 0),
        (q = (We + 128) | 0),
        (Z = (We + 120) | 0),
        (J = (We + 116) | 0),
        (Q = (We + 112) | 0),
        ($ = (We + 108) | 0),
        (ee = (We + 420) | 0),
        (re = (We + 104) | 0),
        (te = (We + 100) | 0),
        (ne = (We + 96) | 0),
        (oe = (We + 92) | 0),
        (ie = (We + 88) | 0),
        (ae = (We + 84) | 0),
        (se = (We + 80) | 0),
        (ue = (We + 76) | 0),
        (ce = (We + 72) | 0),
        (le = (We + 68) | 0),
        (fe = (We + 64) | 0),
        (de = (We + 60) | 0),
        (Ee = (We + 56) | 0),
        (Se = (We + 52) | 0),
        (_e = (We + 48) | 0),
        (me = (We + 44) | 0),
        (he = (We + 40) | 0),
        (pe = (We + 36) | 0),
        (Fe = (We + 32) | 0),
        (Me = (We + 28) | 0),
        (be = (We + 24) | 0),
        (ye = (We + 20) | 0),
        (Oe = (We + 16) | 0),
        (we = (We + 12) | 0),
        (Re = (We + 8) | 0),
        (Ae = (We + 4) | 0),
        (Ge[(l = ((ke = We) + 412) | 0) >> 2] = e),
        (Ge[f >> 2] = r),
        (Ge[d >> 2] = t),
        (Ge[E >> 2] = n),
        (Ge[Te >> 2] = o),
        (Ge[S >> 2] = i),
        (Ge[_ >> 2] = a),
        (Ge[m >> 2] = s),
        (Ge[h >> 2] = u),
        (Ge[p >> 2] = -1),
        (Ge[w >> 2] = Ge[f >> 2]),
        (Ge[R >> 2] = (0 | Ge[f >> 2]) + (0 | Ge[Ge[d >> 2] >> 2])),
        (Ge[A >> 2] = Ge[Te >> 2]),
        (Ge[k >> 2] = (0 | Ge[Te >> 2]) + (0 | Ge[Ge[S >> 2] >> 2])),
        (ge = (4 & Ge[_ >> 2]) | 0 ? -1 : ((0 | Ge[Te >> 2]) - (0 | Ge[E >> 2]) + (0 | Ge[Ge[S >> 2] >> 2]) - 1) | 0),
        (Ge[T >> 2] = ge),
        0 == (((1 + (0 | Ge[T >> 2])) & Ge[T >> 2]) | 0) && (0 | Ge[Te >> 2]) >>> 0 >= (0 | Ge[E >> 2]) >>> 0)
      ) {
        switch (
          ((Ge[F >> 2] = Ge[(4 + (0 | Ge[l >> 2])) >> 2]),
          (Ge[O >> 2] = Ge[(56 + (0 | Ge[l >> 2])) >> 2]),
          (Ge[M >> 2] = Ge[(32 + (0 | Ge[l >> 2])) >> 2]),
          (Ge[b >> 2] = Ge[(36 + (0 | Ge[l >> 2])) >> 2]),
          (Ge[y >> 2] = Ge[(40 + (0 | Ge[l >> 2])) >> 2]),
          (Ge[g >> 2] = Ge[(60 + (0 | Ge[l >> 2])) >> 2]),
          0 | Ge[Ge[l >> 2] >> 2])
        ) {
          case 0:
            ;(Ge[(12 + (0 | Ge[l >> 2])) >> 2] = 0),
              (Ge[(8 + (0 | Ge[l >> 2])) >> 2] = 0),
              (Ge[y >> 2] = 0),
              (Ge[b >> 2] = 0),
              (Ge[M >> 2] = 0),
              (Ge[F >> 2] = 0),
              (Ge[O >> 2] = 0),
              (Ge[(28 + (0 | Ge[l >> 2])) >> 2] = 1),
              (ve =
                ((Ge[(16 + (0 | Ge[l >> 2])) >> 2] = 1) & Ge[_ >> 2]) | 0
                  ? (0 | Ge[w >> 2]) >>> 0 >= (0 | Ge[R >> 2]) >>> 0
                    ? 9
                    : ((ge = 0 | Ge[w >> 2]), (Ge[w >> 2] = ge + 1), (Ne = 0 | qe[ge >> 0]), (De = 0 | Ge[l >> 2]), 15)
                  : 31)
            break
          case 1:
            ve =
              (0 | Ge[w >> 2]) >>> 0 < (0 | Ge[R >> 2]) >>> 0
                ? ((ge = 0 | Ge[w >> 2]), (Ge[w >> 2] = ge + 1), (Ne = 0 | qe[ge >> 0]), (De = 0 | Ge[l >> 2]), 15)
                : 9
            break
          case 2:
            ve =
              (0 | Ge[w >> 2]) >>> 0 < (0 | Ge[R >> 2]) >>> 0
                ? ((ge = 0 | Ge[w >> 2]), (Ge[w >> 2] = ge + 1), (Pe = 0 | Ge[l >> 2]), (Ce = 0 | qe[ge >> 0]), 22)
                : 16
            break
          case 36:
            ve = 30
            break
          case 3:
            ve =
              (0 | Ge[w >> 2]) >>> 0 < (0 | Ge[R >> 2]) >>> 0
                ? ((ge = 0 | Ge[w >> 2]), (Ge[w >> 2] = ge + 1), (Ge[v >> 2] = qe[ge >> 0]), 39)
                : 33
            break
          case 5:
            ve =
              (0 | Ge[w >> 2]) >>> 0 < (0 | Ge[R >> 2]) >>> 0
                ? ((ge = 0 | Ge[w >> 2]), (Ge[w >> 2] = ge + 1), (Ge[N >> 2] = qe[ge >> 0]), 49)
                : 43
            break
          case 6:
            ve =
              (0 | Ge[w >> 2]) >>> 0 < (0 | Ge[R >> 2]) >>> 0
                ? ((ge = 0 | Ge[w >> 2]), (Ge[w >> 2] = ge + 1), (Ge[D >> 2] = qe[ge >> 0]), 61)
                : 55
            break
          case 7:
            ve =
              (0 | Ge[w >> 2]) >>> 0 < (0 | Ge[R >> 2]) >>> 0
                ? ((ge = 0 | Ge[w >> 2]),
                  (Ge[w >> 2] = ge + 1),
                  (Ie = 0 | Xe[ge >> 0]),
                  (Le = 0 | Ge[b >> 2]),
                  (xe = 0 | Ge[l >> 2]),
                  70)
                : 64
            break
          case 39:
            ve = 73
            break
          case 51:
            ve =
              (0 | Ge[w >> 2]) >>> 0 < (0 | Ge[R >> 2]) >>> 0
                ? ((ge = 0 | Ge[w >> 2]), (Ge[w >> 2] = ge + 1), (Ge[P >> 2] = qe[ge >> 0]), 83)
                : 77
            break
          case 52:
            ve = 85
            break
          case 9:
            ve = 89
            break
          case 38:
            ve = 91
            break
          case 40:
            ve = 94
            break
          case 10:
            ve = 100
            break
          case 11:
            ve =
              (0 | Ge[w >> 2]) >>> 0 < (0 | Ge[R >> 2]) >>> 0
                ? ((ge = 0 | Ge[w >> 2]), (Ge[w >> 2] = ge + 1), (Ge[x >> 2] = qe[ge >> 0]), 121)
                : 115
            break
          case 14:
            ve =
              (0 | Ge[w >> 2]) >>> 0 < (0 | Ge[R >> 2]) >>> 0
                ? ((ge = 0 | Ge[w >> 2]), (Ge[w >> 2] = ge + 1), (Ge[H >> 2] = qe[ge >> 0]), 133)
                : 127
            break
          case 35:
            ve = 144
            break
          case 16:
            ve =
              (0 | Ge[w >> 2]) >>> 0 < (0 | Ge[R >> 2]) >>> 0
                ? ((ge = 0 | Ge[w >> 2]), (Ge[w >> 2] = ge + 1), (Ge[oe >> 2] = qe[ge >> 0]), 185)
                : 179
            break
          case 17:
            ve = 194
            break
          case 18:
            ve =
              (0 | Ge[w >> 2]) >>> 0 < (0 | Ge[R >> 2]) >>> 0
                ? ((ge = 0 | Ge[w >> 2]), (Ge[w >> 2] = ge + 1), (Ge[ie >> 2] = qe[ge >> 0]), 203)
                : 197
            break
          case 21:
            ve = 208
            break
          case 23:
            ve =
              (0 | Ge[w >> 2]) >>> 0 < (0 | Ge[R >> 2]) >>> 0
                ? ((ge = 0 | Ge[w >> 2]), (Ge[w >> 2] = ge + 1), (Ge[ce >> 2] = qe[ge >> 0]), 231)
                : 225
            break
          case 24:
            ve = 238
            break
          case 25:
            ve =
              (0 | Ge[w >> 2]) >>> 0 < (0 | Ge[R >> 2]) >>> 0
                ? ((ge = 0 | Ge[w >> 2]), (Ge[w >> 2] = ge + 1), (Ge[Ee >> 2] = qe[ge >> 0]), 267)
                : 261
            break
          case 26:
            ve =
              (0 | Ge[w >> 2]) >>> 0 < (0 | Ge[R >> 2]) >>> 0
                ? ((ge = 0 | Ge[w >> 2]), (Ge[w >> 2] = ge + 1), (Ge[me >> 2] = qe[ge >> 0]), 286)
                : 280
            break
          case 27:
            ve =
              (0 | Ge[w >> 2]) >>> 0 < (0 | Ge[R >> 2]) >>> 0
                ? ((ge = 0 | Ge[w >> 2]), (Ge[w >> 2] = ge + 1), (Ge[pe >> 2] = qe[ge >> 0]), 301)
                : 295
            break
          case 37:
            ve = 305
            break
          case 53:
            ve = 308
            break
          case 32:
            ve =
              (0 | Ge[w >> 2]) >>> 0 < (0 | Ge[R >> 2]) >>> 0
                ? ((ge = 0 | Ge[w >> 2]), (Ge[w >> 2] = ge + 1), (Ge[Fe >> 2] = qe[ge >> 0]), 326)
                : 320
            break
          case 41:
            ve =
              (0 | Ge[w >> 2]) >>> 0 < (0 | Ge[R >> 2]) >>> 0
                ? ((ge = 0 | Ge[w >> 2]), (Ge[w >> 2] = ge + 1), (Ge[be >> 2] = qe[ge >> 0]), 338)
                : 332
            break
          case 42:
            ve =
              (0 | Ge[w >> 2]) >>> 0 < (0 | Ge[R >> 2]) >>> 0
                ? ((ge = 0 | Ge[w >> 2]), (Ge[w >> 2] = ge + 1), (Ge[Me >> 2] = qe[ge >> 0]), 347)
                : 341
            break
          case 34:
            ve = 348
            break
          default:
            ve = 350
        }
        do {
          if (9 == (0 | ve)) {
            if ((2 & Ge[_ >> 2]) | 0) {
              ;(Be = Ge[p >> 2] = 1), (He = 0 | Ge[l >> 2]), (ve = 349)
              break
            }
            ;(De = (Ne = 0) | Ge[l >> 2]), (ve = 15)
            break
          }
        } while (0)
        15 == (0 | ve) &&
          ((Ge[(De + 8) >> 2] = Ne),
          (ve =
            (0 | Ge[w >> 2]) >>> 0 >= (0 | Ge[R >> 2]) >>> 0
              ? 16
              : ((Ne = 0 | Ge[w >> 2]), (Ge[w >> 2] = Ne + 1), (Pe = 0 | Ge[l >> 2]), (Ce = 0 | qe[Ne >> 0]), 22)))
        do {
          if (16 == (0 | ve)) {
            if ((2 & Ge[_ >> 2]) | 0) {
              ;(Ge[p >> 2] = 1), (He = 0 | Ge[l >> (Be = 2)]), (ve = 349)
              break
            }
            ;(Pe = 0 | Ge[l >> 2]), (Ce = 0), (ve = 22)
            break
          }
        } while (0)
        22 == (0 | ve) &&
          ((Ge[(Pe + 12) >> 2] = Ce),
          (Ue =
            ((((Ge[(8 + (0 | Ge[l >> 2])) >> 2] << 8) + (0 | Ge[(12 + (0 | Ge[l >> 2])) >> 2])) | 0) >>> 0) % 31 | 0 ||
            (32 & Ge[(12 + (0 | Ge[l >> 2])) >> 2]) | 0
              ? 1
              : 8 != ((15 & Ge[(8 + (0 | Ge[l >> 2])) >> 2]) | 0)),
          (Ge[b >> 2] = 1 & Ue),
          4 & Ge[_ >> 2] ||
            ((Ye =
              32768 < (1 << (8 + ((0 | Ge[(8 + (0 | Ge[l >> 2])) >> 2]) >>> 4))) >>> 0
                ? 1
                : ((1 + (0 | Ge[T >> 2])) | 0) >>> 0 <
                  (1 << (8 + ((0 | Ge[(8 + (0 | Ge[l >> 2])) >> 2]) >>> 4))) >>> 0),
            (Ge[b >> 2] = Ge[b >> 2] | (1 & Ye))),
          (ve = 0 | Ge[b >> 2] ? 30 : 31)),
          30 == (0 | ve) && ((Ge[p >> 2] = -1), (Be = 36), (He = 0 | Ge[l >> 2]), (ve = 349))
        e: for (;;) {
          switch (0 | ve) {
            case 31:
              $e(2, (((ve = 0) | Ge[h >> 2]) + (0 | Ge[g >> 2])) | 0, 0 | Ge[m >> 2]),
                (ve = (0 | Ge[F >> 2]) >>> 0 < 3 ? 32 : 40)
              break
            case 33:
              if (((ve = 0), (2 & Ge[_ >> 2]) | 0)) {
                ;(Ge[p >> 2] = 1), (Be = 3), (He = 0 | Ge[l >> 2]), (ve = 349)
                continue e
              }
              ;(Ge[v >> 2] = 0), (ve = 39)
              continue e
            case 39:
              ;(ve = 0),
                (Ge[O >> 2] = Ge[O >> 2] | (Ge[v >> 2] << Ge[F >> 2])),
                (Ge[F >> 2] = 8 + (0 | Ge[F >> 2])),
                (ve = (0 | Ge[F >> 2]) >>> 0 < 3 ? 32 : 40)
              break
            case 43:
              if (((ve = 0), (2 & Ge[_ >> 2]) | 0)) {
                ;(Ge[p >> 2] = 1), (Be = 5), (He = 0 | Ge[l >> 2]), (ve = 349)
                continue e
              }
              ;(Ge[N >> 2] = 0), (ve = 49)
              continue e
            case 49:
              ;(ve = 0),
                (Ge[O >> 2] = Ge[O >> 2] | (Ge[N >> 2] << Ge[F >> 2])),
                (Ge[F >> 2] = 8 + (0 | Ge[F >> 2])),
                (ve = (0 | Ge[F >> 2]) >>> 0 < (7 & Ge[F >> 2]) >>> 0 ? 42 : 50)
              break
            case 55:
              if (((ve = 0), (2 & Ge[_ >> 2]) | 0)) {
                ;(Ge[p >> 2] = 1), (Be = 6), (He = 0 | Ge[l >> 2]), (ve = 349)
                continue e
              }
              ;(Ge[D >> 2] = 0), (ve = 61)
              continue e
            case 61:
              ;(ve = 0),
                (Ge[O >> 2] = Ge[O >> 2] | (Ge[D >> 2] << Ge[F >> 2])),
                (Ge[F >> 2] = 8 + (0 | Ge[F >> 2])),
                (ve = (0 | Ge[F >> 2]) >>> 0 < 8 ? 54 : 62)
              break
            case 64:
              if (((ve = 0), (2 & Ge[_ >> 2]) | 0)) {
                ;(Ge[p >> 2] = 1), (Be = 7), (He = 0 | Ge[l >> 2]), (ve = 349)
                continue e
              }
              ;(Le = (Ie = 0) | Ge[b >> 2]), (xe = 0 | Ge[l >> 2]), (ve = 70)
              continue e
            case 70:
              ;(Xe[(xe + 10528 + Le) >> (ve = 0)] = Ie), (ve = 71)
              break
            case 73:
              ;(ve = 0), (Ge[p >> 2] = -1), (Be = 39), (He = 0 | Ge[l >> 2]), (ve = 349)
              continue e
            case 77:
              if (((ve = 0), (2 & Ge[_ >> 2]) | 0)) {
                ;(Ge[p >> 2] = 1), (Be = 51), (He = 0 | Ge[l >> 2]), (ve = 349)
                continue e
              }
              ;(Ge[P >> 2] = 0), (ve = 83)
              continue e
            case 83:
              ;(ve = 0),
                (Ge[O >> 2] = Ge[O >> 2] | (Ge[P >> 2] << Ge[F >> 2])),
                (Ge[F >> 2] = 8 + (0 | Ge[F >> 2])),
                (ve = (0 | Ge[F >> 2]) >>> 0 < 8 ? 76 : 84)
              break
            case 85:
              if (((ve = 0) | Ge[A >> 2]) >>> 0 >= (0 | Ge[k >> 2]) >>> 0) {
                ;(Ge[p >> 2] = 2), (Be = 52), (He = 0 | Ge[l >> 2]), (ve = 349)
                continue e
              }
              ;(Ye = 255 & Ge[M >> 2]),
                (Ue = 0 | Ge[A >> 2]),
                (Ge[A >> 2] = Ue + 1),
                (Xe[Ue >> 0] = Ye),
                (Ge[b >> 2] = (0 | Ge[b >> 2]) - 1),
                (ve = 74)
              break
            case 89:
              if (((ve = 0) | Ge[A >> 2]) >>> 0 < (0 | Ge[k >> 2]) >>> 0) {
                ve = 91
                continue e
              }
              ;(Ge[p >> 2] = 2), (Be = 9), (He = 0 | Ge[l >> 2]), (ve = 349)
              continue e
            case 91:
              if (((ve = 0) | Ge[w >> 2]) >>> 0 >= (0 | Ge[R >> 2]) >>> 0) {
                if (!(2 & Ge[_ >> 2])) {
                  ve = 94
                  continue e
                }
                ;(Ge[p >> 2] = 1), (Be = 38), (He = 0 | Ge[l >> 2]), (ve = 349)
                continue e
              }
              ;(ze =
                ((((Ye =
                  (((0 | Ge[k >> 2]) - (0 | Ge[A >> 2])) | 0) >>> 0 < (((0 | Ge[R >> 2]) - (0 | Ge[w >> 2])) | 0) >>> 0)
                  ? 0 | Ge[k >> 2]
                  : 0 | Ge[R >> 2]) -
                  (Ye ? 0 | Ge[A >> 2] : 0 | Ge[w >> 2])) |
                  0) >>>
                  0 <
                (0 | Ge[b >> 2]) >>> 0
                  ? (((Ye =
                      (((0 | Ge[k >> 2]) - (0 | Ge[A >> 2])) | 0) >>> 0 <
                      (((0 | Ge[R >> 2]) - (0 | Ge[w >> 2])) | 0) >>> 0)
                      ? 0 | Ge[k >> 2]
                      : 0 | Ge[R >> 2]) -
                      (Ye ? 0 | Ge[A >> 2] : 0 | Ge[w >> 2])) |
                    0
                  : 0 | Ge[b >> 2]),
                (Ge[C >> 2] = ze),
                tr(0 | Ge[A >> 2], 0 | Ge[w >> 2], 0 | Ge[C >> 2]),
                (Ge[w >> 2] = (0 | Ge[w >> 2]) + (0 | Ge[C >> 2])),
                (Ge[A >> 2] = (0 | Ge[A >> 2]) + (0 | Ge[C >> 2])),
                (Ge[b >> 2] = (0 | Ge[b >> 2]) - (0 | Ge[C >> 2])),
                (ve = 88)
              break
            case 94:
              ;(ve = 0), (Ge[p >> 2] = -1), (Be = 40), (He = 0 | Ge[l >> 2]), (ve = 349)
              continue e
            case 100:
              ;(ve = 0), (Ge[p >> 2] = -1), (Be = 10), (He = 0 | Ge[l >> 2]), (ve = 349)
              continue e
            case 115:
              if (((ve = 0), (2 & Ge[_ >> 2]) | 0)) {
                ;(Ge[p >> 2] = 1), (Be = 11), (He = 0 | Ge[l >> 2]), (ve = 349)
                continue e
              }
              ;(Ge[x >> 2] = 0), (ve = 121)
              continue e
            case 121:
              ;(ve = 0),
                (Ge[O >> 2] = Ge[O >> 2] | (Ge[x >> 2] << Ge[F >> 2])),
                (Ge[F >> 2] = 8 + (0 | Ge[F >> 2])),
                (ve = (0 | Ge[F >> 2]) >>> 0 < (0 | Xe[(1331 + (0 | Ge[b >> 2])) >> 0]) >>> 0 ? 114 : 122)
              break
            case 127:
              if (((ve = 0), (2 & Ge[_ >> 2]) | 0)) {
                ;(Ge[p >> 2] = 1), (Be = 14), (He = 0 | Ge[l >> 2]), (ve = 349)
                continue e
              }
              ;(Ge[H >> 2] = 0), (ve = 133)
              continue e
            case 133:
              ;(ve = 0),
                (Ge[O >> 2] = Ge[O >> 2] | (Ge[H >> 2] << Ge[F >> 2])),
                (Ge[F >> 2] = 8 + (0 | Ge[F >> 2])),
                (ve = (0 | Ge[F >> 2]) >>> 0 < 3 ? 126 : 134)
              break
            case 144:
              ;(ve = 0), (Ge[p >> 2] = -1), (Be = 35), (He = 0 | Ge[l >> 2]), (ve = 349)
              continue e
            case 179:
              if (((ve = 0), (2 & Ge[_ >> 2]) | 0)) {
                ;(Ge[p >> 2] = 1), (Be = 16), (He = 0 | Ge[l >> 2]), (ve = 349)
                continue e
              }
              ;(Ge[oe >> 2] = 0), (ve = 185)
              continue e
            case 185:
              ;(ve = 0),
                (Ge[O >> 2] = Ge[O >> 2] | (Ge[oe >> 2] << Ge[F >> 2])),
                (Ge[F >> 2] = 8 + (0 | Ge[F >> 2])),
                (ve = (0 | Ge[F >> 2]) >>> 0 < 15 ? 170 : 187)
              break
            case 194:
              ;(ve = 0), (Ge[p >> 2] = -1), (Be = 17), (He = 0 | Ge[l >> 2]), (ve = 349)
              continue e
            case 197:
              if (((ve = 0), (2 & Ge[_ >> 2]) | 0)) {
                ;(Ge[p >> 2] = 1), (Be = 18), (He = 0 | Ge[l >> 2]), (ve = 349)
                continue e
              }
              ;(Ge[ie >> 2] = 0), (ve = 203)
              continue e
            case 203:
              ;(ve = 0),
                (Ge[O >> 2] = Ge[O >> 2] | (Ge[ie >> 2] << Ge[F >> 2])),
                (Ge[F >> 2] = 8 + (0 | Ge[F >> 2])),
                (ve = (0 | Ge[F >> 2]) >>> 0 < (0 | Ge[y >> 2]) >>> 0 ? 196 : 204)
              break
            case 208:
              ;(ve = 0), (Ge[p >> 2] = -1), (Be = 21), (He = 0 | Ge[l >> 2]), (ve = 349)
              continue e
            case 225:
              if (((ve = 0), (2 & Ge[_ >> 2]) | 0)) {
                ;(Ge[p >> 2] = 1), (Be = 23), (He = 0 | Ge[l >> 2]), (ve = 349)
                continue e
              }
              ;(Ge[ce >> 2] = 0), (ve = 231)
              continue e
            case 231:
              ;(ve = 0),
                (Ge[O >> 2] = Ge[O >> 2] | (Ge[ce >> 2] << Ge[F >> 2])),
                (Ge[F >> 2] = 8 + (0 | Ge[F >> 2])),
                (ve = (0 | Ge[F >> 2]) >>> 0 < 15 ? 216 : 233)
              break
            case 238:
              if (((ve = 0) | Ge[A >> 2]) >>> 0 >= (0 | Ge[k >> 2]) >>> 0) {
                ;(Ge[p >> 2] = 2), (Be = 24), (He = 0 | Ge[l >> 2]), (ve = 349)
                continue e
              }
              ;(Ye = 255 & Ge[b >> 2]), (Ue = 0 | Ge[A >> 2]), (Ge[A >> 2] = Ue + 1), (Xe[Ue >> 0] = Ye), (ve = 212)
              break
            case 261:
              if (((ve = 0), (2 & Ge[_ >> 2]) | 0)) {
                ;(Ge[p >> 2] = 1), (Be = 25), (He = 0 | Ge[l >> 2]), (ve = 349)
                continue e
              }
              ;(Ge[Ee >> 2] = 0), (ve = 267)
              continue e
            case 267:
              ;(ve = 0),
                (Ge[O >> 2] = Ge[O >> 2] | (Ge[Ee >> 2] << Ge[F >> 2])),
                (Ge[F >> 2] = 8 + (0 | Ge[F >> 2])),
                (ve = (0 | Ge[F >> 2]) >>> 0 < (0 | Ge[y >> 2]) >>> 0 ? 260 : 268)
              break
            case 280:
              if (((ve = 0), (2 & Ge[_ >> 2]) | 0)) {
                ;(Ge[p >> 2] = 1), (Be = 26), (He = 0 | Ge[l >> 2]), (ve = 349)
                continue e
              }
              ;(Ge[me >> 2] = 0), (ve = 286)
              continue e
            case 286:
              ;(ve = 0),
                (Ge[O >> 2] = Ge[O >> 2] | (Ge[me >> 2] << Ge[F >> 2])),
                (Ge[F >> 2] = 8 + (0 | Ge[F >> 2])),
                (ve = (0 | Ge[F >> 2]) >>> 0 < 15 ? 271 : 288)
              break
            case 295:
              if (((ve = 0), (2 & Ge[_ >> 2]) | 0)) {
                ;(Ge[p >> 2] = 1), (Be = 27), (He = 0 | Ge[l >> 2]), (ve = 349)
                continue e
              }
              ;(Ge[pe >> 2] = 0), (ve = 301)
              continue e
            case 301:
              ;(ve = 0),
                (Ge[O >> 2] = Ge[O >> 2] | (Ge[pe >> 2] << Ge[F >> 2])),
                (Ge[F >> 2] = 8 + (0 | Ge[F >> 2])),
                (ve = (0 | Ge[F >> 2]) >>> 0 < (0 | Ge[y >> 2]) >>> 0 ? 294 : 302)
              break
            case 305:
              ;(ve = 0), (Ge[p >> 2] = -1), (Be = 37), (He = 0 | Ge[l >> 2]), (ve = 349)
              continue e
            case 308:
              if (((ve = 0) | Ge[A >> 2]) >>> 0 >= (0 | Ge[k >> 2]) >>> 0) {
                ;(Ge[p >> 2] = 2), (Be = 53), (He = 0 | Ge[l >> 2]), (ve = 349)
                continue e
              }
              ;(Ye = 0 | Ge[g >> 2]),
                (Ge[g >> 2] = Ye + 1),
                (Ue = 0 | Xe[((0 | Ge[E >> 2]) + ((Ye - (0 | Ge[M >> 2])) & Ge[T >> 2])) >> 0]),
                (Ye = 0 | Ge[A >> 2]),
                (Ge[A >> 2] = Ye + 1),
                (Xe[Ye >> 0] = Ue),
                (ve = 307)
              break
            case 320:
              if (((ve = 0), (2 & Ge[_ >> 2]) | 0)) {
                ;(Ge[p >> 2] = 1), (Be = 32), (He = 0 | Ge[l >> 2]), (ve = 349)
                continue e
              }
              ;(Ge[Fe >> 2] = 0), (ve = 326)
              continue e
            case 326:
              ;(ve = 0),
                (Ge[O >> 2] = Ge[O >> 2] | (Ge[Fe >> 2] << Ge[F >> 2])),
                (Ge[F >> 2] = 8 + (0 | Ge[F >> 2])),
                (ve = (0 | Ge[F >> 2]) >>> 0 < (7 & Ge[F >> 2]) >>> 0 ? 319 : 327)
              break
            case 332:
              if (((ve = 0), (2 & Ge[_ >> 2]) | 0)) {
                ;(Ge[p >> 2] = 1), (Be = 41), (He = 0 | Ge[l >> 2]), (ve = 349)
                continue e
              }
              ;(Ge[be >> 2] = 0), (ve = 338)
              continue e
            case 338:
              ;(ve = 0),
                (Ge[O >> 2] = Ge[O >> 2] | (Ge[be >> 2] << Ge[F >> 2])),
                (Ge[F >> 2] = 8 + (0 | Ge[F >> 2])),
                (ve = (0 | Ge[F >> 2]) >>> 0 < 8 ? 331 : 339)
              break
            case 341:
              if (((ve = 0), (2 & Ge[_ >> 2]) | 0)) {
                ;(Ge[p >> 2] = 1), (Be = 42), (He = 0 | Ge[l >> 2]), (ve = 349)
                continue e
              }
              ;(Ge[Me >> 2] = 0), (ve = 347)
              continue e
            case 347:
              ;(Ge[(16 + ((ve = 0) | Ge[l >> 2])) >> 2] = (Ge[(16 + (0 | Ge[l >> 2])) >> 2] << 8) | Ge[Me >> 2]),
                (Ge[b >> 2] = 1 + (0 | Ge[b >> 2])),
                (ve = 328)
              break
            case 348:
              ;(ve = 0), (Be = 34), (He = (Ge[p >> 2] = 0) | Ge[l >> 2]), (ve = 349)
              continue e
            case 349:
              ;(ve = 0), (Ge[He >> 2] = Be), (ve = 350)
              continue e
            case 350:
              if (
                ((Ge[(4 + ((ve = 0) | Ge[l >> 2])) >> 2] = Ge[F >> 2]),
                (Ge[(56 + (0 | Ge[l >> 2])) >> 2] = Ge[O >> 2]),
                (Ge[(32 + (0 | Ge[l >> 2])) >> 2] = Ge[M >> 2]),
                (Ge[(36 + (0 | Ge[l >> 2])) >> 2] = Ge[b >> 2]),
                (Ge[(40 + (0 | Ge[l >> 2])) >> 2] = Ge[y >> 2]),
                (Ge[(60 + (0 | Ge[l >> 2])) >> 2] = Ge[g >> 2]),
                (Ge[Ge[d >> 2] >> 2] = (0 | Ge[w >> 2]) - (0 | Ge[f >> 2])),
                (Ge[Ge[S >> 2] >> 2] = (0 | Ge[A >> 2]) - (0 | Ge[Te >> 2])),
                (0 != ((9 & Ge[_ >> 2]) | 0)) & (0 <= (0 | Ge[p >> 2])))
              ) {
                ve = 351
                break e
              }
              break e
          }
          if (32 != (0 | ve)) {
            r: do {
              if (40 == (0 | ve)) {
                if (
                  ((Ge[(20 + ((ve = 0) | Ge[l >> 2])) >> 2] = 7 & Ge[O >> 2]),
                  (Ge[O >> 2] = (0 | Ge[O >> 2]) >>> 3),
                  (Ge[F >> 2] = (0 | Ge[F >> 2]) - 3),
                  (Ge[(24 + (0 | Ge[l >> 2])) >> 2] = (0 | Ge[(20 + (0 | Ge[l >> 2])) >> 2]) >>> 1),
                  !(0 | Ge[(24 + (0 | Ge[l >> 2])) >> 2]))
                ) {
                  if ((0 | Ge[F >> 2]) >>> 0 < (7 & Ge[F >> 2]) >>> 0) {
                    ve = 42
                    break
                  }
                  ve = 50
                  break
                }
                if (3 == (0 | Ge[(24 + (0 | Ge[l >> 2])) >> 2])) {
                  ve = 100
                  continue e
                }
                if (1 != (0 | Ge[(24 + (0 | Ge[l >> 2])) >> 2])) {
                  ;(Ge[b >> 2] = 0), (ve = 112)
                  break
                }
                for (
                  Ge[I >> 2] = 64 + (0 | Ge[l >> 2]),
                    Ge[(44 + (0 | Ge[l >> 2])) >> 2] = 288,
                    Ge[(44 + (0 | Ge[l >> 2]) + 4) >> 2] = 32,
                    Ue = (64 + (0 | Ge[l >> 2]) + 3488) | 0,
                    Ge[Ue >> 2] = 84215045,
                    Ge[(Ue + 4) >> 2] = 84215045,
                    Ge[(Ue + 8) >> 2] = 84215045,
                    Ge[(Ue + 12) >> 2] = 84215045,
                    Ge[(Ue + 16) >> 2] = 84215045,
                    Ge[(Ue + 20) >> 2] = 84215045,
                    Ge[(Ue + 24) >> 2] = 84215045,
                    Ge[(Ue + 28) >> 2] = 84215045,
                    Ge[L >> 2] = 0;
                  !(143 < (0 | Ge[L >> 2]) >>> 0);

                )
                  (Ue = 0 | Ge[I >> 2]), (Ge[I >> 2] = Ue + 1), (Xe[Ue >> 0] = 8), (Ge[L >> 2] = 1 + (0 | Ge[L >> 2]))
                for (; !(255 < (0 | Ge[L >> 2]) >>> 0); )
                  (Ue = 0 | Ge[I >> 2]), (Ge[I >> 2] = Ue + 1), (Xe[Ue >> 0] = 9), (Ge[L >> 2] = 1 + (0 | Ge[L >> 2]))
                for (; !(279 < (0 | Ge[L >> 2]) >>> 0); )
                  (Ue = 0 | Ge[I >> 2]), (Ge[I >> 2] = Ue + 1), (Xe[Ue >> 0] = 7), (Ge[L >> 2] = 1 + (0 | Ge[L >> 2]))
                for (;;) {
                  if (287 < (0 | Ge[L >> 2]) >>> 0) {
                    ve = 136
                    break r
                  }
                  ;(Ue = 0 | Ge[I >> 2]), (Ge[I >> 2] = Ue + 1), (Xe[Ue >> 0] = 8), (Ge[L >> 2] = 1 + (0 | Ge[L >> 2]))
                }
              }
            } while (0)
            if (42 != (0 | ve)) {
              50 == (0 | ve) &&
                ((ve = 0),
                (Ge[O >> 2] = (0 | Ge[O >> 2]) >>> (7 & Ge[F >> 2])),
                (Ge[F >> 2] = (0 | Ge[F >> 2]) - (7 & Ge[F >> 2])),
                (Ge[b >> 2] = 0),
                (ve = 51))
              r: for (;;) {
                switch (0 | ve) {
                  case 51:
                    if (4 <= ((ve = 0) | Ge[b >> 2]) >>> 0) {
                      if (
                        ((Ue = qe[(10528 + (0 | Ge[l >> 2])) >> 0] | (qe[(10528 + (0 | Ge[l >> 2]) + 1) >> 0] << 8)),
                        (0 | (Ge[b >> 2] = Ue)) !=
                          ((65535 ^
                            (qe[(10528 + (0 | Ge[l >> 2]) + 2) >> 0] |
                              (qe[(10528 + (0 | Ge[l >> 2]) + 3) >> 0] << 8))) |
                            0))
                      ) {
                        ve = 73
                        continue e
                      }
                      ve = 74
                      continue r
                    }
                    if (!(0 | Ge[F >> 2])) {
                      ve = 63
                      break r
                    }
                    if ((0 | Ge[F >> 2]) >>> 0 < 8) {
                      ve = 54
                      continue r
                    }
                    ve = 62
                    continue r
                  case 54:
                    if (((ve = 0) | Ge[w >> 2]) >>> 0 >= (0 | Ge[R >> 2]) >>> 0) {
                      ve = 55
                      continue e
                    }
                    ve = 60
                    break r
                  case 62:
                    ;(Xe[(10528 + ((ve = 0) | Ge[l >> 2]) + (0 | Ge[b >> 2])) >> 0] = Ge[O >> 2]),
                      (Ge[O >> 2] = (0 | Ge[O >> 2]) >>> 8),
                      (Ge[F >> 2] = (0 | Ge[F >> 2]) - 8),
                      (ve = 71)
                    continue r
                  case 71:
                    ;(ve = 0), (Ge[b >> 2] = 1 + (0 | Ge[b >> 2])), (ve = 51)
                    continue r
                  case 74:
                    if (!((ve = 0) | Ge[b >> 2] && 0 != (0 | Ge[F >> 2]))) {
                      ve = 88
                      continue r
                    }
                    if ((0 | Ge[F >> 2]) >>> 0 < 8) {
                      ve = 76
                      continue r
                    }
                    ve = 84
                    continue r
                  case 76:
                    if (((ve = 0) | Ge[w >> 2]) >>> 0 >= (0 | Ge[R >> 2]) >>> 0) {
                      ve = 77
                      continue e
                    }
                    ve = 82
                    break r
                  case 84:
                    ;(ve = 0),
                      (Ge[M >> 2] = 255 & Ge[O >> 2]),
                      (Ge[O >> 2] = (0 | Ge[O >> 2]) >>> 8),
                      (Ge[F >> 2] = (0 | Ge[F >> 2]) - 8),
                      (ve = 85)
                    continue e
                  case 88:
                    if ((ve = 0) | Ge[b >> 2]) {
                      ve = 89
                      continue e
                    }
                    ve = 316
                    break
                  case 112:
                    if (((ve = 0) | Ge[b >> 2]) >>> 0 < 3) {
                      if ((0 | Ge[F >> 2]) >>> 0 < (0 | Xe[(1331 + (0 | Ge[b >> 2])) >> 0]) >>> 0) {
                        ve = 114
                        continue r
                      }
                      ve = 122
                      continue r
                    }
                    er((64 + (0 | Ge[l >> 2]) + 6976) | 0, 0, 288), (Ge[b >> 2] = 0), (ve = 124)
                    break
                  case 114:
                    if (((ve = 0) | Ge[w >> 2]) >>> 0 >= (0 | Ge[R >> 2]) >>> 0) {
                      ve = 115
                      continue e
                    }
                    ve = 120
                    break r
                  case 122:
                    ;(Ge[(44 + ((ve = 0) | Ge[l >> 2]) + (Ge[b >> 2] << 2)) >> 2] =
                      Ge[O >> 2] & ((1 << Xe[(1331 + (0 | Ge[b >> 2])) >> 0]) - 1)),
                      (Ge[O >> 2] = (0 | Ge[O >> 2]) >>> (0 | Xe[(1331 + (0 | Ge[b >> 2])) >> 0])),
                      (Ge[F >> 2] = (0 | Ge[F >> 2]) - (0 | Xe[(1331 + (0 | Ge[b >> 2])) >> 0])),
                      (Ue = (44 + (0 | Ge[l >> 2]) + (Ge[b >> 2] << 2)) | 0),
                      (Ge[Ue >> 2] = (0 | Ge[Ue >> 2]) + (0 | Ge[(72 + (Ge[b >> 2] << 2)) >> 2])),
                      (Ge[b >> 2] = 1 + (0 | Ge[b >> 2])),
                      (ve = 112)
                    continue r
                  case 126:
                    if (((ve = 0) | Ge[w >> 2]) >>> 0 >= (0 | Ge[R >> 2]) >>> 0) {
                      ve = 127
                      continue e
                    }
                    ve = 132
                    break r
                  case 134:
                    ;(ve = 0),
                      (Ge[B >> 2] = 7 & Ge[O >> 2]),
                      (Ge[O >> 2] = (0 | Ge[O >> 2]) >>> 3),
                      (Ge[F >> 2] = (0 | Ge[F >> 2]) - 3),
                      (Xe[(64 + (0 | Ge[l >> 2]) + 6976 + (0 | qe[(1335 + (0 | Ge[b >> 2])) >> 0])) >> 0] = Ge[B >> 2]),
                      (Ge[b >> 2] = 1 + (0 | Ge[b >> 2])),
                      (ve = 124)
                    break
                  case 136:
                    if ((ve = 0) <= (0 | Ge[(24 + (0 | Ge[l >> 2])) >> 2])) {
                      for (
                        Ge[z >> 2] = 64 + (0 | Ge[l >> 2]) + ((3488 * (0 | Ge[(24 + (0 | Ge[l >> 2])) >> 2])) | 0),
                          Ue = q,
                          Ye = (Ue + 64) | 0;
                        (Ue = (Ue + 4) | (Ge[Ue >> 2] = 0)), (0 | Ue) < (0 | Ye);

                      );
                      for (
                        er((288 + (0 | Ge[z >> 2])) | 0, 0, 2048),
                          er((2336 + (0 | Ge[z >> 2])) | 0, 0, 1152),
                          Ge[V >> 2] = 0;
                        !(
                          (0 | Ge[V >> 2]) >>> 0 >=
                          (0 | Ge[(44 + (0 | Ge[l >> 2]) + (Ge[(24 + (0 | Ge[l >> 2])) >> 2] << 2)) >> 2]) >>> 0
                        );

                      )
                        (Ue = (q + (qe[((0 | Ge[z >> 2]) + (0 | Ge[V >> 2])) >> 0] << 2)) | 0),
                          (Ge[Ue >> 2] = 1 + (0 | Ge[Ue >> 2])),
                          (Ge[V >> 2] = 1 + (0 | Ge[V >> 2]))
                      for (
                        Ge[W >> 2] = 0, Ge[X >> 2] = 0, Ge[(4 + G) >> 2] = 0, Ge[G >> 2] = 0, Ge[V >> 2] = 1;
                        !(15 < (0 | Ge[V >> 2]) >>> 0);

                      )
                        (Ge[W >> 2] = (0 | Ge[W >> 2]) + (0 | Ge[(q + (Ge[V >> 2] << 2)) >> 2])),
                          (Ue = ((0 | Ge[X >> 2]) + (0 | Ge[(q + (Ge[V >> 2] << 2)) >> 2])) << 1),
                          (Ge[X >> 2] = Ue),
                          (Ge[(G + ((1 + (0 | Ge[V >> 2])) << 2)) >> 2] = Ue),
                          (Ge[V >> 2] = 1 + (0 | Ge[V >> 2]))
                      if ((65536 != (0 | Ge[X >> 2])) & (1 < (0 | Ge[W >> 2]) >>> 0)) {
                        ve = 144
                        continue e
                      }
                      for (
                        Ge[U >> 2] = -1, Ge[j >> 2] = 0;
                        !(
                          (0 | Ge[j >> 2]) >>> 0 >=
                          (0 | Ge[(44 + (0 | Ge[l >> 2]) + (Ge[(24 + (0 | Ge[l >> 2])) >> 2] << 2)) >> 2]) >>> 0
                        );

                      ) {
                        ;(Ge[Z >> 2] = 0), (Ge[$ >> 2] = qe[((0 | Ge[z >> 2]) + (0 | Ge[j >> 2])) >> 0])
                        t: do {
                          if (0 | Ge[$ >> 2]) {
                            for (
                              Ue = (G + (Ge[$ >> 2] << 2)) | 0,
                                Ye = 0 | Ge[Ue >> 2],
                                Ge[Ue >> 2] = Ye + 1,
                                Ge[Q >> 2] = Ye,
                                Ge[J >> 2] = Ge[$ >> 2];
                              !((0 | Ge[J >> 2]) >>> 0 <= 0);

                            )
                              (Ge[Z >> 2] = (Ge[Z >> 2] << 1) | (1 & Ge[Q >> 2])),
                                (Ge[J >> 2] = (0 | Ge[J >> 2]) - 1),
                                (Ge[Q >> 2] = (0 | Ge[Q >> 2]) >>> 1)
                            if ((0 | Ge[$ >> 2]) >>> 0 <= 10)
                              for (je[ee >> 1] = (Ge[$ >> 2] << 9) | Ge[j >> 2]; ; ) {
                                if (1024 <= (0 | Ge[Z >> 2]) >>> 0) break t
                                ;(je[(288 + (0 | Ge[z >> 2]) + (Ge[Z >> 2] << 1)) >> 1] = 0 | je[ee >> 1]),
                                  (Ge[Z >> 2] = (0 | Ge[Z >> 2]) + (1 << Ge[$ >> 2]))
                              }
                            for (
                              Ye = 0 | je[(288 + (0 | Ge[z >> 2]) + ((1023 & Ge[Z >> 2]) << 1)) >> 1],
                                (Ge[Y >> 2] = Ye) ||
                                  ((je[(288 + (0 | Ge[z >> 2]) + ((1023 & Ge[Z >> 2]) << 1)) >> 1] = Ge[U >> 2]),
                                  (Ge[Y >> 2] = Ge[U >> 2]),
                                  (Ge[U >> 2] = (0 | Ge[U >> 2]) - 2)),
                                Ge[Z >> 2] = (0 | Ge[Z >> 2]) >>> 9,
                                Ge[K >> 2] = Ge[$ >> 2];
                              (Ye = 11 < (0 | Ge[K >> 2]) >>> 0),
                                (Ue = (0 | Ge[Z >> 2]) >>> 1),
                                (Ge[Z >> 2] = Ue),
                                (Ge[Y >> 2] = (0 | Ge[Y >> 2]) - (1 & Ue)),
                                Ye;

                            )
                              0 | je[(2336 + (0 | Ge[z >> 2]) + ((0 - (0 | Ge[Y >> 2]) - 1) << 1)) >> 1]
                                ? (Ge[Y >> 2] = je[(2336 + (0 | Ge[z >> 2]) + ((0 - (0 | Ge[Y >> 2]) - 1) << 1)) >> 1])
                                : ((je[(2336 + (0 | Ge[z >> 2]) + ((0 - (0 | Ge[Y >> 2]) - 1) << 1)) >> 1] =
                                    Ge[U >> 2]),
                                  (Ge[Y >> 2] = Ge[U >> 2]),
                                  (Ge[U >> 2] = (0 | Ge[U >> 2]) - 2)),
                                (Ge[K >> 2] = (0 | Ge[K >> 2]) - 1)
                            je[(2336 + (0 | Ge[z >> 2]) + ((0 - (0 | Ge[Y >> 2]) - 1) << 1)) >> 1] = Ge[j >> 2]
                          }
                        } while (0)
                        Ge[j >> 2] = 1 + (0 | Ge[j >> 2])
                      }
                      ve = 2 == (0 | Ge[(24 + (0 | Ge[l >> 2])) >> 2]) ? ((Ge[b >> 2] = 0), 167) : 210
                    } else ve = 211
                    break
                  case 170:
                    if (
                      ((ve = 0),
                      (Ge[te >> 2] = je[(64 + (0 | Ge[l >> 2]) + 6976 + 288 + ((1023 & Ge[O >> 2]) << 1)) >> 1]),
                      0 <= (0 | Ge[te >> 2]))
                    ) {
                      if (((Ge[ne >> 2] = Ge[te >> 2] >> 9), !(0 | Ge[ne >> 2]))) {
                        ve = 178
                        break r
                      }
                      if ((0 | Ge[F >> 2]) >>> 0 >= (0 | Ge[ne >> 2]) >>> 0) {
                        ve = 187
                        continue r
                      }
                      ve = 178
                      break r
                    }
                    if ((0 | Ge[F >> 2]) >>> 0 <= 10) {
                      ve = 178
                      break r
                    }
                    Ge[ne >> 2] = 10
                    do {
                      if (
                        ((Ye = ~Ge[te >> 2]),
                        (Ue = 0 | Ge[O >> 2]),
                        (Ce = 0 | Ge[ne >> 2]),
                        (Ge[ne >> 2] = Ce + 1),
                        (Ge[te >> 2] =
                          je[(64 + (0 | Ge[l >> 2]) + 6976 + 2336 + ((Ye + ((Ue >>> Ce) & 1)) << 1)) >> 1]),
                        0 <= (0 | Ge[te >> 2]))
                      )
                        break
                    } while ((0 | Ge[F >> 2]) >>> 0 >= ((1 + (0 | Ge[ne >> 2])) | 0) >>> 0)
                    if (0 <= (0 | Ge[te >> 2])) {
                      ve = 187
                      continue r
                    }
                    ve = 178
                    break r
                  case 187:
                    if (
                      ((Ce = (ve = 0) | je[(64 + (0 | Ge[l >> 2]) + 6976 + 288 + ((1023 & Ge[O >> 2]) << 1)) >> 1]),
                      0 <= (0 | (Ge[te >> 2] = Ce)))
                    )
                      (Ge[ne >> 2] = Ge[te >> 2] >> 9), (Ge[te >> 2] = 511 & Ge[te >> 2])
                    else
                      for (
                        Ge[ne >> 2] = 10;
                        (Ce = ~Ge[te >> 2]),
                          (Ue = 0 | Ge[O >> 2]),
                          (Ye = 0 | Ge[ne >> 2]),
                          (Ge[ne >> 2] = Ye + 1),
                          (Ge[te >> 2] =
                            je[(64 + (0 | Ge[l >> 2]) + 6976 + 2336 + ((Ce + ((Ue >>> Ye) & 1)) << 1)) >> 1]),
                          (0 | Ge[te >> 2]) < 0;

                      );
                    if (
                      ((Ge[M >> 2] = Ge[te >> 2]),
                      (Ge[O >> 2] = (0 | Ge[O >> 2]) >>> (0 | Ge[ne >> 2])),
                      (Ge[F >> 2] = (0 | Ge[F >> 2]) - (0 | Ge[ne >> 2])),
                      (Ye = 0 | Ge[M >> 2]),
                      (0 | Ge[M >> 2]) >>> 0 < 16)
                    ) {
                      ;(Ue = 0 | Ge[b >> 2]),
                        (Ge[b >> 2] = Ue + 1),
                        (Xe[(10532 + (0 | Ge[l >> 2]) + Ue) >> 0] = Ye),
                        (ve = 167)
                      break
                    }
                    if (!((16 != (0 | Ye)) | (0 != (0 | Ge[b >> 2])))) {
                      ve = 194
                      continue e
                    }
                    if (
                      ((Ge[y >> 2] = Xe[((0 | Ge[M >> 2]) - 16 + 1354) >> 0]),
                      (0 | Ge[F >> 2]) >>> 0 < (0 | Ge[y >> 2]) >>> 0)
                    ) {
                      ve = 196
                      continue r
                    }
                    ve = 204
                    continue r
                  case 196:
                    if (((ve = 0) | Ge[w >> 2]) >>> 0 >= (0 | Ge[R >> 2]) >>> 0) {
                      ve = 197
                      continue e
                    }
                    ve = 202
                    break r
                  case 204:
                    ;(ve = 0),
                      (Ge[re >> 2] = Ge[O >> 2] & ((1 << Ge[y >> 2]) - 1)),
                      (Ge[O >> 2] = (0 | Ge[O >> 2]) >>> (0 | Ge[y >> 2])),
                      (Ge[F >> 2] = (0 | Ge[F >> 2]) - (0 | Ge[y >> 2])),
                      (Ge[re >> 2] = (0 | Ge[re >> 2]) + (0 | Xe[((0 | Ge[M >> 2]) - 16 + 1358) >> 0])),
                      (Ve =
                        16 == (0 | Ge[M >> 2]) ? 0 | qe[(10532 + (0 | Ge[l >> 2]) + ((0 | Ge[b >> 2]) - 1)) >> 0] : 0),
                      er((10532 + (0 | Ge[l >> 2]) + (0 | Ge[b >> 2])) | 0, (255 & Ve) | 0, 0 | Ge[re >> 2]),
                      (Ge[b >> 2] = (0 | Ge[b >> 2]) + (0 | Ge[re >> 2])),
                      (ve = 167)
                    break
                  case 212:
                    if (
                      4 <= ((((ve = 0) | Ge[R >> 2]) - (0 | Ge[w >> 2])) | 0) &&
                      2 <= (((0 | Ge[k >> 2]) - (0 | Ge[A >> 2])) | 0)
                    ) {
                      if (
                        ((0 | Ge[F >> 2]) >>> 0 < 15 &&
                          ((Ge[O >> 2] =
                            Ge[O >> 2] |
                            ((qe[Ge[w >> 2] >> 0] | (qe[(1 + (0 | Ge[w >> 2])) >> 0] << 8)) << Ge[F >> 2])),
                          (Ge[w >> 2] = 2 + (0 | Ge[w >> 2])),
                          (Ge[F >> 2] = 16 + (0 | Ge[F >> 2]))),
                        (Ye = 0 | je[(64 + (0 | Ge[l >> 2]) + 288 + ((1023 & Ge[O >> 2]) << 1)) >> 1]),
                        0 <= (0 | (Ge[le >> 2] = Ye)))
                      )
                        Ge[fe >> 2] = Ge[le >> 2] >> 9
                      else
                        for (
                          Ge[fe >> 2] = 10;
                          (Ye = ~Ge[le >> 2]),
                            (Ue = 0 | Ge[O >> 2]),
                            (Ce = 0 | Ge[fe >> 2]),
                            (Ge[fe >> 2] = Ce + 1),
                            (Ge[le >> 2] = je[(64 + (0 | Ge[l >> 2]) + 2336 + ((Ye + ((Ue >>> Ce) & 1)) << 1)) >> 1]),
                            (0 | Ge[le >> 2]) < 0;

                        );
                      if (
                        ((Ge[b >> 2] = Ge[le >> 2]),
                        (Ge[O >> 2] = (0 | Ge[O >> 2]) >>> (0 | Ge[fe >> 2])),
                        (Ge[F >> 2] = (0 | Ge[F >> 2]) - (0 | Ge[fe >> 2])),
                        (256 & Ge[b >> 2]) | 0)
                      ) {
                        ve = 257
                        break
                      }
                      if (
                        ((0 | Ge[F >> 2]) >>> 0 < 15 &&
                          ((Ge[O >> 2] =
                            Ge[O >> 2] |
                            ((qe[Ge[w >> 2] >> 0] | (qe[(1 + (0 | Ge[w >> 2])) >> 0] << 8)) << Ge[F >> 2])),
                          (Ge[w >> 2] = 2 + (0 | Ge[w >> 2])),
                          (Ge[F >> 2] = 16 + (0 | Ge[F >> 2]))),
                        (Ce = 0 | je[(64 + (0 | Ge[l >> 2]) + 288 + ((1023 & Ge[O >> 2]) << 1)) >> 1]),
                        0 <= (0 | (Ge[le >> 2] = Ce)))
                      )
                        Ge[fe >> 2] = Ge[le >> 2] >> 9
                      else
                        for (
                          Ge[fe >> 2] = 10;
                          (Ce = ~Ge[le >> 2]),
                            (Ue = 0 | Ge[O >> 2]),
                            (Ye = 0 | Ge[fe >> 2]),
                            (Ge[fe >> 2] = Ye + 1),
                            (Ge[le >> 2] = je[(64 + (0 | Ge[l >> 2]) + 2336 + ((Ce + ((Ue >>> Ye) & 1)) << 1)) >> 1]),
                            (0 | Ge[le >> 2]) < 0;

                        );
                      if (
                        ((Ge[O >> 2] = (0 | Ge[O >> 2]) >>> (0 | Ge[fe >> 2])),
                        (Ge[F >> 2] = (0 | Ge[F >> 2]) - (0 | Ge[fe >> 2])),
                        (Xe[Ge[A >> 2] >> 0] = Ge[b >> 2]),
                        (256 & Ge[le >> 2]) | 0)
                      ) {
                        ;(Ge[A >> 2] = 1 + (0 | Ge[A >> 2])), (Ge[b >> 2] = Ge[le >> 2]), (ve = 257)
                        break
                      }
                      ;(Xe[(1 + (0 | Ge[A >> 2])) >> 0] = Ge[le >> 2]), (Ge[A >> 2] = 2 + (0 | Ge[A >> 2])), (ve = 212)
                      continue r
                    }
                    if (15 <= (0 | Ge[F >> 2]) >>> 0) {
                      ve = 233
                      continue r
                    }
                    if ((((0 | Ge[R >> 2]) - (0 | Ge[w >> 2])) | 0) < 2) {
                      ve = 216
                      continue r
                    }
                    ;(Ge[O >> 2] =
                      Ge[O >> 2] |
                      ((qe[Ge[w >> 2] >> 0] << Ge[F >> 2]) |
                        (qe[(1 + (0 | Ge[w >> 2])) >> 0] << (8 + (0 | Ge[F >> 2]))))),
                      (Ge[w >> 2] = 2 + (0 | Ge[w >> 2])),
                      (Ge[F >> 2] = 16 + (0 | Ge[F >> 2])),
                      (ve = 233)
                    continue r
                  case 216:
                    if (
                      ((ve = 0),
                      (Ge[se >> 2] = je[(64 + (0 | Ge[l >> 2]) + 288 + ((1023 & Ge[O >> 2]) << 1)) >> 1]),
                      0 <= (0 | Ge[se >> 2]))
                    ) {
                      if (((Ge[ue >> 2] = Ge[se >> 2] >> 9), !(0 | Ge[ue >> 2]))) {
                        ve = 224
                        break r
                      }
                      if ((0 | Ge[F >> 2]) >>> 0 >= (0 | Ge[ue >> 2]) >>> 0) {
                        ve = 233
                        continue r
                      }
                      ve = 224
                      break r
                    }
                    if ((0 | Ge[F >> 2]) >>> 0 <= 10) {
                      ve = 224
                      break r
                    }
                    Ge[ue >> 2] = 10
                    do {
                      if (
                        ((Ye = ~Ge[se >> 2]),
                        (Ue = 0 | Ge[O >> 2]),
                        (Ce = 0 | Ge[ue >> 2]),
                        (Ge[ue >> 2] = Ce + 1),
                        (Ge[se >> 2] = je[(64 + (0 | Ge[l >> 2]) + 2336 + ((Ye + ((Ue >>> Ce) & 1)) << 1)) >> 1]),
                        0 <= (0 | Ge[se >> 2]))
                      )
                        break
                    } while ((0 | Ge[F >> 2]) >>> 0 >= ((1 + (0 | Ge[ue >> 2])) | 0) >>> 0)
                    if (0 <= (0 | Ge[se >> 2])) {
                      ve = 233
                      continue r
                    }
                    ve = 224
                    break r
                  case 233:
                    if (
                      ((Ce = (ve = 0) | je[(64 + (0 | Ge[l >> 2]) + 288 + ((1023 & Ge[O >> 2]) << 1)) >> 1]),
                      0 <= (0 | (Ge[se >> 2] = Ce)))
                    )
                      (Ge[ue >> 2] = Ge[se >> 2] >> 9), (Ge[se >> 2] = 511 & Ge[se >> 2])
                    else
                      for (
                        Ge[ue >> 2] = 10;
                        (Ce = ~Ge[se >> 2]),
                          (Ue = 0 | Ge[O >> 2]),
                          (Ye = 0 | Ge[ue >> 2]),
                          (Ge[ue >> 2] = Ye + 1),
                          (Ge[se >> 2] = je[(64 + (0 | Ge[l >> 2]) + 2336 + ((Ce + ((Ue >>> Ye) & 1)) << 1)) >> 1]),
                          (0 | Ge[se >> 2]) < 0;

                      );
                    if (
                      ((Ge[b >> 2] = Ge[se >> 2]),
                      (Ge[O >> 2] = (0 | Ge[O >> 2]) >>> (0 | Ge[ue >> 2])),
                      (Ge[F >> 2] = (0 | Ge[F >> 2]) - (0 | Ge[ue >> 2])),
                      !(256 <= (0 | Ge[b >> 2]) >>> 0))
                    ) {
                      ve = 238
                      continue e
                    }
                    ve = 257
                    break
                  case 260:
                    if (((ve = 0) | Ge[w >> 2]) >>> 0 >= (0 | Ge[R >> 2]) >>> 0) {
                      ve = 261
                      continue e
                    }
                    ve = 266
                    break r
                  case 268:
                    ;(ve = 0),
                      (Ge[de >> 2] = Ge[O >> 2] & ((1 << Ge[y >> 2]) - 1)),
                      (Ge[O >> 2] = (0 | Ge[O >> 2]) >>> (0 | Ge[y >> 2])),
                      (Ge[F >> 2] = (0 | Ge[F >> 2]) - (0 | Ge[y >> 2])),
                      (Ge[b >> 2] = (0 | Ge[b >> 2]) + (0 | Ge[de >> 2])),
                      (ve = 269)
                    break
                  case 271:
                    if (
                      ((ve = 0),
                      (Ge[Se >> 2] = je[(64 + (0 | Ge[l >> 2]) + 3488 + 288 + ((1023 & Ge[O >> 2]) << 1)) >> 1]),
                      0 <= (0 | Ge[Se >> 2]))
                    ) {
                      if (((Ge[_e >> 2] = Ge[Se >> 2] >> 9), !(0 | Ge[_e >> 2]))) {
                        ve = 279
                        break r
                      }
                      if ((0 | Ge[F >> 2]) >>> 0 >= (0 | Ge[_e >> 2]) >>> 0) {
                        ve = 288
                        continue r
                      }
                      ve = 279
                      break r
                    }
                    if ((0 | Ge[F >> 2]) >>> 0 <= 10) {
                      ve = 279
                      break r
                    }
                    Ge[_e >> 2] = 10
                    do {
                      if (
                        ((Ye = ~Ge[Se >> 2]),
                        (Ue = 0 | Ge[O >> 2]),
                        (Ce = 0 | Ge[_e >> 2]),
                        (Ge[_e >> 2] = Ce + 1),
                        (Ge[Se >> 2] =
                          je[(64 + (0 | Ge[l >> 2]) + 3488 + 2336 + ((Ye + ((Ue >>> Ce) & 1)) << 1)) >> 1]),
                        0 <= (0 | Ge[Se >> 2]))
                      )
                        break
                    } while ((0 | Ge[F >> 2]) >>> 0 >= ((1 + (0 | Ge[_e >> 2])) | 0) >>> 0)
                    if (0 <= (0 | Ge[Se >> 2])) {
                      ve = 288
                      continue r
                    }
                    ve = 279
                    break r
                  case 288:
                    if (
                      ((Ce = (ve = 0) | je[(64 + (0 | Ge[l >> 2]) + 3488 + 288 + ((1023 & Ge[O >> 2]) << 1)) >> 1]),
                      0 <= (0 | (Ge[Se >> 2] = Ce)))
                    )
                      (Ge[_e >> 2] = Ge[Se >> 2] >> 9), (Ge[Se >> 2] = 511 & Ge[Se >> 2])
                    else
                      for (
                        Ge[_e >> 2] = 10;
                        (Ce = ~Ge[Se >> 2]),
                          (Ue = 0 | Ge[O >> 2]),
                          (Ye = 0 | Ge[_e >> 2]),
                          (Ge[_e >> 2] = Ye + 1),
                          (Ge[Se >> 2] =
                            je[(64 + (0 | Ge[l >> 2]) + 3488 + 2336 + ((Ce + ((Ue >>> Ye) & 1)) << 1)) >> 1]),
                          (0 | Ge[Se >> 2]) < 0;

                      );
                    if (
                      ((Ge[M >> 2] = Ge[Se >> 2]),
                      (Ge[O >> 2] = (0 | Ge[O >> 2]) >>> (0 | Ge[_e >> 2])),
                      (Ge[F >> 2] = (0 | Ge[F >> 2]) - (0 | Ge[_e >> 2])),
                      (Ge[y >> 2] = Ge[(332 + (Ge[M >> 2] << 2)) >> 2]),
                      (Ge[M >> 2] = Ge[(460 + (Ge[M >> 2] << 2)) >> 2]),
                      0 | Ge[y >> 2])
                    ) {
                      if ((0 | Ge[F >> 2]) >>> 0 < (0 | Ge[y >> 2]) >>> 0) {
                        ve = 294
                        continue r
                      }
                      ve = 302
                      continue r
                    }
                    ve = 303
                    break
                  case 294:
                    if (((ve = 0) | Ge[w >> 2]) >>> 0 >= (0 | Ge[R >> 2]) >>> 0) {
                      ve = 295
                      continue e
                    }
                    ve = 300
                    break r
                  case 302:
                    ;(ve = 0),
                      (Ge[he >> 2] = Ge[O >> 2] & ((1 << Ge[y >> 2]) - 1)),
                      (Ge[O >> 2] = (0 | Ge[O >> 2]) >>> (0 | Ge[y >> 2])),
                      (Ge[F >> 2] = (0 | Ge[F >> 2]) - (0 | Ge[y >> 2])),
                      (Ge[M >> 2] = (0 | Ge[M >> 2]) + (0 | Ge[he >> 2])),
                      (ve = 303)
                    break
                  case 307:
                    if (((Ye = (ve = 0) | Ge[b >> 2]), (Ge[b >> 2] = Ye + -1), 0 | Ye)) {
                      ve = 308
                      continue e
                    }
                    ve = 211
                    break
                  case 319:
                    if (((ve = 0) | Ge[w >> 2]) >>> 0 >= (0 | Ge[R >> 2]) >>> 0) {
                      ve = 320
                      continue e
                    }
                    ve = 325
                    break r
                  case 327:
                    ;(ve = 0),
                      (Ge[O >> 2] = (0 | Ge[O >> 2]) >>> (7 & Ge[F >> 2])),
                      (Ge[F >> 2] = (0 | Ge[F >> 2]) - (7 & Ge[F >> 2])),
                      (Ge[b >> 2] = 0),
                      (ve = 328)
                    continue r
                  case 328:
                    if (4 <= ((ve = 0) | Ge[b >> 2]) >>> 0) {
                      ve = 348
                      continue e
                    }
                    if (!(0 | Ge[F >> 2])) {
                      ve = 340
                      break r
                    }
                    if ((0 | Ge[F >> 2]) >>> 0 < 8) {
                      ve = 331
                      continue r
                    }
                    ve = 339
                    continue r
                  case 331:
                    if (((ve = 0) | Ge[w >> 2]) >>> 0 >= (0 | Ge[R >> 2]) >>> 0) {
                      ve = 332
                      continue e
                    }
                    ve = 337
                    break r
                  case 339:
                    ;(ve = 0),
                      (Ge[Me >> 2] = 255 & Ge[O >> 2]),
                      (Ge[O >> 2] = (0 | Ge[O >> 2]) >>> 8),
                      (Ge[F >> 2] = (0 | Ge[F >> 2]) - 8),
                      (ve = 347)
                    continue e
                }
                do {
                  if (124 == (0 | ve)) {
                    if (((ve = 0) | Ge[b >> 2]) >>> 0 < (0 | Ge[(44 + (0 | Ge[l >> 2]) + 8) >> 2]) >>> 0) {
                      if ((0 | Ge[F >> 2]) >>> 0 < 3) {
                        ve = 126
                        continue r
                      }
                      ve = 134
                      continue r
                    }
                    ;(Ge[(44 + (0 | Ge[l >> 2]) + 8) >> 2] = 19), (ve = 136)
                    continue r
                  }
                  if (167 == (0 | ve)) {
                    if (
                      ((ve = 0) | Ge[b >> 2]) >>> 0 >=
                      (((0 | Ge[(44 + (0 | Ge[l >> 2])) >> 2]) + (0 | Ge[(44 + (0 | Ge[l >> 2]) + 4) >> 2])) | 0) >>> 0
                    ) {
                      if (
                        (((0 | Ge[(44 + (0 | Ge[l >> 2])) >> 2]) + (0 | Ge[(44 + (0 | Ge[l >> 2]) + 4) >> 2])) | 0) !=
                        (0 | Ge[b >> 2])
                      ) {
                        ve = 208
                        continue e
                      }
                      tr(
                        (64 + (0 | Ge[l >> 2])) | 0,
                        (10532 + (0 | Ge[l >> 2])) | 0,
                        0 | Ge[(44 + (0 | Ge[l >> 2])) >> 2]
                      ),
                        tr(
                          (64 + (0 | Ge[l >> 2]) + 3488) | 0,
                          (10532 + (0 | Ge[l >> 2]) + (0 | Ge[(44 + (0 | Ge[l >> 2])) >> 2])) | 0,
                          0 | Ge[(44 + (0 | Ge[l >> 2]) + 4) >> 2]
                        ),
                        (ve = 210)
                      break
                    }
                    if (15 <= (0 | Ge[F >> 2]) >>> 0) {
                      ve = 187
                      continue r
                    }
                    if ((((0 | Ge[R >> 2]) - (0 | Ge[w >> 2])) | 0) < 2) {
                      ve = 170
                      continue r
                    }
                    ;(Ge[O >> 2] =
                      Ge[O >> 2] |
                      ((qe[Ge[w >> 2] >> 0] << Ge[F >> 2]) |
                        (qe[(1 + (0 | Ge[w >> 2])) >> 0] << (8 + (0 | Ge[F >> 2]))))),
                      (Ge[w >> 2] = 2 + (0 | Ge[w >> 2])),
                      (Ge[F >> 2] = 16 + (0 | Ge[F >> 2])),
                      (ve = 187)
                    continue r
                  }
                  if (257 == (0 | ve))
                    if (((ve = 0), (Ye = 511 & Ge[b >> 2]), 256 != (0 | (Ge[b >> 2] = Ye)))) {
                      if (
                        ((Ge[y >> 2] = Ge[(84 + (((0 | Ge[b >> 2]) - 257) << 2)) >> 2]),
                        (Ge[b >> 2] = Ge[(208 + (((0 | Ge[b >> 2]) - 257) << 2)) >> 2]),
                        0 | Ge[y >> 2])
                      ) {
                        if ((0 | Ge[F >> 2]) >>> 0 < (0 | Ge[y >> 2]) >>> 0) {
                          ve = 260
                          continue r
                        }
                        ve = 268
                        continue r
                      }
                      ve = 269
                    } else ve = 316
                  else if (303 == (0 | ve)) {
                    if (
                      ((ve = 0),
                      (Ge[g >> 2] = (0 | Ge[A >> 2]) - (0 | Ge[E >> 2])),
                      (0 | Ge[M >> 2]) >>> 0 > (0 | Ge[g >> 2]) >>> 0 && (4 & Ge[_ >> 2]) | 0)
                    ) {
                      ve = 305
                      continue e
                    }
                    if (
                      ((Ge[ae >> 2] = (0 | Ge[E >> 2]) + (((0 | Ge[g >> 2]) - (0 | Ge[M >> 2])) & Ge[T >> 2])),
                      ((((0 | Ge[A >> 2]) >>> 0 > (0 | Ge[ae >> 2]) >>> 0 ? 0 | Ge[A >> 2] : 0 | Ge[ae >> 2]) +
                        (0 | Ge[b >> 2])) |
                        0) >>>
                        0 >
                        (0 | Ge[k >> 2]) >>> 0)
                    ) {
                      ve = 307
                      continue r
                    }
                    for (
                      ;
                      (Xe[Ge[A >> 2] >> 0] = 0 | Xe[Ge[ae >> 2] >> 0]),
                        (Xe[(1 + (0 | Ge[A >> 2])) >> 0] = 0 | Xe[(1 + (0 | Ge[ae >> 2])) >> 0]),
                        (Xe[(2 + (0 | Ge[A >> 2])) >> 0] = 0 | Xe[(2 + (0 | Ge[ae >> 2])) >> 0]),
                        (Ge[A >> 2] = 3 + (0 | Ge[A >> 2])),
                        (Ge[ae >> 2] = 3 + (0 | Ge[ae >> 2])),
                        (Ye = ((0 | Ge[b >> 2]) - 3) | 0),
                        (Ge[b >> 2] = Ye),
                        2 < (0 | Ye);

                    );
                    ve =
                      (0 < (0 | Ge[b >> 2]) &&
                        ((Xe[Ge[A >> 2] >> 0] = 0 | Xe[Ge[ae >> 2] >> 0]),
                        1 < (0 | Ge[b >> 2]) &&
                          (Xe[(1 + (0 | Ge[A >> 2])) >> 0] = 0 | Xe[(1 + (0 | Ge[ae >> 2])) >> 0]),
                        (Ge[A >> 2] = (0 | Ge[A >> 2]) + (0 | Ge[b >> 2]))),
                      211)
                  }
                } while (0)
                if (210 != (0 | ve))
                  if (211 != (0 | ve)) {
                    if (269 == (0 | ve))
                      ve =
                        15 <= ((ve = 0) | Ge[F >> 2]) >>> 0
                          ? 288
                          : (((0 | Ge[R >> 2]) - (0 | Ge[w >> 2])) | 0) < 2
                            ? 271
                            : ((Ge[O >> 2] =
                                Ge[O >> 2] |
                                ((qe[Ge[w >> 2] >> 0] << Ge[F >> 2]) |
                                  (qe[(1 + (0 | Ge[w >> 2])) >> 0] << (8 + (0 | Ge[F >> 2]))))),
                              (Ge[w >> 2] = 2 + (0 | Ge[w >> 2])),
                              (Ge[F >> 2] = 16 + (0 | Ge[F >> 2])),
                              288)
                    else if (316 == (0 | ve)) {
                      if (((ve = 0) != ((1 & Ge[(20 + (0 | Ge[l >> 2])) >> 2]) | 0)) ^ 1) {
                        ve = 31
                        continue e
                      }
                      if (!(1 & Ge[_ >> 2])) {
                        ve = 348
                        continue e
                      }
                      ;(0 | Ge[F >> 2]) >>> 0 < (7 & Ge[F >> 2]) >>> 0 ? (ve = 319) : (ve = 327)
                    }
                  } else (ve = 0), (ve = 212)
                else (Ye = (24 + ((ve = 0) | Ge[l >> 2])) | 0), (Ge[Ye >> 2] = (0 | Ge[Ye >> 2]) - 1), (ve = 136)
              }
              switch (0 | ve) {
                case 60:
                  ;(Ye = (ve = 0) | Ge[w >> 2]), (Ge[w >> 2] = Ye + 1), (Ge[D >> 2] = qe[Ye >> 0]), (ve = 61)
                  continue e
                case 63:
                  if (((ve = 0) | Ge[w >> 2]) >>> 0 >= (0 | Ge[R >> 2]) >>> 0) {
                    ve = 64
                    continue e
                  }
                  ;(Ye = 0 | Ge[w >> 2]),
                    (Ge[w >> 2] = Ye + 1),
                    (Ie = 0 | Xe[Ye >> 0]),
                    (Le = 0 | Ge[b >> 2]),
                    (xe = 0 | Ge[l >> 2]),
                    (ve = 70)
                  continue e
                case 82:
                  ;(Ye = (ve = 0) | Ge[w >> 2]), (Ge[w >> 2] = Ye + 1), (Ge[P >> 2] = qe[Ye >> 0]), (ve = 83)
                  continue e
                case 120:
                  ;(Ye = (ve = 0) | Ge[w >> 2]), (Ge[w >> 2] = Ye + 1), (Ge[x >> 2] = qe[Ye >> 0]), (ve = 121)
                  continue e
                case 132:
                  ;(Ye = (ve = 0) | Ge[w >> 2]), (Ge[w >> 2] = Ye + 1), (Ge[H >> 2] = qe[Ye >> 0]), (ve = 133)
                  continue e
                case 178:
                  if (((ve = 0) | Ge[w >> 2]) >>> 0 >= (0 | Ge[R >> 2]) >>> 0) {
                    ve = 179
                    continue e
                  }
                  ;(Ye = 0 | Ge[w >> 2]), (Ge[w >> 2] = Ye + 1), (Ge[oe >> 2] = qe[Ye >> 0]), (ve = 185)
                  continue e
                case 202:
                  ;(Ye = (ve = 0) | Ge[w >> 2]), (Ge[w >> 2] = Ye + 1), (Ge[ie >> 2] = qe[Ye >> 0]), (ve = 203)
                  continue e
                case 224:
                  if (((ve = 0) | Ge[w >> 2]) >>> 0 >= (0 | Ge[R >> 2]) >>> 0) {
                    ve = 225
                    continue e
                  }
                  ;(Ye = 0 | Ge[w >> 2]), (Ge[w >> 2] = Ye + 1), (Ge[ce >> 2] = qe[Ye >> 0]), (ve = 231)
                  continue e
                case 266:
                  ;(Ye = (ve = 0) | Ge[w >> 2]), (Ge[w >> 2] = Ye + 1), (Ge[Ee >> 2] = qe[Ye >> 0]), (ve = 267)
                  continue e
                case 279:
                  if (((ve = 0) | Ge[w >> 2]) >>> 0 >= (0 | Ge[R >> 2]) >>> 0) {
                    ve = 280
                    continue e
                  }
                  ;(Ye = 0 | Ge[w >> 2]), (Ge[w >> 2] = Ye + 1), (Ge[me >> 2] = qe[Ye >> 0]), (ve = 286)
                  continue e
                case 300:
                  ;(Ye = (ve = 0) | Ge[w >> 2]), (Ge[w >> 2] = Ye + 1), (Ge[pe >> 2] = qe[Ye >> 0]), (ve = 301)
                  continue e
                case 325:
                  ;(Ye = (ve = 0) | Ge[w >> 2]), (Ge[w >> 2] = Ye + 1), (Ge[Fe >> 2] = qe[Ye >> 0]), (ve = 326)
                  continue e
                case 337:
                  ;(Ye = (ve = 0) | Ge[w >> 2]), (Ge[w >> 2] = Ye + 1), (Ge[be >> 2] = qe[Ye >> 0]), (ve = 338)
                  continue e
                case 340:
                  if (((ve = 0) | Ge[w >> 2]) >>> 0 >= (0 | Ge[R >> 2]) >>> 0) {
                    ve = 341
                    continue e
                  }
                  ;(Ye = 0 | Ge[w >> 2]), (Ge[w >> 2] = Ye + 1), (Ge[Me >> 2] = qe[Ye >> 0]), (ve = 347)
                  continue e
              }
            } else
              ve =
                ((ve = 0) | Ge[w >> 2]) >>> 0 >= (0 | Ge[R >> 2]) >>> 0
                  ? 43
                  : ((Ue = 0 | Ge[w >> 2]), (Ge[w >> 2] = Ue + 1), (Ge[N >> 2] = qe[Ue >> 0]), 49)
          } else
            ve =
              ((ve = 0) | Ge[w >> 2]) >>> 0 >= (0 | Ge[R >> 2]) >>> 0
                ? 33
                : ((Ue = 0 | Ge[w >> 2]), (Ge[w >> 2] = Ue + 1), (Ge[v >> 2] = qe[Ue >> 0]), 39)
        }
        if (351 == (0 | ve)) {
          for (
            Ge[ye >> 2] = Ge[Te >> 2],
              Ge[Oe >> 2] = Ge[Ge[S >> 2] >> 2],
              Ge[Re >> 2] = 65535 & Ge[(28 + (0 | Ge[l >> 2])) >> 2],
              Ge[Ae >> 2] = (0 | Ge[(28 + (0 | Ge[l >> 2])) >> 2]) >>> 16,
              Ge[ke >> 2] = ((0 | Ge[Oe >> 2]) >>> 0) % 5552 | 0;
            0 | Ge[Oe >> 2];

          ) {
            for (Ge[we >> 2] = 0; !(((7 + (0 | Ge[we >> 2])) | 0) >>> 0 >= (0 | Ge[ke >> 2]) >>> 0); )
              (Ge[Re >> 2] = (0 | Ge[Re >> 2]) + (0 | qe[Ge[ye >> 2] >> 0])),
                (Ge[Ae >> 2] = (0 | Ge[Ae >> 2]) + (0 | Ge[Re >> 2])),
                (Ge[Re >> 2] = (0 | Ge[Re >> 2]) + (0 | qe[(1 + (0 | Ge[ye >> 2])) >> 0])),
                (Ge[Ae >> 2] = (0 | Ge[Ae >> 2]) + (0 | Ge[Re >> 2])),
                (Ge[Re >> 2] = (0 | Ge[Re >> 2]) + (0 | qe[(2 + (0 | Ge[ye >> 2])) >> 0])),
                (Ge[Ae >> 2] = (0 | Ge[Ae >> 2]) + (0 | Ge[Re >> 2])),
                (Ge[Re >> 2] = (0 | Ge[Re >> 2]) + (0 | qe[(3 + (0 | Ge[ye >> 2])) >> 0])),
                (Ge[Ae >> 2] = (0 | Ge[Ae >> 2]) + (0 | Ge[Re >> 2])),
                (Ge[Re >> 2] = (0 | Ge[Re >> 2]) + (0 | qe[(4 + (0 | Ge[ye >> 2])) >> 0])),
                (Ge[Ae >> 2] = (0 | Ge[Ae >> 2]) + (0 | Ge[Re >> 2])),
                (Ge[Re >> 2] = (0 | Ge[Re >> 2]) + (0 | qe[(5 + (0 | Ge[ye >> 2])) >> 0])),
                (Ge[Ae >> 2] = (0 | Ge[Ae >> 2]) + (0 | Ge[Re >> 2])),
                (Ge[Re >> 2] = (0 | Ge[Re >> 2]) + (0 | qe[(6 + (0 | Ge[ye >> 2])) >> 0])),
                (Ge[Ae >> 2] = (0 | Ge[Ae >> 2]) + (0 | Ge[Re >> 2])),
                (Ge[Re >> 2] = (0 | Ge[Re >> 2]) + (0 | qe[(7 + (0 | Ge[ye >> 2])) >> 0])),
                (Ge[Ae >> 2] = (0 | Ge[Ae >> 2]) + (0 | Ge[Re >> 2])),
                (Ge[we >> 2] = 8 + (0 | Ge[we >> 2])),
                (Ge[ye >> 2] = 8 + (0 | Ge[ye >> 2]))
            for (; !((0 | Ge[we >> 2]) >>> 0 >= (0 | Ge[ke >> 2]) >>> 0); )
              (Te = 0 | Ge[ye >> 2]),
                (Ge[ye >> 2] = Te + 1),
                (Ge[Re >> 2] = (0 | Ge[Re >> 2]) + (0 | qe[Te >> 0])),
                (Ge[Ae >> 2] = (0 | Ge[Ae >> 2]) + (0 | Ge[Re >> 2])),
                (Ge[we >> 2] = 1 + (0 | Ge[we >> 2]))
            ;(Ge[Re >> 2] = ((0 | Ge[Re >> 2]) >>> 0) % 65521 | 0),
              (Ge[Ae >> 2] = ((0 | Ge[Ae >> 2]) >>> 0) % 65521 | 0),
              (Ge[Oe >> 2] = (0 | Ge[Oe >> 2]) - (0 | Ge[ke >> 2])),
              (Ge[ke >> 2] = 5552)
          }
          ;(Ge[(28 + (0 | Ge[l >> 2])) >> 2] = (Ge[Ae >> 2] << 16) + (0 | Ge[Re >> 2])),
            0 == (0 | Ge[p >> 2]) &&
              (1 & Ge[_ >> 2]) | 0 &&
              (0 | Ge[(28 + (0 | Ge[l >> 2])) >> 2]) != (0 | Ge[(16 + (0 | Ge[l >> 2])) >> 2]) &&
              (Ge[p >> 2] = -2)
        }
        return (Ge[c >> 2] = Ge[p >> 2]), (Ke = 0 | Ge[c >> 2]), (Ze = We), 0 | Ke
      }
      return (
        (Ge[Ge[S >> 2] >> 2] = 0),
        (Ge[Ge[d >> 2] >> 2] = 0),
        (Ge[c >> 2] = -3),
        (Ke = 0 | Ge[c >> 2]),
        (Ze = We),
        0 | Ke
      )
    }
    function x(e) {
      e |= 0
      var r,
        t = 0,
        n = 0,
        o = 0,
        i = 0,
        a = 0,
        s = 0,
        u = 0,
        c = 0,
        l = 0,
        f = 0,
        d = 0,
        E = 0,
        S = 0,
        _ = 0,
        m = 0,
        h = 0,
        p = 0,
        F = 0,
        M = 0,
        b = 0,
        y = 0,
        O = 0,
        w = 0,
        R = 0,
        A = 0,
        k = 0,
        T = 0,
        g = 0,
        v = 0,
        N = 0,
        D = 0,
        P = 0,
        C = 0,
        I = 0,
        L = 0,
        x = 0,
        B = 0,
        H = 0,
        U = 0,
        Y = 0,
        z = 0,
        V = 0,
        K = 0,
        W = 0,
        X = 0,
        j = 0,
        G = 0,
        q = 0,
        Z = 0,
        J = 0,
        Q = 0,
        $ = 0,
        ee = 0,
        re = 0,
        te = 0,
        ne = 0,
        oe = 0,
        ie = 0,
        ae = 0,
        se = 0,
        ue = 0,
        ce = 0,
        le = 0,
        fe = 0,
        de = 0,
        Ee = 0,
        Se = 0,
        _e = 0,
        me = 0,
        he = 0,
        pe = 0,
        Fe = 0,
        Me = 0,
        be = 0,
        ye = Ze
      ;(0 | Je) <= (0 | (Ze = (Ze + 16) | 0)) && Qe(16), (t = ye)
      do {
        if (e >>> 0 < 245) {
          if (((o = (n = e >>> 0 < 11 ? 16 : (e + 11) & -8) >>> 3), (3 & (a = (i = 0 | Ge[948]) >>> o)) | 0))
            return (
              (l = 0 | Ge[(c = ((u = (3832 + (((s = (((1 & a) ^ 1) + o) | 0) << 1) << 2)) | 0) + 8) | 0) >> 2]),
              (0 | u) == (0 | (d = 0 | Ge[(f = (l + 8) | 0) >> 2]))
                ? (Ge[948] = i & ~(1 << s))
                : ((Ge[(d + 12) >> 2] = u), (Ge[c >> 2] = d)),
              (d = s << 3),
              (Ge[(l + 4) >> 2] = 3 | d),
              (Ge[(s = (l + d + 4) | 0) >> 2] = 1 | Ge[s >> 2]),
              (Ze = ye),
              0 | (E = f)
            )
          if ((f = 0 | Ge[950]) >>> 0 < n >>> 0) {
            if (0 | a)
              return (
                (a =
                  0 |
                  Ge[
                    (c =
                      ((l =
                        (3832 +
                          (((u =
                            (((s =
                              ((o =
                                (s = (((d = (a << o) & ((s = 2 << o) | (0 - s))) & (0 - d)) - 1) | 0) >>>
                                (d = (s >>> 12) & 16)) >>>
                                5) &
                              8) |
                              d |
                              (o = ((a = o >>> s) >>> 2) & 4) |
                              (a = ((l = a >>> o) >>> 1) & 2) |
                              (l = ((c = l >>> a) >>> 1) & 1)) +
                              (c >>> l)) |
                            0) <<
                            1) <<
                            2)) |
                        0) +
                        8) |
                      0) >> 2
                  ]),
                (S =
                  (0 | l) == (0 | (d = 0 | Ge[(o = (a + 8) | 0) >> 2]))
                    ? ((s = i & ~(1 << u)), (Ge[948] = s))
                    : ((Ge[(d + 12) >> 2] = l), (Ge[c >> 2] = d), i)),
                (d = ((u << 3) - n) | 0),
                (Ge[(a + 4) >> 2] = 3 | n),
                (Ge[((u = (a + n) | 0) + 4) >> 2] = 1 | d),
                (Ge[(u + d) >> 2] = d),
                0 | f &&
                  ((a = 0 | Ge[953]),
                  (l = (3832 + (((c = f >>> 3) << 1) << 2)) | 0),
                  (m =
                    S & (s = 1 << c)
                      ? ((_ = 0 | Ge[(s = (l + 8) | 0) >> 2]), s)
                      : ((Ge[948] = S | s), ((_ = l) + 8) | 0)),
                  (Ge[m >> 2] = a),
                  (Ge[(_ + 12) >> 2] = a),
                  (Ge[(a + 8) >> 2] = _),
                  (Ge[(a + 12) >> 2] = l)),
                (Ge[950] = d),
                (Ge[953] = u),
                (Ze = ye),
                0 | (E = o)
              )
            if ((o = 0 | Ge[949])) {
              if (
                ((h =
                  0 |
                  Ge[
                    (4096 +
                      ((((u = ((l = (u = ((o & (0 - o)) - 1) | 0) >>> (d = (u >>> 12) & 16)) >>> 5) & 8) |
                        d |
                        (l = ((a = l >>> u) >>> 2) & 4) |
                        (a = ((s = a >>> l) >>> 1) & 2) |
                        (s = ((c = s >>> a) >>> 1) & 1)) +
                        (c >>> s)) <<
                        2)) >>
                      2
                  ]),
                (s = ((-8 & Ge[(h + 4) >> 2]) - n) | 0),
                (c = 0 | Ge[(h + 16 + (((0 == (0 | Ge[(h + 16) >> 2])) & 1) << 2)) >> 2]))
              )
                for (a = h, h = s, s = c; ; ) {
                  if (
                    ((d = (l = (c = ((-8 & Ge[(s + 4) >> 2]) - n) | 0) >>> 0 < h >>> 0) ? c : h),
                    (c = l ? s : a),
                    !(s = 0 | Ge[(s + 16 + (((0 == (0 | Ge[(s + 16) >> 2])) & 1) << 2)) >> 2]))
                  ) {
                    ;(p = c), (F = d)
                    break
                  }
                  ;(a = c), (h = d)
                }
              else (p = h), (F = s)
              if (p >>> 0 < (h = (p + n) | 0) >>> 0) {
                ;(a = 0 | Ge[(p + 24) >> 2]), (s = 0 | Ge[(p + 12) >> 2])
                do {
                  if ((0 | s) == (0 | p)) {
                    if ((c = 0 | Ge[(d = (p + 20) | 0) >> 2])) (b = c), (y = d)
                    else {
                      if (!(u = 0 | Ge[(l = (p + 16) | 0) >> 2])) {
                        M = 0
                        break
                      }
                      ;(b = u), (y = l)
                    }
                    for (;;)
                      if (0 | (c = 0 | Ge[(d = (b + 20) | 0) >> 2])) (b = c), (y = d)
                      else {
                        if (!(c = 0 | Ge[(d = (b + 16) | 0) >> 2])) break
                        ;(b = c), (y = d)
                      }
                    ;(Ge[y >> 2] = 0), (M = b)
                  } else (d = 0 | Ge[(p + 8) >> 2]), (Ge[(d + 12) >> 2] = s), (Ge[(s + 8) >> 2] = d), (M = s)
                } while (0)
                do {
                  if (0 | a) {
                    if (((s = 0 | Ge[(p + 28) >> 2]), (0 | p) == (0 | Ge[(d = (4096 + (s << 2)) | 0) >> 2]))) {
                      if (!(Ge[d >> 2] = M)) {
                        Ge[949] = o & ~(1 << s)
                        break
                      }
                    } else if (!(Ge[(a + 16 + ((((0 | Ge[(a + 16) >> 2]) != (0 | p)) & 1) << 2)) >> 2] = M)) break
                    ;(Ge[(M + 24) >> 2] = a),
                      0 | (s = 0 | Ge[(p + 16) >> 2]) && ((Ge[(M + 16) >> 2] = s), (Ge[(s + 24) >> 2] = M)),
                      0 | (s = 0 | Ge[(p + 20) >> 2]) && ((Ge[(M + 20) >> 2] = s), (Ge[(s + 24) >> 2] = M))
                  }
                } while (0)
                return (
                  F >>> 0 < 16
                    ? ((a = (F + n) | 0), (Ge[(p + 4) >> 2] = 3 | a), (Ge[(o = (p + a + 4) | 0) >> 2] = 1 | Ge[o >> 2]))
                    : ((Ge[(p + 4) >> 2] = 3 | n),
                      (Ge[(h + 4) >> 2] = 1 | F),
                      (Ge[(h + F) >> 2] = F),
                      0 | f &&
                        ((o = 0 | Ge[953]),
                        (s = (3832 + (((a = f >>> 3) << 1) << 2)) | 0),
                        (w =
                          i & (d = 1 << a)
                            ? ((O = 0 | Ge[(d = (s + 8) | 0) >> 2]), d)
                            : ((Ge[948] = i | d), ((O = s) + 8) | 0)),
                        (Ge[w >> 2] = o),
                        (Ge[(O + 12) >> 2] = o),
                        (Ge[(o + 8) >> 2] = O),
                        (Ge[(o + 12) >> 2] = s)),
                      (Ge[950] = F),
                      (Ge[953] = h)),
                  (Ze = ye),
                  0 | (E = (p + 8) | 0)
                )
              }
              R = n
            } else R = n
          } else R = n
        } else if (e >>> 0 <= 4294967231)
          if (((o = -8 & (s = (e + 11) | 0)), (d = 0 | Ge[949]))) {
            ;(a = (0 - o) | 0),
              (A = (c = s >>> 8)
                ? 16777215 < o >>> 0
                  ? 31
                  : ((o >>>
                      (((k =
                        (14 -
                          ((c = ((((l = c << (s = (((c + 1048320) | 0) >>> 16) & 8)) + 520192) | 0) >>> 16) & 4) |
                            s |
                            (l = ((((u = l << c) + 245760) | 0) >>> 16) & 2)) +
                          ((u << l) >>> 15)) |
                        0) +
                        7) |
                        0)) &
                      1) |
                    (k << 1)
                : 0),
              (k = 0 | Ge[(4096 + (A << 2)) >> 2])
            e: do {
              if (k)
                for (u = a, s = k, c = o << (31 == ((l = 0) | A) ? 0 : (25 - (A >>> 1)) | 0), D = 0; ; ) {
                  if ((P = ((-8 & Ge[(s + 4) >> 2]) - o) | 0) >>> 0 < u >>> 0) {
                    if (!P) {
                      ;(I = 0), (L = C = s), (N = 61)
                      break e
                    }
                    ;(x = s), (B = P)
                  } else (x = l), (B = u)
                  if (
                    ((r =
                      (0 == (0 | (P = 0 | Ge[(s + 20) >> 2]))) |
                      ((0 | P) == (0 | (s = 0 | Ge[(s + 16 + ((c >>> 31) << 2)) >> 2])))
                        ? D
                        : P),
                    (P = 0 == (0 | s)))
                  ) {
                    ;(T = r), (g = x), (v = B), (N = 57)
                    break
                  }
                  ;(l = x), (u = B), (c <<= 1 & (1 ^ P)), (D = r)
                }
              else (g = T = 0), (v = a), (N = 57)
            } while (0)
            if (57 == (0 | N)) {
              if ((0 == (0 | T)) & (0 == (0 | g))) {
                if (!(a = d & ((k = 2 << A) | (0 - k)))) {
                  R = o
                  break
                }
                U =
                  (H = 0) |
                  Ge[
                    (4096 +
                      ((((k = ((n = (k = ((a & (0 - a)) - 1) | 0) >>> (a = (k >>> 12) & 16)) >>> 5) & 8) |
                        a |
                        (n = ((h = n >>> k) >>> 2) & 4) |
                        (h = ((i = h >>> n) >>> 1) & 2) |
                        (i = ((f = i >>> h) >>> 1) & 1)) +
                        (f >>> i)) <<
                        2)) >>
                      2
                  ]
              } else (H = g), (U = T)
              U ? ((C = H), (I = v), (L = U), (N = 61)) : ((Y = H), (z = v))
            }
            if (61 == (0 | N))
              for (;;) {
                if (
                  ((N = 0),
                  (h = (f = (i = ((-8 & Ge[(L + 4) >> 2]) - o) | 0) >>> 0 < I >>> 0) ? i : I),
                  (i = f ? L : C),
                  !(L = 0 | Ge[(L + 16 + (((0 == (0 | Ge[(L + 16) >> 2])) & 1) << 2)) >> 2]))
                ) {
                  ;(Y = i), (z = h)
                  break
                }
                ;(C = i), (I = h), (N = 61)
              }
            if (0 != (0 | Y) && z >>> 0 < (((0 | Ge[950]) - o) | 0) >>> 0) {
              if ((h = (Y + o) | 0) >>> 0 <= Y >>> 0) return (Ze = ye), (E = 0) | E
              ;(i = 0 | Ge[(Y + 24) >> 2]), (f = 0 | Ge[(Y + 12) >> 2])
              do {
                if ((0 | f) == (0 | Y)) {
                  if ((a = 0 | Ge[(n = (Y + 20) | 0) >> 2])) (K = a), (W = n)
                  else {
                    if (!(D = 0 | Ge[(k = (Y + 16) | 0) >> 2])) {
                      V = 0
                      break
                    }
                    ;(K = D), (W = k)
                  }
                  for (;;)
                    if (0 | (a = 0 | Ge[(n = (K + 20) | 0) >> 2])) (K = a), (W = n)
                    else {
                      if (!(a = 0 | Ge[(n = (K + 16) | 0) >> 2])) break
                      ;(K = a), (W = n)
                    }
                  ;(Ge[W >> 2] = 0), (V = K)
                } else (n = 0 | Ge[(Y + 8) >> 2]), (Ge[(n + 12) >> 2] = f), (Ge[(f + 8) >> 2] = n), (V = f)
              } while (0)
              do {
                if (i) {
                  if (((f = 0 | Ge[(Y + 28) >> 2]), (0 | Y) == (0 | Ge[(n = (4096 + (f << 2)) | 0) >> 2]))) {
                    if (!(Ge[n >> 2] = V)) {
                      ;(n = d & ~(1 << f)), (X = Ge[949] = n)
                      break
                    }
                  } else if (!(Ge[(i + 16 + ((((0 | Ge[(i + 16) >> 2]) != (0 | Y)) & 1) << 2)) >> 2] = V)) {
                    X = d
                    break
                  }
                  ;(Ge[(V + 24) >> 2] = i),
                    0 | (n = 0 | Ge[(Y + 16) >> 2]) && ((Ge[(V + 16) >> 2] = n), (Ge[(n + 24) >> 2] = V)),
                    (X = ((n = 0 | Ge[(Y + 20) >> 2]) && ((Ge[(V + 20) >> 2] = n), (Ge[(n + 24) >> 2] = V)), d))
                } else X = d
              } while (0)
              do {
                if (16 <= z >>> 0) {
                  if (
                    ((Ge[(Y + 4) >> 2] = 3 | o),
                    (Ge[(h + 4) >> 2] = 1 | z),
                    (d = (Ge[(h + z) >> 2] = z) >>> 3),
                    z >>> 0 < 256)
                  ) {
                    ;(i = (3832 + ((d << 1) << 2)) | 0),
                      (G =
                        (n = 0 | Ge[948]) & (f = 1 << d)
                          ? ((j = 0 | Ge[(f = (i + 8) | 0) >> 2]), f)
                          : ((Ge[948] = n | f), ((j = i) + 8) | 0)),
                      (Ge[G >> 2] = h),
                      (Ge[(j + 12) >> 2] = h),
                      (Ge[(h + 8) >> 2] = j),
                      (Ge[(h + 12) >> 2] = i)
                    break
                  }
                  if (
                    ((a =
                      (4096 +
                        ((q = (i = z >>> 8)
                          ? 16777215 < z >>> 0
                            ? 31
                            : ((z >>>
                                (((a =
                                  (14 -
                                    ((i =
                                      ((((n = i << (f = (((i + 1048320) | 0) >>> 16) & 8)) + 520192) | 0) >>> 16) & 4) |
                                      f |
                                      (n = ((((d = n << i) + 245760) | 0) >>> 16) & 2)) +
                                    ((d << n) >>> 15)) |
                                  0) +
                                  7) |
                                  0)) &
                                1) |
                              (a << 1)
                          : 0) <<
                          2)) |
                      0),
                    (Ge[(h + 28) >> 2] = q),
                    (Ge[((n = (h + 16) | 0) + 4) >> 2] = 0),
                    (Ge[n >> 2] = 0),
                    !(X & (n = 1 << q)))
                  ) {
                    ;(Ge[949] = X | n),
                      (Ge[a >> 2] = h),
                      (Ge[(h + 24) >> 2] = a),
                      (Ge[(h + 12) >> 2] = h),
                      (Ge[(h + 8) >> 2] = h)
                    break
                  }
                  for (n = z << (31 == (0 | q) ? 0 : (25 - (q >>> 1)) | 0), d = 0 | Ge[a >> 2]; ; ) {
                    if (((-8 & Ge[(d + 4) >> 2]) | 0) == (0 | z)) {
                      N = 97
                      break
                    }
                    if (!(a = 0 | Ge[(Z = (d + 16 + ((n >>> 31) << 2)) | 0) >> 2])) {
                      N = 96
                      break
                    }
                    ;(n <<= 1), (d = a)
                  }
                  if (96 == (0 | N)) {
                    ;(Ge[Z >> 2] = h), (Ge[(h + 24) >> 2] = d), (Ge[(h + 12) >> 2] = h), (Ge[(h + 8) >> 2] = h)
                    break
                  }
                  if (97 == (0 | N)) {
                    ;(a = 0 | Ge[(n = (d + 8) | 0) >> 2]),
                      (Ge[(a + 12) >> 2] = h),
                      (Ge[n >> 2] = h),
                      (Ge[(h + 8) >> 2] = a),
                      (Ge[(h + 12) >> 2] = d),
                      (Ge[(h + 24) >> 2] = 0)
                    break
                  }
                } else (a = (z + o) | 0), (Ge[(Y + 4) >> 2] = 3 | a), (Ge[(n = (Y + a + 4) | 0) >> 2] = 1 | Ge[n >> 2])
              } while (0)
              return (Ze = ye), 0 | (E = (Y + 8) | 0)
            }
            R = o
          } else R = o
        else R = -1
      } while (0)
      if (R >>> 0 <= (Y = 0 | Ge[950]) >>> 0)
        return (
          (z = (Y - R) | 0),
          (Z = 0 | Ge[953]),
          15 < z >>> 0
            ? ((q = (Z + R) | 0),
              (Ge[953] = q),
              (Ge[950] = z),
              (Ge[(q + 4) >> 2] = 1 | z),
              (Ge[(q + z) >> 2] = z),
              (Ge[(Z + 4) >> 2] = 3 | R))
            : ((Ge[950] = 0),
              (Ge[953] = 0),
              (Ge[(Z + 4) >> 2] = 3 | Y),
              (Ge[(z = (Z + Y + 4) | 0) >> 2] = 1 | Ge[z >> 2])),
          (Ze = ye),
          0 | (E = (Z + 8) | 0)
        )
      if (R >>> 0 < (Z = 0 | Ge[951]) >>> 0)
        return (
          (z = (Z - R) | 0),
          (Ge[951] = z),
          (q = ((Y = 0 | Ge[954]) + R) | 0),
          (Ge[954] = q),
          (Ge[(q + 4) >> 2] = 1 | z),
          (Ge[(Y + 4) >> 2] = 3 | R),
          (Ze = ye),
          0 | (E = (Y + 8) | 0)
        )
      if (
        ((J =
          0 | Ge[1066]
            ? 0 | Ge[1068]
            : ((Ge[1068] = 4096),
              (Ge[1067] = 4096),
              (Ge[1069] = -1),
              (Ge[1070] = -1),
              (Ge[1071] = 0),
              (Ge[1059] = 0),
              (Y = (-16 & t) ^ 1431655768),
              (Ge[t >> 2] = Y),
              (Ge[1066] = Y),
              4096)),
        (Y = (R + 48) | 0),
        (J = (z = (J + (t = (R + 47) | 0)) | 0) & (q = (0 - J) | 0)) >>> 0 <= R >>> 0)
      )
        return (Ze = ye), (E = 0) | E
      if (0 | (X = 0 | Ge[1058]) && ((G = ((j = 0 | Ge[1056]) + J) | 0) >>> 0 <= j >>> 0) | (X >>> 0 < G >>> 0))
        return (Ze = ye), (E = 0) | E
      e: do {
        if (4 & Ge[1059]) (oe = 0), (N = 133)
        else {
          X = 0 | Ge[954]
          r: do {
            if (X) {
              for (
                G = 4240;
                !(
                  (j = 0 | Ge[G >> 2]) >>> 0 <= X >>> 0 && ((j + (0 | Ge[(Q = (G + 4) | 0) >> 2])) | 0) >>> 0 > X >>> 0
                );

              ) {
                if (!(j = 0 | Ge[(G + 8) >> 2])) {
                  N = 118
                  break r
                }
                G = j
              }
              if ((d = (z - Z) & q) >>> 0 < 2147483647)
                if ((0 | (j = 0 | Oe(0 | d))) == (((0 | Ge[G >> 2]) + (0 | Ge[Q >> 2])) | 0)) {
                  if (-1 != (0 | j)) {
                    ;(ee = d), (re = j), (N = 135)
                    break e
                  }
                  $ = d
                } else (te = j), (ne = d), (N = 126)
              else $ = 0
            } else N = 118
          } while (0)
          do {
            if (118 == (0 | N))
              if (
                -1 != (0 | (X = 0 | Oe(0))) &&
                ((o = X),
                (d =
                  ((V =
                    ((0 == (((j = ((d = 0 | Ge[1067]) + -1) | 0) & o) | 0) ? 0 : (((j + o) & (0 - d)) - o) | 0) + J) |
                    0) +
                    (o = 0 | Ge[1056])) |
                  0),
                (R >>> 0 < V >>> 0) & (V >>> 0 < 2147483647))
              ) {
                if (0 | (j = 0 | Ge[1058]) && (d >>> 0 <= o >>> 0) | (j >>> 0 < d >>> 0)) {
                  $ = 0
                  break
                }
                if ((0 | (j = 0 | Oe(0 | V))) == (0 | X)) {
                  ;(ee = V), (re = X), (N = 135)
                  break e
                }
                ;(te = j), (ne = V), (N = 126)
              } else $ = 0
          } while (0)
          do {
            if (126 == (0 | N)) {
              if (((V = (0 - ne) | 0), !((ne >>> 0 < Y >>> 0) & (ne >>> 0 < 2147483647) & (-1 != (0 | te))))) {
                if (-1 == (0 | te)) {
                  $ = 0
                  break
                }
                ;(ee = ne), (re = te), (N = 135)
                break e
              }
              if (2147483647 <= (X = (t - ne + (j = 0 | Ge[1068])) & (0 - j)) >>> 0) {
                ;(ee = ne), (re = te), (N = 135)
                break e
              }
              if (-1 == (0 | Oe(0 | X))) {
                Oe(0 | V), ($ = 0)
                break
              }
              ;(ee = (X + ne) | 0), (re = te), (N = 135)
              break e
            }
          } while (0)
          ;(Ge[1059] = 4 | Ge[1059]), (oe = $), (N = 133)
        }
      } while (0)
      if (
        (133 == (0 | N) &&
          J >>> 0 < 2147483647 &&
          !(
            (-1 == (0 | ($ = 0 | Oe(0 | J)))) |
            (1 ^ (ne = ((R + 40) | 0) >>> 0 < (te = ((J = 0 | Oe(0)) - $) | 0) >>> 0)) |
            ((($ >>> 0 < J >>> 0) & (-1 != (0 | $)) & (-1 != (0 | J))) ^ 1)
          ) &&
          ((ee = ne ? te : oe), (re = $), (N = 135)),
        135 == (0 | N))
      ) {
        ;($ = ((0 | Ge[1056]) + ee) | 0),
          (Ge[1056] = $) >>> 0 > (0 | Ge[1057]) >>> 0 && (Ge[1057] = $),
          ($ = 0 | Ge[954])
        do {
          if ($) {
            for (oe = 4240; ; ) {
              if ((0 | re) == (((ie = 0 | Ge[oe >> 2]) + (se = 0 | Ge[(ae = (oe + 4) | 0) >> 2])) | 0)) {
                N = 145
                break
              }
              if (!(te = 0 | Ge[(oe + 8) >> 2])) break
              oe = te
            }
            if (145 == (0 | N) && 0 == ((8 & Ge[(oe + 12) >> 2]) | 0) && ($ >>> 0 < re >>> 0) & (ie >>> 0 <= $ >>> 0)) {
              ;(Ge[ae >> 2] = se + ee),
                (te = ($ + (ne = 0 == ((7 & (te = ($ + 8) | 0)) | 0) ? 0 : (0 - te) & 7)) | 0),
                (J = ((0 | Ge[951]) + (ee - ne)) | 0),
                (Ge[954] = te),
                (Ge[951] = J),
                (Ge[(te + 4) >> 2] = 1 | J),
                (Ge[(te + J + 4) >> 2] = 40),
                (Ge[955] = Ge[1070])
              break
            }
            for (re >>> 0 < (0 | Ge[952]) >>> 0 && (Ge[952] = re), J = (re + ee) | 0, te = 4240; ; ) {
              if ((0 | Ge[te >> 2]) == (0 | J)) {
                N = 153
                break
              }
              if (!(ne = 0 | Ge[(te + 8) >> 2])) break
              te = ne
            }
            if (153 == (0 | N) && 0 == ((8 & Ge[(te + 12) >> 2]) | 0)) {
              ;(Ge[te >> 2] = re),
                (Ge[(oe = (te + 4) | 0) >> 2] = (0 | Ge[oe >> 2]) + ee),
                (ne = (re + (0 == ((7 & (oe = (re + 8) | 0)) | 0) ? 0 : (0 - oe) & 7)) | 0),
                (t = (J + (0 == ((7 & (oe = (J + 8) | 0)) | 0) ? 0 : (0 - oe) & 7)) | 0),
                (oe = (ne + R) | 0),
                (Y = (t - ne - R) | 0),
                (Ge[(ne + 4) >> 2] = 3 | R)
              do {
                if ((0 | t) != (0 | $)) {
                  if ((0 | t) == (0 | Ge[953])) {
                    ;(Q = ((0 | Ge[950]) + Y) | 0),
                      (Ge[950] = Q),
                      (Ge[953] = oe),
                      (Ge[(oe + 4) >> 2] = 1 | Q),
                      (Ge[(oe + Q) >> 2] = Q)
                    break
                  }
                  if (1 == ((3 & (Q = 0 | Ge[(t + 4) >> 2])) | 0)) {
                    ;(q = -8 & Q), (Z = Q >>> 3)
                    e: do {
                      if (Q >>> 0 < 256) {
                        if (((z = 0 | Ge[(t + 8) >> 2]), (0 | (X = 0 | Ge[(t + 12) >> 2])) == (0 | z))) {
                          Ge[948] = Ge[948] & ~(1 << Z)
                          break
                        }
                        ;(Ge[(z + 12) >> 2] = X), (Ge[(X + 8) >> 2] = z)
                        break
                      }
                      ;(z = 0 | Ge[(t + 24) >> 2]), (X = 0 | Ge[(t + 12) >> 2])
                      do {
                        if ((0 | X) == (0 | t)) {
                          if ((d = 0 | Ge[(j = ((V = (t + 16) | 0) + 4) | 0) >> 2])) (ce = d), (le = j)
                          else {
                            if (!(o = 0 | Ge[V >> 2])) {
                              ue = 0
                              break
                            }
                            ;(ce = o), (le = V)
                          }
                          for (;;)
                            if (0 | (d = 0 | Ge[(j = (ce + 20) | 0) >> 2])) (ce = d), (le = j)
                            else {
                              if (!(d = 0 | Ge[(j = (ce + 16) | 0) >> 2])) break
                              ;(ce = d), (le = j)
                            }
                          ;(Ge[le >> 2] = 0), (ue = ce)
                        } else (j = 0 | Ge[(t + 8) >> 2]), (Ge[(j + 12) >> 2] = X), (Ge[(X + 8) >> 2] = j), (ue = X)
                      } while (0)
                      if (!z) break
                      j = (4096 + ((X = 0 | Ge[(t + 28) >> 2]) << 2)) | 0
                      do {
                        if ((0 | t) == (0 | Ge[j >> 2])) {
                          if (0 | (Ge[j >> 2] = ue)) break
                          Ge[949] = Ge[949] & ~(1 << X)
                          break e
                        }
                        if (!(Ge[(z + 16 + ((((0 | Ge[(z + 16) >> 2]) != (0 | t)) & 1) << 2)) >> 2] = ue)) break e
                      } while (0)
                    } while (
                      ((Ge[(ue + 24) >> 2] = z),
                      0 | (j = 0 | Ge[(X = (t + 16) | 0) >> 2]) && ((Ge[(ue + 16) >> 2] = j), (Ge[(j + 24) >> 2] = ue)),
                      (j = 0 | Ge[(X + 4) >> 2])) &&
                      ((Ge[(ue + 20) >> 2] = j), (Ge[(j + 24) >> 2] = ue), 0)
                    )
                    ;(fe = (t + q) | 0), (de = (q + Y) | 0)
                  } else (fe = t), (de = Y)
                  if (
                    ((Ge[(Z = (fe + 4) | 0) >> 2] = -2 & Ge[Z >> 2]),
                    (Ge[(oe + 4) >> 2] = 1 | de),
                    (Z = (Ge[(oe + de) >> 2] = de) >>> 3),
                    de >>> 0 < 256)
                  ) {
                    ;(Q = (3832 + ((Z << 1) << 2)) | 0),
                      (Se =
                        (G = 0 | Ge[948]) & (j = 1 << Z)
                          ? ((Ee = 0 | Ge[(j = (Q + 8) | 0) >> 2]), j)
                          : ((Ge[948] = G | j), ((Ee = Q) + 8) | 0)),
                      (Ge[Se >> 2] = oe),
                      (Ge[(Ee + 12) >> 2] = oe),
                      (Ge[(oe + 8) >> 2] = Ee),
                      (Ge[(oe + 12) >> 2] = Q)
                    break
                  }
                  Q = de >>> 8
                  do {
                    if (Q) {
                      if (16777215 < de >>> 0) {
                        _e = 31
                        break
                      }
                      _e =
                        ((de >>>
                          (((d =
                            (14 -
                              ((Z = ((((G = Q << (j = (((Q + 1048320) | 0) >>> 16) & 8)) + 520192) | 0) >>> 16) & 4) |
                                j |
                                (G = ((((X = G << Z) + 245760) | 0) >>> 16) & 2)) +
                              ((X << G) >>> 15)) |
                            0) +
                            7) |
                            0)) &
                          1) |
                        (d << 1)
                    } else _e = 0
                  } while (0)
                  if (
                    ((Q = (4096 + (_e << 2)) | 0),
                    (Ge[(oe + 28) >> 2] = _e),
                    (Ge[((q = (oe + 16) | 0) + 4) >> 2] = 0),
                    !((q = (Ge[q >> 2] = 0) | Ge[949]) & (d = 1 << _e)))
                  ) {
                    ;(Ge[949] = q | d),
                      (Ge[Q >> 2] = oe),
                      (Ge[(oe + 24) >> 2] = Q),
                      (Ge[(oe + 12) >> 2] = oe),
                      (Ge[(oe + 8) >> 2] = oe)
                    break
                  }
                  for (d = de << (31 == (0 | _e) ? 0 : (25 - (_e >>> 1)) | 0), q = 0 | Ge[Q >> 2]; ; ) {
                    if (((-8 & Ge[(q + 4) >> 2]) | 0) == (0 | de)) {
                      N = 194
                      break
                    }
                    if (!(Q = 0 | Ge[(me = (q + 16 + ((d >>> 31) << 2)) | 0) >> 2])) {
                      N = 193
                      break
                    }
                    ;(d <<= 1), (q = Q)
                  }
                  if (193 == (0 | N)) {
                    ;(Ge[me >> 2] = oe), (Ge[(oe + 24) >> 2] = q), (Ge[(oe + 12) >> 2] = oe), (Ge[(oe + 8) >> 2] = oe)
                    break
                  }
                  if (194 == (0 | N)) {
                    ;(Q = 0 | Ge[(d = (q + 8) | 0) >> 2]),
                      (Ge[(Q + 12) >> 2] = oe),
                      (Ge[d >> 2] = oe),
                      (Ge[(oe + 8) >> 2] = Q),
                      (Ge[(oe + 12) >> 2] = q),
                      (Ge[(oe + 24) >> 2] = 0)
                    break
                  }
                } else (Q = ((0 | Ge[951]) + Y) | 0), (Ge[951] = Q), (Ge[954] = oe), (Ge[(oe + 4) >> 2] = 1 | Q)
              } while (0)
              return (Ze = ye), 0 | (E = (ne + 8) | 0)
            }
            for (
              oe = 4240;
              !((Y = 0 | Ge[oe >> 2]) >>> 0 <= $ >>> 0 && $ >>> 0 < (he = (Y + (0 | Ge[(oe + 4) >> 2])) | 0) >>> 0);

            )
              oe = 0 | Ge[(oe + 8) >> 2]
            for (
              oe = (he + -47) | 0,
                ne = (oe + 8) | 0,
                Y = (oe + (0 == ((7 & ne) | 0) ? 0 : (0 - ne) & 7)) | 0,
                ne = ($ + 16) | 0,
                oe = Y >>> 0 < ne >>> 0 ? $ : Y,
                Y = (oe + 8) | 0,
                t = (re + 8) | 0,
                J = 0 == ((7 & t) | 0) ? 0 : (0 - t) & 7,
                t = (re + J) | 0,
                te = (ee + -40 - J) | 0,
                Ge[954] = t,
                Ge[951] = te,
                Ge[(t + 4) >> 2] = 1 | te,
                Ge[(t + te + 4) >> 2] = 40,
                Ge[955] = Ge[1070],
                te = (oe + 4) | 0,
                Ge[te >> 2] = 27,
                Ge[Y >> 2] = Ge[1060],
                Ge[(Y + 4) >> 2] = Ge[1061],
                Ge[(Y + 8) >> 2] = Ge[1062],
                Ge[(Y + 12) >> 2] = Ge[1063],
                Ge[1060] = re,
                Ge[1061] = ee,
                Ge[1063] = 0,
                Ge[1062] = Y,
                Y = (oe + 24) | 0;
              (Ge[(Y = ((t = Y) + 4) | 0) >> 2] = 7), ((t + 8) | 0) >>> 0 < he >>> 0;

            );
            if ((0 | oe) != (0 | $)) {
              if (
                ((Y = (oe - $) | 0),
                (Ge[te >> 2] = -2 & Ge[te >> 2]),
                (Ge[($ + 4) >> 2] = 1 | Y),
                (t = (Ge[oe >> 2] = Y) >>> 3),
                Y >>> 0 < 256)
              ) {
                ;(J = (3832 + ((t << 1) << 2)) | 0),
                  (Fe =
                    (Q = 0 | Ge[948]) & (d = 1 << t)
                      ? ((pe = 0 | Ge[(d = (J + 8) | 0) >> 2]), d)
                      : ((Ge[948] = Q | d), ((pe = J) + 8) | 0)),
                  (Ge[Fe >> 2] = $),
                  (Ge[(pe + 12) >> 2] = $),
                  (Ge[($ + 8) >> 2] = pe),
                  (Ge[($ + 12) >> 2] = J)
                break
              }
              if (
                ((G =
                  (4096 +
                    ((Me = (J = Y >>> 8)
                      ? 16777215 < Y >>> 0
                        ? 31
                        : ((Y >>>
                            (((G =
                              (14 -
                                ((J = ((((Q = J << (d = (((J + 1048320) | 0) >>> 16) & 8)) + 520192) | 0) >>> 16) & 4) |
                                  d |
                                  (Q = ((((t = Q << J) + 245760) | 0) >>> 16) & 2)) +
                                ((t << Q) >>> 15)) |
                              0) +
                              7) |
                              0)) &
                            1) |
                          (G << 1)
                      : 0) <<
                      2)) |
                  0),
                (Ge[($ + 28) >> 2] = Me),
                (Ge[($ + 20) >> 2] = 0),
                !((Q = (Ge[ne >> 2] = 0) | Ge[949]) & (t = 1 << Me)))
              ) {
                ;(Ge[949] = Q | t),
                  (Ge[G >> 2] = $),
                  (Ge[($ + 24) >> 2] = G),
                  (Ge[($ + 12) >> 2] = $),
                  (Ge[($ + 8) >> 2] = $)
                break
              }
              for (t = Y << (31 == (0 | Me) ? 0 : (25 - (Me >>> 1)) | 0), Q = 0 | Ge[G >> 2]; ; ) {
                if (((-8 & Ge[(Q + 4) >> 2]) | 0) == (0 | Y)) {
                  N = 216
                  break
                }
                if (!(G = 0 | Ge[(be = (Q + 16 + ((t >>> 31) << 2)) | 0) >> 2])) {
                  N = 215
                  break
                }
                ;(t <<= 1), (Q = G)
              }
              if (215 == (0 | N)) {
                ;(Ge[be >> 2] = $), (Ge[($ + 24) >> 2] = Q), (Ge[($ + 12) >> 2] = $), (Ge[($ + 8) >> 2] = $)
                break
              }
              if (216 == (0 | N)) {
                ;(Y = 0 | Ge[(t = (Q + 8) | 0) >> 2]),
                  (Ge[(Y + 12) >> 2] = $),
                  (Ge[t >> 2] = $),
                  (Ge[($ + 8) >> 2] = Y),
                  (Ge[($ + 12) >> 2] = Q),
                  (Ge[($ + 24) >> 2] = 0)
                break
              }
            }
          } else {
            for (
              Y = 0 | Ge[952],
                (0 == (0 | Y)) | (re >>> 0 < Y >>> 0) && (Ge[952] = re),
                Ge[1060] = re,
                Ge[1061] = ee,
                Ge[1063] = 0,
                Ge[957] = Ge[1066],
                Ge[956] = -1,
                Y = 0;
              (Ge[((t = (3832 + ((Y << 1) << 2)) | 0) + 12) >> 2] = t),
                (Ge[(t + 8) >> 2] = t),
                (Y = (Y + 1) | 0),
                32 != (0 | Y);

            );
            ;(Y = (re + (Q = 0 == ((7 & (Y = (re + 8) | 0)) | 0) ? 0 : (0 - Y) & 7)) | 0),
              (t = (ee + -40 - Q) | 0),
              (Ge[954] = Y),
              (Ge[951] = t),
              (Ge[(Y + 4) >> 2] = 1 | t),
              (Ge[(Y + t + 4) >> 2] = 40),
              (Ge[955] = Ge[1070])
          }
        } while (0)
        if (R >>> 0 < (ee = 0 | Ge[951]) >>> 0)
          return (
            (re = (ee - R) | 0),
            (Ge[951] = re),
            ($ = ((ee = 0 | Ge[954]) + R) | 0),
            (Ge[954] = $),
            (Ge[($ + 4) >> 2] = 1 | re),
            (Ge[(ee + 4) >> 2] = 3 | R),
            (Ze = ye),
            0 | (E = (ee + 8) | 0)
          )
      }
      return (Ge[(ee = 652) >> 2] = 12), (Ze = ye), (E = 0) | E
    }
    function B(e) {
      var r,
        t,
        n,
        o = 0,
        i = 0,
        a = 0,
        s = 0,
        u = 0,
        c = 0,
        l = 0,
        f = 0,
        d = 0,
        E = 0,
        S = 0,
        _ = 0,
        m = 0,
        h = 0,
        p = 0,
        F = 0,
        M = 0,
        b = 0,
        y = 0,
        O = 0,
        w = 0,
        R = 0,
        A = 0,
        k = 0,
        T = 0
      if ((e |= 0)) {
        ;(o = (e + -8) | 0), (i = 0 | Ge[952]), (r = (o + (e = -8 & (a = 0 | Ge[(e + -4) >> 2]))) | 0)
        do {
          if (1 & a) (d = e), (E = f = o)
          else {
            if (((s = 0 | Ge[o >> 2]), !(3 & a))) return
            if (((t = (s + e) | 0), (u = (o + (0 - s)) | 0) >>> 0 < i >>> 0)) return
            if ((0 | u) == (0 | Ge[953])) {
              if (3 == ((3 & (l = 0 | Ge[(c = (4 + r) | 0) >> 2])) | 0))
                return (Ge[950] = t), (Ge[c >> 2] = -2 & l), (Ge[(u + 4) >> 2] = 1 | t), void (Ge[(u + t) >> 2] = t)
              ;(d = t), (E = f = u)
              break
            }
            if (((l = s >>> 3), s >>> 0 < 256)) {
              if (((s = 0 | Ge[(u + 8) >> 2]), (0 | (c = 0 | Ge[(u + 12) >> 2])) == (0 | s))) {
                ;(Ge[948] = Ge[948] & ~(1 << l)), (d = t), (E = f = u)
                break
              }
              ;(Ge[(s + 12) >> 2] = c), (Ge[(c + 8) >> 2] = s), (d = t), (E = f = u)
              break
            }
            ;(s = 0 | Ge[(u + 24) >> 2]), (c = 0 | Ge[(u + 12) >> 2])
            do {
              if ((0 | c) == (0 | u)) {
                if ((_ = 0 | Ge[(S = ((l = (u + 16) | 0) + 4) | 0) >> 2])) (h = _), (p = S)
                else {
                  if (!(n = 0 | Ge[l >> 2])) {
                    m = 0
                    break
                  }
                  ;(h = n), (p = l)
                }
                for (;;)
                  if (0 | (_ = 0 | Ge[(S = (h + 20) | 0) >> 2])) (h = _), (p = S)
                  else {
                    if (!(_ = 0 | Ge[(S = (h + 16) | 0) >> 2])) break
                    ;(h = _), (p = S)
                  }
                ;(Ge[p >> 2] = 0), (m = h)
              } else (S = 0 | Ge[(u + 8) >> 2]), (Ge[(S + 12) >> 2] = c), (Ge[(c + 8) >> 2] = S), (m = c)
            } while (0)
            if (s) {
              if (((c = 0 | Ge[(u + 28) >> 2]), (0 | u) == (0 | Ge[(S = (4096 + (c << 2)) | 0) >> 2]))) {
                if (!(Ge[S >> 2] = m)) {
                  ;(Ge[949] = Ge[949] & ~(1 << c)), (d = t), (E = f = u)
                  break
                }
              } else if (!(Ge[(s + 16 + ((((0 | Ge[(s + 16) >> 2]) != (0 | u)) & 1) << 2)) >> 2] = m)) {
                ;(d = t), (E = f = u)
                break
              }
              ;(Ge[(m + 24) >> 2] = s),
                0 | (S = 0 | Ge[(c = (u + 16) | 0) >> 2]) && ((Ge[(m + 16) >> 2] = S), (Ge[(S + 24) >> 2] = m)),
                (E = f =
                  ((d = ((S = 0 | Ge[(c + 4) >> 2]) && ((Ge[(m + 20) >> 2] = S), (Ge[(S + 24) >> 2] = m)), t)), u))
            } else (d = t), (E = f = u)
          }
        } while (0)
        if (!(r >>> 0 <= E >>> 0) && 1 & (e = 0 | Ge[(o = (4 + r) | 0) >> 2])) {
          if (2 & e) (Ge[o >> 2] = -2 & e), (Ge[(f + 4) >> 2] = 1 | d), (y = Ge[(E + d) >> 2] = d)
          else {
            if (((m = 0 | Ge[953]), (0 | r) == (0 | Ge[954])))
              return (
                (h = ((0 | Ge[951]) + d) | 0),
                (Ge[951] = h),
                (Ge[954] = f),
                (Ge[(f + 4) >> 2] = 1 | h),
                (0 | f) != (0 | m) ? void 0 : ((Ge[953] = 0), void (Ge[950] = 0))
              )
            if ((0 | r) == (0 | m))
              return (
                (m = ((0 | Ge[950]) + d) | 0),
                (Ge[950] = m),
                (Ge[953] = E),
                (Ge[(f + 4) >> 2] = 1 | m),
                void (Ge[(E + m) >> 2] = m)
              )
            ;(m = ((-8 & e) + d) | 0), (h = e >>> 3)
            do {
              if (e >>> 0 < 256) {
                if (((p = 0 | Ge[(8 + r) >> 2]), (0 | (i = 0 | Ge[(12 + r) >> 2])) == (0 | p))) {
                  Ge[948] = Ge[948] & ~(1 << h)
                  break
                }
                ;(Ge[(p + 12) >> 2] = i), (Ge[(i + 8) >> 2] = p)
                break
              }
              ;(p = 0 | Ge[(24 + r) >> 2]), (i = 0 | Ge[(12 + r) >> 2])
              do {
                if ((0 | i) == (0 | r)) {
                  if ((c = 0 | Ge[(S = ((a = (16 + r) | 0) + 4) | 0) >> 2])) (M = c), (b = S)
                  else {
                    if (!(_ = 0 | Ge[a >> 2])) {
                      F = 0
                      break
                    }
                    ;(M = _), (b = a)
                  }
                  for (;;)
                    if (0 | (c = 0 | Ge[(S = (M + 20) | 0) >> 2])) (M = c), (b = S)
                    else {
                      if (!(c = 0 | Ge[(S = (M + 16) | 0) >> 2])) break
                      ;(M = c), (b = S)
                    }
                  ;(Ge[b >> 2] = 0), (F = M)
                } else (S = 0 | Ge[(8 + r) >> 2]), (Ge[(S + 12) >> 2] = i), (Ge[(i + 8) >> 2] = S), (F = i)
              } while (0)
              if (0 | p) {
                if (((i = 0 | Ge[(28 + r) >> 2]), (0 | r) == (0 | Ge[(u = (4096 + (i << 2)) | 0) >> 2]))) {
                  if (!(Ge[u >> 2] = F)) {
                    Ge[949] = Ge[949] & ~(1 << i)
                    break
                  }
                } else if (!(Ge[(p + 16 + ((((0 | Ge[(p + 16) >> 2]) != (0 | r)) & 1) << 2)) >> 2] = F)) break
                ;(Ge[(F + 24) >> 2] = p),
                  0 | (u = 0 | Ge[(i = (16 + r) | 0) >> 2]) && ((Ge[(F + 16) >> 2] = u), (Ge[(u + 24) >> 2] = F)),
                  0 | (u = 0 | Ge[(i + 4) >> 2]) && ((Ge[(F + 20) >> 2] = u), (Ge[(u + 24) >> 2] = F))
              }
            } while (0)
            if (((Ge[(f + 4) >> 2] = 1 | m), (Ge[(E + m) >> 2] = m), (0 | f) == (0 | Ge[953])))
              return void (Ge[950] = m)
            y = m
          }
          if (((d = y >>> 3), y >>> 0 < 256))
            return (
              (E = (3832 + ((d << 1) << 2)) | 0),
              (w =
                (e = 0 | Ge[948]) & (o = 1 << d)
                  ? ((O = 0 | Ge[(o = (E + 8) | 0) >> 2]), o)
                  : ((Ge[948] = e | o), ((O = E) + 8) | 0)),
              (Ge[w >> 2] = f),
              (Ge[(O + 12) >> 2] = f),
              (Ge[(f + 8) >> 2] = O),
              void (Ge[(f + 12) >> 2] = E)
            )
          ;(e =
            (4096 +
              ((R = (E = y >>> 8)
                ? 16777215 < y >>> 0
                  ? 31
                  : ((y >>>
                      (((e =
                        (14 -
                          ((E = ((((w = E << (O = (((E + 1048320) | 0) >>> 16) & 8)) + 520192) | 0) >>> 16) & 4) |
                            O |
                            (w = ((((o = w << E) + 245760) | 0) >>> 16) & 2)) +
                          ((o << w) >>> 15)) |
                        0) +
                        7) |
                        0)) &
                      1) |
                    (e << 1)
                : 0) <<
                2)) |
            0),
            (Ge[(f + 28) >> 2] = R),
            (Ge[(f + 20) >> 2] = 0),
            (w = (Ge[(f + 16) >> 2] = 0) | Ge[949]),
            (o = 1 << R)
          do {
            if (w & o) {
              for (O = y << (31 == (0 | R) ? 0 : (25 - (R >>> 1)) | 0), E = 0 | Ge[e >> 2]; ; ) {
                if (((-8 & Ge[(E + 4) >> 2]) | 0) == (0 | y)) {
                  A = 73
                  break
                }
                if (!(d = 0 | Ge[(k = (E + 16 + ((O >>> 31) << 2)) | 0) >> 2])) {
                  A = 72
                  break
                }
                ;(O <<= 1), (E = d)
              }
              if (72 == (0 | A)) {
                ;(Ge[k >> 2] = f), (Ge[(f + 24) >> 2] = E), (Ge[(f + 12) >> 2] = f), (Ge[(f + 8) >> 2] = f)
                break
              }
              if (73 == (0 | A)) {
                ;(p = 0 | Ge[(O = (E + 8) | 0) >> 2]),
                  (Ge[(p + 12) >> 2] = f),
                  (Ge[O >> 2] = f),
                  (Ge[(f + 8) >> 2] = p),
                  (Ge[(f + 12) >> 2] = E),
                  (Ge[(f + 24) >> 2] = 0)
                break
              }
            } else
              (Ge[949] = w | o),
                (Ge[e >> 2] = f),
                (Ge[(f + 24) >> 2] = e),
                (Ge[(f + 12) >> 2] = f),
                (Ge[(f + 8) >> 2] = f)
          } while (0)
          if (((f = ((0 | Ge[956]) - 1) | 0), !(Ge[956] = f))) {
            for (T = 4248; (f = 0 | Ge[T >> 2]); ) T = (f + 8) | 0
            Ge[956] = -1
          }
        }
      }
    }
    function H(e, r, t) {
      ;(e |= 0), (r |= 0), (t |= 0)
      var n,
        o,
        i,
        a,
        s,
        u,
        c,
        l,
        f,
        d,
        E = 0,
        S = 0,
        _ = 0,
        m = 0,
        h = 0,
        p = 0,
        F = 0,
        M = Ze
      ;(0 | Je) <= (0 | (Ze = (Ze + 48) | 0)) && Qe(48),
        (n = (M + 16) | 0),
        (o = ((E = M) + 32) | 0),
        (a = 0 | Ge[(i = (e + 28) | 0) >> 2]),
        (Ge[o >> 2] = a),
        (u = ((0 | Ge[(s = (e + 20) | 0) >> 2]) - a) | 0),
        (Ge[(4 + o) >> 2] = u),
        (Ge[(8 + o) >> 2] = r),
        (r = (u + (Ge[(12 + o) >> 2] = t)) | 0),
        (u = (e + 60) | 0),
        (Ge[E >> 2] = Ge[u >> 2]),
        (Ge[(E + 4) >> 2] = o),
        (Ge[(E + 8) >> 2] = 2),
        (a = 0 | U(0 | R(146, 0 | E)))
      e: do {
        if ((0 | r) != (0 | a)) {
          for (E = 2, S = r, _ = o, m = a; !((0 | m) < 0); ) {
            if (
              ((S = (S - m) | 0),
              (f = ((((c = (h = 0 | Ge[(_ + 4) >> 2]) >>> 0 < m >>> 0) << 31) >> 31) + E) | 0),
              (d = (m - (c ? h : 0)) | 0),
              (Ge[(l = c ? (_ + 8) | 0 : _) >> 2] = (0 | Ge[l >> 2]) + d),
              (Ge[(h = (l + 4) | 0) >> 2] = (0 | Ge[h >> 2]) - d),
              (Ge[n >> 2] = Ge[u >> 2]),
              (Ge[(4 + n) >> 2] = l),
              (Ge[(8 + n) >> 2] = f),
              (0 | S) == (0 | (m = 0 | U(0 | R(146, 0 | n)))))
            ) {
              p = 3
              break e
            }
            ;(E = f), (_ = l)
          }
          ;(Ge[(e + 16) >> 2] = 0),
            (Ge[i >> 2] = 0),
            (Ge[s >> 2] = 0),
            (Ge[e >> 2] = 32 | Ge[e >> 2]),
            (F = 2 == (0 | E) ? 0 : (t - (0 | Ge[(_ + 4) >> 2])) | 0)
        } else p = 3
      } while (0)
      return (
        3 == (0 | p) &&
          ((p = 0 | Ge[(e + 44) >> 2]),
          (Ge[(e + 16) >> 2] = p + (0 | Ge[(e + 48) >> 2])),
          (Ge[i >> 2] = p),
          (Ge[s >> 2] = p),
          (F = t)),
        (Ze = M),
        0 | F
      )
    }
    function U(e) {
      return 0 | (4294963200 < (e |= 0) >>> 0 ? ((Ge[163] = 0 - e), -1) : e)
    }
    function Y() {
      return 652
    }
    function z(e, r, t, n, o) {
      ;(e |= 0), (r |= 0), (t |= 0), (n |= 0), (o |= 0)
      var i,
        a,
        s,
        u,
        c,
        l,
        f,
        d,
        E,
        S,
        _ = 0,
        m = 0,
        h = 0,
        p = 0,
        F = 0,
        M = 0,
        b = 0,
        y = 0,
        O = 0,
        w = 0,
        R = 0,
        A = 0,
        k = 0,
        T = 0,
        g = 0,
        v = 0,
        N = 0,
        D = 0,
        P = 0,
        C = 0,
        I = 0,
        L = 0,
        x = 0,
        B = 0,
        H = 0,
        U = 0,
        Y = 0,
        z = 0,
        V = 0,
        K = 0,
        W = 0,
        X = 0,
        j = 0,
        G = 0,
        q = 0,
        Z = 0,
        J = 0,
        Q = 0,
        $ = 0,
        ee = 0,
        re = 0,
        te = 0,
        ne = 0,
        oe = 0,
        ie = 0,
        ae = 0,
        se = 0,
        ue = 0,
        ce = 0,
        le = 0,
        fe = 0,
        de = 0,
        Ee = 0,
        Se = 0,
        _e = 0,
        me = 0,
        he = 0,
        pe = 0,
        Fe = 0,
        Me = 0,
        be = 0,
        ye = 0,
        Oe = 0,
        we = 0,
        Re = 0,
        Ae = 0,
        ke = Ze
      ;(0 | Je) <= (0 | (Ze = (Ze + 64) | 0)) && Qe(64),
        (c = ((a = ke) + 20) | 0),
        (l = 0 != (0 | e)),
        (d = f = (40 + (s = (ke + 24) | 0)) | 0),
        (E = (39 + s) | 0),
        (s = (4 + (u = (ke + 8) | 0)) | 0),
        (h = m = _ = 0),
        (p = Ge[(i = (ke + 16) | 0) >> 2] = r)
      e: for (;;) {
        do {
          if (-1 < (0 | m)) {
            if (((2147483647 - m) | 0) < (0 | _)) {
              ;(Ge[(r = 652) >> 2] = 75), (F = -1)
              break
            }
            F = (_ + m) | 0
            break
          }
        } while (((F = m), 0))
        if (!(((r = 0 | Xe[p >> 0]) << 24) >> 24)) {
          M = 87
          break
        }
        ;(b = r), (y = p)
        r: for (;;) {
          switch ((b << 24) >> 24) {
            case 37:
              ;(w = O = y), (M = 9)
              break r
            case 0:
              A = R = y
              break r
          }
          ;(r = (y + 1) | 0), (Ge[i >> 2] = r), (b = 0 | Xe[r >> 0]), (y = r)
        }
        r: do {
          if (9 == (0 | M))
            for (;;) {
              if (37 != ((M = 0) | Xe[(w + 1) >> 0])) {
                ;(R = O), (A = w)
                break r
              }
              if (((r = (O + 1) | 0), (k = (w + 2) | 0), (Ge[i >> 2] = k), 37 != (0 | Xe[k >> 0]))) {
                ;(R = r), (A = k)
                break
              }
              ;(O = r), (w = k), (M = 9)
            }
        } while (0)
        if (((k = (R - p) | 0), l && De(e, p, k), 0 | k)) (_ = k), (m = F), (p = A)
        else {
          ;(N =
            (r = ((0 | Xe[(k = (A + 1) | 0) >> 0]) - 48) | 0) >>> 0 < 10
              ? ((g = (T = 36 == (0 | Xe[(A + 2) >> 0])) ? r : -1), (v = T ? 1 : h), T ? (A + 3) | 0 : k)
              : ((g = -1), (v = h), k)),
            (Ge[i >> 2] = N),
            (T = ((((k = 0 | Xe[N >> 0]) << 24) >> 24) - 32) | 0)
          r: do {
            if (T >>> 0 < 32)
              for (r = 0, D = k, P = T, C = N; ; ) {
                if (!(75913 & (I = 1 << P))) {
                  ;(L = r), (x = D), (B = C)
                  break r
                }
                if (
                  ((H = I | r),
                  (I = (C + 1) | 0),
                  (Ge[i >> 2] = I),
                  32 <= (P = ((((U = 0 | Xe[I >> 0]) << 24) >> 24) - 32) | 0) >>> 0)
                ) {
                  ;(L = H), (x = U), (B = I)
                  break
                }
                ;(r = H), (D = U), (C = I)
              }
            else (L = 0), (x = k), (B = N)
          } while (0)
          if ((x << 24) >> 24 == 42) {
            if ((T = ((0 | Xe[(k = (B + 1) | 0) >> 0]) - 48) | 0) >>> 0 < 10 && 36 == (0 | Xe[(B + 2) >> 0]))
              (Ge[(o + (T << 2)) >> 2] = 10),
                (Y = 0 | Ge[(n + (((0 | Xe[k >> 0]) - 48) << 3)) >> 2]),
                (z = 1),
                (V = (B + 3) | 0)
            else {
              if (0 | v) {
                K = -1
                break
              }
              V =
                ((z = l
                  ? ((T = (3 + (0 | Ge[t >> 2])) & -4), (C = 0 | Ge[T >> 2]), (Ge[t >> 2] = T + 4), (Y = C), 0)
                  : (Y = 0)),
                k)
            }
            ;(W = (k = (0 | Y) < 0) ? (0 - Y) | 0 : Y), (X = k ? 8192 | L : L), (j = z), (G = Ge[i >> 2] = V)
          } else {
            if ((0 | (k = 0 | Pe(i))) < 0) {
              K = -1
              break
            }
            ;(W = k), (X = L), (j = v), (G = 0 | Ge[i >> 2])
          }
          do {
            if (46 == (0 | Xe[G >> 0])) {
              if (42 != (0 | Xe[(G + 1) >> 0])) {
                ;(Ge[i >> 2] = G + 1), (q = k = 0 | Pe(i)), (Z = 0 | Ge[i >> 2])
                break
              }
              if ((C = ((0 | Xe[(k = (G + 2) | 0) >> 0]) - 48) | 0) >>> 0 < 10 && 36 == (0 | Xe[(G + 3) >> 0])) {
                ;(Ge[(o + (C << 2)) >> 2] = 10),
                  (T = (G + 4) | 0),
                  (q = C = 0 | Ge[(n + (((0 | Xe[k >> 0]) - 48) << 3)) >> 2]),
                  (Z = Ge[i >> 2] = T)
                break
              }
              if (0 | j) {
                K = -1
                break e
              }
              ;(q = l ? ((T = (3 + (0 | Ge[t >> 2])) & -4), (C = 0 | Ge[T >> 2]), (Ge[t >> 2] = T + 4), C) : 0),
                (Z = Ge[i >> 2] = k)
            } else (q = -1), (Z = G)
          } while (0)
          for (k = 0, C = Z; ; ) {
            if (57 < (((0 | Xe[C >> 0]) - 65) | 0) >>> 0) {
              K = -1
              break e
            }
            if (
              ((J = (C + 1) | 0),
              (Ge[i >> 2] = J),
              !(
                ((($ = 255 & (Q = 0 | Xe[((0 | Xe[C >> 0]) - 65 + (1362 + ((58 * k) | 0))) >> 0])) + -1) | 0) >>> 0 <
                8
              ))
            )
              break
            ;(k = $), (C = J)
          }
          if (!((Q << 24) >> 24)) {
            K = -1
            break
          }
          T = -1 < (0 | g)
          do {
            if ((Q << 24) >> 24 == 19) {
              if (T) {
                K = -1
                break e
              }
              M = 49
            } else {
              if (T) {
                ;(Ge[(o + (g << 2)) >> 2] = $),
                  (r = 0 | Ge[((D = (n + (g << 3)) | 0) + 4) >> 2]),
                  (Ge[(P = a) >> 2] = Ge[D >> 2]),
                  (Ge[(P + 4) >> 2] = r),
                  (M = 49)
                break
              }
              if (!l) {
                K = 0
                break e
              }
              Ce(a, $, t)
            }
          } while (0)
          if (49 != (0 | M) || ((M = 0), l)) {
            ;(r = (0 != (0 | k)) & (3 == ((15 & (T = 0 | Xe[C >> 0])) | 0)) ? -33 & T : T),
              (T = -65537 & X),
              (P = 0 == ((8192 & X) | 0) ? X : T)
            r: do {
              switch (0 | r) {
                case 110:
                  switch (((255 & k) << 24) >> 24) {
                    case 0:
                    case 1:
                      ;(_ = 0), (m = Ge[Ge[a >> 2] >> 2] = F), (h = j), (p = J)
                      continue e
                    case 2:
                      ;(D = 0 | Ge[a >> 2]),
                        (Ge[D >> 2] = F),
                        (Ge[(D + 4) >> 2] = (((0 | F) < 0) << 31) >> 31),
                        (_ = 0),
                        (m = F),
                        (h = j),
                        (p = J)
                      continue e
                    case 3:
                      ;(_ = 0), (m = je[Ge[a >> 2] >> 1] = F), (h = j), (p = J)
                      continue e
                    case 4:
                      ;(_ = 0), (m = Xe[Ge[a >> 2] >> 0] = F), (h = j), (p = J)
                      continue e
                    case 6:
                      ;(_ = 0), (m = Ge[Ge[a >> 2] >> 2] = F), (h = j), (p = J)
                      continue e
                    case 7:
                      ;(D = 0 | Ge[a >> 2]),
                        (Ge[D >> 2] = F),
                        (Ge[(D + 4) >> 2] = (((0 | F) < 0) << 31) >> 31),
                        (_ = 0),
                        (m = F),
                        (h = j),
                        (p = J)
                      continue e
                    default:
                      ;(_ = 0), (m = F), (h = j), (p = J)
                      continue e
                  }
                  break
                case 112:
                  ;(ee = 120), (re = 8 < q >>> 0 ? q : 8), (te = 8 | P), (M = 61)
                  break
                case 88:
                case 120:
                  ;(ee = r), (re = q), (te = P), (M = 61)
                  break
                case 111:
                  ;(ne = D =
                    0 |
                    (function (e, r, t) {
                      t |= 0
                      var n = 0,
                        o = 0
                      if ((0 == (0 | (e |= 0))) & (0 == (0 | (r |= 0)))) n = t
                      else
                        for (o = t, t = r, r = e; ; ) {
                          if (
                            ((Xe[(e = (o + -1) | 0) >> 0] = (7 & r) | 48),
                            (0 == (0 | (r = 0 | Ve(0 | r, 0 | t, 3)))) & (0 == (0 | (t = ve))))
                          ) {
                            n = e
                            break
                          }
                          o = e
                        }
                      return 0 | n
                    })((I = 0 | Ge[(D = a) >> 2]), (U = 0 | Ge[(D + 4) >> 2]), f)),
                    (ie = 1826),
                    (ae = ((oe = 0) == ((8 & P) | 0)) | ((0 | (H = (d - D) | 0)) < (0 | q)) ? q : (H + 1) | 0),
                    (se = P),
                    (ue = I),
                    (ce = U),
                    (M = 67)
                  break
                case 105:
                case 100:
                  if (((I = 0 | Ge[(U = a) >> 2]), (0 | (H = 0 | Ge[(U + 4) >> 2])) < 0)) {
                    ;(U = 0 | Ye(0, 0, 0 | I, 0 | H)),
                      (D = ve),
                      (le = 1),
                      (fe = 1826),
                      (de = Ge[(S = a) >> 2] = U),
                      (Ee = Ge[(S + 4) >> 2] = D),
                      (M = 66)
                    break r
                  }
                  ;(le = (0 != ((2049 & P) | 0)) & 1),
                    (fe = 0 == ((2048 & P) | 0) ? (0 == ((1 & P) | 0) ? 1826 : 1828) : 1827),
                    (de = I),
                    (Ee = H),
                    (M = 66)
                  break r
                case 117:
                  ;(fe = 1826), (de = (le = 0) | Ge[(H = a) >> 2]), (Ee = 0 | Ge[(H + 4) >> 2]), (M = 66)
                  break
                case 99:
                  ;(Xe[E >> 0] = Ge[a >> 2]), (Se = E), (_e = 0), (me = 1826), (he = f), (pe = 1), (Fe = T)
                  break
                case 109:
                  ;(Me =
                    0 |
                    (0 |
                      (function (e, r) {
                        ;(e |= 0), (r |= 0)
                        var t = 0,
                          n = 0,
                          o = 0,
                          i = 0,
                          a = 0,
                          s = 0
                        t = 0
                        for (;;) {
                          if ((0 | qe[(1896 + t) >> 0]) == (0 | e)) {
                            n = 2
                            break
                          }
                          if (87 == (0 | (o = (t + 1) | 0))) {
                            ;(i = 1984), (a = 87), (n = 5)
                            break
                          }
                          t = o
                        }
                        2 == (0 | n) && (t ? ((i = 1984), (a = t), (n = 5)) : (s = 1984))
                        if (5 == (0 | n))
                          for (;;) {
                            for (n = 0, t = i; (t = ((e = t) + 1) | 0), 0 != (0 | Xe[e >> 0]); );
                            if (!(a = (a + -1) | 0)) {
                              s = t
                              break
                            }
                            ;(i = t), (n = 5)
                          }
                        return (
                          0 |
                          (function (e, r) {
                            return (
                              0 |
                              (function (e, r) {
                                e |= 0
                                var t = 0
                                t = (r |= 0)
                                  ? 0 |
                                    (function (e, r, t) {
                                      ;(r |= 0), (t |= 0)
                                      var n = 0,
                                        o = 0,
                                        i = 0,
                                        a = 0,
                                        s = 0,
                                        u = 0,
                                        c = 0,
                                        l = 0,
                                        f = 0,
                                        d = 0,
                                        E = 0,
                                        S = 0,
                                        _ = 0,
                                        m = 0,
                                        h = 0
                                      ;(n = (1794895138 + (0 | Ge[(e |= 0) >> 2])) | 0),
                                        (o = 0 | Ue(0 | Ge[(e + 8) >> 2], n)),
                                        (i = 0 | Ue(0 | Ge[(e + 12) >> 2], n)),
                                        (a = 0 | Ue(0 | Ge[(e + 16) >> 2], n))
                                      t: do {
                                        if (
                                          o >>> 0 < (r >>> 2) >>> 0 &&
                                          ((s = (r - (o << 2)) | 0), (i >>> 0 < s >>> 0) & (a >>> 0 < s >>> 0)) &&
                                          0 == ((3 & (a | i)) | 0)
                                        ) {
                                          for (s = i >>> 2, u = a >>> 2, c = 0, l = o; ; ) {
                                            if (
                                              ((_ =
                                                0 |
                                                Ue(
                                                  0 |
                                                    Ge[
                                                      (e +
                                                        ((S = ((E = (d = (c + (f = l >>> 1)) | 0) << 1) + s) | 0) <<
                                                          2)) >>
                                                        2
                                                    ],
                                                  n
                                                )),
                                              !(
                                                ((m = 0 | Ue(0 | Ge[(e + ((1 + S) << 2)) >> 2], n)) >>> 0 < r >>> 0) &
                                                (_ >>> 0 < ((r - m) | 0) >>> 0)
                                              ))
                                            ) {
                                              h = 0
                                              break t
                                            }
                                            if (0 | Xe[(e + (m + _)) >> 0]) {
                                              h = 0
                                              break t
                                            }
                                            if (
                                              !(_ =
                                                0 |
                                                (function (e, r) {
                                                  r |= 0
                                                  var t = 0,
                                                    n = 0,
                                                    o = 0,
                                                    i = 0,
                                                    t = 0 | Xe[(e |= 0) >> 0],
                                                    n = 0 | Xe[r >> 0]
                                                  if ((t << 24) >> 24 == 0 || (t << 24) >> 24 != (n << 24) >> 24)
                                                    (o = n), (i = t)
                                                  else {
                                                    for (
                                                      t = r, r = e;
                                                      (t = (t + 1) | 0),
                                                        (e = 0 | Xe[(r = (r + 1) | 0) >> 0]),
                                                        (n = 0 | Xe[t >> 0]),
                                                        (e << 24) >> 24 != 0 && (e << 24) >> 24 == (n << 24) >> 24;

                                                    );
                                                    ;(o = n), (i = e)
                                                  }
                                                  return ((255 & i) - (255 & o)) | 0
                                                })(t, (e + m) | 0))
                                            )
                                              break
                                            if (((m = (0 | _) < 0), 1 == (0 | l))) {
                                              h = 0
                                              break t
                                            }
                                            ;(c = m ? c : d), (l = m ? f : (l - f) | 0)
                                          }
                                          ;(c = 0 | Ue(0 | Ge[(e + ((l = (E + u) | 0) << 2)) >> 2], n)),
                                            (s = 0 | Ue(0 | Ge[(e + ((l + 1) << 2)) >> 2], n)),
                                            (h =
                                              (s >>> 0 < r >>> 0) & (c >>> 0 < ((r - s) | 0) >>> 0) &&
                                              0 == (0 | Xe[(e + (s + c)) >> 0])
                                                ? (e + s) | 0
                                                : 0)
                                        } else h = 0
                                      } while (0)
                                      return 0 | h
                                    })(0 | Ge[r >> 2], 0 | Ge[(r + 4) >> 2], e)
                                  : 0
                                return 0 | (0 | t ? t : e)
                              })((e |= 0), (r |= 0))
                            )
                          })(s, 0 | Ge[(r + 20) >> 2])
                        )
                      })(0 | Ge[(H = 652) >> 2] | 0, 0 | Ge[194]))),
                    (M = 71)
                  break
                case 115:
                  ;(Me = 0 | (H = 0 | Ge[a >> 2]) ? H : 1836), (M = 71)
                  break
                case 67:
                  ;(Ge[u >> 2] = Ge[a >> 2]), (Ge[s >> 2] = 0), (be = -1), (ye = Ge[a >> 2] = u), (M = 75)
                  break
                case 83:
                  ;(H = 0 | Ge[a >> 2]), (M = q ? ((be = q), (ye = H), 75) : (xe(e, 32, W, 0, P), (Oe = 0), 84))
                  break
                case 65:
                case 71:
                case 70:
                case 69:
                case 97:
                case 103:
                case 102:
                case 101:
                  ;(_ =
                    0 |
                    (function (e, r, t, n, o, i) {
                      ;(e |= 0), (r = +r), (t |= 0), (n |= 0), (o |= 0), (i |= 0)
                      var a = 0,
                        s = 0,
                        u = 0,
                        c = 0,
                        l = 0,
                        f = 0,
                        d = 0,
                        E = 0,
                        S = 0,
                        _ = 0,
                        m = 0,
                        h = 0,
                        p = 0,
                        F = 0,
                        M = 0,
                        b = 0,
                        y = 0,
                        O = 0,
                        w = 0,
                        R = 0,
                        A = 0,
                        k = 0,
                        T = 0,
                        g = 0,
                        v = 0,
                        N = 0,
                        D = 0,
                        P = 0,
                        C = 0,
                        I = 0,
                        L = 0,
                        x = 0,
                        B = 0,
                        H = 0,
                        U = 0,
                        Y = 0,
                        z = 0,
                        V = 0,
                        K = 0,
                        W = 0,
                        X = 0,
                        j = 0,
                        G = 0,
                        q = 0,
                        Z = 0,
                        J = 0,
                        Q = 0,
                        $ = 0,
                        ee = 0,
                        re = 0,
                        te = 0,
                        ne = 0,
                        oe = 0,
                        ie = 0,
                        ae = 0,
                        se = 0,
                        ue = 0,
                        ce = 0,
                        le = 0,
                        fe = 0,
                        de = 0,
                        Ee = 0,
                        Se = 0,
                        _e = 0,
                        me = 0,
                        he = 0,
                        pe = 0,
                        Fe = 0,
                        Me = 0,
                        be = 0,
                        ye = 0,
                        Oe = 0,
                        we = 0
                      ;(0 | (Ze = ((a = Ze) + 560) | 0)) >= (0 | Je) && Qe(560)
                      ;(s = (a + 8) | 0),
                        (l = c = ((u = a) + 524) | 0),
                        (f = (a + 512) | 0),
                        (Ge[u >> 2] = 0),
                        (d = (12 + f) | 0),
                        He(r),
                        (_ =
                          (0 | ve) < 0
                            ? ((E = -r), (S = 1), 1843)
                            : ((E = r),
                              (S = (0 != ((2049 & o) | 0)) & 1),
                              0 == ((2048 & o) | 0) ? (0 == ((1 & o) | 0) ? 1844 : 1849) : 1846))
                      He(E), (m = 2146435072 & ve)
                      do {
                        if ((m >>> 0 < 2146435072) | ((2146435072 == (0 | m)) & !1)) {
                          if (
                            ((r =
                              2 *
                              +(function (e, r) {
                                return +(+(function e(r, t) {
                                  r = +r
                                  t |= 0
                                  var n = 0,
                                    o = 0,
                                    i = 0,
                                    a = 0,
                                    s = 0,
                                    u = 0,
                                    c = 0
                                  Te[ge >> 3] = r
                                  n = 0 | Ge[ge >> 2]
                                  o = 0 | Ge[(ge + 4) >> 2]
                                  i = 0 | Ve(0 | n, 0 | o, 52)
                                  switch (2047 & i) {
                                    case 0:
                                      ;(u =
                                        0 != r
                                          ? ((a = +e(0x10000000000000000 * r, t)), (s = a), ((0 | Ge[t >> 2]) - 64) | 0)
                                          : ((s = r), 0)),
                                        (Ge[t >> 2] = u),
                                        (c = s)
                                      break
                                    case 2047:
                                      c = r
                                      break
                                    default:
                                      ;(Ge[t >> 2] = (2047 & i) - 1022),
                                        (Ge[ge >> 2] = n),
                                        (Ge[(ge + 4) >> 2] = (-2146435073 & o) | 1071644672),
                                        (c = +Te[ge >> 3])
                                  }
                                  return +c
                                })((e = +e), (r |= 0)))
                              })(E, u)),
                            (h = 0 != r) && (Ge[u >> 2] = (0 | Ge[u >> 2]) - 1),
                            97 == (0 | (p = 32 | i)))
                          ) {
                            ;(M = 0 == (0 | (F = 32 & i)) ? _ : (_ + 9) | 0), (b = 2 | S), (y = (12 - n) | 0)
                            do {
                              if (!((11 < n >>> 0) | (0 == (0 | y)))) {
                                for (O = 8, w = y; (w = (w + -1) | 0), (O *= 16), 0 != (0 | w); );
                                if (45 == (0 | Xe[M >> 0])) {
                                  R = -(O + (-r - O))
                                  break
                                }
                                R = r + O - O
                                break
                              }
                            } while (((R = r), 0))
                            for (
                              y = 0 | Ge[u >> 2],
                                A = 0 | Ie((w = (0 | y) < 0 ? (0 - y) | 0 : y), (((0 | w) < 0) << 31) >> 31, d),
                                k = (0 | A) == (0 | d) ? ((Xe[(w = (11 + f) | 0) >> 0] = 48), w) : A,
                                Xe[(k + -1) >> 0] = 43 + ((y >> 31) & 2),
                                Xe[(y = (k + -2) | 0) >> 0] = i + 15,
                                A = (0 | n) < 1,
                                w = 0 == ((8 & o) | 0),
                                T = c,
                                g = R;
                              (v = ~~g),
                                (N = (T + 1) | 0),
                                (Xe[T >> 0] = qe[(1878 + v) >> 0] | F),
                                (g = 16 * (g - (0 | v))),
                                (D = 1 != ((N - l) | 0) || w & A & (0 == g) ? N : ((Xe[N >> 0] = 46), (T + 2) | 0)),
                                0 != g;

                            )
                              T = D
                            xe(
                              e,
                              32,
                              t,
                              (F =
                                ((A = (d - y) | 0) +
                                  b +
                                  (w = (0 != (0 | n)) & ((((T = (D - l) | 0) + -2) | 0) < (0 | n)) ? (n + 2) | 0 : T)) |
                                0),
                              o
                            ),
                              De(e, M, b),
                              xe(e, 48, t, F, 65536 ^ o),
                              De(e, c, T),
                              xe(e, 48, (w - T) | 0, 0, 0),
                              De(e, y, A),
                              xe(e, 32, t, F, 8192 ^ o),
                              (P = F)
                            break
                          }
                          for (
                            F = (0 | n) < 0 ? 6 : n,
                              I = h
                                ? ((A = ((0 | Ge[u >> 2]) - 28) | 0), (Ge[u >> 2] = A), (C = 268435456 * r), A)
                                : ((C = r), 0 | Ge[u >> 2]),
                              A = (0 | I) < 0 ? s : (288 + s) | 0,
                              T = A,
                              g = C;
                            (w = ~~g >>> 0), (Ge[T >> 2] = w), (T = (T + 4) | 0), (g = 1e9 * (g - (w >>> 0))), 0 != g;

                          );
                          if (0 < (0 | I))
                            for (h = A, y = T, b = I; ; ) {
                              if (((M = (0 | b) < 29 ? b : 29), h >>> 0 <= (w = (y + -4) | 0) >>> 0)) {
                                for (
                                  N = w, w = 0;
                                  (v = 0 | Ke(0 | Ge[N >> 2], 0, 0 | M)),
                                    (L = 0 | ze(0 | v, 0 | ve, 0 | w, 0)),
                                    (x = 0 | rr(0 | L, 0 | (v = ve), 1e9, 0)),
                                    (Ge[N >> 2] = x),
                                    (w = 0 | We(0 | L, 0 | v, 1e9, 0)),
                                    (N = (N + -4) | 0),
                                    h >>> 0 <= N >>> 0;

                                );
                                B = w ? ((Ge[(N = (h + -4) | 0) >> 2] = w), N) : h
                              } else B = h
                              for (N = y; !(N >>> 0 <= B >>> 0 || 0 | Ge[(v = (N + -4) | 0) >> 2]); ) N = v
                              if (((w = ((0 | Ge[u >> 2]) - M) | 0), !(0 < (0 | (Ge[u >> 2] = w))))) {
                                ;(H = B), (U = N), (Y = w)
                                break
                              }
                              ;(h = B), (y = N), (b = w)
                            }
                          else (H = A), (U = T), (Y = I)
                          if ((0 | Y) < 0)
                            for (
                              b = (1 + ((((F + 25) | 0) / 9) | 0)) | 0, y = 102 == (0 | p), h = H, w = U, v = Y;
                              ;

                            ) {
                              if (((x = (0 | (L = (0 - v) | 0)) < 9 ? L : 9), h >>> 0 < w >>> 0)) {
                                for (
                                  L = ((1 << x) - 1) | 0, z = 1e9 >>> x, V = 0, K = h;
                                  (W = 0 | Ge[K >> 2]),
                                    (Ge[K >> 2] = (W >>> x) + V),
                                    (V = 0 | Ne(W & L, z)),
                                    (K = (K + 4) | 0),
                                    K >>> 0 < w >>> 0;

                                );
                                ;(K = 0 == (0 | Ge[h >> 2]) ? (h + 4) | 0 : h),
                                  (j = V ? ((Ge[w >> 2] = V), (X = K), (w + 4) | 0) : ((X = K), w))
                              } else (X = 0 == (0 | Ge[h >> 2]) ? (h + 4) | 0 : h), (j = w)
                              if (
                                ((z = (0 | b) < (((j - (K = y ? A : X)) >> 2) | 0) ? (K + (b << 2)) | 0 : j),
                                (v = ((0 | Ge[u >> 2]) + x) | 0),
                                0 <= (0 | (Ge[u >> 2] = v)))
                              ) {
                                ;(G = X), (q = z)
                                break
                              }
                              ;(h = X), (w = z)
                            }
                          else (G = H), (q = U)
                          if (((w = A), G >>> 0 < q >>> 0))
                            if (((h = (9 * ((w - G) >> 2)) | 0), (v = 0 | Ge[G >> 2]) >>> 0 < 10)) Z = h
                            else
                              for (b = h, h = 10; ; ) {
                                if (((y = (b + 1) | 0), v >>> 0 < (h = (10 * h) | 0) >>> 0)) {
                                  Z = y
                                  break
                                }
                                b = y
                              }
                          else Z = 0
                          if (
                            (0 |
                              (v =
                                (F -
                                  (102 != (0 | p) ? Z : 0) +
                                  ((((h = 0 != (0 | F)) & (b = 103 == (0 | p))) << 31) >> 31)) |
                                0)) <
                            ((((9 * ((q - w) >> 2)) | 0) - 9) | 0)
                          ) {
                            if (
                              ((v = (A + 4 + (((((0 | (y = (v + 9216) | 0)) / 9) | 0) - 1024) << 2)) | 0),
                              (0 | (T = (1 + ((0 | y) % 9 | 0)) | 0)) < 9)
                            )
                              for (y = T, T = 10; ; ) {
                                if (((z = (10 * T) | 0), 9 == (0 | (y = (y + 1) | 0)))) {
                                  J = z
                                  break
                                }
                                T = z
                              }
                            else J = 10
                            if (
                              ((T = 0 | Ge[v >> 2]),
                              (p = ((v + 4) | 0) == (0 | q)) & (0 == (0 | (y = (T >>> 0) % (J >>> 0) | 0))))
                            )
                              (ne = v), (oe = Z), (ie = G)
                            else if (
                              ((O =
                                0 == ((1 & (((T >>> 0) / (J >>> 0)) | 0)) | 0) ? 9007199254740992 : 9007199254740994),
                              (g = y >>> 0 < (z = ((0 | J) / 2) | 0) >>> 0 ? 0.5 : p & ((0 | y) == (0 | z)) ? 1 : 1.5),
                              ($ = S ? ((z = 45 == (0 | Xe[_ >> 0])), (Q = z ? -g : g), z ? -O : O) : ((Q = g), O)),
                              (z = (T - y) | 0),
                              (Ge[v >> 2] = z),
                              $ + Q != $)
                            ) {
                              if (((y = (z + J) | 0), 999999999 < (Ge[v >> 2] = y) >>> 0))
                                for (y = G, z = v; ; ) {
                                  if (
                                    ((T = (z + -4) | 0),
                                    (Ge[z >> 2] = 0),
                                    (ee = T >>> 0 < y >>> 0 ? ((Ge[(p = (y + -4) | 0) >> 2] = 0), p) : y),
                                    (p = (1 + (0 | Ge[T >> 2])) | 0),
                                    !(999999999 < (Ge[T >> 2] = p) >>> 0))
                                  ) {
                                    ;(re = ee), (te = T)
                                    break
                                  }
                                  ;(y = ee), (z = T)
                                }
                              else (re = G), (te = v)
                              if (((z = (9 * ((w - re) >> 2)) | 0), (y = 0 | Ge[re >> 2]) >>> 0 < 10))
                                (ne = te), (oe = z), (ie = re)
                              else
                                for (T = z, z = 10; ; ) {
                                  if (((p = (T + 1) | 0), y >>> 0 < (z = (10 * z) | 0) >>> 0)) {
                                    ;(ne = te), (oe = p), (ie = re)
                                    break
                                  }
                                  T = p
                                }
                            } else (ne = v), (oe = Z), (ie = G)
                            ;(ae = oe), (se = (T = (ne + 4) | 0) >>> 0 < q >>> 0 ? T : q), (ue = ie)
                          } else (ae = Z), (se = q), (ue = G)
                          for (T = se; ; ) {
                            if (T >>> 0 <= ue >>> 0) {
                              ce = 0
                              break
                            }
                            if (0 | Ge[(z = (T + -4) | 0) >> 2]) {
                              ce = 1
                              break
                            }
                            T = z
                          }
                          v = (0 - ae) | 0
                          do {
                            if (b) {
                              if (
                                ((fe =
                                  ((0 | ae) < (0 | (z = ((1 & (1 ^ h)) + F) | 0))) & (-5 < (0 | ae))
                                    ? ((le = (i + -1) | 0), (z + -1 - ae) | 0)
                                    : ((le = (i + -2) | 0), (z + -1) | 0)),
                                !(z = 8 & o))
                              ) {
                                if (ce && 0 != (0 | (y = 0 | Ge[(T + -4) >> 2])))
                                  if ((y >>> 0) % 10 | 0) de = 0
                                  else
                                    for (p = 0, K = 10; ; ) {
                                      if (((L = (p + 1) | 0), (y >>> 0) % ((K = (10 * K) | 0) >>> 0) | 0)) {
                                        de = L
                                        break
                                      }
                                      p = L
                                    }
                                else de = 9
                                if (((p = (((9 * ((T - w) >> 2)) | 0) - 9) | 0), 102 == (32 | le))) {
                                  ;(Ee = le),
                                    (Se = (0 | fe) < (0 | (y = 0 < (0 | (K = (p - de) | 0)) ? K : 0)) ? fe : y),
                                    (_e = 0)
                                  break
                                }
                                ;(Ee = le),
                                  (Se = (0 | fe) < (0 | (p = 0 < (0 | (y = (p + ae - de) | 0)) ? y : 0)) ? fe : p),
                                  (_e = 0)
                                break
                              }
                              ;(Ee = le), (Se = fe), (_e = z)
                            } else (Ee = i), (Se = F), (_e = 8 & o)
                          } while (0)
                          if (((w = (0 != (0 | (F = Se | _e))) & 1), (h = 102 == (32 | Ee))))
                            he = (me = 0) < (0 | ae) ? ae : 0
                          else {
                            if (
                              ((p = 0 | Ie((b = (0 | ae) < 0 ? v : ae), (((0 | b) < 0) << 31) >> 31, d)),
                              (((b = d) - p) | 0) < 2)
                            )
                              for (y = p; ; ) {
                                if (((Xe[(K = (y + -1) | 0) >> 0] = 48), !(((b - K) | 0) < 2))) {
                                  pe = K
                                  break
                                }
                                y = K
                              }
                            else pe = p
                            ;(Xe[(pe + -1) >> 0] = 43 + ((ae >> 31) & 2)),
                              (Xe[(y = (pe + -2) | 0) >> 0] = Ee),
                              (he = (b - (me = y)) | 0)
                          }
                          if (
                            (xe(e, 32, t, (y = (S + 1 + Se + w + he) | 0), o),
                            De(e, _, S),
                            xe(e, 48, t, y, 65536 ^ o),
                            h)
                          ) {
                            ;(x = K = (9 + c) | 0), (V = (8 + c) | 0), (L = v = A >>> 0 < ue >>> 0 ? A : ue)
                            do {
                              if (((N = 0 | Ie(0 | Ge[L >> 2], 0, K)), (0 | L) == (0 | v)))
                                Fe = (0 | N) == (0 | K) ? ((Xe[V >> 0] = 48), V) : N
                              else if (c >>> 0 < N >>> 0)
                                for (er(0 | c, 48, (N - l) | 0), M = N; ; ) {
                                  if (!(c >>> 0 < (W = (M + -1) | 0) >>> 0)) {
                                    Fe = W
                                    break
                                  }
                                  M = W
                                }
                              else Fe = N
                            } while ((De(e, Fe, (x - Fe) | 0), (L = (L + 4) | 0) >>> 0 <= A >>> 0))
                            if ((0 | F && De(e, 1894, 1), (L >>> 0 < T >>> 0) & (0 < (0 | Se))))
                              for (A = Se, x = L; ; ) {
                                if (((V = 0 | Ie(0 | Ge[x >> 2], 0, K)), c >>> 0 < V >>> 0))
                                  for (er(0 | c, 48, (V - l) | 0), v = V; ; ) {
                                    if (!(c >>> 0 < (h = (v + -1) | 0) >>> 0)) {
                                      Me = h
                                      break
                                    }
                                    v = h
                                  }
                                else Me = V
                                if (
                                  (De(e, Me, (0 | A) < 9 ? A : 9),
                                  (v = (A + -9) | 0),
                                  !(((x = (x + 4) | 0) >>> 0 < T >>> 0) & (9 < (0 | A))))
                                ) {
                                  be = v
                                  break
                                }
                                A = v
                              }
                            else be = Se
                            xe(e, 48, (be + 9) | 0, 9, 0)
                          } else {
                            if (((A = ce ? T : (ue + 4) | 0), -1 < (0 | Se)))
                              for (
                                K = 0 == (0 | _e),
                                  L = x = (9 + c) | 0,
                                  F = (0 - l) | 0,
                                  v = (8 + c) | 0,
                                  N = Se,
                                  h = ue;
                                ;

                              ) {
                                ;(w = 0 | Ie(0 | Ge[h >> 2], 0, x)),
                                  (ye = (0 | w) == (0 | x) ? ((Xe[v >> 0] = 48), v) : w)
                                do {
                                  if ((0 | h) == (0 | ue)) {
                                    if (((w = (ye + 1) | 0), De(e, ye, 1), K & ((0 | N) < 1))) {
                                      Oe = w
                                      break
                                    }
                                    De(e, 1894, 1), (Oe = w)
                                  } else {
                                    if (ye >>> 0 <= c >>> 0) {
                                      Oe = ye
                                      break
                                    }
                                    for (er(0 | c, 48, (ye + F) | 0), w = ye; ; ) {
                                      if (!(c >>> 0 < (b = (w + -1) | 0) >>> 0)) {
                                        Oe = b
                                        break
                                      }
                                      w = b
                                    }
                                  }
                                } while (0)
                                if (
                                  (De(e, Oe, (0 | (V = (L - Oe) | 0)) < (0 | N) ? V : N),
                                  !(((h = (h + 4) | 0) >>> 0 < A >>> 0) & (-1 < (0 | (w = (N - V) | 0)))))
                                ) {
                                  we = w
                                  break
                                }
                                N = w
                              }
                            else we = Se
                            xe(e, 48, (we + 18) | 0, 18, 0), De(e, me, (d - me) | 0)
                          }
                          xe(e, 32, t, y, 8192 ^ o), (P = y)
                        } else
                          (N = 0 != ((32 & i) | 0)),
                            xe(e, 32, t, (A = (S + 3) | 0), -65537 & o),
                            De(e, _, S),
                            De(e, (E != E) | !1 ? (N ? 1870 : 1874) : N ? 1862 : 1866, 3),
                            xe(e, 32, t, A, 8192 ^ o),
                            (P = A)
                      } while (0)
                      return (Ze = a), 0 | ((0 | P) < (0 | t) ? t : P)
                    })(e, +Te[a >> 3], W, q, P, r)),
                    (m = F),
                    (h = j),
                    (p = J)
                  continue e
                default:
                  ;(Se = p), (_e = 0), (me = 1826), (he = f), (pe = q), (Fe = P)
              }
            } while (0)
            r: do {
              if (61 == (0 | M))
                (ne = r =
                  (M = 0) |
                  (function (e, r, t, n) {
                    ;(t |= 0), (n |= 0)
                    var o = 0,
                      i = 0
                    if ((0 == (0 | (e |= 0))) & (0 == (0 | (r |= 0)))) o = t
                    else
                      for (i = t, t = r, r = e; ; ) {
                        if (
                          ((Xe[(e = (i + -1) | 0) >> 0] = 0 | qe[(1878 + (15 & r)) >> 0] | n),
                          (0 == (0 | (r = 0 | Ve(0 | r, 0 | t, 4)))) & (0 == (0 | (t = ve))))
                        ) {
                          o = e
                          break
                        }
                        i = e
                      }
                    return 0 | o
                  })((k = 0 | Ge[(r = a) >> 2]), (C = 0 | Ge[(r + 4) >> 2]), f, 32 & ee)),
                  (oe = (H = (0 == ((8 & te) | 0)) | ((0 == (0 | k)) & (0 == (0 | C)))) ? 0 : 2),
                  (ie = H ? 1826 : (1826 + (ee >> 4)) | 0),
                  (ae = re),
                  (se = te),
                  (ue = k),
                  (ce = C),
                  (M = 67)
              else if (66 == (0 | M))
                (ne = (M = 0) | Ie(de, Ee, f)), (oe = le), (ie = fe), (ae = q), (se = P), (ue = de), (ce = Ee), (M = 67)
              else if (71 == (0 | M))
                (me = 1826),
                  (he = (k = (_e = M = 0) == (0 | (C = 0 | Le((Se = Me), 0, q)))) ? (Me + q) | 0 : C),
                  (pe = k ? q : (C - Me) | 0),
                  (Fe = T)
              else if (75 == (0 | M)) {
                for (C = ye, H = k = M = 0; ; ) {
                  if (!(r = 0 | Ge[C >> 2])) {
                    ;(we = k), (Re = H)
                    break
                  }
                  if (((0 | (I = 0 | Be(c, r))) < 0) | (((be - k) | 0) >>> 0 < I >>> 0)) {
                    ;(we = k), (Re = I)
                    break
                  }
                  if (!((r = (I + k) | 0) >>> 0 < be >>> 0)) {
                    ;(we = r), (Re = I)
                    break
                  }
                  ;(C = (C + 4) | 0), (k = r), (H = I)
                }
                if ((0 | Re) < 0) {
                  K = -1
                  break e
                }
                if ((xe(e, 32, W, we, P), we))
                  for (H = ye, k = 0; ; ) {
                    if (!(C = 0 | Ge[H >> 2])) {
                      ;(Oe = we), (M = 84)
                      break r
                    }
                    if ((0 | we) < (0 | (k = ((I = 0 | Be(c, C)) + k) | 0))) {
                      ;(Oe = we), (M = 84)
                      break r
                    }
                    if ((De(e, c, I), we >>> 0 <= k >>> 0)) {
                      ;(Oe = we), (M = 84)
                      break
                    }
                    H = (H + 4) | 0
                  }
                else (Oe = 0), (M = 84)
              }
            } while (0)
            if (67 == (0 | M))
              (k = (d - ne + (1 & (1 ^ (T = ((M = 0) != (0 | ue)) | (0 != (0 | ce)))))) | 0),
                (Se = (H = (0 != (0 | ae)) | T) ? ne : f),
                (_e = oe),
                (me = ie),
                (he = f),
                (pe = !H || (0 | k) < (0 | ae) ? ae : k),
                (Fe = -1 < (0 | ae) ? -65537 & se : se)
            else if (84 == (0 | M)) {
              ;(M = 0), xe(e, 32, W, Oe, 8192 ^ P), (_ = (0 | Oe) < (0 | W) ? W : Oe), (m = F), (h = j), (p = J)
              continue
            }
            xe(
              e,
              32,
              (I = (0 | W) < (0 | (T = ((H = (0 | pe) < (0 | (k = (he - Se) | 0)) ? k : pe) + _e) | 0)) ? T : W),
              T,
              Fe
            ),
              De(e, me, _e),
              xe(e, 48, I, T, 65536 ^ Fe),
              xe(e, 48, H, k, 0),
              De(e, Se, k),
              xe(e, 32, I, T, 8192 ^ Fe),
              (_ = I),
              (m = F),
              (h = j),
              (p = J)
          } else (_ = 0), (m = F), (h = j), (p = J)
        }
      }
      e: do {
        if (87 == (0 | M))
          if (e) K = F
          else if (h) {
            for (J = 1; ; ) {
              if (!(p = 0 | Ge[(o + (J << 2)) >> 2])) {
                Ae = J
                break
              }
              if ((Ce((n + (J << 3)) | 0, p, t), 10 <= (0 | (J = (J + 1) | 0)))) {
                K = 1
                break e
              }
            }
            for (;;) {
              if (0 | Ge[(o + (Ae << 2)) >> 2]) {
                K = -1
                break e
              }
              if (10 <= (0 | (Ae = (Ae + 1) | 0))) {
                K = 1
                break
              }
            }
          } else K = 0
      } while (0)
      return (Ze = ke), 0 | K
    }
    function V() {
      return 0
    }
    function K() {
      0
    }
    function De(e, r, t) {
      ;(r |= 0), (t |= 0), 32 & Ge[(e |= 0) >> 2] || W(r, t, e)
    }
    function Pe(e) {
      var r = 0,
        t = 0,
        n = 0,
        o = 0,
        i = 0,
        r = 0 | Ge[(e |= 0) >> 2]
      if ((t = ((0 | Xe[r >> 0]) - 48) | 0) >>> 0 < 10)
        for (n = 0, o = r, r = t; ; ) {
          if (
            ((t = (r + ((10 * n) | 0)) | 0),
            (o = (o + 1) | 0),
            (Ge[e >> 2] = o),
            10 <= (r = ((0 | Xe[o >> 0]) - 48) | 0) >>> 0)
          ) {
            i = t
            break
          }
          n = t
        }
      else i = 0
      return 0 | i
    }
    function Ce(e, r, t) {
      ;(e |= 0), (r |= 0), (t |= 0)
      var n,
        o = 0,
        i = 0,
        a = 0,
        s = 0
      e: do {
        if (r >>> 0 <= 20) {
          switch (0 | r) {
            case 9:
              ;(o = (3 + (0 | Ge[t >> 2])) & -4), (i = 0 | Ge[o >> 2]), (Ge[t >> 2] = o + 4), (Ge[e >> 2] = i)
              break e
            case 10:
              ;(i = (3 + (0 | Ge[t >> 2])) & -4),
                (o = 0 | Ge[i >> 2]),
                (Ge[t >> 2] = i + 4),
                (Ge[(i = e) >> 2] = o),
                (Ge[(i + 4) >> 2] = (((0 | o) < 0) << 31) >> 31)
              break e
            case 11:
              ;(o = (3 + (0 | Ge[t >> 2])) & -4),
                (i = 0 | Ge[o >> 2]),
                (Ge[t >> 2] = o + 4),
                (Ge[(o = e) >> 2] = i),
                (Ge[(o + 4) >> 2] = 0)
              break e
            case 12:
              ;(o = (7 + (0 | Ge[t >> 2])) & -8),
                (n = 0 | Ge[(i = o) >> 2]),
                (a = 0 | Ge[(i + 4) >> 2]),
                (Ge[t >> 2] = o + 8),
                (Ge[(o = e) >> 2] = n),
                (Ge[(o + 4) >> 2] = a)
              break e
            case 13:
              ;(a = (3 + (0 | Ge[t >> 2])) & -4),
                (o = 0 | Ge[a >> 2]),
                (Ge[t >> 2] = a + 4),
                (a = ((65535 & o) << 16) >> 16),
                (Ge[(o = e) >> 2] = a),
                (Ge[(o + 4) >> 2] = (((0 | a) < 0) << 31) >> 31)
              break e
            case 14:
              ;(a = (3 + (0 | Ge[t >> 2])) & -4),
                (o = 0 | Ge[a >> 2]),
                (Ge[t >> 2] = a + 4),
                (Ge[(a = e) >> 2] = 65535 & o),
                (Ge[(a + 4) >> 2] = 0)
              break e
            case 15:
              ;(a = (3 + (0 | Ge[t >> 2])) & -4),
                (o = 0 | Ge[a >> 2]),
                (Ge[t >> 2] = a + 4),
                (a = ((255 & o) << 24) >> 24),
                (Ge[(o = e) >> 2] = a),
                (Ge[(o + 4) >> 2] = (((0 | a) < 0) << 31) >> 31)
              break e
            case 16:
              ;(a = (3 + (0 | Ge[t >> 2])) & -4),
                (o = 0 | Ge[a >> 2]),
                (Ge[t >> 2] = a + 4),
                (Ge[(a = e) >> 2] = 255 & o),
                (Ge[(a + 4) >> 2] = 0)
              break e
            case 17:
            case 18:
              ;(a = (7 + (0 | Ge[t >> 2])) & -8), (s = +Te[a >> 3]), (Ge[t >> 2] = a + 8), (Te[e >> 3] = s)
              break e
            default:
              break e
          }
        }
      } while (0)
    }
    function Ie(e, r, t) {
      t |= 0
      var n = 0,
        o = 0,
        i = 0,
        a = 0,
        s = 0,
        u = 0
      if ((0 < (r |= 0) >>> 0) | ((0 == (0 | r)) & (4294967295 < (e |= 0) >>> 0))) {
        for (
          n = t, o = e, i = r;
          (r = 0 | rr(0 | o, 0 | i, 10, 0)),
            (Xe[(n = (n + -1) | 0) >> 0] = (255 & r) | 48),
            (o = 0 | We(0 | (r = o), 0 | i, 10, 0)),
            (9 < i >>> 0) | ((9 == (0 | i)) & (4294967295 < r >>> 0));

        )
          i = ve
        ;(a = o), (s = n)
      } else (a = e), (s = t)
      if (a)
        for (t = a, a = s; ; ) {
          if (((Xe[(s = (a + -1) | 0) >> 0] = (t >>> 0) % 10 | 48), t >>> 0 < 10)) {
            u = s
            break
          }
          ;(t = ((t >>> 0) / 10) | 0), (a = s)
        }
      else u = s
      return 0 | u
    }
    function Le(e, r, t) {
      e |= 0
      var n,
        o,
        i,
        a,
        s = 0,
        u = 0,
        c = 0,
        l = 0,
        f = 0,
        d = 0,
        E = 0,
        S = 0,
        _ = 0,
        m = 0,
        h = 0,
        p = 0,
        F = 0,
        M = 0,
        b = 0,
        y = 255 & (r |= 0),
        s = 0 != (0 | (t |= 0))
      e: do {
        if (s & (0 != ((3 & e) | 0)))
          for (n = 255 & r, u = e, c = t; ; ) {
            if ((0 | Xe[u >> 0]) == (n << 24) >> 24) {
              ;(l = u), (f = c), (d = 6)
              break e
            }
            if (!((a = 0 != (0 | (i = (c + -1) | 0))) & (0 != ((3 & (o = (u + 1) | 0)) | 0)))) {
              ;(E = o), (S = i), (_ = a), (d = 5)
              break
            }
            ;(u = o), (c = i)
          }
        else (E = e), (S = t), (_ = s), (d = 5)
      } while (0)
      5 == (0 | d) && (_ ? ((l = E), (f = S), (d = 6)) : ((m = E), (h = 0)))
      e: do {
        if (6 == (0 | d))
          if (((E = 255 & r), (0 | Xe[l >> 0]) == (E << 24) >> 24)) (m = l), (h = f)
          else {
            S = 0 | Ne(y, 16843009)
            r: do {
              if (3 < f >>> 0) {
                for (_ = l, s = f; !((((-2139062144 & (t = Ge[_ >> 2] ^ S)) ^ -2139062144) & (t + -16843009)) | 0); ) {
                  if (((t = (_ + 4) | 0), !(3 < (e = (s + -4) | 0) >>> 0))) {
                    ;(p = t), (F = e), (d = 11)
                    break r
                  }
                  ;(_ = t), (s = e)
                }
                ;(M = _), (b = s)
              } else (p = l), (F = f), (d = 11)
            } while (0)
            if (11 == (0 | d)) {
              if (!F) {
                ;(m = p), (h = 0)
                break
              }
              ;(M = p), (b = F)
            }
            for (;;) {
              if ((0 | Xe[M >> 0]) == (E << 24) >> 24) {
                ;(m = M), (h = b)
                break e
              }
              if (((S = (M + 1) | 0), !(b = (b + -1) | 0))) {
                ;(m = S), (h = 0)
                break
              }
              M = S
            }
          }
      } while (0)
      return 0 | (0 | h ? m : 0)
    }
    function xe(e, r, t, n, o) {
      ;(e |= 0), (r |= 0), (t |= 0), (n |= 0), (o |= 0)
      var i,
        a = 0,
        s = Ze
      if (
        ((0 | Je) <= (0 | (Ze = (Ze + 256) | 0)) && Qe(256), (i = s), ((0 | n) < (0 | t)) & (0 == ((73728 & o) | 0)))
      ) {
        if ((er(0 | i, 0 | r, 0 | ((o = (t - n) | 0) >>> 0 < 256 ? o : 256)), 255 < o >>> 0)) {
          for (r = (t - n) | 0, n = o; De(e, i, 256), (n = (n + -256) | 0), 255 < n >>> 0; );
          a = 255 & r
        } else a = o
        De(e, i, a)
      }
      Ze = s
    }
    function Be(e, r) {
      r |= 0
      return (
        0 |
        ((e |= 0)
          ? 0 |
            (function (e, r) {
              ;(e |= 0), (r |= 0), 0
              var t = 0
              do {
                if (e) {
                  if (r >>> 0 < 128) {
                    ;(Xe[e >> 0] = r), (t = 1)
                    break
                  }
                  if (!(0 | Ge[Ge[776 >> 2] >> 2])) {
                    if (57216 == ((-128 & r) | 0)) {
                      ;(Xe[e >> 0] = r), (t = 1)
                      break
                    }
                    ;(Ge[652 >> 2] = 84), (t = -1)
                    break
                  }
                  if (r >>> 0 < 2048) {
                    ;(Xe[e >> 0] = (r >>> 6) | 192), (Xe[(e + 1) >> 0] = (63 & r) | 128), (t = 2)
                    break
                  }
                  if ((r >>> 0 < 55296) | (57344 == ((-8192 & r) | 0))) {
                    ;(Xe[e >> 0] = (r >>> 12) | 224),
                      (Xe[(e + 1) >> 0] = ((r >>> 6) & 63) | 128),
                      (Xe[(e + 2) >> 0] = (63 & r) | 128),
                      (t = 3)
                    break
                  }
                  if (((r + -65536) | 0) >>> 0 < 1048576) {
                    ;(Xe[e >> 0] = (r >>> 18) | 240),
                      (Xe[(e + 1) >> 0] = ((r >>> 12) & 63) | 128),
                      (Xe[(e + 2) >> 0] = ((r >>> 6) & 63) | 128),
                      (Xe[(e + 3) >> 0] = (63 & r) | 128),
                      (t = 4)
                    break
                  }
                  ;(Ge[652 >> 2] = 84), (t = -1)
                  break
                }
              } while (((t = 1), 0))
              return 0 | t
            })(e, r)
          : 0)
      )
    }
    function He(e) {
      e = +e
      var r
      return (Te[ge >> 3] = e), (r = 0 | Ge[ge >> 2]), (ve = 0 | Ge[(ge + 4) >> 2]), 0 | r
    }
    function Ue(e, r) {
      var t = 0 | ce(0 | (e |= 0))
      return 0 | (0 == (0 | (r |= 0)) ? e : t)
    }
    function W(e, r, t) {
      ;(e |= 0), (r |= 0)
      var n,
        o = 0,
        i = 0,
        a = 0,
        s = 0,
        u = 0,
        c = 0,
        l = 0,
        f = 0,
        d = 0,
        E = 0
      ;(i = 0 | Ge[(o = ((t |= 0) + 16) | 0) >> 2])
        ? ((a = i), (s = 5))
        : 0 | X(t)
          ? (u = 0)
          : ((a = 0 | Ge[o >> 2]), (s = 5))
      e: do {
        if (5 == (0 | s)) {
          if (((a - (n = o = 0 | Ge[(i = (t + 20) | 0) >> 2])) | 0) >>> 0 < r >>> 0) {
            u = 0 | de[7 & Ge[(t + 36) >> 2]](t, e, r)
            break
          }
          r: do {
            if (-1 < (0 | Xe[(t + 75) >> 0])) {
              for (o = r; ; ) {
                if (!o) {
                  ;(c = 0), (l = e), (f = r), (d = n)
                  break r
                }
                if (10 == (0 | Xe[(e + (E = (o + -1) | 0)) >> 0])) break
                o = E
              }
              if ((E = 0 | de[7 & Ge[(t + 36) >> 2]](t, e, o)) >>> 0 < o >>> 0) {
                u = E
                break e
              }
              ;(l = (e + (c = o)) | 0), (f = (r - o) | 0), (d = 0 | Ge[i >> 2])
            } else (c = 0), (l = e), (f = r), (d = n)
          } while (0)
          tr(0 | d, 0 | l, 0 | f), (Ge[i >> 2] = (0 | Ge[i >> 2]) + f), (u = (c + f) | 0)
        }
      } while (0)
      return 0 | u
    }
    function X(e) {
      var r = 0,
        t = 0 | Xe[(r = ((e |= 0) + 74) | 0) >> 0]
      return (
        (Xe[r >> 0] = (255 + t) | t),
        0 |
          (8 & (t = 0 | Ge[e >> 2])
            ? ((Ge[e >> 2] = 32 | t), -1)
            : ((Ge[(e + 8) >> 2] = 0),
              (r = (Ge[(e + 4) >> 2] = 0) | Ge[(e + 44) >> 2]),
              (Ge[(e + 28) >> 2] = r),
              (Ge[(e + 20) >> 2] = r),
              (Ge[(e + 16) >> 2] = r + (0 | Ge[(e + 48) >> 2])),
              0))
      )
    }
    function j(e) {
      var r,
        t = 0,
        n = 0,
        o = 0,
        i = 0,
        a = 0,
        s = 0,
        u = 0,
        c = 0,
        t = (e |= 0)
      e: do {
        if (3 & t)
          for (i = e, a = t; ; ) {
            if (!(0 | Xe[i >> 0])) {
              s = a
              break e
            }
            if (!(3 & (a = r = (i + 1) | 0))) {
              ;(n = r), (o = 4)
              break
            }
            i = r
          }
        else (n = e), (o = 4)
      } while (0)
      if (4 == (0 | o)) {
        for (o = n; !(((-2139062144 & (u = 0 | Ge[o >> 2])) ^ -2139062144) & (u + -16843009)); ) o = (o + 4) | 0
        if (((255 & u) << 24) >> 24)
          for (u = o; ; ) {
            if (!(0 | Xe[(o = (u + 1) | 0) >> 0])) {
              c = o
              break
            }
            u = o
          }
        else c = o
        s = c
      }
      return (s - t) | 0
    }
    function G(e, r) {
      var t =
        0 |
        (function (e, r) {
          e |= 0
          var t = 0,
            n = 0,
            o = 0,
            i = 0,
            a = 0,
            s = 0,
            u = 0,
            c = 0,
            l = 0
          t = 255 & (r |= 0)
          e: do {
            if (t) {
              if (3 & e)
                for (i = 255 & r, a = e; ; ) {
                  if (((s = 0 | Xe[a >> 0]) << 24) >> 24 == 0 || (s << 24) >> 24 == (i << 24) >> 24) {
                    n = a
                    break e
                  }
                  if (!(3 & (s = (a + 1) | 0))) {
                    o = s
                    break
                  }
                  a = s
                }
              else o = e
              ;(a = 0 | Ne(t, 16843009)), (i = 0 | Ge[o >> 2])
              r: do {
                if (((-2139062144 & i) ^ -2139062144) & (i + -16843009)) l = o
                else
                  for (s = o, u = i; ; ) {
                    if ((((-2139062144 & (c = u ^ a)) ^ -2139062144) & (c - 16843009)) | 0) {
                      l = s
                      break r
                    }
                    if ((((-2139062144 & (u = 0 | Ge[(c = (s + 4) | 0) >> 2])) ^ -2139062144) & (u + -16843009)) | 0) {
                      l = c
                      break
                    }
                    s = c
                  }
              } while (0)
              for (a = 255 & r, i = l; ; ) {
                if (((s = 0 | Xe[i >> 0]) << 24) >> 24 == 0 || (s << 24) >> 24 == (a << 24) >> 24) {
                  n = i
                  break
                }
                i = (i + 1) | 0
              }
            } else n = (e + (0 | j(e))) | 0
          } while (0)
          return 0 | n
        })((e |= 0), (r |= 0))
      return 0 | ((0 | Xe[t >> 0]) == ((255 & r) << 24) >> 24 ? t : 0)
    }
    function q(e, r) {
      r |= 0
      var t = 0
      return (
        ((((0 |
          (function (e, r, t, n) {
            ;(e |= 0), (n |= 0)
            var o = 0,
              i = 0,
              a = 0,
              s = 0,
              u = 0
            ;(o = 0 | Ne((t |= 0), (r |= 0))),
              (i = 0 == (0 | r) ? 0 : t),
              (s = -1 < (0 | Ge[(n + 76) >> 2]) ? ((t = !0), (a = 0 | W(e, o, n)), t || K(), a) : 0 | W(e, o, n))
            u = (0 | s) == (0 | o) ? i : ((s >>> 0) / (r >>> 0)) | 0
            return 0 | u
          })((e |= 0), 1, (t = 0 | j(e)), r)) !=
          (0 | t)) <<
          31) >>
          31) |
        0
      )
    }
    function Z(e) {
      var r, t
      0 | Ge[((e |= 0) + 68) >> 2] &&
        ((t = (e + 112) | 0),
        0 | (r = 0 | Ge[(e + 116) >> 2]) && (Ge[(112 + r) >> 2] = Ge[t >> 2]),
        (e = 0 | Ge[t >> 2]),
        (Ge[(e ? (e + 116) | 0 : 820) >> 2] = r))
    }
    function J(e, r) {
      ;(e |= 0), (r |= 0)
      var t,
        n,
        o = 0,
        i = 0,
        a = 0,
        s = 0,
        u = 0,
        c = 0,
        l = Ze
      ;(0 | Je) <= (0 | (Ze = (Ze + 16) | 0)) && Qe(16),
        (n = 255 & r),
        (Xe[(t = l) >> 0] = n),
        (i = 0 | Ge[(o = (e + 16) | 0) >> 2])
          ? ((a = i), (s = 4))
          : 0 | X(e)
            ? (u = -1)
            : ((a = 0 | Ge[o >> 2]), (s = 4))
      do {
        if (4 == (0 | s)) {
          if ((o = 0 | Ge[(i = (e + 20) | 0) >> 2]) >>> 0 < a >>> 0 && (0 | (c = 255 & r)) != (0 | Xe[(e + 75) >> 0])) {
            ;(Ge[i >> 2] = o + 1), (Xe[o >> 0] = n), (u = c)
            break
          }
          u = 1 == (0 | de[7 & Ge[(e + 36) >> 2]](e, t, 1)) ? 0 | qe[t >> 0] : -1
        }
      } while (0)
      return (Ze = l), 0 | u
    }
    function Q() {
      return b(4352), 4360
    }
    function $() {
      g(4352)
    }
    function ee(e) {
      var r,
        t,
        n,
        o = 0,
        i = 0,
        a = 0,
        o = (Ge[((e |= 0) + 76) >> 2], 0)
      return (
        Z(e),
        (r = 0 != ((1 & Ge[e >> 2]) | 0)) ||
          ((i = 0 | Q()),
          (n = (e + 56) | 0),
          0 | (t = 0 | Ge[(e + 52) >> 2]) && (Ge[(56 + t) >> 2] = Ge[n >> 2]),
          0 | (a = 0 | Ge[n >> 2]) && (Ge[(a + 52) >> 2] = t),
          (0 | Ge[i >> 2]) == (0 | e) && (Ge[i >> 2] = a),
          $()),
        (a = 0 | re(e)),
        (i = 0 | fe[1 & Ge[(e + 12) >> 2]](e) | a),
        0 | (a = 0 | Ge[(e + 92) >> 2]) && B(a),
        r ? 0 | o && K() : B(e),
        0 | i
      )
    }
    function re(e) {
      e |= 0
      var r = 0,
        t = 0,
        n = 0,
        o = 0,
        i = 0,
        a = 0,
        s = 0
      do {
        if (e) {
          if ((0 | Ge[(e + 76) >> 2]) <= -1) {
            r = 0 | te(e)
            break
          }
          r = ((t = !0) || K(), (n = 0 | te(e)))
        } else {
          if (((o = 0 | Ge[240] ? 0 | re(0 | Ge[240]) : 0), (n = 0 | Q()), (t = 0 | Ge[n >> 2])))
            for (n = t, t = o; ; ) {
              if (
                ((a = (Ge[(n + 76) >> 2], 0)),
                (s = (0 | Ge[(n + 20) >> 2]) >>> 0 > (0 | Ge[(n + 28) >> 2]) >>> 0 ? 0 | te(n) | t : t),
                0 | a && K(),
                !(n = 0 | Ge[(n + 56) >> 2]))
              ) {
                i = s
                break
              }
              t = s
            }
          else i = o
          $(), (r = i)
        }
      } while (0)
      return 0 | r
    }
    function te(e) {
      var r,
        t,
        n,
        o,
        i = 0,
        a = ((e |= 0) + 28) | 0
      return (
        0 |
        ((0 | Ge[(i = (e + 20) | 0) >> 2]) >>> 0 > (0 | Ge[a >> 2]) >>> 0 &&
        (de[7 & Ge[(e + 36) >> 2]](e, 0, 0), 0 == (0 | Ge[i >> 2]))
          ? -1
          : ((t = 0 | Ge[(r = (e + 4) | 0) >> 2]) >>> 0 < (o = 0 | Ge[(n = (e + 8) | 0) >> 2]) >>> 0 &&
              de[7 & Ge[(e + 40) >> 2]](e, (t - o) | 0, 1),
            (Ge[(e + 16) >> 2] = 0),
            (Ge[a >> 2] = 0),
            (Ge[i >> 2] = 0),
            (Ge[n >> 2] = 0),
            (Ge[r >> 2] = 0)))
      )
    }
    function ne(e, r, t) {
      ;(e |= 0), (r |= 0)
      var n = 0,
        n = 1 == (0 | (t |= 0)) ? (r - (0 | Ge[(e + 8) >> 2]) + (0 | Ge[(e + 4) >> 2])) | 0 : r,
        o = (e + 28) | 0
      return (
        0 |
        ((0 | Ge[(r = (e + 20) | 0) >> 2]) >>> 0 > (0 | Ge[o >> 2]) >>> 0 &&
        (de[7 & Ge[(e + 36) >> 2]](e, 0, 0), 0 == (0 | Ge[r >> 2]))
          ? -1
          : ((Ge[(e + 16) >> 2] = 0),
            (Ge[o >> 2] = 0),
            ((Ge[r >> 2] = 0) | de[7 & Ge[(e + 40) >> 2]](e, n, t)) < 0
              ? -1
              : ((Ge[(e + 8) >> 2] = 0), (Ge[(e + 4) >> 2] = 0), (Ge[e >> 2] = -17 & Ge[e >> 2]), 0)))
      )
    }
    function oe(e) {
      var r = 0,
        t = 0,
        r = 128 & Ge[(e |= 0) >> 2] && (0 | Ge[(e + 20) >> 2]) >>> 0 > (0 | Ge[(e + 28) >> 2]) >>> 0 ? 2 : 1
      return (
        0 |
        ((0 | (t = 0 | de[7 & Ge[(e + 40) >> 2]](e, 0, r))) < 0
          ? t
          : (t - (0 | Ge[(e + 8) >> 2]) + (0 | Ge[(e + 4) >> 2]) + (0 | Ge[(e + 20) >> 2]) - (0 | Ge[(e + 28) >> 2])) |
            0)
      )
    }
    function ie(e, r) {
      ;(e |= 0), (r |= 0)
      var t,
        n = Ze
      return (
        (0 | Je) <= (0 | (Ze = (Ze + 16) | 0)) && Qe(16),
        (Ge[(t = n) >> 2] = r),
        (r =
          0 |
          (function (e, r, t) {
            ;(e |= 0), (r |= 0), (t |= 0)
            var n,
              o,
              i,
              a,
              s,
              u,
              c,
              l = 0,
              f = 0,
              d = 0,
              E = 0,
              S = 0,
              _ = 0,
              m = Ze
            for (
              Ze = (Ze + 224) | 0,
                (0 | Je) <= (0 | Ze) && Qe(224),
                n = (m + 120) | 0,
                l = (m + 80) | 0,
                c = m,
                o = (m + 136) | 0,
                f = l,
                d = (f + 40) | 0;
              (f = (f + 4) | (Ge[f >> 2] = 0)), (0 | f) < (0 | d);

            );
            return (
              (Ge[n >> 2] = Ge[t >> 2]),
              (E =
                (0 | z(0, r, n, c, l)) < 0
                  ? -1
                  : ((S = -1 < (0 | Ge[(e + 76) >> 2]) ? 0 | V() : 0),
                    (f = 32 & (t = 0 | Ge[e >> 2])),
                    (0 | Xe[(e + 74) >> 0]) < 1 && (Ge[e >> 2] = -33 & t),
                    (_ =
                      0 | Ge[(t = (e + 48) | 0) >> 2]
                        ? 0 | z(e, r, n, c, l)
                        : ((i = 0 | Ge[(d = (e + 44) | 0) >> 2]),
                          (Ge[d >> 2] = o),
                          (Ge[(a = (e + 28) | 0) >> 2] = o),
                          (Ge[(s = (e + 20) | 0) >> 2] = o),
                          (Ge[t >> 2] = 80),
                          (Ge[(u = (e + 16) | 0) >> 2] = 80 + o),
                          (o = 0 | z(e, r, n, c, l)),
                          i
                            ? (de[7 & Ge[(e + 36) >> 2]](e, 0, 0),
                              (c = 0 == (0 | Ge[s >> 2]) ? -1 : o),
                              (Ge[d >> 2] = i),
                              (Ge[t >> 2] = 0),
                              (Ge[u >> 2] = 0),
                              (Ge[a >> 2] = 0),
                              (Ge[s >> 2] = 0),
                              c)
                            : o)),
                    (l = 0 | Ge[e >> 2]),
                    (Ge[e >> 2] = l | f),
                    0 | S && K(),
                    0 == ((32 & l) | 0) ? _ : -1)),
              (Ze = m),
              0 | E
            )
          })(0 | Ge[208], e, t)),
        (Ze = n),
        0 | r
      )
    }
    function ae(e) {
      e |= 0
      var r = 0,
        t = 0,
        n = 0,
        o = 0,
        i = 0 | Ge[208],
        r = (Ge[(76 + i) >> 2], 0)
      do {
        if ((0 | q(e, i)) < 0) t = 1
        else {
          if (
            10 != (0 | Xe[(75 + i) >> 0]) &&
            (o = 0 | Ge[(n = (20 + i) | 0) >> 2]) >>> 0 < (0 | Ge[(16 + i) >> 2]) >>> 0
          ) {
            ;(Ge[n >> 2] = o + 1), (Xe[o >> 0] = 10), (t = 0)
            break
          }
          t = (0 | J(i, 10)) < 0
        }
      } while (0)
      return 0 | r && K(), ((t << 31) >> 31) | 0
    }
    function Ye(e, r, t, n) {
      ;(r |= 0), (n |= 0)
      return 0 | ((ve = (r - n - (((e |= 0) >>> 0 < (t |= 0) >>> 0) | 0)) >>> 0), ((e - t) >>> 0) | 0)
    }
    function ze(e, r, t, n) {
      var o = 0
      return 0 | ((ve = ((r |= 0) + (n |= 0) + (((o = ((e |= 0) + (t |= 0)) >>> 0) >>> 0 < e >>> 0) | 0)) >>> 0), 0 | o)
    }
    function er(e, r, t) {
      r |= 0
      var n,
        o,
        i,
        a = ((e |= 0) + (t |= 0)) | 0
      if (((r &= 255), 67 <= (0 | t))) {
        for (; 3 & e; ) (Xe[e >> 0] = r), (e = (e + 1) | 0)
        for (o = ((n = (-4 & a) | 0) - 64) | 0, i = r | (r << 8) | (r << 16) | (r << 24); (0 | e) <= (0 | o); )
          (Ge[e >> 2] = i),
            (Ge[(e + 4) >> 2] = i),
            (Ge[(e + 8) >> 2] = i),
            (Ge[(e + 12) >> 2] = i),
            (Ge[(e + 16) >> 2] = i),
            (Ge[(e + 20) >> 2] = i),
            (Ge[(e + 24) >> 2] = i),
            (Ge[(e + 28) >> 2] = i),
            (Ge[(e + 32) >> 2] = i),
            (Ge[(e + 36) >> 2] = i),
            (Ge[(e + 40) >> 2] = i),
            (Ge[(e + 44) >> 2] = i),
            (Ge[(e + 48) >> 2] = i),
            (Ge[(e + 52) >> 2] = i),
            (Ge[(e + 56) >> 2] = i),
            (Ge[(e + 60) >> 2] = i),
            (e = (e + 64) | 0)
        for (; (0 | e) < (0 | n); ) (Ge[e >> 2] = i), (e = (e + 4) | 0)
      }
      for (; (0 | e) < (0 | a); ) (Xe[e >> 0] = r), (e = (e + 1) | 0)
      return (a - t) | 0
    }
    function Ve(e, r, t) {
      return (
        (e |= 0),
        (r |= 0),
        (0 | (t |= 0)) < 32
          ? ((ve = r >>> t), (e >>> t) | ((r & ((1 << t) - 1)) << (32 - t)))
          : (r >>> (t - 32)) | (ve = 0)
      )
    }
    function Ke(e, r, t) {
      return (
        (e |= 0),
        (r |= 0),
        (0 | (t |= 0)) < 32
          ? ((ve = (r << t) | ((e & (((1 << t) - 1) << (32 - t))) >>> (32 - t))), e << t)
          : ((ve = e << (t - 32)), 0)
      )
    }
    function se(e) {
      var r = 0
      return (0 | (r = 0 | Xe[(E + (255 & (e |= 0))) >> 0])) < 8
        ? 0 | r
        : (0 | (r = 0 | Xe[(E + ((e >> 8) & 255)) >> 0])) < 8
          ? (r + 8) | 0
          : (0 | (r = 0 | Xe[(E + ((e >> 16) & 255)) >> 0])) < 8
            ? (r + 16) | 0
            : (24 + (0 | Xe[(E + (e >>> 24)) >> 0])) | 0
    }
    function ue(e, r, t, n, o) {
      o |= 0
      var i,
        a,
        s,
        u = 0,
        c = 0,
        l = 0,
        f = 0,
        d = 0,
        E = 0,
        S = 0,
        _ = 0,
        m = 0,
        h = 0,
        p = 0,
        F = 0,
        M = 0,
        b = 0,
        y = 0,
        O = 0,
        w = 0,
        R = 0,
        A = 0,
        k = 0,
        T = 0,
        g = 0,
        v = 0,
        N = 0,
        u = (e |= 0),
        f = (t |= 0),
        E = (d = n |= 0)
      if (!(l = c = r |= 0))
        return (
          (S = 0 != (0 | o)),
          E
            ? (S && ((Ge[o >> 2] = 0 | e), (Ge[(o + 4) >> 2] = 0 & r)), (m = _ = 0) | ((ve = _), m))
            : (S && ((Ge[o >> 2] = (u >>> 0) % (f >>> 0)), (Ge[(o + 4) >> 2] = 0)),
              (_ = 0) | ((ve = _), (m = ((u >>> 0) / (f >>> 0)) >>> 0)))
        )
      S = 0 == (0 | E)
      do {
        if (f) {
          if (!S) {
            if ((h = ((0 | D(0 | E)) - (0 | D(0 | l))) | 0) >>> 0 <= 31) {
              ;(y = ((u >>> ((b = p = (h + 1) | 0) >>> 0)) & (M = (h - 31) >> 31)) | (l << (F = (31 - h) | 0))),
                (O = (l >>> (p >>> 0)) & M),
                (w = 0),
                (R = u << F)
              break
            }
            return o
              ? ((Ge[o >> 2] = 0 | e), (Ge[(o + 4) >> 2] = c | (0 & r)), (m = _ = 0) | ((ve = _), m))
              : (m = _ = 0) | ((ve = _), m)
          }
          if (((F = (f - 1) | 0) & f) | 0) {
            ;(y =
              ((((h = (32 - (M = (33 + (0 | D(0 | f)) - (0 | D(0 | l))) | 0)) | 0) - 1) >> 31) &
                (l >>> ((a = (M - 32) | 0) >>> 0))) |
              (((l << h) | (u >>> ((b = M) >>> 0))) & (s = a >> 31))),
              (O = s & (l >>> (M >>> 0))),
              (w = (u << (p = (64 - M) | 0)) & (i = h >> 31)),
              (R = (((l << p) | (u >>> (a >>> 0))) & i) | ((u << h) & ((M - 33) >> 31)))
            break
          }
          return (
            0 | o && ((Ge[o >> 2] = F & u), (Ge[(o + 4) >> 2] = 0)),
            1 == (0 | f)
              ? 0 | ((ve = _ = c | (0 & r)), (m = 0 | e))
              : ((F = 0 | se(0 | f)),
                0 | ((ve = _ = (l >>> (F >>> 0)) | 0), (m = (l << (32 - F)) | (u >>> (F >>> 0)) | 0)))
          )
        }
        if (S)
          return (
            0 | o && ((Ge[o >> 2] = (l >>> 0) % (f >>> 0)), (Ge[(o + 4) >> 2] = 0)),
            (_ = 0) | ((ve = _), (m = ((l >>> 0) / (f >>> 0)) >>> 0))
          )
        if (!u)
          return (
            0 | o && ((Ge[o >> 2] = 0), (Ge[(o + 4) >> 2] = (l >>> 0) % (E >>> 0))),
            (_ = 0) | ((ve = _), (m = ((l >>> 0) / (E >>> 0)) >>> 0))
          )
        if (!((F = (E - 1) | 0) & E))
          return (
            0 | o && ((Ge[o >> 2] = 0 | e), (Ge[(o + 4) >> 2] = (F & l) | (0 & r))),
            (m = l >>> (((_ = 0) | se(0 | E)) >>> 0)),
            0 | ((ve = _), m)
          )
        if ((F = ((0 | D(0 | E)) - (0 | D(0 | l))) | 0) >>> 0 <= 30) {
          ;(y = (l << (h = (31 - F) | 0)) | (u >>> ((b = M = (F + 1) | 0) >>> 0))),
            (O = l >>> (M >>> 0)),
            (w = 0),
            (R = u << h)
          break
        }
        return o && ((Ge[o >> 2] = 0 | e), (Ge[(o + 4) >> 2] = c | (0 & r))), (m = _ = 0) | ((ve = _), m)
      } while (0)
      if (b) {
        for (
          r = 0 | t,
            t = d | (0 & n),
            n = 0 | ze(0 | r, 0 | t, -1, -1),
            d = ve,
            c = R,
            R = w,
            w = O,
            O = y,
            y = b,
            b = 0;
          (c = (R >>> 31) | ((e = c) << 1)),
            (R = b | (R << 1)),
            Ye(0 | n, 0 | d, 0 | (u = (O << 1) | (e >>> 31) | 0), 0 | (e = (O >>> 31) | (w << 1) | 0)),
            (b = 1 & (E = ((l = ve) >> 31) | (((0 | l) < 0 ? -1 : 0) << 1))),
            (O =
              0 |
              Ye(
                0 | u,
                0 | e,
                (E & r) | 0,
                (((((0 | l) < 0 ? -1 : 0) >> 31) | (((0 | l) < 0 ? -1 : 0) << 1)) & t) | 0
              )),
            (w = ve),
            (y = (y - 1) | 0),
            0 != (0 | y);

        );
        ;(A = c), (k = R), (T = w), (g = O), (v = 0), (N = b)
      } else (A = R), (k = w), (T = O), (g = y), (N = v = 0)
      return (
        (b = k),
        (k = 0) | o && ((Ge[o >> 2] = g), (Ge[(o + 4) >> 2] = T)),
        0 |
          ((ve = _ = ((0 | b) >>> 31) | ((A | k) << 1) | (0 & ((k << 1) | (b >>> 31))) | v),
          (m = (-2 & ((b << 1) | 0)) | N))
      )
    }
    function We(e, r, t, n) {
      return 0 | ue((e |= 0), (r |= 0), (t |= 0), (n |= 0), 0)
    }
    function Oe(e) {
      var r, t
      return ((0 < (0 | (e = (((e |= 0) + 15) & -16) | 0))) & ((0 | (t = ((r = 0 | Ge[d >> 2]) + e) | 0)) < (0 | r))) |
        ((0 | t) < 0)
        ? (h(), O(12), -1)
        : (0 | (Ge[d >> 2] = t)) > (0 | m()) && 0 == (0 | _())
          ? ((Ge[d >> 2] = r), O(12), -1)
          : 0 | r
    }
    function rr(e, r, t, n) {
      var o,
        i = Ze
      return (
        (Ze = (Ze + 16) | 0),
        ue((e |= 0), (r |= 0), (t |= 0), (n |= 0), (o = 0 | i)),
        (Ze = i),
        0 | ((ve = 0 | Ge[(4 + o) >> 2]), 0 | Ge[o >> 2])
      )
    }
    function tr(e, r, t) {
      ;(e |= 0), (r |= 0)
      var n,
        o,
        i = 0
      if (8192 <= (0 | (t |= 0))) return 0 | k(0 | e, 0 | r, 0 | t)
      if (((n = 0 | e), (o = (e + t) | 0), (3 & e) == (3 & r))) {
        for (; 3 & e; ) {
          if (!t) return 0 | n
          ;(Xe[e >> 0] = 0 | Xe[r >> 0]), (e = (e + 1) | 0), (r = (r + 1) | 0), (t = (t - 1) | 0)
        }
        for (t = ((i = (-4 & o) | 0) - 64) | 0; (0 | e) <= (0 | t); )
          (Ge[e >> 2] = Ge[r >> 2]),
            (Ge[(e + 4) >> 2] = Ge[(r + 4) >> 2]),
            (Ge[(e + 8) >> 2] = Ge[(r + 8) >> 2]),
            (Ge[(e + 12) >> 2] = Ge[(r + 12) >> 2]),
            (Ge[(e + 16) >> 2] = Ge[(r + 16) >> 2]),
            (Ge[(e + 20) >> 2] = Ge[(r + 20) >> 2]),
            (Ge[(e + 24) >> 2] = Ge[(r + 24) >> 2]),
            (Ge[(e + 28) >> 2] = Ge[(r + 28) >> 2]),
            (Ge[(e + 32) >> 2] = Ge[(r + 32) >> 2]),
            (Ge[(e + 36) >> 2] = Ge[(r + 36) >> 2]),
            (Ge[(e + 40) >> 2] = Ge[(r + 40) >> 2]),
            (Ge[(e + 44) >> 2] = Ge[(r + 44) >> 2]),
            (Ge[(e + 48) >> 2] = Ge[(r + 48) >> 2]),
            (Ge[(e + 52) >> 2] = Ge[(r + 52) >> 2]),
            (Ge[(e + 56) >> 2] = Ge[(r + 56) >> 2]),
            (Ge[(e + 60) >> 2] = Ge[(r + 60) >> 2]),
            (e = (e + 64) | 0),
            (r = (r + 64) | 0)
        for (; (0 | e) < (0 | i); ) (Ge[e >> 2] = Ge[r >> 2]), (e = (e + 4) | 0), (r = (r + 4) | 0)
      } else
        for (i = (o - 4) | 0; (0 | e) < (0 | i); )
          (Xe[e >> 0] = 0 | Xe[r >> 0]),
            (Xe[(e + 1) >> 0] = 0 | Xe[(r + 1) >> 0]),
            (Xe[(e + 2) >> 0] = 0 | Xe[(r + 2) >> 0]),
            (Xe[(e + 3) >> 0] = 0 | Xe[(r + 3) >> 0]),
            (e = (e + 4) | 0),
            (r = (r + 4) | 0)
      for (; (0 | e) < (0 | o); ) (Xe[e >> 0] = 0 | Xe[r >> 0]), (e = (e + 1) | 0), (r = (r + 1) | 0)
      return 0 | n
    }
    function ce(e) {
      return ((255 & (e |= 0)) << 24) | (((e >> 8) & 255) << 16) | (((e >> 16) & 255) << 8) | (e >>> 24) | 0
    }
    function le(e, r, t) {
      return F(1), 0
    }
    var fe = [
        function (e) {
          return p(0), 0
        },
        function (e) {
          e |= 0
          var r,
            t = Ze
          return (
            (0 | Je) <= (0 | (Ze = (Ze + 16) | 0)) && Qe(16),
            (r = t),
            (e = 0 | ((e = 0 | Ge[(e + 60) >> 2]), 0 | (e |= 0))),
            (Ge[r >> 2] = e),
            (e = 0 | U(0 | y(6, 0 | r))),
            (Ze = t),
            0 | e
          )
        },
      ],
      de = [
        le,
        function (e, r, t) {
          ;(e |= 0), (r |= 0), (t |= 0)
          var n = 0,
            o = Ze
          return (
            (0 | Je) <= (0 | (Ze = (Ze + 32) | 0)) && Qe(32),
            (n = o),
            (Ge[(e + 36) >> 2] = 3),
            0 == ((64 & Ge[e >> 2]) | 0) &&
              ((Ge[n >> 2] = Ge[(e + 60) >> 2]),
              (Ge[(n + 4) >> 2] = 21523),
              (Ge[(n + 8) >> 2] = o + 16),
              0 | T(54, 0 | n)) &&
              (Xe[(e + 75) >> 0] = -1),
            (n = 0 | H(e, r, t)),
            (Ze = o),
            0 | n
          )
        },
        function (e, r, t) {
          ;(e |= 0), (r |= 0), (t |= 0)
          var n,
            o,
            i = 0,
            a = Ze
          return (
            (0 | Je) <= (0 | (Ze = (Ze + 32) | 0)) && Qe(32),
            (o = ((n = a) + 20) | 0),
            (Ge[n >> 2] = Ge[(e + 60) >> 2]),
            (Ge[(n + 4) >> 2] = 0),
            (Ge[(n + 8) >> 2] = r),
            (Ge[(n + 12) >> 2] = o),
            (Ge[(n + 16) >> 2] = t),
            (i = (0 | U(0 | w(140, 0 | n))) < 0 ? (Ge[o >> 2] = -1) : 0 | Ge[o >> 2]),
            (Ze = a),
            0 | i
          )
        },
        H,
        function (e, r, t) {
          ;(e |= 0), (r |= 0), (t |= 0)
          var n,
            o,
            i,
            a,
            s,
            u = 0,
            c = 0,
            l = Ze
          return (
            (0 | Je) <= (0 | (Ze = (Ze + 32) | 0)) && Qe(32),
            (Ge[(o = ((n = l) + 16) | 0) >> 2] = r),
            (u = (4 + o) | 0),
            (a = 0 | Ge[(i = (e + 48) | 0) >> 2]),
            (Ge[u >> 2] = t - ((0 != (0 | a)) & 1)),
            (s = (e + 44) | 0),
            (Ge[(8 + o) >> 2] = Ge[s >> 2]),
            (Ge[(12 + o) >> 2] = a),
            (Ge[n >> 2] = Ge[(e + 60) >> 2]),
            (Ge[(n + 4) >> 2] = o),
            (Ge[(n + 8) >> 2] = 2),
            (c =
              1 <= (0 | (o = 0 | U(0 | v(145, 0 | n))))
                ? (n = 0 | Ge[u >> 2]) >>> 0 < o >>> 0
                  ? ((u = 0 | Ge[s >> 2]),
                    (Ge[(s = (e + 4) | 0) >> 2] = u),
                    (Ge[(e + 8) >> 2] = u + (o - n)),
                    0 | Ge[i >> 2] && ((Ge[s >> 2] = u + 1), (Xe[(r + (t + -1)) >> 0] = 0 | Xe[u >> 0])),
                    t)
                  : o
                : ((Ge[e >> 2] = Ge[e >> 2] | ((48 & o) ^ 16)), o)),
            (Ze = l),
            0 | c
          )
        },
        le,
        le,
        le,
      ]
    return {
      _llvm_bswap_i32: ce,
      _i64Subtract: Ye,
      ___udivdi3: We,
      setThrew: function (e, r) {
        ;(e |= 0), (r |= 0), S || ((S = e), 0)
      },
      _bitshift64Lshr: Ve,
      _bitshift64Shl: Ke,
      _fflush: re,
      ___errno_location: Y,
      _extract: function (e) {
        return N((e |= 0), 0), 1
      },
      _memset: er,
      _sbrk: Oe,
      _memcpy: tr,
      stackAlloc: function (e) {
        var r = Ze
        return (0 | Je) <= (0 | (Ze = ((Ze = (Ze + (e |= 0)) | 0) + 15) & -16)) && Qe(0 | e), 0 | r
      },
      ___uremdi3: rr,
      getTempRet0: function () {
        return 0 | ve
      },
      setTempRet0: function (e) {
        ve = e |= 0
      },
      _i64Add: ze,
      dynCall_iiii: function (e, r, t, n) {
        return (r |= 0), (t |= 0), (n |= 0), 0 | de[7 & (e |= 0)](0 | r, 0 | t, 0 | n)
      },
      _emscripten_get_global_libc: function () {
        return 4288
      },
      dynCall_ii: function (e, r) {
        return (r |= 0), 0 | fe[1 & (e |= 0)](0 | r)
      },
      stackSave: function () {
        return 0 | Ze
      },
      _free: B,
      runPostSets: function () {},
      establishStackSpace: function (e, r) {
        ;(Ze = e |= 0), (Je = r |= 0)
      },
      stackRestore: function (e) {
        Ze = e |= 0
      },
      _malloc: x,
      _emscripten_replace_memory: function (e) {
        return (
          !(16777215 & f(e) || f(e) <= 16777215 || 2147483648 < f(e)) &&
          ((Xe = new n(e)),
          (je = new o(e)),
          (Ge = new i(e)),
          (qe = new a(e)),
          new s(e),
          new u(e),
          new c(e),
          (Te = new l(e)),
          !0)
        )
      },
    }
  })(Module.asmGlobalArg, Module.asmLibraryArg, buffer),
  real__llvm_bswap_i32 = asm._llvm_bswap_i32
asm._llvm_bswap_i32 = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real__llvm_bswap_i32.apply(null, arguments)
  )
}
var real_getTempRet0 = asm.getTempRet0
asm.getTempRet0 = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real_getTempRet0.apply(null, arguments)
  )
}
var real____udivdi3 = asm.___udivdi3
asm.___udivdi3 = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real____udivdi3.apply(null, arguments)
  )
}
var real_setThrew = asm.setThrew
asm.setThrew = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real_setThrew.apply(null, arguments)
  )
}
var real__bitshift64Lshr = asm._bitshift64Lshr
asm._bitshift64Lshr = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real__bitshift64Lshr.apply(null, arguments)
  )
}
var real__bitshift64Shl = asm._bitshift64Shl
asm._bitshift64Shl = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real__bitshift64Shl.apply(null, arguments)
  )
}
var real__fflush = asm._fflush
asm._fflush = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real__fflush.apply(null, arguments)
  )
}
var real__extract = asm._extract
asm._extract = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real__extract.apply(null, arguments)
  )
}
var real__sbrk = asm._sbrk
asm._sbrk = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real__sbrk.apply(null, arguments)
  )
}
var real____errno_location = asm.___errno_location
asm.___errno_location = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real____errno_location.apply(null, arguments)
  )
}
var real____uremdi3 = asm.___uremdi3
asm.___uremdi3 = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real____uremdi3.apply(null, arguments)
  )
}
var real_stackAlloc = asm.stackAlloc
asm.stackAlloc = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real_stackAlloc.apply(null, arguments)
  )
}
var real__i64Subtract = asm._i64Subtract
asm._i64Subtract = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real__i64Subtract.apply(null, arguments)
  )
}
var real_setTempRet0 = asm.setTempRet0
asm.setTempRet0 = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real_setTempRet0.apply(null, arguments)
  )
}
var real__i64Add = asm._i64Add
asm._i64Add = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real__i64Add.apply(null, arguments)
  )
}
var real__emscripten_get_global_libc = asm._emscripten_get_global_libc
asm._emscripten_get_global_libc = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real__emscripten_get_global_libc.apply(null, arguments)
  )
}
var real_stackSave = asm.stackSave
asm.stackSave = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real_stackSave.apply(null, arguments)
  )
}
var real__free = asm._free
asm._free = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real__free.apply(null, arguments)
  )
}
var real_establishStackSpace = asm.establishStackSpace
asm.establishStackSpace = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real_establishStackSpace.apply(null, arguments)
  )
}
var real_stackRestore = asm.stackRestore
asm.stackRestore = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real_stackRestore.apply(null, arguments)
  )
}
var real__malloc = asm._malloc
asm._malloc = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real__malloc.apply(null, arguments)
  )
}
var _llvm_bswap_i32 = (Module._llvm_bswap_i32 = asm._llvm_bswap_i32),
  getTempRet0 = (Module.getTempRet0 = asm.getTempRet0),
  ___udivdi3 = (Module.___udivdi3 = asm.___udivdi3),
  setThrew = (Module.setThrew = asm.setThrew),
  _bitshift64Lshr = (Module._bitshift64Lshr = asm._bitshift64Lshr),
  _bitshift64Shl = (Module._bitshift64Shl = asm._bitshift64Shl),
  _fflush = (Module._fflush = asm._fflush),
  _extract = (Module._extract = asm._extract),
  _memset = (Module._memset = asm._memset),
  _sbrk = (Module._sbrk = asm._sbrk),
  _memcpy = (Module._memcpy = asm._memcpy),
  ___errno_location = (Module.___errno_location = asm.___errno_location),
  ___uremdi3 = (Module.___uremdi3 = asm.___uremdi3),
  stackAlloc = (Module.stackAlloc = asm.stackAlloc),
  _i64Subtract = (Module._i64Subtract = asm._i64Subtract),
  setTempRet0 = (Module.setTempRet0 = asm.setTempRet0),
  _i64Add = (Module._i64Add = asm._i64Add),
  _emscripten_get_global_libc = (Module._emscripten_get_global_libc = asm._emscripten_get_global_libc),
  stackSave = (Module.stackSave = asm.stackSave),
  _free = (Module._free = asm._free),
  runPostSets = (Module.runPostSets = asm.runPostSets),
  establishStackSpace = (Module.establishStackSpace = asm.establishStackSpace),
  stackRestore = (Module.stackRestore = asm.stackRestore),
  _malloc = (Module._malloc = asm._malloc),
  _emscripten_replace_memory = (Module._emscripten_replace_memory = asm._emscripten_replace_memory),
  dynCall_ii = (Module.dynCall_ii = asm.dynCall_ii),
  dynCall_iiii = (Module.dynCall_iiii = asm.dynCall_iiii),
  initialStackTop
function ExitStatus(e) {
  ;(this.name = 'ExitStatus'), (this.message = 'Program terminated with exit(' + e + ')'), (this.status = e)
}
;(Runtime.stackAlloc = Module.stackAlloc),
  (Runtime.stackSave = Module.stackSave),
  (Runtime.stackRestore = Module.stackRestore),
  (Runtime.establishStackSpace = Module.establishStackSpace),
  (Runtime.setTempRet0 = Module.setTempRet0),
  (Runtime.getTempRet0 = Module.getTempRet0),
  (Module.asm = asm),
  (ExitStatus.prototype = new Error()),
  (ExitStatus.prototype.constructor = ExitStatus)
var preloadStartTime = null,
  calledMain = !1
function run(e) {
  function r() {
    Module.calledRun ||
      ((Module.calledRun = !0),
      ABORT ||
        (ensureInitRuntime(),
        preMain(),
        ENVIRONMENT_IS_WEB &&
          null !== preloadStartTime &&
          Module.printErr('pre-main prep time: ' + (Date.now() - preloadStartTime) + ' ms'),
        Module.onRuntimeInitialized && Module.onRuntimeInitialized(),
        Module._main && shouldRunNow && Module.callMain(e),
        postRun()))
  }
  ;(e = e || Module.arguments),
    null === preloadStartTime && (preloadStartTime = Date.now()),
    0 < runDependencies ||
      (writeStackCookie(),
      preRun(),
      0 < runDependencies ||
        Module.calledRun ||
        (Module.setStatus
          ? (Module.setStatus('Running...'),
            setTimeout(function () {
              setTimeout(function () {
                Module.setStatus('')
              }, 1),
                r()
            }, 1))
          : r(),
        checkStackCookie()))
}
function exit(e, r) {
  r && Module.noExitRuntime
    ? Module.printErr(
        'exit(' +
          e +
          ') implicitly called by end of main(), but noExitRuntime, so not exiting the runtime (you can use emscripten_force_exit, if you want to force a true shutdown)'
      )
    : (Module.noExitRuntime
        ? Module.printErr(
            'exit(' +
              e +
              ') called, but noExitRuntime, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)'
          )
        : ((ABORT = !0),
          (EXITSTATUS = e),
          (STACKTOP = initialStackTop),
          exitRuntime(),
          Module.onExit && Module.onExit(e)),
      ENVIRONMENT_IS_NODE && process.exit(e),
      Module.quit(e, new ExitStatus(e)))
}
;(dependenciesFulfilled = function e() {
  Module.calledRun || run(), Module.calledRun || (dependenciesFulfilled = e)
}),
  (Module.callMain = Module.callMain =
    function (e) {
      assert(0 == runDependencies, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)'),
        assert(0 == __ATPRERUN__.length, 'cannot call main when preRun functions remain to be called'),
        (e = e || []),
        ensureInitRuntime()
      var r = e.length + 1
      function t() {
        for (var e = 0; e < 3; e++) n.push(0)
      }
      var n = [allocate(intArrayFromString(Module.thisProgram), 'i8', ALLOC_NORMAL)]
      t()
      for (var o = 0; o < r - 1; o += 1) n.push(allocate(intArrayFromString(e[o]), 'i8', ALLOC_NORMAL)), t()
      n.push(0), (n = allocate(n, 'i32', ALLOC_NORMAL))
      try {
        exit(Module._main(r, n, 0), !0)
      } catch (e) {
        if (e instanceof ExitStatus) return
        if ('SimulateInfiniteLoop' == e) return void (Module.noExitRuntime = !0)
        var i = e
        e && 'object' == typeof e && e.stack && (i = [e, e.stack]),
          Module.printErr('exception thrown: ' + i),
          Module.quit(1, e)
      } finally {
        calledMain = !0
      }
    }),
  (Module.run = Module.run = run),
  (Module.exit = Module.exit = exit)
var abortDecorators = []
function abort(r) {
  Module.onAbort && Module.onAbort(r),
    (r = void 0 !== r ? (Module.print(r), Module.printErr(r), JSON.stringify(r)) : ''),
    (ABORT = !0),
    (EXITSTATUS = 1)
  var t = 'abort(' + r + ') at ' + stackTrace()
  throw (
    (abortDecorators &&
      abortDecorators.forEach(function (e) {
        t = e(t, r)
      }),
    t)
  )
}
if (((Module.abort = Module.abort = abort), Module.preInit))
  for ('function' == typeof Module.preInit && (Module.preInit = [Module.preInit]); 0 < Module.preInit.length; )
    Module.preInit.pop()()
var shouldRunNow = !0
Module.noInitialRun && (shouldRunNow = !1),
  run(),
  (unzip = Module.cwrap('extract', 'number', ['string'])),
  (onmessage = function (e) {
    Module.FS_createDataFile('/', '1.zip', e.data, !0, !1), unzip('1.zip'), FS.unlink('1.zip')
  })
