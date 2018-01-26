function getLocation() {
    var gpsOptions = {maximumAge: 0, timeout: 10000, enableHighAccuracy: true};
    navigator.geolocation.getCurrentPosition
    (gpsSuccess, gpsError, gpsOptions);
}

function gpsRetry(gpsOptions) {
    navigator.geolocation.getCurrentPosition(gpsSuccess, gpsError, gpsOptions);
}

// onError Callback receives a PositionError object
function gpsError(error, gpsOptions) {
    SingletonUser.getInstance().current_position = null;

    navigator.notification.alert(
        error.message + '\nGeoPost needs your position!',  // message
        function () {

        },         // callback
        'GPS Error',            // title
        'Retry'                  // buttonName
    );
    console.log("gps fail!!");
    gpsRetry(gpsOptions);
}

function gpsSuccess(position) {
    // Updating Model
    SingletonUser.getInstance().current_position = {'lat' : position.coords.latitude, 'lon' : position.coords.longitude};
    // SingletonFriendsList.getInstance().sort({'lat' : position.coords.latitude, 'lon' : position.coords.longitude})
    console.log('current_pos=', SingletonUser.getInstance().current_position);
}