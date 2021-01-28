import {
	Scene,
	Vector3,
	Mesh,
	SphereGeometry,
	ShaderMaterial,
	BackSide, Color
} from 'three';

import { SKY_FRAGMENT_SHADER } from './SkyFragmentShader';
import { SKY_VERTEX_SHADER } from './SkyVertexShader';

export class SkyboxScene extends Scene {

	constructor() {
		super();

		this.autoUpdate = false;

		Object.defineProperty( this, 'isSkyboxScene', { value: true } );

		this.UNIFORM_sunlight = {
			value: 1
		};

		this.UNIFORM_skyColor = {
			value: new Color(0.5, 0.5, 1)
		};

		this.UNIFORM_ambientLight = {
			value: 0
		};

		let geometry = new SphereGeometry(1, 40, 5);
		let material = new ShaderMaterial({
			uniforms: {
				sunlight: this.UNIFORM_sunlight,
				skyColor: this.UNIFORM_skyColor,
				ambientLight: this.UNIFORM_ambientLight,
			},
			vertexShader: SKY_VERTEX_SHADER,
			fragmentShader: SKY_FRAGMENT_SHADER,
			side: BackSide
		});
		let skybox = new Mesh(geometry, material);

		this.add(skybox);
	}

	/**
	 * @returns {number}
	 */
	get sunlight() {
		return this.UNIFORM_sunlight.value;
	}

	/**
	 * @param strength {number}
	 */
	set sunlight(strength) {
		this.UNIFORM_sunlight.value = strength;
	}

	/**
	 * @returns {Color}
	 */
	get skyColor() {
		return this.UNIFORM_skyColor.value;
	}

	/**
	 * @param color {Color}
	 */
	set skyColor(color) {
		this.UNIFORM_skyColor.value.set(color);
	}

	/**
	 * @returns {number}
	 */
	get ambientLight() {
		return this.UNIFORM_ambientLight.value;
	}

	/**
	 * @param strength {number}
	 */
	set ambientLight(strength) {
		this.UNIFORM_ambientLight.value = strength;
	}

}