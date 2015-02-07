uniform vec4 uAmbientColor;
uniform vec4 uDiffuseColor;
uniform vec3 uSpecularColor;
uniform float uShininess;
uniform vec3 uConstant;
uniform float uShadowStrength;
uniform vec3 uShadowColor;

uniform vec2 uSize;

uniform sampler2D sColorMap;
uniform sampler2D sSegmentMap;

in vec4 PR;

out Vertex {
	vec4 color;
	vec3 camSpaceVert;
	vec3 camVector;
	vec3 norm;
	vec2 texCoord0;
}vVert;


// http://www.neilmendoza.com/glsl-rotation-about-an-arbitrary-axis/
mat4 rotationMatrix(vec3 axis, float angle)
{
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

void main()
{
	vec4 pos = vec4(P, 1);
	vec2 sampleUV = PR.xy / uSize;
	vec4 ptColor = texture(sSegmentMap, sampleUV);
	//mat3 rotation = TDCreateRotMatrix(vec3(0, 0, 0), ptColor.rgb);
	pos *= rotationMatrix(vec3(1, 0, 0), ptColor.r);
	pos *= rotationMatrix(vec3(0, 1, 0), ptColor.g);
	pos *= rotationMatrix(vec3(0, 0, 1), ptColor.b);

	// First deform the vertex and normal
	// TDDeform always returns values in world space
	vec4 worldSpaceVert =TDDeform(pos);
	vec4 camSpaceVert = uTDMat.cam * worldSpaceVert;
	gl_Position = TDCamToProj(camSpaceVert);

	// This is here to ensure we only execute lighting etc. code
	// when we need it. If picking is active we do not need this, so
	// this entire block of code will be ommited from the compile.
	// The TD_PICKING_ACTIVE define will be set automatically when
	// picking is active.
#ifndef TD_PICKING_ACTIVE

	{ // Avoid duplicate variable defs
		vec3 texcoord = TDInstanceTexCoord(uv[0]);
		vVert.texCoord0.st = texcoord.st;
	}
	vec3 camSpaceNorm = uTDMat.camForNormals * TDDeformNorm(N).xyz;
	vVert.norm.stp = camSpaceNorm.stp;
	vVert.camSpaceVert.xyz = camSpaceVert.xyz;
	vVert.color = TDInstanceColor(Cd);
	vec3 camVec = -camSpaceVert.xyz;
	vVert.camVector.stp = camVec.stp;

#else // TD_PICKING_ACTIVE

	// This will automatically write out the nessesarily values
	// for this shader to work with picking.
	// See the documentation if you want to write custom values for picking.
	TDWritePickingValues();

#endif // TD_PICKING_ACTIVE
}
