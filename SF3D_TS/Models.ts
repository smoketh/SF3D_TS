class Vector3
{
    x: number;
    y: number;
    z: number;
    constructor(x?,y?,z?)
    {
        x || (x=0); y || (y=0); z || (z=0);
        this.x = x; this.y = y; this.z = z;
    }
    static FromArray(array: number[]): Vector3
    {
        var c: Vector3 = new Vector3();
        c.x = array[0];
        c.y = array[1];
        c.z = array[2];
        return c;
    }


    toArray()
    {
        return [this.x, this.y, this.z];
    }
}

class stc
{
    static PIOVER180: number = Math.PI / 180;
    static TOLERANCE: number = 0.00001;



}

class Quaternion
{
    
    x: number=0;
    y: number=0;
    z: number=0;
    w: number = 1;
    constructor()
    {
        this.x = 0; this.y = 0; this.z = 0; this.w = 1;
    }


    normalize()
    {
    // Don't normalize if we don't have to
        var mag2 = this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z;
        if (Math.abs(mag2) > stc.TOLERANCE && Math.abs(mag2 - 1.0) > stc.TOLERANCE)
        {
                var mag = Math.sqrt(mag2);
            this.w /= mag;
            this.x /= mag;
            this.y /= mag;
            this.z /= mag;
        }
    }

    static MultiplyQuaternions(a: Quaternion, b: Quaternion): Quaternion
    {

        // from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm
        var q: Quaternion = new Quaternion();
        var qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
        var qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;

        q.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
        q.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
        q.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
        q.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;


        return q;

    }

    static FromEuler(pitch: number, yaw: number, roll: number): Quaternion
    {
        // Basically we create 3 Quaternions, one for pitch, one for yaw, one for roll
        // and multiply those together.
        // the calculation below does the same, just shorter
        var q: Quaternion = new Quaternion();
        var p = pitch * stc.PIOVER180 / 2.0;
        var y = -yaw * stc.PIOVER180 / 2.0;
        var r = roll * stc.PIOVER180 / 2.0;

        var sinp:number = Math.sin(p);
        var siny:number = Math.sin(y);
        var sinr:number = Math.sin(r);
        var cosp:number = Math.cos(p);
        var cosy:number = Math.cos(y);
        var cosr:number = Math.cos(r);

        q.x = sinr * cosp * cosy - cosr * sinp * siny;
        q.y = cosr * sinp * cosy + sinr * cosp * siny;
        q.z = cosr * cosp * siny - sinr * sinp * cosy;
        q.w = cosr * cosp * cosy + sinr * sinp * siny;

        q.normalize();

        return q;
    }

    ToMatrix():number[]
    {
        var x2 = this.x * this.x;
        var y2 = this.y * this.y;
        var z2 = this.z * this.z;
        var xy = this.x * this.y;
        var xz = this.x * this.z;
        var yz = this.y * this.z;
        var wx = this.w * this.x;
        var wy = this.w * this.y;
        var wz = this.w * this.z;
 
        // This calculation would be a lot more complicated for non-unit length quaternions
        // Note: The constructor of Matrix4 expects the Matrix in column-major format like expected by
        //   OpenGL
        return [
            1.0 - 2.0 * (y2 + z2), 2.0 * (xy - wz), 2.0 * (xz + wy), 0.0,
            2.0 * (xy + wz), 1.0 - 2.0 * (x2 + z2), 2.0 * (yz - wx), 0.0,
            2.0 * (xz - wy), 2.0 * (yz + wx), 1.0 - 2.0 * (x2 + y2), 0.0,
            0.0, 0.0, 0.0, 1.0];
    }

    static copy(quaternion): Quaternion
    {
        var nQ: Quaternion = new Quaternion();
        nQ.x = quaternion.x;
        nQ.y = quaternion.y;
        nQ.z = quaternion.z;
        nQ.w = quaternion.w;

        

        return nQ;
    }


    static slerp(qa: Quaternion, qb: Quaternion, t: number): Quaternion
    {

        if (t === 0) return Quaternion.copy(qa);
        if (t === 1) return Quaternion.copy(qb);

        var x = qa.x, y = qa.y, z = qa.z, w = qa.w;

        // http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

        var cosHalfTheta = w * qb.w + x * qb.x + y * qb.y + z * qb.z;

        if (cosHalfTheta < 0)
        {

            qa.w = - qb.w;
            qa.x = - qb.x;
            qa.y = - qb.y;
            qa.z = - qb.z;

            cosHalfTheta = - cosHalfTheta;

        } else
        {

            qa=Quaternion.copy(qb);

        }

        if (cosHalfTheta >= 1.0)
        {

            qa.w = w;
            qa.x = x;
            qa.y = y;
            qa.z = z;

            return qa;

        }

        var halfTheta = Math.acos(cosHalfTheta);
        var sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);

        if (Math.abs(sinHalfTheta) < 0.001)
        {

            qa.w = 0.5 * (w + qa.w);
            qa.x = 0.5 * (x + qa.x);
            qa.y = 0.5 * (y + qa.y);
            qa.z = 0.5 * (z + qa.z);

            return qa;

        }

        var ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta,
            ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

        qa.w = (w * ratioA + qa.w * ratioB);
        qa.x = (x * ratioA + qa.x * ratioB);
        qa.y = (y * ratioA + qa.y * ratioB);
        qa.z = (z * ratioA + qa.z * ratioB);

       

        return qa;

    }


}


module Model_Sphere
{
    export function getSpherePositions(numSegments: number, radius: number): Float32Array
    {
        

        var Verts: Vector3[] = new Array<Vector3>();

        var Triangles: number[] = new Array<number>();

        var stepPolar= 180/ numSegments;
        var stepAzimuth= 360/ numSegments;
        var DR = Math.PI / 180;
        /*for (var pa = 0; pa <= numSegments; pa++)
        {
            var sPa = Math.sin(pa * stepPolar * DR);
            var cPa = Math.cos(pa * stepPolar * DR);

            for (var az = 0; az <= numSegments; az++)
            {
                // MT.degToRad();
                Verts.push(new Vector3(radius * sPa * Math.cos(az * stepAzimuth * DR), radius * cPa, radius *  sPa * Math.sin(az * stepAzimuth * DR) ));   //z

                if (pa > 0 && pa <= numSegments && az < numSegments)
                {
                    var cCount= (pa) * (numSegments + 1) + az;
                    var cCountEdge = cCount + 1;
                    if (pa == 1)
                    {
                        Triangles.push(cCountEdge, cCount-numSegments - 1, cCount);
                    }
                    if (pa > 1 && pa < numSegments)
                    {
                        Triangles.push(cCountEdge, cCount-numSegments - 1, cCount, cCountEdge-numSegments - 1, cCount-numSegments - 1, cCountEdge);
                    }
                    else if (pa == numSegments)
                    {
                        Triangles.push(cCountEdge - numSegments - 1, cCount - numSegments - 1, cCountEdge);
                    }
                }

            }
        }*/
        
        for (var latNumber = 0; latNumber <= numSegments; latNumber++)
        {
            var theta = latNumber * Math.PI / numSegments;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var longNumber = 0; longNumber <= numSegments; longNumber++)
            {
                var phi = longNumber * 2 * Math.PI / numSegments;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;
                //var u = 1 - (longNumber / longitudeBands);
                //var v = 1 - (latNumber / latitudeBands);

                //normalData.push(x);
                //normalData.push(y);
                //normalData.push(z);
                //textureCoordData.push(u);
                //textureCoordData.push(v);
                Verts.push(new Vector3(radius * x, radius * y, radius * z));
                //Verts.push(radius * y);
                //Verts.push(radius * z);
            }
        }
       // var Triangles = [];
        for (var latNumber = 0; latNumber < numSegments; latNumber++)
        {
            for (var longNumber = 0; longNumber < numSegments; longNumber++)
            {
                var first = (latNumber * (numSegments + 1)) + longNumber;
                var second = first + numSegments + 1;
                Triangles.push(first);
                Triangles.push(second);
                Triangles.push(first + 1);

                Triangles.push(second);
                Triangles.push(second + 1);
                Triangles.push(first + 1);
            }
        }
        //console.log(Verts);
        //console.log(Triangles);

        
        var nAr = new Float32Array(Triangles.length*3);
        for (var q = Triangles.length-1; q >= 0; q--)
        {
            var vertN = Triangles[q];
            nAr[q * 3] = Verts[vertN].x;
            nAr[q * 3+1] = Verts[vertN].y;
            nAr[q * 3+2] = Verts[vertN].z;
        }



        return nAr;

    }

    export function getNormals(verts: Float32Array): Float32Array
    {
        var nerts: Float32Array = new Float32Array(verts.length);
        for (var q = 0; q < verts.length/3; q++)
        {
            var b = MT.V3Normalize([verts[q * 3], verts[q * 3 + 1], verts[q * 3 + 2]]);
            nerts[q * 3] = b[0];
            nerts[q * 3+1] = b[1];
            nerts[q * 3+2] = b[2];
        }
        return nerts; 

    }

    export function getSphereColor(vertCount: number, color: number[]): Float32Array
    {
        var colors = new Float32Array(vertCount);
        var colShift = 1 / vertCount;
        var cCol = 0;
        for (var q = 0; q < colors.length; q+=3)
        {
            colors[q] = color[0]; colors[q + 1] = color[1]; colors[q + 2] = color[2];
            //colors[q] = cCol; colors[q + 1] = cCol; colors[q + 2] = cCol;
            //cCol += colShift;
        }
        return colors;
    }

}

module Model_Star
{
    export var positions = new Float32Array([
        0.00, 0.00, 0.09,
        0.00, 0.00, -0.09,
        0.00, 0.09, 0.00,
        0.00, 0.00, -0.09,
        0.00, 0.00, 0.09,
        0.00, -0.09, 0.00]);

    export var normals = new Float32Array([
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0
    ]);

    export var colors = new Float32Array([
        1, 1, 1,
        1, 1, 1,
        1, 1, 1,
        1, 1, 1,
        1, 1, 1,
        1, 1, 1
    ]);
}

module Model_Farer
{
    export var positions = new Float32Array([
        0.00, -0.07, 0.43,
        -0.23, -0.13, -0.02,
        0.23, -0.13, -0.02,
        -0.23, 0.13, -0.02,
        0.00, -0.07, 0.43,
        0.00, 0.01, 0.43,
        0.00, -0.07, 0.43,
        -0.23, 0.13, -0.02,
        -0.23, -0.13, -0.02,
        -0.39, 0.00, -0.10,
        -0.23, 0.13, -0.43,
        -0.39, 0.00, -0.57,
        -0.23, 0.13, -0.43,
        -0.39, 0.00, -0.10,
        -0.23, 0.13, -0.02,
        -0.39, 0.00, -0.10,
        -0.23, -0.13, -0.02,
        -0.23, 0.13, -0.02,
        -0.23, -0.13, -0.02,
        -0.39, 0.00, -0.10,
        -0.39, 0.00, -0.10,
        -0.39, 0.00, -0.10,
        -0.23, -0.13, -0.43,
        -0.23, -0.13, -0.02,
        -0.23, -0.13, -0.43,
        -0.39, 0.00, -0.10,
        -0.39, 0.00, -0.57,
        -0.23, -0.13, -0.43,
        -0.39, 0.00, -0.57,
        -0.23, 0.13, -0.43,
        -0.39, 0.00, -0.57,
        -0.23, -0.13, -0.43,
        -0.39, 0.00, -0.57,
        -0.38, 0.00, -0.58,
        -0.24, 0.11, -0.45,
        -0.24, -0.12, -0.45,
        0.23, 0.13, -0.02,
        -0.23, 0.13, -0.43,
        -0.23, 0.13, -0.02,
        -0.23, 0.13, -0.43,
        0.23, 0.13, -0.02,
        0.23, 0.13, -0.43,
        0.23, 0.13, -0.43,
        -0.23, -0.13, -0.43,
        -0.23, 0.13, -0.43,
        -0.23, -0.13, -0.43,
        0.23, 0.13, -0.43,
        0.23, -0.13, -0.43,
        0.00, 0.01, 0.43,
        0.23, 0.13, -0.02,
        -0.23, 0.13, -0.02,
        0.23, -0.13, -0.43,
        -0.23, -0.13, -0.02,
        -0.23, -0.13, -0.43,
        -0.23, -0.13, -0.02,
        0.23, -0.13, -0.43,
        0.23, -0.13, -0.02,
        0.00, 0.05, 0.33,
        0.14, 0.12, 0.04,
        -0.14, 0.12, 0.04,
        0.00, -0.07, 0.43,
        0.23, 0.13, -0.02,
        0.00, 0.01, 0.43,
        0.23, 0.13, -0.02,
        0.00, -0.07, 0.43,
        0.23, -0.13, -0.02,
        0.39, 0.00, -0.57,
        0.23, 0.13, -0.02,
        0.39, 0.00, -0.10,
        0.23, 0.13, -0.02,
        0.39, 0.00, -0.57,
        0.23, 0.13, -0.43,
        0.39, 0.00, -0.10,
        0.23, 0.13, -0.02,
        0.23, -0.13, -0.02,
        0.23, 0.13, -0.02,
        0.39, 0.00, -0.10,
        0.39, 0.00, -0.10,
        0.23, -0.13, -0.02,
        0.39, 0.00, -0.57,
        0.39, 0.00, -0.10,
        0.39, 0.00, -0.57,
        0.23, -0.13, -0.02,
        0.23, -0.13, -0.43,
        0.23, 0.13, -0.43,
        0.39, 0.00, -0.57,
        0.23, -0.13, -0.43,
        0.39, 0.00, -0.57,
        0.23, 0.13, -0.43,
        0.39, 0.00, -0.57,
        0.38, 0.00, -0.58,
        0.24, -0.12, -0.45,
        0.24, 0.11, -0.45
    ]);

    export var normals = new Float32Array([
        -0.1, -1.0, 0.0,
        -0.1, -1.0, 0.0,
        -0.1, -1.0, 0.0,
        -0.4, 0.0, -0.9,
        -0.4, 0.0, -0.9,
        -0.4, 0.0, -0.9,
        -0.4, 0.0, -0.9,
        -0.4, 0.0, -0.9,
        -0.4, 0.0, -0.9,
        0.0, 0.8, -0.6,
        0.0, 0.8, -0.6,
        0.0, 0.8, -0.6,
        0.0, 0.8, -0.6,
        0.0, 0.8, -0.6,
        0.0, 0.8, -0.6,
        -0.9, 0.0, -0.4,
        -0.9, 0.0, -0.4,
        -0.9, 0.0, -0.4,
        -0.9, 0.5, 0.0,
        -0.9, 0.5, 0.0,
        -0.9, 0.5, 0.0,
        0.0, -0.8, -0.6,
        0.0, -0.8, -0.6,
        0.0, -0.8, -0.6,
        0.0, -0.8, -0.6,
        0.0, -0.8, -0.6,
        0.0, -0.8, -0.6,
        0.7, 0.0, 0.7,
        0.7, 0.0, 0.7,
        0.7, 0.0, 0.7,
        0.0, 0.8, 0.6,
        0.0, 0.8, 0.6,
        0.0, 0.8, 0.6,
        0.7, 0.0, 0.7,
        0.7, 0.0, 0.7,
        0.7, 0.0, 0.7,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        -0.3, 1.0, 0.0,
        -0.3, 1.0, 0.0,
        -0.3, 1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        -0.3, 1.0, 0.0,
        -0.3, 1.0, 0.0,
        -0.3, 1.0, 0.0,
        -0.4, 0.0, 0.9,
        -0.4, 0.0, 0.9,
        -0.4, 0.0, 0.9,
        -0.4, 0.0, 0.9,
        -0.4, 0.0, 0.9,
        -0.4, 0.0, 0.9,
        0.0, 0.8, 0.6,
        0.0, 0.8, 0.6,
        0.0, 0.8, 0.6,
        0.0, 0.8, 0.6,
        0.0, 0.8, 0.6,
        0.0, 0.8, 0.6,
        -0.9, 0.0, 0.4,
        -0.9, 0.0, 0.4,
        -0.9, 0.0, 0.4,
        0.9, 0.5, 0.0,
        0.9, 0.5, 0.0,
        0.9, 0.5, 0.0,
        0.0, -0.8, 0.6,
        0.0, -0.8, 0.6,
        0.0, -0.8, 0.6,
        0.0, -0.8, 0.6,
        0.0, -0.8, 0.6,
        0.0, -0.8, 0.6,
        0.7, 0.0, -0.7,
        0.7, 0.0, -0.7,
        0.7, 0.0, -0.7,
        0.0, 0.8, 0.6,
        0.0, 0.8, 0.6,
        0.0, 0.8, 0.6,
        0.7, 0.0, -0.7,
        0.7, 0.0, -0.7,
        0.7, 0.0, -0.7
    ]);

    export var colors = new Float32Array([
        0.05, 0.16, 0.21,
        0.05, 0.16, 0.21,
        0.05, 0.16, 0.21,
        0.05, 0.16, 0.21,
        0.05, 0.16, 0.21,
        0.05, 0.16, 0.21,
        0.05, 0.16, 0.21,
        0.05, 0.16, 0.21,
        0.05, 0.16, 0.21,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.13, 0.43, 0.41,
        0.13, 0.43, 0.41,
        0.13, 0.43, 0.41,
        0.11, 0.33, 0.42,
        0.11, 0.33, 0.42,
        0.11, 0.33, 0.42,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.11, 0.33, 0.42,
        0.11, 0.33, 0.42,
        0.11, 0.33, 0.42,
        0.13, 0.07, 0.83,
        0.13, 0.07, 0.83,
        0.13, 0.07, 0.83,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.05, 0.16, 0.21,
        0.05, 0.16, 0.21,
        0.05, 0.16, 0.21,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.88, 0.70, 0.35,
        0.88, 0.70, 0.35,
        0.88, 0.70, 0.35,
        0.05, 0.16, 0.21,
        0.05, 0.16, 0.21,
        0.05, 0.16, 0.21,
        0.05, 0.16, 0.21,
        0.05, 0.16, 0.21,
        0.05, 0.16, 0.21,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.13, 0.43, 0.41,
        0.13, 0.43, 0.41,
        0.13, 0.43, 0.41,
        0.11, 0.33, 0.42,
        0.11, 0.33, 0.42,
        0.11, 0.33, 0.42,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.12, 0.29, 0.39,
        0.11, 0.33, 0.42,
        0.11, 0.33, 0.42,
        0.11, 0.33, 0.42,
        0.13, 0.07, 0.83,
        0.13, 0.07, 0.83,
        0.13, 0.07, 0.83]);


}

module Model_Peon
{
    export var positions = new Float32Array([
        0.09, -0.20, -0.03,
        0.35, -0.11, 0.09,
        0.09, -0.13, 0.10,
        0.35, -0.11, 0.09,
        0.09, -0.20, -0.03,
        0.35, -0.17, -0.03,
        -0.40, -0.02, -0.03,
        0.09, -0.13, -0.10,
        0.09, -0.20, -0.03,
        0.35, -0.11, -0.09,
        0.09, 0.13, -0.10,
        0.35, 0.11, -0.09,
        0.09, 0.13, -0.10,
        0.35, -0.11, -0.09,
        0.09, -0.13, -0.10,
        0.09, 0.13, 0.10,
        0.35, -0.11, 0.09,
        0.35, 0.11, 0.09,
        0.35, -0.11, 0.09,
        0.09, 0.13, 0.10,
        0.09, -0.13, 0.10,
        0.35, -0.11, 0.06,
        0.35, -0.12, -0.05,
        0.35, -0.05, 0.07,
        0.35, -0.12, -0.05,
        0.35, -0.11, 0.06,
        0.35, -0.15, -0.02,
        0.09, -0.20, -0.03,
        0.35, -0.11, -0.09,
        0.35, -0.17, -0.03,
        0.35, -0.11, -0.09,
        0.09, -0.20, -0.03,
        0.09, -0.13, -0.10,
        -0.40, -0.02, -0.03,
        0.09, -0.20, -0.03,
        0.09, -0.13, 0.10,
        0.35, -0.11, 0.09,
        0.35, 0.17, -0.03,
        0.35, 0.11, 0.09,
        0.35, -0.17, -0.03,
        0.35, 0.17, -0.03,
        0.35, -0.11, 0.09,
        0.35, -0.17, -0.03,
        0.35, -0.11, -0.09,
        0.35, 0.17, -0.03,
        0.35, 0.17, -0.03,
        0.35, -0.11, -0.09,
        0.35, 0.11, -0.09,
        0.09, 0.20, -0.03,
        0.35, 0.11, 0.09,
        0.35, 0.17, -0.03,
        0.35, 0.11, 0.09,
        0.09, 0.20, -0.03,
        0.09, 0.13, 0.10,
        -0.40, 0.02, -0.03,
        0.09, 0.20, -0.03,
        0.09, 0.13, -0.10,
        0.09, 0.13, 0.10,
        -0.40, -0.02, -0.03,
        0.09, -0.13, 0.10,
        -0.40, -0.02, -0.03,
        0.09, 0.13, 0.10,
        -0.40, 0.02, -0.03,
        0.04, -0.05, 0.10,
        -0.37, 0.01, -0.02,
        -0.37, -0.01, -0.02,
        -0.37, 0.01, -0.02,
        0.04, -0.05, 0.10,
        0.04, 0.05, 0.10,
        0.35, 0.11, 0.06,
        0.35, 0.12, -0.05,
        0.35, 0.15, -0.02,
        0.35, 0.12, -0.05,
        0.35, 0.11, 0.06,
        0.35, 0.05, 0.07,
        0.09, 0.13, -0.10,
        -0.40, -0.02, -0.03,
        -0.40, 0.02, -0.03,
        -0.40, -0.02, -0.03,
        0.09, 0.13, -0.10,
        0.09, -0.13, -0.10,
        0.09, 0.20, -0.03,
        0.35, 0.11, -0.09,
        0.09, 0.13, -0.10,
        0.35, 0.11, -0.09,
        0.09, 0.20, -0.03,
        0.35, 0.17, -0.03,
        -0.40, 0.02, -0.03,
        0.09, 0.13, 0.10,
        0.09, 0.20, -0.03
    ]);

    export var normals = new Float32Array([
        0.1, -0.9, 0.5,
        0.1, -0.9, 0.5,
        0.1, -0.9, 0.5,
        0.1, -0.9, 0.5,
        0.1, -0.9, 0.5,
        0.1, -0.9, 0.5,
        -0.2, -0.7, -0.7,
        -0.2, -0.7, -0.7,
        -0.2, -0.7, -0.7,
        0.1, 0.0, -1.0,
        0.1, 0.0, -1.0,
        0.1, 0.0, -1.0,
        0.1, 0.0, -1.0,
        0.1, 0.0, -1.0,
        0.1, 0.0, -1.0,
        0.1, 0.0, 1.0,
        0.1, 0.0, 1.0,
        0.1, 0.0, 1.0,
        0.1, 0.0, 1.0,
        0.1, 0.0, 1.0,
        0.1, 0.0, 1.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        0.1, -0.7, -0.7,
        0.1, -0.7, -0.7,
        0.1, -0.7, -0.7,
        0.1, -0.7, -0.7,
        0.1, -0.7, -0.7,
        0.1, -0.7, -0.7,
        -0.3, -0.8, 0.5,
        -0.3, -0.8, 0.5,
        -0.3, -0.8, 0.5,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        0.1, 0.9, 0.5,
        0.1, 0.9, 0.5,
        0.1, 0.9, 0.5,
        0.1, 0.9, 0.5,
        0.1, 0.9, 0.5,
        0.1, 0.9, 0.5,
        -0.2, 0.7, -0.7,
        -0.2, 0.7, -0.7,
        -0.2, 0.7, -0.7,
        -0.3, 0.0, 1.0,
        -0.3, 0.0, 1.0,
        -0.3, 0.0, 1.0,
        -0.3, 0.0, 1.0,
        -0.3, 0.0, 1.0,
        -0.3, 0.0, 1.0,
        -0.3, 0.0, 1.0,
        -0.3, 0.0, 1.0,
        -0.3, 0.0, 1.0,
        -0.3, 0.0, 1.0,
        -0.3, 0.0, 1.0,
        -0.3, 0.0, 1.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        -0.1, 0.0, -1.0,
        -0.1, 0.0, -1.0,
        -0.1, 0.0, -1.0,
        -0.1, 0.0, -1.0,
        -0.1, 0.0, -1.0,
        -0.1, 0.0, -1.0,
        0.1, 0.7, -0.7,
        0.1, 0.7, -0.7,
        0.1, 0.7, -0.7,
        0.1, 0.7, -0.7,
        0.1, 0.7, -0.7,
        0.1, 0.7, -0.7,
        -0.3, 0.8, 0.5,
        -0.3, 0.8, 0.5,
        -0.3, 0.8, 0.5
    ]);

    export var colors = new Float32Array([
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.07, 0.54, 0.00,
        0.07, 0.54, 0.00,
        0.07, 0.54, 0.00,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.13, 0.07, 0.83,
        0.13, 0.07, 0.83,
        0.13, 0.07, 0.83,
        0.13, 0.07, 0.83,
        0.13, 0.07, 0.83,
        0.13, 0.07, 0.83,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.07, 0.54, 0.00,
        0.07, 0.54, 0.00,
        0.07, 0.54, 0.00,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.07, 0.54, 0.00,
        0.07, 0.54, 0.00,
        0.07, 0.54, 0.00,
        0.07, 0.54, 0.00,
        0.07, 0.54, 0.00,
        0.07, 0.54, 0.00,
        0.07, 0.54, 0.00,
        0.07, 0.54, 0.00,
        0.07, 0.54, 0.00,
        0.88, 0.79, 0.00,
        0.88, 0.79, 0.00,
        0.88, 0.79, 0.00,
        0.88, 0.79, 0.00,
        0.88, 0.79, 0.00,
        0.88, 0.79, 0.00,
        0.13, 0.07, 0.83,
        0.13, 0.07, 0.83,
        0.13, 0.07, 0.83,
        0.13, 0.07, 0.83,
        0.13, 0.07, 0.83,
        0.13, 0.07, 0.83,
        0.07, 0.54, 0.00,
        0.07, 0.54, 0.00,
        0.07, 0.54, 0.00,
        0.07, 0.54, 0.00,
        0.07, 0.54, 0.00,
        0.07, 0.54, 0.00,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.30, 0.30, 0.30,
        0.07, 0.54, 0.00,
        0.07, 0.54, 0.00,
        0.07, 0.54, 0.00
    ]);

}