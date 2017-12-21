var map;
var infowindow;

function getLocation() {
    var gpsOptions = {maximumAge: 0, timeout: 1000, enableHighAccuracy: true};
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
        "Attiva la geolocalizzazione per usare al meglio la tua app!");
    SingletonUser.getInstance().position = null;
    console.log("gps fail!!")
    gpsRetry(gpsOptions);
}

function gpsSuccess(position) {
    // Updating Model
    SingletonUser.getInstance().position = {'lat' : position.coords.latitude, 'lon' : position.coords.longitude};
    SingletonFriendsList.getInstance().sort({'lat' : position.coords.latitude, 'lon' : position.coords.longitude})
    console.log('success');
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
        center:{lat: 45.506488, lng:  9.185794}
    });

    for(var i=0; i < personList.length; i++)
        placeMarker(personList[i])
}

function watchMapPosition() {
    return navigator.geolocation.watchPosition
    (onMapWatchSuccess, onMapError, { enableHighAccuracy: true });
}
