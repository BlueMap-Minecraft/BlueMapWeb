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
import { ShaderChunk } from 'three';

export const LOWRES_FRAGMENT_SHADER = `
${ShaderChunk.logdepthbuf_pars_fragment}

#ifndef texture
	#define texture texture2D
#endif

struct TileMap {
	sampler2D map;
	float size;
	vec2 scale;
	vec2 translate;
	vec2 pos; 
};

uniform float sunlightStrength;
uniform float ambientLight;
uniform TileMap hiresTileMap;

varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vColor;
varying float vDistance;

void main() {
	//discard if hires tile is loaded at that position
	if (vDistance < 1900.0 && texture(hiresTileMap.map, ((vWorldPosition.xz - hiresTileMap.translate) / hiresTileMap.scale - hiresTileMap.pos) / hiresTileMap.size + 0.5).r >= 1.0) discard;
	
	vec4 color = vec4(vColor, 1.0);

	float diff = sqrt(max(dot(vNormal, vec3(0.3637, 0.7274, 0.5819)), 0.0)) * 0.4 + 0.6;
	color *= diff;

	color *= mix(sunlightStrength, 1.0, ambientLight);

	gl_FragColor = color;
	
	${ShaderChunk.logdepthbuf_fragment}
}
`;
