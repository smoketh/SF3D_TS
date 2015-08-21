module WebGL_Utilities
{
     /**
   * Creates the HTLM for a failure message
   * @param {string} canvasContainerId id of container of th
   *        canvas.
   * @return {string} The html.
   */
    export var canv;// = <HTMLCanvasElement> document.getElementById("canvas");
    export var topWindow;// = <WebGLRenderingContext> canv.getContext('webgl'); 
    /**
   * Mesasge for getting a webgl browser
   * @type {string}
   */
    export var GET_A_WEBGL_BROWSER = '' +
        'This page requires a browser that supports WebGL.<br/>' +
        '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>';

    /**
     * Mesasge for need better hardware
     * @type {string}
     */
    export var OTHER_PROBLEM = '' +
        "It doesn't appear your computer can support WebGL.<br/>" +
        '<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>';

    export function makeFailHTML(msg)
    {
        return '' +
            '<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>' +
            '<td align="center">' +
            '<div style="display: table-cell; vertical-align: middle;">' +
            '<div style="">' + msg + '</div>' +
            '</div>' +
            '</td></tr></table>';
    }


    export function create3DContext(canvas: HTMLCanvasElement, opt_attribs)
    {
        var names = ["webgl", "experimental-webgl"];
        var context = null;
        for (var ii = 0; ii < names.length; ++ii)
        {
            try
            {
                context = canvas.getContext(names[ii], opt_attribs);
            } catch (e) { }  // eslint-disable-line
            if (context)
            {
                break;
            }
        }
        return context;
    }
    /**
 * Creates a webgl context. If creation fails it will
 * change the contents of the container of the <canvas>
 * tag to an error message with the correct links for WebGL.
 * @param {HTMLCanvasElement} canvas. The canvas element to
 *     create a context from.
 * @param {WebGLContextCreationAttirbutes} opt_attribs Any
 *     creation attributes you want to pass in.
 * @return {WebGLRenderingContext} The created context.
 * @memberOf module:webgl-utils
 */
    export function setupWebGL(canvas, opt_attribs)
    {
        function showLink(str)
        {
            var container = canvas.parentNode;
            if (container)
            {
                container.innerHTML = makeFailHTML(str);
            }
        }

        

        var context = create3DContext(canvas, opt_attribs);
        if (!context)
        {
            showLink(OTHER_PROBLEM);
        }
        return context;
    }
    function isInIFrame(w=null)
    {
        w = w || topWindow;
        return w !== w.top;
    }
    function updateCSSIfInIFrame()
    {
        if (isInIFrame())
        {
            document.body.className = "iframe";
        }
    }
    /**
   * @typedef {Object} GetWebGLContextOptions
   * @property {boolean} [dontResize] by default `getWebGLContext` will resize the canvas to match the size it's displayed.
   * @property {boolean} [noTitle] by default inserts a copy of the `<title>` content into the page
   * @memberOf module:webgl-utils
   */

    /**
     * Gets a WebGL context.
     * makes its backing store the size it is displayed.
     * @param {HTMLCanvasElement} canvas a canvas element.
     * @param {WebGLContextCreationAttirbutes} [opt_attribs] optional webgl context creation attributes
     * @param {module:webgl-utils.GetWebGLContextOptions} [opt_options] options
     * @memberOf module:webgl-utils
     */
    export function getWebGLContext(canvas, opt_attribs, opt_options)
    {
        var options = opt_options || {};

        if (isInIFrame())
        {
            updateCSSIfInIFrame();

            // make the canvas backing store the size it's displayed.
            if (!options.dontResize && options.resize !== false)
            {
                var width = canvas.clientWidth;
                var height = canvas.clientHeight;
                canvas.width = width;
                canvas.height = height;
            }
        } else if (!options.noTitle && options.title !== false)
        {
            var title = document.title;
            var h1 = document.createElement("h1");
            h1.innerText = title;
            document.body.insertBefore(h1, document.body.children[0]);
        }

        var gl = setupWebGL(canvas, opt_attribs);
        return gl;
    }

     /**
   * Error Callback
   * @callback ErrorCallback
   * @param {string} msg error message.
   * @memberOf module:webgl-utils
   */


    /**
     * Loads a shader.
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
     * @param {string} shaderSource The shader source.
     * @param {number} shaderType The type of shader.
     * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors.
     * @return {WebGLShader} The created shader.
     */
    export function loadShader(gl: WebGLRenderingContext, shaderSource:string, shaderType, opt_errorCallback=null)
    {
        var errFn = opt_errorCallback;
        // Create the shader object
        var shader = gl.createShader(shaderType);

        // Load the shader source
        gl.shaderSource(shader, shaderSource);

        // Compile the shader
        gl.compileShader(shader);

        // Check the compile status
        var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled)
        {
            // Something went wrong during compilation; get the error
            var lastError = gl.getShaderInfoLog(shader);
            console.log("*** Error compiling shader '" + shader + "':" + lastError);
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    /**
     * Creates a program, attaches shaders, binds attrib locations, links the
     * program and calls useProgram.
     * @param {WebGLShader[]} shaders The shaders to attach
     * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
     * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
     * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
     *        on error. If you want something else pass an callback. It's passed an error message.
     * @memberOf module:webgl-utils
     */
    export function createProgram(gl, shaders, opt_attribs?, opt_locations?, opt_errorCallback?)
    {
        var errFn = opt_errorCallback;
        var program = gl.createProgram();
        shaders.forEach(function (shader)
        {
            gl.attachShader(program, shader);
        });
        if (opt_attribs)
        {
            opt_attribs.forEach(function (attrib, ndx)
            {
                gl.bindAttribLocation(
                    program,
                    opt_locations ? opt_locations[ndx] : ndx,
                    attrib);
            });
        }
        gl.linkProgram(program);

        // Check the link status
        var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked)
        {
            // something went wrong with the link
            var lastError = gl.getProgramInfoLog(program);
            console.log("Error in program linking:" + lastError);

            gl.deleteProgram(program);
            return null;
        }
        return program;
    }
    /**
   * Loads a shader from a script tag.
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
   * @param {string} scriptId The id of the script tag.
   * @param {number} opt_shaderType The type of shader. If not passed in it will
   *     be derived from the type of the script tag.
   * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors.
   * @return {WebGLShader} The created shader.
   */
    export function createShaderFromScript(gl: WebGLRenderingContext, scriptId:string, opt_shaderType=null, opt_errorCallback=null)
    {
        var shaderSource = "";
        var shaderType;
        var shaderScript = <HTMLScriptElement> document.getElementById(scriptId);
        if (!shaderScript)
        {
            throw ("*** Error: unknown script element" + scriptId);
        }
        shaderSource = shaderScript.textContent;

        if (!opt_shaderType)
        {
            if (shaderScript.type === "x-shader/x-vertex")
            {
                shaderType = gl.VERTEX_SHADER;
            } else if (shaderScript.type === "x-shader/x-fragment")
            {
                shaderType = gl.FRAGMENT_SHADER;
            } else if (shaderType !== gl.VERTEX_SHADER && shaderType !== gl.FRAGMENT_SHADER)
            {
                throw ("*** Error: unknown shader type");
            }
        }

        return loadShader(
            gl, shaderSource, opt_shaderType ? opt_shaderType : shaderType,
            opt_errorCallback);
    }

    export var defaultShaderType = [
        "VERTEX_SHADER",
        "FRAGMENT_SHADER",
    ];

    /**
   * Creates a program from 2 script tags.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext
   *        to use.
   * @param {string[]} shaderScriptIds Array of ids of the script
   *        tags for the shaders. The first is assumed to be the
   *        vertex shader, the second the fragment shader.
   * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
   * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
   *        on error. If you want something else pass an callback. It's passed an error message.
   * @return {WebGLProgram} The created program.
   * @memberOf module:webgl-utils
   */
    export function createProgramFromScripts(gl: WebGLRenderingContext, shaderScriptIds:string[], opt_attribs=null, opt_locations=null, opt_errorCallback=null)
    {
        var shaders = [];
        for (var ii = 0; ii < shaderScriptIds.length; ++ii)
        {
            shaders.push(createShaderFromScript(
                gl, shaderScriptIds[ii], gl[defaultShaderType[ii]], opt_errorCallback));
        }
        return createProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback);
    }
    /**
   * Creates a program from 2 sources.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext
   *        to use.
   * @param {string[]} shaderSourcess Array of sources for the
   *        shaders. The first is assumed to be the vertex shader,
   *        the second the fragment shader.
   * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
   * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
   *        on error. If you want something else pass an callback. It's passed an error message.
   * @return {WebGLProgram} The created program.
   * @memberOf module:webgl-utils
   */
    export function createProgramFromSources(gl: WebGLRenderingContext, shaderSources:any[], opt_attribs?, opt_locations?, opt_errorCallback?)
    {
        var shaders = [];
        for (var ii = 0; ii < shaderSources.length; ++ii)
        {
            shaders.push(loadShader(
                gl, shaderSources[ii], gl[defaultShaderType[ii]], opt_errorCallback));
        }
        return createProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback);
    }
    function createUniformSetters(gl: WebGLRenderingContext, program: WebGLShader)
    {
        var textureUnit = 0;

        /**
         * Creates a setter for a uniform of the given program with it's
         * location embedded in the setter.
         * @param {WebGLProgram} program
         * @param {WebGLUniformInfo} uniformInfo
         * @returns {function} the created setter.
         */
        function createUniformSetter(program, uniformInfo: WebGLActiveInfo)
        {
            var location = gl.getUniformLocation(program, uniformInfo.name);
            var type = uniformInfo.type;
            // Check if this uniform is an array
            var isArray = (uniformInfo.size > 1 && uniformInfo.name.substr(-3) === "[0]");
            if (type === gl.FLOAT && isArray)
            {
                return function (v)
                {
                    gl.uniform1fv(location, v);
                };
            }
            if (type === gl.FLOAT)
            {
                return function (v)
                {
                    gl.uniform1f(location, v);
                };
            }
            if (type === gl.FLOAT_VEC2)
            {
                return function (v)
                {
                    gl.uniform2fv(location, v);
                };
            }
            if (type === gl.FLOAT_VEC3)
            {
                return function (v)
                {
                    gl.uniform3fv(location, v);
                };
            }
            if (type === gl.FLOAT_VEC4)
            {
                return function (v)
                {
                    gl.uniform4fv(location, v);
                };
            }
            if (type === gl.INT && isArray)
            {
                return function (v)
                {
                    gl.uniform1iv(location, v);
                };
            }
            if (type === gl.INT)
            {
                return function (v)
                {
                    gl.uniform1i(location, v);
                };
            }
            if (type === gl.INT_VEC2)
            {
                return function (v)
                {
                    gl.uniform2iv(location, v);
                };
            }
            if (type === gl.INT_VEC3)
            {
                return function (v)
                {
                    gl.uniform3iv(location, v);
                };
            }
            if (type === gl.INT_VEC4)
            {
                return function (v)
                {
                    gl.uniform4iv(location, v);
                };
            }
            if (type === gl.BOOL)
            {
                return function (v)
                {
                    gl.uniform1iv(location, v);
                };
            }
            if (type === gl.BOOL_VEC2)
            {
                return function (v)
                {
                    gl.uniform2iv(location, v);
                };
            }
            if (type === gl.BOOL_VEC3)
            {
                return function (v)
                {
                    gl.uniform3iv(location, v);
                };
            }
            if (type === gl.BOOL_VEC4)
            {
                return function (v)
                {
                    gl.uniform4iv(location, v);
                }
                    ;
            }
            if (type === gl.FLOAT_MAT2)
            {
                return function (v)
                {
                    gl.uniformMatrix2fv(location, false, v);
                };
            }
            if (type === gl.FLOAT_MAT3)
            {
                return function (v)
                {
                    gl.uniformMatrix3fv(location, false, v);
                };
            }
            if (type === gl.FLOAT_MAT4)
            {
                return function (v)
                {
                    gl.uniformMatrix4fv(location, false, v);
                };
            }
            if ((type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) && isArray)
            {
                var units = [];
                for (var ii = 0; ii < uniformInfo.size; ++ii)
                {
                    units.push(textureUnit++);
                }
                return function (bindPoint, units)
                {
                    return function (textures)
                    {
                        gl.uniform1iv(location, units);
                        textures.forEach(function (texture: WebGLTexture, index)
                        {
                            gl.activeTexture(gl.TEXTURE0 + units[index]);
                            gl.bindTexture(bindPoint, texture);
                        });
                    };
                } (getBindPointForSamplerType(gl, type), units);
            }
            if (type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE)
            {
                return function (bindPoint, unit)
                {
                    return function (texture)
                    {
                        gl.uniform1i(location, unit);
                        gl.activeTexture(gl.TEXTURE0 + unit);
                        gl.bindTexture(bindPoint, texture);
                    };
                } (getBindPointForSamplerType(gl, type), textureUnit++);
            }
            throw ("unknown type: 0x" + type.toString(16)); // we should never get here.
        }

        var uniformSetters = {};
        var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

        for (var ii = 0; ii < numUniforms; ++ii)
        {
            var uniformInfo = gl.getActiveUniform(program, ii);
            if (!uniformInfo)
            {
                break;
            }
            var name = uniformInfo.name;
            // remove the array suffix.
            if (name.substr(-3) === "[0]")
            {
                name = name.substr(0, name.length - 3);
            }
            var setter = createUniformSetter(program, uniformInfo);
            uniformSetters[name] = setter;
        }
        return uniformSetters;
    }
    /**
  * Creates setter functions for all attributes of a shader
  * program. You can pass this to {@link module:webgl-utils.setBuffersAndAttributes} to set all your buffers and attributes.
  *
  * @see {@link module:webgl-utils.setAttributes} for example
  * @param {WebGLProgram} program the program to create setters for.
  * @return {Object.<string, function>} an object with a setter for each attribute by name.
  * @memberOf module:webgl-utils
  */

    export function setBuffersAndAttributes(gl, setters, buffers: StaticObjectBuffer)
    {
        setAttributes(setters, buffers.bufferInfo.attribs);
       /* if (buffers.indices)
        {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
        }*/
    }
    function setAttributes(setters, buffers)
    {
        Object.keys(buffers).forEach(function (name)
        {
            var setter = setters[name];
            if (setter)
            {
                setter(buffers[name]);
            }
        });
    }

    function createAttributeSetters(gl: WebGLRenderingContext, program)
    {
        var attribSetters = {
        };

        function createAttribSetter(index)
        {
            return function (b)
            {
                gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
                gl.enableVertexAttribArray(index);
                gl.vertexAttribPointer( index, b.numComponents || b.size, b.type || gl.FLOAT , b.normalize || false, b.stride || 0, b.offset || 0 );
            };
        }

        var numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for (var ii = 0; ii < numAttribs; ++ii)
        {
            var attribInfo = gl.getActiveAttrib(program, ii);
            if (!attribInfo)
            {
                break;
            }
            var index = gl.getAttribLocation(program, attribInfo.name);
            attribSetters[attribInfo.name] = createAttribSetter(index);
        }

        return attribSetters;
    }

    export function createProgramInfo(gl: WebGLRenderingContext, shaderSources: string[], opt_attribs?, opt_locations?, opt_errorCallback?)
    {
        shaderSources = shaderSources.map(function (source)
        {
            var script = <HTMLScriptElement> document.getElementById(source);
            return script ? script.text : source;
        });
        var program = createProgramFromSources(gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback);
        if (!program)
        {
            return null;
        }
        var uniformSetters = createUniformSetters(gl, program);
        var attribSetters = createAttributeSetters(gl, program);
        return {
            program: program,
            uniformSetters: uniformSetters,
            attribSetters: attribSetters,
        };
    }

    export function getBindPointForSamplerType(gl: WebGLRenderingContext, type)
    {
        if (type === gl.SAMPLER_2D) return gl.TEXTURE_2D;        // eslint-disable-line
        if (type === gl.SAMPLER_CUBE) return gl.TEXTURE_CUBE_MAP;  // eslint-disable-line
    }
}