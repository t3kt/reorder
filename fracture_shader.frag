uniform vec4 uAmbientColor;
uniform vec4 uDiffuseColor;
uniform vec3 uSpecularColor;
uniform float uShininess;
uniform vec3 uConstant;
uniform float uShadowStrength;
uniform vec3 uShadowColor;

uniform sampler2D sColorMap;

in Vertex {
	vec4 color;
	vec3 camSpaceVert;
	vec3 camVector;
	vec3 norm;
	vec2 texCoord0;
}vVert;
// Output variable for the color
layout(location = 0) out vec4 fragColor[TD_NUM_COLOR_BUFFERS];
void main()
{
	TDCheckOrderIndTrans();

	vec4 outcol = vec4(0.0, 0.0, 0.0, 0.0);
	vec3 diffuseSum = vec3(0.0, 0.0, 0.0);
	vec3 specularSum = vec3(0.0, 0.0, 0.0);

	vec2 texCoord0 = vVert.texCoord0.st;
	vec4 colorMapColor = texture(sColorMap, texCoord0.st);
	vec3 camSpaceNorm;
	{
		vec3 norm = vVert.norm.stp;
		camSpaceNorm = normalize(norm.xyz);
	}
	vec3 normal = camSpaceNorm;

	vec3 camVector = vVert.camVector.stp;
	vec3 camVec = normalize(vVert.camVector.xyz);
	if (!gl_FrontFacing) {
		normal = -normal;
		camSpaceNorm = -camSpaceNorm;
	}

	// Your shader will be recompiled based on the number
	// of lights in your scene, so this continues to work
	// even if you change your lighting setup after the shader
	// has been exported from the Phong MAT
	for (int i = 0; i < TD_NUM_LIGHTS; i++)
	{
		vec3 diffuseContrib = vec3(0);
		vec3 specularContrib = vec3(0);
		TDLighting(diffuseContrib,
			specularContrib,
			i,
			vVert.camSpaceVert.xyz,
			normal,
			uShadowStrength, uShadowColor,
			camVec,
			uShininess);
		diffuseSum += diffuseContrib;
		specularSum += specularContrib;
	}

	// Final Diffuse Contribution
	diffuseSum *= uDiffuseColor.rgb * vVert.color.rgb;
	vec3 finalDiffuse = diffuseSum;
	outcol.rgb += finalDiffuse;
	// Final Specular Contribution
	vec3 finalSpecular = vec3(0.0);
	specularSum *= uSpecularColor;
	finalSpecular += specularSum;
	outcol.rgb += finalSpecular;
	// Ambient Light Contribution
	outcol.rgb += vec3(uTDGeneral.ambientColor.rgb * uAmbientColor.rgb * vVert.color.rgb);

	// Constant Light Contribution
	outcol.rgb += uConstant * vVert.color.rgb;
	outcol *= colorMapColor;

	// Apply fog, this does nothing if fog is disabled
	outcol = TDFog(outcol, vVert.camSpaceVert);

	// Alpha Calculation
	float alpha = uDiffuseColor.a * vVert.color.a * colorMapColor.a ;

	// Dithering, does nothing if dithering is disabled
	outcol = TDDither(outcol);
	fragColor[0].rgb = outcol.rgb * alpha;
	fragColor[0].a = alpha;

	// TD_NUM_COLOR_BUFFERS will be set to the number of color buffers
	// active in the render. By default we want to output zero to every
	// buffer except the first one.
	for (int i = 1; i < TD_NUM_COLOR_BUFFERS; i++)
	{
		fragColor[i] = vec4(0.0);
	}
}
