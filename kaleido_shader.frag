uniform vec4 segments;
uniform vec4 offsets;
uniform vec4 translate;

vec2 mapPosition(vec2 uv, float segs, vec2 offs, vec2 t) {
	vec2 normed = 2.0 * (uv + t) - 1.0;
	float r = length(normed);
	float theta = atan(normed.y / abs(normed.x));
	theta += offs.x;
	theta *= segs;
	theta += offs.y;
	vec2 newUV = (vec2(r * cos(theta), r * sin(theta)) + 1.0) / 2.0;
	return newUV - t;
}

layout(location=0) out vec4 fragColor;
void main() {
	vec2 uv = vUV.st;
	if (segments.x > 0)
		uv = mapPosition(uv, segments.y, offsets.xy, translate.xy);
	if (segments.z > 0)
		uv = mapPosition(uv, segments.w, offsets.zw, translate.zw);
	fragColor = texture(sTD2DInputs[0], uv);
}