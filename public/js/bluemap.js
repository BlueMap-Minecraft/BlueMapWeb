(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('three')) :
	typeof define === 'function' && define.amd ? define(['exports', 'three'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.BlueMap = {}, global.THREE));
}(this, (function (exports, three) { 'use strict';

	function _defineProperties(target, props) {
	  for (var i = 0; i < props.length; i++) {
	    var descriptor = props[i];
	    descriptor.enumerable = descriptor.enumerable || false;
	    descriptor.configurable = true;
	    if ("value" in descriptor) descriptor.writable = true;
	    Object.defineProperty(target, descriptor.key, descriptor);
	  }
	}

	function _createClass(Constructor, protoProps, staticProps) {
	  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	  if (staticProps) _defineProperties(Constructor, staticProps);
	  return Constructor;
	}

	function _extends() {
	  _extends = Object.assign || function (target) {
	    for (var i = 1; i < arguments.length; i++) {
	      var source = arguments[i];

	      for (var key in source) {
	        if (Object.prototype.hasOwnProperty.call(source, key)) {
	          target[key] = source[key];
	        }
	      }
	    }

	    return target;
	  };

	  return _extends.apply(this, arguments);
	}

	function _inheritsLoose(subClass, superClass) {
	  subClass.prototype = Object.create(superClass.prototype);
	  subClass.prototype.constructor = subClass;
	  subClass.__proto__ = superClass;
	}

	function _assertThisInitialized(self) {
	  if (self === void 0) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return self;
	}

	function _unsupportedIterableToArray(o, minLen) {
	  if (!o) return;
	  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
	  var n = Object.prototype.toString.call(o).slice(8, -1);
	  if (n === "Object" && o.constructor) n = o.constructor.name;
	  if (n === "Map" || n === "Set") return Array.from(o);
	  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
	}

	function _arrayLikeToArray(arr, len) {
	  if (len == null || len > arr.length) len = arr.length;

	  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

	  return arr2;
	}

	function _createForOfIteratorHelperLoose(o, allowArrayLike) {
	  var it;

	  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
	    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
	      if (it) o = it;
	      var i = 0;
	      return function () {
	        if (i >= o.length) return {
	          done: true
	        };
	        return {
	          done: false,
	          value: o[i++]
	        };
	      };
	    }

	    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	  }

	  it = o[Symbol.iterator]();
	  return it.next.bind(it);
	}

	/**
	 * Takes a base46 string and converts it into an image element
	 * @param string
	 * @returns {HTMLElement}
	 */
	var stringToImage = function stringToImage(string) {
	  var image = document.createElementNS('http://www.w3.org/1999/xhtml', 'img');
	  image.src = string;
	  return image;
	};
	/**
	 * Creates an optimized path from x,z coordinates used by bluemap to save tiles
	 * @param x
	 * @param z
	 * @returns {string}
	 */

	var pathFromCoords = function pathFromCoords(x, z) {
	  var path = 'x';
	  path += splitNumberToPath(x);
	  path += 'z';
	  path += splitNumberToPath(z);
	  path = path.substring(0, path.length - 1);
	  return path;
	};
	/**
	 * Splits a number into an optimized folder-path used to save bluemap-tiles
	 * @param num
	 * @returns {string}
	 */

	var splitNumberToPath = function splitNumberToPath(num) {
	  var path = '';

	  if (num < 0) {
	    num = -num;
	    path += '-';
	  }

	  var s = parseInt(num).toString();

	  for (var i = 0; i < s.length; i++) {
	    path += s.charAt(i) + '/';
	  }

	  return path;
	};
	/**
	 * Hashes tile-coordinates to be saved in a map
	 * @param x
	 * @param z
	 * @returns {string}
	 */


	var hashTile = function hashTile(x, z) {
	  return "x" + x + "z" + z;
	};
	/**
	 * Dispatches an event to the element of this map-viewer
	 * @param element the element on that the event is dispatched
	 * @param event
	 * @param detail
	 * @returns {undefined|void|boolean}
	 */

	var dispatchEvent = function dispatchEvent(element, event, detail) {
	  if (detail === void 0) {
	    detail = {};
	  }

	  if (!element || !element.dispatchEvent) return;
	  return element.dispatchEvent(new CustomEvent(event, {
	    detail: detail
	  }));
	};
	/**
	 * Sends a "bluemapAlert" event with a message and a level.
	 * The level can be anything, but the app uses the levels
	 * - debug
	 * - fine
	 * - info
	 * - warning
	 * - error
	 * @param element the element on that the event is dispatched
	 * @param message
	 * @param level
	 */

	var alert = function alert(element, message, level) {
	  if (level === void 0) {
	    level = "info";
	  }

	  // alert event
	  var printToConsole = dispatchEvent(element, "bluemapAlert", {
	    message: message,
	    level: level
	  }); // log alert to console

	  if (printToConsole) {
	    if (level === "info") {
	      console.log("[BlueMap/" + level + "]", message);
	    } else if (level === "warning") {
	      console.warn("[BlueMap/" + level + "]", message);
	    } else if (level === "error") {
	      console.error("[BlueMap/" + level + "]", message);
	    } else {
	      console.debug("[BlueMap/" + level + "]", message);
	    }
	  }
	};
	/**
	 * Source: https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
	 *
	 * @param {String} html representing a single element
	 * @return {Element}
	 */

	var htmlToElement = function htmlToElement(html) {
	  var template = document.createElement('template');
	  template.innerHTML = html.trim();
	  return template.content.firstChild;
	};
	/**
	 * Source: https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
	 *
	 * @param {String} html representing any number of sibling elements
	 * @return {NodeList}
	 */

	var htmlToElements = function htmlToElements(html) {
	  var template = document.createElement('template');
	  template.innerHTML = html;
	  return template.content.childNodes;
	};
	/**
	 * Schedules an animation
	 * @param durationMs the duration of the animation in ms
	 * @param animationFrame a function that is getting called each frame with the parameters (progress (0-1), deltaTime)
	 * @param postAnimation a function that gets called once after the animation is finished or cancelled. The function accepts one bool-parameter whether the animation was finished (true) or canceled (false)
	 * @returns the animation object
	 */

	var animate = function animate(animationFrame, durationMs, postAnimation) {
	  if (durationMs === void 0) {
	    durationMs = 1000;
	  }

	  if (postAnimation === void 0) {
	    postAnimation = null;
	  }

	  var animation = {
	    animationStart: -1,
	    lastFrame: -1,
	    cancelled: false,
	    frame: function frame(time) {
	      var _this = this;

	      if (this.cancelled) return;

	      if (this.animationStart === -1) {
	        this.animationStart = time;
	        this.lastFrame = time;
	      }

	      var progress = three.MathUtils.clamp((time - this.animationStart) / durationMs, 0, 1);
	      var deltaTime = time - this.lastFrame;
	      animationFrame(progress, deltaTime);
	      if (progress < 1) window.requestAnimationFrame(function (time) {
	        return _this.frame(time);
	      });else if (postAnimation) postAnimation(true);
	      this.lastFrame = time;
	    },
	    cancel: function cancel() {
	      this.cancelled = true;
	      if (postAnimation) postAnimation(false);
	    }
	  };
	  window.requestAnimationFrame(function (time) {
	    return animation.frame(time);
	  });
	  return animation;
	};
	/**
	 * Returns the offset position of an element
	 *
	 * Source: https://plainjs.com/javascript/styles/get-the-position-of-an-element-relative-to-the-document-24/
	 *
	 * @param element
	 * @returns {{top: number, left: number}}
	 */

	var elementOffset = function elementOffset(element) {
	  var rect = element.getBoundingClientRect(),
	      scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
	      scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	  return {
	    top: rect.top + scrollTop,
	    left: rect.left + scrollLeft
	  };
	};

	/*
	 * This file is part of BlueMap, licensed under the MIT License (MIT).
	 *
	 * Copyright (c) Blue (Lukas Rieger) <https://bluecolored.de>
	 * Copyright (c) contributors
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the "Software"), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 */
	var Tile = /*#__PURE__*/function () {
	  function Tile(x, z, onLoad, onUnload) {
	    Object.defineProperty(this, 'isTile', {
	      value: true
	    });
	    this.model = null;
	    this.onLoad = onLoad;
	    this.onUnload = onUnload;
	    this.x = x;
	    this.z = z;
	    this.unloaded = true;
	    this.loading = false;
	  }

	  var _proto = Tile.prototype;

	  _proto.load = function load(tileLoader) {
	    var _this = this;

	    if (this.loading) return;
	    this.loading = true;
	    this.unload();
	    this.unloaded = false;
	    return tileLoader.load(this.x, this.z).then(function (model) {
	      if (_this.unloaded) {
	        model.geometry.dispose();
	        return;
	      }

	      _this.model = model;

	      _this.onLoad(_this);
	    }).finally(function () {
	      _this.loading = false;
	    });
	  };

	  _proto.unload = function unload() {
	    this.unloaded = true;

	    if (this.model) {
	      this.onUnload(this);
	      this.model.geometry.dispose();
	      this.model = null;
	    }
	  };

	  _createClass(Tile, [{
	    key: "loaded",
	    get: function get() {
	      return !!this.model;
	    }
	  }]);

	  return Tile;
	}();

	var TileMap = /*#__PURE__*/function () {
	  function TileMap(width, height) {
	    this.canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
	    this.canvas.width = width;
	    this.canvas.height = height;
	    this.tileMapContext = this.canvas.getContext('2d', {
	      alpha: false,
	      willReadFrequently: true
	    });
	    this.texture = new three.Texture(this.canvas);
	    this.texture.generateMipmaps = false;
	    this.texture.magFilter = three.LinearFilter;
	    this.texture.minFilter = three.LinearFilter;
	    this.texture.wrapS = three.ClampToEdgeWrapping;
	    this.texture.wrapT = three.ClampToEdgeWrapping;
	    this.texture.flipY = false;
	    this.texture.needsUpdate = true;
	  }

	  var _proto = TileMap.prototype;

	  _proto.setAll = function setAll(state) {
	    this.tileMapContext.fillStyle = state;
	    this.tileMapContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
	    this.texture.needsUpdate = true;
	  };

	  _proto.setTile = function setTile(x, z, state) {
	    this.tileMapContext.fillStyle = state;
	    this.tileMapContext.fillRect(x, z, 1, 1);
	    this.texture.needsUpdate = true;
	  };

	  return TileMap;
	}();
	TileMap.EMPTY = "#000";
	TileMap.LOADED = "#fff";

	/*
	 * This file is part of BlueMap, licensed under the MIT License (MIT).
	 *
	 * Copyright (c) Blue (Lukas Rieger) <https://bluecolored.de>
	 * Copyright (c) contributors
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the "Software"), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 */
	var TileManager = /*#__PURE__*/function () {
	  function TileManager(scene, tileLoader, onTileLoad, onTileUnload, events) {
	    var _this = this;

	    if (onTileLoad === void 0) {
	      onTileLoad = null;
	    }

	    if (onTileUnload === void 0) {
	      onTileUnload = null;
	    }

	    if (events === void 0) {
	      events = null;
	    }

	    this.loadCloseTiles = function () {
	      if (_this.unloaded) return;
	      if (!_this.loadNextTile()) return;
	      if (_this.loadTimeout) clearTimeout(_this.loadTimeout);

	      if (_this.currentlyLoading < 4) {
	        _this.loadTimeout = setTimeout(_this.loadCloseTiles, 0);
	      } else {
	        _this.loadTimeout = setTimeout(_this.loadCloseTiles, 1000);
	      }
	    };

	    this.handleLoadedTile = function (tile) {
	      //this.tileMap.setTile(tile.x - this.centerTile.x + TileManager.tileMapHalfSize, tile.z - this.centerTile.y + TileManager.tileMapHalfSize, TileMap.LOADED);
	      _this.scene.add(tile.model);

	      _this.onTileLoad(tile);
	    };

	    this.handleUnloadedTile = function (tile) {
	      _this.tileMap.setTile(tile.x - _this.centerTile.x + TileManager.tileMapHalfSize, tile.z - _this.centerTile.y + TileManager.tileMapHalfSize, TileMap.EMPTY);

	      _this.scene.remove(tile.model);

	      _this.onTileUnload(tile);
	    };

	    Object.defineProperty(this, 'isTileManager', {
	      value: true
	    });
	    this.events = events;
	    this.scene = scene;
	    this.tileLoader = tileLoader;

	    this.onTileLoad = onTileLoad || function () {};

	    this.onTileUnload = onTileUnload || function () {};

	    this.viewDistanceX = 1;
	    this.viewDistanceZ = 1;
	    this.centerTile = new three.Vector2(0, 0);
	    this.currentlyLoading = 0;
	    this.loadTimeout = null; //map of loaded tiles

	    this.tiles = {}; // a canvas that keeps track of the loaded tiles, used for shaders

	    this.tileMap = new TileMap(TileManager.tileMapSize, TileManager.tileMapSize);
	    this.unloaded = true;
	  }

	  var _proto = TileManager.prototype;

	  _proto.loadAroundTile = function loadAroundTile(x, z, viewDistanceX, viewDistanceZ) {
	    this.unloaded = false;
	    this.viewDistanceX = viewDistanceX;
	    this.viewDistanceZ = viewDistanceZ;

	    if (this.centerTile.x !== x || this.centerTile.y !== z) {
	      this.centerTile.set(x, z);
	      this.removeFarTiles();
	      this.tileMap.setAll(TileMap.EMPTY);
	      var keys = Object.keys(this.tiles);

	      for (var i = 0; i < keys.length; i++) {
	        if (!this.tiles.hasOwnProperty(keys[i])) continue;
	        var tile = this.tiles[keys[i]];

	        if (!tile.loading) {
	          this.tileMap.setTile(tile.x - this.centerTile.x + TileManager.tileMapHalfSize, tile.z - this.centerTile.y + TileManager.tileMapHalfSize, TileMap.LOADED);
	        }
	      }
	    }

	    this.loadCloseTiles();
	  };

	  _proto.unload = function unload() {
	    this.unloaded = true;
	    this.removeAllTiles();
	  };

	  _proto.removeFarTiles = function removeFarTiles() {
	    var keys = Object.keys(this.tiles);

	    for (var i = 0; i < keys.length; i++) {
	      if (!this.tiles.hasOwnProperty(keys[i])) continue;
	      var tile = this.tiles[keys[i]];

	      if (tile.x + this.viewDistanceX < this.centerTile.x || tile.x - this.viewDistanceX > this.centerTile.x || tile.z + this.viewDistanceZ < this.centerTile.y || tile.z - this.viewDistanceZ > this.centerTile.y) {
	        tile.unload();
	        delete this.tiles[keys[i]];
	      }
	    }
	  };

	  _proto.removeAllTiles = function removeAllTiles() {
	    this.tileMap.setAll(TileMap.EMPTY);
	    var keys = Object.keys(this.tiles);

	    for (var i = 0; i < keys.length; i++) {
	      if (!this.tiles.hasOwnProperty(keys[i])) continue;
	      var tile = this.tiles[keys[i]];
	      tile.unload();
	      delete this.tiles[keys[i]];
	    }
	  };

	  _proto.loadNextTile = function loadNextTile() {
	    if (this.unloaded) return;
	    var x = 0;
	    var z = 0;
	    var d = 1;
	    var m = 1;

	    while (m < Math.max(this.viewDistanceX, this.viewDistanceZ) * 2 + 1) {
	      while (2 * x * d < m) {
	        if (this.tryLoadTile(this.centerTile.x + x, this.centerTile.y + z)) return true;
	        x = x + d;
	      }

	      while (2 * z * d < m) {
	        if (this.tryLoadTile(this.centerTile.x + x, this.centerTile.y + z)) return true;
	        z = z + d;
	      }

	      d = -1 * d;
	      m = m + 1;
	    }

	    return false;
	  };

	  _proto.tryLoadTile = function tryLoadTile(x, z) {
	    var _this2 = this;

	    if (this.unloaded) return;
	    if (Math.abs(x - this.centerTile.x) > this.viewDistanceX) return false;
	    if (Math.abs(z - this.centerTile.y) > this.viewDistanceZ) return false;
	    var tileHash = hashTile(x, z);
	    var tile = this.tiles[tileHash];
	    if (tile !== undefined) return false;
	    this.currentlyLoading++;
	    tile = new Tile(x, z, this.handleLoadedTile, this.handleUnloadedTile);
	    this.tiles[tileHash] = tile;
	    tile.load(this.tileLoader).then(function () {
	      _this2.tileMap.setTile(tile.x - _this2.centerTile.x + TileManager.tileMapHalfSize, tile.z - _this2.centerTile.y + TileManager.tileMapHalfSize, TileMap.LOADED);

	      if (_this2.loadTimeout) clearTimeout(_this2.loadTimeout);
	      _this2.loadTimeout = setTimeout(_this2.loadCloseTiles, 0);
	    }).catch(function (error) {
	      if (error.status && error.status === "empty") return;
	      if (error.target && error.target.status === 404) return;
	      alert(_this2.events, "Failed to load tile: " + error, "warning");
	    }).finally(function () {
	      _this2.tileMap.setTile(tile.x - _this2.centerTile.x + TileManager.tileMapHalfSize, tile.z - _this2.centerTile.y + TileManager.tileMapHalfSize, TileMap.LOADED);

	      _this2.currentlyLoading--;
	    });
	    return true;
	  };

	  return TileManager;
	}();
	TileManager.tileMapSize = 100;
	TileManager.tileMapHalfSize = TileManager.tileMapSize / 2;

	var TileLoader = function TileLoader(tilePath, material, tileSettings, layer) {
	  var _this = this;

	  if (layer === void 0) {
	    layer = 0;
	  }

	  this.load = function (tileX, tileZ) {
	    return new Promise(function (resolve, reject) {
	      _this.fileLoader.load(_this.tilePath + pathFromCoords(tileX, tileZ) + '.json', function (geometryJson) {
	        if (!geometryJson.type || geometryJson.type !== 'BufferGeometry') reject({
	          status: "empty"
	        });

	        var geometry = _this.bufferGeometryLoader.parse(geometryJson);

	        var object = new three.Mesh(geometry, _this.material);
	        if (_this.layer) object.layers.set(_this.layer);
	        var tileSize = _this.tileSettings.tileSize;
	        var translate = _this.tileSettings.translate;
	        var scale = _this.tileSettings.scale;
	        object.position.set(tileX * tileSize.x + translate.x, 0, tileZ * tileSize.z + translate.z);
	        object.scale.set(scale.x, 1, scale.z);
	        object.updateMatrixWorld(true);
	        resolve(object);
	      }, function () {}, reject);
	    });
	  };

	  Object.defineProperty(this, 'isTileLoader', {
	    value: true
	  });
	  this.tilePath = tilePath;
	  this.material = material;
	  this.tileSettings = tileSettings;
	  this.layer = layer;
	  this.fileLoader = new three.FileLoader();
	  this.fileLoader.setResponseType('json');
	  this.bufferGeometryLoader = new three.BufferGeometryLoader();
	};

	var Marker = /*#__PURE__*/function () {
	  function Marker(markerSet, id) {
	    Object.defineProperty(this, 'isMarker', {
	      value: true
	    });
	    this.manager = markerSet.manager;
	    this.markerSet = markerSet;
	    this.id = id;
	    this._position = new three.Vector3();
	    this._label = null;
	    this.link = null;
	    this.newTab = true;
	    this.minDistance = 0.0;
	    this.maxDistance = 100000.0;
	    this.opacity = 1;
	    this._source = Marker.Source.CUSTOM;
	    this._onDisposal = [];
	    this._distance = 0;
	    this._opacity = 1;
	    this._posRelativeToCamera = new three.Vector3();
	    this._cameraDirection = new three.Vector3();
	  }

	  var _proto = Marker.prototype;

	  _proto.update = function update(markerData) {
	    this._source = Marker.Source.MARKER_FILE;

	    if (markerData.position) {
	      this.setPosition(parseFloat(markerData.position.x), parseFloat(markerData.position.y), parseFloat(markerData.position.z));
	    } else {
	      this.setPosition(0, 0, 0);
	    }

	    this.label = markerData.label ? markerData.label : null;
	    this.link = markerData.link ? markerData.link : null;
	    this.newTab = !!markerData.newTab;
	    this.minDistance = parseFloat(markerData.minDistance ? markerData.minDistance : 0.0);
	    this.maxDistance = parseFloat(markerData.maxDistance ? markerData.maxDistance : 100000.0);
	  };

	  _proto.setPosition = function setPosition(x, y, z) {
	    this.position.set(x, y, z);
	  };

	  _proto.onClick = function onClick(clickPosition) {
	    if (!dispatchEvent(this.manager.events, 'bluemapMarkerClick', {
	      marker: this
	    })) return;
	    this.followLink();

	    if (this.label) {
	      this.manager.showPopup("<div class=\"bm-marker-label\">" + this.label + "</div>", clickPosition.x, clickPosition.y, clickPosition.z, true);
	    }
	  };

	  _proto.followLink = function followLink() {
	    if (this.link) {
	      if (this.newTab) {
	        window.open(this.link, '_blank');
	      } else {
	        location.href = this.link;
	      }
	    }
	  };

	  _proto._onBeforeRender = function _onBeforeRender(renderer, scene, camera) {
	    //calculate "orthographic distance" to marker
	    this._posRelativeToCamera.subVectors(this.position, camera.position);

	    camera.getWorldDirection(this._cameraDirection);
	    this._distance = this._posRelativeToCamera.dot(this._cameraDirection); //calculate opacity based on (min/max)distance

	    this._opacity = Math.min(1 - three.MathUtils.clamp((this._distance - this.maxDistance) / (this.maxDistance * 2), 0, 1), three.MathUtils.clamp((this._distance - this.minDistance) / (this.minDistance * 2 + 1), 0, 1)) * this.opacity;
	  };

	  _proto.blendIn = function blendIn(durationMs, postAnimation) {
	    var _this = this;

	    if (durationMs === void 0) {
	      durationMs = 500;
	    }

	    if (postAnimation === void 0) {
	      postAnimation = null;
	    }

	    this.opacity = 0;
	    animate(function (progress) {
	      _this.opacity = progress;
	    }, durationMs, postAnimation);
	  };

	  _proto.blendOut = function blendOut(durationMs, postAnimation) {
	    var _this2 = this;

	    if (durationMs === void 0) {
	      durationMs = 500;
	    }

	    if (postAnimation === void 0) {
	      postAnimation = null;
	    }

	    var startOpacity = this.opacity;
	    animate(function (progress) {
	      _this2.opacity = startOpacity * (1 - progress);
	    }, durationMs, postAnimation);
	  };

	  _proto.dispose = function dispose() {
	    var _this3 = this;

	    this._onDisposal.forEach(function (callback) {
	      return callback(_this3);
	    });

	    delete this.markerSet._marker[this.id];
	  };

	  Marker.normalizeColor = function normalizeColor(color) {
	    if (!color) color = {};
	    color.r = Marker.normaliseNumber(color.r, 255, true);
	    color.g = Marker.normaliseNumber(color.g, 0, true);
	    color.b = Marker.normaliseNumber(color.b, 0, true);
	    color.a = Marker.normaliseNumber(color.a, 1, false);
	    color.rgb = (color.r << 16) + (color.g << 8) + color.b;
	    color.vec4 = new three.Vector4(color.r / 255, color.g / 255, color.b / 255, color.a);
	    return color;
	  };

	  Marker.normaliseNumber = function normaliseNumber(nr, def, integer) {
	    if (integer === void 0) {
	      integer = false;
	    }

	    if (isNaN(nr)) {
	      if (integer) nr = parseInt(nr);else nr = parseFloat(nr);
	      if (isNaN(nr)) return def;
	      return nr;
	    }

	    if (integer) return Math.floor(nr);
	    return nr;
	  };

	  _createClass(Marker, [{
	    key: "position",
	    get: function get() {
	      return this._position;
	    }
	  }, {
	    key: "label",
	    set: function set(label) {
	      this._label = label;
	    },
	    get: function get() {
	      return this._label;
	    }
	  }, {
	    key: "onDisposal",
	    set: function set(callback) {
	      this._onDisposal.push(callback);
	    }
	  }]);

	  return Marker;
	}();
	Marker.Source = {
	  CUSTOM: 0,
	  MARKER_FILE: 1
	};

	/**
	 * parameters = {
	 *  color: <hex>,
	 *  linewidth: <float>,
	 *  dashed: <boolean>,
	 *  dashScale: <float>,
	 *  dashSize: <float>,
	 *  gapSize: <float>,
	 *  resolution: <Vector2>, // to be set by renderer
	 * }
	 */

	three.UniformsLib.line = {
	  linewidth: {
	    value: 1
	  },
	  resolution: {
	    value: new three.Vector2(1, 1)
	  },
	  dashScale: {
	    value: 1
	  },
	  dashSize: {
	    value: 1
	  },
	  gapSize: {
	    value: 1
	  },
	  // todo FIX - maybe change to totalSize
	  opacity: {
	    value: 1
	  }
	};
	three.ShaderLib['line'] = {
	  uniforms: three.UniformsUtils.merge([three.UniformsLib.common, three.UniformsLib.fog, three.UniformsLib.line]),
	  vertexShader: "\n\t\t#include <common>\n\t\t#include <color_pars_vertex>\n\t\t#include <fog_pars_vertex>\n\t\t#include <logdepthbuf_pars_vertex>\n\t\t#include <clipping_planes_pars_vertex>\n\n\t\tuniform float linewidth;\n\t\tuniform vec2 resolution;\n\n\t\tattribute vec3 instanceStart;\n\t\tattribute vec3 instanceEnd;\n\n\t\tattribute vec3 instanceColorStart;\n\t\tattribute vec3 instanceColorEnd;\n\n\t\tvarying vec2 vUv;\n\n\t\t#ifdef USE_DASH\n\n\t\t\tuniform float dashScale;\n\t\t\tattribute float instanceDistanceStart;\n\t\t\tattribute float instanceDistanceEnd;\n\t\t\tvarying float vLineDistance;\n\n\t\t#endif\n\n\t\tvoid trimSegment( const in vec4 start, inout vec4 end ) {\n\n\t\t\t// trim end segment so it terminates between the camera plane and the near plane\n\n\t\t\t// conservative estimate of the near plane\n\t\t\tfloat a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column\n\t\t\tfloat b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column\n\t\t\tfloat nearEstimate = - 0.5 * b / a;\n\n\t\t\tfloat alpha = ( nearEstimate - start.z ) / ( end.z - start.z );\n\n\t\t\tend.xyz = mix( start.xyz, end.xyz, alpha );\n\n\t\t}\n\n\t\tvoid main() {\n\n\t\t\t#ifdef USE_COLOR\n\n\t\t\t\tvColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;\n\n\t\t\t#endif\n\n\t\t\t#ifdef USE_DASH\n\n\t\t\t\tvLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;\n\n\t\t\t#endif\n\n\t\t\tfloat aspect = resolution.x / resolution.y;\n\n\t\t\tvUv = uv;\n\n\t\t\t// camera space\n\t\t\tvec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );\n\t\t\tvec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );\n\n\t\t\t// special case for perspective projection, and segments that terminate either in, or behind, the camera plane\n\t\t\t// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space\n\t\t\t// but we need to perform ndc-space calculations in the shader, so we must address this issue directly\n\t\t\t// perhaps there is a more elegant solution -- WestLangley\n\n\t\t\tbool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column\n\n\t\t\tif ( perspective ) {\n\n\t\t\t\tif ( start.z < 0.0 && end.z >= 0.0 ) {\n\n\t\t\t\t\ttrimSegment( start, end );\n\n\t\t\t\t} else if ( end.z < 0.0 && start.z >= 0.0 ) {\n\n\t\t\t\t\ttrimSegment( end, start );\n\n\t\t\t\t}\n\n\t\t\t}\n\n\t\t\t// clip space\n\t\t\tvec4 clipStart = projectionMatrix * start;\n\t\t\tvec4 clipEnd = projectionMatrix * end;\n\n\t\t\t// ndc space\n\t\t\tvec2 ndcStart = clipStart.xy / clipStart.w;\n\t\t\tvec2 ndcEnd = clipEnd.xy / clipEnd.w;\n\n\t\t\t// direction\n\t\t\tvec2 dir = ndcEnd - ndcStart;\n\n\t\t\t// account for clip-space aspect ratio\n\t\t\tdir.x *= aspect;\n\t\t\tdir = normalize( dir );\n\n\t\t\t// perpendicular to dir\n\t\t\tvec2 offset = vec2( dir.y, - dir.x );\n\n\t\t\t// undo aspect ratio adjustment\n\t\t\tdir.x /= aspect;\n\t\t\toffset.x /= aspect;\n\n\t\t\t// sign flip\n\t\t\tif ( position.x < 0.0 ) offset *= - 1.0;\n\n\t\t\t// endcaps\n\t\t\tif ( position.y < 0.0 ) {\n\n\t\t\t\toffset += - dir;\n\n\t\t\t} else if ( position.y > 1.0 ) {\n\n\t\t\t\toffset += dir;\n\n\t\t\t}\n\n\t\t\t// adjust for linewidth\n\t\t\toffset *= linewidth;\n\n\t\t\t// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...\n\t\t\toffset /= resolution.y;\n\n\t\t\t// select end\n\t\t\tvec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;\n\n\t\t\t// back to clip space\n\t\t\toffset *= clip.w;\n\n\t\t\tclip.xy += offset;\n\n\t\t\tgl_Position = clip;\n\n\t\t\tvec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation\n\n\t\t\t#include <logdepthbuf_vertex>\n\t\t\t#include <clipping_planes_vertex>\n\t\t\t#include <fog_vertex>\n\n\t\t}\n\t\t",
	  fragmentShader: "\n\t\tuniform vec3 diffuse;\n\t\tuniform float opacity;\n\n\t\t#ifdef USE_DASH\n\n\t\t\tuniform float dashSize;\n\t\t\tuniform float gapSize;\n\n\t\t#endif\n\n\t\tvarying float vLineDistance;\n\n\t\t#include <common>\n\t\t#include <color_pars_fragment>\n\t\t#include <fog_pars_fragment>\n\t\t#include <logdepthbuf_pars_fragment>\n\t\t#include <clipping_planes_pars_fragment>\n\n\t\tvarying vec2 vUv;\n\n\t\tvoid main() {\n\n\t\t\t#include <clipping_planes_fragment>\n\n\t\t\t#ifdef USE_DASH\n\n\t\t\t\tif ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps\n\n\t\t\t\tif ( mod( vLineDistance, dashSize + gapSize ) > dashSize ) discard; // todo - FIX\n\n\t\t\t#endif\n\n\t\t\tif ( abs( vUv.y ) > 1.0 ) {\n\n\t\t\t\tfloat a = vUv.x;\n\t\t\t\tfloat b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;\n\t\t\t\tfloat len2 = a * a + b * b;\n\n\t\t\t\tif ( len2 > 1.0 ) discard;\n\n\t\t\t}\n\n\t\t\tvec4 diffuseColor = vec4( diffuse, opacity );\n\n\t\t\t#include <logdepthbuf_fragment>\n\t\t\t#include <color_fragment>\n\n\t\t\tgl_FragColor = vec4( diffuseColor.rgb, diffuseColor.a );\n\n\t\t\t#include <tonemapping_fragment>\n\t\t\t#include <encodings_fragment>\n\t\t\t#include <fog_fragment>\n\t\t\t#include <premultiplied_alpha_fragment>\n\n\t\t}\n\t\t"
	};

	var LineMaterial = function LineMaterial(parameters) {
	  three.ShaderMaterial.call(this, {
	    type: 'LineMaterial',
	    uniforms: three.UniformsUtils.clone(three.ShaderLib['line'].uniforms),
	    vertexShader: three.ShaderLib['line'].vertexShader,
	    fragmentShader: three.ShaderLib['line'].fragmentShader,
	    clipping: true // required for clipping support

	  });
	  this.dashed = false;
	  Object.defineProperties(this, {
	    color: {
	      enumerable: true,
	      get: function get() {
	        return this.uniforms.diffuse.value;
	      },
	      set: function set(value) {
	        this.uniforms.diffuse.value = value;
	      }
	    },
	    linewidth: {
	      enumerable: true,
	      get: function get() {
	        return this.uniforms.linewidth.value;
	      },
	      set: function set(value) {
	        this.uniforms.linewidth.value = value;
	      }
	    },
	    dashScale: {
	      enumerable: true,
	      get: function get() {
	        return this.uniforms.dashScale.value;
	      },
	      set: function set(value) {
	        this.uniforms.dashScale.value = value;
	      }
	    },
	    dashSize: {
	      enumerable: true,
	      get: function get() {
	        return this.uniforms.dashSize.value;
	      },
	      set: function set(value) {
	        this.uniforms.dashSize.value = value;
	      }
	    },
	    gapSize: {
	      enumerable: true,
	      get: function get() {
	        return this.uniforms.gapSize.value;
	      },
	      set: function set(value) {
	        this.uniforms.gapSize.value = value;
	      }
	    },
	    opacity: {
	      enumerable: true,
	      get: function get() {
	        return this.uniforms.opacity.value;
	      },
	      set: function set(value) {
	        this.uniforms.opacity.value = value;
	      }
	    },
	    resolution: {
	      enumerable: true,
	      get: function get() {
	        return this.uniforms.resolution.value;
	      },
	      set: function set(value) {
	        this.uniforms.resolution.value.copy(value);
	      }
	    }
	  });
	  this.setValues(parameters);
	};

	LineMaterial.prototype = Object.create(three.ShaderMaterial.prototype);
	LineMaterial.prototype.constructor = LineMaterial;
	LineMaterial.prototype.isLineMaterial = true;

	var LineSegmentsGeometry = function LineSegmentsGeometry() {
	  three.InstancedBufferGeometry.call(this);
	  this.type = 'LineSegmentsGeometry';
	  var positions = [-1, 2, 0, 1, 2, 0, -1, 1, 0, 1, 1, 0, -1, 0, 0, 1, 0, 0, -1, -1, 0, 1, -1, 0];
	  var uvs = [-1, 2, 1, 2, -1, 1, 1, 1, -1, -1, 1, -1, -1, -2, 1, -2];
	  var index = [0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5];
	  this.setIndex(index);
	  this.setAttribute('position', new three.Float32BufferAttribute(positions, 3));
	  this.setAttribute('uv', new three.Float32BufferAttribute(uvs, 2));
	};

	LineSegmentsGeometry.prototype = Object.assign(Object.create(three.InstancedBufferGeometry.prototype), {
	  constructor: LineSegmentsGeometry,
	  isLineSegmentsGeometry: true,
	  applyMatrix4: function applyMatrix4(matrix) {
	    var start = this.attributes.instanceStart;
	    var end = this.attributes.instanceEnd;

	    if (start !== undefined) {
	      start.applyMatrix4(matrix);
	      end.applyMatrix4(matrix);
	      start.needsUpdate = true;
	    }

	    if (this.boundingBox !== null) {
	      this.computeBoundingBox();
	    }

	    if (this.boundingSphere !== null) {
	      this.computeBoundingSphere();
	    }

	    return this;
	  },
	  setPositions: function setPositions(array) {
	    var lineSegments;

	    if (array instanceof Float32Array) {
	      lineSegments = array;
	    } else if (Array.isArray(array)) {
	      lineSegments = new Float32Array(array);
	    }

	    var instanceBuffer = new three.InstancedInterleavedBuffer(lineSegments, 6, 1); // xyz, xyz

	    this.setAttribute('instanceStart', new three.InterleavedBufferAttribute(instanceBuffer, 3, 0)); // xyz

	    this.setAttribute('instanceEnd', new three.InterleavedBufferAttribute(instanceBuffer, 3, 3)); // xyz
	    //

	    this.computeBoundingBox();
	    this.computeBoundingSphere();
	    return this;
	  },
	  setColors: function setColors(array) {
	    var colors;

	    if (array instanceof Float32Array) {
	      colors = array;
	    } else if (Array.isArray(array)) {
	      colors = new Float32Array(array);
	    }

	    var instanceColorBuffer = new three.InstancedInterleavedBuffer(colors, 6, 1); // rgb, rgb

	    this.setAttribute('instanceColorStart', new three.InterleavedBufferAttribute(instanceColorBuffer, 3, 0)); // rgb

	    this.setAttribute('instanceColorEnd', new three.InterleavedBufferAttribute(instanceColorBuffer, 3, 3)); // rgb

	    return this;
	  },
	  fromWireframeGeometry: function fromWireframeGeometry(geometry) {
	    this.setPositions(geometry.attributes.position.array);
	    return this;
	  },
	  fromEdgesGeometry: function fromEdgesGeometry(geometry) {
	    this.setPositions(geometry.attributes.position.array);
	    return this;
	  },
	  fromMesh: function fromMesh(mesh) {
	    this.fromWireframeGeometry(new three.WireframeGeometry(mesh.geometry)); // set colors, maybe

	    return this;
	  },
	  fromLineSegments: function fromLineSegments(lineSegments) {
	    var geometry = lineSegments.geometry;

	    if (geometry.isGeometry) {
	      this.setPositions(geometry.vertices);
	    } else if (geometry.isBufferGeometry) {
	      this.setPositions(geometry.attributes.position.array); // assumes non-indexed
	    } // set colors, maybe


	    return this;
	  },
	  computeBoundingBox: function () {
	    var box = new three.Box3();
	    return function computeBoundingBox() {
	      if (this.boundingBox === null) {
	        this.boundingBox = new three.Box3();
	      }

	      var start = this.attributes.instanceStart;
	      var end = this.attributes.instanceEnd;

	      if (start !== undefined && end !== undefined) {
	        this.boundingBox.setFromBufferAttribute(start);
	        box.setFromBufferAttribute(end);
	        this.boundingBox.union(box);
	      }
	    };
	  }(),
	  computeBoundingSphere: function () {
	    var vector = new three.Vector3();
	    return function computeBoundingSphere() {
	      if (this.boundingSphere === null) {
	        this.boundingSphere = new three.Sphere();
	      }

	      if (this.boundingBox === null) {
	        this.computeBoundingBox();
	      }

	      var start = this.attributes.instanceStart;
	      var end = this.attributes.instanceEnd;

	      if (start !== undefined && end !== undefined) {
	        var center = this.boundingSphere.center;
	        this.boundingBox.getCenter(center);
	        var maxRadiusSq = 0;

	        for (var i = 0, il = start.count; i < il; i++) {
	          vector.fromBufferAttribute(start, i);
	          maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(vector));
	          vector.fromBufferAttribute(end, i);
	          maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(vector));
	        }

	        this.boundingSphere.radius = Math.sqrt(maxRadiusSq);

	        if (isNaN(this.boundingSphere.radius)) {
	          console.error('THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.', this);
	        }
	      }
	    };
	  }(),
	  toJSON: function toJSON() {// todo
	  },
	  applyMatrix: function applyMatrix(matrix) {
	    console.warn('THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4().');
	    return this.applyMatrix4(matrix);
	  }
	});

	var LineGeometry = function LineGeometry() {
	  LineSegmentsGeometry.call(this);
	  this.type = 'LineGeometry';
	};

	LineGeometry.prototype = Object.assign(Object.create(LineSegmentsGeometry.prototype), {
	  constructor: LineGeometry,
	  isLineGeometry: true,
	  setPositions: function setPositions(array) {
	    // converts [ x1, y1, z1,  x2, y2, z2, ... ] to pairs format
	    var length = array.length - 3;
	    var points = new Float32Array(2 * length);

	    for (var i = 0; i < length; i += 3) {
	      points[2 * i] = array[i];
	      points[2 * i + 1] = array[i + 1];
	      points[2 * i + 2] = array[i + 2];
	      points[2 * i + 3] = array[i + 3];
	      points[2 * i + 4] = array[i + 4];
	      points[2 * i + 5] = array[i + 5];
	    }

	    LineSegmentsGeometry.prototype.setPositions.call(this, points);
	    return this;
	  },
	  setColors: function setColors(array) {
	    // converts [ r1, g1, b1,  r2, g2, b2, ... ] to pairs format
	    var length = array.length - 3;
	    var colors = new Float32Array(2 * length);

	    for (var i = 0; i < length; i += 3) {
	      colors[2 * i] = array[i];
	      colors[2 * i + 1] = array[i + 1];
	      colors[2 * i + 2] = array[i + 2];
	      colors[2 * i + 3] = array[i + 3];
	      colors[2 * i + 4] = array[i + 4];
	      colors[2 * i + 5] = array[i + 5];
	    }

	    LineSegmentsGeometry.prototype.setColors.call(this, colors);
	    return this;
	  },
	  fromLine: function fromLine(line) {
	    var geometry = line.geometry;

	    if (geometry.isGeometry) {
	      this.setPositions(geometry.vertices);
	    } else if (geometry.isBufferGeometry) {
	      this.setPositions(geometry.attributes.position.array); // assumes non-indexed
	    } // set colors, maybe


	    return this;
	  },
	  copy: function copy()
	  /* source */
	  {
	    // todo
	    return this;
	  }
	});

	var LineSegments2 = function LineSegments2(geometry, material) {
	  if (geometry === undefined) geometry = new LineSegmentsGeometry();
	  if (material === undefined) material = new LineMaterial({
	    color: Math.random() * 0xffffff
	  });
	  three.Mesh.call(this, geometry, material);
	  this.type = 'LineSegments2';
	};

	LineSegments2.prototype = Object.assign(Object.create(three.Mesh.prototype), {
	  constructor: LineSegments2,
	  isLineSegments2: true,
	  computeLineDistances: function () {
	    // for backwards-compatability, but could be a method of LineSegmentsGeometry...
	    var start = new three.Vector3();
	    var end = new three.Vector3();
	    return function computeLineDistances() {
	      var geometry = this.geometry;
	      var instanceStart = geometry.attributes.instanceStart;
	      var instanceEnd = geometry.attributes.instanceEnd;
	      var lineDistances = new Float32Array(2 * instanceStart.data.count);

	      for (var i = 0, j = 0, l = instanceStart.data.count; i < l; i++, j += 2) {
	        start.fromBufferAttribute(instanceStart, i);
	        end.fromBufferAttribute(instanceEnd, i);
	        lineDistances[j] = j === 0 ? 0 : lineDistances[j - 1];
	        lineDistances[j + 1] = lineDistances[j] + start.distanceTo(end);
	      }

	      var instanceDistanceBuffer = new three.InstancedInterleavedBuffer(lineDistances, 2, 1); // d0, d1

	      geometry.setAttribute('instanceDistanceStart', new three.InterleavedBufferAttribute(instanceDistanceBuffer, 1, 0)); // d0

	      geometry.setAttribute('instanceDistanceEnd', new three.InterleavedBufferAttribute(instanceDistanceBuffer, 1, 1)); // d1

	      return this;
	    };
	  }(),
	  raycast: function () {
	    var start = new three.Vector4();
	    var end = new three.Vector4();
	    var ssOrigin = new three.Vector4();
	    var ssOrigin3 = new three.Vector3();
	    var mvMatrix = new three.Matrix4();
	    var line = new three.Line3();
	    var closestPoint = new three.Vector3();
	    return function raycast(raycaster, intersects) {
	      if (raycaster.camera === null) {
	        console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2.');
	      }

	      var threshold = raycaster.params.Line2 !== undefined ? raycaster.params.Line2.threshold || 0 : 0;
	      var ray = raycaster.ray;
	      var camera = raycaster.camera;
	      var projectionMatrix = camera.projectionMatrix;
	      var geometry = this.geometry;
	      var material = this.material;
	      var resolution = material.resolution;
	      var lineWidth = material.linewidth + threshold;
	      var instanceStart = geometry.attributes.instanceStart;
	      var instanceEnd = geometry.attributes.instanceEnd; // pick a point 1 unit out along the ray to avoid the ray origin
	      // sitting at the camera origin which will cause "w" to be 0 when
	      // applying the projection matrix.

	      ray.at(1, ssOrigin); // ndc space [ - 1.0, 1.0 ]

	      ssOrigin.w = 1;
	      ssOrigin.applyMatrix4(camera.matrixWorldInverse);
	      ssOrigin.applyMatrix4(projectionMatrix);
	      ssOrigin.multiplyScalar(1 / ssOrigin.w); // screen space

	      ssOrigin.x *= resolution.x / 2;
	      ssOrigin.y *= resolution.y / 2;
	      ssOrigin.z = 0;
	      ssOrigin3.copy(ssOrigin);
	      var matrixWorld = this.matrixWorld;
	      mvMatrix.multiplyMatrices(camera.matrixWorldInverse, matrixWorld);

	      for (var i = 0, l = instanceStart.count; i < l; i++) {
	        start.fromBufferAttribute(instanceStart, i);
	        end.fromBufferAttribute(instanceEnd, i);
	        start.w = 1;
	        end.w = 1; // camera space

	        start.applyMatrix4(mvMatrix);
	        end.applyMatrix4(mvMatrix); // clip space

	        start.applyMatrix4(projectionMatrix);
	        end.applyMatrix4(projectionMatrix); // ndc space [ - 1.0, 1.0 ]

	        start.multiplyScalar(1 / start.w);
	        end.multiplyScalar(1 / end.w); // skip the segment if it's outside the camera near and far planes

	        var isBehindCameraNear = start.z < -1 && end.z < -1;
	        var isPastCameraFar = start.z > 1 && end.z > 1;

	        if (isBehindCameraNear || isPastCameraFar) {
	          continue;
	        } // screen space


	        start.x *= resolution.x / 2;
	        start.y *= resolution.y / 2;
	        end.x *= resolution.x / 2;
	        end.y *= resolution.y / 2; // create 2d segment

	        line.start.copy(start);
	        line.start.z = 0;
	        line.end.copy(end);
	        line.end.z = 0; // get closest point on ray to segment

	        var param = line.closestPointToPointParameter(ssOrigin3, true);
	        line.at(param, closestPoint); // check if the intersection point is within clip space

	        var zPos = three.MathUtils.lerp(start.z, end.z, param);
	        var isInClipSpace = zPos >= -1 && zPos <= 1;
	        var isInside = ssOrigin3.distanceTo(closestPoint) < lineWidth * 0.5;

	        if (isInClipSpace && isInside) {
	          line.start.fromBufferAttribute(instanceStart, i);
	          line.end.fromBufferAttribute(instanceEnd, i);
	          line.start.applyMatrix4(matrixWorld);
	          line.end.applyMatrix4(matrixWorld);
	          var pointOnLine = new three.Vector3();
	          var point = new three.Vector3();
	          ray.distanceSqToSegment(line.start, line.end, point, pointOnLine);
	          intersects.push({
	            point: point,
	            pointOnLine: pointOnLine,
	            distance: ray.origin.distanceTo(point),
	            object: this,
	            face: null,
	            faceIndex: i,
	            uv: null,
	            uv2: null
	          });
	        }
	      }
	    };
	  }()
	});

	var Line2 = function Line2(geometry, material) {
	  if (geometry === undefined) geometry = new LineGeometry();
	  if (material === undefined) material = new LineMaterial({
	    color: Math.random() * 0xffffff
	  });
	  LineSegments2.call(this, geometry, material);
	  this.type = 'Line2';
	};

	Line2.prototype = Object.assign(Object.create(LineSegments2.prototype), {
	  constructor: Line2,
	  isLine2: true
	});

	/*
	 * This file is part of BlueMap, licensed under the MIT License (MIT).
	 *
	 * Copyright (c) Blue (Lukas Rieger) <https://bluecolored.de>
	 * Copyright (c) contributors
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the 'Software'), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 */
	var MARKER_FILL_FRAGMENT_SHADER = "\n" + three.ShaderChunk.logdepthbuf_pars_fragment + "\n\nvarying vec3 vPosition;\nvarying vec3 vWorldPosition;\nvarying vec3 vNormal;\nvarying vec2 vUv;\nvarying vec3 vColor;\n\nuniform vec4 markerColor;\n\nvoid main() {\n\tvec4 color = markerColor;\n\t\n\t//apply vertex-color\n\tcolor.rgb *= vColor.rgb;\n\t\n\tgl_FragColor = color;\n\t\n\t" + three.ShaderChunk.logdepthbuf_fragment + "\n}\n";

	/*
	 * This file is part of BlueMap, licensed under the MIT License (MIT).
	 *
	 * Copyright (c) Blue (Lukas Rieger) <https://bluecolored.de>
	 * Copyright (c) contributors
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the 'Software'), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 */
	var MARKER_FILL_VERTEX_SHADER = "\n#include <common>\n" + three.ShaderChunk.logdepthbuf_pars_vertex + "\n\nvarying vec3 vPosition;\nvarying vec3 vWorldPosition;\nvarying vec3 vNormal;\nvarying vec2 vUv;\nvarying vec3 vColor;\n\nvoid main() {\n\tvPosition = position;\n\tvWorldPosition = (modelMatrix * vec4(position, 1)).xyz;\n\tvNormal = normal;\n\tvUv = uv;\n\tvColor = vec3(1.0);\n\t\n\tgl_Position = \n\t\tprojectionMatrix *\n\t\tviewMatrix *\n\t\tmodelMatrix *\n\t\tvec4(position, 1);\n\t\n\t" + three.ShaderChunk.logdepthbuf_vertex + " \n}\n";

	var ShapeMarker = /*#__PURE__*/function (_Marker) {
	  _inheritsLoose(ShapeMarker, _Marker);

	  function ShapeMarker(markerSet, id, parentObject) {
	    var _this;

	    _this = _Marker.call(this, markerSet, id) || this;
	    Object.defineProperty(_assertThisInitialized(_this), 'isShapeMarker', {
	      value: true
	    });
	    Object.defineProperty(_assertThisInitialized(_this), 'type', {
	      value: "shape"
	    });
	    var fillColor = Marker.normalizeColor({});
	    var borderColor = Marker.normalizeColor({});
	    var lineWidth = 2;
	    var depthTest = false;
	    _this._lineOpacity = 1;
	    _this._fillOpacity = 1;
	    _this._markerObject = new three.Object3D();

	    _this._markerObject.position.copy(_this.position);

	    parentObject.add(_this._markerObject);
	    _this._markerFillMaterial = new three.ShaderMaterial({
	      vertexShader: MARKER_FILL_VERTEX_SHADER,
	      fragmentShader: MARKER_FILL_FRAGMENT_SHADER,
	      side: three.DoubleSide,
	      depthTest: depthTest,
	      transparent: true,
	      uniforms: {
	        markerColor: {
	          value: fillColor.vec4
	        }
	      }
	    });
	    _this._markerLineMaterial = new LineMaterial({
	      color: new three.Color(borderColor.rgb),
	      opacity: borderColor.a,
	      transparent: true,
	      linewidth: lineWidth,
	      depthTest: depthTest,
	      vertexColors: false,
	      dashed: false
	    });

	    _this._markerLineMaterial.resolution.set(window.innerWidth, window.innerHeight);

	    return _this;
	  }

	  var _proto = ShapeMarker.prototype;

	  _proto.update = function update(markerData) {
	    _Marker.prototype.update.call(this, markerData);

	    this.height = markerData.height ? parseFloat(markerData.height) : 0.0;
	    this.depthTest = !!markerData.depthTest;
	    if (markerData.fillColor) this.fillColor = markerData.fillColor;
	    if (markerData.borderColor) this.borderColor = markerData.borderColor;
	    this.lineWidth = markerData.lineWidth ? parseFloat(markerData.lineWidth) : 2;
	    var points = [];

	    if (Array.isArray(markerData.shape)) {
	      markerData.shape.forEach(function (point) {
	        points.push(new three.Vector2(parseFloat(point.x), parseFloat(point.z)));
	      });
	    }

	    this.shape = points;
	  };

	  _proto._onBeforeRender = function _onBeforeRender(renderer, scene, camera) {
	    _Marker.prototype._onBeforeRender.call(this, renderer, scene, camera);

	    this._markerFillMaterial.uniforms.markerColor.value.w = this._fillOpacity * this._opacity;
	    this._markerLineMaterial.opacity = this._lineOpacity * this._opacity;
	  };

	  _proto.dispose = function dispose() {
	    this._markerObject.parent.remove(this._markerObject);

	    this._markerObject.children.forEach(function (child) {
	      if (child.geometry && child.geometry.isGeometry) child.geometry.dispose();
	    });

	    this._markerObject.clear();

	    this._markerFillMaterial.dispose();

	    this._markerLineMaterial.dispose();

	    _Marker.prototype.dispose.call(this);
	  }
	  /**
	   * Sets the fill-color
	   *
	   * color-object format:
	   * <code><pre>
	   * {
	   *     r: 0,    // int 0-255 red
	   *     g: 0,    // int 0-255 green
	   *     b: 0,    // int 0-255 blue
	   *     a: 0     // float 0-1 alpha
	   * }
	   * </pre></code>
	   *
	   * @param color {Object}
	   */
	  ;

	  _createClass(ShapeMarker, [{
	    key: "fillColor",
	    set: function set(color) {
	      color = Marker.normalizeColor(color);
	      this._markerFillMaterial.uniforms.markerColor.value = color.vec4;
	      this._fillOpacity = color.a;
	      this._markerFillMaterial.needsUpdate = true;
	    }
	    /**
	     * Sets the border-color
	     *
	     * color-object format:
	     * <code><pre>
	     * {
	     *     r: 0,    // int 0-255 red
	     *     g: 0,    // int 0-255 green
	     *     b: 0,    // int 0-255 blue
	     *     a: 0     // float 0-1 alpha
	     * }
	     * </pre></code>
	     *
	     * @param color {Object}
	     */

	  }, {
	    key: "borderColor",
	    set: function set(color) {
	      color = Marker.normalizeColor(color);

	      this._markerLineMaterial.color.setHex(color.rgb);

	      this._lineOpacity = color.a;
	      this._markerLineMaterial.needsUpdate = true;
	    }
	    /**
	     * Sets the width of the marker-line
	     * @param width {number}
	     */

	  }, {
	    key: "lineWidth",
	    set: function set(width) {
	      this._markerLineMaterial.linewidth = width;
	      this._markerLineMaterial.needsUpdate = true;
	    }
	    /**
	     * Sets if this marker can be seen through terrain
	     * @param test {boolean}
	     */

	  }, {
	    key: "depthTest",
	    set: function set(test) {
	      this._markerFillMaterial.depthTest = test;
	      this._markerFillMaterial.needsUpdate = true;
	      this._markerLineMaterial.depthTest = test;
	      this._markerLineMaterial.needsUpdate = true;
	    },
	    get: function get() {
	      return this._markerFillMaterial.depthTest;
	    }
	    /**
	     * Sets the height of this marker
	     * @param height {number}
	     */

	  }, {
	    key: "height",
	    set: function set(height) {
	      this._markerObject.position.y = height;
	    }
	    /**
	     * Sets the points for the shape of this marker.
	     * @param points {Vector2[]}
	     */

	  }, {
	    key: "shape",
	    set: function set(points) {
	      var _this2 = this;

	      // remove old marker
	      this._markerObject.children.forEach(function (child) {
	        if (child.geometry && child.geometry.isGeometry) child.geometry.dispose();
	      });

	      this._markerObject.clear();

	      if (points.length < 3) return;
	      this._markerObject.position.x = this.position.x;
	      this._markerObject.position.z = this.position.z; // border-line

	      var points3d = [];
	      points.forEach(function (point) {
	        return points3d.push(point.x, 0, point.y);
	      });
	      points3d.push(points[0].x, 0, points[0].y);
	      var lineGeo = new LineGeometry();
	      lineGeo.setPositions(points3d);
	      lineGeo.translate(-this.position.x, 0.01456, -this.position.z);
	      var line = new Line2(lineGeo, this._markerLineMaterial);

	      line.onBeforeRender = function (renderer) {
	        return renderer.getSize(line.material.resolution);
	      };

	      line.computeLineDistances();
	      line.marker = this;

	      this._markerObject.add(line); // fill


	      if (this._markerFillMaterial.uniforms.markerColor.value.w > 0) {
	        var shape = new three.Shape(points);
	        var fillGeo = new three.ShapeBufferGeometry(shape, 1);
	        fillGeo.rotateX(Math.PI / 2); //make y to z

	        fillGeo.translate(-this.position.x, 0.01456, -this.position.z);
	        var fill = new three.Mesh(fillGeo, this._markerFillMaterial);
	        fill.marker = this;

	        this._markerObject.add(fill);
	      } // put render-hook on first object


	      if (this._markerObject.children.length > 0) {
	        var oldHook = this._markerObject.children[0].onBeforeRender;

	        this._markerObject.children[0].onBeforeRender = function (renderer, scene, camera, geometry, material, group) {
	          _this2._onBeforeRender(renderer, scene, camera);

	          oldHook(renderer, scene, camera, geometry, material, group);
	        };
	      }
	    }
	  }]);

	  return ShapeMarker;
	}(Marker);

	var LineMarker = /*#__PURE__*/function (_Marker) {
	  _inheritsLoose(LineMarker, _Marker);

	  function LineMarker(markerSet, id, parentObject) {
	    var _this;

	    _this = _Marker.call(this, markerSet, id) || this;
	    Object.defineProperty(_assertThisInitialized(_this), 'isLineMarker', {
	      value: true
	    });
	    Object.defineProperty(_assertThisInitialized(_this), 'type', {
	      value: "line"
	    });
	    var lineColor = Marker.normalizeColor({});
	    var lineWidth = 2;
	    var depthTest = false;
	    _this._lineOpacity = 1;
	    _this._markerObject = new three.Object3D();

	    _this._markerObject.position.copy(_this.position);

	    parentObject.add(_this._markerObject);
	    _this._markerLineMaterial = new LineMaterial({
	      color: new three.Color(lineColor.rgb),
	      opacity: lineColor.a,
	      transparent: true,
	      linewidth: lineWidth,
	      depthTest: depthTest,
	      vertexColors: false,
	      dashed: false
	    });

	    _this._markerLineMaterial.resolution.set(window.innerWidth, window.innerHeight);

	    return _this;
	  }

	  var _proto = LineMarker.prototype;

	  _proto.update = function update(markerData) {
	    _Marker.prototype.update.call(this, markerData);

	    if (markerData.lineColor) this.lineColor = markerData.lineColor;
	    this.lineWidth = markerData.lineWidth ? parseFloat(markerData.lineWidth) : 2;
	    this.depthTest = !!markerData.depthTest;
	    var points = [];

	    if (Array.isArray(markerData.line)) {
	      markerData.line.forEach(function (point) {
	        points.push(new three.Vector3(parseFloat(point.x), parseFloat(point.y), parseFloat(point.z)));
	      });
	    }

	    this.line = points;
	  };

	  _proto._onBeforeRender = function _onBeforeRender(renderer, scene, camera) {
	    _Marker.prototype._onBeforeRender.call(this, renderer, scene, camera);

	    this._markerLineMaterial.opacity = this._lineOpacity * this._opacity;
	  };

	  _proto.dispose = function dispose() {
	    this._markerObject.parent.remove(this._markerObject);

	    this._markerObject.children.forEach(function (child) {
	      if (child.geometry && child.geometry.isGeometry) child.geometry.dispose();
	    });

	    this._markerObject.clear();

	    this._markerLineMaterial.dispose();

	    _Marker.prototype.dispose.call(this);
	  }
	  /**
	   * Sets the line-color
	   *
	   * color-object format:
	   * <code><pre>
	   * {
	   *     r: 0,    // int 0-255 red
	   *     g: 0,    // int 0-255 green
	   *     b: 0,    // int 0-255 blue
	   *     a: 0     // float 0-1 alpha
	   * }
	   * </pre></code>
	   *
	   * @param color {Object}
	   */
	  ;

	  _createClass(LineMarker, [{
	    key: "lineColor",
	    set: function set(color) {
	      color = Marker.normalizeColor(color);

	      this._markerLineMaterial.color.setHex(color.rgb);

	      this._lineOpacity = color.a;
	      this._markerLineMaterial.needsUpdate = true;
	    }
	    /**
	     * Sets the width of the marker-line
	     * @param width {number}
	     */

	  }, {
	    key: "lineWidth",
	    set: function set(width) {
	      this._markerLineMaterial.linewidth = width;
	      this._markerLineMaterial.needsUpdate = true;
	    }
	    /**
	     * Sets if this marker can be seen through terrain
	     * @param test {boolean}
	     */

	  }, {
	    key: "depthTest",
	    set: function set(test) {
	      this._markerLineMaterial.depthTest = test;
	      this._markerLineMaterial.needsUpdate = true;
	    },
	    get: function get() {
	      return this._markerLineMaterial.depthTest;
	    }
	    /**
	     * Sets the points for the shape of this marker.
	     * @param points {Vector3[]}
	     */

	  }, {
	    key: "line",
	    set: function set(points) {
	      var _this2 = this;

	      // remove old marker
	      this._markerObject.children.forEach(function (child) {
	        if (child.geometry && child.geometry.isGeometry) child.geometry.dispose();
	      });

	      this._markerObject.clear();

	      if (points.length < 3) return;

	      this._markerObject.position.copy(this.position); // line


	      var points3d = [];
	      points.forEach(function (point) {
	        return points3d.push(point.x, point.y, point.z);
	      });
	      var lineGeo = new LineGeometry();
	      lineGeo.setPositions(points3d);
	      lineGeo.translate(-this.position.x, -this.position.y, -this.position.z);
	      var line = new Line2(lineGeo, this._markerLineMaterial);
	      line.computeLineDistances();

	      line.onBeforeRender = function (renderer, camera, scene) {
	        _this2._onBeforeRender(renderer, camera, scene);

	        renderer.getSize(line.material.resolution);
	      };

	      line.marker = this;

	      this._markerObject.add(line);
	    }
	  }]);

	  return LineMarker;
	}(Marker);

	var ExtrudeMarker = /*#__PURE__*/function (_Marker) {
	  _inheritsLoose(ExtrudeMarker, _Marker);

	  function ExtrudeMarker(markerSet, id, parentObject) {
	    var _this;

	    _this = _Marker.call(this, markerSet, id) || this;
	    Object.defineProperty(_assertThisInitialized(_this), 'isExtrudeMarker', {
	      value: true
	    });
	    Object.defineProperty(_assertThisInitialized(_this), 'type', {
	      value: "extrude"
	    });
	    var fillColor = Marker.normalizeColor({});
	    var borderColor = Marker.normalizeColor({});
	    var lineWidth = 2;
	    var depthTest = false;
	    _this._lineOpacity = 1;
	    _this._fillOpacity = 1;
	    _this._markerObject = new three.Object3D();

	    _this._markerObject.position.copy(_this.position);

	    parentObject.add(_this._markerObject);
	    _this._markerFillMaterial = new three.ShaderMaterial({
	      vertexShader: MARKER_FILL_VERTEX_SHADER,
	      fragmentShader: MARKER_FILL_FRAGMENT_SHADER,
	      side: three.DoubleSide,
	      depthTest: depthTest,
	      transparent: true,
	      uniforms: {
	        markerColor: {
	          value: fillColor.vec4
	        }
	      }
	    });
	    _this._markerLineMaterial = new LineMaterial({
	      color: new three.Color(borderColor.rgb),
	      opacity: borderColor.a,
	      transparent: true,
	      linewidth: lineWidth,
	      depthTest: depthTest,
	      vertexColors: false,
	      dashed: false
	    });

	    _this._markerLineMaterial.resolution.set(window.innerWidth, window.innerHeight);

	    return _this;
	  }

	  var _proto = ExtrudeMarker.prototype;

	  _proto.update = function update(markerData) {
	    _Marker.prototype.update.call(this, markerData);

	    this.minHeight = markerData.minHeight ? parseFloat(markerData.minHeight) : 0.0;
	    this.maxHeight = markerData.maxHeight ? parseFloat(markerData.maxHeight) : 255.0;
	    this.depthTest = !!markerData.depthTest;
	    if (markerData.fillColor) this.fillColor = markerData.fillColor;
	    if (markerData.borderColor) this.borderColor = markerData.borderColor;
	    this.lineWidth = markerData.lineWidth ? parseFloat(markerData.lineWidth) : 2;
	    var points = [];

	    if (Array.isArray(markerData.shape)) {
	      markerData.shape.forEach(function (point) {
	        points.push(new three.Vector2(parseFloat(point.x), parseFloat(point.z)));
	      });
	    }

	    this.shape = points;
	  };

	  _proto._onBeforeRender = function _onBeforeRender(renderer, scene, camera) {
	    _Marker.prototype._onBeforeRender.call(this, renderer, scene, camera);

	    this._markerFillMaterial.uniforms.markerColor.value.w = this._fillOpacity * this._opacity;
	    this._markerLineMaterial.opacity = this._lineOpacity * this._opacity;
	  };

	  _proto.dispose = function dispose() {
	    this._markerObject.parent.remove(this._markerObject);

	    this._markerObject.children.forEach(function (child) {
	      if (child.geometry && child.geometry.isGeometry) child.geometry.dispose();
	    });

	    this._markerObject.clear();

	    this._markerFillMaterial.dispose();

	    this._markerLineMaterial.dispose();

	    _Marker.prototype.dispose.call(this);
	  }
	  /**
	   * Sets the fill-color
	   *
	   * color-object format:
	   * <code><pre>
	   * {
	   *     r: 0,    // int 0-255 red
	   *     g: 0,    // int 0-255 green
	   *     b: 0,    // int 0-255 blue
	   *     a: 0     // float 0-1 alpha
	   * }
	   * </pre></code>
	   *
	   * @param color {Object}
	   */
	  ;

	  _createClass(ExtrudeMarker, [{
	    key: "fillColor",
	    set: function set(color) {
	      color = Marker.normalizeColor(color);

	      this._markerFillMaterial.uniforms.markerColor.value.copy(color.vec4);

	      this._fillOpacity = color.a;
	      this._markerFillMaterial.needsUpdate = true;
	    }
	    /**
	     * Sets the border-color
	     *
	     * color-object format:
	     * <code><pre>
	     * {
	     *     r: 0,    // int 0-255 red
	     *     g: 0,    // int 0-255 green
	     *     b: 0,    // int 0-255 blue
	     *     a: 0     // float 0-1 alpha
	     * }
	     * </pre></code>
	     *
	     * @param color {Object}
	     */

	  }, {
	    key: "borderColor",
	    set: function set(color) {
	      color = Marker.normalizeColor(color);

	      this._markerLineMaterial.color.setHex(color.rgb);

	      this._lineOpacity = color.a;
	      this._markerLineMaterial.needsUpdate = true;
	    }
	    /**
	     * Sets the width of the marker-line
	     * @param width {number}
	     */

	  }, {
	    key: "lineWidth",
	    set: function set(width) {
	      this._markerLineMaterial.linewidth = width;
	      this._markerLineMaterial.needsUpdate = true;
	    }
	    /**
	     * Sets if this marker can be seen through terrain
	     * @param test {boolean}
	     */

	  }, {
	    key: "depthTest",
	    set: function set(test) {
	      this._markerFillMaterial.depthTest = test;
	      this._markerFillMaterial.needsUpdate = true;
	      this._markerLineMaterial.depthTest = test;
	      this._markerLineMaterial.needsUpdate = true;
	    },
	    get: function get() {
	      return this._markerFillMaterial.depthTest;
	    }
	    /**
	     * Sets the min-height of this marker
	     * @param height {number}
	     */

	  }, {
	    key: "minHeight",
	    set: function set(height) {
	      this._minHeight = height;
	    }
	    /**
	     * Sets the max-height of this marker
	     * @param height {number}
	     */

	  }, {
	    key: "maxHeight",
	    set: function set(height) {
	      this._markerObject.position.y = height + 0.01;
	    }
	    /**
	     * Sets the points for the shape of this marker.
	     * @param points {Vector2[]}
	     */

	  }, {
	    key: "shape",
	    set: function set(points) {
	      var _this2 = this;

	      // remove old marker
	      this._markerObject.children.forEach(function (child) {
	        if (child.geometry && child.geometry.isGeometry) child.geometry.dispose();
	      });

	      this._markerObject.clear();

	      if (points.length < 3) return;
	      this._markerObject.position.x = this.position.x + 0.01;
	      this._markerObject.position.z = this.position.z + 0.01;
	      var maxY = this._markerObject.position.y;
	      var minY = this._minHeight;
	      var depth = maxY - minY;
	      var shape = new three.Shape(points); // border-line

	      if (this._markerLineMaterial.opacity > 0) {
	        var points3d = [];
	        points.forEach(function (point) {
	          return points3d.push(point.x, 0, point.y);
	        });
	        points3d.push(points[0].x, 0, points[0].y);

	        var preRenderHook = function preRenderHook(line) {
	          return function (renderer) {
	            renderer.getSize(line.material.resolution);
	          };
	        };

	        var topLineGeo = new LineGeometry();
	        topLineGeo.setPositions(points3d);
	        topLineGeo.translate(-this.position.x, 0, -this.position.z);
	        var topLine = new Line2(topLineGeo, this._markerLineMaterial);
	        topLine.computeLineDistances();
	        topLine.onBeforeRender = preRenderHook(topLine);

	        this._markerObject.add(topLine);

	        var bottomLine = topLine.clone();
	        bottomLine.position.y = -depth;
	        bottomLine.computeLineDistances();
	        bottomLine.onBeforeRender = preRenderHook(bottomLine);

	        this._markerObject.add(bottomLine);

	        points.forEach(function (point) {
	          var pointLineGeo = new LineGeometry();
	          pointLineGeo.setPositions([point.x, 0, point.y, point.x, -depth, point.y]);
	          pointLineGeo.translate(-_this2.position.x, 0, -_this2.position.z);
	          var pointLine = new Line2(pointLineGeo, _this2._markerLineMaterial);
	          pointLine.computeLineDistances();
	          pointLine.onBeforeRender = preRenderHook(pointLine);
	          pointLine.marker = _this2;

	          _this2._markerObject.add(pointLine);
	        });
	      } // fill


	      if (this._markerFillMaterial.uniforms.markerColor.value.w > 0) {
	        var fillGeo = new three.ExtrudeBufferGeometry(shape, {
	          steps: 1,
	          depth: depth,
	          bevelEnabled: false
	        });
	        fillGeo.rotateX(Math.PI / 2); //make y to z

	        fillGeo.translate(-this.position.x, 0, -this.position.z);
	        var fill = new three.Mesh(fillGeo, this._markerFillMaterial);

	        fill.onBeforeRender = function (renderer, scene, camera) {
	          return _this2._onBeforeRender(renderer, scene, camera);
	        };

	        fill.marker = this;

	        this._markerObject.add(fill);
	      } // put render-hook on line (only) if there is no fill
	      else if (this._markerObject.children.length > 0) {
	          var oldHook = this._markerObject.children[0].onBeforeRender;

	          this._markerObject.children[0].onBeforeRender = function (renderer, scene, camera, geometry, material, group) {
	            _this2._onBeforeRender(renderer, scene, camera);

	            oldHook(renderer, scene, camera, geometry, material, group);
	          };
	        }
	    }
	  }]);

	  return ExtrudeMarker;
	}(Marker);

	/**
	 * @author mrdoob / http://mrdoob.com/
	 *
	 * adapted for bluemap's purposes
	 */

	var CSS2DObject = function CSS2DObject(element) {
	  three.Object3D.call(this);
	  this.element = element;
	  this.element.style.position = 'absolute';
	  this.anchor = new three.Vector2();
	  this.addEventListener('removed', function () {
	    this.traverse(function (object) {
	      if (object.element instanceof Element && object.element.parentNode !== null) {
	        object.element.parentNode.removeChild(object.element);
	      }
	    });
	  });
	};

	CSS2DObject.prototype = Object.create(three.Object3D.prototype);
	CSS2DObject.prototype.constructor = CSS2DObject; //

	var CSS2DRenderer = function CSS2DRenderer() {
	  var _this = this;

	  var _width, _height;

	  var _widthHalf, _heightHalf;

	  var vector = new three.Vector3();
	  var viewMatrix = new three.Matrix4();
	  var viewProjectionMatrix = new three.Matrix4();
	  var cache = {
	    objects: new WeakMap()
	  };
	  var domElement = document.createElement('div');
	  domElement.style.overflow = 'hidden';
	  this.domElement = domElement;

	  this.getSize = function () {
	    return {
	      width: _width,
	      height: _height
	    };
	  };

	  this.setSize = function (width, height) {
	    _width = width;
	    _height = height;
	    _widthHalf = _width / 2;
	    _heightHalf = _height / 2;
	    domElement.style.width = width + 'px';
	    domElement.style.height = height + 'px';
	  };

	  var renderObject = function renderObject(object, scene, camera) {
	    if (object instanceof CSS2DObject) {
	      object.onBeforeRender(_this, scene, camera);
	      vector.setFromMatrixPosition(object.matrixWorld);
	      vector.applyMatrix4(viewProjectionMatrix);
	      var element = object.element;
	      var style = 'translate(' + (vector.x * _widthHalf + _widthHalf - object.anchor.x) + 'px,' + (-vector.y * _heightHalf + _heightHalf - object.anchor.y) + 'px)';
	      element.style.WebkitTransform = style;
	      element.style.MozTransform = style;
	      element.style.oTransform = style;
	      element.style.transform = style;
	      element.style.display = object.visible && vector.z >= -1 && vector.z <= 1 ? '' : 'none';
	      var objectData = {
	        distanceToCameraSquared: getDistanceToSquared(camera, object)
	      };
	      cache.objects.set(object, objectData);

	      if (element.parentNode !== domElement) {
	        domElement.appendChild(element);
	      }

	      object.onAfterRender(_this, scene, camera);
	    }

	    for (var i = 0, l = object.children.length; i < l; i++) {
	      renderObject(object.children[i], scene, camera);
	    }
	  };

	  var getDistanceToSquared = function () {
	    var a = new three.Vector3();
	    var b = new three.Vector3();
	    return function (object1, object2) {
	      a.setFromMatrixPosition(object1.matrixWorld);
	      b.setFromMatrixPosition(object2.matrixWorld);
	      return a.distanceToSquared(b);
	    };
	  }();

	  var filterAndFlatten = function filterAndFlatten(scene) {
	    var result = [];
	    scene.traverse(function (object) {
	      if (object instanceof CSS2DObject) result.push(object);
	    });
	    return result;
	  };

	  var zOrder = function zOrder(scene) {
	    var sorted = filterAndFlatten(scene).sort(function (a, b) {
	      var distanceA = cache.objects.get(a).distanceToCameraSquared;
	      var distanceB = cache.objects.get(b).distanceToCameraSquared;
	      return distanceA - distanceB;
	    });
	    var zMax = sorted.length;

	    for (var i = 0, l = sorted.length; i < l; i++) {
	      sorted[i].element.style.zIndex = zMax - i;
	    }
	  };

	  this.render = function (scene, camera) {
	    if (scene.autoUpdate === true) scene.updateMatrixWorld();
	    if (camera.parent === null) camera.updateMatrixWorld();
	    viewMatrix.copy(camera.matrixWorldInverse);
	    viewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, viewMatrix);
	    renderObject(scene, scene, camera);
	    zOrder(scene);
	  };
	};

	var HTMLMarker = /*#__PURE__*/function (_Marker) {
	  _inheritsLoose(HTMLMarker, _Marker);

	  function HTMLMarker(markerSet, id, parentObject) {
	    var _this;

	    _this = _Marker.call(this, markerSet, id) || this;
	    Object.defineProperty(_assertThisInitialized(_this), 'isHTMLMarker', {
	      value: true
	    });
	    Object.defineProperty(_assertThisInitialized(_this), 'type', {
	      value: "html"
	    });
	    _this._markerElement = htmlToElement("<div id=\"bm-marker-" + _this.id + "\" class=\"bm-marker-" + _this.type + "\"></div>");

	    _this._markerElement.addEventListener('click', function (event) {
	      return _this.onClick(_this.position);
	    });

	    _this._markerObject = new CSS2DObject(_this._markerElement);

	    _this._markerObject.position.copy(_this.position);

	    _this._markerObject.onBeforeRender = function (renderer, scene, camera) {
	      return _this._onBeforeRender(renderer, scene, camera);
	    };

	    parentObject.add(_this._markerObject);
	    return _this;
	  }

	  var _proto = HTMLMarker.prototype;

	  _proto.update = function update(markerData) {
	    _Marker.prototype.update.call(this, markerData);

	    if (markerData.html) {
	      this.html = markerData.html;
	    }

	    if (markerData.anchor) {
	      this.setAnchor(parseInt(markerData.anchor.x), parseInt(markerData.anchor.y));
	    }
	  };

	  _proto._onBeforeRender = function _onBeforeRender(renderer, scene, camera) {
	    _Marker.prototype._onBeforeRender.call(this, renderer, scene, camera);

	    this._markerElement.style.opacity = this._opacity;

	    this._markerElement.setAttribute("data-distance", Math.round(this._distance));

	    if (this._opacity <= 0) {
	      this._markerElement.style.pointerEvents = "none";
	    } else {
	      this._markerElement.style.pointerEvents = "auto";
	    }
	  };

	  _proto.dispose = function dispose() {
	    this._markerObject.parent.remove(this._markerObject);

	    _Marker.prototype.dispose.call(this);
	  };

	  _proto.setAnchor = function setAnchor(x, y) {
	    this._markerObject.anchor.set(x, y);
	  };

	  _proto.setPosition = function setPosition(x, y, z) {
	    _Marker.prototype.setPosition.call(this, x, y, z);

	    this._markerObject.position.set(x, y, z);
	  };

	  _createClass(HTMLMarker, [{
	    key: "html",
	    set: function set(html) {
	      this._markerElement.innerHTML = html;
	    }
	  }]);

	  return HTMLMarker;
	}(Marker);

	var POIMarker = /*#__PURE__*/function (_HTMLMarker) {
	  _inheritsLoose(POIMarker, _HTMLMarker);

	  function POIMarker(markerSet, id, parentObject) {
	    var _this;

	    _this = _HTMLMarker.call(this, markerSet, id, parentObject) || this;

	    _this._markerElement.classList.add("bm-marker-poi");

	    Object.defineProperty(_assertThisInitialized(_this), 'isPOIMarker', {
	      value: true
	    });
	    return _this;
	  }

	  var _proto = POIMarker.prototype;

	  _proto.update = function update(markerData) {
	    _HTMLMarker.prototype.update.call(this, markerData);

	    this.icon = markerData.icon ? markerData.icon : "assets/poi.svg"; //backwards compatibility for "iconAnchor"

	    if (!markerData.anchor) {
	      if (markerData.iconAnchor) {
	        this.setAnchor(parseInt(markerData.iconAnchor.x), parseInt(markerData.iconAnchor.y));
	      }
	    }
	  };

	  _proto.onClick = function onClick(clickPosition) {
	    var _this2 = this;

	    if (!dispatchEvent(this.manager.events, 'bluemapMarkerClick', {
	      marker: this
	    })) return;
	    this.followLink();

	    this._markerElement.classList.add("bm-marker-poi-show-label");

	    var onRemoveLabel = function onRemoveLabel() {
	      _this2._markerElement.classList.remove("bm-marker-poi-show-label");
	    };

	    this.manager.events.addEventListener('bluemapPopupMarker', onRemoveLabel, {
	      once: true
	    });
	    setTimeout(function () {
	      _this2.manager.events.addEventListener('bluemapCameraMoved', onRemoveLabel, {
	        once: true
	      });
	    }, 1000);
	  };

	  _proto.updateHtml = function updateHtml() {
	    var labelHtml = '';
	    if (this._label) labelHtml = "<div class=\"bm-marker-poi-label\">" + this._label + "</div>";
	    this.html = "<img src=\"" + this._icon + "\" alt=\"POI-" + this.id + "\" draggable=\"false\">" + labelHtml;
	  };

	  _createClass(POIMarker, [{
	    key: "label",
	    set: function set(label) {
	      this._label = label;
	      this.updateHtml();
	    }
	  }, {
	    key: "icon",
	    set: function set(icon) {
	      this._icon = icon;
	      this.updateHtml();
	    }
	  }]);

	  return POIMarker;
	}(HTMLMarker);

	var PlayerMarker = /*#__PURE__*/function (_HTMLMarker) {
	  _inheritsLoose(PlayerMarker, _HTMLMarker);

	  function PlayerMarker(markerSet, id, parentObject, playerUuid) {
	    var _this;

	    _this = _HTMLMarker.call(this, markerSet, id, parentObject) || this;

	    _this._markerElement.classList.add("bm-marker-player");

	    Object.defineProperty(_assertThisInitialized(_this), 'isPlayerMarker', {
	      value: true
	    });
	    _this._name = id;
	    _this._head = "assets/playerheads/steve.png";
	    _this.playerUuid = playerUuid;

	    _this.updateHtml();

	    return _this;
	  }

	  var _proto = PlayerMarker.prototype;

	  _proto.onClick = function onClick(clickPosition) {
	    var _this2 = this;

	    this.followLink();

	    this._markerElement.classList.add("bm-marker-poi-show-label");

	    var onRemoveLabel = function onRemoveLabel() {
	      _this2._markerElement.classList.remove("bm-marker-poi-show-label");
	    };

	    this.manager.events.addEventListener('bluemapPopupMarker', onRemoveLabel, {
	      once: true
	    });
	    setTimeout(function () {
	      _this2.manager.events.addEventListener('bluemapCameraMoved', onRemoveLabel, {
	        once: true
	      });
	    }, 1000);
	  };

	  _proto.updateHtml = function updateHtml() {
	    var labelHtml = '';
	    if (this._name) labelHtml = "<div class=\"bm-marker-poi-label\">" + this._name + "</div>";
	    this.html = "<img src=\"" + this._head + "\" alt=\"PlayerHead-" + this.id + "\" draggable=\"false\">" + labelHtml;
	  };

	  _createClass(PlayerMarker, [{
	    key: "name",
	    set: function set(name) {
	      this._name = name;
	      this.updateHtml();
	    }
	  }, {
	    key: "head",
	    set: function set(headImage) {
	      this._head = headImage;
	      this.updateHtml();
	    }
	  }]);

	  return PlayerMarker;
	}(HTMLMarker);

	var MarkerSet = /*#__PURE__*/function () {
	  function MarkerSet(manager, id, mapId, events) {
	    if (events === void 0) {
	      events = null;
	    }

	    Object.defineProperty(this, 'isMarkerSet', {
	      value: true
	    });
	    this.manager = manager;
	    this.id = id;
	    this._mapId = mapId;
	    this._objectMarkerObject = new three.Object3D();
	    this._elementMarkerObject = new three.Object3D();
	    this.events = events;
	    this.label = this.id;
	    this.toggleable = true;
	    this.defaultHide = false;
	    this.visible = undefined;
	    this._source = MarkerSet.Source.CUSTOM;
	    this._marker = {};
	  }

	  var _proto = MarkerSet.prototype;

	  _proto.update = function update(markerSetData) {
	    this._source = MarkerSet.Source.MARKER_FILE;
	    this.label = markerSetData.label ? markerSetData.label : this.id;
	    this.toggleable = markerSetData.toggleable !== undefined ? !!markerSetData.toggleable : true;
	    this.defaultHide = !!markerSetData.defaultHide;
	    if (this.visible === undefined) this.visible = this.defaultHide;
	    var prevMarkers = this._marker;
	    this._marker = {};

	    if (Array.isArray(markerSetData.marker)) {
	      for (var _iterator = _createForOfIteratorHelperLoose(markerSetData.marker), _step; !(_step = _iterator()).done;) {
	        var markerData = _step.value;
	        var markerId = markerData.id;
	        if (!markerId) continue;
	        if (this._marker[markerId]) continue; // skip duplicate id's

	        var mapId = markerData.map;
	        if (mapId !== this._mapId) continue;
	        this._marker[markerId] = prevMarkers[markerId];
	        delete prevMarkers[markerId];
	        this.updateMarker(markerId, markerData);
	      }
	    } //remaining (removed) markers


	    for (var _markerId in prevMarkers) {
	      if (!prevMarkers.hasOwnProperty(_markerId)) continue;
	      if (!prevMarkers[_markerId] || !prevMarkers[_markerId].isMarker) continue; // keep markers that were not loaded from the marker-file

	      if (prevMarkers[_markerId]._source !== Marker.Source.MARKER_FILE) {
	        this._marker[_markerId] = prevMarkers[_markerId];
	        continue;
	      }

	      prevMarkers[_markerId].dispose();
	    }
	  };

	  _proto.updateMarker = function updateMarker(markerId, markerData) {
	    var markerType = markerData.type;
	    if (!markerType) return;

	    if (!this._marker[markerId] || !this._marker[markerId].isMarker) {
	      this.createMarker(markerId, markerType);
	    } else if (this._marker[markerId].type !== markerType) {
	      this._marker[markerId].dispose();

	      this.createMarker(markerId, markerType);
	    }

	    if (!this._marker[markerId]) return;

	    this._marker[markerId].update(markerData);
	  };

	  _proto.createMarker = function createMarker(id, type) {
	    switch (type) {
	      case "html":
	        this._marker[id] = new HTMLMarker(this, id, this._elementMarkerObject);
	        break;

	      case "poi":
	        this._marker[id] = new POIMarker(this, id, this._elementMarkerObject);
	        break;

	      case "shape":
	        this._marker[id] = new ShapeMarker(this, id, this._objectMarkerObject);
	        break;

	      case "line":
	        this._marker[id] = new LineMarker(this, id, this._objectMarkerObject);
	        break;

	      case "extrude":
	        this._marker[id] = new ExtrudeMarker(this, id, this._objectMarkerObject);
	        break;

	      default:
	        return null;
	    }

	    return this._marker[id];
	  };

	  _proto.createPlayerMarker = function createPlayerMarker(playerUuid) {
	    var id = playerUuid;
	    this._marker[id] = new PlayerMarker(this, id, this._elementMarkerObject, playerUuid);
	    return this._marker[id];
	  };

	  _proto.dispose = function dispose() {
	    var marker = _extends({}, this._marker);

	    for (var markerId in marker) {
	      if (!marker.hasOwnProperty(markerId)) continue;
	      if (!marker[markerId] || !marker[markerId].isMarker) continue;
	      marker[markerId].dispose();
	    }

	    this._marker = {};
	    delete this.manager.markerSets[this.id];
	  };

	  _createClass(MarkerSet, [{
	    key: "marker",
	    get: function get() {
	      return this._marker.values();
	    }
	  }]);

	  return MarkerSet;
	}();
	MarkerSet.Source = {
	  CUSTOM: 0,
	  MARKER_FILE: 1
	};

	var MarkerManager = /*#__PURE__*/function () {
	  function MarkerManager(markerFileUrl, mapId, events) {
	    if (events === void 0) {
	      events = null;
	    }

	    Object.defineProperty(this, 'isMarkerManager', {
	      value: true
	    });
	    this.markerFileUrl = markerFileUrl;
	    this.mapId = mapId;
	    this.events = events;
	    this.markerSets = {};
	    this.objectMarkerScene = new three.Scene(); //3d markers

	    this.elementMarkerScene = new three.Scene(); //html markers

	    this._popupId = 0;
	  }

	  var _proto = MarkerManager.prototype;

	  _proto.update = function update() {
	    var _this = this;

	    return this.loadMarkersFile().then(function (markersFile) {
	      var prevMarkerSets = _this.markerSets;
	      _this.markerSets = {};

	      if (Array.isArray(markersFile.markerSets)) {
	        for (var _iterator = _createForOfIteratorHelperLoose(markersFile.markerSets), _step; !(_step = _iterator()).done;) {
	          var markerSetData = _step.value;
	          var markerSetId = markerSetData.id;
	          if (!markerSetId) continue;
	          if (_this.markerSets[markerSetId]) continue; // skip duplicate id's

	          _this.markerSets[markerSetId] = prevMarkerSets[markerSetId];
	          delete prevMarkerSets[markerSetId];

	          _this.updateMarkerSet(markerSetId, markerSetData);
	        }
	      } //remaining (removed) markerSets


	      for (var _markerSetId in prevMarkerSets) {
	        if (!prevMarkerSets.hasOwnProperty(_markerSetId)) continue;
	        if (!prevMarkerSets[_markerSetId] || !prevMarkerSets[_markerSetId].isMarkerSet) continue; // keep marker-sets that were not loaded from the marker-file

	        if (prevMarkerSets[_markerSetId]._source !== MarkerSet.Source.MARKER_FILE) {
	          _this.markerSets[_markerSetId] = prevMarkerSets[_markerSetId];
	          continue;
	        }

	        prevMarkerSets[_markerSetId].dispose();
	      }
	    }).catch(function (reason) {
	      alert(_this.events, reason, "warning");
	    });
	  };

	  _proto.updateMarkerSet = function updateMarkerSet(markerSetId, markerSetData) {
	    if (!this.markerSets[markerSetId] || !this.markerSets[markerSetId].isMarkerSet) {
	      this.createMarkerSet(markerSetId);
	      this.objectMarkerScene.add(this.markerSets[markerSetId]._objectMarkerObject);
	      this.elementMarkerScene.add(this.markerSets[markerSetId]._elementMarkerObject);
	    }

	    this.markerSets[markerSetId].update(markerSetData);
	  };

	  _proto.createMarkerSet = function createMarkerSet(id) {
	    this.markerSets[id] = new MarkerSet(this, id, this.mapId, this.events);
	    return this.markerSets[id];
	  };

	  _proto.dispose = function dispose() {
	    var sets = _extends({}, this.markerSets);

	    for (var markerSetId in sets) {
	      if (!sets.hasOwnProperty(markerSetId)) continue;
	      if (!sets[markerSetId] || !sets[markerSetId].isMarkerSet) continue;
	      sets[markerSetId].dispose();
	    }

	    this.markerSets = {};
	  };

	  _proto.showPopup = function showPopup(html, x, y, z, autoRemove, onRemoval) {
	    var _this2 = this;

	    if (autoRemove === void 0) {
	      autoRemove = true;
	    }

	    if (onRemoval === void 0) {
	      onRemoval = null;
	    }

	    var marker = new HTMLMarker(this, "popup-" + this._popupId++, this.elementMarkerScene);
	    marker.setPosition(x, y, z);
	    marker.html = html;
	    marker.onDisposal = onRemoval;
	    dispatchEvent(this.events, 'bluemapPopupMarker', {
	      marker: marker
	    });

	    if (autoRemove) {
	      var onRemove = function onRemove() {
	        marker.blendOut(200, function (finished) {
	          if (finished) marker.dispose();
	        });
	      };

	      this.events.addEventListener('bluemapPopupMarker', onRemove, {
	        once: true
	      });
	      setTimeout(function () {
	        _this2.events.addEventListener('bluemapCameraMoved', onRemove, {
	          once: true
	        });
	      }, 1000);
	    }

	    marker.blendIn(200);
	    return marker;
	  }
	  /**
	   * Loads the markers.json file for this map
	   * @returns {Promise<Object>}
	   */
	  ;

	  _proto.loadMarkersFile = function loadMarkersFile() {
	    var _this3 = this;

	    return new Promise(function (resolve, reject) {
	      alert(_this3.events, "Loading markers from '" + _this3.markerFileUrl + "'...", "fine");
	      var loader = new three.FileLoader();
	      loader.setResponseType("json");
	      loader.load(_this3.markerFileUrl, function (markerFile) {
	        if (!markerFile) reject("Failed to parse '" + _this3.markerFileUrl + "'!");else resolve(markerFile);
	      }, function () {}, function () {
	        return reject("Failed to load '" + _this3.markerFileUrl + "'!");
	      });
	    });
	  };

	  return MarkerManager;
	}();

	var Map = /*#__PURE__*/function () {
	  function Map(id, dataUrl, events) {
	    var _this = this;

	    if (events === void 0) {
	      events = null;
	    }

	    this.onTileLoad = function (layer) {
	      return function (tile) {
	        dispatchEvent(_this.events, "bluemapMapTileLoaded", {
	          tile: tile,
	          layer: layer
	        });
	      };
	    };

	    this.onTileUnload = function (layer) {
	      return function (tile) {
	        dispatchEvent(_this.events, "bluemapMapTileUnloaded", {
	          tile: tile,
	          layer: layer
	        });
	      };
	    };

	    Object.defineProperty(this, 'isMap', {
	      value: true
	    });
	    this.id = id;
	    this.events = events;
	    this.dataUrl = dataUrl;
	    this.name = this.id;
	    this.world = "-";
	    this.startPos = {
	      x: 0,
	      z: 0
	    };
	    this.skyColor = {
	      r: 0,
	      g: 0,
	      b: 0
	    };
	    this.ambientLight = 0;
	    this.hires = {
	      tileSize: {
	        x: 32,
	        z: 32
	      },
	      scale: {
	        x: 1,
	        z: 1
	      },
	      translate: {
	        x: 2,
	        z: 2
	      }
	    };
	    this.lowres = {
	      tileSize: {
	        x: 32,
	        z: 32
	      },
	      scale: {
	        x: 1,
	        z: 1
	      },
	      translate: {
	        x: 2,
	        z: 2
	      }
	    };
	    this.scene = new three.Scene();
	    this.scene.autoUpdate = false;
	    this.raycaster = new three.Raycaster();
	    this.hiresMaterial = null;
	    this.lowresMaterial = null;
	    this.loadedTextures = [];
	    this.hiresTileManager = null;
	    this.lowresTileManager = null;
	    this.markerManager = new MarkerManager(this.dataUrl + "../markers.json", this.id, this.events);
	  }
	  /**
	   * Loads textures and materials for this map so it is ready to load map-tiles
	   * @returns {Promise<void>}
	   */


	  var _proto = Map.prototype;

	  _proto.load = function load(hiresVertexShader, hiresFragmentShader, lowresVertexShader, lowresFragmentShader, uniforms) {
	    var _this2 = this;

	    this.unload();
	    var settingsFilePromise = this.loadSettingsFile();
	    var textureFilePromise = this.loadTexturesFile();
	    var markerUpdatePromise = this.markerManager.update();
	    this.lowresMaterial = this.createLowresMaterial(lowresVertexShader, lowresFragmentShader, uniforms);
	    var settingsPromise = settingsFilePromise.then(function (worldSettings) {
	      _this2.name = worldSettings.name ? worldSettings.name : _this2.name;
	      _this2.world = worldSettings.world ? worldSettings.world : _this2.world;
	      _this2.startPos = _extends({}, _this2.startPos, worldSettings.startPos);
	      _this2.skyColor = _extends({}, _this2.skyColor, worldSettings.skyColor);
	      _this2.ambientLight = worldSettings.ambientLight ? worldSettings.ambientLight : 0;
	      if (worldSettings.hires === undefined) worldSettings.hires = {};
	      if (worldSettings.lowres === undefined) worldSettings.lowres = {};
	      _this2.hires = {
	        tileSize: _extends({}, _this2.hires.tileSize, worldSettings.hires.tileSize),
	        scale: _extends({}, _this2.hires.scale, worldSettings.hires.scale),
	        translate: _extends({}, _this2.hires.translate, worldSettings.hires.translate)
	      };
	      _this2.lowres = {
	        tileSize: _extends({}, _this2.lowres.tileSize, worldSettings.lowres.tileSize),
	        scale: _extends({}, _this2.lowres.scale, worldSettings.lowres.scale),
	        translate: _extends({}, _this2.lowres.translate, worldSettings.lowres.translate)
	      };
	    });
	    var mapPromise = Promise.all([settingsPromise, textureFilePromise]).then(function (values) {
	      var textures = values[1];
	      if (textures === null) throw new Error("Failed to parse textures.json!");
	      _this2.hiresMaterial = _this2.createHiresMaterial(hiresVertexShader, hiresFragmentShader, uniforms, textures);
	      _this2.hiresTileManager = new TileManager(_this2.scene, new TileLoader(_this2.dataUrl + "hires/", _this2.hiresMaterial, _this2.hires, 1), _this2.onTileLoad("hires"), _this2.onTileUnload("hires"), _this2.events);
	      _this2.lowresTileManager = new TileManager(_this2.scene, new TileLoader(_this2.dataUrl + "lowres/", _this2.lowresMaterial, _this2.lowres, 2), _this2.onTileLoad("lowres"), _this2.onTileUnload("lowres"), _this2.events);
	      alert(_this2.events, "Map '" + _this2.id + "' is loaded.", "fine");
	    });
	    return Promise.all([mapPromise, markerUpdatePromise]);
	  };

	  _proto.loadMapArea = function loadMapArea(x, z, hiresViewDistance, lowresViewDistance) {
	    if (!this.isLoaded) return;
	    var hiresX = Math.floor((x - this.hires.translate.x) / this.hires.tileSize.x);
	    var hiresZ = Math.floor((z - this.hires.translate.z) / this.hires.tileSize.z);
	    var hiresViewX = Math.floor(hiresViewDistance / this.hires.tileSize.x);
	    var hiresViewZ = Math.floor(hiresViewDistance / this.hires.tileSize.z);
	    var lowresX = Math.floor((x - this.lowres.translate.x) / this.lowres.tileSize.x);
	    var lowresZ = Math.floor((z - this.lowres.translate.z) / this.lowres.tileSize.z);
	    var lowresViewX = Math.floor(lowresViewDistance / this.lowres.tileSize.x);
	    var lowresViewZ = Math.floor(lowresViewDistance / this.lowres.tileSize.z);
	    this.hiresTileManager.loadAroundTile(hiresX, hiresZ, hiresViewX, hiresViewZ);
	    this.lowresTileManager.loadAroundTile(lowresX, lowresZ, lowresViewX, lowresViewZ);
	  }
	  /**
	   * Loads the settings.json file for this map
	   * @returns {Promise<Object>}
	   */
	  ;

	  _proto.loadSettingsFile = function loadSettingsFile() {
	    var _this3 = this;

	    return new Promise(function (resolve, reject) {
	      alert(_this3.events, "Loading settings for map '" + _this3.id + "'...", "fine");
	      var loader = new three.FileLoader();
	      loader.setResponseType("json");
	      loader.load(_this3.dataUrl + "../settings.json", function (settings) {
	        if (settings.maps && settings.maps[_this3.id]) {
	          resolve(settings.maps[_this3.id]);
	        } else {
	          reject("the settings.json does not contain informations for map: " + _this3.id);
	        }
	      }, function () {}, function () {
	        return reject("Failed to load the settings.json for map: " + _this3.id);
	      });
	    });
	  }
	  /**
	   * Loads the textures.json file for this map
	   * @returns {Promise<Object>}
	   */
	  ;

	  _proto.loadTexturesFile = function loadTexturesFile() {
	    var _this4 = this;

	    return new Promise(function (resolve, reject) {
	      alert(_this4.events, "Loading textures for map '" + _this4.id + "'...", "fine");
	      var loader = new three.FileLoader();
	      loader.setResponseType("json");
	      loader.load(_this4.dataUrl + "../textures.json", resolve, function () {}, function () {
	        return reject("Failed to load the textures.json for map: " + _this4.id);
	      });
	    });
	  }
	  /**
	   * Creates a hires Material with the given textures
	   * @param vertexShader
	   * @param fragmentShader
	   * @param uniforms
	   * @param textures the textures
	   * @returns {ShaderMaterial[]} the hires Material (array because its a multi-material)
	   */
	  ;

	  _proto.createHiresMaterial = function createHiresMaterial(vertexShader, fragmentShader, uniforms, textures) {
	    var materials = [];
	    if (!Array.isArray(textures.textures)) throw new Error("Invalid texture.json: 'textures' is not an array!");

	    for (var i = 0; i < textures.textures.length; i++) {
	      var textureSettings = textures.textures[i];
	      var color = textureSettings.color;

	      if (!Array.isArray(color) || color.length < 4) {
	        color = [0, 0, 0, 0];
	      }

	      var opaque = color[3] === 1;
	      var transparent = !!textureSettings.transparent;
	      var texture = new three.Texture();
	      texture.image = stringToImage(textureSettings.texture);
	      texture.anisotropy = 1;
	      texture.generateMipmaps = opaque || transparent;
	      texture.magFilter = three.NearestFilter;
	      texture.minFilter = texture.generateMipmaps ? three.NearestMipMapLinearFilter : three.NearestFilter;
	      texture.wrapS = three.ClampToEdgeWrapping;
	      texture.wrapT = three.ClampToEdgeWrapping;
	      texture.flipY = false;
	      texture.flatShading = true;
	      texture.needsUpdate = true;
	      this.loadedTextures.push(texture);
	      var material = new three.ShaderMaterial({
	        uniforms: _extends({}, uniforms, {
	          textureImage: {
	            type: 't',
	            value: texture
	          }
	        }),
	        vertexShader: vertexShader,
	        fragmentShader: fragmentShader,
	        transparent: transparent,
	        depthWrite: true,
	        depthTest: true,
	        vertexColors: three.VertexColors,
	        side: three.FrontSide,
	        wireframe: false
	      });
	      material.needsUpdate = true;
	      materials[i] = material;
	    }

	    return materials;
	  }
	  /**
	   * Creates a lowres Material
	   * @returns {ShaderMaterial} the hires Material
	   */
	  ;

	  _proto.createLowresMaterial = function createLowresMaterial(vertexShader, fragmentShader, uniforms) {
	    return new three.ShaderMaterial({
	      uniforms: uniforms,
	      vertexShader: vertexShader,
	      fragmentShader: fragmentShader,
	      transparent: false,
	      depthWrite: true,
	      depthTest: true,
	      vertexColors: three.VertexColors,
	      side: three.FrontSide,
	      wireframe: false
	    });
	  };

	  _proto.unload = function unload() {
	    if (this.hiresTileManager) this.hiresTileManager.unload();
	    this.hiresTileManager = null;
	    if (this.lowresTileManager) this.lowresTileManager.unload();
	    this.lowresTileManager = null;
	    if (this.hiresMaterial) this.hiresMaterial.forEach(function (material) {
	      return material.dispose();
	    });
	    this.hiresMaterial = null;
	    if (this.lowresMaterial) this.lowresMaterial.dispose();
	    this.lowresMaterial = null;
	    this.loadedTextures.forEach(function (texture) {
	      return texture.dispose();
	    });
	    this.loadedTextures = [];
	    this.markerManager.dispose();
	  }
	  /**
	   * Ray-traces and returns the terrain-height at a specific location, returns <code>false</code> if there is no map-tile loaded at that location
	   * @param x
	   * @param z
	   * @returns {boolean|number}
	   */
	  ;

	  _proto.terrainHeightAt = function terrainHeightAt(x, z) {
	    if (!this.isLoaded) return false;
	    this.raycaster.set(new three.Vector3(x, 300, z), // ray-start
	    new three.Vector3(0, -1, 0) // ray-direction
	    );
	    this.raycaster.near = 1;
	    this.raycaster.far = 300;
	    this.raycaster.layers.enableAll();
	    var hiresTileHash = hashTile(Math.floor((x - this.hires.translate.x) / this.hires.tileSize.x), Math.floor((z - this.hires.translate.z) / this.hires.tileSize.z));
	    var tile = this.hiresTileManager.tiles[hiresTileHash];

	    if (!tile || !tile.model) {
	      var lowresTileHash = hashTile(Math.floor((x - this.lowres.translate.x) / this.lowres.tileSize.x), Math.floor((z - this.lowres.translate.z) / this.lowres.tileSize.z));
	      tile = this.lowresTileManager.tiles[lowresTileHash];
	    }

	    if (!tile || !tile.model) {
	      return false;
	    }

	    try {
	      var intersects = this.raycaster.intersectObjects([tile.model]);

	      if (intersects.length > 0) {
	        return intersects[0].point.y;
	      }
	    } catch (err) {
	      return false;
	    }
	  };

	  _proto.dispose = function dispose() {
	    this.unload();
	  };

	  _createClass(Map, [{
	    key: "isLoaded",
	    get: function get() {
	      return !!(this.hiresMaterial && this.lowresMaterial);
	    }
	  }]);

	  return Map;
	}();

	var SKY_FRAGMENT_SHADER = "\nuniform float sunlight;\nuniform float ambientLight;\nuniform vec3 skyColor;\n\nvarying vec3 vPosition;\n\nvoid main() {\n\tfloat horizonWidth = 0.005;\n\tfloat horizonHeight = 0.0;\n\t\n\tvec4 color = vec4(skyColor * max(sunlight, ambientLight), 1.0);\n\tfloat voidMultiplier = (clamp(vPosition.y - horizonHeight, -horizonWidth, horizonWidth) + horizonWidth) / (horizonWidth * 2.0);\n\tcolor.rgb *= voidMultiplier;\n\n\tgl_FragColor = color;\n}\n";

	var SKY_VERTEX_SHADER = "\nvarying vec3 vPosition;\nvoid main() {\n\tvPosition = position;\n\t\n\tgl_Position = \n\t\tprojectionMatrix *\n\t\tmodelViewMatrix *\n\t\tvec4(position, 1);\n}\n";

	var SkyboxScene = /*#__PURE__*/function (_Scene) {
	  _inheritsLoose(SkyboxScene, _Scene);

	  function SkyboxScene() {
	    var _this;

	    _this = _Scene.call(this) || this;
	    _this.autoUpdate = false;
	    Object.defineProperty(_assertThisInitialized(_this), 'isSkyboxScene', {
	      value: true
	    });
	    _this.UNIFORM_sunlight = {
	      value: 1
	    };
	    _this.UNIFORM_skyColor = {
	      value: new three.Vector3(0.5, 0.5, 1)
	    };
	    _this.UNIFORM_ambientLight = {
	      value: 0
	    };
	    var geometry = new three.SphereGeometry(1, 40, 5);
	    var material = new three.ShaderMaterial({
	      uniforms: {
	        sunlight: _this.UNIFORM_sunlight,
	        skyColor: _this.UNIFORM_skyColor,
	        ambientLight: _this.UNIFORM_ambientLight
	      },
	      vertexShader: SKY_VERTEX_SHADER,
	      fragmentShader: SKY_FRAGMENT_SHADER,
	      side: three.BackSide
	    });
	    var skybox = new three.Mesh(geometry, material);

	    _this.add(skybox);

	    return _this;
	  }

	  _createClass(SkyboxScene, [{
	    key: "sunlight",
	    get: function get() {
	      return this.UNIFORM_sunlight.value;
	    },
	    set: function set(strength) {
	      this.UNIFORM_sunlight.value = strength;
	    }
	  }, {
	    key: "skyColor",
	    get: function get() {
	      return this.UNIFORM_skyColor.value;
	    },
	    set: function set(color) {
	      this.UNIFORM_skyColor.value = color;
	    }
	  }, {
	    key: "ambientLight",
	    get: function get() {
	      return this.UNIFORM_ambientLight.value;
	    },
	    set: function set(strength) {
	      this.UNIFORM_ambientLight.value = strength;
	    }
	  }]);

	  return SkyboxScene;
	}(three.Scene);

	var ControlsManager = /*#__PURE__*/function () {
	  function ControlsManager(mapViewer, camera) {
	    Object.defineProperty(this, 'isControlsManager', {
	      value: true
	    });
	    this.mapViewer = mapViewer;
	    this.camera = camera;
	    this.positionValue = new three.Vector3(0, 0, 0);
	    this.rotationValue = 0;
	    this.angleValue = 0;
	    this.distanceValue = 500;
	    this.orthoValue = 0;
	    this.valueChanged = true;
	    this.lastMapUpdatePosition = this.positionValue.clone();
	    this.controlsValue = null;
	    this.updateCamera();
	  }

	  var _proto = ControlsManager.prototype;

	  _proto.update = function update(deltaTime, map) {
	    if (deltaTime > 50) deltaTime = 50; // assume min 20 UPS

	    if (this.controlsValue && typeof this.controlsValue.update === "function") this.controlsValue.update(deltaTime, map);
	  };

	  _proto.updateCamera = function updateCamera() {
	    if (this.valueChanged) {
	      // prevent problems with the rotation when the angle is 0 (top-down) or distance is 0 (first-person)
	      var rotatableAngle = this.angleValue;
	      if (Math.abs(rotatableAngle) <= 0.0001) rotatableAngle = 0.0001;
	      var rotatableDistance = this.distanceValue;
	      if (Math.abs(rotatableDistance) <= 0.0001) rotatableDistance = -0.0001; // fix distance for ortho-effect

	      if (this.orthoValue > 0) {
	        rotatableDistance = three.MathUtils.lerp(rotatableDistance, Math.max(rotatableDistance, 300), Math.pow(this.orthoValue, 8));
	      } // calculate rotationVector


	      var rotationVector = new three.Vector3(Math.sin(this.rotationValue), 0, -Math.cos(this.rotationValue)); // 0 is towards north

	      var angleRotationAxis = new three.Vector3(0, 1, 0).cross(rotationVector);
	      rotationVector.applyAxisAngle(angleRotationAxis, Math.PI / 2 - rotatableAngle);
	      rotationVector.multiplyScalar(rotatableDistance); // position camera

	      this.camera.position.copy(this.positionValue).sub(rotationVector);
	      this.camera.lookAt(this.positionValue); // update ortho

	      this.camera.distance = this.distanceValue;
	      this.camera.ortho = this.orthoValue; // optimize far/near planes

	      if (this.orthoValue <= 0) {
	        var near = three.MathUtils.clamp(this.distanceValue / 1000, 0.01, 1);
	        var far = three.MathUtils.clamp(this.distanceValue * 2, Math.max(near + 1, 2000), this.distanceValue + 5000);
	        if (far - near > 10000) near = far - 10000;
	        this.camera.near = near;
	        this.camera.far = far;
	      } else {
	        this.camera.near = 1;
	        this.camera.far = rotatableDistance + 300;
	      } // event


	      dispatchEvent(this.mapViewer.events, "bluemapCameraMoved", {
	        controlsManager: this,
	        camera: this.camera
	      });
	    } // if the position changed, update map to show new position


	    if (this.mapViewer.map) {
	      var triggerDistance = 1;

	      if (this.valueChanged) {
	        triggerDistance = this.mapViewer.loadedHiresViewDistance * 0.8;
	      }

	      if (Math.abs(this.lastMapUpdatePosition.x - this.positionValue.x) >= triggerDistance || Math.abs(this.lastMapUpdatePosition.z - this.positionValue.z) >= triggerDistance) {
	        this.lastMapUpdatePosition = this.positionValue.clone();
	        this.mapViewer.loadMapArea(this.positionValue.x, this.positionValue.z);
	      }
	    }

	    this.valueChanged = false;
	  };

	  _proto.handleValueChange = function handleValueChange() {
	    this.valueChanged = true;
	  };

	  _createClass(ControlsManager, [{
	    key: "x",
	    get: function get() {
	      return this.positionValue.x;
	    },
	    set: function set(x) {
	      this.positionValue.x = x;
	      this.handleValueChange();
	    }
	  }, {
	    key: "y",
	    get: function get() {
	      return this.positionValue.y;
	    },
	    set: function set(y) {
	      this.positionValue.y = y;
	      this.handleValueChange();
	    }
	  }, {
	    key: "z",
	    get: function get() {
	      return this.positionValue.z;
	    },
	    set: function set(z) {
	      this.positionValue.z = z;
	      this.handleValueChange();
	    }
	  }, {
	    key: "position",
	    get: function get() {
	      return this.positionValue;
	    },
	    set: function set(position) {
	      this.position.copy(position);
	      this.handleValueChange();
	    }
	  }, {
	    key: "rotation",
	    get: function get() {
	      return this.rotationValue;
	    },
	    set: function set(rotation) {
	      this.rotationValue = rotation;
	      this.handleValueChange();
	    }
	  }, {
	    key: "angle",
	    get: function get() {
	      return this.angleValue;
	    },
	    set: function set(angle) {
	      this.angleValue = angle;
	      this.handleValueChange();
	    }
	  }, {
	    key: "distance",
	    get: function get() {
	      return this.distanceValue;
	    },
	    set: function set(distance) {
	      this.distanceValue = distance;
	      this.handleValueChange();
	    }
	  }, {
	    key: "ortho",
	    get: function get() {
	      return this.orthoValue;
	    },
	    set: function set(ortho) {
	      this.orthoValue = ortho;
	      this.handleValueChange();
	    }
	  }, {
	    key: "controls",
	    set: function set(controls) {
	      if (this.controlsValue && typeof this.controlsValue.stop === "function") this.controlsValue.stop();
	      this.controlsValue = controls;
	      if (this.controlsValue && typeof this.controlsValue.start === "function") this.controlsValue.start(this);
	    },
	    get: function get() {
	      return this.controlsValue;
	    }
	  }]);

	  return ControlsManager;
	}();

	var MapControls = /*#__PURE__*/function () {
	  function MapControls(rootElement, hammerLib, events) {
	    var _this = this;

	    if (events === void 0) {
	      events = null;
	    }

	    this.onKeyDown = function (evt) {
	      var key = evt.key || evt.keyCode;

	      for (var action in MapControls.KEYS) {
	        if (!MapControls.KEYS.hasOwnProperty(action)) continue;

	        if (MapControls.KEYS[action].includes(key)) {
	          _this.keyStates[action] = true;
	        }
	      }
	    };

	    this.onKeyUp = function (evt) {
	      var key = evt.key || evt.keyCode;

	      for (var action in MapControls.KEYS) {
	        if (!MapControls.KEYS.hasOwnProperty(action)) continue;

	        if (MapControls.KEYS[action].includes(key)) {
	          _this.keyStates[action] = false;
	        }
	      }
	    };

	    this.onWheel = function (evt) {
	      var delta = evt.deltaY;
	      if (evt.deltaMode === WheelEvent.DOM_DELTA_PIXEL) delta *= 0.01;
	      if (evt.deltaMode === WheelEvent.DOM_DELTA_LINE) delta *= 0.33;
	      _this.targetDistance *= Math.pow(1.5, delta);

	      _this.updateZoom();
	    };

	    this.onMouseDown = function (evt) {
	      if (_this.state !== MapControls.STATES.NONE) return;

	      if (MapControls.BUTTONS.MOVE.includes(evt.button)) {
	        _this.state = MapControls.STATES.MOVE;
	        evt.preventDefault();
	      }

	      if (MapControls.BUTTONS.ORBIT.includes(evt.button)) {
	        _this.state = MapControls.STATES.ORBIT;
	        evt.preventDefault();
	      }
	    };

	    this.onMouseMove = function (evt) {
	      _this.mouse.set(evt.clientX, evt.clientY);

	      if (_this.state !== MapControls.STATES.NONE) {
	        evt.preventDefault();
	      }
	    };

	    this.onMouseUp = function (evt) {
	      if (_this.state === MapControls.STATES.NONE) return;

	      if (MapControls.BUTTONS.MOVE.includes(evt.button)) {
	        if (_this.state === MapControls.STATES.MOVE) _this.state = MapControls.STATES.NONE;
	        evt.preventDefault();
	      }

	      if (MapControls.BUTTONS.ORBIT.includes(evt.button)) {
	        if (_this.state === MapControls.STATES.ORBIT) _this.state = MapControls.STATES.NONE;
	        evt.preventDefault();
	      }
	    };

	    this.onTouchDown = function (evt) {
	      if (evt.pointerType === "mouse") return;

	      _this.touchStart.set(_this.targetPosition.x, _this.targetPosition.z);

	      _this.state = MapControls.STATES.MOVE;
	    };

	    this.onTouchMove = function (evt) {
	      if (evt.pointerType === "mouse") return;
	      if (_this.state !== MapControls.STATES.MOVE) return;
	      var touchDelta = new three.Vector2(evt.deltaX, evt.deltaY);

	      if (touchDelta.x !== 0 || touchDelta.y !== 0) {
	        touchDelta.rotateAround(MapControls.VECTOR2_ZERO, _this.controls.rotation);
	        _this.targetPosition.x = _this.touchStart.x - touchDelta.x * _this.targetDistance / _this.rootElement.clientHeight * 1.5;
	        _this.targetPosition.z = _this.touchStart.y - touchDelta.y * _this.targetDistance / _this.rootElement.clientHeight * 1.5;
	      }
	    };

	    this.onTouchUp = function (evt) {
	      if (evt.pointerType === "mouse") return;
	      _this.state = MapControls.STATES.NONE;
	    };

	    this.onTouchTiltDown = function () {
	      _this.touchTiltStart = _this.targetAngle;
	      _this.state = MapControls.STATES.ORBIT;
	    };

	    this.onTouchTiltMove = function (evt) {
	      if (_this.state !== MapControls.STATES.ORBIT) return;
	      _this.targetAngle = _this.touchTiltStart - evt.deltaY / _this.rootElement.clientHeight * Math.PI;
	      _this.targetAngle = three.MathUtils.clamp(_this.targetAngle, _this.minAngle, _this.maxAngleForZoom + 0.1);
	    };

	    this.onTouchTiltUp = function () {
	      _this.state = MapControls.STATES.NONE;
	    };

	    this.onTouchRotateDown = function (evt) {
	      _this.lastTouchRotation = evt.rotation;
	      _this.state = MapControls.STATES.ORBIT;
	    };

	    this.onTouchRotateMove = function (evt) {
	      if (_this.state !== MapControls.STATES.ORBIT) return;
	      var delta = evt.rotation - _this.lastTouchRotation;
	      _this.lastTouchRotation = evt.rotation;
	      if (delta > 180) delta -= 360;
	      if (delta < -180) delta += 360;
	      _this.targetRotation -= delta * (Math.PI / 180) * 1.4;

	      _this.wrapRotation();
	    };

	    this.onTouchRotateUp = function () {
	      _this.state = MapControls.STATES.NONE;
	    };

	    this.onTouchZoomDown = function () {
	      _this.touchZoomStart = _this.targetDistance;
	    };

	    this.onTouchZoomMove = function (evt) {
	      _this.targetDistance = _this.touchZoomStart / evt.scale;

	      _this.updateZoom();
	    };

	    this.onContextMenu = function (evt) {
	      evt.preventDefault();
	    };

	    Object.defineProperty(this, 'isMapControls', {
	      value: true
	    });
	    this.rootElement = rootElement;
	    this.hammer = hammerLib;
	    this.events = events;
	    this.controls = null;
	    this.targetPosition = new three.Vector3();
	    this.positionTerrainHeight = false;
	    this.targetDistance = 400;
	    this.minDistance = 10;
	    this.maxDistance = 10000;
	    this.targetRotation = 0;
	    this.targetAngle = 0;
	    this.minAngle = 0;
	    this.maxAngle = Math.PI / 2;
	    this.maxAngleForZoom = this.maxAngle;
	    this.state = MapControls.STATES.NONE;
	    this.mouse = new three.Vector2();
	    this.lastMouse = new three.Vector2();
	    this.keyStates = {};
	    this.touchStart = new three.Vector2();
	    this.touchTiltStart = 0;
	    this.lastTouchRotation = 0;
	    this.touchZoomStart = 0;
	  }

	  var _proto = MapControls.prototype;

	  _proto.start = function start(controls) {
	    this.controls = controls;
	    this.targetPosition.copy(this.controls.position);
	    this.positionTerrainHeight = false;
	    this.targetDistance = this.controls.distance;
	    this.targetDistance = three.MathUtils.clamp(this.targetDistance, this.minDistance, this.maxDistance);
	    this.targetRotation = this.controls.rotation;
	    this.targetAngle = this.controls.angle;
	    this.updateZoom(); // add events

	    this.rootElement.addEventListener("wheel", this.onWheel, {
	      passive: true
	    });
	    this.hammer.on('zoomstart', this.onTouchZoomDown);
	    this.hammer.on('zoommove', this.onTouchZoomMove);
	    this.rootElement.addEventListener('mousedown', this.onMouseDown);
	    window.addEventListener('mousemove', this.onMouseMove);
	    window.addEventListener('mouseup', this.onMouseUp);
	    window.addEventListener('keydown', this.onKeyDown);
	    window.addEventListener('keyup', this.onKeyUp);
	    this.hammer.on('movestart', this.onTouchDown);
	    this.hammer.on('movemove', this.onTouchMove);
	    this.hammer.on('moveend', this.onTouchUp);
	    this.hammer.on('movecancel', this.onTouchUp);
	    this.hammer.on('tiltstart', this.onTouchTiltDown);
	    this.hammer.on('tiltmove', this.onTouchTiltMove);
	    this.hammer.on('tiltend', this.onTouchTiltUp);
	    this.hammer.on('tiltcancel', this.onTouchTiltUp);
	    this.hammer.on('rotatestart', this.onTouchRotateDown);
	    this.hammer.on('rotatemove', this.onTouchRotateMove);
	    this.hammer.on('rotateend', this.onTouchRotateUp);
	    this.hammer.on('rotatecancel', this.onTouchRotateUp);
	    window.addEventListener('contextmenu', this.onContextMenu);
	  };

	  _proto.stop = function stop() {
	    // remove events
	    this.rootElement.removeEventListener("wheel", this.onWheel);
	    this.hammer.off('zoomstart', this.onTouchZoomDown);
	    this.hammer.off('zoommove', this.onTouchZoomMove);
	    this.rootElement.addEventListener('mousedown', this.onMouseDown);
	    window.removeEventListener('mousemove', this.onMouseMove);
	    window.removeEventListener('mouseup', this.onMouseUp);
	    window.removeEventListener('keydown', this.onKeyDown);
	    window.removeEventListener('keyup', this.onKeyUp);
	    this.hammer.on('movestart', this.onTouchDown);
	    this.hammer.off('movemove', this.onTouchMove);
	    this.hammer.off('moveend', this.onTouchUp);
	    this.hammer.off('movecancel', this.onTouchUp);
	    this.hammer.off('tiltstart', this.onTouchTiltDown);
	    this.hammer.off('tiltmove', this.onTouchTiltMove);
	    this.hammer.off('tiltend', this.onTouchTiltUp);
	    this.hammer.off('tiltcancel', this.onTouchTiltUp);
	    this.hammer.off('rotatestart', this.onTouchRotateDown);
	    this.hammer.off('rotatemove', this.onTouchRotateMove);
	    this.hammer.off('rotateend', this.onTouchRotateUp);
	    this.hammer.off('rotatecancel', this.onTouchRotateUp);
	    window.removeEventListener('contextmenu', this.onContextMenu);
	  };

	  _proto.update = function update(deltaTime, map) {
	    // == process mouse movements ==
	    var deltaMouse = this.lastMouse.clone().sub(this.mouse);
	    var moveDelta = new three.Vector2(); // zoom keys

	    if (this.keyStates.ZOOM_IN) {
	      this.targetDistance *= 1 - 0.003 * deltaTime;
	      this.updateZoom();
	    }

	    if (this.keyStates.ZOOM_OUT) {
	      this.targetDistance *= 1 + 0.003 * deltaTime;
	      this.updateZoom();
	    } // move


	    if (this.state === MapControls.STATES.MOVE) {
	      moveDelta.copy(deltaMouse);
	    } else {
	      if (this.keyStates.UP) moveDelta.y -= 20;
	      if (this.keyStates.DOWN) moveDelta.y += 20;
	      if (this.keyStates.LEFT) moveDelta.x -= 20;
	      if (this.keyStates.RIGHT) moveDelta.x += 20;
	    }

	    if (moveDelta.x !== 0 || moveDelta.y !== 0) {
	      moveDelta.rotateAround(MapControls.VECTOR2_ZERO, this.controls.rotation);
	      this.targetPosition.set(this.targetPosition.x + moveDelta.x * this.targetDistance / this.rootElement.clientHeight * 1.5, this.targetPosition.y, this.targetPosition.z + moveDelta.y * this.targetDistance / this.rootElement.clientHeight * 1.5);
	      this.updatePositionTerrainHeight(map);
	    } else if (!this.positionTerrainHeight) {
	      this.updatePositionTerrainHeight(map);
	    } // tilt/pan


	    if (this.state === MapControls.STATES.ORBIT) {
	      if (deltaMouse.x !== 0) {
	        this.targetRotation -= deltaMouse.x / this.rootElement.clientHeight * Math.PI;
	        this.wrapRotation();
	      }

	      if (deltaMouse.y !== 0) {
	        this.targetAngle += deltaMouse.y / this.rootElement.clientHeight * Math.PI;
	        this.targetAngle = three.MathUtils.clamp(this.targetAngle, this.minAngle, this.maxAngleForZoom + 0.1);
	      }
	    }

	    if (this.targetAngle > this.maxAngleForZoom) this.targetAngle -= (this.targetAngle - this.maxAngleForZoom) * 0.3; // == Smoothly apply target values ==

	    var somethingChanged = false; // move

	    var deltaPosition = this.targetPosition.clone().sub(this.controls.position);

	    if (Math.abs(deltaPosition.x) > 0.01 || Math.abs(deltaPosition.y) > 0.001 || Math.abs(deltaPosition.z) > 0.01) {
	      this.controls.position = this.controls.position.add(deltaPosition.multiplyScalar(0.015 * deltaTime));
	      somethingChanged = true;
	    } // rotation


	    var deltaRotation = this.targetRotation - this.controls.rotation;

	    if (Math.abs(deltaRotation) > 0.0001) {
	      this.controls.rotation += deltaRotation * 0.015 * deltaTime;
	      somethingChanged = true;
	    } // angle


	    var deltaAngle = this.targetAngle - this.controls.angle;

	    if (Math.abs(deltaAngle) > 0.0001) {
	      this.controls.angle += deltaAngle * 0.015 * deltaTime;
	      somethingChanged = true;
	    } // zoom


	    var deltaDistance = this.targetDistance - this.controls.distance;

	    if (Math.abs(deltaDistance) > 0.001) {
	      this.controls.distance += deltaDistance * 0.01 * deltaTime;
	      somethingChanged = true;
	    } // == Adjust camera height to terrain ==


	    if (somethingChanged) {
	      var y = 0;

	      if (this.positionTerrainHeight !== false) {
	        y = this.targetPosition.y;
	        var deltaY = this.positionTerrainHeight - y;

	        if (Math.abs(deltaY) > 0.001) {
	          y += deltaY * 0.01 * deltaTime;
	        }
	      }

	      var minCameraHeight = map.terrainHeightAt(this.controls.camera.position.x, this.controls.camera.position.z) + (this.minDistance - this.targetDistance) * 0.4 + 1;
	      if (minCameraHeight > y) y = minCameraHeight;
	      this.targetPosition.y = y;
	    } // == Fix NaN's as a fail-safe ==


	    if (isNaN(this.targetPosition.x)) {
	      alert(this.events, "Invalid targetPosition x: " + this.targetPosition.x, "warning");
	      this.targetPosition.x = 0;
	    }

	    if (isNaN(this.targetPosition.y)) {
	      alert(this.events, "Invalid targetPosition y: " + this.targetPosition.y, "warning");
	      this.targetPosition.y = 0;
	    }

	    if (isNaN(this.targetPosition.z)) {
	      alert(this.events, "Invalid targetPosition z: " + this.targetPosition.z, "warning");
	      this.targetPosition.z = 0;
	    }

	    if (isNaN(this.targetDistance)) {
	      alert(this.events, "Invalid targetDistance: " + this.targetDistance, "warning");
	      this.targetDistance = this.minDistance;
	    }

	    if (isNaN(this.targetRotation)) {
	      alert(this.events, "Invalid targetRotation: " + this.targetRotation, "warning");
	      this.targetRotation = 0;
	    }

	    if (isNaN(this.targetAngle)) {
	      alert(this.events, "Invalid targetAngle: " + this.targetAngle, "warning");
	      this.targetAngle = this.minAngle;
	    } // == Remember last processed state ==


	    this.lastMouse.copy(this.mouse);
	  };

	  _proto.updateZoom = function updateZoom() {
	    this.targetDistance = three.MathUtils.clamp(this.targetDistance, this.minDistance, this.maxDistance);
	    this.updateMaxAngleForZoom();
	    this.targetAngle = three.MathUtils.clamp(this.targetAngle, this.minAngle, this.maxAngleForZoom);
	  };

	  _proto.updateMaxAngleForZoom = function updateMaxAngleForZoom() {
	    this.maxAngleForZoom = three.MathUtils.clamp((1 - Math.pow((this.targetDistance - this.minDistance) / (500 - this.minDistance), 0.5)) * this.maxAngle, this.minAngle, this.maxAngle);
	  };

	  _proto.updatePositionTerrainHeight = function updatePositionTerrainHeight(map) {
	    this.positionTerrainHeight = map.terrainHeightAt(this.targetPosition.x, this.targetPosition.z);
	  };

	  _proto.wrapRotation = function wrapRotation() {
	    while (this.targetRotation >= Math.PI) {
	      this.targetRotation -= Math.PI * 2;
	      this.controls.rotation -= Math.PI * 2;
	    }

	    while (this.targetRotation <= -Math.PI) {
	      this.targetRotation += Math.PI * 2;
	      this.controls.rotation += Math.PI * 2;
	    }
	  };

	  return MapControls;
	}();
	MapControls.STATES = {
	  NONE: 0,
	  MOVE: 1,
	  ORBIT: 2
	};
	MapControls.KEYS = {
	  LEFT: ["ArrowLeft", "a", "A", 37, 65],
	  UP: ["ArrowUp", "w", "W", 38, 87],
	  RIGHT: ["ArrowRight", "d", "D", 39, 68],
	  DOWN: ["ArrowDown", "s", "S", 40, 83],
	  ZOOM_IN: ["+"],
	  ZOOM_OUT: ["-"]
	};
	MapControls.BUTTONS = {
	  ORBIT: [three.MOUSE.RIGHT],
	  MOVE: [three.MOUSE.LEFT]
	};
	MapControls.VECTOR2_ZERO = new three.Vector2(0, 0);

	/**
	 * Taken from https://github.com/mrdoob/three.js/blob/master/examples/jsm/libs/stats.module.js
	 */
	var Stats = function Stats() {
	  var mode = 0;
	  var container = document.createElement('div');
	  container.style.cssText = 'position:absolute;bottom:5px;right:5px;cursor:pointer;opacity:0.9;z-index:10000';
	  container.addEventListener('click', function (event) {
	    event.preventDefault();
	    showPanel(++mode % container.children.length);
	  }, false); //

	  function addPanel(panel) {
	    container.appendChild(panel.dom);
	    return panel;
	  }

	  function showPanel(id) {
	    for (var i = 0; i < container.children.length; i++) {
	      container.children[i].style.display = i === id ? 'block' : 'none';
	    }

	    mode = id;
	  }

	  function hide() {
	    showPanel(-1);
	  } //


	  var beginTime = (performance || Date).now(),
	      prevTime = beginTime,
	      frames = 0;
	  var prevFrameTime = beginTime;
	  var fpsPanel = addPanel(new Stats.Panel('FPS', '#0ff', '#002'));
	  var msPanel = addPanel(new Stats.Panel('MS (render)', '#0f0', '#020'));
	  var lastFrameMsPanel = addPanel(new Stats.Panel('MS (all)', '#f80', '#210'));
	  var memPanel = null;

	  if (self.performance && self.performance.memory) {
	    memPanel = addPanel(new Stats.Panel('MB', '#f08', '#201'));
	  }

	  showPanel(0);
	  return {
	    REVISION: 16,
	    dom: container,
	    addPanel: addPanel,
	    showPanel: showPanel,
	    hide: hide,
	    begin: function begin() {
	      beginTime = (performance || Date).now();
	    },
	    end: function end() {
	      frames++;
	      var time = (performance || Date).now();
	      msPanel.update(time - beginTime, 200);
	      lastFrameMsPanel.update(time - prevFrameTime, 200);

	      if (time >= prevTime + 1000) {
	        fpsPanel.update(frames * 1000 / (time - prevTime), 100);
	        prevTime = time;
	        frames = 0;

	        if (memPanel) {
	          var memory = performance.memory;
	          memPanel.update(memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576);
	        }
	      }

	      return time;
	    },
	    update: function update() {
	      beginTime = this.end();
	      prevFrameTime = beginTime;
	    },
	    // Backwards Compatibility
	    domElement: container,
	    setMode: showPanel
	  };
	};

	Stats.Panel = function (name, fg, bg) {
	  var min = Infinity,
	      max = 0,
	      round = Math.round;
	  var PR = round(window.devicePixelRatio || 1);
	  var WIDTH = 160 * PR,
	      HEIGHT = 96 * PR,
	      TEXT_X = 3 * PR,
	      TEXT_Y = 3 * PR,
	      GRAPH_X = 3 * PR,
	      GRAPH_Y = 15 * PR,
	      GRAPH_WIDTH = 154 * PR,
	      GRAPH_HEIGHT = 77 * PR;
	  var canvas = document.createElement('canvas');
	  canvas.width = WIDTH;
	  canvas.height = HEIGHT;
	  canvas.style.cssText = 'width:160px;height:96px';
	  var context = canvas.getContext('2d');
	  context.font = 'bold ' + 9 * PR + 'px Helvetica,Arial,sans-serif';
	  context.textBaseline = 'top';
	  context.fillStyle = bg;
	  context.fillRect(0, 0, WIDTH, HEIGHT);
	  context.fillStyle = fg;
	  context.fillText(name, TEXT_X, TEXT_Y);
	  context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
	  context.fillStyle = bg;
	  context.globalAlpha = 0.9;
	  context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
	  return {
	    dom: canvas,
	    update: function update(value, maxValue) {
	      min = Math.min(min, value);
	      max = Math.max(max, value);
	      context.fillStyle = bg;
	      context.globalAlpha = 1;
	      context.fillRect(0, 0, WIDTH, GRAPH_Y);
	      context.fillStyle = fg;
	      context.fillText(round(value) + ' ' + name + ' (' + round(min) + '-' + round(max) + ')', TEXT_X, TEXT_Y);
	      context.drawImage(canvas, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT);
	      context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT);
	      context.fillStyle = bg;
	      context.globalAlpha = 0.9;
	      context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round((1 - value / maxValue) * GRAPH_HEIGHT));
	    }
	  };
	};

	/*
	 * This file is part of BlueMap, licensed under the MIT License (MIT).
	 *
	 * Copyright (c) Blue (Lukas Rieger) <https://bluecolored.de>
	 * Copyright (c) contributors
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the 'Software'), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 */
	var HIRES_VERTEX_SHADER = "\n#include <common>\n" + three.ShaderChunk.logdepthbuf_pars_vertex + "\n\nattribute float ao;\nattribute float sunlight;\nattribute float blocklight;\n\nvarying vec3 vPosition;\nvarying vec3 vWorldPosition;\nvarying vec3 vNormal;\nvarying vec2 vUv;\nvarying vec3 vColor;\nvarying float vAo;\nvarying float vSunlight;\nvarying float vBlocklight;\n\nvoid main() {\n\tvPosition = position;\n\tvWorldPosition = (modelMatrix * vec4(position, 1)).xyz;\n\tvNormal = normal;\n\tvUv = uv;\n\tvColor = color;\n\tvAo = ao;\n\tvSunlight = sunlight;\n\tvBlocklight = blocklight;\n\t\n\tgl_Position = \n\t\tprojectionMatrix *\n\t\tviewMatrix *\n\t\tmodelMatrix *\n\t\tvec4(position, 1);\n\t\n\t" + three.ShaderChunk.logdepthbuf_vertex + " \n}\n";

	/*
	 * This file is part of BlueMap, licensed under the MIT License (MIT).
	 *
	 * Copyright (c) Blue (Lukas Rieger) <https://bluecolored.de>
	 * Copyright (c) contributors
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the 'Software'), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 */
	var HIRES_FRAGMENT_SHADER = "\n" + three.ShaderChunk.logdepthbuf_pars_fragment + "\n\nuniform sampler2D textureImage;\nuniform float sunlightStrength;\nuniform float ambientLight;\n\nvarying vec3 vPosition;\nvarying vec3 vWorldPosition;\nvarying vec3 vNormal;\nvarying vec2 vUv;\nvarying vec3 vColor;\nvarying float vAo;\nvarying float vSunlight;\nvarying float vBlocklight;\n\nvoid main() {\n\tvec4 color = texture(textureImage, vUv);\n\tif (color.a == 0.0) discard;\n\t\n\t//apply vertex-color\n\tcolor.rgb *= vColor.rgb;\n\n\t//apply ao\n\tcolor.rgb *= vAo;\n\t\n\t//apply light\n\tfloat light = mix(vBlocklight, max(vSunlight, vBlocklight), sunlightStrength);\n\tcolor.rgb *= mix(ambientLight, 1.0, light / 15.0);\n\t\n\tgl_FragColor = color;\n\t\n\t" + three.ShaderChunk.logdepthbuf_fragment + "\n}\n";

	/*
	 * This file is part of BlueMap, licensed under the MIT License (MIT).
	 *
	 * Copyright (c) Blue (Lukas Rieger) <https://bluecolored.de>
	 * Copyright (c) contributors
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the 'Software'), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 */
	var LOWRES_VERTEX_SHADER = "\n#include <common>\n" + three.ShaderChunk.logdepthbuf_pars_vertex + "\n\nvarying vec3 vPosition;\nvarying vec3 vWorldPosition;\nvarying vec3 vNormal;\nvarying vec2 vUv;\nvarying vec3 vColor;\n\nvoid main() {\n\tvPosition = position;\n\tvWorldPosition = (modelMatrix * vec4(position, 1)).xyz;\n\tvNormal = normal;\n\tvUv = uv;\n\tvColor = color;\n\t\n\tgl_Position = \n\t\tprojectionMatrix *\n\t\tviewMatrix *\n\t\tmodelMatrix *\n\t\tvec4(position, 1);\n\t\t\n\t" + three.ShaderChunk.logdepthbuf_vertex + "\n}\n";

	/*
	 * This file is part of BlueMap, licensed under the MIT License (MIT).
	 *
	 * Copyright (c) Blue (Lukas Rieger) <https://bluecolored.de>
	 * Copyright (c) contributors
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the 'Software'), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 */
	var LOWRES_FRAGMENT_SHADER = "\n" + three.ShaderChunk.logdepthbuf_pars_fragment + "\n\nstruct TileMap {\n\tsampler2D map;\n\tfloat size;\n\tvec2 scale;\n\tvec2 translate;\n\tvec2 pos; \n};\n\nuniform float sunlightStrength;\nuniform float ambientLight;\nuniform TileMap hiresTileMap;\n\nvarying vec3 vPosition;\nvarying vec3 vWorldPosition;\nvarying vec3 vNormal;\nvarying vec2 vUv;\nvarying vec3 vColor;\n\nvoid main() {\n\tfloat depth = gl_FragCoord.z / gl_FragCoord.w;\n\n\t//discard if hires tile is loaded at that position\n\tif (!isOrthographic && depth < 1900.0 && texture(hiresTileMap.map, ((vWorldPosition.xz - hiresTileMap.translate) / hiresTileMap.scale - hiresTileMap.pos) / hiresTileMap.size + 0.5).r >= 1.0) discard;\n\t\n\tvec4 color = vec4(vColor, 1.0);\n\n\tfloat diff = sqrt(max(dot(vNormal, vec3(0.3637, 0.7274, 0.5819)), 0.0)) * 0.4 + 0.6;\n\tcolor *= diff;\n\n\tcolor *= mix(sunlightStrength, 1.0, ambientLight);\n\n\tgl_FragColor = color;\n\t\n\t" + three.ShaderChunk.logdepthbuf_fragment + "\n}\n";

	var CombinedCamera = /*#__PURE__*/function (_PerspectiveCamera) {
	  _inheritsLoose(CombinedCamera, _PerspectiveCamera);

	  function CombinedCamera(fov, aspect, near, far, ortho) {
	    var _this;

	    _this = _PerspectiveCamera.call(this, fov, aspect, near, far) || this;
	    _this.ortho = ortho;
	    _this.distance = 1;
	    return _this;
	  }

	  var _proto = CombinedCamera.prototype;

	  _proto.updateProjectionMatrix = function updateProjectionMatrix() {
	    if (!this.ortographicProjection) this.ortographicProjection = new three.Matrix4();
	    if (!this.perspectiveProjection) this.perspectiveProjection = new three.Matrix4(); //copied from PerspectiveCamera

	    var near = this.near;
	    var top = near * Math.tan(three.MathUtils.DEG2RAD * 0.5 * this.fov) / this.zoom;
	    var height = 2 * top;
	    var width = this.aspect * height;
	    var left = -0.5 * width;
	    var view = this.view;

	    if (this.view !== null && this.view.enabled) {
	      var fullWidth = view.fullWidth,
	          fullHeight = view.fullHeight;
	      left += view.offsetX * width / fullWidth;
	      top -= view.offsetY * height / fullHeight;
	      width *= view.width / fullWidth;
	      height *= view.height / fullHeight;
	    }

	    var skew = this.filmOffset;
	    if (skew !== 0) left += near * skew / this.getFilmWidth(); // this part different to PerspectiveCamera

	    var normalizedOrtho = -Math.pow(this.ortho - 1, 4) + 1;
	    var orthoTop = this.distance * Math.tan(three.MathUtils.DEG2RAD * 0.5 * this.fov) / this.zoom;
	    var orthoHeight = 2 * orthoTop;
	    var orthoWidth = this.aspect * orthoHeight;
	    var orthoLeft = -0.5 * orthoWidth;
	    this.perspectiveProjection.makePerspective(left, left + width, top, top - height, near, this.far);
	    this.ortographicProjection.makeOrthographic(orthoLeft, orthoLeft + orthoWidth, orthoTop, orthoTop - orthoHeight, near, this.far);

	    for (var i = 0; i < 16; i++) {
	      this.projectionMatrix.elements[i] = this.perspectiveProjection.elements[i] * (1 - normalizedOrtho) + this.ortographicProjection.elements[i] * normalizedOrtho;
	    } // to here


	    this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
	  };

	  _createClass(CombinedCamera, [{
	    key: "isPerspectiveCamera",
	    get: function get() {
	      return this.ortho < 1;
	    }
	  }, {
	    key: "isOrthographicCamera",
	    get: function get() {
	      return !this.isPerspectiveCamera;
	    }
	  }, {
	    key: "type",
	    get: function get() {
	      return this.isPerspectiveCamera ? 'PerspectiveCamera' : 'OrthographicCamera';
	    },
	    set: function set(type) {//ignore
	    }
	  }]);

	  return CombinedCamera;
	}(three.PerspectiveCamera);

	var MapViewer = /*#__PURE__*/function () {
	  function MapViewer(element, dataUrl, liveApiUrl, events) {
	    var _this = this;

	    if (dataUrl === void 0) {
	      dataUrl = "data/";
	    }

	    if (liveApiUrl === void 0) {
	      liveApiUrl = "live/";
	    }

	    if (events === void 0) {
	      events = element;
	    }

	    this.handleContainerResize = function () {
	      _this.renderer.setSize(_this.rootElement.clientWidth, _this.rootElement.clientHeight);

	      _this.renderer.setPixelRatio(window.devicePixelRatio * _this.superSamplingValue);

	      _this.css2dRenderer.setSize(_this.rootElement.clientWidth, _this.rootElement.clientHeight);

	      _this.camera.aspect = _this.rootElement.clientWidth / _this.rootElement.clientHeight;

	      _this.camera.updateProjectionMatrix();
	    };

	    this.updateLoadedMapArea = function () {
	      if (!_this.map) return;

	      _this.map.loadMapArea(_this.loadedCenter.x, _this.loadedCenter.y, _this.loadedHiresViewDistance, _this.loadedLowresViewDistance);
	    };

	    this.renderLoop = function (now) {
	      requestAnimationFrame(_this.renderLoop); // calculate delta time

	      if (_this.lastFrame <= 0) {
	        _this.lastFrame = now;
	      }

	      var delta = now - _this.lastFrame;
	      _this.lastFrame = now; // update stats

	      _this.stats.begin(); // update controls


	      if (_this.map != null) {
	        _this.controlsManager.update(delta, _this.map);

	        _this.controlsManager.updateCamera();
	      } // render


	      _this.render(delta); // update stats


	      _this.stats.update();
	    };

	    Object.defineProperty(this, 'isMapViewer', {
	      value: true
	    });
	    this.rootElement = element;
	    this.events = events;
	    this.dataUrl = dataUrl;
	    this.liveApiUrl = liveApiUrl;
	    this.stats = new Stats();
	    this.stats.hide();
	    this.superSamplingValue = 1;
	    this.loadedCenter = new three.Vector2(0, 0);
	    this.loadedHiresViewDistance = 200;
	    this.loadedLowresViewDistance = 2000; // uniforms

	    this.uniforms = {
	      sunlightStrength: {
	        value: 1
	      },
	      ambientLight: {
	        value: 0
	      },
	      hiresTileMap: {
	        value: {
	          map: null,
	          size: TileManager.tileMapSize,
	          scale: new three.Vector2(1, 1),
	          translate: new three.Vector2(),
	          pos: new three.Vector2()
	        }
	      }
	    }; // renderer

	    this.renderer = new three.WebGLRenderer({
	      antialias: true,
	      sortObjects: true,
	      preserveDrawingBuffer: true,
	      logarithmicDepthBuffer: true
	    });
	    this.renderer.autoClear = false;
	    this.renderer.uniforms = this.uniforms; // CSS2D renderer

	    this.css2dRenderer = new CSS2DRenderer();
	    this.skyboxScene = new SkyboxScene();
	    this.camera = new CombinedCamera(75, 1, 0.1, 10000, 0);
	    this.skyboxCamera = new three.PerspectiveCamera(75, 1, 0.1, 10000);
	    this.hammer = new Hammer.Manager(this.rootElement);
	    this.initializeHammer();
	    this.controlsManager = new ControlsManager(this, this.camera);
	    this.controlsManager.controls = new MapControls(this.rootElement, this.hammer, this.events);
	    this.raycaster = new three.Raycaster();
	    this.raycaster.layers.enableAll();
	    this.raycaster.params.Line2 = {
	      threshold: 20
	    };
	    this.map = null;
	    this.lastFrame = 0; // initialize

	    this.initializeRootElement(); // handle some events

	    window.addEventListener("resize", this.handleContainerResize); // start render-loop

	    requestAnimationFrame(this.renderLoop);
	  }

	  var _proto = MapViewer.prototype;

	  _proto.initializeHammer = function initializeHammer() {
	    var touchTap = new Hammer.Tap({
	      event: 'tap',
	      pointers: 1,
	      taps: 1,
	      threshold: 2
	    });
	    var touchMove = new Hammer.Pan({
	      event: 'move',
	      direction: Hammer.DIRECTION_ALL,
	      threshold: 0
	    });
	    var touchTilt = new Hammer.Pan({
	      event: 'tilt',
	      direction: Hammer.DIRECTION_VERTICAL,
	      pointers: 2,
	      threshold: 0
	    });
	    var touchRotate = new Hammer.Rotate({
	      event: 'rotate',
	      pointers: 2,
	      threshold: 10
	    });
	    var touchZoom = new Hammer.Pinch({
	      event: 'zoom',
	      pointers: 2,
	      threshold: 0
	    });
	    touchTilt.recognizeWith(touchRotate);
	    touchTilt.recognizeWith(touchZoom);
	    touchRotate.recognizeWith(touchZoom);
	    this.hammer.add(touchTap);
	    this.hammer.add(touchMove);
	    this.hammer.add(touchTilt);
	    this.hammer.add(touchRotate);
	    this.hammer.add(touchZoom);
	  }
	  /**
	   * Initializes the root-element
	   */
	  ;

	  _proto.initializeRootElement = function initializeRootElement() {
	    var _this2 = this;

	    this.rootElement.innerHTML = "";
	    var outerDiv = htmlToElement("<div style=\"position: relative; width: 100%; height: 100%; overflow: hidden;\"></div>");
	    this.rootElement.appendChild(outerDiv);
	    /*this.rootElement.addEventListener('click', event => {
	    	let rootOffset = elementOffset(this.rootElement);
	    	this.handleMapInteraction(new Vector2(
	    		((event.pageX - rootOffset.top) / this.rootElement.clientWidth) * 2 - 1,
	    		-((event.pageY - rootOffset.left) / this.rootElement.clientHeight) * 2 + 1
	    	));
	    });*/

	    this.hammer.on('tap', function (event) {
	      var rootOffset = elementOffset(_this2.rootElement);

	      _this2.handleMapInteraction(new three.Vector2((event.center.x - rootOffset.top) / _this2.rootElement.clientWidth * 2 - 1, -((event.center.y - rootOffset.left) / _this2.rootElement.clientHeight) * 2 + 1));
	    }); // 3d-canvas

	    outerDiv.appendChild(this.renderer.domElement); // html-markers

	    this.css2dRenderer.domElement.style.position = 'absolute';
	    this.css2dRenderer.domElement.style.top = '0';
	    this.css2dRenderer.domElement.style.left = '0';
	    this.css2dRenderer.domElement.style.pointerEvents = 'none';
	    outerDiv.appendChild(this.css2dRenderer.domElement); // performance monitor

	    outerDiv.appendChild(this.stats.dom);
	    this.handleContainerResize();
	  }
	  /**
	   * Updates the render-resolution and aspect ratio based on the size of the root-element
	   */
	  ;

	  _proto.handleMapInteraction = function handleMapInteraction(screenPos, interactionType) {
	    if (interactionType === void 0) {
	      interactionType = MapViewer.InteractionType.LEFTCLICK;
	    }

	    if (this.map && this.map.isLoaded) {
	      this.raycaster.setFromCamera(screenPos, this.camera);
	      var lowresLayer = new three.Layers();
	      lowresLayer.set(2); // check marker interactions

	      var intersects = this.raycaster.intersectObjects([this.map.scene, this.map.markerManager.objectMarkerScene], true);
	      var covered = false;

	      for (var i = 0; i < intersects.length; i++) {
	        if (intersects[0].object) {
	          var marker = intersects[i].object.marker;

	          if (marker && marker._opacity > 0 && (!covered || !marker.depthTest)) {
	            marker.onClick(intersects[i].pointOnLine || intersects[i].point);
	            return;
	          } else if (!intersects[i].object.layers.test(lowresLayer)) {
	            covered = true;
	          }
	        }
	      }
	    }
	  };

	  /**
	   * Renders a frame
	   */
	  _proto.render = function render(delta) {
	    dispatchEvent(this.events, "bluemapRenderFrame", {
	      delta: delta
	    }); //prepare camera

	    this.camera.updateProjectionMatrix();
	    this.skyboxCamera.rotation.copy(this.camera.rotation);
	    this.skyboxCamera.updateProjectionMatrix(); //render

	    this.renderer.clear();
	    this.renderer.render(this.skyboxScene, this.skyboxCamera);
	    this.renderer.clearDepth();
	    /*
	    Layers:
	    0 - always visible objects
	    1 - hires layer
	    2 - lowres layer
	    */

	    if (this.map && this.map.isLoaded) {
	      //update uniforms
	      this.uniforms.hiresTileMap.value.pos.copy(this.map.hiresTileManager.centerTile);
	      this.camera.layers.set(2);
	      this.renderer.render(this.map.scene, this.camera);
	      this.renderer.clearDepth();
	      this.camera.layers.set(0);
	      if (this.controlsManager.distance < 2000) this.camera.layers.enable(1);
	      this.renderer.render(this.map.scene, this.camera);
	      this.renderer.render(this.map.markerManager.objectMarkerScene, this.camera);
	      this.css2dRenderer.render(this.map.markerManager.elementMarkerScene, this.camera);
	    }
	  }
	  /**
	   * Changes / Sets the map that will be loaded and displayed
	   * @param map
	   */
	  ;

	  _proto.setMap = function setMap(map) {
	    var _this3 = this;

	    if (map === void 0) {
	      map = null;
	    }

	    if (this.map && this.map.isMap) this.map.unload();
	    this.map = map;

	    if (this.map && this.map.isMap) {
	      return map.load(HIRES_VERTEX_SHADER, HIRES_FRAGMENT_SHADER, LOWRES_VERTEX_SHADER, LOWRES_FRAGMENT_SHADER, this.uniforms).then(function () {
	        _this3.skyboxScene.ambientLight = map.ambientLight;
	        _this3.skyboxScene.skyColor = map.skyColor;
	        _this3.uniforms.ambientLight.value = map.ambientLight;
	        _this3.uniforms.hiresTileMap.value.map = map.hiresTileManager.tileMap.texture;

	        _this3.uniforms.hiresTileMap.value.scale.set(map.hires.tileSize.x, map.hires.tileSize.z);

	        _this3.uniforms.hiresTileMap.value.translate.set(map.hires.translate.x, map.hires.translate.z);

	        setTimeout(_this3.updateLoadedMapArea);
	        dispatchEvent(_this3.events, "bluemapMapChanged", {
	          map: map
	        });
	      }).catch(function (error) {
	        alert(_this3.events, error, "error");
	      });
	    } else {
	      return Promise.resolve();
	    }
	  };

	  _proto.loadMapArea = function loadMapArea(centerX, centerZ, hiresViewDistance, lowresViewDistance) {
	    if (hiresViewDistance === void 0) {
	      hiresViewDistance = -1;
	    }

	    if (lowresViewDistance === void 0) {
	      lowresViewDistance = -1;
	    }

	    this.loadedCenter.set(centerX, centerZ);
	    if (hiresViewDistance >= 0) this.loadedHiresViewDistance = hiresViewDistance;
	    if (lowresViewDistance >= 0) this.loadedLowresViewDistance = lowresViewDistance;
	    this.updateLoadedMapArea();
	  };

	  // --------------------------

	  /**
	   * Applies a loaded settings-object (settings.json)
	   * @param settings
	   */
	  _proto.applySettings = function applySettings(settings) {
	    // reset maps
	    this.maps.forEach(function (map) {
	      return map.dispose();
	    });
	    this.maps = []; // create maps

	    if (settings.maps !== undefined) {
	      for (var mapId in settings.maps) {
	        if (!settings.maps.hasOwnProperty(mapId)) continue;
	        var mapSettings = settings.maps[mapId];
	        if (mapSettings.enabled) this.maps.push(new Map(mapId, this.dataUrl + mapId + "/", this.rootElement));
	      }
	    } // sort maps


	    this.maps.sort(function (map1, map2) {
	      var sort = settings.maps[map1.id].ordinal - settings.maps[map2.id].ordinal;
	      if (isNaN(sort)) return 0;
	      return sort;
	    });
	  };

	  _createClass(MapViewer, [{
	    key: "superSampling",
	    get: function get() {
	      return this.superSamplingValue;
	    },
	    set: function set(value) {
	      this.superSamplingValue = value;
	      this.handleContainerResize();
	    }
	  }]);

	  return MapViewer;
	}();
	MapViewer.InteractionType = {
	  LEFTCLICK: 0,
	  RIGHTCLICK: 1
	};

	/**
	 * Loads and returns a promise with an array of Maps loaded from that root-path.<br>
	 * <b>DONT FORGET TO dispose() ALL MAPS RETURNED BY THIS METHOD IF YOU DONT NEED THEM ANYMORE!</b>
	 * @param dataUrl
	 * @param events
	 * @returns {Promise<Map[]>}
	 */

	var loadMaps = function loadMaps(dataUrl, events) {
	  if (events === void 0) {
	    events = null;
	  }

	  function loadSettings() {
	    return new Promise(function (resolve, reject) {
	      var loader = new three.FileLoader();
	      loader.setResponseType("json");
	      loader.load(dataUrl + "settings.json", resolve, function () {}, function () {
	        return reject("Failed to load the settings.json!");
	      });
	    });
	  }

	  return loadSettings().then(function (settings) {
	    var maps = []; // create maps

	    if (settings.maps !== undefined) {
	      for (var mapId in settings.maps) {
	        if (!settings.maps.hasOwnProperty(mapId)) continue;
	        var mapSettings = settings.maps[mapId];
	        if (mapSettings.enabled) maps.push(new Map(mapId, dataUrl + mapId + "/", events));
	      }
	    } // sort maps


	    maps.sort(function (map1, map2) {
	      var sort = settings.maps[map1.id].ordinal - settings.maps[map2.id].ordinal;
	      if (isNaN(sort)) return 0;
	      return sort;
	    });
	    return maps;
	  });
	};

	exports.MapViewer = MapViewer;
	exports.alert = alert;
	exports.animate = animate;
	exports.dispatchEvent = dispatchEvent;
	exports.elementOffset = elementOffset;
	exports.hashTile = hashTile;
	exports.htmlToElement = htmlToElement;
	exports.htmlToElements = htmlToElements;
	exports.loadMaps = loadMaps;
	exports.pathFromCoords = pathFromCoords;
	exports.stringToImage = stringToImage;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmx1ZW1hcC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWwvVXRpbHMuanMiLCIuLi8uLi9zcmMvbWFwL1RpbGUuanMiLCIuLi8uLi9zcmMvbWFwL1RpbGVNYXAuanMiLCIuLi8uLi9zcmMvbWFwL1RpbGVNYW5hZ2VyLmpzIiwiLi4vLi4vc3JjL21hcC9UaWxlTG9hZGVyLmpzIiwiLi4vLi4vc3JjL21hcmtlcnMvTWFya2VyLmpzIiwiLi4vLi4vc3JjL3V0aWwvbGluZXMvTGluZU1hdGVyaWFsLmpzIiwiLi4vLi4vc3JjL3V0aWwvbGluZXMvTGluZVNlZ21lbnRzR2VvbWV0cnkuanMiLCIuLi8uLi9zcmMvdXRpbC9saW5lcy9MaW5lR2VvbWV0cnkuanMiLCIuLi8uLi9zcmMvdXRpbC9saW5lcy9MaW5lU2VnbWVudHMyLmpzIiwiLi4vLi4vc3JjL3V0aWwvbGluZXMvTGluZTIuanMiLCIuLi8uLi9zcmMvbWFya2Vycy9zaGFkZXIvTWFya2VyRmlsbEZyYWdtZW50U2hhZGVyLmpzIiwiLi4vLi4vc3JjL21hcmtlcnMvc2hhZGVyL01hcmtlckZpbGxWZXJ0ZXhTaGFkZXIuanMiLCIuLi8uLi9zcmMvbWFya2Vycy9TaGFwZU1hcmtlci5qcyIsIi4uLy4uL3NyYy9tYXJrZXJzL0xpbmVNYXJrZXIuanMiLCIuLi8uLi9zcmMvbWFya2Vycy9FeHRydWRlTWFya2VyLmpzIiwiLi4vLi4vc3JjL3V0aWwvQ1NTMkRSZW5kZXJlci5qcyIsIi4uLy4uL3NyYy9tYXJrZXJzL0hUTUxNYXJrZXIuanMiLCIuLi8uLi9zcmMvbWFya2Vycy9QT0lNYXJrZXIuanMiLCIuLi8uLi9zcmMvbWFya2Vycy9QbGF5ZXJNYXJrZXIuanMiLCIuLi8uLi9zcmMvbWFya2Vycy9NYXJrZXJTZXQuanMiLCIuLi8uLi9zcmMvbWFya2Vycy9NYXJrZXJNYW5hZ2VyLmpzIiwiLi4vLi4vc3JjL21hcC9NYXAuanMiLCIuLi8uLi9zcmMvc2t5Ym94L1NreUZyYWdtZW50U2hhZGVyLmpzIiwiLi4vLi4vc3JjL3NreWJveC9Ta3lWZXJ0ZXhTaGFkZXIuanMiLCIuLi8uLi9zcmMvc2t5Ym94L1NreWJveFNjZW5lLmpzIiwiLi4vLi4vc3JjL2NvbnRyb2xzL0NvbnRyb2xzTWFuYWdlci5qcyIsIi4uLy4uL3NyYy9jb250cm9scy9NYXBDb250cm9scy5qcyIsIi4uLy4uL3NyYy91dGlsL1N0YXRzLmpzIiwiLi4vLi4vc3JjL21hcC9oaXJlcy9IaXJlc1ZlcnRleFNoYWRlci5qcyIsIi4uLy4uL3NyYy9tYXAvaGlyZXMvSGlyZXNGcmFnbWVudFNoYWRlci5qcyIsIi4uLy4uL3NyYy9tYXAvbG93cmVzL0xvd3Jlc1ZlcnRleFNoYWRlci5qcyIsIi4uLy4uL3NyYy9tYXAvbG93cmVzL0xvd3Jlc0ZyYWdtZW50U2hhZGVyLmpzIiwiLi4vLi4vc3JjL3V0aWwvQ29tYmluZWRDYW1lcmEuanMiLCIuLi8uLi9zcmMvTWFwVmlld2VyLmpzIiwiLi4vLi4vc3JjL0JsdWVNYXAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIFRha2VzIGEgYmFzZTQ2IHN0cmluZyBhbmQgY29udmVydHMgaXQgaW50byBhbiBpbWFnZSBlbGVtZW50XHJcbiAqIEBwYXJhbSBzdHJpbmdcclxuICogQHJldHVybnMge0hUTUxFbGVtZW50fVxyXG4gKi9cclxuaW1wb3J0IHtNYXRoVXRpbHN9IGZyb20gXCJ0aHJlZVwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IHN0cmluZ1RvSW1hZ2UgPSBzdHJpbmcgPT4ge1xyXG4gICAgbGV0IGltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJywgJ2ltZycpO1xyXG4gICAgaW1hZ2Uuc3JjID0gc3RyaW5nO1xyXG4gICAgcmV0dXJuIGltYWdlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYW4gb3B0aW1pemVkIHBhdGggZnJvbSB4LHogY29vcmRpbmF0ZXMgdXNlZCBieSBibHVlbWFwIHRvIHNhdmUgdGlsZXNcclxuICogQHBhcmFtIHhcclxuICogQHBhcmFtIHpcclxuICogQHJldHVybnMge3N0cmluZ31cclxuICovXHJcbmV4cG9ydCBjb25zdCBwYXRoRnJvbUNvb3JkcyA9ICh4LCB6KSA9PiB7XHJcbiAgICBsZXQgcGF0aCA9ICd4JztcclxuICAgIHBhdGggKz0gc3BsaXROdW1iZXJUb1BhdGgoeCk7XHJcblxyXG4gICAgcGF0aCArPSAneic7XHJcbiAgICBwYXRoICs9IHNwbGl0TnVtYmVyVG9QYXRoKHopO1xyXG5cclxuICAgIHBhdGggPSBwYXRoLnN1YnN0cmluZygwLCBwYXRoLmxlbmd0aCAtIDEpO1xyXG5cclxuICAgIHJldHVybiBwYXRoO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNwbGl0cyBhIG51bWJlciBpbnRvIGFuIG9wdGltaXplZCBmb2xkZXItcGF0aCB1c2VkIHRvIHNhdmUgYmx1ZW1hcC10aWxlc1xyXG4gKiBAcGFyYW0gbnVtXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAqL1xyXG5jb25zdCBzcGxpdE51bWJlclRvUGF0aCA9IG51bSA9PiB7XHJcbiAgICBsZXQgcGF0aCA9ICcnO1xyXG5cclxuICAgIGlmIChudW0gPCAwKSB7XHJcbiAgICAgICAgbnVtID0gLW51bTtcclxuICAgICAgICBwYXRoICs9ICctJztcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcyA9IHBhcnNlSW50KG51bSkudG9TdHJpbmcoKTtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBwYXRoICs9IHMuY2hhckF0KGkpICsgJy8nO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBwYXRoO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEhhc2hlcyB0aWxlLWNvb3JkaW5hdGVzIHRvIGJlIHNhdmVkIGluIGEgbWFwXHJcbiAqIEBwYXJhbSB4XHJcbiAqIEBwYXJhbSB6XHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgaGFzaFRpbGUgPSAoeCwgeikgPT4gYHgke3h9eiR7en1gO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBEaXNwYXRjaGVzIGFuIGV2ZW50IHRvIHRoZSBlbGVtZW50IG9mIHRoaXMgbWFwLXZpZXdlclxyXG4gKiBAcGFyYW0gZWxlbWVudCB0aGUgZWxlbWVudCBvbiB0aGF0IHRoZSBldmVudCBpcyBkaXNwYXRjaGVkXHJcbiAqIEBwYXJhbSBldmVudFxyXG4gKiBAcGFyYW0gZGV0YWlsXHJcbiAqIEByZXR1cm5zIHt1bmRlZmluZWR8dm9pZHxib29sZWFufVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGRpc3BhdGNoRXZlbnQgPSAoZWxlbWVudCwgZXZlbnQsIGRldGFpbCA9IHt9KSA9PiB7XHJcbiAgICBpZiAoIWVsZW1lbnQgfHwgIWVsZW1lbnQuZGlzcGF0Y2hFdmVudCkgcmV0dXJuO1xyXG5cclxuICAgIHJldHVybiBlbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KGV2ZW50LCB7XHJcbiAgICAgICAgZGV0YWlsOiBkZXRhaWxcclxuICAgIH0pKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNlbmRzIGEgXCJibHVlbWFwQWxlcnRcIiBldmVudCB3aXRoIGEgbWVzc2FnZSBhbmQgYSBsZXZlbC5cclxuICogVGhlIGxldmVsIGNhbiBiZSBhbnl0aGluZywgYnV0IHRoZSBhcHAgdXNlcyB0aGUgbGV2ZWxzXHJcbiAqIC0gZGVidWdcclxuICogLSBmaW5lXHJcbiAqIC0gaW5mb1xyXG4gKiAtIHdhcm5pbmdcclxuICogLSBlcnJvclxyXG4gKiBAcGFyYW0gZWxlbWVudCB0aGUgZWxlbWVudCBvbiB0aGF0IHRoZSBldmVudCBpcyBkaXNwYXRjaGVkXHJcbiAqIEBwYXJhbSBtZXNzYWdlXHJcbiAqIEBwYXJhbSBsZXZlbFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGFsZXJ0ID0gKGVsZW1lbnQsIG1lc3NhZ2UsIGxldmVsID0gXCJpbmZvXCIpID0+IHtcclxuXHJcbiAgICAvLyBhbGVydCBldmVudFxyXG4gICAgbGV0IHByaW50VG9Db25zb2xlID0gZGlzcGF0Y2hFdmVudChlbGVtZW50LCBcImJsdWVtYXBBbGVydFwiLCB7XHJcbiAgICAgICAgbWVzc2FnZTogbWVzc2FnZSxcclxuICAgICAgICBsZXZlbDogbGV2ZWxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIGxvZyBhbGVydCB0byBjb25zb2xlXHJcbiAgICBpZiAocHJpbnRUb0NvbnNvbGUpIHtcclxuICAgICAgICBpZiAobGV2ZWwgPT09IFwiaW5mb1wiKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbQmx1ZU1hcC8ke2xldmVsfV1gLCBtZXNzYWdlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGxldmVsID09PSBcIndhcm5pbmdcIikge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFtCbHVlTWFwLyR7bGV2ZWx9XWAsIG1lc3NhZ2UpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobGV2ZWwgPT09IFwiZXJyb3JcIikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbQmx1ZU1hcC8ke2xldmVsfV1gLCBtZXNzYWdlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmRlYnVnKGBbQmx1ZU1hcC8ke2xldmVsfV1gLCBtZXNzYWdlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTb3VyY2U6IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzQ5NDE0My9jcmVhdGluZy1hLW5ldy1kb20tZWxlbWVudC1mcm9tLWFuLWh0bWwtc3RyaW5nLXVzaW5nLWJ1aWx0LWluLWRvbS1tZXRob2RzLW9yLXByby8zNTM4NTUxOCMzNTM4NTUxOFxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gaHRtbCByZXByZXNlbnRpbmcgYSBzaW5nbGUgZWxlbWVudFxyXG4gKiBAcmV0dXJuIHtFbGVtZW50fVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGh0bWxUb0VsZW1lbnQgPSBodG1sID0+IHtcclxuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJyk7XHJcbiAgICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSBodG1sLnRyaW0oKTtcclxuICAgIHJldHVybiB0ZW1wbGF0ZS5jb250ZW50LmZpcnN0Q2hpbGQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTb3VyY2U6IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzQ5NDE0My9jcmVhdGluZy1hLW5ldy1kb20tZWxlbWVudC1mcm9tLWFuLWh0bWwtc3RyaW5nLXVzaW5nLWJ1aWx0LWluLWRvbS1tZXRob2RzLW9yLXByby8zNTM4NTUxOCMzNTM4NTUxOFxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gaHRtbCByZXByZXNlbnRpbmcgYW55IG51bWJlciBvZiBzaWJsaW5nIGVsZW1lbnRzXHJcbiAqIEByZXR1cm4ge05vZGVMaXN0fVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGh0bWxUb0VsZW1lbnRzID0gaHRtbCA9PiB7XHJcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xyXG4gICAgdGVtcGxhdGUuaW5uZXJIVE1MID0gaHRtbDtcclxuICAgIHJldHVybiB0ZW1wbGF0ZS5jb250ZW50LmNoaWxkTm9kZXM7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTY2hlZHVsZXMgYW4gYW5pbWF0aW9uXHJcbiAqIEBwYXJhbSBkdXJhdGlvbk1zIHRoZSBkdXJhdGlvbiBvZiB0aGUgYW5pbWF0aW9uIGluIG1zXHJcbiAqIEBwYXJhbSBhbmltYXRpb25GcmFtZSBhIGZ1bmN0aW9uIHRoYXQgaXMgZ2V0dGluZyBjYWxsZWQgZWFjaCBmcmFtZSB3aXRoIHRoZSBwYXJhbWV0ZXJzIChwcm9ncmVzcyAoMC0xKSwgZGVsdGFUaW1lKVxyXG4gKiBAcGFyYW0gcG9zdEFuaW1hdGlvbiBhIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgb25jZSBhZnRlciB0aGUgYW5pbWF0aW9uIGlzIGZpbmlzaGVkIG9yIGNhbmNlbGxlZC4gVGhlIGZ1bmN0aW9uIGFjY2VwdHMgb25lIGJvb2wtcGFyYW1ldGVyIHdoZXRoZXIgdGhlIGFuaW1hdGlvbiB3YXMgZmluaXNoZWQgKHRydWUpIG9yIGNhbmNlbGVkIChmYWxzZSlcclxuICogQHJldHVybnMgdGhlIGFuaW1hdGlvbiBvYmplY3RcclxuICovXHJcbmV4cG9ydCBjb25zdCBhbmltYXRlID0gZnVuY3Rpb24gKGFuaW1hdGlvbkZyYW1lLCBkdXJhdGlvbk1zID0gMTAwMCwgcG9zdEFuaW1hdGlvbiA9IG51bGwpIHtcclxuICAgIGxldCBhbmltYXRpb24gPSB7XHJcbiAgICAgICAgYW5pbWF0aW9uU3RhcnQ6IC0xLFxyXG4gICAgICAgIGxhc3RGcmFtZTogLTEsXHJcbiAgICAgICAgY2FuY2VsbGVkOiBmYWxzZSxcclxuXHJcbiAgICAgICAgZnJhbWU6IGZ1bmN0aW9uICh0aW1lKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNhbmNlbGxlZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuYW5pbWF0aW9uU3RhcnQgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGlvblN0YXJ0ID0gdGltZTtcclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdEZyYW1lID0gdGltZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHByb2dyZXNzID0gTWF0aFV0aWxzLmNsYW1wKCh0aW1lIC0gdGhpcy5hbmltYXRpb25TdGFydCkgLyBkdXJhdGlvbk1zLCAwLCAxKTtcclxuICAgICAgICAgICAgbGV0IGRlbHRhVGltZSA9IHRpbWUgLSB0aGlzLmxhc3RGcmFtZTtcclxuXHJcbiAgICAgICAgICAgIGFuaW1hdGlvbkZyYW1lKHByb2dyZXNzLCBkZWx0YVRpbWUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHByb2dyZXNzIDwgMSkgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aW1lID0+IHRoaXMuZnJhbWUodGltZSkpO1xyXG4gICAgICAgICAgICBlbHNlIGlmIChwb3N0QW5pbWF0aW9uKSBwb3N0QW5pbWF0aW9uKHRydWUpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5sYXN0RnJhbWUgPSB0aW1lO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGNhbmNlbDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNhbmNlbGxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIGlmIChwb3N0QW5pbWF0aW9uKSBwb3N0QW5pbWF0aW9uKGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGltZSA9PiBhbmltYXRpb24uZnJhbWUodGltZSkpO1xyXG5cclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBvZmZzZXQgcG9zaXRpb24gb2YgYW4gZWxlbWVudFxyXG4gKlxyXG4gKiBTb3VyY2U6IGh0dHBzOi8vcGxhaW5qcy5jb20vamF2YXNjcmlwdC9zdHlsZXMvZ2V0LXRoZS1wb3NpdGlvbi1vZi1hbi1lbGVtZW50LXJlbGF0aXZlLXRvLXRoZS1kb2N1bWVudC0yNC9cclxuICpcclxuICogQHBhcmFtIGVsZW1lbnRcclxuICogQHJldHVybnMge3t0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyfX1cclxuICovXHJcbmV4cG9ydCBjb25zdCBlbGVtZW50T2Zmc2V0ID0gKGVsZW1lbnQpID0+IHtcclxuICAgIGxldCByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcclxuICAgICAgICBzY3JvbGxMZWZ0ID0gd2luZG93LnBhZ2VYT2Zmc2V0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0LFxyXG4gICAgICAgIHNjcm9sbFRvcCA9IHdpbmRvdy5wYWdlWU9mZnNldCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wO1xyXG4gICAgcmV0dXJuIHsgdG9wOiByZWN0LnRvcCArIHNjcm9sbFRvcCwgbGVmdDogcmVjdC5sZWZ0ICsgc2Nyb2xsTGVmdCB9XHJcbn1cclxuXHJcbiIsIi8qXHJcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIEJsdWVNYXAsIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZSAoTUlUKS5cclxuICpcclxuICogQ29weXJpZ2h0IChjKSBCbHVlIChMdWthcyBSaWVnZXIpIDxodHRwczovL2JsdWVjb2xvcmVkLmRlPlxyXG4gKiBDb3B5cmlnaHQgKGMpIGNvbnRyaWJ1dG9yc1xyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4gKlxyXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxyXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuICpcclxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxyXG4gKiBUSEUgU09GVFdBUkUuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGNsYXNzIFRpbGUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHgsIHosIG9uTG9hZCwgb25VbmxvYWQpIHtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHRoaXMsICdpc1RpbGUnLCB7IHZhbHVlOiB0cnVlIH0gKTtcclxuXHJcbiAgICAgICAgdGhpcy5tb2RlbCA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMub25Mb2FkID0gb25Mb2FkO1xyXG4gICAgICAgIHRoaXMub25VbmxvYWQgPSBvblVubG9hZDtcclxuXHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnogPSB6O1xyXG5cclxuICAgICAgICB0aGlzLnVubG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBsb2FkKHRpbGVMb2FkZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5sb2FkaW5nKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy51bmxvYWQoKTtcclxuXHJcbiAgICAgICAgdGhpcy51bmxvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgIHJldHVybiB0aWxlTG9hZGVyLmxvYWQodGhpcy54LCB0aGlzLnopXHJcbiAgICAgICAgICAgIC50aGVuKG1vZGVsID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnVubG9hZGVkKXtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbC5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcclxuICAgICAgICAgICAgICAgIHRoaXMub25Mb2FkKHRoaXMpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmluYWxseSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdW5sb2FkKCkge1xyXG4gICAgICAgIHRoaXMudW5sb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25VbmxvYWQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldCBsb2FkZWQoKSB7XHJcbiAgICAgICAgcmV0dXJuICEhdGhpcy5tb2RlbDtcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQge0NsYW1wVG9FZGdlV3JhcHBpbmcsIExpbmVhckZpbHRlciwgVGV4dHVyZX0gZnJvbSBcInRocmVlXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgVGlsZU1hcCB7XHJcblxyXG4gICAgc3RhdGljIEVNUFRZID0gXCIjMDAwXCI7XHJcbiAgICBzdGF0aWMgTE9BREVEID0gXCIjZmZmXCI7XHJcblxyXG4gICAgY29uc3RydWN0b3Iod2lkdGgsIGhlaWdodCkge1xyXG4gICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJywgJ2NhbnZhcycpO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG5cclxuICAgICAgICB0aGlzLnRpbGVNYXBDb250ZXh0ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnLCB7XHJcbiAgICAgICAgICAgIGFscGhhOiBmYWxzZSxcclxuICAgICAgICAgICAgd2lsbFJlYWRGcmVxdWVudGx5OiB0cnVlLFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnRleHR1cmUgPSBuZXcgVGV4dHVyZSh0aGlzLmNhbnZhcyk7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlLmdlbmVyYXRlTWlwbWFwcyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMudGV4dHVyZS5tYWdGaWx0ZXIgPSBMaW5lYXJGaWx0ZXI7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlLm1pbkZpbHRlciA9IExpbmVhckZpbHRlcjtcclxuICAgICAgICB0aGlzLnRleHR1cmUud3JhcFMgPSBDbGFtcFRvRWRnZVdyYXBwaW5nO1xyXG4gICAgICAgIHRoaXMudGV4dHVyZS53cmFwVCA9IENsYW1wVG9FZGdlV3JhcHBpbmc7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlLmZsaXBZID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRBbGwoc3RhdGUpIHtcclxuICAgICAgICB0aGlzLnRpbGVNYXBDb250ZXh0LmZpbGxTdHlsZSA9IHN0YXRlO1xyXG4gICAgICAgIHRoaXMudGlsZU1hcENvbnRleHQuZmlsbFJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcblxyXG4gICAgICAgIHRoaXMudGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VGlsZSh4LCB6LCBzdGF0ZSkge1xyXG4gICAgICAgIHRoaXMudGlsZU1hcENvbnRleHQuZmlsbFN0eWxlID0gc3RhdGU7XHJcbiAgICAgICAgdGhpcy50aWxlTWFwQ29udGV4dC5maWxsUmVjdCh4LCB6LCAxLCAxKTtcclxuXHJcbiAgICAgICAgdGhpcy50ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbn0iLCIvKlxyXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBCbHVlTWFwLCBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgKE1JVCkuXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgQmx1ZSAoTHVrYXMgUmllZ2VyKSA8aHR0cHM6Ly9ibHVlY29sb3JlZC5kZT5cclxuICogQ29weXJpZ2h0IChjKSBjb250cmlidXRvcnNcclxuICpcclxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuICpcclxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cclxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbiAqXHJcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxyXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cclxuICogVEhFIFNPRlRXQVJFLlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFZlY3RvcjIgfSBmcm9tICd0aHJlZSc7XHJcbmltcG9ydCAgeyBUaWxlIH0gZnJvbSAnLi9UaWxlLmpzJztcclxuaW1wb3J0IHthbGVydCwgaGFzaFRpbGV9IGZyb20gJy4uL3V0aWwvVXRpbHMuanMnO1xyXG5pbXBvcnQge1RpbGVNYXB9IGZyb20gXCIuL1RpbGVNYXBcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBUaWxlTWFuYWdlciB7XHJcblxyXG4gICAgc3RhdGljIHRpbGVNYXBTaXplID0gMTAwO1xyXG4gICAgc3RhdGljIHRpbGVNYXBIYWxmU2l6ZSA9IFRpbGVNYW5hZ2VyLnRpbGVNYXBTaXplIC8gMjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzY2VuZSwgdGlsZUxvYWRlciwgb25UaWxlTG9hZCA9IG51bGwsIG9uVGlsZVVubG9hZCA9IG51bGwsIGV2ZW50cyA9IG51bGwpIHtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHRoaXMsICdpc1RpbGVNYW5hZ2VyJywgeyB2YWx1ZTogdHJ1ZSB9ICk7XHJcblxyXG4gICAgICAgIHRoaXMuZXZlbnRzID0gZXZlbnRzO1xyXG4gICAgICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgICAgICB0aGlzLnRpbGVMb2FkZXIgPSB0aWxlTG9hZGVyO1xyXG5cclxuICAgICAgICB0aGlzLm9uVGlsZUxvYWQgPSBvblRpbGVMb2FkIHx8IGZ1bmN0aW9uKCl7fTtcclxuICAgICAgICB0aGlzLm9uVGlsZVVubG9hZCA9IG9uVGlsZVVubG9hZCB8fCBmdW5jdGlvbigpe307XHJcblxyXG4gICAgICAgIHRoaXMudmlld0Rpc3RhbmNlWCA9IDE7XHJcbiAgICAgICAgdGhpcy52aWV3RGlzdGFuY2VaID0gMTtcclxuICAgICAgICB0aGlzLmNlbnRlclRpbGUgPSBuZXcgVmVjdG9yMigwLCAwKTtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50bHlMb2FkaW5nID0gMDtcclxuICAgICAgICB0aGlzLmxvYWRUaW1lb3V0ID0gbnVsbDtcclxuXHJcbiAgICAgICAgLy9tYXAgb2YgbG9hZGVkIHRpbGVzXHJcbiAgICAgICAgdGhpcy50aWxlcyA9IHt9O1xyXG5cclxuICAgICAgICAvLyBhIGNhbnZhcyB0aGF0IGtlZXBzIHRyYWNrIG9mIHRoZSBsb2FkZWQgdGlsZXMsIHVzZWQgZm9yIHNoYWRlcnNcclxuICAgICAgICB0aGlzLnRpbGVNYXAgPSBuZXcgVGlsZU1hcChUaWxlTWFuYWdlci50aWxlTWFwU2l6ZSwgVGlsZU1hbmFnZXIudGlsZU1hcFNpemUpO1xyXG5cclxuICAgICAgICB0aGlzLnVubG9hZGVkID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBsb2FkQXJvdW5kVGlsZSh4LCB6LCB2aWV3RGlzdGFuY2VYLCB2aWV3RGlzdGFuY2VaKSB7XHJcbiAgICAgICAgdGhpcy51bmxvYWRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnZpZXdEaXN0YW5jZVggPSB2aWV3RGlzdGFuY2VYO1xyXG4gICAgICAgIHRoaXMudmlld0Rpc3RhbmNlWiA9IHZpZXdEaXN0YW5jZVo7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNlbnRlclRpbGUueCAhPT0geCB8fCB0aGlzLmNlbnRlclRpbGUueSAhPT0geikge1xyXG4gICAgICAgICAgICB0aGlzLmNlbnRlclRpbGUuc2V0KHgsIHopO1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUZhclRpbGVzKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnRpbGVNYXAuc2V0QWxsKFRpbGVNYXAuRU1QVFkpO1xyXG4gICAgICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMudGlsZXMpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy50aWxlcy5oYXNPd25Qcm9wZXJ0eShrZXlzW2ldKSkgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHRpbGUgPSB0aGlzLnRpbGVzW2tleXNbaV1dO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aWxlLmxvYWRpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbGVNYXAuc2V0VGlsZSh0aWxlLnggLSB0aGlzLmNlbnRlclRpbGUueCArIFRpbGVNYW5hZ2VyLnRpbGVNYXBIYWxmU2l6ZSwgdGlsZS56IC0gdGhpcy5jZW50ZXJUaWxlLnkgKyBUaWxlTWFuYWdlci50aWxlTWFwSGFsZlNpemUsIFRpbGVNYXAuTE9BREVEKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5sb2FkQ2xvc2VUaWxlcygpO1xyXG4gICAgfVxyXG5cclxuICAgIHVubG9hZCgpIHtcclxuICAgICAgICB0aGlzLnVubG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnJlbW92ZUFsbFRpbGVzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlRmFyVGlsZXMoKSB7XHJcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnRpbGVzKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLnRpbGVzLmhhc093blByb3BlcnR5KGtleXNbaV0pKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgIGxldCB0aWxlID0gdGhpcy50aWxlc1trZXlzW2ldXTtcclxuICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgdGlsZS54ICsgdGhpcy52aWV3RGlzdGFuY2VYIDwgdGhpcy5jZW50ZXJUaWxlLnggfHxcclxuICAgICAgICAgICAgICAgIHRpbGUueCAtIHRoaXMudmlld0Rpc3RhbmNlWCA+IHRoaXMuY2VudGVyVGlsZS54IHx8XHJcbiAgICAgICAgICAgICAgICB0aWxlLnogKyB0aGlzLnZpZXdEaXN0YW5jZVogPCB0aGlzLmNlbnRlclRpbGUueSB8fFxyXG4gICAgICAgICAgICAgICAgdGlsZS56IC0gdGhpcy52aWV3RGlzdGFuY2VaID4gdGhpcy5jZW50ZXJUaWxlLnlcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICB0aWxlLnVubG9hZCgpO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMudGlsZXNba2V5c1tpXV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlQWxsVGlsZXMoKSB7XHJcbiAgICAgICAgdGhpcy50aWxlTWFwLnNldEFsbChUaWxlTWFwLkVNUFRZKTtcclxuXHJcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnRpbGVzKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLnRpbGVzLmhhc093blByb3BlcnR5KGtleXNbaV0pKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgIGxldCB0aWxlID0gdGhpcy50aWxlc1trZXlzW2ldXTtcclxuICAgICAgICAgICAgdGlsZS51bmxvYWQoKTtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMudGlsZXNba2V5c1tpXV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxvYWRDbG9zZVRpbGVzID0gKCkgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLnVubG9hZGVkKSByZXR1cm47XHJcbiAgICAgICAgaWYgKCF0aGlzLmxvYWROZXh0VGlsZSgpKSByZXR1cm47XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmxvYWRUaW1lb3V0KSBjbGVhclRpbWVvdXQodGhpcy5sb2FkVGltZW91dCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRseUxvYWRpbmcgPCA0KSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9hZFRpbWVvdXQgPSBzZXRUaW1lb3V0KHRoaXMubG9hZENsb3NlVGlsZXMsIDApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9hZFRpbWVvdXQgPSBzZXRUaW1lb3V0KHRoaXMubG9hZENsb3NlVGlsZXMsIDEwMDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgbG9hZE5leHRUaWxlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnVubG9hZGVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIGxldCB4ID0gMDtcclxuICAgICAgICBsZXQgeiA9IDA7XHJcbiAgICAgICAgbGV0IGQgPSAxO1xyXG4gICAgICAgIGxldCBtID0gMTtcclxuXHJcbiAgICAgICAgd2hpbGUgKG0gPCBNYXRoLm1heCh0aGlzLnZpZXdEaXN0YW5jZVgsIHRoaXMudmlld0Rpc3RhbmNlWikgKiAyICsgMSkge1xyXG4gICAgICAgICAgICB3aGlsZSAoMiAqIHggKiBkIDwgbSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudHJ5TG9hZFRpbGUodGhpcy5jZW50ZXJUaWxlLnggKyB4LCB0aGlzLmNlbnRlclRpbGUueSArIHopKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHggPSB4ICsgZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB3aGlsZSAoMiAqIHogKiBkIDwgbSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudHJ5TG9hZFRpbGUodGhpcy5jZW50ZXJUaWxlLnggKyB4LCB0aGlzLmNlbnRlclRpbGUueSArIHopKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHogPSB6ICsgZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkID0gLTEgKiBkO1xyXG4gICAgICAgICAgICBtID0gbSArIDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdHJ5TG9hZFRpbGUoeCwgeikge1xyXG4gICAgICAgIGlmICh0aGlzLnVubG9hZGVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIGlmIChNYXRoLmFicyh4IC0gdGhpcy5jZW50ZXJUaWxlLngpID4gdGhpcy52aWV3RGlzdGFuY2VYKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgaWYgKE1hdGguYWJzKHogLSB0aGlzLmNlbnRlclRpbGUueSkgPiB0aGlzLnZpZXdEaXN0YW5jZVopIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IHRpbGVIYXNoID0gaGFzaFRpbGUoeCwgeik7XHJcblxyXG4gICAgICAgIGxldCB0aWxlID0gdGhpcy50aWxlc1t0aWxlSGFzaF07XHJcbiAgICAgICAgaWYgKHRpbGUgIT09IHVuZGVmaW5lZCkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnRseUxvYWRpbmcrKztcclxuXHJcbiAgICAgICAgdGlsZSA9IG5ldyBUaWxlKHgsIHosIHRoaXMuaGFuZGxlTG9hZGVkVGlsZSwgdGhpcy5oYW5kbGVVbmxvYWRlZFRpbGUpO1xyXG4gICAgICAgIHRoaXMudGlsZXNbdGlsZUhhc2hdID0gdGlsZTtcclxuICAgICAgICB0aWxlLmxvYWQodGhpcy50aWxlTG9hZGVyKVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRpbGVNYXAuc2V0VGlsZSh0aWxlLnggLSB0aGlzLmNlbnRlclRpbGUueCArIFRpbGVNYW5hZ2VyLnRpbGVNYXBIYWxmU2l6ZSwgdGlsZS56IC0gdGhpcy5jZW50ZXJUaWxlLnkgKyBUaWxlTWFuYWdlci50aWxlTWFwSGFsZlNpemUsIFRpbGVNYXAuTE9BREVEKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5sb2FkVGltZW91dCkgY2xlYXJUaW1lb3V0KHRoaXMubG9hZFRpbWVvdXQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkVGltZW91dCA9IHNldFRpbWVvdXQodGhpcy5sb2FkQ2xvc2VUaWxlcywgMCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3Iuc3RhdHVzICYmIGVycm9yLnN0YXR1cyA9PT0gXCJlbXB0eVwiKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IudGFyZ2V0ICYmIGVycm9yLnRhcmdldC5zdGF0dXMgPT09IDQwNCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgIGFsZXJ0KHRoaXMuZXZlbnRzLCBcIkZhaWxlZCB0byBsb2FkIHRpbGU6IFwiICsgZXJyb3IsIFwid2FybmluZ1wiKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50aWxlTWFwLnNldFRpbGUodGlsZS54IC0gdGhpcy5jZW50ZXJUaWxlLnggKyBUaWxlTWFuYWdlci50aWxlTWFwSGFsZlNpemUsIHRpbGUueiAtIHRoaXMuY2VudGVyVGlsZS55ICsgVGlsZU1hbmFnZXIudGlsZU1hcEhhbGZTaXplLCBUaWxlTWFwLkxPQURFRCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRseUxvYWRpbmctLTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZUxvYWRlZFRpbGUgPSB0aWxlID0+IHtcclxuICAgICAgICAvL3RoaXMudGlsZU1hcC5zZXRUaWxlKHRpbGUueCAtIHRoaXMuY2VudGVyVGlsZS54ICsgVGlsZU1hbmFnZXIudGlsZU1hcEhhbGZTaXplLCB0aWxlLnogLSB0aGlzLmNlbnRlclRpbGUueSArIFRpbGVNYW5hZ2VyLnRpbGVNYXBIYWxmU2l6ZSwgVGlsZU1hcC5MT0FERUQpO1xyXG5cclxuICAgICAgICB0aGlzLnNjZW5lLmFkZCh0aWxlLm1vZGVsKTtcclxuICAgICAgICB0aGlzLm9uVGlsZUxvYWQodGlsZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlVW5sb2FkZWRUaWxlID0gdGlsZSA9PiB7XHJcbiAgICAgICAgdGhpcy50aWxlTWFwLnNldFRpbGUodGlsZS54IC0gdGhpcy5jZW50ZXJUaWxlLnggKyBUaWxlTWFuYWdlci50aWxlTWFwSGFsZlNpemUsIHRpbGUueiAtIHRoaXMuY2VudGVyVGlsZS55ICsgVGlsZU1hbmFnZXIudGlsZU1hcEhhbGZTaXplLCBUaWxlTWFwLkVNUFRZKTtcclxuXHJcbiAgICAgICAgdGhpcy5zY2VuZS5yZW1vdmUodGlsZS5tb2RlbCk7XHJcbiAgICAgICAgdGhpcy5vblRpbGVVbmxvYWQodGlsZSk7XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHtwYXRoRnJvbUNvb3Jkc30gZnJvbSBcIi4uL3V0aWwvVXRpbHNcIjtcclxuaW1wb3J0IHtCdWZmZXJHZW9tZXRyeUxvYWRlciwgRmlsZUxvYWRlciwgTWVzaH0gZnJvbSBcInRocmVlXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgVGlsZUxvYWRlciB7XHJcblxyXG4gICAgY29uc3RydWN0b3IodGlsZVBhdGgsIG1hdGVyaWFsLCB0aWxlU2V0dGluZ3MsIGxheWVyID0gMCkge1xyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdGhpcywgJ2lzVGlsZUxvYWRlcicsIHsgdmFsdWU6IHRydWUgfSApO1xyXG5cclxuICAgICAgICB0aGlzLnRpbGVQYXRoID0gdGlsZVBhdGg7XHJcbiAgICAgICAgdGhpcy5tYXRlcmlhbCA9IG1hdGVyaWFsO1xyXG4gICAgICAgIHRoaXMudGlsZVNldHRpbmdzID0gdGlsZVNldHRpbmdzO1xyXG5cclxuICAgICAgICB0aGlzLmxheWVyID0gbGF5ZXI7XHJcblxyXG4gICAgICAgIHRoaXMuZmlsZUxvYWRlciA9IG5ldyBGaWxlTG9hZGVyKCk7XHJcbiAgICAgICAgdGhpcy5maWxlTG9hZGVyLnNldFJlc3BvbnNlVHlwZSgnanNvbicpO1xyXG5cclxuICAgICAgICB0aGlzLmJ1ZmZlckdlb21ldHJ5TG9hZGVyID0gbmV3IEJ1ZmZlckdlb21ldHJ5TG9hZGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZCA9ICh0aWxlWCwgdGlsZVopID0+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmZpbGVMb2FkZXIubG9hZCh0aGlzLnRpbGVQYXRoICsgcGF0aEZyb21Db29yZHModGlsZVgsIHRpbGVaKSArICcuanNvbicsXHJcbiAgICAgICAgICAgICAgICBnZW9tZXRyeUpzb24gPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghZ2VvbWV0cnlKc29uLnR5cGUgfHwgZ2VvbWV0cnlKc29uLnR5cGUgIT09ICdCdWZmZXJHZW9tZXRyeScpIHJlamVjdCh7c3RhdHVzOiBcImVtcHR5XCJ9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGdlb21ldHJ5ID0gdGhpcy5idWZmZXJHZW9tZXRyeUxvYWRlci5wYXJzZShnZW9tZXRyeUpzb24pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgb2JqZWN0ID0gbmV3IE1lc2goZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmxheWVyKSBvYmplY3QubGF5ZXJzLnNldCh0aGlzLmxheWVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRpbGVTaXplID0gdGhpcy50aWxlU2V0dGluZ3MudGlsZVNpemU7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRyYW5zbGF0ZSA9IHRoaXMudGlsZVNldHRpbmdzLnRyYW5zbGF0ZTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc2NhbGUgPSB0aGlzLnRpbGVTZXR0aW5ncy5zY2FsZTtcclxuICAgICAgICAgICAgICAgICAgICBvYmplY3QucG9zaXRpb24uc2V0KHRpbGVYICogdGlsZVNpemUueCArIHRyYW5zbGF0ZS54LCAwLCB0aWxlWiAqIHRpbGVTaXplLnogKyB0cmFuc2xhdGUueik7XHJcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LnNjYWxlLnNldChzY2FsZS54LCAxLCBzY2FsZS56KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LnVwZGF0ZU1hdHJpeFdvcmxkKHRydWUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG9iamVjdCk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgKCkgPT4ge30sXHJcbiAgICAgICAgICAgICAgICByZWplY3RcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbn1cclxuIiwiaW1wb3J0IHtNYXRoVXRpbHMsIFZlY3RvcjMsIFZlY3RvcjR9IGZyb20gXCJ0aHJlZVwiO1xyXG5pbXBvcnQge2FuaW1hdGUsIGRpc3BhdGNoRXZlbnR9IGZyb20gXCIuLi91dGlsL1V0aWxzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgTWFya2VyIHtcclxuXHJcbiAgICBzdGF0aWMgU291cmNlID0ge1xyXG4gICAgICAgIENVU1RPTTogMCxcclxuICAgICAgICBNQVJLRVJfRklMRTogMVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1hcmtlclNldCwgaWQpIHtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2lzTWFya2VyJywge3ZhbHVlOiB0cnVlfSk7XHJcblxyXG4gICAgICAgIHRoaXMubWFuYWdlciA9IG1hcmtlclNldC5tYW5hZ2VyO1xyXG4gICAgICAgIHRoaXMubWFya2VyU2V0ID0gbWFya2VyU2V0O1xyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuXHJcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gPSBuZXcgVmVjdG9yMygpO1xyXG5cclxuICAgICAgICB0aGlzLl9sYWJlbCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5saW5rID0gbnVsbDtcclxuICAgICAgICB0aGlzLm5ld1RhYiA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMubWluRGlzdGFuY2UgPSAwLjA7XHJcbiAgICAgICAgdGhpcy5tYXhEaXN0YW5jZSA9IDEwMDAwMC4wO1xyXG5cclxuICAgICAgICB0aGlzLm9wYWNpdHkgPSAxO1xyXG5cclxuICAgICAgICB0aGlzLl9zb3VyY2UgPSBNYXJrZXIuU291cmNlLkNVU1RPTTtcclxuXHJcbiAgICAgICAgdGhpcy5fb25EaXNwb3NhbCA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLl9kaXN0YW5jZSA9IDA7XHJcbiAgICAgICAgdGhpcy5fb3BhY2l0eSA9IDE7XHJcblxyXG4gICAgICAgIHRoaXMuX3Bvc1JlbGF0aXZlVG9DYW1lcmEgPSBuZXcgVmVjdG9yMygpO1xyXG4gICAgICAgIHRoaXMuX2NhbWVyYURpcmVjdGlvbiA9IG5ldyBWZWN0b3IzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKG1hcmtlckRhdGEpIHtcclxuICAgICAgICB0aGlzLl9zb3VyY2UgPSBNYXJrZXIuU291cmNlLk1BUktFUl9GSUxFO1xyXG5cclxuICAgICAgICBpZiAobWFya2VyRGF0YS5wb3NpdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLnNldFBvc2l0aW9uKHBhcnNlRmxvYXQobWFya2VyRGF0YS5wb3NpdGlvbi54KSwgcGFyc2VGbG9hdChtYXJrZXJEYXRhLnBvc2l0aW9uLnkpLCBwYXJzZUZsb2F0KG1hcmtlckRhdGEucG9zaXRpb24ueikpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb24oMCwgMCwgMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmxhYmVsID0gbWFya2VyRGF0YS5sYWJlbCA/IG1hcmtlckRhdGEubGFiZWwgOiBudWxsO1xyXG4gICAgICAgIHRoaXMubGluayA9IG1hcmtlckRhdGEubGluayA/IG1hcmtlckRhdGEubGluayA6IG51bGw7XHJcbiAgICAgICAgdGhpcy5uZXdUYWIgPSAhIW1hcmtlckRhdGEubmV3VGFiO1xyXG5cclxuICAgICAgICB0aGlzLm1pbkRpc3RhbmNlID0gcGFyc2VGbG9hdChtYXJrZXJEYXRhLm1pbkRpc3RhbmNlID8gbWFya2VyRGF0YS5taW5EaXN0YW5jZSA6IDAuMCk7XHJcbiAgICAgICAgdGhpcy5tYXhEaXN0YW5jZSA9IHBhcnNlRmxvYXQobWFya2VyRGF0YS5tYXhEaXN0YW5jZSA/IG1hcmtlckRhdGEubWF4RGlzdGFuY2UgOiAxMDAwMDAuMCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0UG9zaXRpb24oeCwgeSwgeikge1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24uc2V0KHgsIHksIHopO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBwb3NpdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcG9zaXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgb25DbGljayhjbGlja1Bvc2l0aW9uKXtcclxuICAgICAgICBpZiAoIWRpc3BhdGNoRXZlbnQodGhpcy5tYW5hZ2VyLmV2ZW50cywgJ2JsdWVtYXBNYXJrZXJDbGljaycsIHttYXJrZXI6IHRoaXN9KSkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLmZvbGxvd0xpbmsoKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMubGFiZWwpe1xyXG4gICAgICAgICAgICB0aGlzLm1hbmFnZXIuc2hvd1BvcHVwKGA8ZGl2IGNsYXNzPVwiYm0tbWFya2VyLWxhYmVsXCI+JHt0aGlzLmxhYmVsfTwvZGl2PmAsIGNsaWNrUG9zaXRpb24ueCwgY2xpY2tQb3NpdGlvbi55LCBjbGlja1Bvc2l0aW9uLnosIHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmb2xsb3dMaW5rKCl7XHJcbiAgICAgICAgaWYgKHRoaXMubGluayl7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm5ld1RhYil7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cub3Blbih0aGlzLmxpbmssICdfYmxhbmsnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSB0aGlzLmxpbms7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgX29uQmVmb3JlUmVuZGVyKHJlbmRlcmVyLCBzY2VuZSwgY2FtZXJhKSB7XHJcblxyXG4gICAgICAgIC8vY2FsY3VsYXRlIFwib3J0aG9ncmFwaGljIGRpc3RhbmNlXCIgdG8gbWFya2VyXHJcbiAgICAgICAgdGhpcy5fcG9zUmVsYXRpdmVUb0NhbWVyYS5zdWJWZWN0b3JzKHRoaXMucG9zaXRpb24sIGNhbWVyYS5wb3NpdGlvbik7XHJcbiAgICAgICAgY2FtZXJhLmdldFdvcmxkRGlyZWN0aW9uKHRoaXMuX2NhbWVyYURpcmVjdGlvbik7XHJcbiAgICAgICAgdGhpcy5fZGlzdGFuY2UgPSB0aGlzLl9wb3NSZWxhdGl2ZVRvQ2FtZXJhLmRvdCh0aGlzLl9jYW1lcmFEaXJlY3Rpb24pO1xyXG5cclxuICAgICAgICAvL2NhbGN1bGF0ZSBvcGFjaXR5IGJhc2VkIG9uIChtaW4vbWF4KWRpc3RhbmNlXHJcbiAgICAgICAgdGhpcy5fb3BhY2l0eSA9IE1hdGgubWluKFxyXG4gICAgICAgICAgICAxIC0gTWF0aFV0aWxzLmNsYW1wKCh0aGlzLl9kaXN0YW5jZSAtIHRoaXMubWF4RGlzdGFuY2UpIC8gKHRoaXMubWF4RGlzdGFuY2UgKiAyKSwgMCwgMSksXHJcbiAgICAgICAgICAgIE1hdGhVdGlscy5jbGFtcCgodGhpcy5fZGlzdGFuY2UgLSB0aGlzLm1pbkRpc3RhbmNlKSAvICh0aGlzLm1pbkRpc3RhbmNlICogMiArIDEpLCAwLCAxKVxyXG4gICAgICAgICkgKiB0aGlzLm9wYWNpdHk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGJsZW5kSW4oZHVyYXRpb25NcyA9IDUwMCwgcG9zdEFuaW1hdGlvbiA9IG51bGwpe1xyXG4gICAgICAgIHRoaXMub3BhY2l0eSA9IDA7XHJcbiAgICAgICAgYW5pbWF0ZShwcm9ncmVzcyA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMub3BhY2l0eSA9IHByb2dyZXNzO1xyXG4gICAgICAgIH0sIGR1cmF0aW9uTXMsIHBvc3RBbmltYXRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGJsZW5kT3V0KGR1cmF0aW9uTXMgPSA1MDAsIHBvc3RBbmltYXRpb24gPSBudWxsKXtcclxuICAgICAgICBsZXQgc3RhcnRPcGFjaXR5ID0gdGhpcy5vcGFjaXR5O1xyXG4gICAgICAgIGFuaW1hdGUocHJvZ3Jlc3MgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm9wYWNpdHkgPSBzdGFydE9wYWNpdHkgKiAoMSAtIHByb2dyZXNzKTtcclxuICAgICAgICB9LCBkdXJhdGlvbk1zLCBwb3N0QW5pbWF0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgbGFiZWwobGFiZWwpe1xyXG4gICAgICAgIHRoaXMuX2xhYmVsID0gbGFiZWw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGxhYmVsKCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xhYmVsO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBvbkRpc3Bvc2FsKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdGhpcy5fb25EaXNwb3NhbC5wdXNoKGNhbGxiYWNrKTtcclxuICAgIH1cclxuXHJcbiAgICBkaXNwb3NlKCkge1xyXG4gICAgICAgIHRoaXMuX29uRGlzcG9zYWwuZm9yRWFjaChjYWxsYmFjayA9PiBjYWxsYmFjayh0aGlzKSk7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMubWFya2VyU2V0Ll9tYXJrZXJbdGhpcy5pZF07XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIG5vcm1hbGl6ZUNvbG9yKGNvbG9yKXtcclxuICAgICAgICBpZiAoIWNvbG9yKSBjb2xvciA9IHt9O1xyXG5cclxuICAgICAgICBjb2xvci5yID0gTWFya2VyLm5vcm1hbGlzZU51bWJlcihjb2xvci5yLCAyNTUsIHRydWUpO1xyXG4gICAgICAgIGNvbG9yLmcgPSBNYXJrZXIubm9ybWFsaXNlTnVtYmVyKGNvbG9yLmcsIDAsIHRydWUpO1xyXG4gICAgICAgIGNvbG9yLmIgPSBNYXJrZXIubm9ybWFsaXNlTnVtYmVyKGNvbG9yLmIsIDAsIHRydWUpO1xyXG4gICAgICAgIGNvbG9yLmEgPSBNYXJrZXIubm9ybWFsaXNlTnVtYmVyKGNvbG9yLmEsIDEsIGZhbHNlKTtcclxuXHJcbiAgICAgICAgY29sb3IucmdiID0gKGNvbG9yLnIgPDwgMTYpICsgKGNvbG9yLmcgPDwgOCkgKyAoY29sb3IuYik7XHJcbiAgICAgICAgY29sb3IudmVjNCA9IG5ldyBWZWN0b3I0KGNvbG9yLnIgLyAyNTUsIGNvbG9yLmcgLyAyNTUsIGNvbG9yLmIgLyAyNTUsIGNvbG9yLmEpO1xyXG4gICAgICAgIHJldHVybiBjb2xvcjtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgbm9ybWFsaXNlTnVtYmVyKG5yLCBkZWYsIGludGVnZXIgPSBmYWxzZSkge1xyXG4gICAgICAgIGlmIChpc05hTihucikpe1xyXG4gICAgICAgICAgICBpZiAoaW50ZWdlcikgbnIgPSBwYXJzZUludChucik7XHJcbiAgICAgICAgICAgIGVsc2UgbnIgPSBwYXJzZUZsb2F0KG5yKTtcclxuICAgICAgICAgICAgaWYgKGlzTmFOKG5yKSkgcmV0dXJuIGRlZjtcclxuICAgICAgICAgICAgcmV0dXJuIG5yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGludGVnZXIpIHJldHVybiBNYXRoLmZsb29yKG5yKTtcclxuICAgICAgICByZXR1cm4gbnI7XHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHtcblx0U2hhZGVyTGliLFxuXHRTaGFkZXJNYXRlcmlhbCxcblx0VW5pZm9ybXNMaWIsXG5cdFVuaWZvcm1zVXRpbHMsXG5cdFZlY3RvcjJcbn0gZnJvbSBcInRocmVlXCI7XG4vKipcbiAqIHBhcmFtZXRlcnMgPSB7XG4gKiAgY29sb3I6IDxoZXg+LFxuICogIGxpbmV3aWR0aDogPGZsb2F0PixcbiAqICBkYXNoZWQ6IDxib29sZWFuPixcbiAqICBkYXNoU2NhbGU6IDxmbG9hdD4sXG4gKiAgZGFzaFNpemU6IDxmbG9hdD4sXG4gKiAgZ2FwU2l6ZTogPGZsb2F0PixcbiAqICByZXNvbHV0aW9uOiA8VmVjdG9yMj4sIC8vIHRvIGJlIHNldCBieSByZW5kZXJlclxuICogfVxuICovXG5cblVuaWZvcm1zTGliLmxpbmUgPSB7XG5cblx0bGluZXdpZHRoOiB7IHZhbHVlOiAxIH0sXG5cdHJlc29sdXRpb246IHsgdmFsdWU6IG5ldyBWZWN0b3IyKCAxLCAxICkgfSxcblx0ZGFzaFNjYWxlOiB7IHZhbHVlOiAxIH0sXG5cdGRhc2hTaXplOiB7IHZhbHVlOiAxIH0sXG5cdGdhcFNpemU6IHsgdmFsdWU6IDEgfSwgLy8gdG9kbyBGSVggLSBtYXliZSBjaGFuZ2UgdG8gdG90YWxTaXplXG5cdG9wYWNpdHk6IHsgdmFsdWU6IDEgfVxuXG59O1xuXG5TaGFkZXJMaWJbICdsaW5lJyBdID0ge1xuXG5cdHVuaWZvcm1zOiBVbmlmb3Jtc1V0aWxzLm1lcmdlKCBbXG5cdFx0VW5pZm9ybXNMaWIuY29tbW9uLFxuXHRcdFVuaWZvcm1zTGliLmZvZyxcblx0XHRVbmlmb3Jtc0xpYi5saW5lXG5cdF0gKSxcblxuXHR2ZXJ0ZXhTaGFkZXI6XG5cdFx0YFxuXHRcdCNpbmNsdWRlIDxjb21tb24+XG5cdFx0I2luY2x1ZGUgPGNvbG9yX3BhcnNfdmVydGV4PlxuXHRcdCNpbmNsdWRlIDxmb2dfcGFyc192ZXJ0ZXg+XG5cdFx0I2luY2x1ZGUgPGxvZ2RlcHRoYnVmX3BhcnNfdmVydGV4PlxuXHRcdCNpbmNsdWRlIDxjbGlwcGluZ19wbGFuZXNfcGFyc192ZXJ0ZXg+XG5cblx0XHR1bmlmb3JtIGZsb2F0IGxpbmV3aWR0aDtcblx0XHR1bmlmb3JtIHZlYzIgcmVzb2x1dGlvbjtcblxuXHRcdGF0dHJpYnV0ZSB2ZWMzIGluc3RhbmNlU3RhcnQ7XG5cdFx0YXR0cmlidXRlIHZlYzMgaW5zdGFuY2VFbmQ7XG5cblx0XHRhdHRyaWJ1dGUgdmVjMyBpbnN0YW5jZUNvbG9yU3RhcnQ7XG5cdFx0YXR0cmlidXRlIHZlYzMgaW5zdGFuY2VDb2xvckVuZDtcblxuXHRcdHZhcnlpbmcgdmVjMiB2VXY7XG5cblx0XHQjaWZkZWYgVVNFX0RBU0hcblxuXHRcdFx0dW5pZm9ybSBmbG9hdCBkYXNoU2NhbGU7XG5cdFx0XHRhdHRyaWJ1dGUgZmxvYXQgaW5zdGFuY2VEaXN0YW5jZVN0YXJ0O1xuXHRcdFx0YXR0cmlidXRlIGZsb2F0IGluc3RhbmNlRGlzdGFuY2VFbmQ7XG5cdFx0XHR2YXJ5aW5nIGZsb2F0IHZMaW5lRGlzdGFuY2U7XG5cblx0XHQjZW5kaWZcblxuXHRcdHZvaWQgdHJpbVNlZ21lbnQoIGNvbnN0IGluIHZlYzQgc3RhcnQsIGlub3V0IHZlYzQgZW5kICkge1xuXG5cdFx0XHQvLyB0cmltIGVuZCBzZWdtZW50IHNvIGl0IHRlcm1pbmF0ZXMgYmV0d2VlbiB0aGUgY2FtZXJhIHBsYW5lIGFuZCB0aGUgbmVhciBwbGFuZVxuXG5cdFx0XHQvLyBjb25zZXJ2YXRpdmUgZXN0aW1hdGUgb2YgdGhlIG5lYXIgcGxhbmVcblx0XHRcdGZsb2F0IGEgPSBwcm9qZWN0aW9uTWF0cml4WyAyIF1bIDIgXTsgLy8gM25kIGVudHJ5IGluIDN0aCBjb2x1bW5cblx0XHRcdGZsb2F0IGIgPSBwcm9qZWN0aW9uTWF0cml4WyAzIF1bIDIgXTsgLy8gM25kIGVudHJ5IGluIDR0aCBjb2x1bW5cblx0XHRcdGZsb2F0IG5lYXJFc3RpbWF0ZSA9IC0gMC41ICogYiAvIGE7XG5cblx0XHRcdGZsb2F0IGFscGhhID0gKCBuZWFyRXN0aW1hdGUgLSBzdGFydC56ICkgLyAoIGVuZC56IC0gc3RhcnQueiApO1xuXG5cdFx0XHRlbmQueHl6ID0gbWl4KCBzdGFydC54eXosIGVuZC54eXosIGFscGhhICk7XG5cblx0XHR9XG5cblx0XHR2b2lkIG1haW4oKSB7XG5cblx0XHRcdCNpZmRlZiBVU0VfQ09MT1JcblxuXHRcdFx0XHR2Q29sb3IueHl6ID0gKCBwb3NpdGlvbi55IDwgMC41ICkgPyBpbnN0YW5jZUNvbG9yU3RhcnQgOiBpbnN0YW5jZUNvbG9yRW5kO1xuXG5cdFx0XHQjZW5kaWZcblxuXHRcdFx0I2lmZGVmIFVTRV9EQVNIXG5cblx0XHRcdFx0dkxpbmVEaXN0YW5jZSA9ICggcG9zaXRpb24ueSA8IDAuNSApID8gZGFzaFNjYWxlICogaW5zdGFuY2VEaXN0YW5jZVN0YXJ0IDogZGFzaFNjYWxlICogaW5zdGFuY2VEaXN0YW5jZUVuZDtcblxuXHRcdFx0I2VuZGlmXG5cblx0XHRcdGZsb2F0IGFzcGVjdCA9IHJlc29sdXRpb24ueCAvIHJlc29sdXRpb24ueTtcblxuXHRcdFx0dlV2ID0gdXY7XG5cblx0XHRcdC8vIGNhbWVyYSBzcGFjZVxuXHRcdFx0dmVjNCBzdGFydCA9IG1vZGVsVmlld01hdHJpeCAqIHZlYzQoIGluc3RhbmNlU3RhcnQsIDEuMCApO1xuXHRcdFx0dmVjNCBlbmQgPSBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KCBpbnN0YW5jZUVuZCwgMS4wICk7XG5cblx0XHRcdC8vIHNwZWNpYWwgY2FzZSBmb3IgcGVyc3BlY3RpdmUgcHJvamVjdGlvbiwgYW5kIHNlZ21lbnRzIHRoYXQgdGVybWluYXRlIGVpdGhlciBpbiwgb3IgYmVoaW5kLCB0aGUgY2FtZXJhIHBsYW5lXG5cdFx0XHQvLyBjbGVhcmx5IHRoZSBncHUgZmlybXdhcmUgaGFzIGEgd2F5IG9mIGFkZHJlc3NpbmcgdGhpcyBpc3N1ZSB3aGVuIHByb2plY3RpbmcgaW50byBuZGMgc3BhY2Vcblx0XHRcdC8vIGJ1dCB3ZSBuZWVkIHRvIHBlcmZvcm0gbmRjLXNwYWNlIGNhbGN1bGF0aW9ucyBpbiB0aGUgc2hhZGVyLCBzbyB3ZSBtdXN0IGFkZHJlc3MgdGhpcyBpc3N1ZSBkaXJlY3RseVxuXHRcdFx0Ly8gcGVyaGFwcyB0aGVyZSBpcyBhIG1vcmUgZWxlZ2FudCBzb2x1dGlvbiAtLSBXZXN0TGFuZ2xleVxuXG5cdFx0XHRib29sIHBlcnNwZWN0aXZlID0gKCBwcm9qZWN0aW9uTWF0cml4WyAyIF1bIDMgXSA9PSAtIDEuMCApOyAvLyA0dGggZW50cnkgaW4gdGhlIDNyZCBjb2x1bW5cblxuXHRcdFx0aWYgKCBwZXJzcGVjdGl2ZSApIHtcblxuXHRcdFx0XHRpZiAoIHN0YXJ0LnogPCAwLjAgJiYgZW5kLnogPj0gMC4wICkge1xuXG5cdFx0XHRcdFx0dHJpbVNlZ21lbnQoIHN0YXJ0LCBlbmQgKTtcblxuXHRcdFx0XHR9IGVsc2UgaWYgKCBlbmQueiA8IDAuMCAmJiBzdGFydC56ID49IDAuMCApIHtcblxuXHRcdFx0XHRcdHRyaW1TZWdtZW50KCBlbmQsIHN0YXJ0ICk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdC8vIGNsaXAgc3BhY2Vcblx0XHRcdHZlYzQgY2xpcFN0YXJ0ID0gcHJvamVjdGlvbk1hdHJpeCAqIHN0YXJ0O1xuXHRcdFx0dmVjNCBjbGlwRW5kID0gcHJvamVjdGlvbk1hdHJpeCAqIGVuZDtcblxuXHRcdFx0Ly8gbmRjIHNwYWNlXG5cdFx0XHR2ZWMyIG5kY1N0YXJ0ID0gY2xpcFN0YXJ0Lnh5IC8gY2xpcFN0YXJ0Lnc7XG5cdFx0XHR2ZWMyIG5kY0VuZCA9IGNsaXBFbmQueHkgLyBjbGlwRW5kLnc7XG5cblx0XHRcdC8vIGRpcmVjdGlvblxuXHRcdFx0dmVjMiBkaXIgPSBuZGNFbmQgLSBuZGNTdGFydDtcblxuXHRcdFx0Ly8gYWNjb3VudCBmb3IgY2xpcC1zcGFjZSBhc3BlY3QgcmF0aW9cblx0XHRcdGRpci54ICo9IGFzcGVjdDtcblx0XHRcdGRpciA9IG5vcm1hbGl6ZSggZGlyICk7XG5cblx0XHRcdC8vIHBlcnBlbmRpY3VsYXIgdG8gZGlyXG5cdFx0XHR2ZWMyIG9mZnNldCA9IHZlYzIoIGRpci55LCAtIGRpci54ICk7XG5cblx0XHRcdC8vIHVuZG8gYXNwZWN0IHJhdGlvIGFkanVzdG1lbnRcblx0XHRcdGRpci54IC89IGFzcGVjdDtcblx0XHRcdG9mZnNldC54IC89IGFzcGVjdDtcblxuXHRcdFx0Ly8gc2lnbiBmbGlwXG5cdFx0XHRpZiAoIHBvc2l0aW9uLnggPCAwLjAgKSBvZmZzZXQgKj0gLSAxLjA7XG5cblx0XHRcdC8vIGVuZGNhcHNcblx0XHRcdGlmICggcG9zaXRpb24ueSA8IDAuMCApIHtcblxuXHRcdFx0XHRvZmZzZXQgKz0gLSBkaXI7XG5cblx0XHRcdH0gZWxzZSBpZiAoIHBvc2l0aW9uLnkgPiAxLjAgKSB7XG5cblx0XHRcdFx0b2Zmc2V0ICs9IGRpcjtcblxuXHRcdFx0fVxuXG5cdFx0XHQvLyBhZGp1c3QgZm9yIGxpbmV3aWR0aFxuXHRcdFx0b2Zmc2V0ICo9IGxpbmV3aWR0aDtcblxuXHRcdFx0Ly8gYWRqdXN0IGZvciBjbGlwLXNwYWNlIHRvIHNjcmVlbi1zcGFjZSBjb252ZXJzaW9uIC8vIG1heWJlIHJlc29sdXRpb24gc2hvdWxkIGJlIGJhc2VkIG9uIHZpZXdwb3J0IC4uLlxuXHRcdFx0b2Zmc2V0IC89IHJlc29sdXRpb24ueTtcblxuXHRcdFx0Ly8gc2VsZWN0IGVuZFxuXHRcdFx0dmVjNCBjbGlwID0gKCBwb3NpdGlvbi55IDwgMC41ICkgPyBjbGlwU3RhcnQgOiBjbGlwRW5kO1xuXG5cdFx0XHQvLyBiYWNrIHRvIGNsaXAgc3BhY2Vcblx0XHRcdG9mZnNldCAqPSBjbGlwLnc7XG5cblx0XHRcdGNsaXAueHkgKz0gb2Zmc2V0O1xuXG5cdFx0XHRnbF9Qb3NpdGlvbiA9IGNsaXA7XG5cblx0XHRcdHZlYzQgbXZQb3NpdGlvbiA9ICggcG9zaXRpb24ueSA8IDAuNSApID8gc3RhcnQgOiBlbmQ7IC8vIHRoaXMgaXMgYW4gYXBwcm94aW1hdGlvblxuXG5cdFx0XHQjaW5jbHVkZSA8bG9nZGVwdGhidWZfdmVydGV4PlxuXHRcdFx0I2luY2x1ZGUgPGNsaXBwaW5nX3BsYW5lc192ZXJ0ZXg+XG5cdFx0XHQjaW5jbHVkZSA8Zm9nX3ZlcnRleD5cblxuXHRcdH1cblx0XHRgLFxuXG5cdGZyYWdtZW50U2hhZGVyOlxuXHRcdGBcblx0XHR1bmlmb3JtIHZlYzMgZGlmZnVzZTtcblx0XHR1bmlmb3JtIGZsb2F0IG9wYWNpdHk7XG5cblx0XHQjaWZkZWYgVVNFX0RBU0hcblxuXHRcdFx0dW5pZm9ybSBmbG9hdCBkYXNoU2l6ZTtcblx0XHRcdHVuaWZvcm0gZmxvYXQgZ2FwU2l6ZTtcblxuXHRcdCNlbmRpZlxuXG5cdFx0dmFyeWluZyBmbG9hdCB2TGluZURpc3RhbmNlO1xuXG5cdFx0I2luY2x1ZGUgPGNvbW1vbj5cblx0XHQjaW5jbHVkZSA8Y29sb3JfcGFyc19mcmFnbWVudD5cblx0XHQjaW5jbHVkZSA8Zm9nX3BhcnNfZnJhZ21lbnQ+XG5cdFx0I2luY2x1ZGUgPGxvZ2RlcHRoYnVmX3BhcnNfZnJhZ21lbnQ+XG5cdFx0I2luY2x1ZGUgPGNsaXBwaW5nX3BsYW5lc19wYXJzX2ZyYWdtZW50PlxuXG5cdFx0dmFyeWluZyB2ZWMyIHZVdjtcblxuXHRcdHZvaWQgbWFpbigpIHtcblxuXHRcdFx0I2luY2x1ZGUgPGNsaXBwaW5nX3BsYW5lc19mcmFnbWVudD5cblxuXHRcdFx0I2lmZGVmIFVTRV9EQVNIXG5cblx0XHRcdFx0aWYgKCB2VXYueSA8IC0gMS4wIHx8IHZVdi55ID4gMS4wICkgZGlzY2FyZDsgLy8gZGlzY2FyZCBlbmRjYXBzXG5cblx0XHRcdFx0aWYgKCBtb2QoIHZMaW5lRGlzdGFuY2UsIGRhc2hTaXplICsgZ2FwU2l6ZSApID4gZGFzaFNpemUgKSBkaXNjYXJkOyAvLyB0b2RvIC0gRklYXG5cblx0XHRcdCNlbmRpZlxuXG5cdFx0XHRpZiAoIGFicyggdlV2LnkgKSA+IDEuMCApIHtcblxuXHRcdFx0XHRmbG9hdCBhID0gdlV2Lng7XG5cdFx0XHRcdGZsb2F0IGIgPSAoIHZVdi55ID4gMC4wICkgPyB2VXYueSAtIDEuMCA6IHZVdi55ICsgMS4wO1xuXHRcdFx0XHRmbG9hdCBsZW4yID0gYSAqIGEgKyBiICogYjtcblxuXHRcdFx0XHRpZiAoIGxlbjIgPiAxLjAgKSBkaXNjYXJkO1xuXG5cdFx0XHR9XG5cblx0XHRcdHZlYzQgZGlmZnVzZUNvbG9yID0gdmVjNCggZGlmZnVzZSwgb3BhY2l0eSApO1xuXG5cdFx0XHQjaW5jbHVkZSA8bG9nZGVwdGhidWZfZnJhZ21lbnQ+XG5cdFx0XHQjaW5jbHVkZSA8Y29sb3JfZnJhZ21lbnQ+XG5cblx0XHRcdGdsX0ZyYWdDb2xvciA9IHZlYzQoIGRpZmZ1c2VDb2xvci5yZ2IsIGRpZmZ1c2VDb2xvci5hICk7XG5cblx0XHRcdCNpbmNsdWRlIDx0b25lbWFwcGluZ19mcmFnbWVudD5cblx0XHRcdCNpbmNsdWRlIDxlbmNvZGluZ3NfZnJhZ21lbnQ+XG5cdFx0XHQjaW5jbHVkZSA8Zm9nX2ZyYWdtZW50PlxuXHRcdFx0I2luY2x1ZGUgPHByZW11bHRpcGxpZWRfYWxwaGFfZnJhZ21lbnQ+XG5cblx0XHR9XG5cdFx0YFxufTtcblxudmFyIExpbmVNYXRlcmlhbCA9IGZ1bmN0aW9uICggcGFyYW1ldGVycyApIHtcblxuXHRTaGFkZXJNYXRlcmlhbC5jYWxsKCB0aGlzLCB7XG5cblx0XHR0eXBlOiAnTGluZU1hdGVyaWFsJyxcblxuXHRcdHVuaWZvcm1zOiBVbmlmb3Jtc1V0aWxzLmNsb25lKCBTaGFkZXJMaWJbICdsaW5lJyBdLnVuaWZvcm1zICksXG5cblx0XHR2ZXJ0ZXhTaGFkZXI6IFNoYWRlckxpYlsgJ2xpbmUnIF0udmVydGV4U2hhZGVyLFxuXHRcdGZyYWdtZW50U2hhZGVyOiBTaGFkZXJMaWJbICdsaW5lJyBdLmZyYWdtZW50U2hhZGVyLFxuXG5cdFx0Y2xpcHBpbmc6IHRydWUgLy8gcmVxdWlyZWQgZm9yIGNsaXBwaW5nIHN1cHBvcnRcblxuXHR9ICk7XG5cblx0dGhpcy5kYXNoZWQgPSBmYWxzZTtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydGllcyggdGhpcywge1xuXG5cdFx0Y29sb3I6IHtcblxuXHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblxuXHRcdFx0Z2V0OiBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdFx0cmV0dXJuIHRoaXMudW5pZm9ybXMuZGlmZnVzZS52YWx1ZTtcblxuXHRcdFx0fSxcblxuXHRcdFx0c2V0OiBmdW5jdGlvbiAoIHZhbHVlICkge1xuXG5cdFx0XHRcdHRoaXMudW5pZm9ybXMuZGlmZnVzZS52YWx1ZSA9IHZhbHVlO1xuXG5cdFx0XHR9XG5cblx0XHR9LFxuXG5cdFx0bGluZXdpZHRoOiB7XG5cblx0XHRcdGVudW1lcmFibGU6IHRydWUsXG5cblx0XHRcdGdldDogZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRcdHJldHVybiB0aGlzLnVuaWZvcm1zLmxpbmV3aWR0aC52YWx1ZTtcblxuXHRcdFx0fSxcblxuXHRcdFx0c2V0OiBmdW5jdGlvbiAoIHZhbHVlICkge1xuXG5cdFx0XHRcdHRoaXMudW5pZm9ybXMubGluZXdpZHRoLnZhbHVlID0gdmFsdWU7XG5cblx0XHRcdH1cblxuXHRcdH0sXG5cblx0XHRkYXNoU2NhbGU6IHtcblxuXHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblxuXHRcdFx0Z2V0OiBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdFx0cmV0dXJuIHRoaXMudW5pZm9ybXMuZGFzaFNjYWxlLnZhbHVlO1xuXG5cdFx0XHR9LFxuXG5cdFx0XHRzZXQ6IGZ1bmN0aW9uICggdmFsdWUgKSB7XG5cblx0XHRcdFx0dGhpcy51bmlmb3Jtcy5kYXNoU2NhbGUudmFsdWUgPSB2YWx1ZTtcblxuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdGRhc2hTaXplOiB7XG5cblx0XHRcdGVudW1lcmFibGU6IHRydWUsXG5cblx0XHRcdGdldDogZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRcdHJldHVybiB0aGlzLnVuaWZvcm1zLmRhc2hTaXplLnZhbHVlO1xuXG5cdFx0XHR9LFxuXG5cdFx0XHRzZXQ6IGZ1bmN0aW9uICggdmFsdWUgKSB7XG5cblx0XHRcdFx0dGhpcy51bmlmb3Jtcy5kYXNoU2l6ZS52YWx1ZSA9IHZhbHVlO1xuXG5cdFx0XHR9XG5cblx0XHR9LFxuXG5cdFx0Z2FwU2l6ZToge1xuXG5cdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuXG5cdFx0XHRnZXQ6IGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0XHRyZXR1cm4gdGhpcy51bmlmb3Jtcy5nYXBTaXplLnZhbHVlO1xuXG5cdFx0XHR9LFxuXG5cdFx0XHRzZXQ6IGZ1bmN0aW9uICggdmFsdWUgKSB7XG5cblx0XHRcdFx0dGhpcy51bmlmb3Jtcy5nYXBTaXplLnZhbHVlID0gdmFsdWU7XG5cblx0XHRcdH1cblxuXHRcdH0sXG5cblx0XHRvcGFjaXR5OiB7XG5cblx0XHRcdGVudW1lcmFibGU6IHRydWUsXG5cblx0XHRcdGdldDogZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRcdHJldHVybiB0aGlzLnVuaWZvcm1zLm9wYWNpdHkudmFsdWU7XG5cblx0XHRcdH0sXG5cblx0XHRcdHNldDogZnVuY3Rpb24gKCB2YWx1ZSApIHtcblxuXHRcdFx0XHR0aGlzLnVuaWZvcm1zLm9wYWNpdHkudmFsdWUgPSB2YWx1ZTtcblxuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdHJlc29sdXRpb246IHtcblxuXHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblxuXHRcdFx0Z2V0OiBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdFx0cmV0dXJuIHRoaXMudW5pZm9ybXMucmVzb2x1dGlvbi52YWx1ZTtcblxuXHRcdFx0fSxcblxuXHRcdFx0c2V0OiBmdW5jdGlvbiAoIHZhbHVlICkge1xuXG5cdFx0XHRcdHRoaXMudW5pZm9ybXMucmVzb2x1dGlvbi52YWx1ZS5jb3B5KCB2YWx1ZSApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fSApO1xuXG5cdHRoaXMuc2V0VmFsdWVzKCBwYXJhbWV0ZXJzICk7XG5cbn07XG5cbkxpbmVNYXRlcmlhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBTaGFkZXJNYXRlcmlhbC5wcm90b3R5cGUgKTtcbkxpbmVNYXRlcmlhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBMaW5lTWF0ZXJpYWw7XG5cbkxpbmVNYXRlcmlhbC5wcm90b3R5cGUuaXNMaW5lTWF0ZXJpYWwgPSB0cnVlO1xuXG5leHBvcnQgeyBMaW5lTWF0ZXJpYWwgfTtcbiIsImltcG9ydCB7XG5cdEJveDMsXG5cdEZsb2F0MzJCdWZmZXJBdHRyaWJ1dGUsXG5cdEluc3RhbmNlZEJ1ZmZlckdlb21ldHJ5LFxuXHRJbnN0YW5jZWRJbnRlcmxlYXZlZEJ1ZmZlcixcblx0SW50ZXJsZWF2ZWRCdWZmZXJBdHRyaWJ1dGUsXG5cdFNwaGVyZSxcblx0VmVjdG9yMyxcblx0V2lyZWZyYW1lR2VvbWV0cnlcbn0gZnJvbSBcInRocmVlXCI7XG5cbnZhciBMaW5lU2VnbWVudHNHZW9tZXRyeSA9IGZ1bmN0aW9uICgpIHtcblxuXHRJbnN0YW5jZWRCdWZmZXJHZW9tZXRyeS5jYWxsKCB0aGlzICk7XG5cblx0dGhpcy50eXBlID0gJ0xpbmVTZWdtZW50c0dlb21ldHJ5JztcblxuXHR2YXIgcG9zaXRpb25zID0gWyAtIDEsIDIsIDAsIDEsIDIsIDAsIC0gMSwgMSwgMCwgMSwgMSwgMCwgLSAxLCAwLCAwLCAxLCAwLCAwLCAtIDEsIC0gMSwgMCwgMSwgLSAxLCAwIF07XG5cdHZhciB1dnMgPSBbIC0gMSwgMiwgMSwgMiwgLSAxLCAxLCAxLCAxLCAtIDEsIC0gMSwgMSwgLSAxLCAtIDEsIC0gMiwgMSwgLSAyIF07XG5cdHZhciBpbmRleCA9IFsgMCwgMiwgMSwgMiwgMywgMSwgMiwgNCwgMywgNCwgNSwgMywgNCwgNiwgNSwgNiwgNywgNSBdO1xuXG5cdHRoaXMuc2V0SW5kZXgoIGluZGV4ICk7XG5cdHRoaXMuc2V0QXR0cmlidXRlKCAncG9zaXRpb24nLCBuZXcgRmxvYXQzMkJ1ZmZlckF0dHJpYnV0ZSggcG9zaXRpb25zLCAzICkgKTtcblx0dGhpcy5zZXRBdHRyaWJ1dGUoICd1dicsIG5ldyBGbG9hdDMyQnVmZmVyQXR0cmlidXRlKCB1dnMsIDIgKSApO1xuXG59O1xuXG5MaW5lU2VnbWVudHNHZW9tZXRyeS5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKCBPYmplY3QuY3JlYXRlKCBJbnN0YW5jZWRCdWZmZXJHZW9tZXRyeS5wcm90b3R5cGUgKSwge1xuXG5cdGNvbnN0cnVjdG9yOiBMaW5lU2VnbWVudHNHZW9tZXRyeSxcblxuXHRpc0xpbmVTZWdtZW50c0dlb21ldHJ5OiB0cnVlLFxuXG5cdGFwcGx5TWF0cml4NDogZnVuY3Rpb24gKCBtYXRyaXggKSB7XG5cblx0XHR2YXIgc3RhcnQgPSB0aGlzLmF0dHJpYnV0ZXMuaW5zdGFuY2VTdGFydDtcblx0XHR2YXIgZW5kID0gdGhpcy5hdHRyaWJ1dGVzLmluc3RhbmNlRW5kO1xuXG5cdFx0aWYgKCBzdGFydCAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRzdGFydC5hcHBseU1hdHJpeDQoIG1hdHJpeCApO1xuXG5cdFx0XHRlbmQuYXBwbHlNYXRyaXg0KCBtYXRyaXggKTtcblxuXHRcdFx0c3RhcnQubmVlZHNVcGRhdGUgPSB0cnVlO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLmJvdW5kaW5nQm94ICE9PSBudWxsICkge1xuXG5cdFx0XHR0aGlzLmNvbXB1dGVCb3VuZGluZ0JveCgpO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLmJvdW5kaW5nU3BoZXJlICE9PSBudWxsICkge1xuXG5cdFx0XHR0aGlzLmNvbXB1dGVCb3VuZGluZ1NwaGVyZSgpO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHRzZXRQb3NpdGlvbnM6IGZ1bmN0aW9uICggYXJyYXkgKSB7XG5cblx0XHR2YXIgbGluZVNlZ21lbnRzO1xuXG5cdFx0aWYgKCBhcnJheSBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSApIHtcblxuXHRcdFx0bGluZVNlZ21lbnRzID0gYXJyYXk7XG5cblx0XHR9IGVsc2UgaWYgKCBBcnJheS5pc0FycmF5KCBhcnJheSApICkge1xuXG5cdFx0XHRsaW5lU2VnbWVudHMgPSBuZXcgRmxvYXQzMkFycmF5KCBhcnJheSApO1xuXG5cdFx0fVxuXG5cdFx0dmFyIGluc3RhbmNlQnVmZmVyID0gbmV3IEluc3RhbmNlZEludGVybGVhdmVkQnVmZmVyKCBsaW5lU2VnbWVudHMsIDYsIDEgKTsgLy8geHl6LCB4eXpcblxuXHRcdHRoaXMuc2V0QXR0cmlidXRlKCAnaW5zdGFuY2VTdGFydCcsIG5ldyBJbnRlcmxlYXZlZEJ1ZmZlckF0dHJpYnV0ZSggaW5zdGFuY2VCdWZmZXIsIDMsIDAgKSApOyAvLyB4eXpcblx0XHR0aGlzLnNldEF0dHJpYnV0ZSggJ2luc3RhbmNlRW5kJywgbmV3IEludGVybGVhdmVkQnVmZmVyQXR0cmlidXRlKCBpbnN0YW5jZUJ1ZmZlciwgMywgMyApICk7IC8vIHh5elxuXG5cdFx0Ly9cblxuXHRcdHRoaXMuY29tcHV0ZUJvdW5kaW5nQm94KCk7XG5cdFx0dGhpcy5jb21wdXRlQm91bmRpbmdTcGhlcmUoKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0c2V0Q29sb3JzOiBmdW5jdGlvbiAoIGFycmF5ICkge1xuXG5cdFx0dmFyIGNvbG9ycztcblxuXHRcdGlmICggYXJyYXkgaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkgKSB7XG5cblx0XHRcdGNvbG9ycyA9IGFycmF5O1xuXG5cdFx0fSBlbHNlIGlmICggQXJyYXkuaXNBcnJheSggYXJyYXkgKSApIHtcblxuXHRcdFx0Y29sb3JzID0gbmV3IEZsb2F0MzJBcnJheSggYXJyYXkgKTtcblxuXHRcdH1cblxuXHRcdHZhciBpbnN0YW5jZUNvbG9yQnVmZmVyID0gbmV3IEluc3RhbmNlZEludGVybGVhdmVkQnVmZmVyKCBjb2xvcnMsIDYsIDEgKTsgLy8gcmdiLCByZ2JcblxuXHRcdHRoaXMuc2V0QXR0cmlidXRlKCAnaW5zdGFuY2VDb2xvclN0YXJ0JywgbmV3IEludGVybGVhdmVkQnVmZmVyQXR0cmlidXRlKCBpbnN0YW5jZUNvbG9yQnVmZmVyLCAzLCAwICkgKTsgLy8gcmdiXG5cdFx0dGhpcy5zZXRBdHRyaWJ1dGUoICdpbnN0YW5jZUNvbG9yRW5kJywgbmV3IEludGVybGVhdmVkQnVmZmVyQXR0cmlidXRlKCBpbnN0YW5jZUNvbG9yQnVmZmVyLCAzLCAzICkgKTsgLy8gcmdiXG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdGZyb21XaXJlZnJhbWVHZW9tZXRyeTogZnVuY3Rpb24gKCBnZW9tZXRyeSApIHtcblxuXHRcdHRoaXMuc2V0UG9zaXRpb25zKCBnZW9tZXRyeS5hdHRyaWJ1dGVzLnBvc2l0aW9uLmFycmF5ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdGZyb21FZGdlc0dlb21ldHJ5OiBmdW5jdGlvbiAoIGdlb21ldHJ5ICkge1xuXG5cdFx0dGhpcy5zZXRQb3NpdGlvbnMoIGdlb21ldHJ5LmF0dHJpYnV0ZXMucG9zaXRpb24uYXJyYXkgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0ZnJvbU1lc2g6IGZ1bmN0aW9uICggbWVzaCApIHtcblxuXHRcdHRoaXMuZnJvbVdpcmVmcmFtZUdlb21ldHJ5KCBuZXcgV2lyZWZyYW1lR2VvbWV0cnkoIG1lc2guZ2VvbWV0cnkgKSApO1xuXG5cdFx0Ly8gc2V0IGNvbG9ycywgbWF5YmVcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0ZnJvbUxpbmVTZWdtZW50czogZnVuY3Rpb24gKCBsaW5lU2VnbWVudHMgKSB7XG5cblx0XHR2YXIgZ2VvbWV0cnkgPSBsaW5lU2VnbWVudHMuZ2VvbWV0cnk7XG5cblx0XHRpZiAoIGdlb21ldHJ5LmlzR2VvbWV0cnkgKSB7XG5cblx0XHRcdHRoaXMuc2V0UG9zaXRpb25zKCBnZW9tZXRyeS52ZXJ0aWNlcyApO1xuXG5cdFx0fSBlbHNlIGlmICggZ2VvbWV0cnkuaXNCdWZmZXJHZW9tZXRyeSApIHtcblxuXHRcdFx0dGhpcy5zZXRQb3NpdGlvbnMoIGdlb21ldHJ5LmF0dHJpYnV0ZXMucG9zaXRpb24uYXJyYXkgKTsgLy8gYXNzdW1lcyBub24taW5kZXhlZFxuXG5cdFx0fVxuXG5cdFx0Ly8gc2V0IGNvbG9ycywgbWF5YmVcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0Y29tcHV0ZUJvdW5kaW5nQm94OiBmdW5jdGlvbiAoKSB7XG5cblx0XHR2YXIgYm94ID0gbmV3IEJveDMoKTtcblxuXHRcdHJldHVybiBmdW5jdGlvbiBjb21wdXRlQm91bmRpbmdCb3goKSB7XG5cblx0XHRcdGlmICggdGhpcy5ib3VuZGluZ0JveCA9PT0gbnVsbCApIHtcblxuXHRcdFx0XHR0aGlzLmJvdW5kaW5nQm94ID0gbmV3IEJveDMoKTtcblxuXHRcdFx0fVxuXG5cdFx0XHR2YXIgc3RhcnQgPSB0aGlzLmF0dHJpYnV0ZXMuaW5zdGFuY2VTdGFydDtcblx0XHRcdHZhciBlbmQgPSB0aGlzLmF0dHJpYnV0ZXMuaW5zdGFuY2VFbmQ7XG5cblx0XHRcdGlmICggc3RhcnQgIT09IHVuZGVmaW5lZCAmJiBlbmQgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHR0aGlzLmJvdW5kaW5nQm94LnNldEZyb21CdWZmZXJBdHRyaWJ1dGUoIHN0YXJ0ICk7XG5cblx0XHRcdFx0Ym94LnNldEZyb21CdWZmZXJBdHRyaWJ1dGUoIGVuZCApO1xuXG5cdFx0XHRcdHRoaXMuYm91bmRpbmdCb3gudW5pb24oIGJveCApO1xuXG5cdFx0XHR9XG5cblx0XHR9O1xuXG5cdH0oKSxcblxuXHRjb21wdXRlQm91bmRpbmdTcGhlcmU6IGZ1bmN0aW9uICgpIHtcblxuXHRcdHZhciB2ZWN0b3IgPSBuZXcgVmVjdG9yMygpO1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uIGNvbXB1dGVCb3VuZGluZ1NwaGVyZSgpIHtcblxuXHRcdFx0aWYgKCB0aGlzLmJvdW5kaW5nU3BoZXJlID09PSBudWxsICkge1xuXG5cdFx0XHRcdHRoaXMuYm91bmRpbmdTcGhlcmUgPSBuZXcgU3BoZXJlKCk7XG5cblx0XHRcdH1cblxuXHRcdFx0aWYgKCB0aGlzLmJvdW5kaW5nQm94ID09PSBudWxsICkge1xuXG5cdFx0XHRcdHRoaXMuY29tcHV0ZUJvdW5kaW5nQm94KCk7XG5cblx0XHRcdH1cblxuXHRcdFx0dmFyIHN0YXJ0ID0gdGhpcy5hdHRyaWJ1dGVzLmluc3RhbmNlU3RhcnQ7XG5cdFx0XHR2YXIgZW5kID0gdGhpcy5hdHRyaWJ1dGVzLmluc3RhbmNlRW5kO1xuXG5cdFx0XHRpZiAoIHN0YXJ0ICE9PSB1bmRlZmluZWQgJiYgZW5kICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0dmFyIGNlbnRlciA9IHRoaXMuYm91bmRpbmdTcGhlcmUuY2VudGVyO1xuXG5cdFx0XHRcdHRoaXMuYm91bmRpbmdCb3guZ2V0Q2VudGVyKCBjZW50ZXIgKTtcblxuXHRcdFx0XHR2YXIgbWF4UmFkaXVzU3EgPSAwO1xuXG5cdFx0XHRcdGZvciAoIHZhciBpID0gMCwgaWwgPSBzdGFydC5jb3VudDsgaSA8IGlsOyBpICsrICkge1xuXG5cdFx0XHRcdFx0dmVjdG9yLmZyb21CdWZmZXJBdHRyaWJ1dGUoIHN0YXJ0LCBpICk7XG5cdFx0XHRcdFx0bWF4UmFkaXVzU3EgPSBNYXRoLm1heCggbWF4UmFkaXVzU3EsIGNlbnRlci5kaXN0YW5jZVRvU3F1YXJlZCggdmVjdG9yICkgKTtcblxuXHRcdFx0XHRcdHZlY3Rvci5mcm9tQnVmZmVyQXR0cmlidXRlKCBlbmQsIGkgKTtcblx0XHRcdFx0XHRtYXhSYWRpdXNTcSA9IE1hdGgubWF4KCBtYXhSYWRpdXNTcSwgY2VudGVyLmRpc3RhbmNlVG9TcXVhcmVkKCB2ZWN0b3IgKSApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLmJvdW5kaW5nU3BoZXJlLnJhZGl1cyA9IE1hdGguc3FydCggbWF4UmFkaXVzU3EgKTtcblxuXHRcdFx0XHRpZiAoIGlzTmFOKCB0aGlzLmJvdW5kaW5nU3BoZXJlLnJhZGl1cyApICkge1xuXG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvciggJ1RIUkVFLkxpbmVTZWdtZW50c0dlb21ldHJ5LmNvbXB1dGVCb3VuZGluZ1NwaGVyZSgpOiBDb21wdXRlZCByYWRpdXMgaXMgTmFOLiBUaGUgaW5zdGFuY2VkIHBvc2l0aW9uIGRhdGEgaXMgbGlrZWx5IHRvIGhhdmUgTmFOIHZhbHVlcy4nLCB0aGlzICk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHR9O1xuXG5cdH0oKSxcblxuXHR0b0pTT046IGZ1bmN0aW9uICgpIHtcblxuXHRcdC8vIHRvZG9cblxuXHR9LFxuXG5cdGFwcGx5TWF0cml4OiBmdW5jdGlvbiAoIG1hdHJpeCApIHtcblxuXHRcdGNvbnNvbGUud2FybiggJ1RIUkVFLkxpbmVTZWdtZW50c0dlb21ldHJ5OiBhcHBseU1hdHJpeCgpIGhhcyBiZWVuIHJlbmFtZWQgdG8gYXBwbHlNYXRyaXg0KCkuJyApO1xuXG5cdFx0cmV0dXJuIHRoaXMuYXBwbHlNYXRyaXg0KCBtYXRyaXggKTtcblxuXHR9XG5cbn0gKTtcblxuZXhwb3J0IHsgTGluZVNlZ21lbnRzR2VvbWV0cnkgfTtcbiIsIlxuaW1wb3J0IHsgTGluZVNlZ21lbnRzR2VvbWV0cnkgfSBmcm9tIFwiLi9MaW5lU2VnbWVudHNHZW9tZXRyeVwiO1xuXG52YXIgTGluZUdlb21ldHJ5ID0gZnVuY3Rpb24gKCkge1xuXG5cdExpbmVTZWdtZW50c0dlb21ldHJ5LmNhbGwoIHRoaXMgKTtcblxuXHR0aGlzLnR5cGUgPSAnTGluZUdlb21ldHJ5JztcblxufTtcblxuTGluZUdlb21ldHJ5LnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oIE9iamVjdC5jcmVhdGUoIExpbmVTZWdtZW50c0dlb21ldHJ5LnByb3RvdHlwZSApLCB7XG5cblx0Y29uc3RydWN0b3I6IExpbmVHZW9tZXRyeSxcblxuXHRpc0xpbmVHZW9tZXRyeTogdHJ1ZSxcblxuXHRzZXRQb3NpdGlvbnM6IGZ1bmN0aW9uICggYXJyYXkgKSB7XG5cblx0XHQvLyBjb252ZXJ0cyBbIHgxLCB5MSwgejEsICB4MiwgeTIsIHoyLCAuLi4gXSB0byBwYWlycyBmb3JtYXRcblxuXHRcdHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGggLSAzO1xuXHRcdHZhciBwb2ludHMgPSBuZXcgRmxvYXQzMkFycmF5KCAyICogbGVuZ3RoICk7XG5cblx0XHRmb3IgKCB2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMyApIHtcblxuXHRcdFx0cG9pbnRzWyAyICogaSBdID0gYXJyYXlbIGkgXTtcblx0XHRcdHBvaW50c1sgMiAqIGkgKyAxIF0gPSBhcnJheVsgaSArIDEgXTtcblx0XHRcdHBvaW50c1sgMiAqIGkgKyAyIF0gPSBhcnJheVsgaSArIDIgXTtcblxuXHRcdFx0cG9pbnRzWyAyICogaSArIDMgXSA9IGFycmF5WyBpICsgMyBdO1xuXHRcdFx0cG9pbnRzWyAyICogaSArIDQgXSA9IGFycmF5WyBpICsgNCBdO1xuXHRcdFx0cG9pbnRzWyAyICogaSArIDUgXSA9IGFycmF5WyBpICsgNSBdO1xuXG5cdFx0fVxuXG5cdFx0TGluZVNlZ21lbnRzR2VvbWV0cnkucHJvdG90eXBlLnNldFBvc2l0aW9ucy5jYWxsKCB0aGlzLCBwb2ludHMgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0c2V0Q29sb3JzOiBmdW5jdGlvbiAoIGFycmF5ICkge1xuXG5cdFx0Ly8gY29udmVydHMgWyByMSwgZzEsIGIxLCAgcjIsIGcyLCBiMiwgLi4uIF0gdG8gcGFpcnMgZm9ybWF0XG5cblx0XHR2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoIC0gMztcblx0XHR2YXIgY29sb3JzID0gbmV3IEZsb2F0MzJBcnJheSggMiAqIGxlbmd0aCApO1xuXG5cdFx0Zm9yICggdmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDMgKSB7XG5cblx0XHRcdGNvbG9yc1sgMiAqIGkgXSA9IGFycmF5WyBpIF07XG5cdFx0XHRjb2xvcnNbIDIgKiBpICsgMSBdID0gYXJyYXlbIGkgKyAxIF07XG5cdFx0XHRjb2xvcnNbIDIgKiBpICsgMiBdID0gYXJyYXlbIGkgKyAyIF07XG5cblx0XHRcdGNvbG9yc1sgMiAqIGkgKyAzIF0gPSBhcnJheVsgaSArIDMgXTtcblx0XHRcdGNvbG9yc1sgMiAqIGkgKyA0IF0gPSBhcnJheVsgaSArIDQgXTtcblx0XHRcdGNvbG9yc1sgMiAqIGkgKyA1IF0gPSBhcnJheVsgaSArIDUgXTtcblxuXHRcdH1cblxuXHRcdExpbmVTZWdtZW50c0dlb21ldHJ5LnByb3RvdHlwZS5zZXRDb2xvcnMuY2FsbCggdGhpcywgY29sb3JzICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdGZyb21MaW5lOiBmdW5jdGlvbiAoIGxpbmUgKSB7XG5cblx0XHR2YXIgZ2VvbWV0cnkgPSBsaW5lLmdlb21ldHJ5O1xuXG5cdFx0aWYgKCBnZW9tZXRyeS5pc0dlb21ldHJ5ICkge1xuXG5cdFx0XHR0aGlzLnNldFBvc2l0aW9ucyggZ2VvbWV0cnkudmVydGljZXMgKTtcblxuXHRcdH0gZWxzZSBpZiAoIGdlb21ldHJ5LmlzQnVmZmVyR2VvbWV0cnkgKSB7XG5cblx0XHRcdHRoaXMuc2V0UG9zaXRpb25zKCBnZW9tZXRyeS5hdHRyaWJ1dGVzLnBvc2l0aW9uLmFycmF5ICk7IC8vIGFzc3VtZXMgbm9uLWluZGV4ZWRcblxuXHRcdH1cblxuXHRcdC8vIHNldCBjb2xvcnMsIG1heWJlXG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdGNvcHk6IGZ1bmN0aW9uICggLyogc291cmNlICovICkge1xuXG5cdFx0Ly8gdG9kb1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG59ICk7XG5cbmV4cG9ydCB7IExpbmVHZW9tZXRyeSB9O1xuIiwiaW1wb3J0IHtcblx0SW5zdGFuY2VkSW50ZXJsZWF2ZWRCdWZmZXIsXG5cdEludGVybGVhdmVkQnVmZmVyQXR0cmlidXRlLFxuXHRMaW5lMyxcblx0TWF0aFV0aWxzLFxuXHRNYXRyaXg0LFxuXHRNZXNoLFxuXHRWZWN0b3IzLFxuXHRWZWN0b3I0XG59IGZyb20gXCJ0aHJlZVwiO1xuaW1wb3J0IHsgTGluZVNlZ21lbnRzR2VvbWV0cnkgfSBmcm9tIFwiLi9MaW5lU2VnbWVudHNHZW9tZXRyeVwiO1xuaW1wb3J0IHsgTGluZU1hdGVyaWFsIH0gZnJvbSBcIi4vTGluZU1hdGVyaWFsXCI7XG5cbnZhciBMaW5lU2VnbWVudHMyID0gZnVuY3Rpb24gKCBnZW9tZXRyeSwgbWF0ZXJpYWwgKSB7XG5cblx0aWYgKCBnZW9tZXRyeSA9PT0gdW5kZWZpbmVkICkgZ2VvbWV0cnkgPSBuZXcgTGluZVNlZ21lbnRzR2VvbWV0cnkoKTtcblx0aWYgKCBtYXRlcmlhbCA9PT0gdW5kZWZpbmVkICkgbWF0ZXJpYWwgPSBuZXcgTGluZU1hdGVyaWFsKCB7IGNvbG9yOiBNYXRoLnJhbmRvbSgpICogMHhmZmZmZmYgfSApO1xuXG5cdE1lc2guY2FsbCggdGhpcywgZ2VvbWV0cnksIG1hdGVyaWFsICk7XG5cblx0dGhpcy50eXBlID0gJ0xpbmVTZWdtZW50czInO1xuXG59O1xuXG5MaW5lU2VnbWVudHMyLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oIE9iamVjdC5jcmVhdGUoIE1lc2gucHJvdG90eXBlICksIHtcblxuXHRjb25zdHJ1Y3RvcjogTGluZVNlZ21lbnRzMixcblxuXHRpc0xpbmVTZWdtZW50czI6IHRydWUsXG5cblx0Y29tcHV0ZUxpbmVEaXN0YW5jZXM6ICggZnVuY3Rpb24gKCkgeyAvLyBmb3IgYmFja3dhcmRzLWNvbXBhdGFiaWxpdHksIGJ1dCBjb3VsZCBiZSBhIG1ldGhvZCBvZiBMaW5lU2VnbWVudHNHZW9tZXRyeS4uLlxuXG5cdFx0dmFyIHN0YXJ0ID0gbmV3IFZlY3RvcjMoKTtcblx0XHR2YXIgZW5kID0gbmV3IFZlY3RvcjMoKTtcblxuXHRcdHJldHVybiBmdW5jdGlvbiBjb21wdXRlTGluZURpc3RhbmNlcygpIHtcblxuXHRcdFx0dmFyIGdlb21ldHJ5ID0gdGhpcy5nZW9tZXRyeTtcblxuXHRcdFx0dmFyIGluc3RhbmNlU3RhcnQgPSBnZW9tZXRyeS5hdHRyaWJ1dGVzLmluc3RhbmNlU3RhcnQ7XG5cdFx0XHR2YXIgaW5zdGFuY2VFbmQgPSBnZW9tZXRyeS5hdHRyaWJ1dGVzLmluc3RhbmNlRW5kO1xuXHRcdFx0dmFyIGxpbmVEaXN0YW5jZXMgPSBuZXcgRmxvYXQzMkFycmF5KCAyICogaW5zdGFuY2VTdGFydC5kYXRhLmNvdW50ICk7XG5cblx0XHRcdGZvciAoIHZhciBpID0gMCwgaiA9IDAsIGwgPSBpbnN0YW5jZVN0YXJ0LmRhdGEuY291bnQ7IGkgPCBsOyBpICsrLCBqICs9IDIgKSB7XG5cblx0XHRcdFx0c3RhcnQuZnJvbUJ1ZmZlckF0dHJpYnV0ZSggaW5zdGFuY2VTdGFydCwgaSApO1xuXHRcdFx0XHRlbmQuZnJvbUJ1ZmZlckF0dHJpYnV0ZSggaW5zdGFuY2VFbmQsIGkgKTtcblxuXHRcdFx0XHRsaW5lRGlzdGFuY2VzWyBqIF0gPSAoIGogPT09IDAgKSA/IDAgOiBsaW5lRGlzdGFuY2VzWyBqIC0gMSBdO1xuXHRcdFx0XHRsaW5lRGlzdGFuY2VzWyBqICsgMSBdID0gbGluZURpc3RhbmNlc1sgaiBdICsgc3RhcnQuZGlzdGFuY2VUbyggZW5kICk7XG5cblx0XHRcdH1cblxuXHRcdFx0dmFyIGluc3RhbmNlRGlzdGFuY2VCdWZmZXIgPSBuZXcgSW5zdGFuY2VkSW50ZXJsZWF2ZWRCdWZmZXIoIGxpbmVEaXN0YW5jZXMsIDIsIDEgKTsgLy8gZDAsIGQxXG5cblx0XHRcdGdlb21ldHJ5LnNldEF0dHJpYnV0ZSggJ2luc3RhbmNlRGlzdGFuY2VTdGFydCcsIG5ldyBJbnRlcmxlYXZlZEJ1ZmZlckF0dHJpYnV0ZSggaW5zdGFuY2VEaXN0YW5jZUJ1ZmZlciwgMSwgMCApICk7IC8vIGQwXG5cdFx0XHRnZW9tZXRyeS5zZXRBdHRyaWJ1dGUoICdpbnN0YW5jZURpc3RhbmNlRW5kJywgbmV3IEludGVybGVhdmVkQnVmZmVyQXR0cmlidXRlKCBpbnN0YW5jZURpc3RhbmNlQnVmZmVyLCAxLCAxICkgKTsgLy8gZDFcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cblx0XHR9O1xuXG5cdH0oKSApLFxuXG5cdHJheWNhc3Q6ICggZnVuY3Rpb24gKCkge1xuXG5cdFx0dmFyIHN0YXJ0ID0gbmV3IFZlY3RvcjQoKTtcblx0XHR2YXIgZW5kID0gbmV3IFZlY3RvcjQoKTtcblxuXHRcdHZhciBzc09yaWdpbiA9IG5ldyBWZWN0b3I0KCk7XG5cdFx0dmFyIHNzT3JpZ2luMyA9IG5ldyBWZWN0b3IzKCk7XG5cdFx0dmFyIG12TWF0cml4ID0gbmV3IE1hdHJpeDQoKTtcblx0XHR2YXIgbGluZSA9IG5ldyBMaW5lMygpO1xuXHRcdHZhciBjbG9zZXN0UG9pbnQgPSBuZXcgVmVjdG9yMygpO1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uIHJheWNhc3QoIHJheWNhc3RlciwgaW50ZXJzZWN0cyApIHtcblxuXHRcdFx0aWYgKCByYXljYXN0ZXIuY2FtZXJhID09PSBudWxsICkge1xuXG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoICdMaW5lU2VnbWVudHMyOiBcIlJheWNhc3Rlci5jYW1lcmFcIiBuZWVkcyB0byBiZSBzZXQgaW4gb3JkZXIgdG8gcmF5Y2FzdCBhZ2FpbnN0IExpbmVTZWdtZW50czIuJyApO1xuXG5cdFx0XHR9XG5cblx0XHRcdHZhciB0aHJlc2hvbGQgPSAoIHJheWNhc3Rlci5wYXJhbXMuTGluZTIgIT09IHVuZGVmaW5lZCApID8gcmF5Y2FzdGVyLnBhcmFtcy5MaW5lMi50aHJlc2hvbGQgfHwgMCA6IDA7XG5cblx0XHRcdHZhciByYXkgPSByYXljYXN0ZXIucmF5O1xuXHRcdFx0dmFyIGNhbWVyYSA9IHJheWNhc3Rlci5jYW1lcmE7XG5cdFx0XHR2YXIgcHJvamVjdGlvbk1hdHJpeCA9IGNhbWVyYS5wcm9qZWN0aW9uTWF0cml4O1xuXG5cdFx0XHR2YXIgZ2VvbWV0cnkgPSB0aGlzLmdlb21ldHJ5O1xuXHRcdFx0dmFyIG1hdGVyaWFsID0gdGhpcy5tYXRlcmlhbDtcblx0XHRcdHZhciByZXNvbHV0aW9uID0gbWF0ZXJpYWwucmVzb2x1dGlvbjtcblx0XHRcdHZhciBsaW5lV2lkdGggPSBtYXRlcmlhbC5saW5ld2lkdGggKyB0aHJlc2hvbGQ7XG5cblx0XHRcdHZhciBpbnN0YW5jZVN0YXJ0ID0gZ2VvbWV0cnkuYXR0cmlidXRlcy5pbnN0YW5jZVN0YXJ0O1xuXHRcdFx0dmFyIGluc3RhbmNlRW5kID0gZ2VvbWV0cnkuYXR0cmlidXRlcy5pbnN0YW5jZUVuZDtcblxuXHRcdFx0Ly8gcGljayBhIHBvaW50IDEgdW5pdCBvdXQgYWxvbmcgdGhlIHJheSB0byBhdm9pZCB0aGUgcmF5IG9yaWdpblxuXHRcdFx0Ly8gc2l0dGluZyBhdCB0aGUgY2FtZXJhIG9yaWdpbiB3aGljaCB3aWxsIGNhdXNlIFwid1wiIHRvIGJlIDAgd2hlblxuXHRcdFx0Ly8gYXBwbHlpbmcgdGhlIHByb2plY3Rpb24gbWF0cml4LlxuXHRcdFx0cmF5LmF0KCAxLCBzc09yaWdpbiApO1xuXG5cdFx0XHQvLyBuZGMgc3BhY2UgWyAtIDEuMCwgMS4wIF1cblx0XHRcdHNzT3JpZ2luLncgPSAxO1xuXHRcdFx0c3NPcmlnaW4uYXBwbHlNYXRyaXg0KCBjYW1lcmEubWF0cml4V29ybGRJbnZlcnNlICk7XG5cdFx0XHRzc09yaWdpbi5hcHBseU1hdHJpeDQoIHByb2plY3Rpb25NYXRyaXggKTtcblx0XHRcdHNzT3JpZ2luLm11bHRpcGx5U2NhbGFyKCAxIC8gc3NPcmlnaW4udyApO1xuXG5cdFx0XHQvLyBzY3JlZW4gc3BhY2Vcblx0XHRcdHNzT3JpZ2luLnggKj0gcmVzb2x1dGlvbi54IC8gMjtcblx0XHRcdHNzT3JpZ2luLnkgKj0gcmVzb2x1dGlvbi55IC8gMjtcblx0XHRcdHNzT3JpZ2luLnogPSAwO1xuXG5cdFx0XHRzc09yaWdpbjMuY29weSggc3NPcmlnaW4gKTtcblxuXHRcdFx0dmFyIG1hdHJpeFdvcmxkID0gdGhpcy5tYXRyaXhXb3JsZDtcblx0XHRcdG12TWF0cml4Lm11bHRpcGx5TWF0cmljZXMoIGNhbWVyYS5tYXRyaXhXb3JsZEludmVyc2UsIG1hdHJpeFdvcmxkICk7XG5cblx0XHRcdGZvciAoIHZhciBpID0gMCwgbCA9IGluc3RhbmNlU3RhcnQuY291bnQ7IGkgPCBsOyBpICsrICkge1xuXG5cdFx0XHRcdHN0YXJ0LmZyb21CdWZmZXJBdHRyaWJ1dGUoIGluc3RhbmNlU3RhcnQsIGkgKTtcblx0XHRcdFx0ZW5kLmZyb21CdWZmZXJBdHRyaWJ1dGUoIGluc3RhbmNlRW5kLCBpICk7XG5cblx0XHRcdFx0c3RhcnQudyA9IDE7XG5cdFx0XHRcdGVuZC53ID0gMTtcblxuXHRcdFx0XHQvLyBjYW1lcmEgc3BhY2Vcblx0XHRcdFx0c3RhcnQuYXBwbHlNYXRyaXg0KCBtdk1hdHJpeCApO1xuXHRcdFx0XHRlbmQuYXBwbHlNYXRyaXg0KCBtdk1hdHJpeCApO1xuXG5cdFx0XHRcdC8vIGNsaXAgc3BhY2Vcblx0XHRcdFx0c3RhcnQuYXBwbHlNYXRyaXg0KCBwcm9qZWN0aW9uTWF0cml4ICk7XG5cdFx0XHRcdGVuZC5hcHBseU1hdHJpeDQoIHByb2plY3Rpb25NYXRyaXggKTtcblxuXHRcdFx0XHQvLyBuZGMgc3BhY2UgWyAtIDEuMCwgMS4wIF1cblx0XHRcdFx0c3RhcnQubXVsdGlwbHlTY2FsYXIoIDEgLyBzdGFydC53ICk7XG5cdFx0XHRcdGVuZC5tdWx0aXBseVNjYWxhciggMSAvIGVuZC53ICk7XG5cblx0XHRcdFx0Ly8gc2tpcCB0aGUgc2VnbWVudCBpZiBpdCdzIG91dHNpZGUgdGhlIGNhbWVyYSBuZWFyIGFuZCBmYXIgcGxhbmVzXG5cdFx0XHRcdHZhciBpc0JlaGluZENhbWVyYU5lYXIgPSBzdGFydC56IDwgLSAxICYmIGVuZC56IDwgLSAxO1xuXHRcdFx0XHR2YXIgaXNQYXN0Q2FtZXJhRmFyID0gc3RhcnQueiA+IDEgJiYgZW5kLnogPiAxO1xuXHRcdFx0XHRpZiAoIGlzQmVoaW5kQ2FtZXJhTmVhciB8fCBpc1Bhc3RDYW1lcmFGYXIgKSB7XG5cblx0XHRcdFx0XHRjb250aW51ZTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gc2NyZWVuIHNwYWNlXG5cdFx0XHRcdHN0YXJ0LnggKj0gcmVzb2x1dGlvbi54IC8gMjtcblx0XHRcdFx0c3RhcnQueSAqPSByZXNvbHV0aW9uLnkgLyAyO1xuXG5cdFx0XHRcdGVuZC54ICo9IHJlc29sdXRpb24ueCAvIDI7XG5cdFx0XHRcdGVuZC55ICo9IHJlc29sdXRpb24ueSAvIDI7XG5cblx0XHRcdFx0Ly8gY3JlYXRlIDJkIHNlZ21lbnRcblx0XHRcdFx0bGluZS5zdGFydC5jb3B5KCBzdGFydCApO1xuXHRcdFx0XHRsaW5lLnN0YXJ0LnogPSAwO1xuXG5cdFx0XHRcdGxpbmUuZW5kLmNvcHkoIGVuZCApO1xuXHRcdFx0XHRsaW5lLmVuZC56ID0gMDtcblxuXHRcdFx0XHQvLyBnZXQgY2xvc2VzdCBwb2ludCBvbiByYXkgdG8gc2VnbWVudFxuXHRcdFx0XHR2YXIgcGFyYW0gPSBsaW5lLmNsb3Nlc3RQb2ludFRvUG9pbnRQYXJhbWV0ZXIoIHNzT3JpZ2luMywgdHJ1ZSApO1xuXHRcdFx0XHRsaW5lLmF0KCBwYXJhbSwgY2xvc2VzdFBvaW50ICk7XG5cblx0XHRcdFx0Ly8gY2hlY2sgaWYgdGhlIGludGVyc2VjdGlvbiBwb2ludCBpcyB3aXRoaW4gY2xpcCBzcGFjZVxuXHRcdFx0XHR2YXIgelBvcyA9IE1hdGhVdGlscy5sZXJwKCBzdGFydC56LCBlbmQueiwgcGFyYW0gKTtcblx0XHRcdFx0dmFyIGlzSW5DbGlwU3BhY2UgPSB6UG9zID49IC0gMSAmJiB6UG9zIDw9IDE7XG5cblx0XHRcdFx0dmFyIGlzSW5zaWRlID0gc3NPcmlnaW4zLmRpc3RhbmNlVG8oIGNsb3Nlc3RQb2ludCApIDwgbGluZVdpZHRoICogMC41O1xuXG5cdFx0XHRcdGlmICggaXNJbkNsaXBTcGFjZSAmJiBpc0luc2lkZSApIHtcblxuXHRcdFx0XHRcdGxpbmUuc3RhcnQuZnJvbUJ1ZmZlckF0dHJpYnV0ZSggaW5zdGFuY2VTdGFydCwgaSApO1xuXHRcdFx0XHRcdGxpbmUuZW5kLmZyb21CdWZmZXJBdHRyaWJ1dGUoIGluc3RhbmNlRW5kLCBpICk7XG5cblx0XHRcdFx0XHRsaW5lLnN0YXJ0LmFwcGx5TWF0cml4NCggbWF0cml4V29ybGQgKTtcblx0XHRcdFx0XHRsaW5lLmVuZC5hcHBseU1hdHJpeDQoIG1hdHJpeFdvcmxkICk7XG5cblx0XHRcdFx0XHR2YXIgcG9pbnRPbkxpbmUgPSBuZXcgVmVjdG9yMygpO1xuXHRcdFx0XHRcdHZhciBwb2ludCA9IG5ldyBWZWN0b3IzKCk7XG5cblx0XHRcdFx0XHRyYXkuZGlzdGFuY2VTcVRvU2VnbWVudCggbGluZS5zdGFydCwgbGluZS5lbmQsIHBvaW50LCBwb2ludE9uTGluZSApO1xuXG5cdFx0XHRcdFx0aW50ZXJzZWN0cy5wdXNoKCB7XG5cblx0XHRcdFx0XHRcdHBvaW50OiBwb2ludCxcblx0XHRcdFx0XHRcdHBvaW50T25MaW5lOiBwb2ludE9uTGluZSxcblx0XHRcdFx0XHRcdGRpc3RhbmNlOiByYXkub3JpZ2luLmRpc3RhbmNlVG8oIHBvaW50ICksXG5cblx0XHRcdFx0XHRcdG9iamVjdDogdGhpcyxcblx0XHRcdFx0XHRcdGZhY2U6IG51bGwsXG5cdFx0XHRcdFx0XHRmYWNlSW5kZXg6IGksXG5cdFx0XHRcdFx0XHR1djogbnVsbCxcblx0XHRcdFx0XHRcdHV2MjogbnVsbCxcblxuXHRcdFx0XHRcdH0gKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdH07XG5cblx0fSgpIClcblxufSApO1xuXG5leHBvcnQgeyBMaW5lU2VnbWVudHMyIH07XG4iLCJcbmltcG9ydCB7IExpbmVTZWdtZW50czIgfSBmcm9tIFwiLi9MaW5lU2VnbWVudHMyXCI7XG5pbXBvcnQgeyBMaW5lR2VvbWV0cnkgfSBmcm9tIFwiLi9MaW5lR2VvbWV0cnlcIjtcbmltcG9ydCB7IExpbmVNYXRlcmlhbCB9IGZyb20gXCIuL0xpbmVNYXRlcmlhbFwiO1xuXG52YXIgTGluZTIgPSBmdW5jdGlvbiAoIGdlb21ldHJ5LCBtYXRlcmlhbCApIHtcblxuXHRpZiAoIGdlb21ldHJ5ID09PSB1bmRlZmluZWQgKSBnZW9tZXRyeSA9IG5ldyBMaW5lR2VvbWV0cnkoKTtcblx0aWYgKCBtYXRlcmlhbCA9PT0gdW5kZWZpbmVkICkgbWF0ZXJpYWwgPSBuZXcgTGluZU1hdGVyaWFsKCB7IGNvbG9yOiBNYXRoLnJhbmRvbSgpICogMHhmZmZmZmYgfSApO1xuXG5cdExpbmVTZWdtZW50czIuY2FsbCggdGhpcywgZ2VvbWV0cnksIG1hdGVyaWFsICk7XG5cblx0dGhpcy50eXBlID0gJ0xpbmUyJztcblxufTtcblxuTGluZTIucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbiggT2JqZWN0LmNyZWF0ZSggTGluZVNlZ21lbnRzMi5wcm90b3R5cGUgKSwge1xuXG5cdGNvbnN0cnVjdG9yOiBMaW5lMixcblxuXHRpc0xpbmUyOiB0cnVlXG5cbn0gKTtcblxuZXhwb3J0IHsgTGluZTIgfTtcbiIsIi8qXHJcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIEJsdWVNYXAsIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZSAoTUlUKS5cclxuICpcclxuICogQ29weXJpZ2h0IChjKSBCbHVlIChMdWthcyBSaWVnZXIpIDxodHRwczovL2JsdWVjb2xvcmVkLmRlPlxyXG4gKiBDb3B5cmlnaHQgKGMpIGNvbnRyaWJ1dG9yc1xyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlICdTb2Z0d2FyZScpLCB0byBkZWFsXHJcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuICpcclxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cclxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbiAqXHJcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCAnQVMgSVMnLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXHJcbiAqIFRIRSBTT0ZUV0FSRS5cclxuICovXHJcbmltcG9ydCB7IFNoYWRlckNodW5rIH0gZnJvbSAndGhyZWUnO1xyXG5cclxuZXhwb3J0IGNvbnN0IE1BUktFUl9GSUxMX0ZSQUdNRU5UX1NIQURFUiA9IGBcclxuJHtTaGFkZXJDaHVuay5sb2dkZXB0aGJ1Zl9wYXJzX2ZyYWdtZW50fVxyXG5cclxudmFyeWluZyB2ZWMzIHZQb3NpdGlvbjtcclxudmFyeWluZyB2ZWMzIHZXb3JsZFBvc2l0aW9uO1xyXG52YXJ5aW5nIHZlYzMgdk5vcm1hbDtcclxudmFyeWluZyB2ZWMyIHZVdjtcclxudmFyeWluZyB2ZWMzIHZDb2xvcjtcclxuXHJcbnVuaWZvcm0gdmVjNCBtYXJrZXJDb2xvcjtcclxuXHJcbnZvaWQgbWFpbigpIHtcclxuXHR2ZWM0IGNvbG9yID0gbWFya2VyQ29sb3I7XHJcblx0XHJcblx0Ly9hcHBseSB2ZXJ0ZXgtY29sb3JcclxuXHRjb2xvci5yZ2IgKj0gdkNvbG9yLnJnYjtcclxuXHRcclxuXHRnbF9GcmFnQ29sb3IgPSBjb2xvcjtcclxuXHRcclxuXHQke1NoYWRlckNodW5rLmxvZ2RlcHRoYnVmX2ZyYWdtZW50fVxyXG59XHJcbmA7XHJcbiIsIi8qXHJcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIEJsdWVNYXAsIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZSAoTUlUKS5cclxuICpcclxuICogQ29weXJpZ2h0IChjKSBCbHVlIChMdWthcyBSaWVnZXIpIDxodHRwczovL2JsdWVjb2xvcmVkLmRlPlxyXG4gKiBDb3B5cmlnaHQgKGMpIGNvbnRyaWJ1dG9yc1xyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlICdTb2Z0d2FyZScpLCB0byBkZWFsXHJcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuICpcclxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cclxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbiAqXHJcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCAnQVMgSVMnLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXHJcbiAqIFRIRSBTT0ZUV0FSRS5cclxuICovXHJcbmltcG9ydCB7IFNoYWRlckNodW5rIH0gZnJvbSAndGhyZWUnO1xyXG5cclxuZXhwb3J0IGNvbnN0IE1BUktFUl9GSUxMX1ZFUlRFWF9TSEFERVIgPSBgXHJcbiNpbmNsdWRlIDxjb21tb24+XHJcbiR7U2hhZGVyQ2h1bmsubG9nZGVwdGhidWZfcGFyc192ZXJ0ZXh9XHJcblxyXG52YXJ5aW5nIHZlYzMgdlBvc2l0aW9uO1xyXG52YXJ5aW5nIHZlYzMgdldvcmxkUG9zaXRpb247XHJcbnZhcnlpbmcgdmVjMyB2Tm9ybWFsO1xyXG52YXJ5aW5nIHZlYzIgdlV2O1xyXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xyXG5cclxudm9pZCBtYWluKCkge1xyXG5cdHZQb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdHZXb3JsZFBvc2l0aW9uID0gKG1vZGVsTWF0cml4ICogdmVjNChwb3NpdGlvbiwgMSkpLnh5ejtcclxuXHR2Tm9ybWFsID0gbm9ybWFsO1xyXG5cdHZVdiA9IHV2O1xyXG5cdHZDb2xvciA9IHZlYzMoMS4wKTtcclxuXHRcclxuXHRnbF9Qb3NpdGlvbiA9IFxyXG5cdFx0cHJvamVjdGlvbk1hdHJpeCAqXHJcblx0XHR2aWV3TWF0cml4ICpcclxuXHRcdG1vZGVsTWF0cml4ICpcclxuXHRcdHZlYzQocG9zaXRpb24sIDEpO1xyXG5cdFxyXG5cdCR7U2hhZGVyQ2h1bmsubG9nZGVwdGhidWZfdmVydGV4fSBcclxufVxyXG5gO1xyXG4iLCJpbXBvcnQge01hcmtlcn0gZnJvbSBcIi4vTWFya2VyXCI7XHJcbmltcG9ydCB7XHJcbiAgICBDb2xvcixcclxuICAgIERvdWJsZVNpZGUsXHJcbiAgICBNZXNoLFxyXG4gICAgT2JqZWN0M0QsIFNoYWRlck1hdGVyaWFsLFxyXG4gICAgU2hhcGUsXHJcbiAgICBTaGFwZUJ1ZmZlckdlb21ldHJ5LFxyXG4gICAgVmVjdG9yMlxyXG59IGZyb20gXCJ0aHJlZVwiO1xyXG5pbXBvcnQge0xpbmVNYXRlcmlhbH0gZnJvbSBcIi4uL3V0aWwvbGluZXMvTGluZU1hdGVyaWFsXCI7XHJcbmltcG9ydCB7TGluZUdlb21ldHJ5fSBmcm9tIFwiLi4vdXRpbC9saW5lcy9MaW5lR2VvbWV0cnlcIjtcclxuaW1wb3J0IHtMaW5lMn0gZnJvbSBcIi4uL3V0aWwvbGluZXMvTGluZTJcIjtcclxuaW1wb3J0IHtNQVJLRVJfRklMTF9GUkFHTUVOVF9TSEFERVJ9IGZyb20gXCIuL3NoYWRlci9NYXJrZXJGaWxsRnJhZ21lbnRTaGFkZXJcIjtcclxuaW1wb3J0IHtNQVJLRVJfRklMTF9WRVJURVhfU0hBREVSfSBmcm9tIFwiLi9zaGFkZXIvTWFya2VyRmlsbFZlcnRleFNoYWRlclwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFNoYXBlTWFya2VyIGV4dGVuZHMgTWFya2VyIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihtYXJrZXJTZXQsIGlkLCBwYXJlbnRPYmplY3QpIHtcclxuICAgICAgICBzdXBlcihtYXJrZXJTZXQsIGlkKTtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2lzU2hhcGVNYXJrZXInLCB7dmFsdWU6IHRydWV9KTtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3R5cGUnLCB7dmFsdWU6IFwic2hhcGVcIn0pO1xyXG5cclxuICAgICAgICBsZXQgZmlsbENvbG9yID0gTWFya2VyLm5vcm1hbGl6ZUNvbG9yKHt9KTtcclxuICAgICAgICBsZXQgYm9yZGVyQ29sb3IgPSBNYXJrZXIubm9ybWFsaXplQ29sb3Ioe30pO1xyXG4gICAgICAgIGxldCBsaW5lV2lkdGggPSAyO1xyXG4gICAgICAgIGxldCBkZXB0aFRlc3QgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5fbGluZU9wYWNpdHkgPSAxO1xyXG4gICAgICAgIHRoaXMuX2ZpbGxPcGFjaXR5ID0gMTtcclxuXHJcbiAgICAgICAgdGhpcy5fbWFya2VyT2JqZWN0ID0gbmV3IE9iamVjdDNEKCk7XHJcbiAgICAgICAgdGhpcy5fbWFya2VyT2JqZWN0LnBvc2l0aW9uLmNvcHkodGhpcy5wb3NpdGlvbik7XHJcbiAgICAgICAgcGFyZW50T2JqZWN0LmFkZCh0aGlzLl9tYXJrZXJPYmplY3QpO1xyXG5cclxuICAgICAgICB0aGlzLl9tYXJrZXJGaWxsTWF0ZXJpYWwgPSBuZXcgU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICAgICAgICB2ZXJ0ZXhTaGFkZXI6IE1BUktFUl9GSUxMX1ZFUlRFWF9TSEFERVIsXHJcbiAgICAgICAgICAgIGZyYWdtZW50U2hhZGVyOiBNQVJLRVJfRklMTF9GUkFHTUVOVF9TSEFERVIsXHJcbiAgICAgICAgICAgIHNpZGU6IERvdWJsZVNpZGUsXHJcbiAgICAgICAgICAgIGRlcHRoVGVzdDogZGVwdGhUZXN0LFxyXG4gICAgICAgICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcclxuICAgICAgICAgICAgdW5pZm9ybXM6IHtcclxuICAgICAgICAgICAgICAgIG1hcmtlckNvbG9yOiB7IHZhbHVlOiBmaWxsQ29sb3IudmVjNCB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5fbWFya2VyTGluZU1hdGVyaWFsID0gbmV3IExpbmVNYXRlcmlhbCh7XHJcbiAgICAgICAgICAgIGNvbG9yOiBuZXcgQ29sb3IoYm9yZGVyQ29sb3IucmdiKSxcclxuICAgICAgICAgICAgb3BhY2l0eTogYm9yZGVyQ29sb3IuYSxcclxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXHJcbiAgICAgICAgICAgIGxpbmV3aWR0aDogbGluZVdpZHRoLFxyXG4gICAgICAgICAgICBkZXB0aFRlc3Q6IGRlcHRoVGVzdCxcclxuICAgICAgICAgICAgdmVydGV4Q29sb3JzOiBmYWxzZSxcclxuICAgICAgICAgICAgZGFzaGVkOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX21hcmtlckxpbmVNYXRlcmlhbC5yZXNvbHV0aW9uLnNldCh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUobWFya2VyRGF0YSkge1xyXG4gICAgICAgIHN1cGVyLnVwZGF0ZShtYXJrZXJEYXRhKTtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IG1hcmtlckRhdGEuaGVpZ2h0ID8gcGFyc2VGbG9hdChtYXJrZXJEYXRhLmhlaWdodCkgOiAwLjA7XHJcbiAgICAgICAgdGhpcy5kZXB0aFRlc3QgPSAhIW1hcmtlckRhdGEuZGVwdGhUZXN0O1xyXG5cclxuICAgICAgICBpZiAobWFya2VyRGF0YS5maWxsQ29sb3IpIHRoaXMuZmlsbENvbG9yID0gbWFya2VyRGF0YS5maWxsQ29sb3I7XHJcbiAgICAgICAgaWYgKG1hcmtlckRhdGEuYm9yZGVyQ29sb3IpIHRoaXMuYm9yZGVyQ29sb3IgPSBtYXJrZXJEYXRhLmJvcmRlckNvbG9yO1xyXG5cclxuICAgICAgICB0aGlzLmxpbmVXaWR0aCA9IG1hcmtlckRhdGEubGluZVdpZHRoID8gcGFyc2VGbG9hdChtYXJrZXJEYXRhLmxpbmVXaWR0aCkgOiAyO1xyXG5cclxuICAgICAgICBsZXQgcG9pbnRzID0gW107XHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkobWFya2VyRGF0YS5zaGFwZSkpIHtcclxuICAgICAgICAgICAgbWFya2VyRGF0YS5zaGFwZS5mb3JFYWNoKHBvaW50ID0+IHtcclxuICAgICAgICAgICAgICAgIHBvaW50cy5wdXNoKG5ldyBWZWN0b3IyKHBhcnNlRmxvYXQocG9pbnQueCksIHBhcnNlRmxvYXQocG9pbnQueikpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2hhcGUgPSBwb2ludHM7XHJcbiAgICB9XHJcblxyXG4gICAgX29uQmVmb3JlUmVuZGVyKHJlbmRlcmVyLCBzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgICAgc3VwZXIuX29uQmVmb3JlUmVuZGVyKHJlbmRlcmVyLCBzY2VuZSwgY2FtZXJhKTtcclxuXHJcbiAgICAgICAgdGhpcy5fbWFya2VyRmlsbE1hdGVyaWFsLnVuaWZvcm1zLm1hcmtlckNvbG9yLnZhbHVlLncgPSB0aGlzLl9maWxsT3BhY2l0eSAqIHRoaXMuX29wYWNpdHk7XHJcbiAgICAgICAgdGhpcy5fbWFya2VyTGluZU1hdGVyaWFsLm9wYWNpdHkgPSB0aGlzLl9saW5lT3BhY2l0eSAqIHRoaXMuX29wYWNpdHk7XHJcbiAgICB9XHJcblxyXG4gICAgZGlzcG9zZSgpIHtcclxuICAgICAgICB0aGlzLl9tYXJrZXJPYmplY3QucGFyZW50LnJlbW92ZSh0aGlzLl9tYXJrZXJPYmplY3QpO1xyXG4gICAgICAgIHRoaXMuX21hcmtlck9iamVjdC5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcclxuICAgICAgICAgICAgaWYgKGNoaWxkLmdlb21ldHJ5ICYmIGNoaWxkLmdlb21ldHJ5LmlzR2VvbWV0cnkpIGNoaWxkLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9tYXJrZXJPYmplY3QuY2xlYXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5fbWFya2VyRmlsbE1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgICB0aGlzLl9tYXJrZXJMaW5lTWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG5cclxuICAgICAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBmaWxsLWNvbG9yXHJcbiAgICAgKlxyXG4gICAgICogY29sb3Itb2JqZWN0IGZvcm1hdDpcclxuICAgICAqIDxjb2RlPjxwcmU+XHJcbiAgICAgKiB7XHJcbiAgICAgKiAgICAgcjogMCwgICAgLy8gaW50IDAtMjU1IHJlZFxyXG4gICAgICogICAgIGc6IDAsICAgIC8vIGludCAwLTI1NSBncmVlblxyXG4gICAgICogICAgIGI6IDAsICAgIC8vIGludCAwLTI1NSBibHVlXHJcbiAgICAgKiAgICAgYTogMCAgICAgLy8gZmxvYXQgMC0xIGFscGhhXHJcbiAgICAgKiB9XHJcbiAgICAgKiA8L3ByZT48L2NvZGU+XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGNvbG9yIHtPYmplY3R9XHJcbiAgICAgKi9cclxuICAgIHNldCBmaWxsQ29sb3IoY29sb3IpIHtcclxuICAgICAgICBjb2xvciA9IE1hcmtlci5ub3JtYWxpemVDb2xvcihjb2xvcik7XHJcblxyXG4gICAgICAgIHRoaXMuX21hcmtlckZpbGxNYXRlcmlhbC51bmlmb3Jtcy5tYXJrZXJDb2xvci52YWx1ZSA9IGNvbG9yLnZlYzQ7XHJcbiAgICAgICAgdGhpcy5fZmlsbE9wYWNpdHkgPSBjb2xvci5hO1xyXG4gICAgICAgIHRoaXMuX21hcmtlckZpbGxNYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBib3JkZXItY29sb3JcclxuICAgICAqXHJcbiAgICAgKiBjb2xvci1vYmplY3QgZm9ybWF0OlxyXG4gICAgICogPGNvZGU+PHByZT5cclxuICAgICAqIHtcclxuICAgICAqICAgICByOiAwLCAgICAvLyBpbnQgMC0yNTUgcmVkXHJcbiAgICAgKiAgICAgZzogMCwgICAgLy8gaW50IDAtMjU1IGdyZWVuXHJcbiAgICAgKiAgICAgYjogMCwgICAgLy8gaW50IDAtMjU1IGJsdWVcclxuICAgICAqICAgICBhOiAwICAgICAvLyBmbG9hdCAwLTEgYWxwaGFcclxuICAgICAqIH1cclxuICAgICAqIDwvcHJlPjwvY29kZT5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gY29sb3Ige09iamVjdH1cclxuICAgICAqL1xyXG4gICAgc2V0IGJvcmRlckNvbG9yKGNvbG9yKSB7XHJcbiAgICAgICAgY29sb3IgPSBNYXJrZXIubm9ybWFsaXplQ29sb3IoY29sb3IpO1xyXG5cclxuICAgICAgICB0aGlzLl9tYXJrZXJMaW5lTWF0ZXJpYWwuY29sb3Iuc2V0SGV4KGNvbG9yLnJnYik7XHJcbiAgICAgICAgdGhpcy5fbGluZU9wYWNpdHkgPSBjb2xvci5hO1xyXG4gICAgICAgIHRoaXMuX21hcmtlckxpbmVNYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSB3aWR0aCBvZiB0aGUgbWFya2VyLWxpbmVcclxuICAgICAqIEBwYXJhbSB3aWR0aCB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBzZXQgbGluZVdpZHRoKHdpZHRoKSB7XHJcbiAgICAgICAgdGhpcy5fbWFya2VyTGluZU1hdGVyaWFsLmxpbmV3aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIHRoaXMuX21hcmtlckxpbmVNYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIGlmIHRoaXMgbWFya2VyIGNhbiBiZSBzZWVuIHRocm91Z2ggdGVycmFpblxyXG4gICAgICogQHBhcmFtIHRlc3Qge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIHNldCBkZXB0aFRlc3QodGVzdCkge1xyXG4gICAgICAgIHRoaXMuX21hcmtlckZpbGxNYXRlcmlhbC5kZXB0aFRlc3QgPSB0ZXN0O1xyXG4gICAgICAgIHRoaXMuX21hcmtlckZpbGxNYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMuX21hcmtlckxpbmVNYXRlcmlhbC5kZXB0aFRlc3QgPSB0ZXN0O1xyXG4gICAgICAgIHRoaXMuX21hcmtlckxpbmVNYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGRlcHRoVGVzdCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbWFya2VyRmlsbE1hdGVyaWFsLmRlcHRoVGVzdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIGhlaWdodCBvZiB0aGlzIG1hcmtlclxyXG4gICAgICogQHBhcmFtIGhlaWdodCB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBzZXQgaGVpZ2h0KGhlaWdodCkge1xyXG4gICAgICAgIHRoaXMuX21hcmtlck9iamVjdC5wb3NpdGlvbi55ID0gaGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgcG9pbnRzIGZvciB0aGUgc2hhcGUgb2YgdGhpcyBtYXJrZXIuXHJcbiAgICAgKiBAcGFyYW0gcG9pbnRzIHtWZWN0b3IyW119XHJcbiAgICAgKi9cclxuICAgIHNldCBzaGFwZShwb2ludHMpIHtcclxuICAgICAgICAvLyByZW1vdmUgb2xkIG1hcmtlclxyXG4gICAgICAgIHRoaXMuX21hcmtlck9iamVjdC5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcclxuICAgICAgICAgICAgaWYgKGNoaWxkLmdlb21ldHJ5ICYmIGNoaWxkLmdlb21ldHJ5LmlzR2VvbWV0cnkpIGNoaWxkLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9tYXJrZXJPYmplY3QuY2xlYXIoKTtcclxuXHJcbiAgICAgICAgaWYgKHBvaW50cy5sZW5ndGggPCAzKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuX21hcmtlck9iamVjdC5wb3NpdGlvbi54ID0gdGhpcy5wb3NpdGlvbi54O1xyXG4gICAgICAgIHRoaXMuX21hcmtlck9iamVjdC5wb3NpdGlvbi56ID0gdGhpcy5wb3NpdGlvbi56O1xyXG5cclxuICAgICAgICAvLyBib3JkZXItbGluZVxyXG4gICAgICAgIGxldCBwb2ludHMzZCA9IFtdO1xyXG4gICAgICAgIHBvaW50cy5mb3JFYWNoKHBvaW50ID0+IHBvaW50czNkLnB1c2gocG9pbnQueCwgMCwgcG9pbnQueSkpO1xyXG4gICAgICAgIHBvaW50czNkLnB1c2gocG9pbnRzWzBdLngsIDAsIHBvaW50c1swXS55KVxyXG4gICAgICAgIGxldCBsaW5lR2VvID0gbmV3IExpbmVHZW9tZXRyeSgpXHJcbiAgICAgICAgbGluZUdlby5zZXRQb3NpdGlvbnMocG9pbnRzM2QpO1xyXG4gICAgICAgIGxpbmVHZW8udHJhbnNsYXRlKC10aGlzLnBvc2l0aW9uLngsIDAuMDE0NTYsIC10aGlzLnBvc2l0aW9uLnopO1xyXG4gICAgICAgIGxldCBsaW5lID0gbmV3IExpbmUyKGxpbmVHZW8sIHRoaXMuX21hcmtlckxpbmVNYXRlcmlhbCk7XHJcbiAgICAgICAgbGluZS5vbkJlZm9yZVJlbmRlciA9IHJlbmRlcmVyID0+IHJlbmRlcmVyLmdldFNpemUobGluZS5tYXRlcmlhbC5yZXNvbHV0aW9uKTtcclxuICAgICAgICBsaW5lLmNvbXB1dGVMaW5lRGlzdGFuY2VzKCk7XHJcbiAgICAgICAgbGluZS5tYXJrZXIgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuX21hcmtlck9iamVjdC5hZGQobGluZSk7XHJcblxyXG4gICAgICAgIC8vIGZpbGxcclxuICAgICAgICBpZiAodGhpcy5fbWFya2VyRmlsbE1hdGVyaWFsLnVuaWZvcm1zLm1hcmtlckNvbG9yLnZhbHVlLncgPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCBzaGFwZSA9IG5ldyBTaGFwZShwb2ludHMpO1xyXG4gICAgICAgICAgICBsZXQgZmlsbEdlbyA9IG5ldyBTaGFwZUJ1ZmZlckdlb21ldHJ5KHNoYXBlLCAxKTtcclxuICAgICAgICAgICAgZmlsbEdlby5yb3RhdGVYKE1hdGguUEkgLyAyKTsgLy9tYWtlIHkgdG8gelxyXG4gICAgICAgICAgICBmaWxsR2VvLnRyYW5zbGF0ZSgtdGhpcy5wb3NpdGlvbi54LCAwLjAxNDU2LCAtdGhpcy5wb3NpdGlvbi56KTtcclxuICAgICAgICAgICAgbGV0IGZpbGwgPSBuZXcgTWVzaChmaWxsR2VvLCB0aGlzLl9tYXJrZXJGaWxsTWF0ZXJpYWwpO1xyXG4gICAgICAgICAgICBmaWxsLm1hcmtlciA9IHRoaXM7XHJcbiAgICAgICAgICAgIHRoaXMuX21hcmtlck9iamVjdC5hZGQoZmlsbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBwdXQgcmVuZGVyLWhvb2sgb24gZmlyc3Qgb2JqZWN0XHJcbiAgICAgICAgaWYgKHRoaXMuX21hcmtlck9iamVjdC5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCBvbGRIb29rID0gdGhpcy5fbWFya2VyT2JqZWN0LmNoaWxkcmVuWzBdLm9uQmVmb3JlUmVuZGVyO1xyXG4gICAgICAgICAgICB0aGlzLl9tYXJrZXJPYmplY3QuY2hpbGRyZW5bMF0ub25CZWZvcmVSZW5kZXIgPSAocmVuZGVyZXIsIHNjZW5lLCBjYW1lcmEsIGdlb21ldHJ5LCBtYXRlcmlhbCwgZ3JvdXApID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX29uQmVmb3JlUmVuZGVyKHJlbmRlcmVyLCBzY2VuZSwgY2FtZXJhKTtcclxuICAgICAgICAgICAgICAgIG9sZEhvb2socmVuZGVyZXIsIHNjZW5lLCBjYW1lcmEsIGdlb21ldHJ5LCBtYXRlcmlhbCwgZ3JvdXApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufVxyXG4iLCJpbXBvcnQge01hcmtlcn0gZnJvbSBcIi4vTWFya2VyXCI7XHJcbmltcG9ydCB7XHJcbiAgICBDb2xvcixcclxuICAgIE9iamVjdDNELFxyXG4gICAgVmVjdG9yMyxcclxufSBmcm9tIFwidGhyZWVcIjtcclxuaW1wb3J0IHtMaW5lTWF0ZXJpYWx9IGZyb20gXCIuLi91dGlsL2xpbmVzL0xpbmVNYXRlcmlhbFwiO1xyXG5pbXBvcnQge0xpbmVHZW9tZXRyeX0gZnJvbSBcIi4uL3V0aWwvbGluZXMvTGluZUdlb21ldHJ5XCI7XHJcbmltcG9ydCB7TGluZTJ9IGZyb20gXCIuLi91dGlsL2xpbmVzL0xpbmUyXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgTGluZU1hcmtlciBleHRlbmRzIE1hcmtlciB7XHJcblxyXG4gICAgY29uc3RydWN0b3IobWFya2VyU2V0LCBpZCwgcGFyZW50T2JqZWN0KSB7XHJcbiAgICAgICAgc3VwZXIobWFya2VyU2V0LCBpZCk7XHJcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdpc0xpbmVNYXJrZXInLCB7dmFsdWU6IHRydWV9KTtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3R5cGUnLCB7dmFsdWU6IFwibGluZVwifSk7XHJcblxyXG4gICAgICAgIGxldCBsaW5lQ29sb3IgPSBNYXJrZXIubm9ybWFsaXplQ29sb3Ioe30pO1xyXG4gICAgICAgIGxldCBsaW5lV2lkdGggPSAyO1xyXG4gICAgICAgIGxldCBkZXB0aFRlc3QgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5fbGluZU9wYWNpdHkgPSAxO1xyXG5cclxuICAgICAgICB0aGlzLl9tYXJrZXJPYmplY3QgPSBuZXcgT2JqZWN0M0QoKTtcclxuICAgICAgICB0aGlzLl9tYXJrZXJPYmplY3QucG9zaXRpb24uY29weSh0aGlzLnBvc2l0aW9uKTtcclxuICAgICAgICBwYXJlbnRPYmplY3QuYWRkKHRoaXMuX21hcmtlck9iamVjdCk7XHJcblxyXG4gICAgICAgIHRoaXMuX21hcmtlckxpbmVNYXRlcmlhbCA9IG5ldyBMaW5lTWF0ZXJpYWwoe1xyXG4gICAgICAgICAgICBjb2xvcjogbmV3IENvbG9yKGxpbmVDb2xvci5yZ2IpLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiBsaW5lQ29sb3IuYSxcclxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXHJcbiAgICAgICAgICAgIGxpbmV3aWR0aDogbGluZVdpZHRoLFxyXG4gICAgICAgICAgICBkZXB0aFRlc3Q6IGRlcHRoVGVzdCxcclxuICAgICAgICAgICAgdmVydGV4Q29sb3JzOiBmYWxzZSxcclxuICAgICAgICAgICAgZGFzaGVkOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX21hcmtlckxpbmVNYXRlcmlhbC5yZXNvbHV0aW9uLnNldCh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUobWFya2VyRGF0YSkge1xyXG4gICAgICAgIHN1cGVyLnVwZGF0ZShtYXJrZXJEYXRhKTtcclxuXHJcbiAgICAgICAgaWYgKG1hcmtlckRhdGEubGluZUNvbG9yKSB0aGlzLmxpbmVDb2xvciA9IG1hcmtlckRhdGEubGluZUNvbG9yO1xyXG5cclxuICAgICAgICB0aGlzLmxpbmVXaWR0aCA9IG1hcmtlckRhdGEubGluZVdpZHRoID8gcGFyc2VGbG9hdChtYXJrZXJEYXRhLmxpbmVXaWR0aCkgOiAyO1xyXG4gICAgICAgIHRoaXMuZGVwdGhUZXN0ID0gISFtYXJrZXJEYXRhLmRlcHRoVGVzdDtcclxuXHJcbiAgICAgICAgbGV0IHBvaW50cyA9IFtdO1xyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KG1hcmtlckRhdGEubGluZSkpIHtcclxuICAgICAgICAgICAgbWFya2VyRGF0YS5saW5lLmZvckVhY2gocG9pbnQgPT4ge1xyXG4gICAgICAgICAgICAgICAgcG9pbnRzLnB1c2gobmV3IFZlY3RvcjMocGFyc2VGbG9hdChwb2ludC54KSwgcGFyc2VGbG9hdChwb2ludC55KSwgcGFyc2VGbG9hdChwb2ludC56KSkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5saW5lID0gcG9pbnRzO1xyXG4gICAgfVxyXG5cclxuICAgIF9vbkJlZm9yZVJlbmRlcihyZW5kZXJlciwgc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICAgIHN1cGVyLl9vbkJlZm9yZVJlbmRlcihyZW5kZXJlciwgc2NlbmUsIGNhbWVyYSk7XHJcblxyXG4gICAgICAgIHRoaXMuX21hcmtlckxpbmVNYXRlcmlhbC5vcGFjaXR5ID0gdGhpcy5fbGluZU9wYWNpdHkgKiB0aGlzLl9vcGFjaXR5O1xyXG4gICAgfVxyXG5cclxuICAgIGRpc3Bvc2UoKSB7XHJcbiAgICAgICAgdGhpcy5fbWFya2VyT2JqZWN0LnBhcmVudC5yZW1vdmUodGhpcy5fbWFya2VyT2JqZWN0KTtcclxuICAgICAgICB0aGlzLl9tYXJrZXJPYmplY3QuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XHJcbiAgICAgICAgICAgIGlmIChjaGlsZC5nZW9tZXRyeSAmJiBjaGlsZC5nZW9tZXRyeS5pc0dlb21ldHJ5KSBjaGlsZC5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fbWFya2VyT2JqZWN0LmNsZWFyKCk7XHJcblxyXG4gICAgICAgIHRoaXMuX21hcmtlckxpbmVNYXRlcmlhbC5kaXNwb3NlKCk7XHJcblxyXG4gICAgICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIGxpbmUtY29sb3JcclxuICAgICAqXHJcbiAgICAgKiBjb2xvci1vYmplY3QgZm9ybWF0OlxyXG4gICAgICogPGNvZGU+PHByZT5cclxuICAgICAqIHtcclxuICAgICAqICAgICByOiAwLCAgICAvLyBpbnQgMC0yNTUgcmVkXHJcbiAgICAgKiAgICAgZzogMCwgICAgLy8gaW50IDAtMjU1IGdyZWVuXHJcbiAgICAgKiAgICAgYjogMCwgICAgLy8gaW50IDAtMjU1IGJsdWVcclxuICAgICAqICAgICBhOiAwICAgICAvLyBmbG9hdCAwLTEgYWxwaGFcclxuICAgICAqIH1cclxuICAgICAqIDwvcHJlPjwvY29kZT5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gY29sb3Ige09iamVjdH1cclxuICAgICAqL1xyXG4gICAgc2V0IGxpbmVDb2xvcihjb2xvcikge1xyXG4gICAgICAgIGNvbG9yID0gTWFya2VyLm5vcm1hbGl6ZUNvbG9yKGNvbG9yKTtcclxuXHJcbiAgICAgICAgdGhpcy5fbWFya2VyTGluZU1hdGVyaWFsLmNvbG9yLnNldEhleChjb2xvci5yZ2IpO1xyXG4gICAgICAgIHRoaXMuX2xpbmVPcGFjaXR5ID0gY29sb3IuYTtcclxuICAgICAgICB0aGlzLl9tYXJrZXJMaW5lTWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgd2lkdGggb2YgdGhlIG1hcmtlci1saW5lXHJcbiAgICAgKiBAcGFyYW0gd2lkdGgge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgc2V0IGxpbmVXaWR0aCh3aWR0aCkge1xyXG4gICAgICAgIHRoaXMuX21hcmtlckxpbmVNYXRlcmlhbC5saW5ld2lkdGggPSB3aWR0aDtcclxuICAgICAgICB0aGlzLl9tYXJrZXJMaW5lTWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyBpZiB0aGlzIG1hcmtlciBjYW4gYmUgc2VlbiB0aHJvdWdoIHRlcnJhaW5cclxuICAgICAqIEBwYXJhbSB0ZXN0IHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBzZXQgZGVwdGhUZXN0KHRlc3QpIHtcclxuICAgICAgICB0aGlzLl9tYXJrZXJMaW5lTWF0ZXJpYWwuZGVwdGhUZXN0ID0gdGVzdDtcclxuICAgICAgICB0aGlzLl9tYXJrZXJMaW5lTWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBkZXB0aFRlc3QoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX21hcmtlckxpbmVNYXRlcmlhbC5kZXB0aFRlc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBwb2ludHMgZm9yIHRoZSBzaGFwZSBvZiB0aGlzIG1hcmtlci5cclxuICAgICAqIEBwYXJhbSBwb2ludHMge1ZlY3RvcjNbXX1cclxuICAgICAqL1xyXG4gICAgc2V0IGxpbmUocG9pbnRzKSB7XHJcbiAgICAgICAgLy8gcmVtb3ZlIG9sZCBtYXJrZXJcclxuICAgICAgICB0aGlzLl9tYXJrZXJPYmplY3QuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XHJcbiAgICAgICAgICAgIGlmIChjaGlsZC5nZW9tZXRyeSAmJiBjaGlsZC5nZW9tZXRyeS5pc0dlb21ldHJ5KSBjaGlsZC5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fbWFya2VyT2JqZWN0LmNsZWFyKCk7XHJcblxyXG4gICAgICAgIGlmIChwb2ludHMubGVuZ3RoIDwgMykgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLl9tYXJrZXJPYmplY3QucG9zaXRpb24uY29weSh0aGlzLnBvc2l0aW9uKTtcclxuXHJcbiAgICAgICAgLy8gbGluZVxyXG4gICAgICAgIGxldCBwb2ludHMzZCA9IFtdO1xyXG4gICAgICAgIHBvaW50cy5mb3JFYWNoKHBvaW50ID0+IHBvaW50czNkLnB1c2gocG9pbnQueCwgcG9pbnQueSwgcG9pbnQueikpO1xyXG4gICAgICAgIGxldCBsaW5lR2VvID0gbmV3IExpbmVHZW9tZXRyeSgpO1xyXG4gICAgICAgIGxpbmVHZW8uc2V0UG9zaXRpb25zKHBvaW50czNkKTtcclxuICAgICAgICBsaW5lR2VvLnRyYW5zbGF0ZSgtdGhpcy5wb3NpdGlvbi54LCAtdGhpcy5wb3NpdGlvbi55LCAtdGhpcy5wb3NpdGlvbi56KTtcclxuICAgICAgICBsZXQgbGluZSA9IG5ldyBMaW5lMihsaW5lR2VvLCB0aGlzLl9tYXJrZXJMaW5lTWF0ZXJpYWwpO1xyXG4gICAgICAgIGxpbmUuY29tcHV0ZUxpbmVEaXN0YW5jZXMoKTtcclxuXHJcbiAgICAgICAgbGluZS5vbkJlZm9yZVJlbmRlciA9IChyZW5kZXJlciwgY2FtZXJhLCBzY2VuZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9vbkJlZm9yZVJlbmRlcihyZW5kZXJlciwgY2FtZXJhLCBzY2VuZSk7XHJcbiAgICAgICAgICAgIHJlbmRlcmVyLmdldFNpemUobGluZS5tYXRlcmlhbC5yZXNvbHV0aW9uKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxpbmUubWFya2VyID0gdGhpcztcclxuICAgICAgICB0aGlzLl9tYXJrZXJPYmplY3QuYWRkKGxpbmUpO1xyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7TWFya2VyfSBmcm9tIFwiLi9NYXJrZXJcIjtcclxuaW1wb3J0IHtcclxuICAgIENvbG9yLFxyXG4gICAgRG91YmxlU2lkZSwgRXh0cnVkZUJ1ZmZlckdlb21ldHJ5LFxyXG4gICAgTWVzaCxcclxuICAgIE9iamVjdDNELCBTaGFkZXJNYXRlcmlhbCxcclxuICAgIFNoYXBlLFxyXG4gICAgVmVjdG9yMlxyXG59IGZyb20gXCJ0aHJlZVwiO1xyXG5pbXBvcnQge0xpbmVNYXRlcmlhbH0gZnJvbSBcIi4uL3V0aWwvbGluZXMvTGluZU1hdGVyaWFsXCI7XHJcbmltcG9ydCB7TGluZUdlb21ldHJ5fSBmcm9tIFwiLi4vdXRpbC9saW5lcy9MaW5lR2VvbWV0cnlcIjtcclxuaW1wb3J0IHtMaW5lMn0gZnJvbSBcIi4uL3V0aWwvbGluZXMvTGluZTJcIjtcclxuaW1wb3J0IHtNQVJLRVJfRklMTF9GUkFHTUVOVF9TSEFERVJ9IGZyb20gXCIuL3NoYWRlci9NYXJrZXJGaWxsRnJhZ21lbnRTaGFkZXJcIjtcclxuaW1wb3J0IHtNQVJLRVJfRklMTF9WRVJURVhfU0hBREVSfSBmcm9tIFwiLi9zaGFkZXIvTWFya2VyRmlsbFZlcnRleFNoYWRlclwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEV4dHJ1ZGVNYXJrZXIgZXh0ZW5kcyBNYXJrZXIge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1hcmtlclNldCwgaWQsIHBhcmVudE9iamVjdCkge1xyXG4gICAgICAgIHN1cGVyKG1hcmtlclNldCwgaWQpO1xyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaXNFeHRydWRlTWFya2VyJywge3ZhbHVlOiB0cnVlfSk7XHJcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd0eXBlJywge3ZhbHVlOiBcImV4dHJ1ZGVcIn0pO1xyXG5cclxuICAgICAgICBsZXQgZmlsbENvbG9yID0gTWFya2VyLm5vcm1hbGl6ZUNvbG9yKHt9KTtcclxuICAgICAgICBsZXQgYm9yZGVyQ29sb3IgPSBNYXJrZXIubm9ybWFsaXplQ29sb3Ioe30pO1xyXG4gICAgICAgIGxldCBsaW5lV2lkdGggPSAyO1xyXG4gICAgICAgIGxldCBkZXB0aFRlc3QgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5fbGluZU9wYWNpdHkgPSAxO1xyXG4gICAgICAgIHRoaXMuX2ZpbGxPcGFjaXR5ID0gMTtcclxuXHJcbiAgICAgICAgdGhpcy5fbWFya2VyT2JqZWN0ID0gbmV3IE9iamVjdDNEKCk7XHJcbiAgICAgICAgdGhpcy5fbWFya2VyT2JqZWN0LnBvc2l0aW9uLmNvcHkodGhpcy5wb3NpdGlvbik7XHJcbiAgICAgICAgcGFyZW50T2JqZWN0LmFkZCh0aGlzLl9tYXJrZXJPYmplY3QpO1xyXG5cclxuICAgICAgICB0aGlzLl9tYXJrZXJGaWxsTWF0ZXJpYWwgPSBuZXcgU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICAgICAgICB2ZXJ0ZXhTaGFkZXI6IE1BUktFUl9GSUxMX1ZFUlRFWF9TSEFERVIsXHJcbiAgICAgICAgICAgIGZyYWdtZW50U2hhZGVyOiBNQVJLRVJfRklMTF9GUkFHTUVOVF9TSEFERVIsXHJcbiAgICAgICAgICAgIHNpZGU6IERvdWJsZVNpZGUsXHJcbiAgICAgICAgICAgIGRlcHRoVGVzdDogZGVwdGhUZXN0LFxyXG4gICAgICAgICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcclxuICAgICAgICAgICAgdW5pZm9ybXM6IHtcclxuICAgICAgICAgICAgICAgIG1hcmtlckNvbG9yOiB7IHZhbHVlOiBmaWxsQ29sb3IudmVjNCB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5fbWFya2VyTGluZU1hdGVyaWFsID0gbmV3IExpbmVNYXRlcmlhbCh7XHJcbiAgICAgICAgICAgIGNvbG9yOiBuZXcgQ29sb3IoYm9yZGVyQ29sb3IucmdiKSxcclxuICAgICAgICAgICAgb3BhY2l0eTogYm9yZGVyQ29sb3IuYSxcclxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXHJcbiAgICAgICAgICAgIGxpbmV3aWR0aDogbGluZVdpZHRoLFxyXG4gICAgICAgICAgICBkZXB0aFRlc3Q6IGRlcHRoVGVzdCxcclxuICAgICAgICAgICAgdmVydGV4Q29sb3JzOiBmYWxzZSxcclxuICAgICAgICAgICAgZGFzaGVkOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX21hcmtlckxpbmVNYXRlcmlhbC5yZXNvbHV0aW9uLnNldCh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUobWFya2VyRGF0YSkge1xyXG4gICAgICAgIHN1cGVyLnVwZGF0ZShtYXJrZXJEYXRhKTtcclxuICAgICAgICB0aGlzLm1pbkhlaWdodCA9IG1hcmtlckRhdGEubWluSGVpZ2h0ID8gcGFyc2VGbG9hdChtYXJrZXJEYXRhLm1pbkhlaWdodCkgOiAwLjA7XHJcbiAgICAgICAgdGhpcy5tYXhIZWlnaHQgPSBtYXJrZXJEYXRhLm1heEhlaWdodCA/IHBhcnNlRmxvYXQobWFya2VyRGF0YS5tYXhIZWlnaHQpIDogMjU1LjA7XHJcbiAgICAgICAgdGhpcy5kZXB0aFRlc3QgPSAhIW1hcmtlckRhdGEuZGVwdGhUZXN0O1xyXG5cclxuICAgICAgICBpZiAobWFya2VyRGF0YS5maWxsQ29sb3IpIHRoaXMuZmlsbENvbG9yID0gbWFya2VyRGF0YS5maWxsQ29sb3I7XHJcbiAgICAgICAgaWYgKG1hcmtlckRhdGEuYm9yZGVyQ29sb3IpIHRoaXMuYm9yZGVyQ29sb3IgPSBtYXJrZXJEYXRhLmJvcmRlckNvbG9yO1xyXG5cclxuICAgICAgICB0aGlzLmxpbmVXaWR0aCA9IG1hcmtlckRhdGEubGluZVdpZHRoID8gcGFyc2VGbG9hdChtYXJrZXJEYXRhLmxpbmVXaWR0aCkgOiAyO1xyXG5cclxuICAgICAgICBsZXQgcG9pbnRzID0gW107XHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkobWFya2VyRGF0YS5zaGFwZSkpIHtcclxuICAgICAgICAgICAgbWFya2VyRGF0YS5zaGFwZS5mb3JFYWNoKHBvaW50ID0+IHtcclxuICAgICAgICAgICAgICAgIHBvaW50cy5wdXNoKG5ldyBWZWN0b3IyKHBhcnNlRmxvYXQocG9pbnQueCksIHBhcnNlRmxvYXQocG9pbnQueikpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2hhcGUgPSBwb2ludHM7XHJcbiAgICB9XHJcblxyXG4gICAgX29uQmVmb3JlUmVuZGVyKHJlbmRlcmVyLCBzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgICAgc3VwZXIuX29uQmVmb3JlUmVuZGVyKHJlbmRlcmVyLCBzY2VuZSwgY2FtZXJhKTtcclxuXHJcbiAgICAgICAgdGhpcy5fbWFya2VyRmlsbE1hdGVyaWFsLnVuaWZvcm1zLm1hcmtlckNvbG9yLnZhbHVlLncgPSB0aGlzLl9maWxsT3BhY2l0eSAqIHRoaXMuX29wYWNpdHk7XHJcbiAgICAgICAgdGhpcy5fbWFya2VyTGluZU1hdGVyaWFsLm9wYWNpdHkgPSB0aGlzLl9saW5lT3BhY2l0eSAqIHRoaXMuX29wYWNpdHk7XHJcbiAgICB9XHJcblxyXG4gICAgZGlzcG9zZSgpIHtcclxuICAgICAgICB0aGlzLl9tYXJrZXJPYmplY3QucGFyZW50LnJlbW92ZSh0aGlzLl9tYXJrZXJPYmplY3QpO1xyXG4gICAgICAgIHRoaXMuX21hcmtlck9iamVjdC5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcclxuICAgICAgICAgICAgaWYgKGNoaWxkLmdlb21ldHJ5ICYmIGNoaWxkLmdlb21ldHJ5LmlzR2VvbWV0cnkpIGNoaWxkLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9tYXJrZXJPYmplY3QuY2xlYXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5fbWFya2VyRmlsbE1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgICB0aGlzLl9tYXJrZXJMaW5lTWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG5cclxuICAgICAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBmaWxsLWNvbG9yXHJcbiAgICAgKlxyXG4gICAgICogY29sb3Itb2JqZWN0IGZvcm1hdDpcclxuICAgICAqIDxjb2RlPjxwcmU+XHJcbiAgICAgKiB7XHJcbiAgICAgKiAgICAgcjogMCwgICAgLy8gaW50IDAtMjU1IHJlZFxyXG4gICAgICogICAgIGc6IDAsICAgIC8vIGludCAwLTI1NSBncmVlblxyXG4gICAgICogICAgIGI6IDAsICAgIC8vIGludCAwLTI1NSBibHVlXHJcbiAgICAgKiAgICAgYTogMCAgICAgLy8gZmxvYXQgMC0xIGFscGhhXHJcbiAgICAgKiB9XHJcbiAgICAgKiA8L3ByZT48L2NvZGU+XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGNvbG9yIHtPYmplY3R9XHJcbiAgICAgKi9cclxuICAgIHNldCBmaWxsQ29sb3IoY29sb3IpIHtcclxuICAgICAgICBjb2xvciA9IE1hcmtlci5ub3JtYWxpemVDb2xvcihjb2xvcik7XHJcblxyXG4gICAgICAgIHRoaXMuX21hcmtlckZpbGxNYXRlcmlhbC51bmlmb3Jtcy5tYXJrZXJDb2xvci52YWx1ZS5jb3B5KGNvbG9yLnZlYzQpO1xyXG4gICAgICAgIHRoaXMuX2ZpbGxPcGFjaXR5ID0gY29sb3IuYTtcclxuICAgICAgICB0aGlzLl9tYXJrZXJGaWxsTWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgYm9yZGVyLWNvbG9yXHJcbiAgICAgKlxyXG4gICAgICogY29sb3Itb2JqZWN0IGZvcm1hdDpcclxuICAgICAqIDxjb2RlPjxwcmU+XHJcbiAgICAgKiB7XHJcbiAgICAgKiAgICAgcjogMCwgICAgLy8gaW50IDAtMjU1IHJlZFxyXG4gICAgICogICAgIGc6IDAsICAgIC8vIGludCAwLTI1NSBncmVlblxyXG4gICAgICogICAgIGI6IDAsICAgIC8vIGludCAwLTI1NSBibHVlXHJcbiAgICAgKiAgICAgYTogMCAgICAgLy8gZmxvYXQgMC0xIGFscGhhXHJcbiAgICAgKiB9XHJcbiAgICAgKiA8L3ByZT48L2NvZGU+XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGNvbG9yIHtPYmplY3R9XHJcbiAgICAgKi9cclxuICAgIHNldCBib3JkZXJDb2xvcihjb2xvcikge1xyXG4gICAgICAgIGNvbG9yID0gTWFya2VyLm5vcm1hbGl6ZUNvbG9yKGNvbG9yKTtcclxuXHJcbiAgICAgICAgdGhpcy5fbWFya2VyTGluZU1hdGVyaWFsLmNvbG9yLnNldEhleChjb2xvci5yZ2IpO1xyXG4gICAgICAgIHRoaXMuX2xpbmVPcGFjaXR5ID0gY29sb3IuYTtcclxuICAgICAgICB0aGlzLl9tYXJrZXJMaW5lTWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgd2lkdGggb2YgdGhlIG1hcmtlci1saW5lXHJcbiAgICAgKiBAcGFyYW0gd2lkdGgge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgc2V0IGxpbmVXaWR0aCh3aWR0aCkge1xyXG4gICAgICAgIHRoaXMuX21hcmtlckxpbmVNYXRlcmlhbC5saW5ld2lkdGggPSB3aWR0aDtcclxuICAgICAgICB0aGlzLl9tYXJrZXJMaW5lTWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyBpZiB0aGlzIG1hcmtlciBjYW4gYmUgc2VlbiB0aHJvdWdoIHRlcnJhaW5cclxuICAgICAqIEBwYXJhbSB0ZXN0IHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBzZXQgZGVwdGhUZXN0KHRlc3QpIHtcclxuICAgICAgICB0aGlzLl9tYXJrZXJGaWxsTWF0ZXJpYWwuZGVwdGhUZXN0ID0gdGVzdDtcclxuICAgICAgICB0aGlzLl9tYXJrZXJGaWxsTWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLl9tYXJrZXJMaW5lTWF0ZXJpYWwuZGVwdGhUZXN0ID0gdGVzdDtcclxuICAgICAgICB0aGlzLl9tYXJrZXJMaW5lTWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBkZXB0aFRlc3QoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX21hcmtlckZpbGxNYXRlcmlhbC5kZXB0aFRlc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBtaW4taGVpZ2h0IG9mIHRoaXMgbWFya2VyXHJcbiAgICAgKiBAcGFyYW0gaGVpZ2h0IHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIHNldCBtaW5IZWlnaHQoaGVpZ2h0KSB7XHJcbiAgICAgICAgdGhpcy5fbWluSGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgbWF4LWhlaWdodCBvZiB0aGlzIG1hcmtlclxyXG4gICAgICogQHBhcmFtIGhlaWdodCB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBzZXQgbWF4SGVpZ2h0KGhlaWdodCkge1xyXG4gICAgICAgIHRoaXMuX21hcmtlck9iamVjdC5wb3NpdGlvbi55ID0gaGVpZ2h0ICsgMC4wMTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIHBvaW50cyBmb3IgdGhlIHNoYXBlIG9mIHRoaXMgbWFya2VyLlxyXG4gICAgICogQHBhcmFtIHBvaW50cyB7VmVjdG9yMltdfVxyXG4gICAgICovXHJcbiAgICBzZXQgc2hhcGUocG9pbnRzKSB7XHJcblxyXG4gICAgICAgIC8vIHJlbW92ZSBvbGQgbWFya2VyXHJcbiAgICAgICAgdGhpcy5fbWFya2VyT2JqZWN0LmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xyXG4gICAgICAgICAgICBpZiAoY2hpbGQuZ2VvbWV0cnkgJiYgY2hpbGQuZ2VvbWV0cnkuaXNHZW9tZXRyeSkgY2hpbGQuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX21hcmtlck9iamVjdC5jbGVhcigpO1xyXG5cclxuICAgICAgICBpZiAocG9pbnRzLmxlbmd0aCA8IDMpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5fbWFya2VyT2JqZWN0LnBvc2l0aW9uLnggPSB0aGlzLnBvc2l0aW9uLnggKyAwLjAxO1xyXG4gICAgICAgIHRoaXMuX21hcmtlck9iamVjdC5wb3NpdGlvbi56ID0gdGhpcy5wb3NpdGlvbi56ICsgMC4wMTtcclxuXHJcbiAgICAgICAgbGV0IG1heFkgPSB0aGlzLl9tYXJrZXJPYmplY3QucG9zaXRpb24ueTtcclxuICAgICAgICBsZXQgbWluWSA9IHRoaXMuX21pbkhlaWdodDtcclxuICAgICAgICBsZXQgZGVwdGggPSBtYXhZIC0gbWluWTtcclxuXHJcbiAgICAgICAgbGV0IHNoYXBlID0gbmV3IFNoYXBlKHBvaW50cyk7XHJcblxyXG4gICAgICAgIC8vIGJvcmRlci1saW5lXHJcbiAgICAgICAgaWYgKHRoaXMuX21hcmtlckxpbmVNYXRlcmlhbC5vcGFjaXR5ID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgcG9pbnRzM2QgPSBbXTtcclxuICAgICAgICAgICAgcG9pbnRzLmZvckVhY2gocG9pbnQgPT4gcG9pbnRzM2QucHVzaChwb2ludC54LCAwLCBwb2ludC55KSk7XHJcbiAgICAgICAgICAgIHBvaW50czNkLnB1c2gocG9pbnRzWzBdLngsIDAsIHBvaW50c1swXS55KVxyXG5cclxuICAgICAgICAgICAgY29uc3QgcHJlUmVuZGVySG9vayA9IGxpbmUgPT4gcmVuZGVyZXIgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVuZGVyZXIuZ2V0U2l6ZShsaW5lLm1hdGVyaWFsLnJlc29sdXRpb24pO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IHRvcExpbmVHZW8gPSBuZXcgTGluZUdlb21ldHJ5KClcclxuICAgICAgICAgICAgdG9wTGluZUdlby5zZXRQb3NpdGlvbnMocG9pbnRzM2QpO1xyXG4gICAgICAgICAgICB0b3BMaW5lR2VvLnRyYW5zbGF0ZSgtdGhpcy5wb3NpdGlvbi54LCAwLCAtdGhpcy5wb3NpdGlvbi56KTtcclxuICAgICAgICAgICAgbGV0IHRvcExpbmUgPSBuZXcgTGluZTIodG9wTGluZUdlbywgdGhpcy5fbWFya2VyTGluZU1hdGVyaWFsKTtcclxuICAgICAgICAgICAgdG9wTGluZS5jb21wdXRlTGluZURpc3RhbmNlcygpO1xyXG4gICAgICAgICAgICB0b3BMaW5lLm9uQmVmb3JlUmVuZGVyID0gcHJlUmVuZGVySG9vayh0b3BMaW5lKTtcclxuICAgICAgICAgICAgdGhpcy5fbWFya2VyT2JqZWN0LmFkZCh0b3BMaW5lKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBib3R0b21MaW5lID0gdG9wTGluZS5jbG9uZSgpO1xyXG4gICAgICAgICAgICBib3R0b21MaW5lLnBvc2l0aW9uLnkgPSAtZGVwdGg7XHJcbiAgICAgICAgICAgIGJvdHRvbUxpbmUuY29tcHV0ZUxpbmVEaXN0YW5jZXMoKTtcclxuICAgICAgICAgICAgYm90dG9tTGluZS5vbkJlZm9yZVJlbmRlciA9IHByZVJlbmRlckhvb2soYm90dG9tTGluZSk7XHJcbiAgICAgICAgICAgIHRoaXMuX21hcmtlck9iamVjdC5hZGQoYm90dG9tTGluZSk7XHJcblxyXG4gICAgICAgICAgICBwb2ludHMuZm9yRWFjaChwb2ludCA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcG9pbnRMaW5lR2VvID0gbmV3IExpbmVHZW9tZXRyeSgpO1xyXG4gICAgICAgICAgICAgICAgcG9pbnRMaW5lR2VvLnNldFBvc2l0aW9ucyhbXHJcbiAgICAgICAgICAgICAgICAgICAgcG9pbnQueCwgMCwgcG9pbnQueSxcclxuICAgICAgICAgICAgICAgICAgICBwb2ludC54LCAtZGVwdGgsIHBvaW50LnlcclxuICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICBwb2ludExpbmVHZW8udHJhbnNsYXRlKC10aGlzLnBvc2l0aW9uLngsIDAsIC10aGlzLnBvc2l0aW9uLnopO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBvaW50TGluZSA9IG5ldyBMaW5lMihwb2ludExpbmVHZW8sIHRoaXMuX21hcmtlckxpbmVNYXRlcmlhbCk7XHJcbiAgICAgICAgICAgICAgICBwb2ludExpbmUuY29tcHV0ZUxpbmVEaXN0YW5jZXMoKTtcclxuICAgICAgICAgICAgICAgIHBvaW50TGluZS5vbkJlZm9yZVJlbmRlciA9IHByZVJlbmRlckhvb2socG9pbnRMaW5lKTtcclxuICAgICAgICAgICAgICAgIHBvaW50TGluZS5tYXJrZXIgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWFya2VyT2JqZWN0LmFkZChwb2ludExpbmUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGZpbGxcclxuICAgICAgICBpZiAodGhpcy5fbWFya2VyRmlsbE1hdGVyaWFsLnVuaWZvcm1zLm1hcmtlckNvbG9yLnZhbHVlLncgPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCBmaWxsR2VvID0gbmV3IEV4dHJ1ZGVCdWZmZXJHZW9tZXRyeShzaGFwZSwge1xyXG4gICAgICAgICAgICAgICAgc3RlcHM6IDEsXHJcbiAgICAgICAgICAgICAgICBkZXB0aDogZGVwdGgsXHJcbiAgICAgICAgICAgICAgICBiZXZlbEVuYWJsZWQ6IGZhbHNlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBmaWxsR2VvLnJvdGF0ZVgoTWF0aC5QSSAvIDIpOyAvL21ha2UgeSB0byB6XHJcbiAgICAgICAgICAgIGZpbGxHZW8udHJhbnNsYXRlKC10aGlzLnBvc2l0aW9uLngsIDAsIC10aGlzLnBvc2l0aW9uLnopO1xyXG4gICAgICAgICAgICBsZXQgZmlsbCA9IG5ldyBNZXNoKGZpbGxHZW8sIHRoaXMuX21hcmtlckZpbGxNYXRlcmlhbCk7XHJcbiAgICAgICAgICAgIGZpbGwub25CZWZvcmVSZW5kZXIgPSAocmVuZGVyZXIsIHNjZW5lLCBjYW1lcmEpID0+IHRoaXMuX29uQmVmb3JlUmVuZGVyKHJlbmRlcmVyLCBzY2VuZSwgY2FtZXJhKTtcclxuICAgICAgICAgICAgZmlsbC5tYXJrZXIgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aGlzLl9tYXJrZXJPYmplY3QuYWRkKGZpbGwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gcHV0IHJlbmRlci1ob29rIG9uIGxpbmUgKG9ubHkpIGlmIHRoZXJlIGlzIG5vIGZpbGxcclxuICAgICAgICBlbHNlIGlmICh0aGlzLl9tYXJrZXJPYmplY3QuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgb2xkSG9vayA9IHRoaXMuX21hcmtlck9iamVjdC5jaGlsZHJlblswXS5vbkJlZm9yZVJlbmRlcjtcclxuICAgICAgICAgICAgdGhpcy5fbWFya2VyT2JqZWN0LmNoaWxkcmVuWzBdLm9uQmVmb3JlUmVuZGVyID0gKHJlbmRlcmVyLCBzY2VuZSwgY2FtZXJhLCBnZW9tZXRyeSwgbWF0ZXJpYWwsIGdyb3VwKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vbkJlZm9yZVJlbmRlcihyZW5kZXJlciwgc2NlbmUsIGNhbWVyYSk7XHJcbiAgICAgICAgICAgICAgICBvbGRIb29rKHJlbmRlcmVyLCBzY2VuZSwgY2FtZXJhLCBnZW9tZXRyeSwgbWF0ZXJpYWwsIGdyb3VwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0iLCIvKipcclxuICogQGF1dGhvciBtcmRvb2IgLyBodHRwOi8vbXJkb29iLmNvbS9cclxuICpcclxuICogYWRhcHRlZCBmb3IgYmx1ZW1hcCdzIHB1cnBvc2VzXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtcclxuICAgIE1hdHJpeDQsXHJcbiAgICBPYmplY3QzRCwgVmVjdG9yMixcclxuICAgIFZlY3RvcjNcclxufSBmcm9tIFwidGhyZWVcIjtcclxuXHJcbnZhciBDU1MyRE9iamVjdCA9IGZ1bmN0aW9uICggZWxlbWVudCApIHtcclxuXHJcbiAgICBPYmplY3QzRC5jYWxsKCB0aGlzICk7XHJcblxyXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcblxyXG4gICAgdGhpcy5hbmNob3IgPSBuZXcgVmVjdG9yMigpO1xyXG5cclxuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lciggJ3JlbW92ZWQnLCBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMudHJhdmVyc2UoIGZ1bmN0aW9uICggb2JqZWN0ICkge1xyXG5cclxuICAgICAgICAgICAgaWYgKCBvYmplY3QuZWxlbWVudCBpbnN0YW5jZW9mIEVsZW1lbnQgJiYgb2JqZWN0LmVsZW1lbnQucGFyZW50Tm9kZSAhPT0gbnVsbCApIHtcclxuXHJcbiAgICAgICAgICAgICAgICBvYmplY3QuZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKCBvYmplY3QuZWxlbWVudCApO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgfSApO1xyXG5cclxufTtcclxuXHJcbkNTUzJET2JqZWN0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE9iamVjdDNELnByb3RvdHlwZSApO1xyXG5DU1MyRE9iamVjdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDU1MyRE9iamVjdDtcclxuXHJcbi8vXHJcblxyXG52YXIgQ1NTMkRSZW5kZXJlciA9IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG5cclxuICAgIHZhciBfd2lkdGgsIF9oZWlnaHQ7XHJcbiAgICB2YXIgX3dpZHRoSGFsZiwgX2hlaWdodEhhbGY7XHJcblxyXG4gICAgdmFyIHZlY3RvciA9IG5ldyBWZWN0b3IzKCk7XHJcbiAgICB2YXIgdmlld01hdHJpeCA9IG5ldyBNYXRyaXg0KCk7XHJcbiAgICB2YXIgdmlld1Byb2plY3Rpb25NYXRyaXggPSBuZXcgTWF0cml4NCgpO1xyXG5cclxuICAgIHZhciBjYWNoZSA9IHtcclxuICAgICAgICBvYmplY3RzOiBuZXcgV2Vha01hcCgpXHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBkb21FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcclxuICAgIGRvbUVsZW1lbnQuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcclxuXHJcbiAgICB0aGlzLmRvbUVsZW1lbnQgPSBkb21FbGVtZW50O1xyXG5cclxuICAgIHRoaXMuZ2V0U2l6ZSA9IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgd2lkdGg6IF93aWR0aCxcclxuICAgICAgICAgICAgaGVpZ2h0OiBfaGVpZ2h0XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuc2V0U2l6ZSA9IGZ1bmN0aW9uICggd2lkdGgsIGhlaWdodCApIHtcclxuXHJcbiAgICAgICAgX3dpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgX2hlaWdodCA9IGhlaWdodDtcclxuXHJcbiAgICAgICAgX3dpZHRoSGFsZiA9IF93aWR0aCAvIDI7XHJcbiAgICAgICAgX2hlaWdodEhhbGYgPSBfaGVpZ2h0IC8gMjtcclxuXHJcbiAgICAgICAgZG9tRWxlbWVudC5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4JztcclxuICAgICAgICBkb21FbGVtZW50LnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCc7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgcmVuZGVyT2JqZWN0ID0gZnVuY3Rpb24gKCBvYmplY3QsIHNjZW5lLCBjYW1lcmEgKSB7XHJcblxyXG4gICAgICAgIGlmICggb2JqZWN0IGluc3RhbmNlb2YgQ1NTMkRPYmplY3QgKSB7XHJcblxyXG4gICAgICAgICAgICBvYmplY3Qub25CZWZvcmVSZW5kZXIoIF90aGlzLCBzY2VuZSwgY2FtZXJhICk7XHJcblxyXG4gICAgICAgICAgICB2ZWN0b3Iuc2V0RnJvbU1hdHJpeFBvc2l0aW9uKCBvYmplY3QubWF0cml4V29ybGQgKTtcclxuICAgICAgICAgICAgdmVjdG9yLmFwcGx5TWF0cml4NCggdmlld1Byb2plY3Rpb25NYXRyaXggKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBlbGVtZW50ID0gb2JqZWN0LmVsZW1lbnQ7XHJcbiAgICAgICAgICAgIHZhciBzdHlsZSA9ICd0cmFuc2xhdGUoJyArICggdmVjdG9yLnggKiBfd2lkdGhIYWxmICsgX3dpZHRoSGFsZiAtIG9iamVjdC5hbmNob3IueCkgKyAncHgsJyArICggLSB2ZWN0b3IueSAqIF9oZWlnaHRIYWxmICsgX2hlaWdodEhhbGYgLSBvYmplY3QuYW5jaG9yLnkgKSArICdweCknO1xyXG5cclxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5XZWJraXRUcmFuc2Zvcm0gPSBzdHlsZTtcclxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5Nb3pUcmFuc2Zvcm0gPSBzdHlsZTtcclxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5vVHJhbnNmb3JtID0gc3R5bGU7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gc3R5bGU7XHJcblxyXG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAoIG9iamVjdC52aXNpYmxlICYmIHZlY3Rvci56ID49IC0gMSAmJiB2ZWN0b3IueiA8PSAxICkgPyAnJyA6ICdub25lJztcclxuXHJcbiAgICAgICAgICAgIHZhciBvYmplY3REYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgZGlzdGFuY2VUb0NhbWVyYVNxdWFyZWQ6IGdldERpc3RhbmNlVG9TcXVhcmVkKCBjYW1lcmEsIG9iamVjdCApXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBjYWNoZS5vYmplY3RzLnNldCggb2JqZWN0LCBvYmplY3REYXRhICk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIGVsZW1lbnQucGFyZW50Tm9kZSAhPT0gZG9tRWxlbWVudCApIHtcclxuXHJcbiAgICAgICAgICAgICAgICBkb21FbGVtZW50LmFwcGVuZENoaWxkKCBlbGVtZW50ICk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBvYmplY3Qub25BZnRlclJlbmRlciggX3RoaXMsIHNjZW5lLCBjYW1lcmEgKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKCB2YXIgaSA9IDAsIGwgPSBvYmplY3QuY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbDsgaSArKyApIHtcclxuXHJcbiAgICAgICAgICAgIHJlbmRlck9iamVjdCggb2JqZWN0LmNoaWxkcmVuWyBpIF0sIHNjZW5lLCBjYW1lcmEgKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgdmFyIGdldERpc3RhbmNlVG9TcXVhcmVkID0gZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB2YXIgYSA9IG5ldyBWZWN0b3IzKCk7XHJcbiAgICAgICAgdmFyIGIgPSBuZXcgVmVjdG9yMygpO1xyXG5cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCBvYmplY3QxLCBvYmplY3QyICkge1xyXG5cclxuICAgICAgICAgICAgYS5zZXRGcm9tTWF0cml4UG9zaXRpb24oIG9iamVjdDEubWF0cml4V29ybGQgKTtcclxuICAgICAgICAgICAgYi5zZXRGcm9tTWF0cml4UG9zaXRpb24oIG9iamVjdDIubWF0cml4V29ybGQgKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBhLmRpc3RhbmNlVG9TcXVhcmVkKCBiICk7XHJcblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgfSgpO1xyXG5cclxuICAgIHZhciBmaWx0ZXJBbmRGbGF0dGVuID0gZnVuY3Rpb24gKCBzY2VuZSApIHtcclxuXHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG5cclxuICAgICAgICBzY2VuZS50cmF2ZXJzZSggZnVuY3Rpb24gKCBvYmplY3QgKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoIG9iamVjdCBpbnN0YW5jZW9mIENTUzJET2JqZWN0ICkgcmVzdWx0LnB1c2goIG9iamVjdCApO1xyXG5cclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgek9yZGVyID0gZnVuY3Rpb24gKCBzY2VuZSApIHtcclxuXHJcbiAgICAgICAgdmFyIHNvcnRlZCA9IGZpbHRlckFuZEZsYXR0ZW4oIHNjZW5lICkuc29ydCggZnVuY3Rpb24gKCBhLCBiICkge1xyXG5cclxuICAgICAgICAgICAgdmFyIGRpc3RhbmNlQSA9IGNhY2hlLm9iamVjdHMuZ2V0KCBhICkuZGlzdGFuY2VUb0NhbWVyYVNxdWFyZWQ7XHJcbiAgICAgICAgICAgIHZhciBkaXN0YW5jZUIgPSBjYWNoZS5vYmplY3RzLmdldCggYiApLmRpc3RhbmNlVG9DYW1lcmFTcXVhcmVkO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRpc3RhbmNlQSAtIGRpc3RhbmNlQjtcclxuXHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICB2YXIgek1heCA9IHNvcnRlZC5sZW5ndGg7XHJcblxyXG4gICAgICAgIGZvciAoIHZhciBpID0gMCwgbCA9IHNvcnRlZC5sZW5ndGg7IGkgPCBsOyBpICsrICkge1xyXG5cclxuICAgICAgICAgICAgc29ydGVkWyBpIF0uZWxlbWVudC5zdHlsZS56SW5kZXggPSB6TWF4IC0gaTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbiAoIHNjZW5lLCBjYW1lcmEgKSB7XHJcblxyXG4gICAgICAgIGlmICggc2NlbmUuYXV0b1VwZGF0ZSA9PT0gdHJ1ZSApIHNjZW5lLnVwZGF0ZU1hdHJpeFdvcmxkKCk7XHJcbiAgICAgICAgaWYgKCBjYW1lcmEucGFyZW50ID09PSBudWxsICkgY2FtZXJhLnVwZGF0ZU1hdHJpeFdvcmxkKCk7XHJcblxyXG4gICAgICAgIHZpZXdNYXRyaXguY29weSggY2FtZXJhLm1hdHJpeFdvcmxkSW52ZXJzZSApO1xyXG4gICAgICAgIHZpZXdQcm9qZWN0aW9uTWF0cml4Lm11bHRpcGx5TWF0cmljZXMoIGNhbWVyYS5wcm9qZWN0aW9uTWF0cml4LCB2aWV3TWF0cml4ICk7XHJcblxyXG4gICAgICAgIHJlbmRlck9iamVjdCggc2NlbmUsIHNjZW5lLCBjYW1lcmEgKTtcclxuICAgICAgICB6T3JkZXIoIHNjZW5lICk7XHJcblxyXG4gICAgfTtcclxuXHJcbn07XHJcblxyXG5leHBvcnQgeyBDU1MyRE9iamVjdCwgQ1NTMkRSZW5kZXJlciB9OyIsImltcG9ydCB7TWFya2VyfSBmcm9tIFwiLi9NYXJrZXJcIjtcclxuaW1wb3J0IHtDU1MyRE9iamVjdH0gZnJvbSBcIi4uL3V0aWwvQ1NTMkRSZW5kZXJlclwiO1xyXG5pbXBvcnQge2h0bWxUb0VsZW1lbnR9IGZyb20gXCIuLi91dGlsL1V0aWxzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgSFRNTE1hcmtlciBleHRlbmRzIE1hcmtlciB7XHJcblxyXG4gICAgY29uc3RydWN0b3IobWFya2VyU2V0LCBpZCwgcGFyZW50T2JqZWN0KSB7XHJcbiAgICAgICAgc3VwZXIobWFya2VyU2V0LCBpZCk7XHJcblxyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaXNIVE1MTWFya2VyJywge3ZhbHVlOiB0cnVlfSk7XHJcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd0eXBlJywge3ZhbHVlOiBcImh0bWxcIn0pO1xyXG5cclxuICAgICAgICB0aGlzLl9tYXJrZXJFbGVtZW50ID0gaHRtbFRvRWxlbWVudChgPGRpdiBpZD1cImJtLW1hcmtlci0ke3RoaXMuaWR9XCIgY2xhc3M9XCJibS1tYXJrZXItJHt0aGlzLnR5cGV9XCI+PC9kaXY+YCk7XHJcbiAgICAgICAgdGhpcy5fbWFya2VyRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHRoaXMub25DbGljayh0aGlzLnBvc2l0aW9uKSk7XHJcbiAgICAgICAgdGhpcy5fbWFya2VyT2JqZWN0ID0gbmV3IENTUzJET2JqZWN0KHRoaXMuX21hcmtlckVsZW1lbnQpO1xyXG4gICAgICAgIHRoaXMuX21hcmtlck9iamVjdC5wb3NpdGlvbi5jb3B5KHRoaXMucG9zaXRpb24pO1xyXG4gICAgICAgIHRoaXMuX21hcmtlck9iamVjdC5vbkJlZm9yZVJlbmRlciA9IChyZW5kZXJlciwgc2NlbmUsIGNhbWVyYSkgPT4gdGhpcy5fb25CZWZvcmVSZW5kZXIocmVuZGVyZXIsIHNjZW5lLCBjYW1lcmEpO1xyXG5cclxuICAgICAgICBwYXJlbnRPYmplY3QuYWRkKHRoaXMuX21hcmtlck9iamVjdCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKG1hcmtlckRhdGEpIHtcclxuICAgICAgICBzdXBlci51cGRhdGUobWFya2VyRGF0YSk7XHJcblxyXG4gICAgICAgIGlmIChtYXJrZXJEYXRhLmh0bWwpIHtcclxuICAgICAgICAgICAgdGhpcy5odG1sID0gbWFya2VyRGF0YS5odG1sO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG1hcmtlckRhdGEuYW5jaG9yKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0QW5jaG9yKHBhcnNlSW50KG1hcmtlckRhdGEuYW5jaG9yLngpLCBwYXJzZUludChtYXJrZXJEYXRhLmFuY2hvci55KSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF9vbkJlZm9yZVJlbmRlcihyZW5kZXJlciwgc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICAgIHN1cGVyLl9vbkJlZm9yZVJlbmRlcihyZW5kZXJlciwgc2NlbmUsIGNhbWVyYSk7XHJcblxyXG4gICAgICAgIHRoaXMuX21hcmtlckVsZW1lbnQuc3R5bGUub3BhY2l0eSA9IHRoaXMuX29wYWNpdHk7XHJcbiAgICAgICAgdGhpcy5fbWFya2VyRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWRpc3RhbmNlXCIsIE1hdGgucm91bmQodGhpcy5fZGlzdGFuY2UpKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX29wYWNpdHkgPD0gMCl7XHJcbiAgICAgICAgICAgIHRoaXMuX21hcmtlckVsZW1lbnQuc3R5bGUucG9pbnRlckV2ZW50cyA9IFwibm9uZVwiO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX21hcmtlckVsZW1lbnQuc3R5bGUucG9pbnRlckV2ZW50cyA9IFwiYXV0b1wiO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkaXNwb3NlKCkge1xyXG4gICAgICAgIHRoaXMuX21hcmtlck9iamVjdC5wYXJlbnQucmVtb3ZlKHRoaXMuX21hcmtlck9iamVjdCk7XHJcblxyXG4gICAgICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgaHRtbChodG1sKSB7XHJcbiAgICAgICAgdGhpcy5fbWFya2VyRWxlbWVudC5pbm5lckhUTUwgPSBodG1sO1xyXG4gICAgfVxyXG5cclxuICAgIHNldEFuY2hvcih4LCB5KSB7XHJcbiAgICAgICAgdGhpcy5fbWFya2VyT2JqZWN0LmFuY2hvci5zZXQoeCwgeSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0UG9zaXRpb24oeCwgeSwgeikge1xyXG4gICAgICAgIHN1cGVyLnNldFBvc2l0aW9uKHgsIHksIHopO1xyXG4gICAgICAgIHRoaXMuX21hcmtlck9iamVjdC5wb3NpdGlvbi5zZXQoeCwgeSwgeik7XHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHtIVE1MTWFya2VyfSBmcm9tIFwiLi9IVE1MTWFya2VyXCI7XHJcbmltcG9ydCB7ZGlzcGF0Y2hFdmVudH0gZnJvbSBcIi4uL3V0aWwvVXRpbHNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBQT0lNYXJrZXIgZXh0ZW5kcyBIVE1MTWFya2VyIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihtYXJrZXJTZXQsIGlkLCBwYXJlbnRPYmplY3QpIHtcclxuICAgICAgICBzdXBlcihtYXJrZXJTZXQsIGlkLCBwYXJlbnRPYmplY3QpO1xyXG4gICAgICAgIHRoaXMuX21hcmtlckVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImJtLW1hcmtlci1wb2lcIik7XHJcblxyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaXNQT0lNYXJrZXInLCB7dmFsdWU6IHRydWV9KTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUobWFya2VyRGF0YSkge1xyXG4gICAgICAgIHN1cGVyLnVwZGF0ZShtYXJrZXJEYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5pY29uID0gbWFya2VyRGF0YS5pY29uID8gbWFya2VyRGF0YS5pY29uIDogXCJhc3NldHMvcG9pLnN2Z1wiO1xyXG5cclxuICAgICAgICAvL2JhY2t3YXJkcyBjb21wYXRpYmlsaXR5IGZvciBcImljb25BbmNob3JcIlxyXG4gICAgICAgIGlmICghbWFya2VyRGF0YS5hbmNob3IpIHtcclxuICAgICAgICAgICAgaWYgKG1hcmtlckRhdGEuaWNvbkFuY2hvcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBbmNob3IocGFyc2VJbnQobWFya2VyRGF0YS5pY29uQW5jaG9yLngpLCBwYXJzZUludChtYXJrZXJEYXRhLmljb25BbmNob3IueSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uQ2xpY2soY2xpY2tQb3NpdGlvbikge1xyXG4gICAgICAgIGlmICghZGlzcGF0Y2hFdmVudCh0aGlzLm1hbmFnZXIuZXZlbnRzLCAnYmx1ZW1hcE1hcmtlckNsaWNrJywge21hcmtlcjogdGhpc30pKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuZm9sbG93TGluaygpO1xyXG5cclxuICAgICAgICB0aGlzLl9tYXJrZXJFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJibS1tYXJrZXItcG9pLXNob3ctbGFiZWxcIik7XHJcblxyXG4gICAgICAgIGxldCBvblJlbW92ZUxhYmVsID0gKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9tYXJrZXJFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJibS1tYXJrZXItcG9pLXNob3ctbGFiZWxcIik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5tYW5hZ2VyLmV2ZW50cy5hZGRFdmVudExpc3RlbmVyKCdibHVlbWFwUG9wdXBNYXJrZXInLCBvblJlbW92ZUxhYmVsLCB7b25jZTogdHJ1ZX0pO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm1hbmFnZXIuZXZlbnRzLmFkZEV2ZW50TGlzdGVuZXIoJ2JsdWVtYXBDYW1lcmFNb3ZlZCcsIG9uUmVtb3ZlTGFiZWwsIHtvbmNlOiB0cnVlfSk7XHJcbiAgICAgICAgfSwgMTAwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGxhYmVsKGxhYmVsKXtcclxuICAgICAgICB0aGlzLl9sYWJlbCA9IGxhYmVsO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZUh0bWwoKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgaWNvbihpY29uKSB7XHJcbiAgICAgICAgdGhpcy5faWNvbiA9IGljb247XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlSHRtbCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZUh0bWwoKSB7XHJcbiAgICAgICAgbGV0IGxhYmVsSHRtbCA9ICcnO1xyXG4gICAgICAgIGlmICh0aGlzLl9sYWJlbCkgbGFiZWxIdG1sID0gYDxkaXYgY2xhc3M9XCJibS1tYXJrZXItcG9pLWxhYmVsXCI+JHt0aGlzLl9sYWJlbH08L2Rpdj5gO1xyXG5cclxuICAgICAgICB0aGlzLmh0bWwgPSBgPGltZyBzcmM9XCIke3RoaXMuX2ljb259XCIgYWx0PVwiUE9JLSR7dGhpcy5pZH1cIiBkcmFnZ2FibGU9XCJmYWxzZVwiPiR7bGFiZWxIdG1sfWA7XHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHtIVE1MTWFya2VyfSBmcm9tIFwiLi9IVE1MTWFya2VyXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgUGxheWVyTWFya2VyIGV4dGVuZHMgSFRNTE1hcmtlciB7XHJcblxyXG4gICAgY29uc3RydWN0b3IobWFya2VyU2V0LCBpZCwgcGFyZW50T2JqZWN0LCBwbGF5ZXJVdWlkKSB7XHJcbiAgICAgICAgc3VwZXIobWFya2VyU2V0LCBpZCwgcGFyZW50T2JqZWN0KTtcclxuICAgICAgICB0aGlzLl9tYXJrZXJFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJibS1tYXJrZXItcGxheWVyXCIpO1xyXG5cclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2lzUGxheWVyTWFya2VyJywge3ZhbHVlOiB0cnVlfSk7XHJcblxyXG4gICAgICAgIHRoaXMuX25hbWUgPSBpZDtcclxuICAgICAgICB0aGlzLl9oZWFkID0gXCJhc3NldHMvcGxheWVyaGVhZHMvc3RldmUucG5nXCI7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJVdWlkID0gcGxheWVyVXVpZDtcclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGVIdG1sKCk7XHJcbiAgICB9XHJcblxyXG4gICAgb25DbGljayhjbGlja1Bvc2l0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5mb2xsb3dMaW5rKCk7XHJcblxyXG4gICAgICAgIHRoaXMuX21hcmtlckVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImJtLW1hcmtlci1wb2ktc2hvdy1sYWJlbFwiKTtcclxuXHJcbiAgICAgICAgbGV0IG9uUmVtb3ZlTGFiZWwgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX21hcmtlckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImJtLW1hcmtlci1wb2ktc2hvdy1sYWJlbFwiKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLm1hbmFnZXIuZXZlbnRzLmFkZEV2ZW50TGlzdGVuZXIoJ2JsdWVtYXBQb3B1cE1hcmtlcicsIG9uUmVtb3ZlTGFiZWwsIHtvbmNlOiB0cnVlfSk7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubWFuYWdlci5ldmVudHMuYWRkRXZlbnRMaXN0ZW5lcignYmx1ZW1hcENhbWVyYU1vdmVkJywgb25SZW1vdmVMYWJlbCwge29uY2U6IHRydWV9KTtcclxuICAgICAgICB9LCAxMDAwKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgbmFtZShuYW1lKXtcclxuICAgICAgICB0aGlzLl9uYW1lID0gbmFtZTtcclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGVIdG1sKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGhlYWQoaGVhZEltYWdlKSB7XHJcbiAgICAgICAgdGhpcy5faGVhZCA9IGhlYWRJbWFnZTtcclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGVIdG1sKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlSHRtbCgpIHtcclxuICAgICAgICBsZXQgbGFiZWxIdG1sID0gJyc7XHJcbiAgICAgICAgaWYgKHRoaXMuX25hbWUpIGxhYmVsSHRtbCA9IGA8ZGl2IGNsYXNzPVwiYm0tbWFya2VyLXBvaS1sYWJlbFwiPiR7dGhpcy5fbmFtZX08L2Rpdj5gO1xyXG5cclxuICAgICAgICB0aGlzLmh0bWwgPSBgPGltZyBzcmM9XCIke3RoaXMuX2hlYWR9XCIgYWx0PVwiUGxheWVySGVhZC0ke3RoaXMuaWR9XCIgZHJhZ2dhYmxlPVwiZmFsc2VcIj4ke2xhYmVsSHRtbH1gO1xyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7U2hhcGVNYXJrZXJ9IGZyb20gXCIuL1NoYXBlTWFya2VyXCI7XHJcbmltcG9ydCB7T2JqZWN0M0R9IGZyb20gXCJ0aHJlZVwiO1xyXG5pbXBvcnQge0xpbmVNYXJrZXJ9IGZyb20gXCIuL0xpbmVNYXJrZXJcIjtcclxuaW1wb3J0IHtFeHRydWRlTWFya2VyfSBmcm9tIFwiLi9FeHRydWRlTWFya2VyXCI7XHJcbmltcG9ydCB7SFRNTE1hcmtlcn0gZnJvbSBcIi4vSFRNTE1hcmtlclwiO1xyXG5pbXBvcnQge1BPSU1hcmtlcn0gZnJvbSBcIi4vUE9JTWFya2VyXCI7XHJcbmltcG9ydCB7TWFya2VyfSBmcm9tIFwiLi9NYXJrZXJcIjtcclxuaW1wb3J0IHtQbGF5ZXJNYXJrZXJ9IGZyb20gXCIuL1BsYXllck1hcmtlclwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIE1hcmtlclNldCB7XHJcblxyXG4gICAgc3RhdGljIFNvdXJjZSA9IHtcclxuICAgICAgICBDVVNUT006IDAsXHJcbiAgICAgICAgTUFSS0VSX0ZJTEU6IDFcclxuICAgIH1cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihtYW5hZ2VyLCBpZCwgbWFwSWQsIGV2ZW50cyA9IG51bGwpIHtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2lzTWFya2VyU2V0Jywge3ZhbHVlOiB0cnVlfSk7XHJcblxyXG4gICAgICAgIHRoaXMubWFuYWdlciA9IG1hbmFnZXI7XHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG5cclxuICAgICAgICB0aGlzLl9tYXBJZCA9IG1hcElkO1xyXG4gICAgICAgIHRoaXMuX29iamVjdE1hcmtlck9iamVjdCA9IG5ldyBPYmplY3QzRCgpO1xyXG4gICAgICAgIHRoaXMuX2VsZW1lbnRNYXJrZXJPYmplY3QgPSBuZXcgT2JqZWN0M0QoKTtcclxuICAgICAgICB0aGlzLmV2ZW50cyA9IGV2ZW50cztcclxuXHJcbiAgICAgICAgdGhpcy5sYWJlbCA9IHRoaXMuaWQ7XHJcbiAgICAgICAgdGhpcy50b2dnbGVhYmxlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmRlZmF1bHRIaWRlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMudmlzaWJsZSA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgdGhpcy5fc291cmNlID0gTWFya2VyU2V0LlNvdXJjZS5DVVNUT007XHJcblxyXG4gICAgICAgIHRoaXMuX21hcmtlciA9IHt9O1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShtYXJrZXJTZXREYXRhKSB7XHJcbiAgICAgICAgdGhpcy5fc291cmNlID0gTWFya2VyU2V0LlNvdXJjZS5NQVJLRVJfRklMRTtcclxuXHJcbiAgICAgICAgdGhpcy5sYWJlbCA9IG1hcmtlclNldERhdGEubGFiZWwgPyBtYXJrZXJTZXREYXRhLmxhYmVsIDogdGhpcy5pZDtcclxuICAgICAgICB0aGlzLnRvZ2dsZWFibGUgPSBtYXJrZXJTZXREYXRhLnRvZ2dsZWFibGUgIT09IHVuZGVmaW5lZCA/ICEhbWFya2VyU2V0RGF0YS50b2dnbGVhYmxlIDogdHJ1ZTtcclxuICAgICAgICB0aGlzLmRlZmF1bHRIaWRlID0gISFtYXJrZXJTZXREYXRhLmRlZmF1bHRIaWRlO1xyXG4gICAgICAgIGlmICh0aGlzLnZpc2libGUgPT09IHVuZGVmaW5lZCkgdGhpcy52aXNpYmxlID0gdGhpcy5kZWZhdWx0SGlkZTtcclxuXHJcbiAgICAgICAgbGV0IHByZXZNYXJrZXJzID0gdGhpcy5fbWFya2VyO1xyXG4gICAgICAgIHRoaXMuX21hcmtlciA9IHt9O1xyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KG1hcmtlclNldERhdGEubWFya2VyKSl7XHJcbiAgICAgICAgICAgIGZvciAobGV0IG1hcmtlckRhdGEgb2YgbWFya2VyU2V0RGF0YS5tYXJrZXIpIHtcclxuICAgICAgICAgICAgICAgIGxldCBtYXJrZXJJZCA9IG1hcmtlckRhdGEuaWQ7XHJcbiAgICAgICAgICAgICAgICBpZiAoIW1hcmtlcklkKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9tYXJrZXJbbWFya2VySWRdKSBjb250aW51ZTsgLy8gc2tpcCBkdXBsaWNhdGUgaWQnc1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBtYXBJZCA9IG1hcmtlckRhdGEubWFwO1xyXG4gICAgICAgICAgICAgICAgaWYgKG1hcElkICE9PSB0aGlzLl9tYXBJZCkgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWFya2VyW21hcmtlcklkXSA9IHByZXZNYXJrZXJzW21hcmtlcklkXTtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBwcmV2TWFya2Vyc1ttYXJrZXJJZF07XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVNYXJrZXIobWFya2VySWQsIG1hcmtlckRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL3JlbWFpbmluZyAocmVtb3ZlZCkgbWFya2Vyc1xyXG4gICAgICAgIGZvciAobGV0IG1hcmtlcklkIGluIHByZXZNYXJrZXJzKSB7XHJcbiAgICAgICAgICAgIGlmICghcHJldk1hcmtlcnMuaGFzT3duUHJvcGVydHkobWFya2VySWQpKSBjb250aW51ZTtcclxuICAgICAgICAgICAgaWYgKCFwcmV2TWFya2Vyc1ttYXJrZXJJZF0gfHwgIXByZXZNYXJrZXJzW21hcmtlcklkXS5pc01hcmtlcikgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAvLyBrZWVwIG1hcmtlcnMgdGhhdCB3ZXJlIG5vdCBsb2FkZWQgZnJvbSB0aGUgbWFya2VyLWZpbGVcclxuICAgICAgICAgICAgaWYgKHByZXZNYXJrZXJzW21hcmtlcklkXS5fc291cmNlICE9PSBNYXJrZXIuU291cmNlLk1BUktFUl9GSUxFKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuX21hcmtlclttYXJrZXJJZF0gPSBwcmV2TWFya2Vyc1ttYXJrZXJJZF07XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcHJldk1hcmtlcnNbbWFya2VySWRdLmRpc3Bvc2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlTWFya2VyKG1hcmtlcklkLCBtYXJrZXJEYXRhKXtcclxuICAgICAgICBsZXQgbWFya2VyVHlwZSA9IG1hcmtlckRhdGEudHlwZTtcclxuICAgICAgICBpZiAoIW1hcmtlclR5cGUpIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLl9tYXJrZXJbbWFya2VySWRdIHx8ICF0aGlzLl9tYXJrZXJbbWFya2VySWRdLmlzTWFya2VyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlTWFya2VyKG1hcmtlcklkLCBtYXJrZXJUeXBlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX21hcmtlclttYXJrZXJJZF0udHlwZSAhPT0gbWFya2VyVHlwZSl7XHJcbiAgICAgICAgICAgIHRoaXMuX21hcmtlclttYXJrZXJJZF0uZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZU1hcmtlcihtYXJrZXJJZCwgbWFya2VyVHlwZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRoaXMuX21hcmtlclttYXJrZXJJZF0pIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5fbWFya2VyW21hcmtlcklkXS51cGRhdGUobWFya2VyRGF0YSk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlTWFya2VyKGlkLCB0eXBlKSB7XHJcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJodG1sXCIgOiB0aGlzLl9tYXJrZXJbaWRdID0gbmV3IEhUTUxNYXJrZXIodGhpcywgaWQsIHRoaXMuX2VsZW1lbnRNYXJrZXJPYmplY3QpOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBcInBvaVwiIDogdGhpcy5fbWFya2VyW2lkXSA9IG5ldyBQT0lNYXJrZXIodGhpcywgaWQsIHRoaXMuX2VsZW1lbnRNYXJrZXJPYmplY3QpOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBcInNoYXBlXCIgOiB0aGlzLl9tYXJrZXJbaWRdID0gbmV3IFNoYXBlTWFya2VyKHRoaXMsIGlkLCB0aGlzLl9vYmplY3RNYXJrZXJPYmplY3QpOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBcImxpbmVcIiA6IHRoaXMuX21hcmtlcltpZF0gPSBuZXcgTGluZU1hcmtlcih0aGlzLCBpZCwgdGhpcy5fb2JqZWN0TWFya2VyT2JqZWN0KTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgXCJleHRydWRlXCIgOiB0aGlzLl9tYXJrZXJbaWRdID0gbmV3IEV4dHJ1ZGVNYXJrZXIodGhpcywgaWQsIHRoaXMuX29iamVjdE1hcmtlck9iamVjdCk7IGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0IDogcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5fbWFya2VyW2lkXTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVQbGF5ZXJNYXJrZXIocGxheWVyVXVpZCkge1xyXG4gICAgICAgIGxldCBpZCA9IHBsYXllclV1aWQ7XHJcbiAgICAgICAgdGhpcy5fbWFya2VyW2lkXSA9IG5ldyBQbGF5ZXJNYXJrZXIodGhpcywgaWQsIHRoaXMuX2VsZW1lbnRNYXJrZXJPYmplY3QsIHBsYXllclV1aWQpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9tYXJrZXJbaWRdO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBtYXJrZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX21hcmtlci52YWx1ZXMoKTtcclxuICAgIH1cclxuXHJcbiAgICBkaXNwb3NlKCkge1xyXG4gICAgICAgIGxldCBtYXJrZXIgPSB7Li4udGhpcy5fbWFya2VyfTtcclxuICAgICAgICBmb3IgKGxldCBtYXJrZXJJZCBpbiBtYXJrZXIpe1xyXG4gICAgICAgICAgICBpZiAoIW1hcmtlci5oYXNPd25Qcm9wZXJ0eShtYXJrZXJJZCkpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBpZiAoIW1hcmtlclttYXJrZXJJZF0gfHwgIW1hcmtlclttYXJrZXJJZF0uaXNNYXJrZXIpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgbWFya2VyW21hcmtlcklkXS5kaXNwb3NlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9tYXJrZXIgPSB7fTtcclxuICAgICAgICBkZWxldGUgdGhpcy5tYW5hZ2VyLm1hcmtlclNldHNbdGhpcy5pZF07XHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHthbGVydCwgZGlzcGF0Y2hFdmVudH0gZnJvbSBcIi4uL3V0aWwvVXRpbHNcIjtcclxuaW1wb3J0IHtGaWxlTG9hZGVyLCBTY2VuZX0gZnJvbSBcInRocmVlXCI7XHJcbmltcG9ydCB7TWFya2VyU2V0fSBmcm9tIFwiLi9NYXJrZXJTZXRcIjtcclxuaW1wb3J0IHtIVE1MTWFya2VyfSBmcm9tIFwiLi9IVE1MTWFya2VyXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgTWFya2VyTWFuYWdlciB7XHJcblxyXG4gICAgY29uc3RydWN0b3IobWFya2VyRmlsZVVybCwgbWFwSWQsIGV2ZW50cyA9IG51bGwpIHtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2lzTWFya2VyTWFuYWdlcicsIHt2YWx1ZTogdHJ1ZX0pO1xyXG5cclxuICAgICAgICB0aGlzLm1hcmtlckZpbGVVcmwgPSBtYXJrZXJGaWxlVXJsO1xyXG4gICAgICAgIHRoaXMubWFwSWQgPSBtYXBJZDtcclxuICAgICAgICB0aGlzLmV2ZW50cyA9IGV2ZW50cztcclxuXHJcbiAgICAgICAgdGhpcy5tYXJrZXJTZXRzID0ge307XHJcblxyXG4gICAgICAgIHRoaXMub2JqZWN0TWFya2VyU2NlbmUgPSBuZXcgU2NlbmUoKTsgLy8zZCBtYXJrZXJzXHJcbiAgICAgICAgdGhpcy5lbGVtZW50TWFya2VyU2NlbmUgPSBuZXcgU2NlbmUoKTsgLy9odG1sIG1hcmtlcnNcclxuXHJcbiAgICAgICAgdGhpcy5fcG9wdXBJZCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxvYWRNYXJrZXJzRmlsZSgpXHJcbiAgICAgICAgICAgIC50aGVuKG1hcmtlcnNGaWxlID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBwcmV2TWFya2VyU2V0cyA9IHRoaXMubWFya2VyU2V0cztcclxuICAgICAgICAgICAgICAgIHRoaXMubWFya2VyU2V0cyA9IHt9O1xyXG4gICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkobWFya2Vyc0ZpbGUubWFya2VyU2V0cykpe1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG1hcmtlclNldERhdGEgb2YgbWFya2Vyc0ZpbGUubWFya2VyU2V0cyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtYXJrZXJTZXRJZCA9IG1hcmtlclNldERhdGEuaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbWFya2VyU2V0SWQpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5tYXJrZXJTZXRzW21hcmtlclNldElkXSkgY29udGludWU7IC8vIHNraXAgZHVwbGljYXRlIGlkJ3NcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWFya2VyU2V0c1ttYXJrZXJTZXRJZF0gPSBwcmV2TWFya2VyU2V0c1ttYXJrZXJTZXRJZF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBwcmV2TWFya2VyU2V0c1ttYXJrZXJTZXRJZF07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZU1hcmtlclNldChtYXJrZXJTZXRJZCwgbWFya2VyU2V0RGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vcmVtYWluaW5nIChyZW1vdmVkKSBtYXJrZXJTZXRzXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBtYXJrZXJTZXRJZCBpbiBwcmV2TWFya2VyU2V0cykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghcHJldk1hcmtlclNldHMuaGFzT3duUHJvcGVydHkobWFya2VyU2V0SWQpKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXByZXZNYXJrZXJTZXRzW21hcmtlclNldElkXSB8fCAhcHJldk1hcmtlclNldHNbbWFya2VyU2V0SWRdLmlzTWFya2VyU2V0KSBjb250aW51ZTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGtlZXAgbWFya2VyLXNldHMgdGhhdCB3ZXJlIG5vdCBsb2FkZWQgZnJvbSB0aGUgbWFya2VyLWZpbGVcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJldk1hcmtlclNldHNbbWFya2VyU2V0SWRdLl9zb3VyY2UgIT09IE1hcmtlclNldC5Tb3VyY2UuTUFSS0VSX0ZJTEUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcmtlclNldHNbbWFya2VyU2V0SWRdID0gcHJldk1hcmtlclNldHNbbWFya2VyU2V0SWRdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHByZXZNYXJrZXJTZXRzW21hcmtlclNldElkXS5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChyZWFzb24gPT4ge1xyXG4gICAgICAgICAgICAgICAgYWxlcnQodGhpcy5ldmVudHMsIHJlYXNvbiwgXCJ3YXJuaW5nXCIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVNYXJrZXJTZXQobWFya2VyU2V0SWQsIG1hcmtlclNldERhdGEpIHtcclxuICAgICAgICBpZiAoIXRoaXMubWFya2VyU2V0c1ttYXJrZXJTZXRJZF0gfHwgIXRoaXMubWFya2VyU2V0c1ttYXJrZXJTZXRJZF0uaXNNYXJrZXJTZXQpe1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZU1hcmtlclNldChtYXJrZXJTZXRJZCk7XHJcbiAgICAgICAgICAgIHRoaXMub2JqZWN0TWFya2VyU2NlbmUuYWRkKHRoaXMubWFya2VyU2V0c1ttYXJrZXJTZXRJZF0uX29iamVjdE1hcmtlck9iamVjdCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudE1hcmtlclNjZW5lLmFkZCh0aGlzLm1hcmtlclNldHNbbWFya2VyU2V0SWRdLl9lbGVtZW50TWFya2VyT2JqZWN0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubWFya2VyU2V0c1ttYXJrZXJTZXRJZF0udXBkYXRlKG1hcmtlclNldERhdGEpO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZU1hcmtlclNldChpZCkge1xyXG4gICAgICAgIHRoaXMubWFya2VyU2V0c1tpZF0gPSBuZXcgTWFya2VyU2V0KHRoaXMsIGlkLCB0aGlzLm1hcElkLCB0aGlzLmV2ZW50cyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWFya2VyU2V0c1tpZF07XHJcbiAgICB9XHJcblxyXG4gICAgZGlzcG9zZSgpIHtcclxuICAgICAgICBsZXQgc2V0cyA9IHsuLi50aGlzLm1hcmtlclNldHN9O1xyXG4gICAgICAgIGZvciAobGV0IG1hcmtlclNldElkIGluIHNldHMpe1xyXG4gICAgICAgICAgICBpZiAoIXNldHMuaGFzT3duUHJvcGVydHkobWFya2VyU2V0SWQpKSBjb250aW51ZTtcclxuICAgICAgICAgICAgaWYgKCFzZXRzW21hcmtlclNldElkXSB8fCAhc2V0c1ttYXJrZXJTZXRJZF0uaXNNYXJrZXJTZXQpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgc2V0c1ttYXJrZXJTZXRJZF0uZGlzcG9zZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5tYXJrZXJTZXRzID0ge307XHJcbiAgICB9XHJcblxyXG4gICAgc2hvd1BvcHVwKGh0bWwsIHgsIHksIHosIGF1dG9SZW1vdmUgPSB0cnVlLCBvblJlbW92YWwgPSBudWxsKXtcclxuICAgICAgICBsZXQgbWFya2VyID0gbmV3IEhUTUxNYXJrZXIodGhpcywgYHBvcHVwLSR7dGhpcy5fcG9wdXBJZCsrfWAsIHRoaXMuZWxlbWVudE1hcmtlclNjZW5lKTtcclxuICAgICAgICBtYXJrZXIuc2V0UG9zaXRpb24oeCwgeSwgeik7XHJcbiAgICAgICAgbWFya2VyLmh0bWwgPSBodG1sO1xyXG5cclxuICAgICAgICBtYXJrZXIub25EaXNwb3NhbCA9IG9uUmVtb3ZhbDtcclxuXHJcbiAgICAgICAgZGlzcGF0Y2hFdmVudCh0aGlzLmV2ZW50cywgJ2JsdWVtYXBQb3B1cE1hcmtlcicsIHttYXJrZXI6IG1hcmtlcn0pO1xyXG5cclxuICAgICAgICBpZiAoYXV0b1JlbW92ZSl7XHJcbiAgICAgICAgICAgIGxldCBvblJlbW92ZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIG1hcmtlci5ibGVuZE91dCgyMDAsIGZpbmlzaGVkID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZmluaXNoZWQpIG1hcmtlci5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzLmFkZEV2ZW50TGlzdGVuZXIoJ2JsdWVtYXBQb3B1cE1hcmtlcicsIG9uUmVtb3ZlLCB7b25jZTogdHJ1ZX0pO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRzLmFkZEV2ZW50TGlzdGVuZXIoJ2JsdWVtYXBDYW1lcmFNb3ZlZCcsIG9uUmVtb3ZlLCB7b25jZTogdHJ1ZX0pO1xyXG4gICAgICAgICAgICB9LCAxMDAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG1hcmtlci5ibGVuZEluKDIwMCk7XHJcbiAgICAgICAgcmV0dXJuIG1hcmtlcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIExvYWRzIHRoZSBtYXJrZXJzLmpzb24gZmlsZSBmb3IgdGhpcyBtYXBcclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPE9iamVjdD59XHJcbiAgICAgKi9cclxuICAgIGxvYWRNYXJrZXJzRmlsZSgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBhbGVydCh0aGlzLmV2ZW50cywgYExvYWRpbmcgbWFya2VycyBmcm9tICcke3RoaXMubWFya2VyRmlsZVVybH0nLi4uYCwgXCJmaW5lXCIpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGxvYWRlciA9IG5ldyBGaWxlTG9hZGVyKCk7XHJcbiAgICAgICAgICAgIGxvYWRlci5zZXRSZXNwb25zZVR5cGUoXCJqc29uXCIpO1xyXG4gICAgICAgICAgICBsb2FkZXIubG9hZCh0aGlzLm1hcmtlckZpbGVVcmwsXHJcbiAgICAgICAgICAgICAgICBtYXJrZXJGaWxlID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW1hcmtlckZpbGUpIHJlamVjdChgRmFpbGVkIHRvIHBhcnNlICcke3RoaXMubWFya2VyRmlsZVVybH0nIWApO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgcmVzb2x2ZShtYXJrZXJGaWxlKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAoKSA9PiB7fSxcclxuICAgICAgICAgICAgICAgICgpID0+IHJlamVjdChgRmFpbGVkIHRvIGxvYWQgJyR7dGhpcy5tYXJrZXJGaWxlVXJsfSchYClcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7XHJcblx0Q2xhbXBUb0VkZ2VXcmFwcGluZyxcclxuXHRGaWxlTG9hZGVyLCBGcm9udFNpZGUsIE5lYXJlc3RGaWx0ZXIsIE5lYXJlc3RNaXBNYXBMaW5lYXJGaWx0ZXIsIFJheWNhc3RlcixcclxuXHRTY2VuZSwgU2hhZGVyTWF0ZXJpYWwsIFRleHR1cmUsIFZlY3RvcjIsIFZlY3RvcjMsIFZlcnRleENvbG9yc1xyXG59IGZyb20gXCJ0aHJlZVwiO1xyXG5pbXBvcnQge2FsZXJ0LCBkaXNwYXRjaEV2ZW50LCBoYXNoVGlsZSwgc3RyaW5nVG9JbWFnZX0gZnJvbSBcIi4uL3V0aWwvVXRpbHNcIjtcclxuaW1wb3J0IHtUaWxlTWFuYWdlcn0gZnJvbSBcIi4vVGlsZU1hbmFnZXJcIjtcclxuaW1wb3J0IHtUaWxlTG9hZGVyfSBmcm9tIFwiLi9UaWxlTG9hZGVyXCI7XHJcbmltcG9ydCB7TWFya2VyTWFuYWdlcn0gZnJvbSBcIi4uL21hcmtlcnMvTWFya2VyTWFuYWdlclwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIE1hcCB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKGlkLCBkYXRhVXJsLCBldmVudHMgPSBudWxsKSB7XHJcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoIHRoaXMsICdpc01hcCcsIHsgdmFsdWU6IHRydWUgfSApO1xyXG5cclxuXHRcdHRoaXMuaWQgPSBpZDtcclxuXHRcdHRoaXMuZXZlbnRzID0gZXZlbnRzO1xyXG5cdFx0dGhpcy5kYXRhVXJsID0gZGF0YVVybDtcclxuXHJcblx0XHR0aGlzLm5hbWUgPSB0aGlzLmlkO1xyXG5cdFx0dGhpcy53b3JsZCA9IFwiLVwiO1xyXG5cclxuXHRcdHRoaXMuc3RhcnRQb3MgPSB7eDogMCwgejogMH07XHJcblx0XHR0aGlzLnNreUNvbG9yID0ge3I6IDAsIGc6IDAsIGI6IDB9O1xyXG5cdFx0dGhpcy5hbWJpZW50TGlnaHQgPSAwO1xyXG5cclxuXHRcdHRoaXMuaGlyZXMgPSB7XHJcblx0XHRcdHRpbGVTaXplOiB7eDogMzIsIHo6IDMyfSxcclxuXHRcdFx0c2NhbGU6IHt4OiAxLCB6OiAxfSxcclxuXHRcdFx0dHJhbnNsYXRlOiB7eDogMiwgejogMn1cclxuXHRcdH07XHJcblx0XHR0aGlzLmxvd3JlcyA9IHtcclxuXHRcdFx0dGlsZVNpemU6IHt4OiAzMiwgejogMzJ9LFxyXG5cdFx0XHRzY2FsZToge3g6IDEsIHo6IDF9LFxyXG5cdFx0XHR0cmFuc2xhdGU6IHt4OiAyLCB6OiAyfVxyXG5cdFx0fTtcclxuXHJcblx0XHR0aGlzLnNjZW5lID0gbmV3IFNjZW5lKCk7XHJcblx0XHR0aGlzLnNjZW5lLmF1dG9VcGRhdGUgPSBmYWxzZTtcclxuXHJcblx0XHR0aGlzLnJheWNhc3RlciA9IG5ldyBSYXljYXN0ZXIoKTtcclxuXHJcblx0XHR0aGlzLmhpcmVzTWF0ZXJpYWwgPSBudWxsO1xyXG5cdFx0dGhpcy5sb3dyZXNNYXRlcmlhbCA9IG51bGw7XHJcblx0XHR0aGlzLmxvYWRlZFRleHR1cmVzID0gW107XHJcblxyXG5cdFx0dGhpcy5oaXJlc1RpbGVNYW5hZ2VyID0gbnVsbDtcclxuXHRcdHRoaXMubG93cmVzVGlsZU1hbmFnZXIgPSBudWxsO1xyXG5cclxuXHRcdHRoaXMubWFya2VyTWFuYWdlciA9IG5ldyBNYXJrZXJNYW5hZ2VyKHRoaXMuZGF0YVVybCArIFwiLi4vbWFya2Vycy5qc29uXCIsIHRoaXMuaWQsIHRoaXMuZXZlbnRzKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIExvYWRzIHRleHR1cmVzIGFuZCBtYXRlcmlhbHMgZm9yIHRoaXMgbWFwIHNvIGl0IGlzIHJlYWR5IHRvIGxvYWQgbWFwLXRpbGVzXHJcblx0ICogQHJldHVybnMge1Byb21pc2U8dm9pZD59XHJcblx0ICovXHJcblx0bG9hZChoaXJlc1ZlcnRleFNoYWRlciwgaGlyZXNGcmFnbWVudFNoYWRlciwgbG93cmVzVmVydGV4U2hhZGVyLCBsb3dyZXNGcmFnbWVudFNoYWRlciwgdW5pZm9ybXMpIHtcclxuXHRcdHRoaXMudW5sb2FkKClcclxuXHJcblx0XHRsZXQgc2V0dGluZ3NGaWxlUHJvbWlzZSA9IHRoaXMubG9hZFNldHRpbmdzRmlsZSgpO1xyXG5cdFx0bGV0IHRleHR1cmVGaWxlUHJvbWlzZSA9IHRoaXMubG9hZFRleHR1cmVzRmlsZSgpO1xyXG5cdFx0bGV0IG1hcmtlclVwZGF0ZVByb21pc2UgPSB0aGlzLm1hcmtlck1hbmFnZXIudXBkYXRlKCk7XHJcblxyXG5cdFx0dGhpcy5sb3dyZXNNYXRlcmlhbCA9IHRoaXMuY3JlYXRlTG93cmVzTWF0ZXJpYWwobG93cmVzVmVydGV4U2hhZGVyLCBsb3dyZXNGcmFnbWVudFNoYWRlciwgdW5pZm9ybXMpO1xyXG5cclxuXHRcdGxldCBzZXR0aW5nc1Byb21pc2UgPSBzZXR0aW5nc0ZpbGVQcm9taXNlXHJcblx0XHRcdC50aGVuKHdvcmxkU2V0dGluZ3MgPT4ge1xyXG5cdFx0XHRcdHRoaXMubmFtZSA9IHdvcmxkU2V0dGluZ3MubmFtZSA/IHdvcmxkU2V0dGluZ3MubmFtZSA6IHRoaXMubmFtZTtcclxuXHRcdFx0XHR0aGlzLndvcmxkID0gd29ybGRTZXR0aW5ncy53b3JsZCA/IHdvcmxkU2V0dGluZ3Mud29ybGQgOiB0aGlzLndvcmxkO1xyXG5cclxuXHRcdFx0XHR0aGlzLnN0YXJ0UG9zID0gey4uLnRoaXMuc3RhcnRQb3MsIC4uLndvcmxkU2V0dGluZ3Muc3RhcnRQb3N9O1xyXG5cdFx0XHRcdHRoaXMuc2t5Q29sb3IgPSB7Li4udGhpcy5za3lDb2xvciwgLi4ud29ybGRTZXR0aW5ncy5za3lDb2xvcn07XHJcblx0XHRcdFx0dGhpcy5hbWJpZW50TGlnaHQgPSB3b3JsZFNldHRpbmdzLmFtYmllbnRMaWdodCA/IHdvcmxkU2V0dGluZ3MuYW1iaWVudExpZ2h0IDogMDtcclxuXHJcblx0XHRcdFx0aWYgKHdvcmxkU2V0dGluZ3MuaGlyZXMgPT09IHVuZGVmaW5lZCkgd29ybGRTZXR0aW5ncy5oaXJlcyA9IHt9O1xyXG5cdFx0XHRcdGlmICh3b3JsZFNldHRpbmdzLmxvd3JlcyA9PT0gdW5kZWZpbmVkKSB3b3JsZFNldHRpbmdzLmxvd3JlcyA9IHt9O1xyXG5cclxuXHRcdFx0XHR0aGlzLmhpcmVzID0ge1xyXG5cdFx0XHRcdFx0dGlsZVNpemU6IHsuLi50aGlzLmhpcmVzLnRpbGVTaXplLCAuLi53b3JsZFNldHRpbmdzLmhpcmVzLnRpbGVTaXplfSxcclxuXHRcdFx0XHRcdHNjYWxlOiB7Li4udGhpcy5oaXJlcy5zY2FsZSwgLi4ud29ybGRTZXR0aW5ncy5oaXJlcy5zY2FsZX0sXHJcblx0XHRcdFx0XHR0cmFuc2xhdGU6IHsuLi50aGlzLmhpcmVzLnRyYW5zbGF0ZSwgLi4ud29ybGRTZXR0aW5ncy5oaXJlcy50cmFuc2xhdGV9XHJcblx0XHRcdFx0fTtcclxuXHRcdFx0XHR0aGlzLmxvd3JlcyA9IHtcclxuXHRcdFx0XHRcdHRpbGVTaXplOiB7Li4udGhpcy5sb3dyZXMudGlsZVNpemUsIC4uLndvcmxkU2V0dGluZ3MubG93cmVzLnRpbGVTaXplfSxcclxuXHRcdFx0XHRcdHNjYWxlOiB7Li4udGhpcy5sb3dyZXMuc2NhbGUsIC4uLndvcmxkU2V0dGluZ3MubG93cmVzLnNjYWxlfSxcclxuXHRcdFx0XHRcdHRyYW5zbGF0ZTogey4uLnRoaXMubG93cmVzLnRyYW5zbGF0ZSwgLi4ud29ybGRTZXR0aW5ncy5sb3dyZXMudHJhbnNsYXRlfVxyXG5cdFx0XHRcdH07XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdGxldCBtYXBQcm9taXNlID0gUHJvbWlzZS5hbGwoW3NldHRpbmdzUHJvbWlzZSwgdGV4dHVyZUZpbGVQcm9taXNlXSlcclxuICAgICAgICAgICAgLnRoZW4odmFsdWVzID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCB0ZXh0dXJlcyA9IHZhbHVlc1sxXTtcclxuICAgICAgICAgICAgICAgIGlmICh0ZXh0dXJlcyA9PT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIHBhcnNlIHRleHR1cmVzLmpzb24hXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaGlyZXNNYXRlcmlhbCA9IHRoaXMuY3JlYXRlSGlyZXNNYXRlcmlhbChoaXJlc1ZlcnRleFNoYWRlciwgaGlyZXNGcmFnbWVudFNoYWRlciwgdW5pZm9ybXMsIHRleHR1cmVzKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpcmVzVGlsZU1hbmFnZXIgPSBuZXcgVGlsZU1hbmFnZXIodGhpcy5zY2VuZSwgbmV3IFRpbGVMb2FkZXIoYCR7dGhpcy5kYXRhVXJsfWhpcmVzL2AsIHRoaXMuaGlyZXNNYXRlcmlhbCwgdGhpcy5oaXJlcywgMSksIHRoaXMub25UaWxlTG9hZChcImhpcmVzXCIpLCB0aGlzLm9uVGlsZVVubG9hZChcImhpcmVzXCIpLCB0aGlzLmV2ZW50cyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvd3Jlc1RpbGVNYW5hZ2VyID0gbmV3IFRpbGVNYW5hZ2VyKHRoaXMuc2NlbmUsIG5ldyBUaWxlTG9hZGVyKGAke3RoaXMuZGF0YVVybH1sb3dyZXMvYCwgdGhpcy5sb3dyZXNNYXRlcmlhbCwgdGhpcy5sb3dyZXMsIDIpLCB0aGlzLm9uVGlsZUxvYWQoXCJsb3dyZXNcIiksIHRoaXMub25UaWxlVW5sb2FkKFwibG93cmVzXCIpLCB0aGlzLmV2ZW50cyk7XHJcblxyXG4gICAgICAgICAgICAgICAgYWxlcnQodGhpcy5ldmVudHMsIGBNYXAgJyR7dGhpcy5pZH0nIGlzIGxvYWRlZC5gLCBcImZpbmVcIik7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuXHRcdHJldHVybiBQcm9taXNlLmFsbChbbWFwUHJvbWlzZSwgbWFya2VyVXBkYXRlUHJvbWlzZV0pO1xyXG5cdH1cclxuXHJcblx0b25UaWxlTG9hZCA9IGxheWVyID0+IHRpbGUgPT4ge1xyXG5cdFx0ZGlzcGF0Y2hFdmVudCh0aGlzLmV2ZW50cywgXCJibHVlbWFwTWFwVGlsZUxvYWRlZFwiLCB7XHJcblx0XHRcdHRpbGU6IHRpbGUsXHJcblx0XHRcdGxheWVyOiBsYXllclxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRvblRpbGVVbmxvYWQgPSBsYXllciA9PiB0aWxlID0+IHtcclxuXHRcdGRpc3BhdGNoRXZlbnQodGhpcy5ldmVudHMsIFwiYmx1ZW1hcE1hcFRpbGVVbmxvYWRlZFwiLCB7XHJcblx0XHRcdHRpbGU6IHRpbGUsXHJcblx0XHRcdGxheWVyOiBsYXllclxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRsb2FkTWFwQXJlYSh4LCB6LCBoaXJlc1ZpZXdEaXN0YW5jZSwgbG93cmVzVmlld0Rpc3RhbmNlKSB7XHJcblx0XHRpZiAoIXRoaXMuaXNMb2FkZWQpIHJldHVybjtcclxuXHJcblx0XHRsZXQgaGlyZXNYID0gTWF0aC5mbG9vcigoeCAtIHRoaXMuaGlyZXMudHJhbnNsYXRlLngpIC8gdGhpcy5oaXJlcy50aWxlU2l6ZS54KTtcclxuXHRcdGxldCBoaXJlc1ogPSBNYXRoLmZsb29yKCh6IC0gdGhpcy5oaXJlcy50cmFuc2xhdGUueikgLyB0aGlzLmhpcmVzLnRpbGVTaXplLnopO1xyXG5cdFx0bGV0IGhpcmVzVmlld1ggPSBNYXRoLmZsb29yKGhpcmVzVmlld0Rpc3RhbmNlIC8gdGhpcy5oaXJlcy50aWxlU2l6ZS54KTtcclxuXHRcdGxldCBoaXJlc1ZpZXdaID0gTWF0aC5mbG9vcihoaXJlc1ZpZXdEaXN0YW5jZSAvIHRoaXMuaGlyZXMudGlsZVNpemUueik7XHJcblxyXG5cdFx0bGV0IGxvd3Jlc1ggPSBNYXRoLmZsb29yKCh4IC0gdGhpcy5sb3dyZXMudHJhbnNsYXRlLngpIC8gdGhpcy5sb3dyZXMudGlsZVNpemUueCk7XHJcblx0XHRsZXQgbG93cmVzWiA9IE1hdGguZmxvb3IoKHogLSB0aGlzLmxvd3Jlcy50cmFuc2xhdGUueikgLyB0aGlzLmxvd3Jlcy50aWxlU2l6ZS56KTtcclxuXHRcdGxldCBsb3dyZXNWaWV3WCA9IE1hdGguZmxvb3IobG93cmVzVmlld0Rpc3RhbmNlIC8gdGhpcy5sb3dyZXMudGlsZVNpemUueCk7XHJcblx0XHRsZXQgbG93cmVzVmlld1ogPSBNYXRoLmZsb29yKGxvd3Jlc1ZpZXdEaXN0YW5jZSAvIHRoaXMubG93cmVzLnRpbGVTaXplLnopO1xyXG5cclxuXHRcdHRoaXMuaGlyZXNUaWxlTWFuYWdlci5sb2FkQXJvdW5kVGlsZShoaXJlc1gsIGhpcmVzWiwgaGlyZXNWaWV3WCwgaGlyZXNWaWV3Wik7XHJcblx0XHR0aGlzLmxvd3Jlc1RpbGVNYW5hZ2VyLmxvYWRBcm91bmRUaWxlKGxvd3Jlc1gsIGxvd3Jlc1osIGxvd3Jlc1ZpZXdYLCBsb3dyZXNWaWV3Wik7XHJcblx0fVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTG9hZHMgdGhlIHNldHRpbmdzLmpzb24gZmlsZSBmb3IgdGhpcyBtYXBcclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPE9iamVjdD59XHJcbiAgICAgKi9cclxuICAgIGxvYWRTZXR0aW5nc0ZpbGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgYWxlcnQodGhpcy5ldmVudHMsIGBMb2FkaW5nIHNldHRpbmdzIGZvciBtYXAgJyR7dGhpcy5pZH0nLi4uYCwgXCJmaW5lXCIpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGxvYWRlciA9IG5ldyBGaWxlTG9hZGVyKCk7XHJcbiAgICAgICAgICAgIGxvYWRlci5zZXRSZXNwb25zZVR5cGUoXCJqc29uXCIpO1xyXG4gICAgICAgICAgICBsb2FkZXIubG9hZCh0aGlzLmRhdGFVcmwgKyBcIi4uL3NldHRpbmdzLmpzb25cIixcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3MubWFwcyAmJiBzZXR0aW5ncy5tYXBzW3RoaXMuaWRdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc2V0dGluZ3MubWFwc1t0aGlzLmlkXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGB0aGUgc2V0dGluZ3MuanNvbiBkb2VzIG5vdCBjb250YWluIGluZm9ybWF0aW9ucyBmb3IgbWFwOiAke3RoaXMuaWR9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICgpID0+IHt9LFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gcmVqZWN0KGBGYWlsZWQgdG8gbG9hZCB0aGUgc2V0dGluZ3MuanNvbiBmb3IgbWFwOiAke3RoaXMuaWR9YClcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuXHQvKipcclxuXHQgKiBMb2FkcyB0aGUgdGV4dHVyZXMuanNvbiBmaWxlIGZvciB0aGlzIG1hcFxyXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlPE9iamVjdD59XHJcblx0ICovXHJcblx0bG9hZFRleHR1cmVzRmlsZSgpIHtcclxuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcblx0XHRcdGFsZXJ0KHRoaXMuZXZlbnRzLCBgTG9hZGluZyB0ZXh0dXJlcyBmb3IgbWFwICcke3RoaXMuaWR9Jy4uLmAsIFwiZmluZVwiKTtcclxuXHJcblx0XHRcdGxldCBsb2FkZXIgPSBuZXcgRmlsZUxvYWRlcigpO1xyXG5cdFx0XHRsb2FkZXIuc2V0UmVzcG9uc2VUeXBlKFwianNvblwiKTtcclxuXHRcdFx0bG9hZGVyLmxvYWQodGhpcy5kYXRhVXJsICsgXCIuLi90ZXh0dXJlcy5qc29uXCIsXHJcblx0XHRcdFx0cmVzb2x2ZSxcclxuXHRcdFx0XHQoKSA9PiB7fSxcclxuXHRcdFx0XHQoKSA9PiByZWplY3QoYEZhaWxlZCB0byBsb2FkIHRoZSB0ZXh0dXJlcy5qc29uIGZvciBtYXA6ICR7dGhpcy5pZH1gKVxyXG5cdFx0XHQpXHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBoaXJlcyBNYXRlcmlhbCB3aXRoIHRoZSBnaXZlbiB0ZXh0dXJlc1xyXG5cdCAqIEBwYXJhbSB2ZXJ0ZXhTaGFkZXJcclxuXHQgKiBAcGFyYW0gZnJhZ21lbnRTaGFkZXJcclxuXHQgKiBAcGFyYW0gdW5pZm9ybXNcclxuXHQgKiBAcGFyYW0gdGV4dHVyZXMgdGhlIHRleHR1cmVzXHJcblx0ICogQHJldHVybnMge1NoYWRlck1hdGVyaWFsW119IHRoZSBoaXJlcyBNYXRlcmlhbCAoYXJyYXkgYmVjYXVzZSBpdHMgYSBtdWx0aS1tYXRlcmlhbClcclxuXHQgKi9cclxuXHRjcmVhdGVIaXJlc01hdGVyaWFsKHZlcnRleFNoYWRlciwgZnJhZ21lbnRTaGFkZXIsIHVuaWZvcm1zLCB0ZXh0dXJlcykge1xyXG5cdFx0bGV0IG1hdGVyaWFscyA9IFtdO1xyXG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KHRleHR1cmVzLnRleHR1cmVzKSkgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCB0ZXh0dXJlLmpzb246ICd0ZXh0dXJlcycgaXMgbm90IGFuIGFycmF5IVwiKVxyXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0ZXh0dXJlcy50ZXh0dXJlcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRsZXQgdGV4dHVyZVNldHRpbmdzID0gdGV4dHVyZXMudGV4dHVyZXNbaV07XHJcblxyXG5cdFx0XHRsZXQgY29sb3IgPSB0ZXh0dXJlU2V0dGluZ3MuY29sb3I7XHJcblx0XHRcdGlmICghQXJyYXkuaXNBcnJheShjb2xvcikgfHwgY29sb3IubGVuZ3RoIDwgNCl7XHJcblx0XHRcdFx0Y29sb3IgPSBbMCwgMCwgMCwgMF07XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGxldCBvcGFxdWUgPSBjb2xvclszXSA9PT0gMTtcclxuXHRcdFx0bGV0IHRyYW5zcGFyZW50ID0gISF0ZXh0dXJlU2V0dGluZ3MudHJhbnNwYXJlbnQ7XHJcblxyXG5cdFx0XHRsZXQgdGV4dHVyZSA9IG5ldyBUZXh0dXJlKCk7XHJcblx0XHRcdHRleHR1cmUuaW1hZ2UgPSBzdHJpbmdUb0ltYWdlKHRleHR1cmVTZXR0aW5ncy50ZXh0dXJlKTtcclxuXHJcblx0XHRcdHRleHR1cmUuYW5pc290cm9weSA9IDE7XHJcblx0XHRcdHRleHR1cmUuZ2VuZXJhdGVNaXBtYXBzID0gb3BhcXVlIHx8IHRyYW5zcGFyZW50O1xyXG5cdFx0XHR0ZXh0dXJlLm1hZ0ZpbHRlciA9IE5lYXJlc3RGaWx0ZXI7XHJcblx0XHRcdHRleHR1cmUubWluRmlsdGVyID0gdGV4dHVyZS5nZW5lcmF0ZU1pcG1hcHMgPyBOZWFyZXN0TWlwTWFwTGluZWFyRmlsdGVyIDogTmVhcmVzdEZpbHRlcjtcclxuXHRcdFx0dGV4dHVyZS53cmFwUyA9IENsYW1wVG9FZGdlV3JhcHBpbmc7XHJcblx0XHRcdHRleHR1cmUud3JhcFQgPSBDbGFtcFRvRWRnZVdyYXBwaW5nO1xyXG5cdFx0XHR0ZXh0dXJlLmZsaXBZID0gZmFsc2U7XHJcblx0XHRcdHRleHR1cmUuZmxhdFNoYWRpbmcgPSB0cnVlO1xyXG5cdFx0XHR0ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuXHJcblx0XHRcdHRoaXMubG9hZGVkVGV4dHVyZXMucHVzaCh0ZXh0dXJlKTtcclxuXHJcblx0XHRcdGxldCBtYXRlcmlhbCA9IG5ldyBTaGFkZXJNYXRlcmlhbCh7XHJcblx0XHRcdFx0dW5pZm9ybXM6IHtcclxuXHRcdFx0XHRcdC4uLnVuaWZvcm1zLFxyXG5cdFx0XHRcdFx0dGV4dHVyZUltYWdlOiB7XHJcblx0XHRcdFx0XHRcdHR5cGU6ICd0JyxcclxuXHRcdFx0XHRcdFx0dmFsdWU6IHRleHR1cmVcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHZlcnRleFNoYWRlcjogdmVydGV4U2hhZGVyLFxyXG5cdFx0XHRcdGZyYWdtZW50U2hhZGVyOiBmcmFnbWVudFNoYWRlcixcclxuXHRcdFx0XHR0cmFuc3BhcmVudDogdHJhbnNwYXJlbnQsXHJcblx0XHRcdFx0ZGVwdGhXcml0ZTogdHJ1ZSxcclxuXHRcdFx0XHRkZXB0aFRlc3Q6IHRydWUsXHJcblx0XHRcdFx0dmVydGV4Q29sb3JzOiBWZXJ0ZXhDb2xvcnMsXHJcblx0XHRcdFx0c2lkZTogRnJvbnRTaWRlLFxyXG5cdFx0XHRcdHdpcmVmcmFtZTogZmFsc2UsXHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0bWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG5cdFx0XHRtYXRlcmlhbHNbaV0gPSBtYXRlcmlhbDtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gbWF0ZXJpYWxzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIGxvd3JlcyBNYXRlcmlhbFxyXG5cdCAqIEByZXR1cm5zIHtTaGFkZXJNYXRlcmlhbH0gdGhlIGhpcmVzIE1hdGVyaWFsXHJcblx0ICovXHJcblx0Y3JlYXRlTG93cmVzTWF0ZXJpYWwodmVydGV4U2hhZGVyLCBmcmFnbWVudFNoYWRlciwgdW5pZm9ybXMpIHtcclxuXHRcdHJldHVybiBuZXcgU2hhZGVyTWF0ZXJpYWwoe1xyXG5cdFx0XHR1bmlmb3JtczogdW5pZm9ybXMsXHJcblx0XHRcdHZlcnRleFNoYWRlcjogdmVydGV4U2hhZGVyLFxyXG5cdFx0XHRmcmFnbWVudFNoYWRlcjogZnJhZ21lbnRTaGFkZXIsXHJcblx0XHRcdHRyYW5zcGFyZW50OiBmYWxzZSxcclxuXHRcdFx0ZGVwdGhXcml0ZTogdHJ1ZSxcclxuXHRcdFx0ZGVwdGhUZXN0OiB0cnVlLFxyXG5cdFx0XHR2ZXJ0ZXhDb2xvcnM6IFZlcnRleENvbG9ycyxcclxuXHRcdFx0c2lkZTogRnJvbnRTaWRlLFxyXG5cdFx0XHR3aXJlZnJhbWU6IGZhbHNlXHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHVubG9hZCgpIHtcclxuXHRcdGlmICh0aGlzLmhpcmVzVGlsZU1hbmFnZXIpIHRoaXMuaGlyZXNUaWxlTWFuYWdlci51bmxvYWQoKTtcclxuXHRcdHRoaXMuaGlyZXNUaWxlTWFuYWdlciA9IG51bGw7XHJcblxyXG5cdFx0aWYgKHRoaXMubG93cmVzVGlsZU1hbmFnZXIpIHRoaXMubG93cmVzVGlsZU1hbmFnZXIudW5sb2FkKCk7XHJcblx0XHR0aGlzLmxvd3Jlc1RpbGVNYW5hZ2VyID0gbnVsbDtcclxuXHJcblx0XHRpZiAodGhpcy5oaXJlc01hdGVyaWFsKSB0aGlzLmhpcmVzTWF0ZXJpYWwuZm9yRWFjaChtYXRlcmlhbCA9PiBtYXRlcmlhbC5kaXNwb3NlKCkpO1xyXG5cdFx0dGhpcy5oaXJlc01hdGVyaWFsID0gbnVsbDtcclxuXHJcblx0XHRpZiAodGhpcy5sb3dyZXNNYXRlcmlhbCkgdGhpcy5sb3dyZXNNYXRlcmlhbC5kaXNwb3NlKCk7XHJcblx0XHR0aGlzLmxvd3Jlc01hdGVyaWFsID0gbnVsbDtcclxuXHJcblx0XHR0aGlzLmxvYWRlZFRleHR1cmVzLmZvckVhY2godGV4dHVyZSA9PiB0ZXh0dXJlLmRpc3Bvc2UoKSk7XHJcblx0XHR0aGlzLmxvYWRlZFRleHR1cmVzID0gW107XHJcblxyXG5cdFx0dGhpcy5tYXJrZXJNYW5hZ2VyLmRpc3Bvc2UoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJheS10cmFjZXMgYW5kIHJldHVybnMgdGhlIHRlcnJhaW4taGVpZ2h0IGF0IGEgc3BlY2lmaWMgbG9jYXRpb24sIHJldHVybnMgPGNvZGU+ZmFsc2U8L2NvZGU+IGlmIHRoZXJlIGlzIG5vIG1hcC10aWxlIGxvYWRlZCBhdCB0aGF0IGxvY2F0aW9uXHJcblx0ICogQHBhcmFtIHhcclxuXHQgKiBAcGFyYW0gelxyXG5cdCAqIEByZXR1cm5zIHtib29sZWFufG51bWJlcn1cclxuXHQgKi9cclxuXHR0ZXJyYWluSGVpZ2h0QXQoeCwgeikge1xyXG5cdFx0aWYgKCF0aGlzLmlzTG9hZGVkKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdFx0dGhpcy5yYXljYXN0ZXIuc2V0KFxyXG5cdFx0XHRuZXcgVmVjdG9yMyh4LCAzMDAsIHopLCAvLyByYXktc3RhcnRcclxuXHRcdFx0bmV3IFZlY3RvcjMoMCwgLTEsIDApIC8vIHJheS1kaXJlY3Rpb25cclxuXHRcdCk7XHJcblx0XHR0aGlzLnJheWNhc3Rlci5uZWFyID0gMTtcclxuXHRcdHRoaXMucmF5Y2FzdGVyLmZhciA9IDMwMDtcclxuXHRcdHRoaXMucmF5Y2FzdGVyLmxheWVycy5lbmFibGVBbGwoKTtcclxuXHJcblx0XHRsZXQgaGlyZXNUaWxlSGFzaCA9IGhhc2hUaWxlKE1hdGguZmxvb3IoKHggLSB0aGlzLmhpcmVzLnRyYW5zbGF0ZS54KSAvIHRoaXMuaGlyZXMudGlsZVNpemUueCksIE1hdGguZmxvb3IoKHogLSB0aGlzLmhpcmVzLnRyYW5zbGF0ZS56KSAvIHRoaXMuaGlyZXMudGlsZVNpemUueikpO1xyXG5cdFx0bGV0IHRpbGUgPSB0aGlzLmhpcmVzVGlsZU1hbmFnZXIudGlsZXNbaGlyZXNUaWxlSGFzaF07XHJcblx0XHRpZiAoIXRpbGUgfHwgIXRpbGUubW9kZWwpIHtcclxuXHRcdFx0bGV0IGxvd3Jlc1RpbGVIYXNoID0gaGFzaFRpbGUoTWF0aC5mbG9vcigoeCAtIHRoaXMubG93cmVzLnRyYW5zbGF0ZS54KSAvIHRoaXMubG93cmVzLnRpbGVTaXplLngpLCBNYXRoLmZsb29yKCh6IC0gdGhpcy5sb3dyZXMudHJhbnNsYXRlLnopIC8gdGhpcy5sb3dyZXMudGlsZVNpemUueikpO1xyXG5cdFx0XHR0aWxlID0gdGhpcy5sb3dyZXNUaWxlTWFuYWdlci50aWxlc1tsb3dyZXNUaWxlSGFzaF07XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCF0aWxlIHx8ICF0aWxlLm1vZGVsKXtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRyeSB7XHJcblx0XHRcdGxldCBpbnRlcnNlY3RzID0gdGhpcy5yYXljYXN0ZXIuaW50ZXJzZWN0T2JqZWN0cyhbdGlsZS5tb2RlbF0pO1xyXG5cdFx0XHRpZiAoaW50ZXJzZWN0cy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0cmV0dXJuIGludGVyc2VjdHNbMF0ucG9pbnQueTtcclxuXHRcdFx0fVxyXG5cdFx0fSBjYXRjaCAoZXJyKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGRpc3Bvc2UoKSB7XHJcblx0XHR0aGlzLnVubG9hZCgpO1xyXG5cdH1cclxuXHJcblx0Z2V0IGlzTG9hZGVkKCkge1xyXG5cdFx0cmV0dXJuICEhKHRoaXMuaGlyZXNNYXRlcmlhbCAmJiB0aGlzLmxvd3Jlc01hdGVyaWFsKTtcclxuXHR9XHJcblxyXG59XHJcbiIsImV4cG9ydCBjb25zdCBTS1lfRlJBR01FTlRfU0hBREVSID0gYFxyXG51bmlmb3JtIGZsb2F0IHN1bmxpZ2h0O1xyXG51bmlmb3JtIGZsb2F0IGFtYmllbnRMaWdodDtcclxudW5pZm9ybSB2ZWMzIHNreUNvbG9yO1xyXG5cclxudmFyeWluZyB2ZWMzIHZQb3NpdGlvbjtcclxuXHJcbnZvaWQgbWFpbigpIHtcclxuXHRmbG9hdCBob3Jpem9uV2lkdGggPSAwLjAwNTtcclxuXHRmbG9hdCBob3Jpem9uSGVpZ2h0ID0gMC4wO1xyXG5cdFxyXG5cdHZlYzQgY29sb3IgPSB2ZWM0KHNreUNvbG9yICogbWF4KHN1bmxpZ2h0LCBhbWJpZW50TGlnaHQpLCAxLjApO1xyXG5cdGZsb2F0IHZvaWRNdWx0aXBsaWVyID0gKGNsYW1wKHZQb3NpdGlvbi55IC0gaG9yaXpvbkhlaWdodCwgLWhvcml6b25XaWR0aCwgaG9yaXpvbldpZHRoKSArIGhvcml6b25XaWR0aCkgLyAoaG9yaXpvbldpZHRoICogMi4wKTtcclxuXHRjb2xvci5yZ2IgKj0gdm9pZE11bHRpcGxpZXI7XHJcblxyXG5cdGdsX0ZyYWdDb2xvciA9IGNvbG9yO1xyXG59XHJcbmA7XHJcbiIsImV4cG9ydCBjb25zdCBTS1lfVkVSVEVYX1NIQURFUiA9IGBcclxudmFyeWluZyB2ZWMzIHZQb3NpdGlvbjtcclxudm9pZCBtYWluKCkge1xyXG5cdHZQb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdFxyXG5cdGdsX1Bvc2l0aW9uID0gXHJcblx0XHRwcm9qZWN0aW9uTWF0cml4ICpcclxuXHRcdG1vZGVsVmlld01hdHJpeCAqXHJcblx0XHR2ZWM0KHBvc2l0aW9uLCAxKTtcclxufVxyXG5gO1xyXG4iLCJpbXBvcnQge1xyXG5cdFNjZW5lLFxyXG5cdFZlY3RvcjMsXHJcblx0TWVzaCxcclxuXHRTcGhlcmVHZW9tZXRyeSxcclxuXHRTaGFkZXJNYXRlcmlhbCxcclxuXHRCYWNrU2lkZVxyXG59IGZyb20gJ3RocmVlJztcclxuXHJcbmltcG9ydCB7IFNLWV9GUkFHTUVOVF9TSEFERVIgfSBmcm9tICcuL1NreUZyYWdtZW50U2hhZGVyJztcclxuaW1wb3J0IHsgU0tZX1ZFUlRFWF9TSEFERVIgfSBmcm9tICcuL1NreVZlcnRleFNoYWRlcic7XHJcblxyXG5leHBvcnQgY2xhc3MgU2t5Ym94U2NlbmUgZXh0ZW5kcyBTY2VuZSB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0c3VwZXIoKTtcclxuXHJcblx0XHR0aGlzLmF1dG9VcGRhdGUgPSBmYWxzZTtcclxuXHJcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoIHRoaXMsICdpc1NreWJveFNjZW5lJywgeyB2YWx1ZTogdHJ1ZSB9ICk7XHJcblxyXG5cdFx0dGhpcy5VTklGT1JNX3N1bmxpZ2h0ID0ge1xyXG5cdFx0XHR2YWx1ZTogMVxyXG5cdFx0fTtcclxuXHJcblx0XHR0aGlzLlVOSUZPUk1fc2t5Q29sb3IgPSB7XHJcblx0XHRcdHZhbHVlOiBuZXcgVmVjdG9yMygwLjUsIDAuNSwgMSlcclxuXHRcdH07XHJcblxyXG5cdFx0dGhpcy5VTklGT1JNX2FtYmllbnRMaWdodCA9IHtcclxuXHRcdFx0dmFsdWU6IDBcclxuXHRcdH07XHJcblxyXG5cdFx0bGV0IGdlb21ldHJ5ID0gbmV3IFNwaGVyZUdlb21ldHJ5KDEsIDQwLCA1KTtcclxuXHRcdGxldCBtYXRlcmlhbCA9IG5ldyBTaGFkZXJNYXRlcmlhbCh7XHJcblx0XHRcdHVuaWZvcm1zOiB7XHJcblx0XHRcdFx0c3VubGlnaHQ6IHRoaXMuVU5JRk9STV9zdW5saWdodCxcclxuXHRcdFx0XHRza3lDb2xvcjogdGhpcy5VTklGT1JNX3NreUNvbG9yLFxyXG5cdFx0XHRcdGFtYmllbnRMaWdodDogdGhpcy5VTklGT1JNX2FtYmllbnRMaWdodCxcclxuXHRcdFx0fSxcclxuXHRcdFx0dmVydGV4U2hhZGVyOiBTS1lfVkVSVEVYX1NIQURFUixcclxuXHRcdFx0ZnJhZ21lbnRTaGFkZXI6IFNLWV9GUkFHTUVOVF9TSEFERVIsXHJcblx0XHRcdHNpZGU6IEJhY2tTaWRlXHJcblx0XHR9KTtcclxuXHRcdGxldCBza3lib3ggPSBuZXcgTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG5cclxuXHRcdHRoaXMuYWRkKHNreWJveCk7XHJcblx0fVxyXG5cclxuXHRnZXQgc3VubGlnaHQoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5VTklGT1JNX3N1bmxpZ2h0LnZhbHVlO1xyXG5cdH1cclxuXHJcblx0c2V0IHN1bmxpZ2h0KHN0cmVuZ3RoKSB7XHJcblx0XHR0aGlzLlVOSUZPUk1fc3VubGlnaHQudmFsdWUgPSBzdHJlbmd0aDtcclxuXHR9XHJcblxyXG5cdGdldCBza3lDb2xvcigpIHtcclxuXHRcdHJldHVybiB0aGlzLlVOSUZPUk1fc2t5Q29sb3IudmFsdWU7XHJcblx0fVxyXG5cclxuXHRzZXQgc2t5Q29sb3IoY29sb3IpIHtcclxuXHRcdHRoaXMuVU5JRk9STV9za3lDb2xvci52YWx1ZSA9IGNvbG9yO1xyXG5cdH1cclxuXHJcblx0Z2V0IGFtYmllbnRMaWdodCgpIHtcclxuXHRcdHJldHVybiB0aGlzLlVOSUZPUk1fYW1iaWVudExpZ2h0LnZhbHVlO1xyXG5cdH1cclxuXHJcblx0c2V0IGFtYmllbnRMaWdodChzdHJlbmd0aCkge1xyXG5cdFx0dGhpcy5VTklGT1JNX2FtYmllbnRMaWdodC52YWx1ZSA9IHN0cmVuZ3RoO1xyXG5cdH1cclxuXHJcbn0iLCJpbXBvcnQge01hdGhVdGlscywgVmVjdG9yM30gZnJvbSBcInRocmVlXCI7XHJcbmltcG9ydCB7ZGlzcGF0Y2hFdmVudH0gZnJvbSBcIi4uL3V0aWwvVXRpbHNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBDb250cm9sc01hbmFnZXIge1xyXG5cclxuXHRjb25zdHJ1Y3RvcihtYXBWaWV3ZXIsIGNhbWVyYSkge1xyXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KCB0aGlzLCAnaXNDb250cm9sc01hbmFnZXInLCB7IHZhbHVlOiB0cnVlIH0gKTtcclxuXHJcblx0XHR0aGlzLm1hcFZpZXdlciA9IG1hcFZpZXdlcjtcclxuXHRcdHRoaXMuY2FtZXJhID0gY2FtZXJhO1xyXG5cclxuXHRcdHRoaXMucG9zaXRpb25WYWx1ZSA9IG5ldyBWZWN0b3IzKDAsIDAsIDApO1xyXG5cclxuXHRcdHRoaXMucm90YXRpb25WYWx1ZSA9IDA7XHJcblx0XHR0aGlzLmFuZ2xlVmFsdWUgPSAwO1xyXG5cclxuXHRcdHRoaXMuZGlzdGFuY2VWYWx1ZSA9IDUwMDtcclxuXHJcblx0XHR0aGlzLm9ydGhvVmFsdWUgPSAwO1xyXG5cclxuXHRcdHRoaXMudmFsdWVDaGFuZ2VkID0gdHJ1ZTtcclxuXHRcdHRoaXMubGFzdE1hcFVwZGF0ZVBvc2l0aW9uID0gdGhpcy5wb3NpdGlvblZhbHVlLmNsb25lKCk7XHJcblxyXG5cdFx0dGhpcy5jb250cm9sc1ZhbHVlID0gbnVsbDtcclxuXHJcblx0XHR0aGlzLnVwZGF0ZUNhbWVyYSgpO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlKGRlbHRhVGltZSwgbWFwKSB7XHJcblx0XHRpZiAoZGVsdGFUaW1lID4gNTApIGRlbHRhVGltZSA9IDUwOyAvLyBhc3N1bWUgbWluIDIwIFVQU1xyXG5cclxuXHRcdGlmICh0aGlzLmNvbnRyb2xzVmFsdWUgJiYgdHlwZW9mIHRoaXMuY29udHJvbHNWYWx1ZS51cGRhdGUgPT09IFwiZnVuY3Rpb25cIilcclxuXHRcdFx0dGhpcy5jb250cm9sc1ZhbHVlLnVwZGF0ZShkZWx0YVRpbWUsIG1hcCk7XHJcblx0fVxyXG5cclxuXHR1cGRhdGVDYW1lcmEoKSB7XHJcblx0XHRpZiAodGhpcy52YWx1ZUNoYW5nZWQpIHtcclxuXHRcdFx0Ly8gcHJldmVudCBwcm9ibGVtcyB3aXRoIHRoZSByb3RhdGlvbiB3aGVuIHRoZSBhbmdsZSBpcyAwICh0b3AtZG93bikgb3IgZGlzdGFuY2UgaXMgMCAoZmlyc3QtcGVyc29uKVxyXG5cdFx0XHRsZXQgcm90YXRhYmxlQW5nbGUgPSB0aGlzLmFuZ2xlVmFsdWU7XHJcblx0XHRcdGlmIChNYXRoLmFicyhyb3RhdGFibGVBbmdsZSkgPD0gMC4wMDAxKSByb3RhdGFibGVBbmdsZSA9IDAuMDAwMTtcclxuXHRcdFx0bGV0IHJvdGF0YWJsZURpc3RhbmNlID0gdGhpcy5kaXN0YW5jZVZhbHVlO1xyXG5cdFx0XHRpZiAoTWF0aC5hYnMocm90YXRhYmxlRGlzdGFuY2UpIDw9IDAuMDAwMSkgcm90YXRhYmxlRGlzdGFuY2UgPSAtMC4wMDAxO1xyXG5cclxuXHRcdFx0Ly8gZml4IGRpc3RhbmNlIGZvciBvcnRoby1lZmZlY3RcclxuXHRcdFx0aWYgKHRoaXMub3J0aG9WYWx1ZSA+IDApIHtcclxuXHRcdFx0XHRyb3RhdGFibGVEaXN0YW5jZSA9IE1hdGhVdGlscy5sZXJwKHJvdGF0YWJsZURpc3RhbmNlLCBNYXRoLm1heChyb3RhdGFibGVEaXN0YW5jZSwgMzAwKSwgTWF0aC5wb3codGhpcy5vcnRob1ZhbHVlLCA4KSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIGNhbGN1bGF0ZSByb3RhdGlvblZlY3RvclxyXG5cdFx0XHRsZXQgcm90YXRpb25WZWN0b3IgPSBuZXcgVmVjdG9yMyhNYXRoLnNpbih0aGlzLnJvdGF0aW9uVmFsdWUpLCAwLCAtTWF0aC5jb3ModGhpcy5yb3RhdGlvblZhbHVlKSk7IC8vIDAgaXMgdG93YXJkcyBub3J0aFxyXG5cdFx0XHRsZXQgYW5nbGVSb3RhdGlvbkF4aXMgPSBuZXcgVmVjdG9yMygwLCAxLCAwKS5jcm9zcyhyb3RhdGlvblZlY3Rvcik7XHJcblx0XHRcdHJvdGF0aW9uVmVjdG9yLmFwcGx5QXhpc0FuZ2xlKGFuZ2xlUm90YXRpb25BeGlzLCAoTWF0aC5QSSAvIDIpIC0gcm90YXRhYmxlQW5nbGUpO1xyXG5cdFx0XHRyb3RhdGlvblZlY3Rvci5tdWx0aXBseVNjYWxhcihyb3RhdGFibGVEaXN0YW5jZSk7XHJcblxyXG5cdFx0XHQvLyBwb3NpdGlvbiBjYW1lcmFcclxuXHRcdFx0dGhpcy5jYW1lcmEucG9zaXRpb24uY29weSh0aGlzLnBvc2l0aW9uVmFsdWUpLnN1Yihyb3RhdGlvblZlY3Rvcik7XHJcblx0XHRcdHRoaXMuY2FtZXJhLmxvb2tBdCh0aGlzLnBvc2l0aW9uVmFsdWUpO1xyXG5cclxuXHRcdFx0Ly8gdXBkYXRlIG9ydGhvXHJcblx0XHRcdHRoaXMuY2FtZXJhLmRpc3RhbmNlID0gdGhpcy5kaXN0YW5jZVZhbHVlO1xyXG5cdFx0XHR0aGlzLmNhbWVyYS5vcnRobyA9IHRoaXMub3J0aG9WYWx1ZTtcclxuXHJcblx0XHRcdC8vIG9wdGltaXplIGZhci9uZWFyIHBsYW5lc1xyXG5cdFx0XHRpZiAodGhpcy5vcnRob1ZhbHVlIDw9IDApIHtcclxuXHRcdFx0XHRsZXQgbmVhciA9IE1hdGhVdGlscy5jbGFtcCh0aGlzLmRpc3RhbmNlVmFsdWUgLyAxMDAwLCAwLjAxLCAxKTtcclxuXHRcdFx0XHRsZXQgZmFyID0gTWF0aFV0aWxzLmNsYW1wKHRoaXMuZGlzdGFuY2VWYWx1ZSAqIDIsIE1hdGgubWF4KG5lYXIgKyAxLCAyMDAwKSwgdGhpcy5kaXN0YW5jZVZhbHVlICsgNTAwMCk7XHJcblx0XHRcdFx0aWYgKGZhciAtIG5lYXIgPiAxMDAwMCkgbmVhciA9IGZhciAtIDEwMDAwO1xyXG5cdFx0XHRcdHRoaXMuY2FtZXJhLm5lYXIgPSBuZWFyO1xyXG5cdFx0XHRcdHRoaXMuY2FtZXJhLmZhciA9IGZhcjtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aGlzLmNhbWVyYS5uZWFyID0gMTtcclxuXHRcdFx0XHR0aGlzLmNhbWVyYS5mYXIgPSByb3RhdGFibGVEaXN0YW5jZSArIDMwMDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gZXZlbnRcclxuXHRcdFx0ZGlzcGF0Y2hFdmVudCh0aGlzLm1hcFZpZXdlci5ldmVudHMsIFwiYmx1ZW1hcENhbWVyYU1vdmVkXCIsIHtcclxuXHRcdFx0XHRjb250cm9sc01hbmFnZXI6IHRoaXMsXHJcblx0XHRcdFx0Y2FtZXJhOiB0aGlzLmNhbWVyYVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBpZiB0aGUgcG9zaXRpb24gY2hhbmdlZCwgdXBkYXRlIG1hcCB0byBzaG93IG5ldyBwb3NpdGlvblxyXG5cdFx0aWYgKHRoaXMubWFwVmlld2VyLm1hcCkge1xyXG5cdFx0XHRsZXQgdHJpZ2dlckRpc3RhbmNlID0gMTtcclxuXHRcdFx0aWYgKHRoaXMudmFsdWVDaGFuZ2VkKSB7XHJcblx0XHRcdFx0dHJpZ2dlckRpc3RhbmNlID0gdGhpcy5tYXBWaWV3ZXIubG9hZGVkSGlyZXNWaWV3RGlzdGFuY2UgKiAwLjg7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKFxyXG5cdFx0XHRcdE1hdGguYWJzKHRoaXMubGFzdE1hcFVwZGF0ZVBvc2l0aW9uLnggLSB0aGlzLnBvc2l0aW9uVmFsdWUueCkgPj0gdHJpZ2dlckRpc3RhbmNlIHx8XHJcblx0XHRcdFx0TWF0aC5hYnModGhpcy5sYXN0TWFwVXBkYXRlUG9zaXRpb24ueiAtIHRoaXMucG9zaXRpb25WYWx1ZS56KSA+PSB0cmlnZ2VyRGlzdGFuY2VcclxuXHRcdFx0KSB7XHJcblx0XHRcdFx0dGhpcy5sYXN0TWFwVXBkYXRlUG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uVmFsdWUuY2xvbmUoKTtcclxuXHRcdFx0XHR0aGlzLm1hcFZpZXdlci5sb2FkTWFwQXJlYSh0aGlzLnBvc2l0aW9uVmFsdWUueCwgdGhpcy5wb3NpdGlvblZhbHVlLnopO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy52YWx1ZUNoYW5nZWQgPSBmYWxzZTtcclxuXHR9XHJcblxyXG5cdGhhbmRsZVZhbHVlQ2hhbmdlKCkge1xyXG5cdFx0dGhpcy52YWx1ZUNoYW5nZWQgPSB0cnVlO1xyXG5cdH1cclxuXHJcblx0Z2V0IHgoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5wb3NpdGlvblZhbHVlLng7XHJcblx0fVxyXG5cclxuXHRzZXQgeCh4KSB7XHJcblx0XHR0aGlzLnBvc2l0aW9uVmFsdWUueCA9IHg7XHJcblx0XHR0aGlzLmhhbmRsZVZhbHVlQ2hhbmdlKCk7XHJcblx0fVxyXG5cclxuXHRnZXQgeSgpIHtcclxuXHRcdHJldHVybiB0aGlzLnBvc2l0aW9uVmFsdWUueTtcclxuXHR9XHJcblxyXG5cdHNldCB5KHkpIHtcclxuXHRcdHRoaXMucG9zaXRpb25WYWx1ZS55ID0geTtcclxuXHRcdHRoaXMuaGFuZGxlVmFsdWVDaGFuZ2UoKTtcclxuXHR9XHJcblxyXG5cdGdldCB6KCkge1xyXG5cdFx0cmV0dXJuIHRoaXMucG9zaXRpb25WYWx1ZS56O1xyXG5cdH1cclxuXHJcblx0c2V0IHooeikge1xyXG5cdFx0dGhpcy5wb3NpdGlvblZhbHVlLnogPSB6O1xyXG5cdFx0dGhpcy5oYW5kbGVWYWx1ZUNoYW5nZSgpO1xyXG5cdH1cclxuXHJcblx0Z2V0IHBvc2l0aW9uKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMucG9zaXRpb25WYWx1ZTtcclxuXHR9XHJcblxyXG5cdHNldCBwb3NpdGlvbihwb3NpdGlvbikge1xyXG5cdFx0dGhpcy5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKTtcclxuXHRcdHRoaXMuaGFuZGxlVmFsdWVDaGFuZ2UoKTtcclxuXHR9XHJcblxyXG5cdGdldCByb3RhdGlvbigpIHtcclxuXHRcdHJldHVybiB0aGlzLnJvdGF0aW9uVmFsdWU7XHJcblx0fVxyXG5cclxuXHRzZXQgcm90YXRpb24ocm90YXRpb24pIHtcclxuXHRcdHRoaXMucm90YXRpb25WYWx1ZSA9IHJvdGF0aW9uO1xyXG5cdFx0dGhpcy5oYW5kbGVWYWx1ZUNoYW5nZSgpO1xyXG5cdH1cclxuXHJcblx0Z2V0IGFuZ2xlKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuYW5nbGVWYWx1ZTtcclxuXHR9XHJcblxyXG5cdHNldCBhbmdsZShhbmdsZSkge1xyXG5cdFx0dGhpcy5hbmdsZVZhbHVlID0gYW5nbGU7XHJcblx0XHR0aGlzLmhhbmRsZVZhbHVlQ2hhbmdlKCk7XHJcblx0fVxyXG5cclxuXHRnZXQgZGlzdGFuY2UoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5kaXN0YW5jZVZhbHVlO1xyXG5cdH1cclxuXHJcblx0c2V0IGRpc3RhbmNlKGRpc3RhbmNlKSB7XHJcblx0XHR0aGlzLmRpc3RhbmNlVmFsdWUgPSBkaXN0YW5jZTtcclxuXHRcdHRoaXMuaGFuZGxlVmFsdWVDaGFuZ2UoKTtcclxuXHR9XHJcblxyXG5cdGdldCBvcnRobygpIHtcclxuXHRcdHJldHVybiB0aGlzLm9ydGhvVmFsdWU7XHJcblx0fVxyXG5cclxuXHRzZXQgb3J0aG8ob3J0aG8pIHtcclxuXHRcdHRoaXMub3J0aG9WYWx1ZSA9IG9ydGhvO1xyXG5cdFx0dGhpcy5oYW5kbGVWYWx1ZUNoYW5nZSgpO1xyXG5cdH1cclxuXHJcblx0c2V0IGNvbnRyb2xzKGNvbnRyb2xzKSB7XHJcblx0XHRpZiAodGhpcy5jb250cm9sc1ZhbHVlICYmIHR5cGVvZiB0aGlzLmNvbnRyb2xzVmFsdWUuc3RvcCA9PT0gXCJmdW5jdGlvblwiKVxyXG5cdFx0XHR0aGlzLmNvbnRyb2xzVmFsdWUuc3RvcCgpO1xyXG5cclxuXHRcdHRoaXMuY29udHJvbHNWYWx1ZSA9IGNvbnRyb2xzO1xyXG5cclxuXHRcdGlmICh0aGlzLmNvbnRyb2xzVmFsdWUgJiYgdHlwZW9mIHRoaXMuY29udHJvbHNWYWx1ZS5zdGFydCA9PT0gXCJmdW5jdGlvblwiKVxyXG5cdFx0XHR0aGlzLmNvbnRyb2xzVmFsdWUuc3RhcnQodGhpcyk7XHJcblx0fVxyXG5cclxuXHRnZXQgY29udHJvbHMoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5jb250cm9sc1ZhbHVlO1xyXG5cdH1cclxuXHJcbn0iLCJpbXBvcnQge01hdGhVdGlscywgTU9VU0UsIFZlY3RvcjIsIFZlY3RvcjN9IGZyb20gXCJ0aHJlZVwiO1xyXG5pbXBvcnQge2FsZXJ0fSBmcm9tIFwiLi4vdXRpbC9VdGlsc1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIE1hcENvbnRyb2xzIHtcclxuXHJcbiAgICBzdGF0aWMgU1RBVEVTID0ge1xyXG4gICAgICAgIE5PTkU6IDAsXHJcbiAgICAgICAgTU9WRTogMSxcclxuICAgICAgICBPUkJJVDogMlxyXG4gICAgfTtcclxuXHJcbiAgICBzdGF0aWMgS0VZUyA9IHtcclxuICAgICAgICBMRUZUOiBbXCJBcnJvd0xlZnRcIiwgXCJhXCIsIFwiQVwiLCAzNywgNjVdLFxyXG4gICAgICAgIFVQOiBbXCJBcnJvd1VwXCIsIFwid1wiLCBcIldcIiwgMzgsIDg3XSxcclxuICAgICAgICBSSUdIVDogW1wiQXJyb3dSaWdodFwiLCBcImRcIiwgXCJEXCIsIDM5LCA2OF0sXHJcbiAgICAgICAgRE9XTjogW1wiQXJyb3dEb3duXCIsIFwic1wiLCBcIlNcIiwgNDAsIDgzXSxcclxuICAgICAgICBaT09NX0lOOiBbXCIrXCJdLFxyXG4gICAgICAgIFpPT01fT1VUOiBbXCItXCJdXHJcbiAgICB9O1xyXG5cclxuICAgIHN0YXRpYyBCVVRUT05TID0ge1xyXG4gICAgICAgIE9SQklUOiBbTU9VU0UuUklHSFRdLFxyXG4gICAgICAgIE1PVkU6IFtNT1VTRS5MRUZUXVxyXG4gICAgfTtcclxuXHJcbiAgICBzdGF0aWMgVkVDVE9SMl9aRVJPID0gbmV3IFZlY3RvcjIoMCwgMCk7XHJcblxyXG4gICAgY29uc3RydWN0b3Iocm9vdEVsZW1lbnQsIGhhbW1lckxpYiwgZXZlbnRzID0gbnVsbCkge1xyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdGhpcywgJ2lzTWFwQ29udHJvbHMnLCB7IHZhbHVlOiB0cnVlIH0gKTtcclxuXHJcbiAgICAgICAgdGhpcy5yb290RWxlbWVudCA9IHJvb3RFbGVtZW50O1xyXG4gICAgICAgIHRoaXMuaGFtbWVyID0gaGFtbWVyTGliO1xyXG4gICAgICAgIHRoaXMuZXZlbnRzID0gZXZlbnRzO1xyXG5cclxuICAgICAgICB0aGlzLmNvbnRyb2xzID0gbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy50YXJnZXRQb3NpdGlvbiA9IG5ldyBWZWN0b3IzKCk7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvblRlcnJhaW5IZWlnaHQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy50YXJnZXREaXN0YW5jZSA9IDQwMDtcclxuICAgICAgICB0aGlzLm1pbkRpc3RhbmNlID0gMTA7XHJcbiAgICAgICAgdGhpcy5tYXhEaXN0YW5jZSA9IDEwMDAwO1xyXG5cclxuICAgICAgICB0aGlzLnRhcmdldFJvdGF0aW9uID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy50YXJnZXRBbmdsZSA9IDA7XHJcbiAgICAgICAgdGhpcy5taW5BbmdsZSA9IDA7XHJcbiAgICAgICAgdGhpcy5tYXhBbmdsZSA9IE1hdGguUEkgLyAyO1xyXG4gICAgICAgIHRoaXMubWF4QW5nbGVGb3Jab29tID0gdGhpcy5tYXhBbmdsZTtcclxuXHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IE1hcENvbnRyb2xzLlNUQVRFUy5OT05FO1xyXG4gICAgICAgIHRoaXMubW91c2UgPSBuZXcgVmVjdG9yMigpO1xyXG4gICAgICAgIHRoaXMubGFzdE1vdXNlID0gbmV3IFZlY3RvcjIoKTtcclxuICAgICAgICB0aGlzLmtleVN0YXRlcyA9IHt9O1xyXG4gICAgICAgIHRoaXMudG91Y2hTdGFydCA9IG5ldyBWZWN0b3IyKCk7XHJcbiAgICAgICAgdGhpcy50b3VjaFRpbHRTdGFydCA9IDA7XHJcbiAgICAgICAgdGhpcy5sYXN0VG91Y2hSb3RhdGlvbiA9IDA7XHJcbiAgICAgICAgdGhpcy50b3VjaFpvb21TdGFydCA9IDA7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KGNvbnRyb2xzKSB7XHJcbiAgICAgICAgdGhpcy5jb250cm9scyA9IGNvbnRyb2xzO1xyXG5cclxuICAgICAgICB0aGlzLnRhcmdldFBvc2l0aW9uLmNvcHkodGhpcy5jb250cm9scy5wb3NpdGlvbik7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvblRlcnJhaW5IZWlnaHQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy50YXJnZXREaXN0YW5jZSA9IHRoaXMuY29udHJvbHMuZGlzdGFuY2U7XHJcbiAgICAgICAgdGhpcy50YXJnZXREaXN0YW5jZSA9IE1hdGhVdGlscy5jbGFtcCh0aGlzLnRhcmdldERpc3RhbmNlLCB0aGlzLm1pbkRpc3RhbmNlLCB0aGlzLm1heERpc3RhbmNlKTtcclxuXHJcbiAgICAgICAgdGhpcy50YXJnZXRSb3RhdGlvbiA9IHRoaXMuY29udHJvbHMucm90YXRpb247XHJcblxyXG4gICAgICAgIHRoaXMudGFyZ2V0QW5nbGUgPSB0aGlzLmNvbnRyb2xzLmFuZ2xlO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZVpvb20oKTtcclxuXHJcbiAgICAgICAgLy8gYWRkIGV2ZW50c1xyXG4gICAgICAgIHRoaXMucm9vdEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIndoZWVsXCIsIHRoaXMub25XaGVlbCwge3Bhc3NpdmU6IHRydWV9KVxyXG4gICAgICAgIHRoaXMuaGFtbWVyLm9uKCd6b29tc3RhcnQnLCB0aGlzLm9uVG91Y2hab29tRG93bik7XHJcbiAgICAgICAgdGhpcy5oYW1tZXIub24oJ3pvb21tb3ZlJywgdGhpcy5vblRvdWNoWm9vbU1vdmUpO1xyXG4gICAgICAgIHRoaXMucm9vdEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5vbk1vdXNlRG93bik7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMub25Nb3VzZU1vdmUpO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5vbk1vdXNlVXApO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5vbktleURvd24pO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMub25LZXlVcCk7XHJcbiAgICAgICAgdGhpcy5oYW1tZXIub24oJ21vdmVzdGFydCcsIHRoaXMub25Ub3VjaERvd24pO1xyXG4gICAgICAgIHRoaXMuaGFtbWVyLm9uKCdtb3ZlbW92ZScsIHRoaXMub25Ub3VjaE1vdmUpO1xyXG4gICAgICAgIHRoaXMuaGFtbWVyLm9uKCdtb3ZlZW5kJywgdGhpcy5vblRvdWNoVXApO1xyXG4gICAgICAgIHRoaXMuaGFtbWVyLm9uKCdtb3ZlY2FuY2VsJywgdGhpcy5vblRvdWNoVXApO1xyXG4gICAgICAgIHRoaXMuaGFtbWVyLm9uKCd0aWx0c3RhcnQnLCB0aGlzLm9uVG91Y2hUaWx0RG93bik7XHJcbiAgICAgICAgdGhpcy5oYW1tZXIub24oJ3RpbHRtb3ZlJywgdGhpcy5vblRvdWNoVGlsdE1vdmUpO1xyXG4gICAgICAgIHRoaXMuaGFtbWVyLm9uKCd0aWx0ZW5kJywgdGhpcy5vblRvdWNoVGlsdFVwKTtcclxuICAgICAgICB0aGlzLmhhbW1lci5vbigndGlsdGNhbmNlbCcsIHRoaXMub25Ub3VjaFRpbHRVcCk7XHJcbiAgICAgICAgdGhpcy5oYW1tZXIub24oJ3JvdGF0ZXN0YXJ0JywgdGhpcy5vblRvdWNoUm90YXRlRG93bik7XHJcbiAgICAgICAgdGhpcy5oYW1tZXIub24oJ3JvdGF0ZW1vdmUnLCB0aGlzLm9uVG91Y2hSb3RhdGVNb3ZlKTtcclxuICAgICAgICB0aGlzLmhhbW1lci5vbigncm90YXRlZW5kJywgdGhpcy5vblRvdWNoUm90YXRlVXApO1xyXG4gICAgICAgIHRoaXMuaGFtbWVyLm9uKCdyb3RhdGVjYW5jZWwnLCB0aGlzLm9uVG91Y2hSb3RhdGVVcCk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgdGhpcy5vbkNvbnRleHRNZW51KTtcclxuICAgIH1cclxuXHJcbiAgICBzdG9wKCkge1xyXG4gICAgICAgIC8vIHJlbW92ZSBldmVudHNcclxuICAgICAgICB0aGlzLnJvb3RFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ3aGVlbFwiLCB0aGlzLm9uV2hlZWwpXHJcbiAgICAgICAgdGhpcy5oYW1tZXIub2ZmKCd6b29tc3RhcnQnLCB0aGlzLm9uVG91Y2hab29tRG93bik7XHJcbiAgICAgICAgdGhpcy5oYW1tZXIub2ZmKCd6b29tbW92ZScsIHRoaXMub25Ub3VjaFpvb21Nb3ZlKTtcclxuICAgICAgICB0aGlzLnJvb3RFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMub25Nb3VzZURvd24pO1xyXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLm9uTW91c2VNb3ZlKTtcclxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25Nb3VzZVVwKTtcclxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMub25LZXlEb3duKTtcclxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLm9uS2V5VXApO1xyXG4gICAgICAgIHRoaXMuaGFtbWVyLm9uKCdtb3Zlc3RhcnQnLCB0aGlzLm9uVG91Y2hEb3duKTtcclxuICAgICAgICB0aGlzLmhhbW1lci5vZmYoJ21vdmVtb3ZlJywgdGhpcy5vblRvdWNoTW92ZSk7XHJcbiAgICAgICAgdGhpcy5oYW1tZXIub2ZmKCdtb3ZlZW5kJywgdGhpcy5vblRvdWNoVXApO1xyXG4gICAgICAgIHRoaXMuaGFtbWVyLm9mZignbW92ZWNhbmNlbCcsIHRoaXMub25Ub3VjaFVwKTtcclxuICAgICAgICB0aGlzLmhhbW1lci5vZmYoJ3RpbHRzdGFydCcsIHRoaXMub25Ub3VjaFRpbHREb3duKTtcclxuICAgICAgICB0aGlzLmhhbW1lci5vZmYoJ3RpbHRtb3ZlJywgdGhpcy5vblRvdWNoVGlsdE1vdmUpO1xyXG4gICAgICAgIHRoaXMuaGFtbWVyLm9mZigndGlsdGVuZCcsIHRoaXMub25Ub3VjaFRpbHRVcCk7XHJcbiAgICAgICAgdGhpcy5oYW1tZXIub2ZmKCd0aWx0Y2FuY2VsJywgdGhpcy5vblRvdWNoVGlsdFVwKTtcclxuICAgICAgICB0aGlzLmhhbW1lci5vZmYoJ3JvdGF0ZXN0YXJ0JywgdGhpcy5vblRvdWNoUm90YXRlRG93bik7XHJcbiAgICAgICAgdGhpcy5oYW1tZXIub2ZmKCdyb3RhdGVtb3ZlJywgdGhpcy5vblRvdWNoUm90YXRlTW92ZSk7XHJcbiAgICAgICAgdGhpcy5oYW1tZXIub2ZmKCdyb3RhdGVlbmQnLCB0aGlzLm9uVG91Y2hSb3RhdGVVcCk7XHJcbiAgICAgICAgdGhpcy5oYW1tZXIub2ZmKCdyb3RhdGVjYW5jZWwnLCB0aGlzLm9uVG91Y2hSb3RhdGVVcCk7XHJcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgdGhpcy5vbkNvbnRleHRNZW51KTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoZGVsdGFUaW1lLCBtYXApIHtcclxuICAgICAgICAvLyA9PSBwcm9jZXNzIG1vdXNlIG1vdmVtZW50cyA9PVxyXG4gICAgICAgIGxldCBkZWx0YU1vdXNlID0gdGhpcy5sYXN0TW91c2UuY2xvbmUoKS5zdWIodGhpcy5tb3VzZSk7XHJcbiAgICAgICAgbGV0IG1vdmVEZWx0YSA9IG5ldyBWZWN0b3IyKCk7XHJcblxyXG4gICAgICAgIC8vIHpvb20ga2V5c1xyXG4gICAgICAgIGlmICh0aGlzLmtleVN0YXRlcy5aT09NX0lOKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0RGlzdGFuY2UgKj0gMSAtIDAuMDAzICogZGVsdGFUaW1lO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVpvb20oKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMua2V5U3RhdGVzLlpPT01fT1VUKXtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXREaXN0YW5jZSAqPSAxICsgMC4wMDMgKiBkZWx0YVRpbWU7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlWm9vbSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gbW92ZVxyXG4gICAgICAgIGlmICh0aGlzLnN0YXRlID09PSBNYXBDb250cm9scy5TVEFURVMuTU9WRSkge1xyXG4gICAgICAgICAgICBtb3ZlRGVsdGEuY29weShkZWx0YU1vdXNlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5rZXlTdGF0ZXMuVVApIG1vdmVEZWx0YS55IC09IDIwO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5rZXlTdGF0ZXMuRE9XTikgbW92ZURlbHRhLnkgKz0gMjA7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmtleVN0YXRlcy5MRUZUKSBtb3ZlRGVsdGEueCAtPSAyMDtcclxuICAgICAgICAgICAgaWYgKHRoaXMua2V5U3RhdGVzLlJJR0hUKSBtb3ZlRGVsdGEueCArPSAyMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChtb3ZlRGVsdGEueCAhPT0gMCB8fCBtb3ZlRGVsdGEueSAhPT0gMCkge1xyXG4gICAgICAgICAgICBtb3ZlRGVsdGEucm90YXRlQXJvdW5kKE1hcENvbnRyb2xzLlZFQ1RPUjJfWkVSTywgdGhpcy5jb250cm9scy5yb3RhdGlvbik7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0UG9zaXRpb24uc2V0KFxyXG4gICAgICAgICAgICAgICAgdGhpcy50YXJnZXRQb3NpdGlvbi54ICsgKG1vdmVEZWx0YS54ICogdGhpcy50YXJnZXREaXN0YW5jZSAvIHRoaXMucm9vdEVsZW1lbnQuY2xpZW50SGVpZ2h0ICogMS41KSxcclxuICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0UG9zaXRpb24ueSxcclxuICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0UG9zaXRpb24ueiArIChtb3ZlRGVsdGEueSAqIHRoaXMudGFyZ2V0RGlzdGFuY2UgLyB0aGlzLnJvb3RFbGVtZW50LmNsaWVudEhlaWdodCAqIDEuNSlcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVQb3NpdGlvblRlcnJhaW5IZWlnaHQobWFwKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnBvc2l0aW9uVGVycmFpbkhlaWdodCkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVBvc2l0aW9uVGVycmFpbkhlaWdodChtYXApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gdGlsdC9wYW5cclxuICAgICAgICBpZiAodGhpcy5zdGF0ZSA9PT0gTWFwQ29udHJvbHMuU1RBVEVTLk9SQklUKSB7XHJcbiAgICAgICAgICAgIGlmIChkZWx0YU1vdXNlLnggIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0Um90YXRpb24gLT0gKGRlbHRhTW91c2UueCAvIHRoaXMucm9vdEVsZW1lbnQuY2xpZW50SGVpZ2h0ICogTWF0aC5QSSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndyYXBSb3RhdGlvbigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoZGVsdGFNb3VzZS55ICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRhcmdldEFuZ2xlICs9IChkZWx0YU1vdXNlLnkgLyB0aGlzLnJvb3RFbGVtZW50LmNsaWVudEhlaWdodCAqIE1hdGguUEkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50YXJnZXRBbmdsZSA9IE1hdGhVdGlscy5jbGFtcCh0aGlzLnRhcmdldEFuZ2xlLCB0aGlzLm1pbkFuZ2xlLCB0aGlzLm1heEFuZ2xlRm9yWm9vbSArIDAuMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMudGFyZ2V0QW5nbGUgPiB0aGlzLm1heEFuZ2xlRm9yWm9vbSkgdGhpcy50YXJnZXRBbmdsZSAtPSAodGhpcy50YXJnZXRBbmdsZSAtIHRoaXMubWF4QW5nbGVGb3Jab29tKSAqIDAuMztcclxuXHJcbiAgICAgICAgLy8gPT0gU21vb3RobHkgYXBwbHkgdGFyZ2V0IHZhbHVlcyA9PVxyXG4gICAgICAgIGxldCBzb21ldGhpbmdDaGFuZ2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIG1vdmVcclxuICAgICAgICBsZXQgZGVsdGFQb3NpdGlvbiA9IHRoaXMudGFyZ2V0UG9zaXRpb24uY2xvbmUoKS5zdWIodGhpcy5jb250cm9scy5wb3NpdGlvbik7XHJcbiAgICAgICAgaWYgKE1hdGguYWJzKGRlbHRhUG9zaXRpb24ueCkgPiAwLjAxIHx8IE1hdGguYWJzKGRlbHRhUG9zaXRpb24ueSkgPiAwLjAwMSB8fCBNYXRoLmFicyhkZWx0YVBvc2l0aW9uLnopID4gMC4wMSkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xzLnBvc2l0aW9uID0gdGhpcy5jb250cm9scy5wb3NpdGlvbi5hZGQoZGVsdGFQb3NpdGlvbi5tdWx0aXBseVNjYWxhcigwLjAxNSAqIGRlbHRhVGltZSkpO1xyXG4gICAgICAgICAgICBzb21ldGhpbmdDaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHJvdGF0aW9uXHJcbiAgICAgICAgbGV0IGRlbHRhUm90YXRpb24gPSB0aGlzLnRhcmdldFJvdGF0aW9uIC0gdGhpcy5jb250cm9scy5yb3RhdGlvbjtcclxuICAgICAgICBpZiAoTWF0aC5hYnMoZGVsdGFSb3RhdGlvbikgPiAwLjAwMDEpIHtcclxuICAgICAgICAgICAgdGhpcy5jb250cm9scy5yb3RhdGlvbiArPSBkZWx0YVJvdGF0aW9uICogMC4wMTUgKiBkZWx0YVRpbWU7XHJcbiAgICAgICAgICAgIHNvbWV0aGluZ0NoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gYW5nbGVcclxuICAgICAgICBsZXQgZGVsdGFBbmdsZSA9IHRoaXMudGFyZ2V0QW5nbGUgLSB0aGlzLmNvbnRyb2xzLmFuZ2xlO1xyXG4gICAgICAgIGlmIChNYXRoLmFicyhkZWx0YUFuZ2xlKSA+IDAuMDAwMSkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xzLmFuZ2xlICs9IGRlbHRhQW5nbGUgKiAwLjAxNSAqIGRlbHRhVGltZTtcclxuICAgICAgICAgICAgc29tZXRoaW5nQ2hhbmdlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyB6b29tXHJcbiAgICAgICAgbGV0IGRlbHRhRGlzdGFuY2UgPSB0aGlzLnRhcmdldERpc3RhbmNlIC0gdGhpcy5jb250cm9scy5kaXN0YW5jZVxyXG4gICAgICAgIGlmIChNYXRoLmFicyhkZWx0YURpc3RhbmNlKSA+IDAuMDAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29udHJvbHMuZGlzdGFuY2UgKz0gZGVsdGFEaXN0YW5jZSAqIDAuMDEgKiBkZWx0YVRpbWU7XHJcbiAgICAgICAgICAgIHNvbWV0aGluZ0NoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gPT0gQWRqdXN0IGNhbWVyYSBoZWlnaHQgdG8gdGVycmFpbiA9PVxyXG4gICAgICAgIGlmIChzb21ldGhpbmdDaGFuZ2VkKSB7XHJcbiAgICAgICAgICAgIGxldCB5ID0gMDtcclxuICAgICAgICAgICAgaWYgKHRoaXMucG9zaXRpb25UZXJyYWluSGVpZ2h0ICE9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgeSA9IHRoaXMudGFyZ2V0UG9zaXRpb24ueTtcclxuICAgICAgICAgICAgICAgIGxldCBkZWx0YVkgPSB0aGlzLnBvc2l0aW9uVGVycmFpbkhlaWdodCAtIHk7XHJcbiAgICAgICAgICAgICAgICBpZiAoTWF0aC5hYnMoZGVsdGFZKSA+IDAuMDAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeSArPSBkZWx0YVkgKiAwLjAxICogZGVsdGFUaW1lO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBtaW5DYW1lcmFIZWlnaHQgPSBtYXAudGVycmFpbkhlaWdodEF0KHRoaXMuY29udHJvbHMuY2FtZXJhLnBvc2l0aW9uLngsIHRoaXMuY29udHJvbHMuY2FtZXJhLnBvc2l0aW9uLnopICsgKCh0aGlzLm1pbkRpc3RhbmNlIC0gdGhpcy50YXJnZXREaXN0YW5jZSkgKiAwLjQpICsgMTtcclxuICAgICAgICAgICAgaWYgKG1pbkNhbWVyYUhlaWdodCA+IHkpIHkgPSBtaW5DYW1lcmFIZWlnaHQ7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0UG9zaXRpb24ueSA9IHk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyA9PSBGaXggTmFOJ3MgYXMgYSBmYWlsLXNhZmUgPT1cclxuICAgICAgICBpZiAoaXNOYU4odGhpcy50YXJnZXRQb3NpdGlvbi54KSl7XHJcbiAgICAgICAgICAgIGFsZXJ0KHRoaXMuZXZlbnRzLCBgSW52YWxpZCB0YXJnZXRQb3NpdGlvbiB4OiAke3RoaXMudGFyZ2V0UG9zaXRpb24ueH1gLCBcIndhcm5pbmdcIik7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0UG9zaXRpb24ueCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc05hTih0aGlzLnRhcmdldFBvc2l0aW9uLnkpKXtcclxuICAgICAgICAgICAgYWxlcnQodGhpcy5ldmVudHMsIGBJbnZhbGlkIHRhcmdldFBvc2l0aW9uIHk6ICR7dGhpcy50YXJnZXRQb3NpdGlvbi55fWAsIFwid2FybmluZ1wiKTtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXRQb3NpdGlvbi55ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzTmFOKHRoaXMudGFyZ2V0UG9zaXRpb24ueikpe1xyXG4gICAgICAgICAgICBhbGVydCh0aGlzLmV2ZW50cywgYEludmFsaWQgdGFyZ2V0UG9zaXRpb24gejogJHt0aGlzLnRhcmdldFBvc2l0aW9uLnp9YCwgXCJ3YXJuaW5nXCIpO1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldFBvc2l0aW9uLnogPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNOYU4odGhpcy50YXJnZXREaXN0YW5jZSkpe1xyXG4gICAgICAgICAgICBhbGVydCh0aGlzLmV2ZW50cywgYEludmFsaWQgdGFyZ2V0RGlzdGFuY2U6ICR7dGhpcy50YXJnZXREaXN0YW5jZX1gLCBcIndhcm5pbmdcIik7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0RGlzdGFuY2UgPSB0aGlzLm1pbkRpc3RhbmNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNOYU4odGhpcy50YXJnZXRSb3RhdGlvbikpe1xyXG4gICAgICAgICAgICBhbGVydCh0aGlzLmV2ZW50cywgYEludmFsaWQgdGFyZ2V0Um90YXRpb246ICR7dGhpcy50YXJnZXRSb3RhdGlvbn1gLCBcIndhcm5pbmdcIik7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Um90YXRpb24gPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNOYU4odGhpcy50YXJnZXRBbmdsZSkpe1xyXG4gICAgICAgICAgICBhbGVydCh0aGlzLmV2ZW50cywgYEludmFsaWQgdGFyZ2V0QW5nbGU6ICR7dGhpcy50YXJnZXRBbmdsZX1gLCBcIndhcm5pbmdcIik7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0QW5nbGUgPSB0aGlzLm1pbkFuZ2xlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gPT0gUmVtZW1iZXIgbGFzdCBwcm9jZXNzZWQgc3RhdGUgPT1cclxuICAgICAgICB0aGlzLmxhc3RNb3VzZS5jb3B5KHRoaXMubW91c2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVpvb20oKSB7XHJcbiAgICAgICAgdGhpcy50YXJnZXREaXN0YW5jZSA9IE1hdGhVdGlscy5jbGFtcCh0aGlzLnRhcmdldERpc3RhbmNlLCB0aGlzLm1pbkRpc3RhbmNlLCB0aGlzLm1heERpc3RhbmNlKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZU1heEFuZ2xlRm9yWm9vbSgpO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0QW5nbGUgPSBNYXRoVXRpbHMuY2xhbXAodGhpcy50YXJnZXRBbmdsZSwgdGhpcy5taW5BbmdsZSwgdGhpcy5tYXhBbmdsZUZvclpvb20pO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZU1heEFuZ2xlRm9yWm9vbSgpIHtcclxuICAgICAgICB0aGlzLm1heEFuZ2xlRm9yWm9vbSA9XHJcbiAgICAgICAgICAgIE1hdGhVdGlscy5jbGFtcChcclxuICAgICAgICAgICAgICAgICgxIC0gTWF0aC5wb3coKHRoaXMudGFyZ2V0RGlzdGFuY2UgLSB0aGlzLm1pbkRpc3RhbmNlKSAvICg1MDAgLSB0aGlzLm1pbkRpc3RhbmNlKSwgMC41KSkgKiB0aGlzLm1heEFuZ2xlLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5taW5BbmdsZSxcclxuICAgICAgICAgICAgICAgIHRoaXMubWF4QW5nbGVcclxuICAgICAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVQb3NpdGlvblRlcnJhaW5IZWlnaHQobWFwKSB7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvblRlcnJhaW5IZWlnaHQgPSBtYXAudGVycmFpbkhlaWdodEF0KHRoaXMudGFyZ2V0UG9zaXRpb24ueCwgdGhpcy50YXJnZXRQb3NpdGlvbi56KTtcclxuICAgIH1cclxuXHJcbiAgICB3cmFwUm90YXRpb24oKSB7XHJcbiAgICAgICAgd2hpbGUgKHRoaXMudGFyZ2V0Um90YXRpb24gPj0gTWF0aC5QSSkge1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldFJvdGF0aW9uIC09IE1hdGguUEkgKiAyO1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xzLnJvdGF0aW9uIC09IE1hdGguUEkgKiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICB3aGlsZSAodGhpcy50YXJnZXRSb3RhdGlvbiA8PSAtTWF0aC5QSSkge1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldFJvdGF0aW9uICs9IE1hdGguUEkgKiAyO1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xzLnJvdGF0aW9uICs9IE1hdGguUEkgKiAyO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvbktleURvd24gPSBldnQgPT4ge1xyXG4gICAgICAgIGxldCBrZXkgPSBldnQua2V5IHx8IGV2dC5rZXlDb2RlO1xyXG4gICAgICAgIGZvciAobGV0IGFjdGlvbiBpbiBNYXBDb250cm9scy5LRVlTKXtcclxuICAgICAgICAgICAgaWYgKCFNYXBDb250cm9scy5LRVlTLmhhc093blByb3BlcnR5KGFjdGlvbikpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBpZiAoTWFwQ29udHJvbHMuS0VZU1thY3Rpb25dLmluY2x1ZGVzKGtleSkpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlTdGF0ZXNbYWN0aW9uXSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIG9uS2V5VXAgPSBldnQgPT4ge1xyXG4gICAgICAgIGxldCBrZXkgPSBldnQua2V5IHx8IGV2dC5rZXlDb2RlO1xyXG4gICAgICAgIGZvciAobGV0IGFjdGlvbiBpbiBNYXBDb250cm9scy5LRVlTKXtcclxuICAgICAgICAgICAgaWYgKCFNYXBDb250cm9scy5LRVlTLmhhc093blByb3BlcnR5KGFjdGlvbikpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBpZiAoTWFwQ29udHJvbHMuS0VZU1thY3Rpb25dLmluY2x1ZGVzKGtleSkpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlTdGF0ZXNbYWN0aW9uXSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBvbldoZWVsID0gZXZ0ID0+IHtcclxuICAgICAgICBsZXQgZGVsdGEgPSBldnQuZGVsdGFZO1xyXG4gICAgICAgIGlmIChldnQuZGVsdGFNb2RlID09PSBXaGVlbEV2ZW50LkRPTV9ERUxUQV9QSVhFTCkgZGVsdGEgKj0gMC4wMTtcclxuICAgICAgICBpZiAoZXZ0LmRlbHRhTW9kZSA9PT0gV2hlZWxFdmVudC5ET01fREVMVEFfTElORSkgZGVsdGEgKj0gMC4zMztcclxuXHJcbiAgICAgICAgdGhpcy50YXJnZXREaXN0YW5jZSAqPSBNYXRoLnBvdygxLjUsIGRlbHRhKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVpvb20oKTtcclxuICAgIH1cclxuXHJcbiAgICBvbk1vdXNlRG93biA9IGV2dCA9PiB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUgIT09IE1hcENvbnRyb2xzLlNUQVRFUy5OT05FKSByZXR1cm47XHJcblxyXG4gICAgICAgIGlmIChNYXBDb250cm9scy5CVVRUT05TLk1PVkUuaW5jbHVkZXMoZXZ0LmJ1dHRvbikpIHtcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IE1hcENvbnRyb2xzLlNUQVRFUy5NT1ZFO1xyXG4gICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKE1hcENvbnRyb2xzLkJVVFRPTlMuT1JCSVQuaW5jbHVkZXMoZXZ0LmJ1dHRvbikpIHtcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IE1hcENvbnRyb2xzLlNUQVRFUy5PUkJJVDtcclxuICAgICAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBvbk1vdXNlTW92ZSA9IGV2dCA9PiB7XHJcbiAgICAgICAgdGhpcy5tb3VzZS5zZXQoZXZ0LmNsaWVudFgsIGV2dC5jbGllbnRZKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUgIT09IE1hcENvbnRyb2xzLlNUQVRFUy5OT05FKXtcclxuICAgICAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBvbk1vdXNlVXAgPSBldnQgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLnN0YXRlID09PSBNYXBDb250cm9scy5TVEFURVMuTk9ORSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBpZiAoTWFwQ29udHJvbHMuQlVUVE9OUy5NT1ZFLmluY2x1ZGVzKGV2dC5idXR0b24pKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlID09PSBNYXBDb250cm9scy5TVEFURVMuTU9WRSkgdGhpcy5zdGF0ZSA9IE1hcENvbnRyb2xzLlNUQVRFUy5OT05FO1xyXG4gICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKE1hcENvbnRyb2xzLkJVVFRPTlMuT1JCSVQuaW5jbHVkZXMoZXZ0LmJ1dHRvbikpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUgPT09IE1hcENvbnRyb2xzLlNUQVRFUy5PUkJJVCkgdGhpcy5zdGF0ZSA9IE1hcENvbnRyb2xzLlNUQVRFUy5OT05FO1xyXG4gICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIG9uVG91Y2hEb3duID0gZXZ0ID0+IHtcclxuICAgICAgICBpZiAoZXZ0LnBvaW50ZXJUeXBlID09PSBcIm1vdXNlXCIpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy50b3VjaFN0YXJ0LnNldCh0aGlzLnRhcmdldFBvc2l0aW9uLngsIHRoaXMudGFyZ2V0UG9zaXRpb24ueik7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IE1hcENvbnRyb2xzLlNUQVRFUy5NT1ZFO1xyXG4gICAgfTtcclxuXHJcbiAgICBvblRvdWNoTW92ZSA9IGV2dCA9PiB7XHJcbiAgICAgICAgaWYgKGV2dC5wb2ludGVyVHlwZSA9PT0gXCJtb3VzZVwiKSByZXR1cm47XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUgIT09IE1hcENvbnRyb2xzLlNUQVRFUy5NT1ZFKSByZXR1cm47XHJcblxyXG4gICAgICAgIGxldCB0b3VjaERlbHRhID0gbmV3IFZlY3RvcjIoZXZ0LmRlbHRhWCwgZXZ0LmRlbHRhWSk7XHJcblxyXG4gICAgICAgIGlmICh0b3VjaERlbHRhLnggIT09IDAgfHwgdG91Y2hEZWx0YS55ICE9PSAwKSB7XHJcbiAgICAgICAgICAgIHRvdWNoRGVsdGEucm90YXRlQXJvdW5kKE1hcENvbnRyb2xzLlZFQ1RPUjJfWkVSTywgdGhpcy5jb250cm9scy5yb3RhdGlvbik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnRhcmdldFBvc2l0aW9uLnggPSB0aGlzLnRvdWNoU3RhcnQueCAtICh0b3VjaERlbHRhLnggKiB0aGlzLnRhcmdldERpc3RhbmNlIC8gdGhpcy5yb290RWxlbWVudC5jbGllbnRIZWlnaHQgKiAxLjUpO1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldFBvc2l0aW9uLnogPSB0aGlzLnRvdWNoU3RhcnQueSAtICh0b3VjaERlbHRhLnkgKiB0aGlzLnRhcmdldERpc3RhbmNlIC8gdGhpcy5yb290RWxlbWVudC5jbGllbnRIZWlnaHQgKiAxLjUpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgb25Ub3VjaFVwID0gZXZ0ID0+IHtcclxuICAgICAgICBpZiAoZXZ0LnBvaW50ZXJUeXBlID09PSBcIm1vdXNlXCIpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IE1hcENvbnRyb2xzLlNUQVRFUy5OT05FO1xyXG4gICAgfTtcclxuXHJcbiAgICBvblRvdWNoVGlsdERvd24gPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy50b3VjaFRpbHRTdGFydCA9IHRoaXMudGFyZ2V0QW5nbGU7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IE1hcENvbnRyb2xzLlNUQVRFUy5PUkJJVDtcclxuICAgIH07XHJcblxyXG4gICAgb25Ub3VjaFRpbHRNb3ZlID0gZXZ0ID0+IHtcclxuICAgICAgICBpZiAodGhpcy5zdGF0ZSAhPT0gTWFwQ29udHJvbHMuU1RBVEVTLk9SQklUKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMudGFyZ2V0QW5nbGUgPSB0aGlzLnRvdWNoVGlsdFN0YXJ0IC0gKGV2dC5kZWx0YVkgLyB0aGlzLnJvb3RFbGVtZW50LmNsaWVudEhlaWdodCAqIE1hdGguUEkpO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0QW5nbGUgPSBNYXRoVXRpbHMuY2xhbXAodGhpcy50YXJnZXRBbmdsZSwgdGhpcy5taW5BbmdsZSwgdGhpcy5tYXhBbmdsZUZvclpvb20gKyAwLjEpO1xyXG4gICAgfTtcclxuXHJcbiAgICBvblRvdWNoVGlsdFVwID0gKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBNYXBDb250cm9scy5TVEFURVMuTk9ORTtcclxuICAgIH07XHJcblxyXG4gICAgb25Ub3VjaFJvdGF0ZURvd24gPSBldnQgPT4ge1xyXG4gICAgICAgIHRoaXMubGFzdFRvdWNoUm90YXRpb24gPSBldnQucm90YXRpb247XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IE1hcENvbnRyb2xzLlNUQVRFUy5PUkJJVDtcclxuICAgIH07XHJcblxyXG4gICAgb25Ub3VjaFJvdGF0ZU1vdmUgPSBldnQgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLnN0YXRlICE9PSBNYXBDb250cm9scy5TVEFURVMuT1JCSVQpIHJldHVybjtcclxuXHJcbiAgICAgICAgbGV0IGRlbHRhID0gZXZ0LnJvdGF0aW9uIC0gdGhpcy5sYXN0VG91Y2hSb3RhdGlvbjtcclxuICAgICAgICB0aGlzLmxhc3RUb3VjaFJvdGF0aW9uID0gZXZ0LnJvdGF0aW9uO1xyXG4gICAgICAgIGlmIChkZWx0YSA+IDE4MCkgZGVsdGEgLT0gMzYwO1xyXG4gICAgICAgIGlmIChkZWx0YSA8IC0xODApIGRlbHRhICs9IDM2MDtcclxuXHJcbiAgICAgICAgdGhpcy50YXJnZXRSb3RhdGlvbiAtPSAoZGVsdGEgKiAoTWF0aC5QSSAvIDE4MCkpICogMS40O1xyXG4gICAgICAgIHRoaXMud3JhcFJvdGF0aW9uKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIG9uVG91Y2hSb3RhdGVVcCA9ICgpID0+IHtcclxuICAgICAgICB0aGlzLnN0YXRlID0gTWFwQ29udHJvbHMuU1RBVEVTLk5PTkU7XHJcbiAgICB9O1xyXG5cclxuICAgIG9uVG91Y2hab29tRG93biA9ICgpID0+IHtcclxuICAgICAgICB0aGlzLnRvdWNoWm9vbVN0YXJ0ID0gdGhpcy50YXJnZXREaXN0YW5jZTtcclxuICAgIH07XHJcblxyXG4gICAgb25Ub3VjaFpvb21Nb3ZlID0gZXZ0ID0+IHtcclxuICAgICAgICB0aGlzLnRhcmdldERpc3RhbmNlID0gdGhpcy50b3VjaFpvb21TdGFydCAvIGV2dC5zY2FsZTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVpvb20oKTtcclxuICAgIH07XHJcbiAgICBcclxuICAgIG9uQ29udGV4dE1lbnUgPSBldnQgPT4ge1xyXG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfVxyXG5cclxufSIsIi8qKlxyXG4gKiBUYWtlbiBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2IvdGhyZWUuanMvYmxvYi9tYXN0ZXIvZXhhbXBsZXMvanNtL2xpYnMvc3RhdHMubW9kdWxlLmpzXHJcbiAqL1xyXG5sZXQgU3RhdHMgPSBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgbGV0IG1vZGUgPSAwO1xyXG5cclxuICAgIGxldCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xyXG4gICAgY29udGFpbmVyLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246YWJzb2x1dGU7Ym90dG9tOjVweDtyaWdodDo1cHg7Y3Vyc29yOnBvaW50ZXI7b3BhY2l0eTowLjk7ei1pbmRleDoxMDAwMCc7XHJcbiAgICBjb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgZnVuY3Rpb24gKCBldmVudCApIHtcclxuXHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBzaG93UGFuZWwoICsrIG1vZGUgJSBjb250YWluZXIuY2hpbGRyZW4ubGVuZ3RoICk7XHJcblxyXG4gICAgfSwgZmFsc2UgKTtcclxuXHJcbiAgICAvL1xyXG5cclxuICAgIGZ1bmN0aW9uIGFkZFBhbmVsKCBwYW5lbCApIHtcclxuXHJcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKCBwYW5lbC5kb20gKTtcclxuICAgICAgICByZXR1cm4gcGFuZWw7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNob3dQYW5lbCggaWQgKSB7XHJcblxyXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGNvbnRhaW5lci5jaGlsZHJlbi5sZW5ndGg7IGkgKysgKSB7XHJcblxyXG4gICAgICAgICAgICBjb250YWluZXIuY2hpbGRyZW5bIGkgXS5zdHlsZS5kaXNwbGF5ID0gaSA9PT0gaWQgPyAnYmxvY2snIDogJ25vbmUnO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG1vZGUgPSBpZDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaGlkZSgpIHtcclxuICAgICAgICBzaG93UGFuZWwoLTEpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vXHJcblxyXG4gICAgbGV0IGJlZ2luVGltZSA9ICggcGVyZm9ybWFuY2UgfHwgRGF0ZSApLm5vdygpLCBwcmV2VGltZSA9IGJlZ2luVGltZSwgZnJhbWVzID0gMDtcclxuICAgIGxldCBwcmV2RnJhbWVUaW1lID0gYmVnaW5UaW1lO1xyXG5cclxuICAgIGxldCBmcHNQYW5lbCA9IGFkZFBhbmVsKCBuZXcgU3RhdHMuUGFuZWwoICdGUFMnLCAnIzBmZicsICcjMDAyJyApICk7XHJcbiAgICBsZXQgbXNQYW5lbCA9IGFkZFBhbmVsKCBuZXcgU3RhdHMuUGFuZWwoICdNUyAocmVuZGVyKScsICcjMGYwJywgJyMwMjAnICkgKTtcclxuICAgIGxldCBsYXN0RnJhbWVNc1BhbmVsID0gYWRkUGFuZWwoIG5ldyBTdGF0cy5QYW5lbCggJ01TIChhbGwpJywgJyNmODAnLCAnIzIxMCcgKSApO1xyXG5cclxuICAgIGxldCBtZW1QYW5lbCA9IG51bGw7XHJcbiAgICBpZiAoIHNlbGYucGVyZm9ybWFuY2UgJiYgc2VsZi5wZXJmb3JtYW5jZS5tZW1vcnkgKSB7XHJcblxyXG4gICAgICAgIG1lbVBhbmVsID0gYWRkUGFuZWwoIG5ldyBTdGF0cy5QYW5lbCggJ01CJywgJyNmMDgnLCAnIzIwMScgKSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzaG93UGFuZWwoIDAgKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG5cclxuICAgICAgICBSRVZJU0lPTjogMTYsXHJcblxyXG4gICAgICAgIGRvbTogY29udGFpbmVyLFxyXG5cclxuICAgICAgICBhZGRQYW5lbDogYWRkUGFuZWwsXHJcbiAgICAgICAgc2hvd1BhbmVsOiBzaG93UGFuZWwsXHJcbiAgICAgICAgaGlkZTogaGlkZSxcclxuXHJcbiAgICAgICAgYmVnaW46IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgICAgIGJlZ2luVGltZSA9ICggcGVyZm9ybWFuY2UgfHwgRGF0ZSApLm5vdygpO1xyXG5cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBlbmQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgICAgIGZyYW1lcyArKztcclxuXHJcbiAgICAgICAgICAgIGxldCB0aW1lID0gKCBwZXJmb3JtYW5jZSB8fCBEYXRlICkubm93KCk7XHJcblxyXG4gICAgICAgICAgICBtc1BhbmVsLnVwZGF0ZSggdGltZSAtIGJlZ2luVGltZSwgMjAwICk7XHJcbiAgICAgICAgICAgIGxhc3RGcmFtZU1zUGFuZWwudXBkYXRlKCB0aW1lIC0gcHJldkZyYW1lVGltZSwgMjAwIClcclxuXHJcbiAgICAgICAgICAgIGlmICggdGltZSA+PSBwcmV2VGltZSArIDEwMDAgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgZnBzUGFuZWwudXBkYXRlKCAoIGZyYW1lcyAqIDEwMDAgKSAvICggdGltZSAtIHByZXZUaW1lICksIDEwMCApO1xyXG5cclxuICAgICAgICAgICAgICAgIHByZXZUaW1lID0gdGltZTtcclxuICAgICAgICAgICAgICAgIGZyYW1lcyA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCBtZW1QYW5lbCApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1lbW9yeSA9IHBlcmZvcm1hbmNlLm1lbW9yeTtcclxuICAgICAgICAgICAgICAgICAgICBtZW1QYW5lbC51cGRhdGUoIG1lbW9yeS51c2VkSlNIZWFwU2l6ZSAvIDEwNDg1NzYsIG1lbW9yeS5qc0hlYXBTaXplTGltaXQgLyAxMDQ4NTc2ICk7XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRpbWU7XHJcblxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAgICAgYmVnaW5UaW1lID0gdGhpcy5lbmQoKTtcclxuICAgICAgICAgICAgcHJldkZyYW1lVGltZSA9IGJlZ2luVGltZTtcclxuXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLy8gQmFja3dhcmRzIENvbXBhdGliaWxpdHlcclxuXHJcbiAgICAgICAgZG9tRWxlbWVudDogY29udGFpbmVyLFxyXG4gICAgICAgIHNldE1vZGU6IHNob3dQYW5lbFxyXG5cclxuICAgIH07XHJcblxyXG59O1xyXG5cclxuU3RhdHMuUGFuZWwgPSBmdW5jdGlvbiAoIG5hbWUsIGZnLCBiZyApIHtcclxuXHJcbiAgICBsZXQgbWluID0gSW5maW5pdHksIG1heCA9IDAsIHJvdW5kID0gTWF0aC5yb3VuZDtcclxuICAgIGxldCBQUiA9IHJvdW5kKCB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxICk7XHJcblxyXG4gICAgbGV0IFdJRFRIID0gMTYwICogUFIsIEhFSUdIVCA9IDk2ICogUFIsXHJcbiAgICAgICAgVEVYVF9YID0gMyAqIFBSLCBURVhUX1kgPSAzICogUFIsXHJcbiAgICAgICAgR1JBUEhfWCA9IDMgKiBQUiwgR1JBUEhfWSA9IDE1ICogUFIsXHJcbiAgICAgICAgR1JBUEhfV0lEVEggPSAxNTQgKiBQUiwgR1JBUEhfSEVJR0hUID0gNzcgKiBQUjtcclxuXHJcbiAgICBsZXQgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcclxuICAgIGNhbnZhcy53aWR0aCA9IFdJRFRIO1xyXG4gICAgY2FudmFzLmhlaWdodCA9IEhFSUdIVDtcclxuICAgIGNhbnZhcy5zdHlsZS5jc3NUZXh0ID0gJ3dpZHRoOjE2MHB4O2hlaWdodDo5NnB4JztcclxuXHJcbiAgICBsZXQgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICk7XHJcbiAgICBjb250ZXh0LmZvbnQgPSAnYm9sZCAnICsgKCA5ICogUFIgKSArICdweCBIZWx2ZXRpY2EsQXJpYWwsc2Fucy1zZXJpZic7XHJcbiAgICBjb250ZXh0LnRleHRCYXNlbGluZSA9ICd0b3AnO1xyXG5cclxuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gYmc7XHJcbiAgICBjb250ZXh0LmZpbGxSZWN0KCAwLCAwLCBXSURUSCwgSEVJR0hUICk7XHJcblxyXG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBmZztcclxuICAgIGNvbnRleHQuZmlsbFRleHQoIG5hbWUsIFRFWFRfWCwgVEVYVF9ZICk7XHJcbiAgICBjb250ZXh0LmZpbGxSZWN0KCBHUkFQSF9YLCBHUkFQSF9ZLCBHUkFQSF9XSURUSCwgR1JBUEhfSEVJR0hUICk7XHJcblxyXG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBiZztcclxuICAgIGNvbnRleHQuZ2xvYmFsQWxwaGEgPSAwLjk7XHJcbiAgICBjb250ZXh0LmZpbGxSZWN0KCBHUkFQSF9YLCBHUkFQSF9ZLCBHUkFQSF9XSURUSCwgR1JBUEhfSEVJR0hUICk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuXHJcbiAgICAgICAgZG9tOiBjYW52YXMsXHJcblxyXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKCB2YWx1ZSwgbWF4VmFsdWUgKSB7XHJcblxyXG4gICAgICAgICAgICBtaW4gPSBNYXRoLm1pbiggbWluLCB2YWx1ZSApO1xyXG4gICAgICAgICAgICBtYXggPSBNYXRoLm1heCggbWF4LCB2YWx1ZSApO1xyXG5cclxuICAgICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBiZztcclxuICAgICAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IDE7XHJcbiAgICAgICAgICAgIGNvbnRleHQuZmlsbFJlY3QoIDAsIDAsIFdJRFRILCBHUkFQSF9ZICk7XHJcbiAgICAgICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gZmc7XHJcbiAgICAgICAgICAgIGNvbnRleHQuZmlsbFRleHQoIHJvdW5kKCB2YWx1ZSApICsgJyAnICsgbmFtZSArICcgKCcgKyByb3VuZCggbWluICkgKyAnLScgKyByb3VuZCggbWF4ICkgKyAnKScsIFRFWFRfWCwgVEVYVF9ZICk7XHJcblxyXG4gICAgICAgICAgICBjb250ZXh0LmRyYXdJbWFnZSggY2FudmFzLCBHUkFQSF9YICsgUFIsIEdSQVBIX1ksIEdSQVBIX1dJRFRIIC0gUFIsIEdSQVBIX0hFSUdIVCwgR1JBUEhfWCwgR1JBUEhfWSwgR1JBUEhfV0lEVEggLSBQUiwgR1JBUEhfSEVJR0hUICk7XHJcblxyXG4gICAgICAgICAgICBjb250ZXh0LmZpbGxSZWN0KCBHUkFQSF9YICsgR1JBUEhfV0lEVEggLSBQUiwgR1JBUEhfWSwgUFIsIEdSQVBIX0hFSUdIVCApO1xyXG5cclxuICAgICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBiZztcclxuICAgICAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IDAuOTtcclxuICAgICAgICAgICAgY29udGV4dC5maWxsUmVjdCggR1JBUEhfWCArIEdSQVBIX1dJRFRIIC0gUFIsIEdSQVBIX1ksIFBSLCByb3VuZCggKCAxIC0gKCB2YWx1ZSAvIG1heFZhbHVlICkgKSAqIEdSQVBIX0hFSUdIVCApICk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFN0YXRzOyIsIi8qXHJcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIEJsdWVNYXAsIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZSAoTUlUKS5cclxuICpcclxuICogQ29weXJpZ2h0IChjKSBCbHVlIChMdWthcyBSaWVnZXIpIDxodHRwczovL2JsdWVjb2xvcmVkLmRlPlxyXG4gKiBDb3B5cmlnaHQgKGMpIGNvbnRyaWJ1dG9yc1xyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlICdTb2Z0d2FyZScpLCB0byBkZWFsXHJcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuICpcclxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cclxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbiAqXHJcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCAnQVMgSVMnLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXHJcbiAqIFRIRSBTT0ZUV0FSRS5cclxuICovXHJcbmltcG9ydCB7IFNoYWRlckNodW5rIH0gZnJvbSAndGhyZWUnO1xyXG5cclxuZXhwb3J0IGNvbnN0IEhJUkVTX1ZFUlRFWF9TSEFERVIgPSBgXHJcbiNpbmNsdWRlIDxjb21tb24+XHJcbiR7U2hhZGVyQ2h1bmsubG9nZGVwdGhidWZfcGFyc192ZXJ0ZXh9XHJcblxyXG5hdHRyaWJ1dGUgZmxvYXQgYW87XHJcbmF0dHJpYnV0ZSBmbG9hdCBzdW5saWdodDtcclxuYXR0cmlidXRlIGZsb2F0IGJsb2NrbGlnaHQ7XHJcblxyXG52YXJ5aW5nIHZlYzMgdlBvc2l0aW9uO1xyXG52YXJ5aW5nIHZlYzMgdldvcmxkUG9zaXRpb247XHJcbnZhcnlpbmcgdmVjMyB2Tm9ybWFsO1xyXG52YXJ5aW5nIHZlYzIgdlV2O1xyXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xyXG52YXJ5aW5nIGZsb2F0IHZBbztcclxudmFyeWluZyBmbG9hdCB2U3VubGlnaHQ7XHJcbnZhcnlpbmcgZmxvYXQgdkJsb2NrbGlnaHQ7XHJcblxyXG52b2lkIG1haW4oKSB7XHJcblx0dlBvc2l0aW9uID0gcG9zaXRpb247XHJcblx0dldvcmxkUG9zaXRpb24gPSAobW9kZWxNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxKSkueHl6O1xyXG5cdHZOb3JtYWwgPSBub3JtYWw7XHJcblx0dlV2ID0gdXY7XHJcblx0dkNvbG9yID0gY29sb3I7XHJcblx0dkFvID0gYW87XHJcblx0dlN1bmxpZ2h0ID0gc3VubGlnaHQ7XHJcblx0dkJsb2NrbGlnaHQgPSBibG9ja2xpZ2h0O1xyXG5cdFxyXG5cdGdsX1Bvc2l0aW9uID0gXHJcblx0XHRwcm9qZWN0aW9uTWF0cml4ICpcclxuXHRcdHZpZXdNYXRyaXggKlxyXG5cdFx0bW9kZWxNYXRyaXggKlxyXG5cdFx0dmVjNChwb3NpdGlvbiwgMSk7XHJcblx0XHJcblx0JHtTaGFkZXJDaHVuay5sb2dkZXB0aGJ1Zl92ZXJ0ZXh9IFxyXG59XHJcbmA7XHJcbiIsIi8qXHJcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIEJsdWVNYXAsIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZSAoTUlUKS5cclxuICpcclxuICogQ29weXJpZ2h0IChjKSBCbHVlIChMdWthcyBSaWVnZXIpIDxodHRwczovL2JsdWVjb2xvcmVkLmRlPlxyXG4gKiBDb3B5cmlnaHQgKGMpIGNvbnRyaWJ1dG9yc1xyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlICdTb2Z0d2FyZScpLCB0byBkZWFsXHJcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuICpcclxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cclxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbiAqXHJcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCAnQVMgSVMnLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXHJcbiAqIFRIRSBTT0ZUV0FSRS5cclxuICovXHJcbmltcG9ydCB7IFNoYWRlckNodW5rIH0gZnJvbSAndGhyZWUnO1xyXG5cclxuZXhwb3J0IGNvbnN0IEhJUkVTX0ZSQUdNRU5UX1NIQURFUiA9IGBcclxuJHtTaGFkZXJDaHVuay5sb2dkZXB0aGJ1Zl9wYXJzX2ZyYWdtZW50fVxyXG5cclxudW5pZm9ybSBzYW1wbGVyMkQgdGV4dHVyZUltYWdlO1xyXG51bmlmb3JtIGZsb2F0IHN1bmxpZ2h0U3RyZW5ndGg7XHJcbnVuaWZvcm0gZmxvYXQgYW1iaWVudExpZ2h0O1xyXG5cclxudmFyeWluZyB2ZWMzIHZQb3NpdGlvbjtcclxudmFyeWluZyB2ZWMzIHZXb3JsZFBvc2l0aW9uO1xyXG52YXJ5aW5nIHZlYzMgdk5vcm1hbDtcclxudmFyeWluZyB2ZWMyIHZVdjtcclxudmFyeWluZyB2ZWMzIHZDb2xvcjtcclxudmFyeWluZyBmbG9hdCB2QW87XHJcbnZhcnlpbmcgZmxvYXQgdlN1bmxpZ2h0O1xyXG52YXJ5aW5nIGZsb2F0IHZCbG9ja2xpZ2h0O1xyXG5cclxudm9pZCBtYWluKCkge1xyXG5cdHZlYzQgY29sb3IgPSB0ZXh0dXJlKHRleHR1cmVJbWFnZSwgdlV2KTtcclxuXHRpZiAoY29sb3IuYSA9PSAwLjApIGRpc2NhcmQ7XHJcblx0XHJcblx0Ly9hcHBseSB2ZXJ0ZXgtY29sb3JcclxuXHRjb2xvci5yZ2IgKj0gdkNvbG9yLnJnYjtcclxuXHJcblx0Ly9hcHBseSBhb1xyXG5cdGNvbG9yLnJnYiAqPSB2QW87XHJcblx0XHJcblx0Ly9hcHBseSBsaWdodFxyXG5cdGZsb2F0IGxpZ2h0ID0gbWl4KHZCbG9ja2xpZ2h0LCBtYXgodlN1bmxpZ2h0LCB2QmxvY2tsaWdodCksIHN1bmxpZ2h0U3RyZW5ndGgpO1xyXG5cdGNvbG9yLnJnYiAqPSBtaXgoYW1iaWVudExpZ2h0LCAxLjAsIGxpZ2h0IC8gMTUuMCk7XHJcblx0XHJcblx0Z2xfRnJhZ0NvbG9yID0gY29sb3I7XHJcblx0XHJcblx0JHtTaGFkZXJDaHVuay5sb2dkZXB0aGJ1Zl9mcmFnbWVudH1cclxufVxyXG5gO1xyXG4iLCIvKlxyXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBCbHVlTWFwLCBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgKE1JVCkuXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgQmx1ZSAoTHVrYXMgUmllZ2VyKSA8aHR0cHM6Ly9ibHVlY29sb3JlZC5kZT5cclxuICogQ29weXJpZ2h0IChjKSBjb250cmlidXRvcnNcclxuICpcclxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSAnU29mdHdhcmUnKSwgdG8gZGVhbFxyXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXHJcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcclxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXHJcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcbiAqXHJcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXHJcbiAqIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG4gKlxyXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgJ0FTIElTJywgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxyXG4gKiBUSEUgU09GVFdBUkUuXHJcbiAqL1xyXG5pbXBvcnQgeyBTaGFkZXJDaHVuayB9IGZyb20gJ3RocmVlJztcclxuXHJcbmV4cG9ydCBjb25zdCBMT1dSRVNfVkVSVEVYX1NIQURFUiA9IGBcclxuI2luY2x1ZGUgPGNvbW1vbj5cclxuJHtTaGFkZXJDaHVuay5sb2dkZXB0aGJ1Zl9wYXJzX3ZlcnRleH1cclxuXHJcbnZhcnlpbmcgdmVjMyB2UG9zaXRpb247XHJcbnZhcnlpbmcgdmVjMyB2V29ybGRQb3NpdGlvbjtcclxudmFyeWluZyB2ZWMzIHZOb3JtYWw7XHJcbnZhcnlpbmcgdmVjMiB2VXY7XHJcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XHJcblxyXG52b2lkIG1haW4oKSB7XHJcblx0dlBvc2l0aW9uID0gcG9zaXRpb247XHJcblx0dldvcmxkUG9zaXRpb24gPSAobW9kZWxNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxKSkueHl6O1xyXG5cdHZOb3JtYWwgPSBub3JtYWw7XHJcblx0dlV2ID0gdXY7XHJcblx0dkNvbG9yID0gY29sb3I7XHJcblx0XHJcblx0Z2xfUG9zaXRpb24gPSBcclxuXHRcdHByb2plY3Rpb25NYXRyaXggKlxyXG5cdFx0dmlld01hdHJpeCAqXHJcblx0XHRtb2RlbE1hdHJpeCAqXHJcblx0XHR2ZWM0KHBvc2l0aW9uLCAxKTtcclxuXHRcdFxyXG5cdCR7U2hhZGVyQ2h1bmsubG9nZGVwdGhidWZfdmVydGV4fVxyXG59XHJcbmA7XHJcbiIsIi8qXHJcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIEJsdWVNYXAsIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZSAoTUlUKS5cclxuICpcclxuICogQ29weXJpZ2h0IChjKSBCbHVlIChMdWthcyBSaWVnZXIpIDxodHRwczovL2JsdWVjb2xvcmVkLmRlPlxyXG4gKiBDb3B5cmlnaHQgKGMpIGNvbnRyaWJ1dG9yc1xyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlICdTb2Z0d2FyZScpLCB0byBkZWFsXHJcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuICpcclxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cclxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbiAqXHJcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCAnQVMgSVMnLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXHJcbiAqIFRIRSBTT0ZUV0FSRS5cclxuICovXHJcbmltcG9ydCB7IFNoYWRlckNodW5rIH0gZnJvbSAndGhyZWUnO1xyXG5cclxuZXhwb3J0IGNvbnN0IExPV1JFU19GUkFHTUVOVF9TSEFERVIgPSBgXHJcbiR7U2hhZGVyQ2h1bmsubG9nZGVwdGhidWZfcGFyc19mcmFnbWVudH1cclxuXHJcbnN0cnVjdCBUaWxlTWFwIHtcclxuXHRzYW1wbGVyMkQgbWFwO1xyXG5cdGZsb2F0IHNpemU7XHJcblx0dmVjMiBzY2FsZTtcclxuXHR2ZWMyIHRyYW5zbGF0ZTtcclxuXHR2ZWMyIHBvczsgXHJcbn07XHJcblxyXG51bmlmb3JtIGZsb2F0IHN1bmxpZ2h0U3RyZW5ndGg7XHJcbnVuaWZvcm0gZmxvYXQgYW1iaWVudExpZ2h0O1xyXG51bmlmb3JtIFRpbGVNYXAgaGlyZXNUaWxlTWFwO1xyXG5cclxudmFyeWluZyB2ZWMzIHZQb3NpdGlvbjtcclxudmFyeWluZyB2ZWMzIHZXb3JsZFBvc2l0aW9uO1xyXG52YXJ5aW5nIHZlYzMgdk5vcm1hbDtcclxudmFyeWluZyB2ZWMyIHZVdjtcclxudmFyeWluZyB2ZWMzIHZDb2xvcjtcclxuXHJcbnZvaWQgbWFpbigpIHtcclxuXHRmbG9hdCBkZXB0aCA9IGdsX0ZyYWdDb29yZC56IC8gZ2xfRnJhZ0Nvb3JkLnc7XHJcblxyXG5cdC8vZGlzY2FyZCBpZiBoaXJlcyB0aWxlIGlzIGxvYWRlZCBhdCB0aGF0IHBvc2l0aW9uXHJcblx0aWYgKCFpc09ydGhvZ3JhcGhpYyAmJiBkZXB0aCA8IDE5MDAuMCAmJiB0ZXh0dXJlKGhpcmVzVGlsZU1hcC5tYXAsICgodldvcmxkUG9zaXRpb24ueHogLSBoaXJlc1RpbGVNYXAudHJhbnNsYXRlKSAvIGhpcmVzVGlsZU1hcC5zY2FsZSAtIGhpcmVzVGlsZU1hcC5wb3MpIC8gaGlyZXNUaWxlTWFwLnNpemUgKyAwLjUpLnIgPj0gMS4wKSBkaXNjYXJkO1xyXG5cdFxyXG5cdHZlYzQgY29sb3IgPSB2ZWM0KHZDb2xvciwgMS4wKTtcclxuXHJcblx0ZmxvYXQgZGlmZiA9IHNxcnQobWF4KGRvdCh2Tm9ybWFsLCB2ZWMzKDAuMzYzNywgMC43Mjc0LCAwLjU4MTkpKSwgMC4wKSkgKiAwLjQgKyAwLjY7XHJcblx0Y29sb3IgKj0gZGlmZjtcclxuXHJcblx0Y29sb3IgKj0gbWl4KHN1bmxpZ2h0U3RyZW5ndGgsIDEuMCwgYW1iaWVudExpZ2h0KTtcclxuXHJcblx0Z2xfRnJhZ0NvbG9yID0gY29sb3I7XHJcblx0XHJcblx0JHtTaGFkZXJDaHVuay5sb2dkZXB0aGJ1Zl9mcmFnbWVudH1cclxufVxyXG5gO1xyXG4iLCJpbXBvcnQge01hdGhVdGlscywgTWF0cml4NCwgUGVyc3BlY3RpdmVDYW1lcmF9IGZyb20gXCJ0aHJlZVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIENvbWJpbmVkQ2FtZXJhIGV4dGVuZHMgUGVyc3BlY3RpdmVDYW1lcmEge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGZvdiwgYXNwZWN0LCBuZWFyLCBmYXIsIG9ydGhvKSB7XHJcbiAgICAgICAgc3VwZXIoZm92LCBhc3BlY3QsIG5lYXIsIGZhcik7XHJcblxyXG4gICAgICAgIHRoaXMub3J0aG8gPSBvcnRobztcclxuICAgICAgICB0aGlzLmRpc3RhbmNlID0gMTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVQcm9qZWN0aW9uTWF0cml4KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5vcnRvZ3JhcGhpY1Byb2plY3Rpb24pXHJcbiAgICAgICAgICAgIHRoaXMub3J0b2dyYXBoaWNQcm9qZWN0aW9uID0gbmV3IE1hdHJpeDQoKTtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLnBlcnNwZWN0aXZlUHJvamVjdGlvbilcclxuICAgICAgICAgICAgdGhpcy5wZXJzcGVjdGl2ZVByb2plY3Rpb24gPSBuZXcgTWF0cml4NCgpO1xyXG5cclxuICAgICAgICAvL2NvcGllZCBmcm9tIFBlcnNwZWN0aXZlQ2FtZXJhXHJcbiAgICAgICAgY29uc3QgbmVhciA9IHRoaXMubmVhcjtcclxuICAgICAgICBsZXQgdG9wID0gbmVhciAqIE1hdGgudGFuKCBNYXRoVXRpbHMuREVHMlJBRCAqIDAuNSAqIHRoaXMuZm92ICkgLyB0aGlzLnpvb207XHJcbiAgICAgICAgbGV0IGhlaWdodCA9IDIgKiB0b3A7XHJcbiAgICAgICAgbGV0IHdpZHRoID0gdGhpcy5hc3BlY3QgKiBoZWlnaHQ7XHJcbiAgICAgICAgbGV0IGxlZnQgPSAtIDAuNSAqIHdpZHRoO1xyXG4gICAgICAgIGNvbnN0IHZpZXcgPSB0aGlzLnZpZXc7XHJcblxyXG4gICAgICAgIGlmICggdGhpcy52aWV3ICE9PSBudWxsICYmIHRoaXMudmlldy5lbmFibGVkICkge1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZnVsbFdpZHRoID0gdmlldy5mdWxsV2lkdGgsXHJcbiAgICAgICAgICAgICAgICBmdWxsSGVpZ2h0ID0gdmlldy5mdWxsSGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgbGVmdCArPSB2aWV3Lm9mZnNldFggKiB3aWR0aCAvIGZ1bGxXaWR0aDtcclxuICAgICAgICAgICAgdG9wIC09IHZpZXcub2Zmc2V0WSAqIGhlaWdodCAvIGZ1bGxIZWlnaHQ7XHJcbiAgICAgICAgICAgIHdpZHRoICo9IHZpZXcud2lkdGggLyBmdWxsV2lkdGg7XHJcbiAgICAgICAgICAgIGhlaWdodCAqPSB2aWV3LmhlaWdodCAvIGZ1bGxIZWlnaHQ7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgc2tldyA9IHRoaXMuZmlsbU9mZnNldDtcclxuICAgICAgICBpZiAoIHNrZXcgIT09IDAgKSBsZWZ0ICs9IG5lYXIgKiBza2V3IC8gdGhpcy5nZXRGaWxtV2lkdGgoKTtcclxuXHJcbiAgICAgICAgLy8gdGhpcyBwYXJ0IGRpZmZlcmVudCB0byBQZXJzcGVjdGl2ZUNhbWVyYVxyXG4gICAgICAgIGxldCBub3JtYWxpemVkT3J0aG8gPSAtTWF0aC5wb3codGhpcy5vcnRobyAtIDEsIDQpICsgMTtcclxuICAgICAgICBsZXQgb3J0aG9Ub3AgPSB0aGlzLmRpc3RhbmNlICogTWF0aC50YW4oIE1hdGhVdGlscy5ERUcyUkFEICogMC41ICogdGhpcy5mb3YgKSAvIHRoaXMuem9vbTtcclxuICAgICAgICBsZXQgb3J0aG9IZWlnaHQgPSAyICogb3J0aG9Ub3A7XHJcbiAgICAgICAgbGV0IG9ydGhvV2lkdGggPSB0aGlzLmFzcGVjdCAqIG9ydGhvSGVpZ2h0O1xyXG4gICAgICAgIGxldCBvcnRob0xlZnQgPSAtIDAuNSAqIG9ydGhvV2lkdGg7XHJcblxyXG4gICAgICAgIHRoaXMucGVyc3BlY3RpdmVQcm9qZWN0aW9uLm1ha2VQZXJzcGVjdGl2ZSggbGVmdCwgbGVmdCArIHdpZHRoLCB0b3AsIHRvcCAtIGhlaWdodCwgbmVhciwgdGhpcy5mYXIgKTtcclxuICAgICAgICB0aGlzLm9ydG9ncmFwaGljUHJvamVjdGlvbi5tYWtlT3J0aG9ncmFwaGljKCBvcnRob0xlZnQsIG9ydGhvTGVmdCArIG9ydGhvV2lkdGgsIG9ydGhvVG9wLCBvcnRob1RvcCAtIG9ydGhvSGVpZ2h0LCBuZWFyLCB0aGlzLmZhciApO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE2OyBpKyspe1xyXG4gICAgICAgICAgICB0aGlzLnByb2plY3Rpb25NYXRyaXguZWxlbWVudHNbaV0gPSAodGhpcy5wZXJzcGVjdGl2ZVByb2plY3Rpb24uZWxlbWVudHNbaV0gKiAoMSAtIG5vcm1hbGl6ZWRPcnRobykpICsgKHRoaXMub3J0b2dyYXBoaWNQcm9qZWN0aW9uLmVsZW1lbnRzW2ldICogbm9ybWFsaXplZE9ydGhvKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gdG8gaGVyZVxyXG5cclxuICAgICAgICB0aGlzLnByb2plY3Rpb25NYXRyaXhJbnZlcnNlLmNvcHkoIHRoaXMucHJvamVjdGlvbk1hdHJpeCApLmludmVydCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBnZXQgaXNQZXJzcGVjdGl2ZUNhbWVyYSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5vcnRobyA8IDE7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGlzT3J0aG9ncmFwaGljQ2FtZXJhKCkge1xyXG4gICAgICAgIHJldHVybiAhdGhpcy5pc1BlcnNwZWN0aXZlQ2FtZXJhO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCB0eXBlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmlzUGVyc3BlY3RpdmVDYW1lcmEgPyAnUGVyc3BlY3RpdmVDYW1lcmEnIDogJ09ydGhvZ3JhcGhpY0NhbWVyYSc7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IHR5cGUodHlwZSkge1xyXG4gICAgICAgIC8vaWdub3JlXHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHtcclxuXHRQZXJzcGVjdGl2ZUNhbWVyYSxcclxuXHRXZWJHTFJlbmRlcmVyLFxyXG5cdFZlY3RvcjIsIFJheWNhc3RlciwgTGF5ZXJzXHJcbn0gZnJvbSBcInRocmVlXCI7XHJcbmltcG9ydCB7TWFwfSBmcm9tIFwiLi9tYXAvTWFwXCI7XHJcbmltcG9ydCB7U2t5Ym94U2NlbmV9IGZyb20gXCIuL3NreWJveC9Ta3lib3hTY2VuZVwiO1xyXG5pbXBvcnQge0NvbnRyb2xzTWFuYWdlcn0gZnJvbSBcIi4vY29udHJvbHMvQ29udHJvbHNNYW5hZ2VyXCI7XHJcbmltcG9ydCB7TWFwQ29udHJvbHN9IGZyb20gXCIuL2NvbnRyb2xzL01hcENvbnRyb2xzXCI7XHJcbmltcG9ydCBTdGF0cyBmcm9tIFwiLi91dGlsL1N0YXRzXCI7XHJcbmltcG9ydCB7YWxlcnQsIGRpc3BhdGNoRXZlbnQsIGVsZW1lbnRPZmZzZXQsIGh0bWxUb0VsZW1lbnR9IGZyb20gXCIuL3V0aWwvVXRpbHNcIjtcclxuaW1wb3J0IHtUaWxlTWFuYWdlcn0gZnJvbSBcIi4vbWFwL1RpbGVNYW5hZ2VyXCI7XHJcbmltcG9ydCB7SElSRVNfVkVSVEVYX1NIQURFUn0gZnJvbSBcIi4vbWFwL2hpcmVzL0hpcmVzVmVydGV4U2hhZGVyXCI7XHJcbmltcG9ydCB7SElSRVNfRlJBR01FTlRfU0hBREVSfSBmcm9tIFwiLi9tYXAvaGlyZXMvSGlyZXNGcmFnbWVudFNoYWRlclwiO1xyXG5pbXBvcnQge0xPV1JFU19WRVJURVhfU0hBREVSfSBmcm9tIFwiLi9tYXAvbG93cmVzL0xvd3Jlc1ZlcnRleFNoYWRlclwiO1xyXG5pbXBvcnQge0xPV1JFU19GUkFHTUVOVF9TSEFERVJ9IGZyb20gXCIuL21hcC9sb3dyZXMvTG93cmVzRnJhZ21lbnRTaGFkZXJcIjtcclxuaW1wb3J0IHtDb21iaW5lZENhbWVyYX0gZnJvbSBcIi4vdXRpbC9Db21iaW5lZENhbWVyYVwiO1xyXG5pbXBvcnQge0NTUzJEUmVuZGVyZXJ9IGZyb20gXCIuL3V0aWwvQ1NTMkRSZW5kZXJlclwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIE1hcFZpZXdlciB7XHJcblxyXG5cdHN0YXRpYyBJbnRlcmFjdGlvblR5cGUgPSB7XHJcblx0XHRMRUZUQ0xJQ0s6IDAsXHJcblx0XHRSSUdIVENMSUNLOiAxXHJcblx0fTtcclxuXHJcblx0Y29uc3RydWN0b3IoZWxlbWVudCwgZGF0YVVybCA9IFwiZGF0YS9cIiwgbGl2ZUFwaVVybCA9IFwibGl2ZS9cIiwgZXZlbnRzID0gZWxlbWVudCkge1xyXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KCB0aGlzLCAnaXNNYXBWaWV3ZXInLCB7IHZhbHVlOiB0cnVlIH0gKTtcclxuXHJcblx0XHR0aGlzLnJvb3RFbGVtZW50ID0gZWxlbWVudDtcclxuXHRcdHRoaXMuZXZlbnRzID0gZXZlbnRzO1xyXG5cclxuXHRcdHRoaXMuZGF0YVVybCA9IGRhdGFVcmw7XHJcblx0XHR0aGlzLmxpdmVBcGlVcmwgPSBsaXZlQXBpVXJsO1xyXG5cclxuXHRcdHRoaXMuc3RhdHMgPSBuZXcgU3RhdHMoKTtcclxuXHRcdHRoaXMuc3RhdHMuaGlkZSgpO1xyXG5cclxuXHRcdHRoaXMuc3VwZXJTYW1wbGluZ1ZhbHVlID0gMTtcclxuXHRcdHRoaXMubG9hZGVkQ2VudGVyID0gbmV3IFZlY3RvcjIoMCwgMCk7XHJcblx0XHR0aGlzLmxvYWRlZEhpcmVzVmlld0Rpc3RhbmNlID0gMjAwO1xyXG5cdFx0dGhpcy5sb2FkZWRMb3dyZXNWaWV3RGlzdGFuY2UgPSAyMDAwO1xyXG5cclxuXHRcdC8vIHVuaWZvcm1zXHJcblx0XHR0aGlzLnVuaWZvcm1zID0ge1xyXG5cdFx0XHRzdW5saWdodFN0cmVuZ3RoOiB7IHZhbHVlOiAxIH0sXHJcblx0XHRcdGFtYmllbnRMaWdodDogeyB2YWx1ZTogMCB9LFxyXG5cdFx0XHRoaXJlc1RpbGVNYXA6IHtcclxuXHRcdFx0XHR2YWx1ZToge1xyXG5cdFx0XHRcdFx0bWFwOiBudWxsLFxyXG5cdFx0XHRcdFx0c2l6ZTogVGlsZU1hbmFnZXIudGlsZU1hcFNpemUsXHJcblx0XHRcdFx0XHRzY2FsZTogbmV3IFZlY3RvcjIoMSwgMSksXHJcblx0XHRcdFx0XHR0cmFuc2xhdGU6IG5ldyBWZWN0b3IyKCksXHJcblx0XHRcdFx0XHRwb3M6IG5ldyBWZWN0b3IyKCksXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cclxuXHRcdC8vIHJlbmRlcmVyXHJcblx0XHR0aGlzLnJlbmRlcmVyID0gbmV3IFdlYkdMUmVuZGVyZXIoe1xyXG5cdFx0XHRhbnRpYWxpYXM6IHRydWUsXHJcblx0XHRcdHNvcnRPYmplY3RzOiB0cnVlLFxyXG5cdFx0XHRwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IHRydWUsXHJcblx0XHRcdGxvZ2FyaXRobWljRGVwdGhCdWZmZXI6IHRydWUsXHJcblx0XHR9KTtcclxuXHRcdHRoaXMucmVuZGVyZXIuYXV0b0NsZWFyID0gZmFsc2U7XHJcblx0XHR0aGlzLnJlbmRlcmVyLnVuaWZvcm1zID0gdGhpcy51bmlmb3JtcztcclxuXHJcblx0XHQvLyBDU1MyRCByZW5kZXJlclxyXG5cdFx0dGhpcy5jc3MyZFJlbmRlcmVyID0gbmV3IENTUzJEUmVuZGVyZXIoKTtcclxuXHJcblx0XHR0aGlzLnNreWJveFNjZW5lID0gbmV3IFNreWJveFNjZW5lKCk7XHJcblxyXG5cdFx0dGhpcy5jYW1lcmEgPSBuZXcgQ29tYmluZWRDYW1lcmEoNzUsIDEsIDAuMSwgMTAwMDAsIDApO1xyXG5cdFx0dGhpcy5za3lib3hDYW1lcmEgPSBuZXcgUGVyc3BlY3RpdmVDYW1lcmEoNzUsIDEsIDAuMSwgMTAwMDApO1xyXG5cclxuXHRcdHRoaXMuaGFtbWVyID0gbmV3IEhhbW1lci5NYW5hZ2VyKHRoaXMucm9vdEVsZW1lbnQpO1xyXG5cdFx0dGhpcy5pbml0aWFsaXplSGFtbWVyKCk7XHJcblxyXG5cdFx0dGhpcy5jb250cm9sc01hbmFnZXIgPSBuZXcgQ29udHJvbHNNYW5hZ2VyKHRoaXMsIHRoaXMuY2FtZXJhKTtcclxuXHRcdHRoaXMuY29udHJvbHNNYW5hZ2VyLmNvbnRyb2xzID0gbmV3IE1hcENvbnRyb2xzKHRoaXMucm9vdEVsZW1lbnQsIHRoaXMuaGFtbWVyLCB0aGlzLmV2ZW50cyk7XHJcblxyXG5cdFx0dGhpcy5yYXljYXN0ZXIgPSBuZXcgUmF5Y2FzdGVyKCk7XHJcblx0XHR0aGlzLnJheWNhc3Rlci5sYXllcnMuZW5hYmxlQWxsKCk7XHJcblx0XHR0aGlzLnJheWNhc3Rlci5wYXJhbXMuTGluZTIgPSB7dGhyZXNob2xkOiAyMH1cclxuXHJcblx0XHR0aGlzLm1hcCA9IG51bGw7XHJcblxyXG5cdFx0dGhpcy5sYXN0RnJhbWUgPSAwO1xyXG5cclxuXHRcdC8vIGluaXRpYWxpemVcclxuXHRcdHRoaXMuaW5pdGlhbGl6ZVJvb3RFbGVtZW50KCk7XHJcblxyXG5cdFx0Ly8gaGFuZGxlIHNvbWUgZXZlbnRzXHJcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCB0aGlzLmhhbmRsZUNvbnRhaW5lclJlc2l6ZSk7XHJcblxyXG5cdFx0Ly8gc3RhcnQgcmVuZGVyLWxvb3BcclxuXHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnJlbmRlckxvb3ApO1xyXG5cdH1cclxuXHJcblx0aW5pdGlhbGl6ZUhhbW1lcigpIHtcclxuXHRcdGxldCB0b3VjaFRhcCA9IG5ldyBIYW1tZXIuVGFwKHsgZXZlbnQ6ICd0YXAnLCBwb2ludGVyczogMSwgdGFwczogMSwgdGhyZXNob2xkOiAyIH0pO1xyXG5cdFx0bGV0IHRvdWNoTW92ZSA9IG5ldyBIYW1tZXIuUGFuKHsgZXZlbnQ6ICdtb3ZlJywgZGlyZWN0aW9uOiBIYW1tZXIuRElSRUNUSU9OX0FMTCwgdGhyZXNob2xkOiAwIH0pO1xyXG5cdFx0bGV0IHRvdWNoVGlsdCA9ICBuZXcgSGFtbWVyLlBhbih7IGV2ZW50OiAndGlsdCcsIGRpcmVjdGlvbjogSGFtbWVyLkRJUkVDVElPTl9WRVJUSUNBTCwgcG9pbnRlcnM6IDIsIHRocmVzaG9sZDogMCB9KTtcclxuXHRcdGxldCB0b3VjaFJvdGF0ZSA9IG5ldyBIYW1tZXIuUm90YXRlKHsgZXZlbnQ6ICdyb3RhdGUnLCBwb2ludGVyczogMiwgdGhyZXNob2xkOiAxMCB9KTtcclxuXHRcdGxldCB0b3VjaFpvb20gPSBuZXcgSGFtbWVyLlBpbmNoKHsgZXZlbnQ6ICd6b29tJywgcG9pbnRlcnM6IDIsIHRocmVzaG9sZDogMCB9KTtcclxuXHJcblx0XHR0b3VjaFRpbHQucmVjb2duaXplV2l0aCh0b3VjaFJvdGF0ZSk7XHJcblx0XHR0b3VjaFRpbHQucmVjb2duaXplV2l0aCh0b3VjaFpvb20pO1xyXG5cdFx0dG91Y2hSb3RhdGUucmVjb2duaXplV2l0aCh0b3VjaFpvb20pO1xyXG5cclxuXHRcdHRoaXMuaGFtbWVyLmFkZCh0b3VjaFRhcCk7XHJcblx0XHR0aGlzLmhhbW1lci5hZGQodG91Y2hNb3ZlKTtcclxuXHRcdHRoaXMuaGFtbWVyLmFkZCh0b3VjaFRpbHQpO1xyXG5cdFx0dGhpcy5oYW1tZXIuYWRkKHRvdWNoUm90YXRlKTtcclxuXHRcdHRoaXMuaGFtbWVyLmFkZCh0b3VjaFpvb20pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSW5pdGlhbGl6ZXMgdGhlIHJvb3QtZWxlbWVudFxyXG5cdCAqL1xyXG5cdGluaXRpYWxpemVSb290RWxlbWVudCgpIHtcclxuXHRcdHRoaXMucm9vdEVsZW1lbnQuaW5uZXJIVE1MID0gXCJcIjtcclxuXHJcblx0XHRsZXQgb3V0ZXJEaXYgPSBodG1sVG9FbGVtZW50KGA8ZGl2IHN0eWxlPVwicG9zaXRpb246IHJlbGF0aXZlOyB3aWR0aDogMTAwJTsgaGVpZ2h0OiAxMDAlOyBvdmVyZmxvdzogaGlkZGVuO1wiPjwvZGl2PmApO1xyXG5cdFx0dGhpcy5yb290RWxlbWVudC5hcHBlbmRDaGlsZChvdXRlckRpdilcclxuXHRcdC8qdGhpcy5yb290RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcclxuXHRcdFx0bGV0IHJvb3RPZmZzZXQgPSBlbGVtZW50T2Zmc2V0KHRoaXMucm9vdEVsZW1lbnQpO1xyXG5cdFx0XHR0aGlzLmhhbmRsZU1hcEludGVyYWN0aW9uKG5ldyBWZWN0b3IyKFxyXG5cdFx0XHRcdCgoZXZlbnQucGFnZVggLSByb290T2Zmc2V0LnRvcCkgLyB0aGlzLnJvb3RFbGVtZW50LmNsaWVudFdpZHRoKSAqIDIgLSAxLFxyXG5cdFx0XHRcdC0oKGV2ZW50LnBhZ2VZIC0gcm9vdE9mZnNldC5sZWZ0KSAvIHRoaXMucm9vdEVsZW1lbnQuY2xpZW50SGVpZ2h0KSAqIDIgKyAxXHJcblx0XHRcdCkpO1xyXG5cdFx0fSk7Ki9cclxuXHRcdHRoaXMuaGFtbWVyLm9uKCd0YXAnLCBldmVudCA9PiB7XHJcblx0XHRcdGxldCByb290T2Zmc2V0ID0gZWxlbWVudE9mZnNldCh0aGlzLnJvb3RFbGVtZW50KTtcclxuXHRcdFx0dGhpcy5oYW5kbGVNYXBJbnRlcmFjdGlvbihuZXcgVmVjdG9yMihcclxuXHRcdFx0XHQoKGV2ZW50LmNlbnRlci54IC0gcm9vdE9mZnNldC50b3ApIC8gdGhpcy5yb290RWxlbWVudC5jbGllbnRXaWR0aCkgKiAyIC0gMSxcclxuXHRcdFx0XHQtKChldmVudC5jZW50ZXIueSAtIHJvb3RPZmZzZXQubGVmdCkgLyB0aGlzLnJvb3RFbGVtZW50LmNsaWVudEhlaWdodCkgKiAyICsgMVxyXG5cdFx0XHQpKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIDNkLWNhbnZhc1xyXG5cdFx0b3V0ZXJEaXYuYXBwZW5kQ2hpbGQodGhpcy5yZW5kZXJlci5kb21FbGVtZW50KTtcclxuXHJcblx0XHQvLyBodG1sLW1hcmtlcnNcclxuXHRcdHRoaXMuY3NzMmRSZW5kZXJlci5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuXHRcdHRoaXMuY3NzMmRSZW5kZXJlci5kb21FbGVtZW50LnN0eWxlLnRvcCA9ICcwJztcclxuXHRcdHRoaXMuY3NzMmRSZW5kZXJlci5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSAnMCc7XHJcblx0XHR0aGlzLmNzczJkUmVuZGVyZXIuZG9tRWxlbWVudC5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xyXG5cdFx0b3V0ZXJEaXYuYXBwZW5kQ2hpbGQodGhpcy5jc3MyZFJlbmRlcmVyLmRvbUVsZW1lbnQpO1xyXG5cclxuXHRcdC8vIHBlcmZvcm1hbmNlIG1vbml0b3JcclxuXHRcdG91dGVyRGl2LmFwcGVuZENoaWxkKHRoaXMuc3RhdHMuZG9tKTtcclxuXHJcblx0XHR0aGlzLmhhbmRsZUNvbnRhaW5lclJlc2l6ZSgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVXBkYXRlcyB0aGUgcmVuZGVyLXJlc29sdXRpb24gYW5kIGFzcGVjdCByYXRpbyBiYXNlZCBvbiB0aGUgc2l6ZSBvZiB0aGUgcm9vdC1lbGVtZW50XHJcblx0ICovXHJcblx0aGFuZGxlQ29udGFpbmVyUmVzaXplID0gKCkgPT4ge1xyXG5cdFx0dGhpcy5yZW5kZXJlci5zZXRTaXplKHRoaXMucm9vdEVsZW1lbnQuY2xpZW50V2lkdGgsIHRoaXMucm9vdEVsZW1lbnQuY2xpZW50SGVpZ2h0KTtcclxuXHRcdHRoaXMucmVuZGVyZXIuc2V0UGl4ZWxSYXRpbyh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyAqIHRoaXMuc3VwZXJTYW1wbGluZ1ZhbHVlKTtcclxuXHJcblx0XHR0aGlzLmNzczJkUmVuZGVyZXIuc2V0U2l6ZSh0aGlzLnJvb3RFbGVtZW50LmNsaWVudFdpZHRoLCB0aGlzLnJvb3RFbGVtZW50LmNsaWVudEhlaWdodCk7XHJcblxyXG5cdFx0dGhpcy5jYW1lcmEuYXNwZWN0ID0gdGhpcy5yb290RWxlbWVudC5jbGllbnRXaWR0aCAvIHRoaXMucm9vdEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xyXG5cdFx0dGhpcy5jYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xyXG5cdH07XHJcblxyXG5cdGhhbmRsZU1hcEludGVyYWN0aW9uKHNjcmVlblBvcywgaW50ZXJhY3Rpb25UeXBlID0gTWFwVmlld2VyLkludGVyYWN0aW9uVHlwZS5MRUZUQ0xJQ0spIHtcclxuXHRcdGlmICh0aGlzLm1hcCAmJiB0aGlzLm1hcC5pc0xvYWRlZCl7XHJcblx0XHRcdHRoaXMucmF5Y2FzdGVyLnNldEZyb21DYW1lcmEoc2NyZWVuUG9zLCB0aGlzLmNhbWVyYSk7XHJcblxyXG5cdFx0XHRsZXQgbG93cmVzTGF5ZXIgPSBuZXcgTGF5ZXJzKCk7XHJcblx0XHRcdGxvd3Jlc0xheWVyLnNldCgyKTtcclxuXHJcblx0XHRcdC8vIGNoZWNrIG1hcmtlciBpbnRlcmFjdGlvbnNcclxuXHRcdFx0bGV0IGludGVyc2VjdHMgPSB0aGlzLnJheWNhc3Rlci5pbnRlcnNlY3RPYmplY3RzKFt0aGlzLm1hcC5zY2VuZSwgdGhpcy5tYXAubWFya2VyTWFuYWdlci5vYmplY3RNYXJrZXJTY2VuZV0sIHRydWUpO1xyXG5cdFx0XHRsZXQgY292ZXJlZCA9IGZhbHNlO1xyXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGludGVyc2VjdHMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRpZiAoaW50ZXJzZWN0c1swXS5vYmplY3Qpe1xyXG5cdFx0XHRcdFx0bGV0IG1hcmtlciA9IGludGVyc2VjdHNbaV0ub2JqZWN0Lm1hcmtlcjtcclxuXHRcdFx0XHRcdGlmIChtYXJrZXIgJiYgbWFya2VyLl9vcGFjaXR5ID4gMCAmJiAoIWNvdmVyZWQgfHwgIW1hcmtlci5kZXB0aFRlc3QpKSB7XHJcblx0XHRcdFx0XHRcdG1hcmtlci5vbkNsaWNrKGludGVyc2VjdHNbaV0ucG9pbnRPbkxpbmUgfHwgaW50ZXJzZWN0c1tpXS5wb2ludCk7XHJcblx0XHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoIWludGVyc2VjdHNbaV0ub2JqZWN0LmxheWVycy50ZXN0KGxvd3Jlc0xheWVyKSkge1xyXG5cdFx0XHRcdFx0XHRjb3ZlcmVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHR1cGRhdGVMb2FkZWRNYXBBcmVhID0gKCkgPT4ge1xyXG5cdFx0aWYgKCF0aGlzLm1hcCkgcmV0dXJuO1xyXG5cclxuXHRcdHRoaXMubWFwLmxvYWRNYXBBcmVhKHRoaXMubG9hZGVkQ2VudGVyLngsIHRoaXMubG9hZGVkQ2VudGVyLnksIHRoaXMubG9hZGVkSGlyZXNWaWV3RGlzdGFuY2UsIHRoaXMubG9hZGVkTG93cmVzVmlld0Rpc3RhbmNlKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSByZW5kZXItbG9vcCB0byB1cGRhdGUgYW5kIHBvc3NpYmx5IHJlbmRlciBhIG5ldyBmcmFtZS5cclxuXHQgKiBAcGFyYW0gbm93IHRoZSBjdXJyZW50IHRpbWUgaW4gbWlsbGlzZWNvbmRzXHJcblx0ICovXHJcblx0cmVuZGVyTG9vcCA9IChub3cpID0+IHtcclxuXHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnJlbmRlckxvb3ApO1xyXG5cclxuXHRcdC8vIGNhbGN1bGF0ZSBkZWx0YSB0aW1lXHJcblx0XHRpZiAodGhpcy5sYXN0RnJhbWUgPD0gMCkgeyB0aGlzLmxhc3RGcmFtZSA9IG5vdzsgfVxyXG5cdFx0bGV0IGRlbHRhID0gbm93IC0gdGhpcy5sYXN0RnJhbWU7XHJcblx0XHR0aGlzLmxhc3RGcmFtZSA9IG5vdztcclxuXHJcblx0XHQvLyB1cGRhdGUgc3RhdHNcclxuXHRcdHRoaXMuc3RhdHMuYmVnaW4oKTtcclxuXHJcblx0XHQvLyB1cGRhdGUgY29udHJvbHNcclxuXHRcdGlmICh0aGlzLm1hcCAhPSBudWxsKSB7XHJcblx0XHRcdHRoaXMuY29udHJvbHNNYW5hZ2VyLnVwZGF0ZShkZWx0YSwgdGhpcy5tYXApO1xyXG5cdFx0XHR0aGlzLmNvbnRyb2xzTWFuYWdlci51cGRhdGVDYW1lcmEoKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyByZW5kZXJcclxuXHRcdHRoaXMucmVuZGVyKGRlbHRhKTtcclxuXHJcblx0XHQvLyB1cGRhdGUgc3RhdHNcclxuXHRcdHRoaXMuc3RhdHMudXBkYXRlKCk7XHJcblx0fTtcclxuXHJcblx0LyoqXHJcblx0ICogUmVuZGVycyBhIGZyYW1lXHJcblx0ICovXHJcblx0cmVuZGVyKGRlbHRhKSB7XHJcblx0XHRkaXNwYXRjaEV2ZW50KHRoaXMuZXZlbnRzLCBcImJsdWVtYXBSZW5kZXJGcmFtZVwiLCB7XHJcblx0XHRcdGRlbHRhOiBkZWx0YSxcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vcHJlcGFyZSBjYW1lcmFcclxuXHRcdHRoaXMuY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcclxuXHRcdHRoaXMuc2t5Ym94Q2FtZXJhLnJvdGF0aW9uLmNvcHkodGhpcy5jYW1lcmEucm90YXRpb24pO1xyXG5cdFx0dGhpcy5za3lib3hDYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xyXG5cclxuXHRcdC8vcmVuZGVyXHJcblx0XHR0aGlzLnJlbmRlcmVyLmNsZWFyKCk7XHJcblxyXG5cdFx0dGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5za3lib3hTY2VuZSwgdGhpcy5za3lib3hDYW1lcmEpO1xyXG5cdFx0dGhpcy5yZW5kZXJlci5jbGVhckRlcHRoKCk7XHJcblxyXG5cdFx0LypcclxuXHRcdExheWVyczpcclxuXHRcdDAgLSBhbHdheXMgdmlzaWJsZSBvYmplY3RzXHJcblx0XHQxIC0gaGlyZXMgbGF5ZXJcclxuXHRcdDIgLSBsb3dyZXMgbGF5ZXJcclxuXHRcdCovXHJcblxyXG5cdFx0aWYgKHRoaXMubWFwICYmIHRoaXMubWFwLmlzTG9hZGVkKSB7XHJcblx0XHRcdC8vdXBkYXRlIHVuaWZvcm1zXHJcblx0XHRcdHRoaXMudW5pZm9ybXMuaGlyZXNUaWxlTWFwLnZhbHVlLnBvcy5jb3B5KHRoaXMubWFwLmhpcmVzVGlsZU1hbmFnZXIuY2VudGVyVGlsZSk7XHJcblxyXG5cdFx0XHR0aGlzLmNhbWVyYS5sYXllcnMuc2V0KDIpO1xyXG5cdFx0XHR0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLm1hcC5zY2VuZSwgdGhpcy5jYW1lcmEpO1xyXG5cdFx0XHR0aGlzLnJlbmRlcmVyLmNsZWFyRGVwdGgoKTtcclxuXHRcdFx0dGhpcy5jYW1lcmEubGF5ZXJzLnNldCgwKTtcclxuXHRcdFx0aWYgKHRoaXMuY29udHJvbHNNYW5hZ2VyLmRpc3RhbmNlIDwgMjAwMCkgdGhpcy5jYW1lcmEubGF5ZXJzLmVuYWJsZSgxKTtcclxuXHRcdFx0dGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5tYXAuc2NlbmUsIHRoaXMuY2FtZXJhKTtcclxuXHRcdFx0dGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5tYXAubWFya2VyTWFuYWdlci5vYmplY3RNYXJrZXJTY2VuZSwgdGhpcy5jYW1lcmEpO1xyXG5cclxuXHRcdFx0dGhpcy5jc3MyZFJlbmRlcmVyLnJlbmRlcih0aGlzLm1hcC5tYXJrZXJNYW5hZ2VyLmVsZW1lbnRNYXJrZXJTY2VuZSwgdGhpcy5jYW1lcmEpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2hhbmdlcyAvIFNldHMgdGhlIG1hcCB0aGF0IHdpbGwgYmUgbG9hZGVkIGFuZCBkaXNwbGF5ZWRcclxuXHQgKiBAcGFyYW0gbWFwXHJcblx0ICovXHJcblx0c2V0TWFwKG1hcCA9IG51bGwpIHtcclxuXHRcdGlmICh0aGlzLm1hcCAmJiB0aGlzLm1hcC5pc01hcCkgdGhpcy5tYXAudW5sb2FkKCk7XHJcblxyXG5cdFx0dGhpcy5tYXAgPSBtYXA7XHJcblxyXG5cdFx0aWYgKHRoaXMubWFwICYmIHRoaXMubWFwLmlzTWFwKSB7XHJcblx0XHRcdHJldHVybiBtYXAubG9hZChISVJFU19WRVJURVhfU0hBREVSLCBISVJFU19GUkFHTUVOVF9TSEFERVIsIExPV1JFU19WRVJURVhfU0hBREVSLCBMT1dSRVNfRlJBR01FTlRfU0hBREVSLCB0aGlzLnVuaWZvcm1zKVxyXG5cdFx0XHRcdC50aGVuKCgpID0+IHtcclxuXHRcdFx0XHRcdHRoaXMuc2t5Ym94U2NlbmUuYW1iaWVudExpZ2h0ID0gbWFwLmFtYmllbnRMaWdodDtcclxuXHRcdFx0XHRcdHRoaXMuc2t5Ym94U2NlbmUuc2t5Q29sb3IgPSBtYXAuc2t5Q29sb3I7XHJcblxyXG5cdFx0XHRcdFx0dGhpcy51bmlmb3Jtcy5hbWJpZW50TGlnaHQudmFsdWUgPSBtYXAuYW1iaWVudExpZ2h0O1xyXG5cdFx0XHRcdFx0dGhpcy51bmlmb3Jtcy5oaXJlc1RpbGVNYXAudmFsdWUubWFwID0gbWFwLmhpcmVzVGlsZU1hbmFnZXIudGlsZU1hcC50ZXh0dXJlO1xyXG5cdFx0XHRcdFx0dGhpcy51bmlmb3Jtcy5oaXJlc1RpbGVNYXAudmFsdWUuc2NhbGUuc2V0KG1hcC5oaXJlcy50aWxlU2l6ZS54LCBtYXAuaGlyZXMudGlsZVNpemUueik7XHJcblx0XHRcdFx0XHR0aGlzLnVuaWZvcm1zLmhpcmVzVGlsZU1hcC52YWx1ZS50cmFuc2xhdGUuc2V0KG1hcC5oaXJlcy50cmFuc2xhdGUueCwgbWFwLmhpcmVzLnRyYW5zbGF0ZS56KTtcclxuXHJcblx0XHRcdFx0XHRzZXRUaW1lb3V0KHRoaXMudXBkYXRlTG9hZGVkTWFwQXJlYSk7XHJcblxyXG5cdFx0XHRcdFx0ZGlzcGF0Y2hFdmVudCh0aGlzLmV2ZW50cywgXCJibHVlbWFwTWFwQ2hhbmdlZFwiLCB7XHJcblx0XHRcdFx0XHRcdG1hcDogbWFwXHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHRcdC5jYXRjaChlcnJvciA9PiB7XHJcblx0XHRcdFx0XHRhbGVydCh0aGlzLmV2ZW50cywgZXJyb3IsIFwiZXJyb3JcIik7XHJcblx0XHRcdFx0fSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRsb2FkTWFwQXJlYShjZW50ZXJYLCBjZW50ZXJaLCBoaXJlc1ZpZXdEaXN0YW5jZSA9IC0xLCBsb3dyZXNWaWV3RGlzdGFuY2UgPSAtMSkge1xyXG5cdFx0dGhpcy5sb2FkZWRDZW50ZXIuc2V0KGNlbnRlclgsIGNlbnRlclopO1xyXG5cdFx0aWYgKGhpcmVzVmlld0Rpc3RhbmNlID49IDApIHRoaXMubG9hZGVkSGlyZXNWaWV3RGlzdGFuY2UgPSBoaXJlc1ZpZXdEaXN0YW5jZTtcclxuXHRcdGlmIChsb3dyZXNWaWV3RGlzdGFuY2UgPj0gMCkgdGhpcy5sb2FkZWRMb3dyZXNWaWV3RGlzdGFuY2UgPSBsb3dyZXNWaWV3RGlzdGFuY2U7XHJcblxyXG5cdFx0dGhpcy51cGRhdGVMb2FkZWRNYXBBcmVhKCk7XHJcblx0fVxyXG5cclxuXHRnZXQgc3VwZXJTYW1wbGluZygpIHtcclxuXHRcdHJldHVybiB0aGlzLnN1cGVyU2FtcGxpbmdWYWx1ZTtcclxuXHR9XHJcblxyXG5cdHNldCBzdXBlclNhbXBsaW5nKHZhbHVlKSB7XHJcblx0XHR0aGlzLnN1cGVyU2FtcGxpbmdWYWx1ZSA9IHZhbHVlO1xyXG5cdFx0dGhpcy5oYW5kbGVDb250YWluZXJSZXNpemUoKTtcclxuXHR9XHJcblxyXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cdC8qKlxyXG5cdCAqIEFwcGxpZXMgYSBsb2FkZWQgc2V0dGluZ3Mtb2JqZWN0IChzZXR0aW5ncy5qc29uKVxyXG5cdCAqIEBwYXJhbSBzZXR0aW5nc1xyXG5cdCAqL1xyXG5cdGFwcGx5U2V0dGluZ3Moc2V0dGluZ3MpIHtcclxuXHJcblx0XHQvLyByZXNldCBtYXBzXHJcblx0XHR0aGlzLm1hcHMuZm9yRWFjaChtYXAgPT4gbWFwLmRpc3Bvc2UoKSk7XHJcblx0XHR0aGlzLm1hcHMgPSBbXTtcclxuXHJcblx0XHQvLyBjcmVhdGUgbWFwc1xyXG5cdFx0aWYgKHNldHRpbmdzLm1hcHMgIT09IHVuZGVmaW5lZCl7XHJcblx0XHRcdGZvciAobGV0IG1hcElkIGluIHNldHRpbmdzLm1hcHMpIHtcclxuXHRcdFx0XHRpZiAoIXNldHRpbmdzLm1hcHMuaGFzT3duUHJvcGVydHkobWFwSWQpKSBjb250aW51ZTtcclxuXHJcblx0XHRcdFx0bGV0IG1hcFNldHRpbmdzID0gc2V0dGluZ3MubWFwc1ttYXBJZF07XHJcblx0XHRcdFx0aWYgKG1hcFNldHRpbmdzLmVuYWJsZWQpXHJcblx0XHRcdFx0XHR0aGlzLm1hcHMucHVzaChuZXcgTWFwKG1hcElkLCB0aGlzLmRhdGFVcmwgKyBtYXBJZCArIFwiL1wiLCB0aGlzLnJvb3RFbGVtZW50KSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvLyBzb3J0IG1hcHNcclxuXHRcdHRoaXMubWFwcy5zb3J0KChtYXAxLCBtYXAyKSA9PiB7XHJcblx0XHRcdGxldCBzb3J0ID0gc2V0dGluZ3MubWFwc1ttYXAxLmlkXS5vcmRpbmFsIC0gc2V0dGluZ3MubWFwc1ttYXAyLmlkXS5vcmRpbmFsO1xyXG5cdFx0XHRpZiAoaXNOYU4oc29ydCkpIHJldHVybiAwO1xyXG5cdFx0XHRyZXR1cm4gc29ydDtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcbn1cclxuIiwiaW1wb3J0IHtGaWxlTG9hZGVyfSBmcm9tIFwidGhyZWVcIjtcclxuaW1wb3J0IHtNYXB9IGZyb20gXCIuL21hcC9NYXBcIjtcclxuXHJcbmV4cG9ydCB7IE1hcFZpZXdlciB9IGZyb20gXCIuL01hcFZpZXdlclwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi91dGlsL1V0aWxzXCI7XHJcblxyXG4vKipcclxuICogTG9hZHMgYW5kIHJldHVybnMgYSBwcm9taXNlIHdpdGggYW4gYXJyYXkgb2YgTWFwcyBsb2FkZWQgZnJvbSB0aGF0IHJvb3QtcGF0aC48YnI+XHJcbiAqIDxiPkRPTlQgRk9SR0VUIFRPIGRpc3Bvc2UoKSBBTEwgTUFQUyBSRVRVUk5FRCBCWSBUSElTIE1FVEhPRCBJRiBZT1UgRE9OVCBORUVEIFRIRU0gQU5ZTU9SRSE8L2I+XHJcbiAqIEBwYXJhbSBkYXRhVXJsXHJcbiAqIEBwYXJhbSBldmVudHNcclxuICogQHJldHVybnMge1Byb21pc2U8TWFwW10+fVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGxvYWRNYXBzID0gKGRhdGFVcmwsIGV2ZW50cyA9IG51bGwpID0+IHtcclxuXHJcbiAgICBmdW5jdGlvbiBsb2FkU2V0dGluZ3MoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgbGV0IGxvYWRlciA9IG5ldyBGaWxlTG9hZGVyKCk7XHJcbiAgICAgICAgICAgIGxvYWRlci5zZXRSZXNwb25zZVR5cGUoXCJqc29uXCIpO1xyXG4gICAgICAgICAgICBsb2FkZXIubG9hZChkYXRhVXJsICsgXCJzZXR0aW5ncy5qc29uXCIsXHJcbiAgICAgICAgICAgICAgICByZXNvbHZlLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4ge30sXHJcbiAgICAgICAgICAgICAgICAoKSA9PiByZWplY3QoXCJGYWlsZWQgdG8gbG9hZCB0aGUgc2V0dGluZ3MuanNvbiFcIilcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbG9hZFNldHRpbmdzKCkudGhlbihzZXR0aW5ncyA9PiB7XHJcbiAgICAgICAgbGV0IG1hcHMgPSBbXTtcclxuXHJcbiAgICAgICAgLy8gY3JlYXRlIG1hcHNcclxuICAgICAgICBpZiAoc2V0dGluZ3MubWFwcyAhPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgZm9yIChsZXQgbWFwSWQgaW4gc2V0dGluZ3MubWFwcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFzZXR0aW5ncy5tYXBzLmhhc093blByb3BlcnR5KG1hcElkKSkgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG1hcFNldHRpbmdzID0gc2V0dGluZ3MubWFwc1ttYXBJZF07XHJcbiAgICAgICAgICAgICAgICBpZiAobWFwU2V0dGluZ3MuZW5hYmxlZClcclxuICAgICAgICAgICAgICAgICAgICBtYXBzLnB1c2gobmV3IE1hcChtYXBJZCwgZGF0YVVybCArIG1hcElkICsgXCIvXCIsIGV2ZW50cykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzb3J0IG1hcHNcclxuICAgICAgICBtYXBzLnNvcnQoKG1hcDEsIG1hcDIpID0+IHtcclxuICAgICAgICAgICAgbGV0IHNvcnQgPSBzZXR0aW5ncy5tYXBzW21hcDEuaWRdLm9yZGluYWwgLSBzZXR0aW5ncy5tYXBzW21hcDIuaWRdLm9yZGluYWw7XHJcbiAgICAgICAgICAgIGlmIChpc05hTihzb3J0KSkgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgIHJldHVybiBzb3J0O1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gbWFwcztcclxuICAgIH0pO1xyXG5cclxufVxyXG4iXSwibmFtZXMiOlsic3RyaW5nVG9JbWFnZSIsInN0cmluZyIsImltYWdlIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50TlMiLCJzcmMiLCJwYXRoRnJvbUNvb3JkcyIsIngiLCJ6IiwicGF0aCIsInNwbGl0TnVtYmVyVG9QYXRoIiwic3Vic3RyaW5nIiwibGVuZ3RoIiwibnVtIiwicyIsInBhcnNlSW50IiwidG9TdHJpbmciLCJpIiwiY2hhckF0IiwiaGFzaFRpbGUiLCJkaXNwYXRjaEV2ZW50IiwiZWxlbWVudCIsImV2ZW50IiwiZGV0YWlsIiwiQ3VzdG9tRXZlbnQiLCJhbGVydCIsIm1lc3NhZ2UiLCJsZXZlbCIsInByaW50VG9Db25zb2xlIiwiY29uc29sZSIsImxvZyIsIndhcm4iLCJlcnJvciIsImRlYnVnIiwiaHRtbFRvRWxlbWVudCIsImh0bWwiLCJ0ZW1wbGF0ZSIsImNyZWF0ZUVsZW1lbnQiLCJpbm5lckhUTUwiLCJ0cmltIiwiY29udGVudCIsImZpcnN0Q2hpbGQiLCJodG1sVG9FbGVtZW50cyIsImNoaWxkTm9kZXMiLCJhbmltYXRlIiwiYW5pbWF0aW9uRnJhbWUiLCJkdXJhdGlvbk1zIiwicG9zdEFuaW1hdGlvbiIsImFuaW1hdGlvbiIsImFuaW1hdGlvblN0YXJ0IiwibGFzdEZyYW1lIiwiY2FuY2VsbGVkIiwiZnJhbWUiLCJ0aW1lIiwicHJvZ3Jlc3MiLCJNYXRoVXRpbHMiLCJjbGFtcCIsImRlbHRhVGltZSIsIndpbmRvdyIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsImNhbmNlbCIsImVsZW1lbnRPZmZzZXQiLCJyZWN0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0Iiwic2Nyb2xsTGVmdCIsInBhZ2VYT2Zmc2V0IiwiZG9jdW1lbnRFbGVtZW50Iiwic2Nyb2xsVG9wIiwicGFnZVlPZmZzZXQiLCJ0b3AiLCJsZWZ0IiwiVGlsZSIsIm9uTG9hZCIsIm9uVW5sb2FkIiwiT2JqZWN0IiwiZGVmaW5lUHJvcGVydHkiLCJ2YWx1ZSIsIm1vZGVsIiwidW5sb2FkZWQiLCJsb2FkaW5nIiwibG9hZCIsInRpbGVMb2FkZXIiLCJ1bmxvYWQiLCJ0aGVuIiwiZ2VvbWV0cnkiLCJkaXNwb3NlIiwiZmluYWxseSIsIlRpbGVNYXAiLCJ3aWR0aCIsImhlaWdodCIsImNhbnZhcyIsInRpbGVNYXBDb250ZXh0IiwiZ2V0Q29udGV4dCIsImFscGhhIiwid2lsbFJlYWRGcmVxdWVudGx5IiwidGV4dHVyZSIsIlRleHR1cmUiLCJnZW5lcmF0ZU1pcG1hcHMiLCJtYWdGaWx0ZXIiLCJMaW5lYXJGaWx0ZXIiLCJtaW5GaWx0ZXIiLCJ3cmFwUyIsIkNsYW1wVG9FZGdlV3JhcHBpbmciLCJ3cmFwVCIsImZsaXBZIiwibmVlZHNVcGRhdGUiLCJzZXRBbGwiLCJzdGF0ZSIsImZpbGxTdHlsZSIsImZpbGxSZWN0Iiwic2V0VGlsZSIsIkVNUFRZIiwiTE9BREVEIiwiVGlsZU1hbmFnZXIiLCJzY2VuZSIsIm9uVGlsZUxvYWQiLCJvblRpbGVVbmxvYWQiLCJldmVudHMiLCJsb2FkQ2xvc2VUaWxlcyIsImxvYWROZXh0VGlsZSIsImxvYWRUaW1lb3V0IiwiY2xlYXJUaW1lb3V0IiwiY3VycmVudGx5TG9hZGluZyIsInNldFRpbWVvdXQiLCJoYW5kbGVMb2FkZWRUaWxlIiwidGlsZSIsImFkZCIsImhhbmRsZVVubG9hZGVkVGlsZSIsInRpbGVNYXAiLCJjZW50ZXJUaWxlIiwidGlsZU1hcEhhbGZTaXplIiwieSIsInJlbW92ZSIsInZpZXdEaXN0YW5jZVgiLCJ2aWV3RGlzdGFuY2VaIiwiVmVjdG9yMiIsInRpbGVzIiwidGlsZU1hcFNpemUiLCJsb2FkQXJvdW5kVGlsZSIsInNldCIsInJlbW92ZUZhclRpbGVzIiwia2V5cyIsImhhc093blByb3BlcnR5IiwicmVtb3ZlQWxsVGlsZXMiLCJkIiwibSIsIk1hdGgiLCJtYXgiLCJ0cnlMb2FkVGlsZSIsImFicyIsInRpbGVIYXNoIiwidW5kZWZpbmVkIiwiY2F0Y2giLCJzdGF0dXMiLCJ0YXJnZXQiLCJUaWxlTG9hZGVyIiwidGlsZVBhdGgiLCJtYXRlcmlhbCIsInRpbGVTZXR0aW5ncyIsImxheWVyIiwidGlsZVgiLCJ0aWxlWiIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZmlsZUxvYWRlciIsImdlb21ldHJ5SnNvbiIsInR5cGUiLCJidWZmZXJHZW9tZXRyeUxvYWRlciIsInBhcnNlIiwib2JqZWN0IiwiTWVzaCIsImxheWVycyIsInRpbGVTaXplIiwidHJhbnNsYXRlIiwic2NhbGUiLCJwb3NpdGlvbiIsInVwZGF0ZU1hdHJpeFdvcmxkIiwiRmlsZUxvYWRlciIsInNldFJlc3BvbnNlVHlwZSIsIkJ1ZmZlckdlb21ldHJ5TG9hZGVyIiwiTWFya2VyIiwibWFya2VyU2V0IiwiaWQiLCJtYW5hZ2VyIiwiX3Bvc2l0aW9uIiwiVmVjdG9yMyIsIl9sYWJlbCIsImxpbmsiLCJuZXdUYWIiLCJtaW5EaXN0YW5jZSIsIm1heERpc3RhbmNlIiwib3BhY2l0eSIsIl9zb3VyY2UiLCJTb3VyY2UiLCJDVVNUT00iLCJfb25EaXNwb3NhbCIsIl9kaXN0YW5jZSIsIl9vcGFjaXR5IiwiX3Bvc1JlbGF0aXZlVG9DYW1lcmEiLCJfY2FtZXJhRGlyZWN0aW9uIiwidXBkYXRlIiwibWFya2VyRGF0YSIsIk1BUktFUl9GSUxFIiwic2V0UG9zaXRpb24iLCJwYXJzZUZsb2F0IiwibGFiZWwiLCJvbkNsaWNrIiwiY2xpY2tQb3NpdGlvbiIsIm1hcmtlciIsImZvbGxvd0xpbmsiLCJzaG93UG9wdXAiLCJvcGVuIiwibG9jYXRpb24iLCJocmVmIiwiX29uQmVmb3JlUmVuZGVyIiwicmVuZGVyZXIiLCJjYW1lcmEiLCJzdWJWZWN0b3JzIiwiZ2V0V29ybGREaXJlY3Rpb24iLCJkb3QiLCJtaW4iLCJibGVuZEluIiwiYmxlbmRPdXQiLCJzdGFydE9wYWNpdHkiLCJmb3JFYWNoIiwiY2FsbGJhY2siLCJfbWFya2VyIiwibm9ybWFsaXplQ29sb3IiLCJjb2xvciIsInIiLCJub3JtYWxpc2VOdW1iZXIiLCJnIiwiYiIsImEiLCJyZ2IiLCJ2ZWM0IiwiVmVjdG9yNCIsIm5yIiwiZGVmIiwiaW50ZWdlciIsImlzTmFOIiwiZmxvb3IiLCJwdXNoIiwiVW5pZm9ybXNMaWIiLCJsaW5lIiwibGluZXdpZHRoIiwicmVzb2x1dGlvbiIsImRhc2hTY2FsZSIsImRhc2hTaXplIiwiZ2FwU2l6ZSIsIlNoYWRlckxpYiIsInVuaWZvcm1zIiwiVW5pZm9ybXNVdGlscyIsIm1lcmdlIiwiY29tbW9uIiwiZm9nIiwidmVydGV4U2hhZGVyIiwiZnJhZ21lbnRTaGFkZXIiLCJMaW5lTWF0ZXJpYWwiLCJwYXJhbWV0ZXJzIiwiU2hhZGVyTWF0ZXJpYWwiLCJjYWxsIiwiY2xvbmUiLCJjbGlwcGluZyIsImRhc2hlZCIsImRlZmluZVByb3BlcnRpZXMiLCJlbnVtZXJhYmxlIiwiZ2V0IiwiZGlmZnVzZSIsImNvcHkiLCJzZXRWYWx1ZXMiLCJwcm90b3R5cGUiLCJjcmVhdGUiLCJjb25zdHJ1Y3RvciIsImlzTGluZU1hdGVyaWFsIiwiTGluZVNlZ21lbnRzR2VvbWV0cnkiLCJJbnN0YW5jZWRCdWZmZXJHZW9tZXRyeSIsInBvc2l0aW9ucyIsInV2cyIsImluZGV4Iiwic2V0SW5kZXgiLCJzZXRBdHRyaWJ1dGUiLCJGbG9hdDMyQnVmZmVyQXR0cmlidXRlIiwiYXNzaWduIiwiaXNMaW5lU2VnbWVudHNHZW9tZXRyeSIsImFwcGx5TWF0cml4NCIsIm1hdHJpeCIsInN0YXJ0IiwiYXR0cmlidXRlcyIsImluc3RhbmNlU3RhcnQiLCJlbmQiLCJpbnN0YW5jZUVuZCIsImJvdW5kaW5nQm94IiwiY29tcHV0ZUJvdW5kaW5nQm94IiwiYm91bmRpbmdTcGhlcmUiLCJjb21wdXRlQm91bmRpbmdTcGhlcmUiLCJzZXRQb3NpdGlvbnMiLCJhcnJheSIsImxpbmVTZWdtZW50cyIsIkZsb2F0MzJBcnJheSIsIkFycmF5IiwiaXNBcnJheSIsImluc3RhbmNlQnVmZmVyIiwiSW5zdGFuY2VkSW50ZXJsZWF2ZWRCdWZmZXIiLCJJbnRlcmxlYXZlZEJ1ZmZlckF0dHJpYnV0ZSIsInNldENvbG9ycyIsImNvbG9ycyIsImluc3RhbmNlQ29sb3JCdWZmZXIiLCJmcm9tV2lyZWZyYW1lR2VvbWV0cnkiLCJmcm9tRWRnZXNHZW9tZXRyeSIsImZyb21NZXNoIiwibWVzaCIsIldpcmVmcmFtZUdlb21ldHJ5IiwiZnJvbUxpbmVTZWdtZW50cyIsImlzR2VvbWV0cnkiLCJ2ZXJ0aWNlcyIsImlzQnVmZmVyR2VvbWV0cnkiLCJib3giLCJCb3gzIiwic2V0RnJvbUJ1ZmZlckF0dHJpYnV0ZSIsInVuaW9uIiwidmVjdG9yIiwiU3BoZXJlIiwiY2VudGVyIiwiZ2V0Q2VudGVyIiwibWF4UmFkaXVzU3EiLCJpbCIsImNvdW50IiwiZnJvbUJ1ZmZlckF0dHJpYnV0ZSIsImRpc3RhbmNlVG9TcXVhcmVkIiwicmFkaXVzIiwic3FydCIsInRvSlNPTiIsImFwcGx5TWF0cml4IiwiTGluZUdlb21ldHJ5IiwiaXNMaW5lR2VvbWV0cnkiLCJwb2ludHMiLCJmcm9tTGluZSIsIkxpbmVTZWdtZW50czIiLCJyYW5kb20iLCJpc0xpbmVTZWdtZW50czIiLCJjb21wdXRlTGluZURpc3RhbmNlcyIsImxpbmVEaXN0YW5jZXMiLCJkYXRhIiwiaiIsImwiLCJkaXN0YW5jZVRvIiwiaW5zdGFuY2VEaXN0YW5jZUJ1ZmZlciIsInJheWNhc3QiLCJzc09yaWdpbiIsInNzT3JpZ2luMyIsIm12TWF0cml4IiwiTWF0cml4NCIsIkxpbmUzIiwiY2xvc2VzdFBvaW50IiwicmF5Y2FzdGVyIiwiaW50ZXJzZWN0cyIsInRocmVzaG9sZCIsInBhcmFtcyIsIkxpbmUyIiwicmF5IiwicHJvamVjdGlvbk1hdHJpeCIsImxpbmVXaWR0aCIsImF0IiwidyIsIm1hdHJpeFdvcmxkSW52ZXJzZSIsIm11bHRpcGx5U2NhbGFyIiwibWF0cml4V29ybGQiLCJtdWx0aXBseU1hdHJpY2VzIiwiaXNCZWhpbmRDYW1lcmFOZWFyIiwiaXNQYXN0Q2FtZXJhRmFyIiwicGFyYW0iLCJjbG9zZXN0UG9pbnRUb1BvaW50UGFyYW1ldGVyIiwielBvcyIsImxlcnAiLCJpc0luQ2xpcFNwYWNlIiwiaXNJbnNpZGUiLCJwb2ludE9uTGluZSIsInBvaW50IiwiZGlzdGFuY2VTcVRvU2VnbWVudCIsImRpc3RhbmNlIiwib3JpZ2luIiwiZmFjZSIsImZhY2VJbmRleCIsInV2IiwidXYyIiwiaXNMaW5lMiIsIk1BUktFUl9GSUxMX0ZSQUdNRU5UX1NIQURFUiIsIlNoYWRlckNodW5rIiwibG9nZGVwdGhidWZfcGFyc19mcmFnbWVudCIsImxvZ2RlcHRoYnVmX2ZyYWdtZW50IiwiTUFSS0VSX0ZJTExfVkVSVEVYX1NIQURFUiIsImxvZ2RlcHRoYnVmX3BhcnNfdmVydGV4IiwibG9nZGVwdGhidWZfdmVydGV4IiwiU2hhcGVNYXJrZXIiLCJwYXJlbnRPYmplY3QiLCJmaWxsQ29sb3IiLCJib3JkZXJDb2xvciIsImRlcHRoVGVzdCIsIl9saW5lT3BhY2l0eSIsIl9maWxsT3BhY2l0eSIsIl9tYXJrZXJPYmplY3QiLCJPYmplY3QzRCIsIl9tYXJrZXJGaWxsTWF0ZXJpYWwiLCJzaWRlIiwiRG91YmxlU2lkZSIsInRyYW5zcGFyZW50IiwibWFya2VyQ29sb3IiLCJfbWFya2VyTGluZU1hdGVyaWFsIiwiQ29sb3IiLCJ2ZXJ0ZXhDb2xvcnMiLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJzaGFwZSIsInBhcmVudCIsImNoaWxkcmVuIiwiY2hpbGQiLCJjbGVhciIsInNldEhleCIsInRlc3QiLCJwb2ludHMzZCIsImxpbmVHZW8iLCJvbkJlZm9yZVJlbmRlciIsImdldFNpemUiLCJTaGFwZSIsImZpbGxHZW8iLCJTaGFwZUJ1ZmZlckdlb21ldHJ5Iiwicm90YXRlWCIsIlBJIiwiZmlsbCIsIm9sZEhvb2siLCJncm91cCIsIkxpbmVNYXJrZXIiLCJsaW5lQ29sb3IiLCJFeHRydWRlTWFya2VyIiwibWluSGVpZ2h0IiwibWF4SGVpZ2h0IiwiX21pbkhlaWdodCIsIm1heFkiLCJtaW5ZIiwiZGVwdGgiLCJwcmVSZW5kZXJIb29rIiwidG9wTGluZUdlbyIsInRvcExpbmUiLCJib3R0b21MaW5lIiwicG9pbnRMaW5lR2VvIiwicG9pbnRMaW5lIiwiRXh0cnVkZUJ1ZmZlckdlb21ldHJ5Iiwic3RlcHMiLCJiZXZlbEVuYWJsZWQiLCJDU1MyRE9iamVjdCIsInN0eWxlIiwiYW5jaG9yIiwiYWRkRXZlbnRMaXN0ZW5lciIsInRyYXZlcnNlIiwiRWxlbWVudCIsInBhcmVudE5vZGUiLCJyZW1vdmVDaGlsZCIsIkNTUzJEUmVuZGVyZXIiLCJfdGhpcyIsIl93aWR0aCIsIl9oZWlnaHQiLCJfd2lkdGhIYWxmIiwiX2hlaWdodEhhbGYiLCJ2aWV3TWF0cml4Iiwidmlld1Byb2plY3Rpb25NYXRyaXgiLCJjYWNoZSIsIm9iamVjdHMiLCJXZWFrTWFwIiwiZG9tRWxlbWVudCIsIm92ZXJmbG93Iiwic2V0U2l6ZSIsInJlbmRlck9iamVjdCIsInNldEZyb21NYXRyaXhQb3NpdGlvbiIsIldlYmtpdFRyYW5zZm9ybSIsIk1velRyYW5zZm9ybSIsIm9UcmFuc2Zvcm0iLCJ0cmFuc2Zvcm0iLCJkaXNwbGF5IiwidmlzaWJsZSIsIm9iamVjdERhdGEiLCJkaXN0YW5jZVRvQ2FtZXJhU3F1YXJlZCIsImdldERpc3RhbmNlVG9TcXVhcmVkIiwiYXBwZW5kQ2hpbGQiLCJvbkFmdGVyUmVuZGVyIiwib2JqZWN0MSIsIm9iamVjdDIiLCJmaWx0ZXJBbmRGbGF0dGVuIiwicmVzdWx0Iiwiek9yZGVyIiwic29ydGVkIiwic29ydCIsImRpc3RhbmNlQSIsImRpc3RhbmNlQiIsInpNYXgiLCJ6SW5kZXgiLCJyZW5kZXIiLCJhdXRvVXBkYXRlIiwiSFRNTE1hcmtlciIsIl9tYXJrZXJFbGVtZW50Iiwic2V0QW5jaG9yIiwicm91bmQiLCJwb2ludGVyRXZlbnRzIiwiUE9JTWFya2VyIiwiY2xhc3NMaXN0IiwiaWNvbiIsImljb25BbmNob3IiLCJvblJlbW92ZUxhYmVsIiwib25jZSIsInVwZGF0ZUh0bWwiLCJsYWJlbEh0bWwiLCJfaWNvbiIsIlBsYXllck1hcmtlciIsInBsYXllclV1aWQiLCJfbmFtZSIsIl9oZWFkIiwibmFtZSIsImhlYWRJbWFnZSIsIk1hcmtlclNldCIsIm1hcElkIiwiX21hcElkIiwiX29iamVjdE1hcmtlck9iamVjdCIsIl9lbGVtZW50TWFya2VyT2JqZWN0IiwidG9nZ2xlYWJsZSIsImRlZmF1bHRIaWRlIiwibWFya2VyU2V0RGF0YSIsInByZXZNYXJrZXJzIiwibWFya2VySWQiLCJtYXAiLCJ1cGRhdGVNYXJrZXIiLCJpc01hcmtlciIsIm1hcmtlclR5cGUiLCJjcmVhdGVNYXJrZXIiLCJjcmVhdGVQbGF5ZXJNYXJrZXIiLCJtYXJrZXJTZXRzIiwidmFsdWVzIiwiTWFya2VyTWFuYWdlciIsIm1hcmtlckZpbGVVcmwiLCJvYmplY3RNYXJrZXJTY2VuZSIsIlNjZW5lIiwiZWxlbWVudE1hcmtlclNjZW5lIiwiX3BvcHVwSWQiLCJsb2FkTWFya2Vyc0ZpbGUiLCJtYXJrZXJzRmlsZSIsInByZXZNYXJrZXJTZXRzIiwibWFya2VyU2V0SWQiLCJ1cGRhdGVNYXJrZXJTZXQiLCJpc01hcmtlclNldCIsInJlYXNvbiIsImNyZWF0ZU1hcmtlclNldCIsInNldHMiLCJhdXRvUmVtb3ZlIiwib25SZW1vdmFsIiwib25EaXNwb3NhbCIsIm9uUmVtb3ZlIiwiZmluaXNoZWQiLCJsb2FkZXIiLCJtYXJrZXJGaWxlIiwiTWFwIiwiZGF0YVVybCIsIndvcmxkIiwic3RhcnRQb3MiLCJza3lDb2xvciIsImFtYmllbnRMaWdodCIsImhpcmVzIiwibG93cmVzIiwiUmF5Y2FzdGVyIiwiaGlyZXNNYXRlcmlhbCIsImxvd3Jlc01hdGVyaWFsIiwibG9hZGVkVGV4dHVyZXMiLCJoaXJlc1RpbGVNYW5hZ2VyIiwibG93cmVzVGlsZU1hbmFnZXIiLCJtYXJrZXJNYW5hZ2VyIiwiaGlyZXNWZXJ0ZXhTaGFkZXIiLCJoaXJlc0ZyYWdtZW50U2hhZGVyIiwibG93cmVzVmVydGV4U2hhZGVyIiwibG93cmVzRnJhZ21lbnRTaGFkZXIiLCJzZXR0aW5nc0ZpbGVQcm9taXNlIiwibG9hZFNldHRpbmdzRmlsZSIsInRleHR1cmVGaWxlUHJvbWlzZSIsImxvYWRUZXh0dXJlc0ZpbGUiLCJtYXJrZXJVcGRhdGVQcm9taXNlIiwiY3JlYXRlTG93cmVzTWF0ZXJpYWwiLCJzZXR0aW5nc1Byb21pc2UiLCJ3b3JsZFNldHRpbmdzIiwibWFwUHJvbWlzZSIsImFsbCIsInRleHR1cmVzIiwiRXJyb3IiLCJjcmVhdGVIaXJlc01hdGVyaWFsIiwibG9hZE1hcEFyZWEiLCJoaXJlc1ZpZXdEaXN0YW5jZSIsImxvd3Jlc1ZpZXdEaXN0YW5jZSIsImlzTG9hZGVkIiwiaGlyZXNYIiwiaGlyZXNaIiwiaGlyZXNWaWV3WCIsImhpcmVzVmlld1oiLCJsb3dyZXNYIiwibG93cmVzWiIsImxvd3Jlc1ZpZXdYIiwibG93cmVzVmlld1oiLCJzZXR0aW5ncyIsIm1hcHMiLCJtYXRlcmlhbHMiLCJ0ZXh0dXJlU2V0dGluZ3MiLCJvcGFxdWUiLCJhbmlzb3Ryb3B5IiwiTmVhcmVzdEZpbHRlciIsIk5lYXJlc3RNaXBNYXBMaW5lYXJGaWx0ZXIiLCJmbGF0U2hhZGluZyIsInRleHR1cmVJbWFnZSIsImRlcHRoV3JpdGUiLCJWZXJ0ZXhDb2xvcnMiLCJGcm9udFNpZGUiLCJ3aXJlZnJhbWUiLCJ0ZXJyYWluSGVpZ2h0QXQiLCJuZWFyIiwiZmFyIiwiZW5hYmxlQWxsIiwiaGlyZXNUaWxlSGFzaCIsImxvd3Jlc1RpbGVIYXNoIiwiaW50ZXJzZWN0T2JqZWN0cyIsImVyciIsIlNLWV9GUkFHTUVOVF9TSEFERVIiLCJTS1lfVkVSVEVYX1NIQURFUiIsIlNreWJveFNjZW5lIiwiVU5JRk9STV9zdW5saWdodCIsIlVOSUZPUk1fc2t5Q29sb3IiLCJVTklGT1JNX2FtYmllbnRMaWdodCIsIlNwaGVyZUdlb21ldHJ5Iiwic3VubGlnaHQiLCJCYWNrU2lkZSIsInNreWJveCIsInN0cmVuZ3RoIiwiQ29udHJvbHNNYW5hZ2VyIiwibWFwVmlld2VyIiwicG9zaXRpb25WYWx1ZSIsInJvdGF0aW9uVmFsdWUiLCJhbmdsZVZhbHVlIiwiZGlzdGFuY2VWYWx1ZSIsIm9ydGhvVmFsdWUiLCJ2YWx1ZUNoYW5nZWQiLCJsYXN0TWFwVXBkYXRlUG9zaXRpb24iLCJjb250cm9sc1ZhbHVlIiwidXBkYXRlQ2FtZXJhIiwicm90YXRhYmxlQW5nbGUiLCJyb3RhdGFibGVEaXN0YW5jZSIsInBvdyIsInJvdGF0aW9uVmVjdG9yIiwic2luIiwiY29zIiwiYW5nbGVSb3RhdGlvbkF4aXMiLCJjcm9zcyIsImFwcGx5QXhpc0FuZ2xlIiwic3ViIiwibG9va0F0Iiwib3J0aG8iLCJjb250cm9sc01hbmFnZXIiLCJ0cmlnZ2VyRGlzdGFuY2UiLCJsb2FkZWRIaXJlc1ZpZXdEaXN0YW5jZSIsImhhbmRsZVZhbHVlQ2hhbmdlIiwicm90YXRpb24iLCJhbmdsZSIsImNvbnRyb2xzIiwic3RvcCIsIk1hcENvbnRyb2xzIiwicm9vdEVsZW1lbnQiLCJoYW1tZXJMaWIiLCJvbktleURvd24iLCJldnQiLCJrZXkiLCJrZXlDb2RlIiwiYWN0aW9uIiwiS0VZUyIsImluY2x1ZGVzIiwia2V5U3RhdGVzIiwib25LZXlVcCIsIm9uV2hlZWwiLCJkZWx0YSIsImRlbHRhWSIsImRlbHRhTW9kZSIsIldoZWVsRXZlbnQiLCJET01fREVMVEFfUElYRUwiLCJET01fREVMVEFfTElORSIsInRhcmdldERpc3RhbmNlIiwidXBkYXRlWm9vbSIsIm9uTW91c2VEb3duIiwiU1RBVEVTIiwiTk9ORSIsIkJVVFRPTlMiLCJNT1ZFIiwiYnV0dG9uIiwicHJldmVudERlZmF1bHQiLCJPUkJJVCIsIm9uTW91c2VNb3ZlIiwibW91c2UiLCJjbGllbnRYIiwiY2xpZW50WSIsIm9uTW91c2VVcCIsIm9uVG91Y2hEb3duIiwicG9pbnRlclR5cGUiLCJ0b3VjaFN0YXJ0IiwidGFyZ2V0UG9zaXRpb24iLCJvblRvdWNoTW92ZSIsInRvdWNoRGVsdGEiLCJkZWx0YVgiLCJyb3RhdGVBcm91bmQiLCJWRUNUT1IyX1pFUk8iLCJjbGllbnRIZWlnaHQiLCJvblRvdWNoVXAiLCJvblRvdWNoVGlsdERvd24iLCJ0b3VjaFRpbHRTdGFydCIsInRhcmdldEFuZ2xlIiwib25Ub3VjaFRpbHRNb3ZlIiwibWluQW5nbGUiLCJtYXhBbmdsZUZvclpvb20iLCJvblRvdWNoVGlsdFVwIiwib25Ub3VjaFJvdGF0ZURvd24iLCJsYXN0VG91Y2hSb3RhdGlvbiIsIm9uVG91Y2hSb3RhdGVNb3ZlIiwidGFyZ2V0Um90YXRpb24iLCJ3cmFwUm90YXRpb24iLCJvblRvdWNoUm90YXRlVXAiLCJvblRvdWNoWm9vbURvd24iLCJ0b3VjaFpvb21TdGFydCIsIm9uVG91Y2hab29tTW92ZSIsIm9uQ29udGV4dE1lbnUiLCJoYW1tZXIiLCJwb3NpdGlvblRlcnJhaW5IZWlnaHQiLCJtYXhBbmdsZSIsImxhc3RNb3VzZSIsInBhc3NpdmUiLCJvbiIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJvZmYiLCJkZWx0YU1vdXNlIiwibW92ZURlbHRhIiwiWk9PTV9JTiIsIlpPT01fT1VUIiwiVVAiLCJET1dOIiwiTEVGVCIsIlJJR0hUIiwidXBkYXRlUG9zaXRpb25UZXJyYWluSGVpZ2h0Iiwic29tZXRoaW5nQ2hhbmdlZCIsImRlbHRhUG9zaXRpb24iLCJkZWx0YVJvdGF0aW9uIiwiZGVsdGFBbmdsZSIsImRlbHRhRGlzdGFuY2UiLCJtaW5DYW1lcmFIZWlnaHQiLCJ1cGRhdGVNYXhBbmdsZUZvclpvb20iLCJNT1VTRSIsIlN0YXRzIiwibW9kZSIsImNvbnRhaW5lciIsImNzc1RleHQiLCJzaG93UGFuZWwiLCJhZGRQYW5lbCIsInBhbmVsIiwiZG9tIiwiaGlkZSIsImJlZ2luVGltZSIsInBlcmZvcm1hbmNlIiwiRGF0ZSIsIm5vdyIsInByZXZUaW1lIiwiZnJhbWVzIiwicHJldkZyYW1lVGltZSIsImZwc1BhbmVsIiwiUGFuZWwiLCJtc1BhbmVsIiwibGFzdEZyYW1lTXNQYW5lbCIsIm1lbVBhbmVsIiwic2VsZiIsIm1lbW9yeSIsIlJFVklTSU9OIiwiYmVnaW4iLCJ1c2VkSlNIZWFwU2l6ZSIsImpzSGVhcFNpemVMaW1pdCIsInNldE1vZGUiLCJmZyIsImJnIiwiSW5maW5pdHkiLCJQUiIsImRldmljZVBpeGVsUmF0aW8iLCJXSURUSCIsIkhFSUdIVCIsIlRFWFRfWCIsIlRFWFRfWSIsIkdSQVBIX1giLCJHUkFQSF9ZIiwiR1JBUEhfV0lEVEgiLCJHUkFQSF9IRUlHSFQiLCJjb250ZXh0IiwiZm9udCIsInRleHRCYXNlbGluZSIsImZpbGxUZXh0IiwiZ2xvYmFsQWxwaGEiLCJtYXhWYWx1ZSIsImRyYXdJbWFnZSIsIkhJUkVTX1ZFUlRFWF9TSEFERVIiLCJISVJFU19GUkFHTUVOVF9TSEFERVIiLCJMT1dSRVNfVkVSVEVYX1NIQURFUiIsIkxPV1JFU19GUkFHTUVOVF9TSEFERVIiLCJDb21iaW5lZENhbWVyYSIsImZvdiIsImFzcGVjdCIsInVwZGF0ZVByb2plY3Rpb25NYXRyaXgiLCJvcnRvZ3JhcGhpY1Byb2plY3Rpb24iLCJwZXJzcGVjdGl2ZVByb2plY3Rpb24iLCJ0YW4iLCJERUcyUkFEIiwiem9vbSIsInZpZXciLCJlbmFibGVkIiwiZnVsbFdpZHRoIiwiZnVsbEhlaWdodCIsIm9mZnNldFgiLCJvZmZzZXRZIiwic2tldyIsImZpbG1PZmZzZXQiLCJnZXRGaWxtV2lkdGgiLCJub3JtYWxpemVkT3J0aG8iLCJvcnRob1RvcCIsIm9ydGhvSGVpZ2h0Iiwib3J0aG9XaWR0aCIsIm9ydGhvTGVmdCIsIm1ha2VQZXJzcGVjdGl2ZSIsIm1ha2VPcnRob2dyYXBoaWMiLCJlbGVtZW50cyIsInByb2plY3Rpb25NYXRyaXhJbnZlcnNlIiwiaW52ZXJ0IiwiaXNQZXJzcGVjdGl2ZUNhbWVyYSIsIlBlcnNwZWN0aXZlQ2FtZXJhIiwiTWFwVmlld2VyIiwibGl2ZUFwaVVybCIsImhhbmRsZUNvbnRhaW5lclJlc2l6ZSIsImNsaWVudFdpZHRoIiwic2V0UGl4ZWxSYXRpbyIsInN1cGVyU2FtcGxpbmdWYWx1ZSIsImNzczJkUmVuZGVyZXIiLCJ1cGRhdGVMb2FkZWRNYXBBcmVhIiwibG9hZGVkQ2VudGVyIiwibG9hZGVkTG93cmVzVmlld0Rpc3RhbmNlIiwicmVuZGVyTG9vcCIsInN0YXRzIiwic3VubGlnaHRTdHJlbmd0aCIsImhpcmVzVGlsZU1hcCIsInNpemUiLCJwb3MiLCJXZWJHTFJlbmRlcmVyIiwiYW50aWFsaWFzIiwic29ydE9iamVjdHMiLCJwcmVzZXJ2ZURyYXdpbmdCdWZmZXIiLCJsb2dhcml0aG1pY0RlcHRoQnVmZmVyIiwiYXV0b0NsZWFyIiwic2t5Ym94U2NlbmUiLCJza3lib3hDYW1lcmEiLCJIYW1tZXIiLCJNYW5hZ2VyIiwiaW5pdGlhbGl6ZUhhbW1lciIsImluaXRpYWxpemVSb290RWxlbWVudCIsInRvdWNoVGFwIiwiVGFwIiwicG9pbnRlcnMiLCJ0YXBzIiwidG91Y2hNb3ZlIiwiUGFuIiwiZGlyZWN0aW9uIiwiRElSRUNUSU9OX0FMTCIsInRvdWNoVGlsdCIsIkRJUkVDVElPTl9WRVJUSUNBTCIsInRvdWNoUm90YXRlIiwiUm90YXRlIiwidG91Y2hab29tIiwiUGluY2giLCJyZWNvZ25pemVXaXRoIiwib3V0ZXJEaXYiLCJyb290T2Zmc2V0IiwiaGFuZGxlTWFwSW50ZXJhY3Rpb24iLCJzY3JlZW5Qb3MiLCJpbnRlcmFjdGlvblR5cGUiLCJJbnRlcmFjdGlvblR5cGUiLCJMRUZUQ0xJQ0siLCJzZXRGcm9tQ2FtZXJhIiwibG93cmVzTGF5ZXIiLCJMYXllcnMiLCJjb3ZlcmVkIiwiY2xlYXJEZXB0aCIsImVuYWJsZSIsInNldE1hcCIsImlzTWFwIiwiY2VudGVyWCIsImNlbnRlcloiLCJhcHBseVNldHRpbmdzIiwibWFwU2V0dGluZ3MiLCJtYXAxIiwibWFwMiIsIm9yZGluYWwiLCJSSUdIVENMSUNLIiwibG9hZE1hcHMiLCJsb2FkU2V0dGluZ3MiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQUFBOzs7OztLQU9hQSxhQUFhLEdBQUcsU0FBaEJBLGFBQWdCLENBQUFDLE1BQU0sRUFBSTtDQUNuQyxNQUFJQyxLQUFLLEdBQUdDLFFBQVEsQ0FBQ0MsZUFBVCxDQUF5Qiw4QkFBekIsRUFBeUQsS0FBekQsQ0FBWjtDQUNBRixFQUFBQSxLQUFLLENBQUNHLEdBQU4sR0FBWUosTUFBWjtDQUNBLFNBQU9DLEtBQVA7Q0FDSDtDQUVEOzs7Ozs7O0tBTWFJLGNBQWMsR0FBRyxTQUFqQkEsY0FBaUIsQ0FBQ0MsQ0FBRCxFQUFJQyxDQUFKLEVBQVU7Q0FDcEMsTUFBSUMsSUFBSSxHQUFHLEdBQVg7Q0FDQUEsRUFBQUEsSUFBSSxJQUFJQyxpQkFBaUIsQ0FBQ0gsQ0FBRCxDQUF6QjtDQUVBRSxFQUFBQSxJQUFJLElBQUksR0FBUjtDQUNBQSxFQUFBQSxJQUFJLElBQUlDLGlCQUFpQixDQUFDRixDQUFELENBQXpCO0NBRUFDLEVBQUFBLElBQUksR0FB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
