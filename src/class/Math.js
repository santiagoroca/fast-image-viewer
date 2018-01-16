import { vec3, mat4 } from '../lib/gl-matrix'

class Math {

    static testSphereThruPlanes (sphere, planes) {
        for (let i = 0; i < planes.length; i++) {
            if (planes[i].x * sphere.x + planes[i].y * sphere.y + planes[i].z * sphere.z + planes[i].w <= -sphere.r) {
                return false;
            }
        }

        return true;
    }

    /**
     *
     * @param x
     * @param y
     */
    static testRayThruTriangle (p1, e1, e2, r1, D) {
        var P = [
            D[1] * e2[2] - D[2] * e2[1],
            D[2] * e2[0] - D[0] * e2[2],
            D[0] * e2[1] - D[1] * e2[0],
        ];

        // area of the parallelogram
        var det = e1[0] * P[0] + e1[1] * P[1] + e1[2] * P[2];

        /* If the area is too close to 0 it means that the ray is perpendicular to the
         triangle's normal or rather parallel to the triangle we would like to intersect with
         */
        if (det > -0.000001 && det < 0.000001) return false;

        /* now we start computing the barycentric coordinates
         note that inv_det is not the inverse of the determinant but the determinant expressed
         as a rational number minor than 0, so when multiplications are applied to it, it will in turn
         divide its factor.
         */
        var inv_det = 1.0 / det;

        // T = the vector conformed by origin of the ray minus the first vertex of the triangle
        var T = [r1[0] - p1 [0], r1[1] - p1 [1], r1[2] - p1 [2]];

        /* from now on we calculate the values of the barycentric coordinates u,v and t
         using Cramer's Rule.
         u = (the determinant of the the system D, e1 and e2) divided by the determinant of the main system e1,e2,d
         */
        var u = (T[0] * P[0] + T[1] * P[1] + T[2] * P[2]) * inv_det;

        /*if u is less than 0 or larger than 1, then the point lies outside the triangle if it's equal to 1 or 0,
         then the point lies in one of the triangle's edges
         */
        if (u < 0 || u > 1) return false;

        /* calculate v using the same Cramer's Rule */
        var Q = [
            T[1] * e1[2] - T[2] * e1[1],
            T[2] * e1[0] - T[0] * e1[2],
            T[0] * e1[1] - T[1] * e1[0],
        ];

        /*if v is less than 0 or larger than 1, then the point lies outside the triangle if it's equal to 1 or 0,
         then the point lies in one of the triangle's edges
         */
        var v = (D[0] * Q[0] + D[1] * Q[1] + D[2] * Q[2]) * inv_det;

        if (v < 0 || u + v > 1) return false;

        /*finally if t is less than 0 or larger than 1, then the point lies outside the triangle if it's equal to 1 or 0,
         then the point lies in one of the triangle's edges
         */
        var t = (e2[0] * Q[0] + e2[1] * Q[1] + e2[2] * Q[2]) * inv_det;

        if (t > 0) {
            return t;
        }

        return false;
    }

    static inverse (a, b) {
        b || (b = a);
        var c = a[0],
            d = a[1],
            e = a[2],
            g = a[3],
            f = a[4],
            h = a[5],
            i = a[6],
            j = a[7],
            k = a[8],
            l = a[9],
            o = a[10],
            m = a[11],
            n = a[12],
            p = a[13],
            r = a[14],
            s = a[15],
            A = c * h - d * f,
            B = c * i - e * f,
            t = c * j - g * f,
            u = d * i - e * h,
            v = d * j - g * h,
            w = e * j - g * i,
            x = k * p - l * n,
            y = k * r - o * n,
            z = k * s - m * n,
            C = l * r - o * p,
            D = l * s - m * p,
            E = o * s - m * r,
            q = 1 / (A * E - B * D + t * C + u * z - v * y + w * x);
        b[0] = (h * E - i * D + j * C) * q;
        b[1] = (-d * E + e * D - g * C) * q;
        b[2] = (p * w - r * v + s * u) * q;
        b[3] = (-l * w + o * v - m * u) * q;
        b[4] = (-f * E + i * z - j * y) * q;
        b[5] = (c * E - e * z + g * y) * q;
        b[6] = (-n * w + r * t - s * B) * q;
        b[7] = (k * w - o * t + m * B) * q;
        b[8] = (f * D - h * z + j * x) * q;
        b[9] = (-c * D + d * z - g * x) * q;
        b[10] = (n * v - p * t + s * A) * q;
        b[11] = (-k * v + l * t - m * A) * q;
        b[12] = (-f * C + h * y - i * x) * q;
        b[13] = (c * C - d * y + e * x) * q;
        b[14] = (-n * u + p * B - r * A) * q;
        b[15] = (k * u - l * B + o * A) * q;
        return b
    }

    static multiplyVec4 (a, b, c) {
        c || (c = b);
        var d = b[0],
            e = b[1],
            g = b[2];
        b = b[3];
        c[0] = a[0] * d + a[4] * e + a[8] * g + a[12] * b;
        c[1] = a[1] * d + a[5] * e + a[9] * g + a[13] * b;
        c[2] = a[2] * d + a[6] * e + a[10] * g + a[14] * b;
        c[3] = a[3] * d + a[7] * e + a[11] * g + a[15] * b;
        return c
    }

    static getRaycastHitCoordinates (projectionMatrix, mvMatrix, canvasRect) {
        let x = (canvasRect[2] + canvasRect[0]) / 2;
        let y = (canvasRect[3] + canvasRect[1]) / 2;

        let P1 = Math.unproject(x, y, -1, Math.inverse(
            mat4.multiply(
                [],
                projectionMatrix,
                mvMatrix
            )
        ), canvasRect);

        let P2 = Math.unproject(x, y, 1, Math.inverse(
            mat4.multiply(
                [],
                projectionMatrix,
                mvMatrix
            )
        ), canvasRect);

        let D = [P2[0] - P1 [0], P2[1] - P1 [1], P2[2] - P1 [2]];
        D = vec3.normalize([], D);

        const vertices = [
            // front
            0.0, 0.0, 0.0,
            2.0, 0.0, 0.0,
            2.0, 2.0, 0.0,

            2.0, 2.0, 0.0,
            0.0, 2.0, 0.0,
            0.0, 0.0, 0.0
        ];

        for (var k = 0; k < vertices.length; k += 3) {
            var p1 = [
                vertices[k * 3],
                vertices[k * 3 + 1],
                vertices[k * 3 + 2]
            ];

            var p2 = [
                vertices[(k + 1) * 3],
                vertices[(k + 1) * 3 + 1],
                vertices[(k + 1) * 3 + 2]
            ];

            var p3 = [
                vertices[(k + 2) * 3],
                vertices[(k + 2) * 3 + 1],
                vertices[(k + 2) * 3 + 2]
            ];

            var t = Math.testRayThruTriangle(
                p1,
                [p2[0] - p1 [0], p2[1] - p1 [1], p2[2] - p1 [2]],
                [p3[0] - p1 [0], p3[1] - p1 [1], p3[2] - p1 [2]],
                P1,
                D
            );

            if (t) {
                return t;
            }
        }
    }

    static unproject (winx, winy, winz, mat, viewport) {
        var n = [
            2 * ((winx - viewport[0]) / viewport[2]) - 1,
            2 * ((winy - viewport[1]) / viewport[3]) - 1,
            2 * winz - 1,
            1
        ];

        Math.multiplyVec4(mat, n, n);

        return [
            n[0] / n[3],
            n[1] / n[3],
            n[2] / n[3]
        ];
    }

}

export default Math