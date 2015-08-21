module Main
{
    export var initialized: boolean = false;
    export var focused = true;
    export var canv: HTMLCanvasElement;
    export var canv2d: HTMLCanvasElement;
    export var gl: WebGLRenderingContext;
    export var ctx: CanvasRenderingContext2D;
    var positionLocation;
    var colorLocation;
    var normalLocation;
    var matrixLocation; 
    var normalMatrixLocation;
    var projectionMatrixLocation;
    var ambientColorLocation;
    var LightingDirectionLocation;
    var LightingColorLocation;


    export var cameraAngleRadians = MT.degToRad(0);
    export var fieldOfViewRadians = MT.degToRad(75);
    export var lastUpdate = Date.now();
    export var dt;
    var positionbuffer: WebGLBuffer;
    var colorbuffer: WebGLBuffer;/*
    export function Setup(canvas: HTMLCanvasElement, glContext: WebGLRenderingContext)
    {
        canv = canvas;
        gl = glContext;
        ctx = canv.getContext("2d");
    }*/
    var programInfo;// = 
    //var FarerObjectInfo=
    var StarBufferInfo: StaticObjectBuffer;

    var TestFarerObject: SpaceObject;

    var aspect;
    var projectionMatrix;

    var Stars: SpaceObject[];
    var DrawObjects: SpaceObject[];
    var Planet: SpaceObject;

    export function OnLoad()
    {
        var el = document.getElementById('content');
        var canv = <HTMLCanvasElement> document.getElementById("canvas");
        var canv2d = <HTMLCanvasElement> document.getElementById("hud");
        
        //anv.width = 800;
        //canv.height = 600;

        //window.setInterval

        var gl = <WebGLRenderingContext> canv.getContext('webgl');
        var ctx = <CanvasRenderingContext2D> canv2d.getContext('2d');
        WebGL_Utilities.topWindow = gl;

        var core = Main;
        core.canv = canv;
        core.gl = gl;
        core.canv2d = canv2d;
        core.ctx = ctx;
        //core.Setup(canv, gl);
        core.Init();

        core.updateScene();

    }

    

    export function Init()
    {
        initialized = true;
        if (!gl) return;

        programInfo = WebGL_Utilities.createProgramInfo(gl, ["3d-vertex-shader", "3d-fragment-shader"]);
        //FarerBufferInfo = );
        //PeonBufferInfo = new StaticObjectBuffer(gl, Model_Peon.positions, Model_Peon.colors);
        StarBufferInfo = new StaticObjectBuffer(gl, Model_Star.positions, Model_Star.colors, Model_Star.normals);
        var verts: Float32Array = Model_Sphere.getSpherePositions(12, 5);

        
        TestFarerObject = new SpaceObject("Farer", [0, 0, 0], [0, 0, 0], [25, 25, 25], 12.5,
            15, 15 * MT.deg2RadVar, 2, 100, 100, 5, [], 15,
            MT.makeIdentity4x4(), new StaticObjectBuffer(gl, Model_Farer.positions, Model_Farer.colors, Model_Farer.normals), false);

        Planet = new SpaceObject("Planet", [245, 65, -225], [0, 0, 45], [-35, -35, -35], 420,
            0, 0, 1, 15000, 0, 0, [], 0,
            MT.makeIdentity4x4(), new StaticObjectBuffer(gl, verts, Model_Sphere.getSphereColor(verts.length, [0.8, 0, 0]), Model_Sphere.getNormals(verts)), false);

        
        //Stars = new Array < SpaceObject>();

        DrawObjects = new Array<SpaceObject>();

        DrawObjects.push(Planet);
        DrawObjects.push(TestFarerObject);


        for (var q = 0; q < 100; q++)
        {
            var star = new SpaceObject("Star", [Math.random() * 200 - 100, Math.random() * 200 - 100, Math.random() * 200 - 100], [0, -90, 0], [3, 3, 3], -1,
                Math.random() * 25 + 25, 0, 0, 0, -1, -1, [], 0, MT.makeIdentity4x4(), StarBufferInfo, true);
            DrawObjects.push(star);
        };
         
        //gl.viewport(0, canv.height * 0.2, gl.drawingBufferWidth, gl.drawingBufferHeight * 0.8);

        aspect = gl.drawingBufferWidth/ gl.drawingBufferHeight;//* 0.8;
        projectionMatrix = MT.makePerspective(fieldOfViewRadians, aspect, 1, 2000);

        matrixLocation = gl.getUniformLocation(programInfo.program, "u_matrix");

        projectionMatrixLocation = gl.getUniformLocation(programInfo.program, "p_matrix");

        normalMatrixLocation = gl.getUniformLocation(programInfo.program, "u_Norm_Matrix");

        ambientColorLocation = gl.getUniformLocation(programInfo.program, "uAmbientColor");

        LightingDirectionLocation = gl.getUniformLocation(programInfo.program, "uLightingDirection");
        LightingColorLocation = gl.getUniformLocation(programInfo.program, "uDirectionalColor");


        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        //webgl-utils
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        cameraMatrix = MT.makeIdentity4x4();
      
    }

    

    export function updateScene()
    {

        calcDeltaTime();
        keyServer();
        updateLogic();
        updateCamera();
        draw3dScene();
        draw2dScene();
        if (focused) requestAnimationFrame(updateScene);
    }

    function calcDeltaTime()
    {
        var now = Date.now();
        dt = now - lastUpdate;
        dt *= 0.001; //Converting MS to S
        lastUpdate = now;
    }
    export var valK = 0;
    var v3RotControl: Vector3;// = new Vector3;
    function keyServer()
    {
        v3RotControl || (v3RotControl = new Vector3);
        if (Key.isDown(Key.LEFT))//left
        {
            console.log("LEFT");
            v3RotControl.y = 45;

        }
        else if (Key.isDown(Key.RIGHT))//right
        {
            console.log("RIGHT");
            v3RotControl.y = -45;
        }
        if (Key.isDown(Key.UP))//up
        {
            console.log("UP");
            v3RotControl.x = 45;
        }
        else if (Key.isDown(Key.DOWN))//down
        {
            console.log("DOWN");
            v3RotControl.x = -45;
        }

        v3RotControl = MT.v3Multiply(v3RotControl, MT.deg2RadVar);

    }

    var presses: KeyboardEvent[];

    export function keyListener(e)
    {
        if (!focused) return;
        

        presses.push(e);
    }

    function updateLogic()
    {
        Planet.rot[1] += MT.degToRad(15) * dt;
        if (Planet.rot[1] > Math.PI * 2) Planet.rot[1] -= Math.PI * 2;

        TestFarerObject.ControlObject(new Vector3(), v3RotControl, dt);
        //valK += MT.degToRad(25) * dt;
        //if (valK > 360) valK -= 360;
        //TestFarerObject.rot = [valK, valK, valK];
        

    }
    function updateCamera()
    {
        cameraMatrix = MT.makeIdentity4x4();
        cameraMatrix = MT.matrixMultiply(cameraMatrix, MT.makeTranslation(TestFarerObject.pos[0], TestFarerObject.pos[1]+15, TestFarerObject.pos[2]+55));
        //cameraMatrix = MT.matrixMultiply(cameraMatrix, MT.makeTranslation(0, 15, 55));

        cameraMatrix = MT.matrixMultiply(cameraMatrix, MT.makeRotation(TestFarerObject.rot[0], TestFarerObject.rot[1], TestFarerObject.rot[2]));
        
       // cameraMatrix = MT.makeTranslation(
    }

    var cameraMatrix;
    var adjustedLD: Float32Array;
    var approxTransformation;
    function draw3dScene()
    {
        var numFs = 5;
        var radius = 70;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        //var cameraMatrix = MT.makeTranslation(0, 0, radius * 1.5);									//Camera Positioning code
        var viewMatrix = MT.makeInverse(cameraMatrix);
        var PerspectiveMatrix = MT.matrixMultiply(viewMatrix, projectionMatrix); //MT.makePerspective(fieldOfViewRadians, aspect, 1, 2000);


        for (var q = 0; q < DrawObjects.length; q++)
        {
            gl.useProgram(programInfo.program);
            WebGL_Utilities.setBuffersAndAttributes(gl, programInfo.attribSetters, DrawObjects[q].buffer);
            if (DrawObjects[q].name == "Star")
            {
                gl.uniform3f(ambientColorLocation, 1,1,1);
                DrawObjects[q].pos[2] += DrawObjects[q].maxSpeed * dt;
                if (DrawObjects[q].pos[2] > 100) DrawObjects[q].pos[2] -= 200;
            }
            else 
                gl.uniform3f(ambientColorLocation, 0.1, 0.1, 0.1);


            var lightingDirection = [
                0.7, -1, -1
            ];
            

            adjustedLD = new Float32Array(3);
            adjustedLD= MT.V3Normalize(lightingDirection, adjustedLD);
            adjustedLD = MT.V3Scale(adjustedLD, -1);
            adjustedLD=MT.V3Normalize(adjustedLD);
            

            gl.uniform3fv(LightingDirectionLocation, adjustedLD); //[-0.25, -0.25, -1]);

            

            gl.uniform3fv(LightingColorLocation, [1,1,1]);


            DrawObjects[q].matrix = MT.computeMatrix(DrawObjects[q].pos, DrawObjects[q].rot, DrawObjects[q].scale);

            //Stars[q].matrix = 

            gl.uniformMatrix4fv(matrixLocation, false, DrawObjects[q].matrix);

            gl.uniformMatrix4fv(projectionMatrixLocation, false, PerspectiveMatrix);

            //var normalMatrix = MT.makeIdentity3x3();
            var normalMatrix = MT.makeInverse(DrawObjects[q].matrix);
            normalMatrix= MT.transpose4x4(normalMatrix);

            gl.uniformMatrix4fv(normalMatrixLocation, false, normalMatrix);

            
            //gl.uniform3f
            //approxTransformation = MT.vec3dot(MT.mat4multiplyVec3(MT.mat3toMat4(normalMatrix), [0, .25, .25]), adjustedLD); 
            gl.drawArrays(gl.TRIANGLES, 0, DrawObjects[q].buffer.vertices.length / 3);
        }


        
    }
    function draw2dScene()
    {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.beginPath();

        ctx.setLineDash([]);
        //ctx.rect(0, 0, canv.width, canv.height * 0.2);
        ctx.fillStyle = 'black';
        ctx.strokeStyle = 'white';
        ctx.rect(0, canv2d.height * 0.8, canv2d.width, canv2d.height * 0.2);
        ctx.fill();
        roundRect(ctx, 0.5, 480, canv2d.width - 2, canv2d.height * 0.2 - 4, 5, true, true);

        ctx.fillStyle = 'white';
        ctx.font = "30px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("----Space Farer 3d----", canv2d.width / 2, 35);
        ctx.font = "25px sans-serif";
        ctx.fillText("(C) Picturesque games 2015", canv2d.width / 2, canv2d.height * 0.75);

        //ctx.drawImage(img, canv2d.width / 2 - 200, canv2d.height - canv2d.height * 0.2+15);
        drawRadarEllipse(ctx, canv2d.width / 2, canv2d.height - canv2d.height * 0.1, 400, 80);
    }
 
    function ctMT(ctx: CanvasRenderingContext2D, x, y)
    {
        ctx.moveTo(x, y);
    }

    function ctLT(ctx: CanvasRenderingContext2D, x, y)
    {
        ctx.lineTo(x, y);
    }

    function drawRadarEllipse(context: CanvasRenderingContext2D, centerX, centerY, width, height)
    {

        context.beginPath();
        var h2 = height / 2;
        var w2 = width / 2;
        context.moveTo(centerX, centerY - h2); // A1
  
        context.bezierCurveTo(
            centerX + w2, centerY - h2, // C1
            centerX + w2, centerY + h2, // C2
            centerX, centerY + h2); // A2

        context.bezierCurveTo(
            centerX - w2, centerY + h2, // C3
            centerX - w2, centerY - h2, // C4
            centerX, centerY - h2); // A1
 
        context.fillStyle = "black";
        context.fill();
        context.strokeStyle = "red";
        context.lineWidth = 1;
        //context.setLineDash([2]);
        context.stroke();
        
        ctMT(context, centerX - w2 + (width / 4.27), centerY + h2 - height / 7);
        ctLT(context, centerX - w2 + (width / 2.96), centerY - h2 + height / 20);
        ctMT(context, centerX + w2 - (width / 4.27), centerY + h2 - height / 7);
        ctLT(context, centerX + w2 - (width / 2.96), centerY - h2 + height / 20);
        ctMT(context, centerX - w2/1.34, centerY);
        ctLT(context, centerX + w2 / 1.34, centerY);
        ctMT(context, centerX - w2 / 1.52, centerY+h2/2);
        ctLT(context, centerX + w2 / 1.52, centerY+h2/2);
        ctMT(context, centerX - w2 / 1.52, centerY - h2 / 2);
        ctLT(context, centerX + w2 / 1.52, centerY - h2 / 2);

        context.stroke();
        context.closePath();
        context.beginPath();
        context.strokeStyle = "yellow";
        ctMT(context, centerX, centerY);
        ctLT(context, centerX - w2 + (width / 2.96), centerY - h2 + height / 20);
        ctMT(context, centerX, centerY);
        ctLT(context, centerX + w2 - (width / 2.96), centerY - h2 + height / 20);
        context.stroke();
        context.closePath();
    }

    function roundRect(ctx, x, y, width, height, radius?, fill?, stroke?)
    {
        if (typeof stroke == "undefined")
        {
            stroke = true;
        }
        if (typeof radius === "undefined")
        {
            radius = 5;
        }
        ctx.beginPath();
        ctMT(ctx, x + radius, y);
        ctLT(ctx, x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctLT(ctx, x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctLT(ctx, x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctLT(ctx, x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        if (stroke)
        {
            ctx.stroke();
        }
        if (fill)
        {
            ctx.fill();
        }
        ctx.closePath();
    }

    

}



    var Key = {
        _pressed: {},

        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,

        isDown: function (keyCode)
        {
            return this._pressed[keyCode];
        },

        onKeydown: function (event)
        {
            this._pressed[event.keyCode] = true;
        },

        onKeyup: function (event)
        {
            delete this._pressed[event.keyCode];
        }
    };



window.onload = () =>
{
    Main.OnLoad();
};


//window.onkeydown = Main.keyListener;



window.onblur = () =>
{
    Main.focused = false;
    //if (Main.initialized)
}

window.onfocus = () =>
{
    Main.focused = true;
    if (Main.initialized)
    {
        
        Main.lastUpdate = Date.now();
        requestAnimationFrame(Main.updateScene);
    }
    else Main.OnLoad();
}

window.addEventListener('keyup', function (event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function (event) { Key.onKeydown(event); }, false);