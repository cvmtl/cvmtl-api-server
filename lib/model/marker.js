var Sequelize = require('sequelize');

var EARTH_RADIUS_KM = 6371.01
var marker;

/**
 * Create a the sequelize.fn needed to do a bounding box search on a point.
 *
 * @columnName - name of the column to apply this to
 * @param boundingBox - bounding box as [lat1,lon1,lat2,lon2]
 * @return sequelize.fn suitable to pass to 'where'
 * 
 */
function pointInBoundingBox(columnName, boundingBox) {
    var latlon1, latlon2;
    if (!Array.isArray(boundingBox)) {
        throw Error('boundingBox should be an array of [lat1,lon1,lat2,lon2] or [[lat1,lon1],[lat2,lon2]');
    }

    if (boundingBox.length === 2 && Array.isArray(boundingBox[0])) {
        latlon1 = boundingBox[0];
        latlon2 = boundingBox[2];
    } else if (boundingBox.length === 4) {
        latlon1 = [boundingBox[0], boundingBox[1]]
        latlon2 = [boundingBox[2], boundingBox[3]]
    }

    var p1 = latlon1[0] + ' ' + latlon1[1];
    var p2 = latlon2[0] + ' ' + latlon1[1];
    var p3 = latlon2[0] + ' ' + latlon2[1];
    var p4 = latlon1[0] + ' ' + latlon2[1];

    var sequelize = this.sequelize;
    var contains = sequelize.fn('ST_CONTAINS',
        sequelize.fn('ST_POLYFROMTEXT', `POLYGON((${p1},${p2},${p3},${p4},${p1}))`),
        sequelize.col(columnName)
    );

    return contains;
}

function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

function toDegrees(radians) {
    return radians * 180 / Math.PI;
}

/**
 * Converts a point+radius to a bounding box, taking into account the planet radius
 * @param centrePoint - centre point of search as [lat,lon], where lat, lon are in degrees 
 * @param radiusInKm - radius of search in Km
 * @param planetRadiusKm (optional) - planet radius. if not specified will default to that of the Earth.
 * @return a bounding box as [lat1,lon1,lat2,lon2]
 */
function pointRadiusToBoundingBox(centrePoint, radiusInKm, planetRadiusKm) {

    // ref: http://janmatuschek.de/LatitudeLongitudeBoundingCoordinates
    // ref: http://stackoverflow.com/questions/1689096

    if (!planetRadiusKm) {
        planetRadiusKm = EARTH_RADIUS_KM;
    }

    var lon = centrePoint[1];
    var lat = centrePoint[0];

    var lon1 = lon - toDegrees(radiusInKm / planetRadiusKm / Math.cos(toRadians(lat)));
    var lon2 = lon + toDegrees(radiusInKm / planetRadiusKm / Math.cos(toRadians(lat)));
    var lat1 = lat + toDegrees(radiusInKm / planetRadiusKm);
    var lat2 = lat - toDegrees(radiusInKm / planetRadiusKm);

    return [lat1, lon1, lat2, lon2];
}

/**
 * Finds if a point is in the search radius.
 * 
 * @param columnName - name of the column to look in for the point
 * @param centrePoint - centre point of search as [lat,lon], where lat, lon are in degrees 
 * @param radiusInKm - radius of search in Km
 * @param planetRadiusKm (optional) - planet radius. if not specified will default to that of the Earth.
 * @return sequelize.fn suitable to pass to 'where'
 * 
 * Note: due to limitations in MariaDB we will approximate this as a bounding box search
 */
function pointInRadius(columnName, centrePoint, radiusInKm, planetRadiusKm) {
    return pointInBoundingBox(columnName, pointRadiusToBoundingBox(centrePoint, radiusInKm, planetRadiusKm))
}


/**
 * Defines a map marker
 */
function getModel(sequelize) {

    if (!marker) {
        marker = sequelize.define('marker', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            createdBy: Sequelize.INTEGER,
            latlon: 'Point',
            description: Sequelize.TEXT
        }, {
            timestamps: true
        });

        marker.pointInBoundingBox = pointInBoundingBox;
        marker.pointInRadius = pointInRadius;

    }
    return marker;
}

module.exports = getModel;