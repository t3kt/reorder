uniform float segments;
uniform float pre_offset;
uniform float post_offset;
uniform vec2 translate;

layout(location=0) out vec4 fragColor;
void main() {
	vec2 uv = vUV.st;
	uv += translate;
	vec2 normed = 2.0 * uv - 1.0;
	float r = length(normed);
	float theta = atan(normed.y / abs(normed.x));
	theta += pre_offset;
	theta *= segments;
	theta += post_offset;
	vec2 newUV = (vec2(r * cos(theta), r * sin(theta)) + 1.0) / 2.0;
	newUV -= translate;
	fragColor = texture(sTD2DInputs[0], newUV);
}