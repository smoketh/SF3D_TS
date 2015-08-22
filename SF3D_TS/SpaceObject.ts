class SpaceObject
{
    name: string;
    pos: number[];
    matrot: number[];
    scale: number[];


    radius: number;
    maxSpeed: number;
    maxAngular: number;
    collisionType: number;

    matrix;
    buffer: StaticObjectBuffer;
    fullLit: boolean;


    maxHealth: number;
    maxShields: number;
    shieldRegen: number;
    startingMissles: number;
    /**
    
    */
    constructor(name: string, position: number[], rotation: number[], scale: number[], //uniform sizing/positioning parameters (don't change while in midgame)
        colliderRadius: number, maxSpeed: number, maxAngular: number, collisionType: number, //physical parameters,
        /* col type is transtype - depending on  collision type you either get - 
        0: none, - object itself ignores any collision (stars, effects)
        1: solid - doesn't receive any damage but can damage other object - only if resulting velocity is above margin
        2: receives damage and can damage other object (mutual damage by applying each other's hp to each other) - only if resulting velocity is above margin - missles always deal this one
        3: pickup repair - repairs target if that one happens to have receive damage
        4: pickup missle, - gives target missles
        */
        maxHealth: number, maxShields:number, shieldRegen:number, weaponsInstalled: string[], startingMissles: number,//gameplay parameters
        matrix, buffer: StaticObjectBuffer, fullLit: boolean)//visual parameters
    {
        this.name = name;
        this.scale = scale;
        this.pos = position;
        this.matrot = MT.makeRotation (rotation[0], rotation[1], rotation[2]);

        this.radius = colliderRadius;
        this.maxSpeed = maxSpeed;
        this.maxAngular = maxAngular;
        this.collisionType = collisionType;

        this.maxHealth = maxHealth;
        this.maxShields = maxShields;
        this.shieldRegen = shieldRegen;
        this.startingMissles = startingMissles;

        this.matrix = matrix;
        this.buffer = buffer;
        this.fullLit = fullLit;

        this.CurrentRotation = new Vector3();
        this.CurrentSpeed = new Vector3();
    }
    CurrentSpeed: Vector3;
    CurrentRotation: Vector3;
    decay: number = 5.0;
    ControlObject(setMov: Vector3, ampRot: Vector3, dt: number)
    {
        setMov = MT.v3Multiply(setMov, dt);
        this.CurrentSpeed = MT.v3Add(this.CurrentSpeed, setMov);
        this.CurrentSpeed = MT.v3Lerp(this.CurrentSpeed, new Vector3(), this.decay * dt); //MT.v3Multiply(this.CurrentSpeed, this.decay/dt);
        this.pos = MT.v3Add(Vector3.FromArray(this.pos), this.CurrentSpeed).toArray();
        //MT.v3Add(Vector3.FromArray(this.pos), this.CurrentRotation).toArray()
        


        ampRot = MT.v3Multiply(ampRot, dt);
        this.CurrentRotation = MT.v3Add(this.CurrentRotation, ampRot);
        this.CurrentRotation = MT.v3LinearClamp(this.CurrentRotation, -this.maxAngular, this.maxAngular);
        this.CurrentRotation = MT.v3Lerp(this.CurrentRotation, new Vector3(), this.decay * dt);
        this.CurrentRotation = MT.v3LinearClamp(this.CurrentRotation, -Math.PI, Math.PI);

        //var rotForce:number[] = MT.makeRotation(this.CurrentRotation[0], this.CurrentRotation[1], this.CurrentRotation[2]);
        //var rotForce = MT.makeInverse(rotForce);

        this.matrot = MT.turnMatrix(this.matrot, this.CurrentRotation.x, this.CurrentRotation.y, this.CurrentRotation.z); // MT.matrixMultiply(this.matrot, rotForce);
        //this.cu


        //this.rot = MT.v3Add(Vector3.FromArray(this.rot), this.CurrentRotation).toArray();
        //this.rot = MT.v3FixPi(Vector3.FromArray(this.rot)).toArray();
       /* for (var q = 0; q < this.rot.length; q++)
        {
            this.rot[q] = this.rot[q] % Math.PI*2;
        }*/

    }


}

class StaticObjectBuffer
{
    vertices: Float32Array;
    normals: Float32Array;
    colors: Float32Array;
    bufferInfo;
    constructor(gl: WebGLRenderingContext, verts, cols, normals)
    {
        this.vertices = verts;
        this.normals = normals;
        this.colors = cols;
        // this.bufferInfo = new WebGLBuffer();

        this.bufferInfo = {
            numVertices: this.vertices.length,
            attribs: {
                a_position: { numComponents: 3, buffer: this.constructBuffer(gl, null, this.vertices), },
                a_normal: { numComponents: 3, buffer: this.constructBuffer(gl, null, this.normals), },
                a_color: { numComponents: 3, buffer: this.constructBuffer(gl, null, this.colors), },
            },
        };
    }

    constructBuffer(gl: WebGLRenderingContext, bufferAttribute: string, array)
    {
        // var positionLocation = gl.getAttribLocation(program, bufferAttribute);
        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
        //buffer.numItems = 25;
        //buffer..itemSize = 3;

        // gl.enableVertexAttribArray(positionLocation);
        // gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);


        return buffer;
    }
}