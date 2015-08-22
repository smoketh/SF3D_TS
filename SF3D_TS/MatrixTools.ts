module Mathf
{
    export function lerp(a:number, b:number, f:number):number
    {
        return a + f * (b - a);
    }
    export function clamp(a: number, b: number, c: number):number
    {
        if (b > c)
        {
            var k = c;
            c = b;
            b = k;
        }
        if (a < b) a = b;
        else if (a > c) a = c;
        return a;
    }
}


module MT
{
    
    var PI2 = Math.PI * 2;
    export function v3FixPi(a: Vector3, c?: Vector3): Vector3
    {
        c || (c = new Vector3);
        c.x = a.x;
        c.y = a.y;
        c.z = a.z;
        if (c.x > PI2) c.x -= PI2;
        else if (c.x < -PI2) c.x += PI2;
        if (c.y > PI2) c.y -= PI2;
        else if (c.y < -PI2) c.y += PI2;
        if (c.z > PI2) c.z -= PI2;
        else if (c.z < -PI2) c.z += PI2;

        return c;
    }

    export function v3LinearClamp(a: Vector3, min: number, max: number, c?: Vector3)
    {
        c || (c = new Vector3);
        c.x = Mathf.clamp(a.x, min, max);
        c.y = Mathf.clamp(a.y, min, max);
        c.z = Mathf.clamp(a.z, min, max);
        return c;
    }

    export function v3Lerp(a: Vector3, b: Vector3, f: number, c?: Vector3): Vector3
    {
        c || (c = new Vector3);
        c.x = Mathf.lerp(a.x, b.x, f);
        c.y = Mathf.lerp(a.y, b.y, f);
        c.z = Mathf.lerp(a.z, b.z, f);
        return c;
    }


    export function v3Add(a: Vector3, b: Vector3, c?: Vector3)
    {
        c || (c = new Vector3);
        c.x = a.x + b.x;
        c.y = a.y + b.y;
        c.z = a.z + b.z;
        return c;


    }
    export function v3Multiply(a: Vector3, b: number, c?: Vector3)
    {
        c || (c = new Vector3);
        c.x = a.x * b;
        c.y = a.y * b;
        c.z = a.z * b;
        return c;
    }

    export function makePerspective(fieldOfViewInRadians:number, aspect:number, near:number, far:number): number[]
    {
        var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
        var rangeInv = 1.0 / (near - far);

        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    };
    export function makeTranslation(tx:number, ty:number, tz:number): number[]
    {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1
        ];
    }
    /**
     * Makes an x rotation matrix
     * @param {number} angleInRadians amount to rotate
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix of none provided
     * @memberOf module:webgl-3d-math
     */
    export function makeXRotation(angleInRadians, dst?)
    {
        dst = dst || new Float32Array(16);
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        dst[0] = 1;
        dst[1] = 0;
        dst[2] = 0;
        dst[3] = 0;
        dst[4] = 0;
        dst[5] = c;
        dst[6] = s;
        dst[7] = 0;
        dst[8] = 0;
        dst[9] = -s;
        dst[10] = c;
        dst[11] = 0;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = 0;
        dst[15] = 1;

        return dst;
    }

    export function makeRotation(x: number, y: number, z: number): number[]
    {
        /*var matrix: number[] = makeIdentity4x4();
        matrix = matrixMultiply(matrix, makeXRotation(x));
        matrix = matrixMultiply(matrix, makeYRotation(y));
        matrix = matrixMultiply(matrix, makeZRotation(z));

        return matrix;*/
        var matrix: number[] = makeIdentity4x4();
        matrix = axialRotation(matrix, x, [1, 0, 0]);
        matrix = axialRotation(matrix, y, [0, 1, 0]);
        matrix = axialRotation(matrix, z, [0, 0, 1]);
        return matrix;
    }

    export function turnMatrix(matrix:number[], x: number, y: number, z: number): number[]
    {
        /*var matrix: number[] = makeIdentity4x4();
        matrix = matrixMultiply(matrix, makeXRotation(x));
        matrix = matrixMultiply(matrix, makeYRotation(y));
        matrix = matrixMultiply(matrix, makeZRotation(z));

        return matrix;*/
        //var matrix: number[] = makeIdentity4x4();
        matrix = axialRotation(matrix, x, [1, 0, 0]);
        matrix = axialRotation(matrix, y, [0, 1, 0]);
        matrix = axialRotation(matrix, z, [0, 0, 1]);
        return matrix;
    }


    function axialRotation(a, rad, axis):number[]
    {
        var out: number[] = new Array<number>();

        var x = axis[0], y = axis[1], z = axis[2],
            len = Math.sqrt(x * x + y * y + z * z),
            s, c, t,
            a00, a01, a02, a03,
            a10, a11, a12, a13,
            a20, a21, a22, a23,
            b00, b01, b02,
            b10, b11, b12,
            b20, b21, b22;

        if (Math.abs(len) < 0.000001) { return null; }

        len = 1 / len;
        x *= len;
        y *= len;
        z *= len;

        s = Math.sin(rad);
        c = Math.cos(rad);
        t = 1 - c;

        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

        // Construct the elements of the rotation matrix
        b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
        b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
        b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

        // Perform rotation-specific matrix multiplication
        out[0] = a00 * b00 + a10 * b01 + a20 * b02;
        out[1] = a01 * b00 + a11 * b01 + a21 * b02;
        out[2] = a02 * b00 + a12 * b01 + a22 * b02;
        out[3] = a03 * b00 + a13 * b01 + a23 * b02;
        out[4] = a00 * b10 + a10 * b11 + a20 * b12;
        out[5] = a01 * b10 + a11 * b11 + a21 * b12;
        out[6] = a02 * b10 + a12 * b11 + a22 * b12;
        out[7] = a03 * b10 + a13 * b11 + a23 * b12;
        out[8] = a00 * b20 + a10 * b21 + a20 * b22;
        out[9] = a01 * b20 + a11 * b21 + a21 * b22;
        out[10] = a02 * b20 + a12 * b21 + a22 * b22;
        out[11] = a03 * b20 + a13 * b21 + a23 * b22;

        if (a !== out)
        { // If the source and destination differ, copy the unchanged last row
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
        }
        return out;
    };

    export function makeFixedRotation(x: number, y: number, z: number): number[]
    {
        var matrix: number[] = makeIdentity4x4();
        matrix = matrixMultiply(matrix, makeXRotation(x-Math.PI/2));
        matrix = matrixMultiply(matrix, makeYRotation(y));
        matrix = matrixMultiply(matrix, makeZRotation(z));

        return matrix;


    }


    /**
     * Makes an y rotation matrix
     * @param {number} angleInRadians amount to rotate
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix of none provided
     * @memberOf module:webgl-3d-math
     */
    export function makeYRotation(angleInRadians, dst?)
    {
        dst = dst || new Float32Array(16);
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        dst[0] = c;
        dst[1] = 0;
        dst[2] = -s;
        dst[3] = 0;
        dst[4] = 0;
        dst[5] = 1;
        dst[6] = 0;
        dst[7] = 0;
        dst[8] = s;
        dst[9] = 0;
        dst[10] = c;
        dst[11] = 0;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = 0;
        dst[15] = 1;

        return dst;
    }

    /**
     * Makes an z rotation matrix
     * @param {number} angleInRadians amount to rotate
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix of none provided
     * @memberOf module:webgl-3d-math
     */
    export function makeZRotation(angleInRadians, dst?)
    {
        dst = dst || new Float32Array(16);
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        dst[0] = c;
        dst[1] = s;
        dst[2] = 0;
        dst[3] = 0;
        dst[4] = -s;
        dst[5] = c;
        dst[6] = 0;
        dst[7] = 0;
        dst[8] = 0;
        dst[9] = 0;
        dst[10] = 1;
        dst[11] = 0;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = 0;
        dst[15] = 1;

        return dst;
    }
    export function makeScale(sx:number, sy:number, sz:number): number[]
    {
        return [
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, 1,
        ];
    }
    export function matrixMultiply(a, b): number[]
    {
        var a00 = a[0 * 4 + 0];
        var a01 = a[0 * 4 + 1];
        var a02 = a[0 * 4 + 2];
        var a03 = a[0 * 4 + 3];
        var a10 = a[1 * 4 + 0];
        var a11 = a[1 * 4 + 1];
        var a12 = a[1 * 4 + 2];
        var a13 = a[1 * 4 + 3];
        var a20 = a[2 * 4 + 0];
        var a21 = a[2 * 4 + 1];
        var a22 = a[2 * 4 + 2];
        var a23 = a[2 * 4 + 3];
        var a30 = a[3 * 4 + 0];
        var a31 = a[3 * 4 + 1];
        var a32 = a[3 * 4 + 2];
        var a33 = a[3 * 4 + 3];
        var b00 = b[0 * 4 + 0];
        var b01 = b[0 * 4 + 1];
        var b02 = b[0 * 4 + 2];
        var b03 = b[0 * 4 + 3];
        var b10 = b[1 * 4 + 0];
        var b11 = b[1 * 4 + 1];
        var b12 = b[1 * 4 + 2];
        var b13 = b[1 * 4 + 3];
        var b20 = b[2 * 4 + 0];
        var b21 = b[2 * 4 + 1];
        var b22 = b[2 * 4 + 2];
        var b23 = b[2 * 4 + 3];
        var b30 = b[3 * 4 + 0];
        var b31 = b[3 * 4 + 1];
        var b32 = b[3 * 4 + 2];
        var b33 = b[3 * 4 + 3];
        return [a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
            a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
            a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
            a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33,
            a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30,
            a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31,
            a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32,
            a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33,
            a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30,
            a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31,
            a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32,
            a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33,
            a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30,
            a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31,
            a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32,
            a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33];
    }
    export function makeInverse(m: number[]): number[]
    {
        var m00 = m[0 * 4 + 0];
        var m01 = m[0 * 4 + 1];
        var m02 = m[0 * 4 + 2];
        var m03 = m[0 * 4 + 3];
        var m10 = m[1 * 4 + 0];
        var m11 = m[1 * 4 + 1];
        var m12 = m[1 * 4 + 2];
        var m13 = m[1 * 4 + 3];
        var m20 = m[2 * 4 + 0];
        var m21 = m[2 * 4 + 1];
        var m22 = m[2 * 4 + 2];
        var m23 = m[2 * 4 + 3];
        var m30 = m[3 * 4 + 0];
        var m31 = m[3 * 4 + 1];
        var m32 = m[3 * 4 + 2];
        var m33 = m[3 * 4 + 3];
        var tmp_0 = m22 * m33;
        var tmp_1 = m32 * m23;
        var tmp_2 = m12 * m33;
        var tmp_3 = m32 * m13;
        var tmp_4 = m12 * m23;
        var tmp_5 = m22 * m13;
        var tmp_6 = m02 * m33;
        var tmp_7 = m32 * m03;
        var tmp_8 = m02 * m23;
        var tmp_9 = m22 * m03;
        var tmp_10 = m02 * m13;
        var tmp_11 = m12 * m03;
        var tmp_12 = m20 * m31;
        var tmp_13 = m30 * m21;
        var tmp_14 = m10 * m31;
        var tmp_15 = m30 * m11;
        var tmp_16 = m10 * m21;
        var tmp_17 = m20 * m11;
        var tmp_18 = m00 * m31;
        var tmp_19 = m30 * m01;
        var tmp_20 = m00 * m21;
        var tmp_21 = m20 * m01;
        var tmp_22 = m00 * m11;
        var tmp_23 = m10 * m01;

        var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
            (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
        var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
            (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
        var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
            (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
        var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
            (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

        var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

        return [
            d * t0,
            d * t1,
            d * t2,
            d * t3,
            d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
                (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
            d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
                (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
            d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
                (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
            d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
                (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
            d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
                (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
            d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
                (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
            d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
                (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
            d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
                (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
            d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
                (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
            d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
                (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
            d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
                (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
            d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
                (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
        ];
    }

    export function matrixVectorMultiply(v, m)
    {
        var dst = [];
        for (var i = 0; i < 4; ++i)
        {
            dst[i] = 0.0;
            for (var j = 0; j < 4; ++j)
                dst[i] += v[j] * m[j * 4 + i];
        }
        return dst;
    };

    export var deg2RadVar = Math.PI / 180;

    export function degToRad(d:number):number
    {
        return d * Math.PI / 180;
    }

    export var unPerspMatrix:number;

    export function computeMatrix(translation:number[], rotation: number[], scale: number[])
    {
       // console.log(xRotation);
       // var xRotationMatrix = makeXRotation(rotation[0]);
       // var yRotationMatrix = makeYRotation(rotation[1]);
       // var zRotationmatrix = makeZRotation(rotation[2]);
         var translationMatrix = makeTranslation(translation[0], translation[1], translation[2]);
         var rotMatrix = rotation; //makeRotation(rotation[0], rotation[1], rotation[2]);
        var matrix = makeIdentity4x4();
        matrix = matrixMultiply(matrix, makeScale(scale[0], scale[1], scale[2]));
        matrix = matrixMultiply(matrix, rotMatrix);
       // console.log(xRotationMatrix);
        //matrix = matrixMultiply(matrix, xRotationMatrix);
        //matrix = matrixMultiply(matrix, yRotationMatrix);
        //matrix = matrixMultiply(matrix, zRotationmatrix);
        var worldMatrix = matrixMultiply(matrix, translationMatrix);
        return worldMatrix;
        

       // matrix = matrixMultiply(worldMatrix, viewMatrix);
       // return matrixMultiply(matrix, projectionMatrix);
    }



    export function setUniforms(setters, values)
    {
        Object.keys(values).forEach(function (name)
        {
            var setter = setters[name];
            if (setter)
            {
                setter(values[name]);
            }
        });
    }


    


    export function makeIdentity4x4(dst?: any)
    {
        var dst = dst || new Float32Array(16);

        dst[0] = 1;
        dst[1] = 0;
        dst[2] = 0;
        dst[3] = 0;
        dst[4] = 0;
        dst[5] = 1;
        dst[6] = 0;
        dst[7] = 0;
        dst[8] = 0;
        dst[9] = 0;
        dst[10] = 1;
        dst[11] = 0;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = 0;
        dst[15] = 1;

        return dst;
    }

    export function createEmpty4x4()
    {
        return new Float32Array(16);
    }

    export function createEmpty3x3()
    {
        return new Float32Array(9);
    }


    export function ToInverseMat3(a: Float32Array, b?: Float32Array)
    {
        var c = a[0], d = a[1], e = a[2], g = a[4], f = a[5], h = a[6], i = a[8], j = a[9], k = a[10], l = k * f - h * j, o = -k * g + h * i, m = j * g - f * i, n = c * l + d * o + e * m;
        if (!n) return null;
        n = 1 / n;
        if (!b) b = createEmpty3x3();
        b[0] = l * n;
        b[1] = (-k * d + e * j) * n;
        b[2] = (h * d - e * f) * n;
        b[3] = o * n;
        b[4] = (k * c - e * i) * n;
        b[5] = (-h * c + e * g) * n;
        b[6] = m * n;
        b[7] = (-j * c + d * i) * n;
        b[8] = (f * c - d * g) * n;
        return b
    };

   export function transpose3x3(a, b?)
    {
        if (!b || a == b)
        {
            var fe: Float32Array = new Float32Array(9);
            var c = a[1]
            var d = a[2]
            var e = a[5];
            fe[1] = a[3];
            fe[2] = a[6];
            fe[3] = c;
            fe[5] = a[7];
            fe[6] = d;
            fe[7] = e;
            return fe;
        } b[0] = a[0];
        b[1] = a[3];
        b[2] = a[6];
        b[3] = a[1];
        b[4] = a[4];
        b[5] = a[7];
        b[6] = a[2];
        b[7] = a[5];
        b[8] = a[8];
        return b
    };

    export function transpose4x4(a, b?)
    {
        if (!b || a == b)
        {
            var c = a[1], d = a[2], e = a[3], g = a[6], f = a[7], h = a[11];
            a[1] = a[4];
            a[2] = a[8];
            a[3] = a[12];
            a[4] = c;
            a[6] = a[9];
            a[7] = a[13];
            a[8] = d;
            a[9] = g;
            a[11] = a[14];
            a[12] = e;
            a[13] = f;
            a[14] = h;
            return a
        } b[0] = a[0];
        b[1] = a[4];
        b[2] = a[8];
        b[3] = a[12];
        b[4] = a[1];
        b[5] = a[5];
        b[6] = a[9];
        b[7] = a[13];
        b[8] = a[2];
        b[9] = a[6];
        b[10] = a[10];
        b[11] = a[14];
        b[12] = a[3];
        b[13] = a[7];
        b[14] = a[11];
        b[15] = a[15];
        return b
    };

    export function V3Normalize(a, b?)
    {
    b || (b = a);
        var c = a[0], d = a[1], e = a[2], g = Math.sqrt(c * c + d * d + e * e);
        if (g)
        {
            if (g == 1)
            {
            b[0] = c;
                b[1] = d;
                b[2] = e;
                return b
            }
        } else
        {
        b[0] = 0;
            b[1] = 0;
            b[2] = 0;
            return b
        } g = 1 / g;
        b[0] = c * g;
        b[1] = d * g;
        b[2] = e * g;
        return b
    };
    export function V3Scale(a, b, c?): Float32Array
    {
        if (!c || a == c)
        {
            a[0] *= b;
            a[1] *= b;
            a[2] *= b;
        }
        return a;
    }


    export function mat3toMat4(a, b?)
    {
        b || (b = createEmpty4x4());
        b[0] = a[0];
        b[1] = a[1];
        b[2] = a[2];
        b[3] = 0;
        b[4] = a[3];
        b[5] = a[4];
        b[6] = a[5];
        b[7] = 0;
        b[8] = a[6];
        b[9] = a[7];
        b[10] = a[8];
        b[11] = 0;
        b[12] = 0;
        b[13] = 0;
        b[14] = 0;
        b[15] = 1;
        return b
    };

    export function mat4multiplyVec3(a, b, c?): Float32Array
    {
        if (!c) c = new Float32Array(3);
        var d = b[0], e = b[1];
        b = b[2];
        c[0] = a[0] * d + a[4] * e + a[8] * b + a[12];
        c[1] = a[1] * d + a[5] * e + a[9] * b + a[13];
        c[2] = a[2] * d + a[6] * e + a[10] * b + a[14];
        return c
    };
    export function vec3dot (a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] };
}
