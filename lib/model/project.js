var Sequelize = require('sequelize');

var EARTH_RADIUS_KM = 6371.01
var project;

/**
 * Create a the sequelize.fn needed to do a bounding box search on a point.
 *
 * @columnName - name of the column to apply this to
 * @param boundingBox - bounding box as [lon1,lat1,lon2,lat2]
 * @return sequelize.fn suitable to pass to 'where'
 * 
 */
function pointInBoundingBox(columnName, boundingBox) {
    var lonlat1, lonlat2;
    if (!Array.isArray(boundingBox)) {
        throw Error('boundingBox should be an array of [lon1,lat1,lon2,lat2] or [[lon1,lat1],[lon2,lat2]');
    }

    if (boundingBox.length === 2 && Array.isArray(boundingBox[0])) {
        lonlat1 = boundingBox[0];
        lonlat2 = boundingBox[2];
    } else if (boundingBox.length === 4) {
        lonlat1 = [boundingBox[0], boundingBox[1]]
        lonlat2 = [boundingBox[2], boundingBox[3]]
    }

    var p1 = lonlat1[0] + ' ' + lonlat1[1];
    var p2 = lonlat2[0] + ' ' + lonlat1[1];
    var p3 = lonlat2[0] + ' ' + lonlat2[1];
    var p4 = lonlat1[0] + ' ' + lonlat2[1];

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
 * @param centrePoint - centre point of search as [lon,lat], where lat, lon are in degrees 
 * @param radiusInKm - radius of search in Km
 * @param planetRadiusKm (optional) - planet radius. if not specified will default to that of the Earth.
 * @return a bounding box as [lon1,lat1,lon2,lat2]
 */
function pointRadiusToBoundingBox(centrePoint, radiusInKm, planetRadiusKm) {

    // ref: http://janmatuschek.de/LatitudeLongitudeBoundingCoordinates
    // ref: http://stackoverflow.com/questions/1689096

    if (!planetRadiusKm) {
        planetRadiusKm = EARTH_RADIUS_KM;
    }

    var lon = centrePoint[0];
    var lat = centrePoint[1];

    var lon1 = lon - toDegrees(radiusInKm / planetRadiusKm / Math.cos(toRadians(lat)));
    var lon2 = lon + toDegrees(radiusInKm / planetRadiusKm / Math.cos(toRadians(lat)));
    var lat1 = lat + toDegrees(radiusInKm / planetRadiusKm);
    var lat2 = lat - toDegrees(radiusInKm / planetRadiusKm);

    return [lon1, lat1, lon2, lat2];
}

/**
 * Finds if a point is in the search radius.
 * 
 * @param columnName - name of the column to look in for the point
 * @param centrePoint - centre point of search as [lon,lat], where lon, lat are in degrees 
 * @param radiusInKm - radius of search in Km
 * @param planetRadiusKm (optional) - planet radius. if not specified will default to that of the Earth.
 * @return sequelize.fn suitable to pass to 'where'
 * 
 * Note: due to limitations in MariaDB we will approximate this as a bounding box search
 */
function pointInRadius(columnName, centrePoint, radiusInKm, planetRadiusKm) {
    return pointInBoundingBox(columnName, pointRadiusToBoundingBox(centrePoint, radiusInKm, planetRadiusKm))
}


function point(lonlat) {
    var sequelize = this.sequelize;
    return sequelize.fn('ST_GeomFromText', `POINT(${lonlat[0]} ${lonlat[1]})`);
}

function polygon(polygon) {
    var sequelize = this.sequelize;
    return sequelize.fn('ST_GeomFromText', `POLYGON(${lonlat[0]} ${lonlat[1]})`);
}

// MariaDB does not support multipolygon
// function multipolygon(polygons) {
//     var sequelize = this.sequelize;
//     return sequelize.fn('ST_GeomFromText', `MULTIPOLYGON(${lonlat[0]} ${lonlat[1]})`);
// }

/**
 * Defines a map project
 */
function getModel(sequelize) {

    if (!project) {
        project = sequelize.define('project', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            createdBy: Sequelize.INTEGER,
            area: Sequelize.GEOMETRY('POLYGON'),
            description: Sequelize.TEXT
        }, {
            timestamps: true
        });

        project.point = point;
        project.polygon = polygon;
        // project.multiPolygon = multiPolygon;
        project.pointInBoundingBox = pointInBoundingBox;
        project.pointInRadius = pointInRadius;

    }
    return project;
}

module.exports = getModel;