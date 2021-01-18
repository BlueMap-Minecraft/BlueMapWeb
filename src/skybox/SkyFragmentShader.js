export const SKY_FRAGMENT_SHADER = `
uniform float sunlight;
uniform float ambientLight;
uniform vec3 skyColor;

varying vec3 vPosition;

void main() {
	float horizonWidth = 0.005;
	float horizonHeight = 0.0;
	
	vec4 color = vec4(skyColor * max(sunlight, ambientLight), 1.0);
	float voidMultiplier = (clamp(vPosition.y - horizonHeight, -horizonWidth, horizonWidth) + horizonWidth) / (horizonWidth * 2.0);
	color.rgb *= voidMultiplier;

	gl_FragColor = color;
}
`;
