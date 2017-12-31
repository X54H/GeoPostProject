var map;
var infowindow;

function getLocation() {
    var gpsOptions = {maximumAge: 0, timeout: 5000, enableHighAccuracy: true};
    navigator.geolocation.getCurrentPosition
    (gpsSuccess, gpsError, gpsOptions);
}

function gpsRetry(gpsOptions) {
    navigator.geolocation.getCurrentPosition(gpsSuccess, gpsError, gpsOptions);
}

// onError Callback receives a PositionError object
//
function gpsError(error, gpsOptions) {
    alert('code: '    + error.code    + "\n" +
        'message: ' + error.message + "\n" +
        "You can't use GeoPost without geolocation!");
    console.log("gps fail!!")
    gpsRetry(gpsOptions);
}

function gpsSuccess(position) {
    // Updating Model
    SingletonUser.getInstance().position = {'lat' : position.coords.latitude, 'lon' : position.coords.longitude};
    // SingletonFriendsList.getInstance().sort({'lat' : position.coords.latitude, 'lon' : position.coords.longitude})
    console.log(SingletonUser.getInstance().position);
    var storage = window.localStorage;
    var session_id = storage.getItem("session_id");
    if(session_id != null){
        SingletonUser.getInstance().session_id = session_id;
        loadModelFriends();
        // storage.removeItem("session_id");
        // var value = storage.getItem("session_id");
        console.log("value=", session_id);
    }
    else {
        $("#form-login").show();
    }

    $("#loading").hide();
    $("#sub").click(function () {
        $("#loading").show();
        login();
    })
}

function placeMarker(person) {
    //TODO Inserire la propria posizione. Verificare che la posizione non sia NUL.
    //TODO Aggiornare i valori degli amici
    var latLng = new google.maps.LatLng(person.position.lat, person.position.lon);
    var mark = {
        position: latLng,
        map: map,
        animation: google.maps.Animation.DROP
    }
    // mark.icon = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'

    var marker = new google.maps.Marker(mark)
    google.maps.event.addListener(marker, 'click', function(){
        infowindow.close(); // Close previously opened infowindow
        infowindow.setContent(
            '<h4 id="secondHeading" class="secondHeading">' + person.username + '</h4>' +
            "<div id='infowindow'>"+ person.status + "</div>" );
        infowindow.open(map, marker);
    });
}

function initMap(personList, map_id) {
    infowindow = new google.maps.InfoWindow();
    map = new google.maps.Map(document.getElementById(map_id), {
        zoom: 4,
        //TODO Capire dove centrare la mappa
        center: {lat: personList[0].position.lat, lng: personList[0].position.lon}
            // {lat: 45.506488, lng:  9.185794}
    });

    for(var i=0; i < personList.length; i++)
        placeMarker(personList[i])
}

function watchMapPosition() {
    return navigator.geolocation.watchPosition
    (onMapWatchSuccess, onMapError, { enableHighAccuracy: true });
}
