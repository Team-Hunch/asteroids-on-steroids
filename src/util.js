
function rotatePointAroundCenter(point, center, angle) {
    var theta = angle * Math.PI / 180;
    var x = point.x;
    var y = point.y;
    var x0 = center.x;
    var y0 = center.y;


    var x2 = x0 + (x - x0) * Math.cos(theta) - (y - y0) * Math.sin(theta);
    var y2 = y0 + (x - x0) * Math.sin(theta) + (y - y0) * Math.cos(theta);

    return {
        x: x2,
        y: y2
    }
}

function calculateTriangleBoundingBox(x, y, w, h, angle) {

    var maxX = null, maxY = null, minX = null, minY = null;

    var center = {
        x: x + w / 2,
        y: y + h / 2
    }

    var corners = [
        { x: x + w / 2, y: y },
        { x: x, y: y + h },
        { x: x + w, y: y + h }
    ]

    corners.forEach(function (point) {
        var rotatedPoint = rotatePointAroundCenter(point, center, angle);

        if (rotatedPoint.x > maxX || maxX == null) {
            maxX = rotatedPoint.x
        }

        if (rotatedPoint.y > maxY || maxY == null) {
            maxY = rotatedPoint.y
        }

        if (rotatedPoint.x < minX || minX == null) {
            minX = rotatedPoint.x
        }

        if (rotatedPoint.y < minY || minY == null) {
            minY = rotatedPoint.y
        }
    })

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    }
}

exports.rotatePointAroundCenter = rotatePointAroundCenter
exports.calculateTriangleBoundingBox = calculateTriangleBoundingBox
