/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

//todo creare utenti test
//migliorare ricerca utente togliere utenti già aggiunti
function onLoad() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
}


function onDeviceReady() {
    this.receivedEvent('deviceready');
    document.addEventListener('pause', this.onPause.bind(this), false)
}


function onPause () {
        console.log("pausaaa")
    }


// Update DOM on a Received Event
function receivedEvent(id) {
    // getLocation();
    console.log(id);
    var storage = window.localStorage;
    var session_id = storage.getItem("session_id");
    if(session_id != null){
        SingletonUser.getInstance().session_id = session_id;
        loadModelFriends();
        loadProfileModel();
        console.log("value=", session_id);
    }
    else {
        $("#form-login").show();
    }

    $("#loading").hide();
    $("#sub").click(function () {
        $("#loading").show();
        loginViewController();
    })
}


function loginViewController () {
    var username = $("#inputUsername").val();
    var password = $("#inputPassword").val();
    // var username = "Giuse";
    // var password = "123";
    console.log(username);
    console.log(password);
    //TODO gestire gli errori login
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        url: "   https://ewserver.di.unimi.it/mobicomp/geopost/login",
        data: {
            'username': username,
            'password': password
        },
        error: function(xhr, textStatus, error){
            console.log(xhr.statusText);
            console.log(textStatus);
            console.log(error);
            $("#loading").hide();
            function alertDismissed() {
                // do something
            }
            navigator.notification.alert(
                'Wrong username or/and password',  // message
                alertDismissed(),         // callback
                'Login Error',            // title
                'Retry'                  // buttonName
            );
        },
        success: function(session_id){
            console.log(session_id);
            SingletonUser.getInstance().session_id = session_id;
            var storage = window.localStorage;
            storage.setItem("session_id", session_id);
            loadModelFriends();
            loadProfileModel();
        }
    });
}


function loadModelFriends() {
    getLocation();
    $("#loading").show();
    $.ajax({
        url: "https://ewserver.di.unimi.it/mobicomp/geopost/followed?session_id=" + SingletonUser.getInstance()
            .session_id,
        success: function (result) {
            $("#loading").hide();
            var people = result.followed;
            SingletonFriendsList.getInstance().reset();
            people.forEach(function (person) {
                console.log(person);
                SingletonFriendsList.getInstance().addFriend(person);

            })
            console.log(SingletonUser.getInstance().position);
            // var people = SingletonFriendsList.getInstance().sort(SingletonUser.getInstance.position);
            SingletonFriendsList.getInstance().sort(SingletonUser.getInstance().current_position)

            updateViewFriends();
            $("nav").show();
        }
    })
}


function updateViewFriends() {
    showSettingHideback();
    $("#loading").hide();
    $("#map").hide();

    $("#dynamicBody").load("view/viewFriends.html", function () {
        array_adapter = new FriendsListAdapterV2(document.getElementById('friend_list'), SingletonFriendsList
            .getInstance().getFriendsList());
        array_adapter.refresh();
        console.log(SingletonFriendsList.getInstance().getFriendsList());

        $("#button_friend_list").removeClass("btn-primary").addClass("btn-success");
        $("#button_map").removeClass("btn-success").addClass("btn-primary");

        $("#button_friend_list").click(function() {
            $("#map").hide();
            $("#friend_list").show();
            $("#button_map").removeClass("btn-success").addClass("btn-primary");
            $("#button_friend_list").removeClass("btn-primary").addClass("btn-success");

        });
        $("#button_map").click(function() {
            $("#friend_list").hide();
            $("#button_map").removeClass("btn-primary").addClass("btn-success");
            $("#button_friend_list").removeClass("btn-success").addClass("btn-primary");;
            $("#map").show();
            initMap(SingletonFriendsList.getInstance().getFriendsList(), 'map');
        });
    })

}

function updateStatusPageViewController() {
    showBackHidesetting();
    $("#loading").show();
    $("#dynamicBody").hide();
    $("#dynamicBody").load("view/viewUpdateStatusPage.html", function () {
        $("#loading").hide();
        $("#dynamicBody").show();
        getLocation();
        $("#submitPost").click(function () {
            $("#loading").show();
            var status = $("#post").val();
            if (SingletonUser.getInstance().current_position != null) {
                $.ajax({
                    url: "https://ewserver.di.unimi.it/mobicomp/geopost/status_update?session_id="
                    +
                    SingletonUser.getInstance().session_id + "&message=" + status + "&lat=" +
                    SingletonUser.getInstance().current_position.lat
                    + "&lon=" + SingletonUser.getInstance().current_position.lon,

                    success: function (result) {
                        $("#loading").hide();
                        $("#dynamicBody").show();
                        console.log("Messaggio postato! with result=" + result);
                        console.log(" " + status)
                        SingletonUser.getInstance().status = status;
                        SingletonUser.getInstance().position = SingletonUser.getInstance().current_position;
                        SingletonUser.getInstance().current_position = null;
                        updateViewFriends();
                    }
                })
            }
            else {
                function onConfirm(buttonIndex) {
                    // alert('You selected button ' + buttonIndex);
                    if (buttonIndex == 1) getLocation();
                    else {
                        SingletonUser.getInstance().current_position = SingletonUser.getInstance().position;
                    }
                }

                navigator.notification.confirm(
                    'Sorry, We cant trace your position, maybe gps is disable.', // message
                    onConfirm,            // callback to invoke with index of button pressed
                    'Position Error',
                    ['Retry','Use last position']     // buttonLabels
                );

                $("#loading").hide();
                $("#dynamicBody").show();
            }
        })
    })
}

function addFriendViewController() {
    showBackHidesetting();
    $("#loading").show();
    $("#dynamicBody").hide();
    $("#dynamicBody").load("view/viewAddFriendPage.html",
        function () {
            $("#loading").hide();
            $("#dynamicBody").show();
            $("#inputFriend").keyup(
                function () {
                    $("#loading").hide();
                    var name = $("#inputFriend").val();
                    console.log(name);
                    $.ajax({
                        url: 'https://ewserver.di.unimi.it/mobicomp/geopost/users?session_id='
                        + SingletonUser.getInstance().session_id + '&usernamestart=' + name
                        + "&limit=20",
                        success: function (result) {
                            $("#loading").hide();
                            $("#dynamicBody").show();
                            $(function () {
                                console.log(SingletonUser.getInstance().username);
                                var availableTags = result.usernames.filter(function (username) {
                                    return username != SingletonUser.getInstance().username;
                                })
                                console.log(availableTags);
                                $("#inputFriend" ).autocomplete({
                                    source: availableTags
                                });
                                $( "#inputFriend" ).autocomplete("widget").addClass("fixedHeight");
                            })
                        },
                        error: function(xhr, status, error) {
                            $("#loading").hide();
                            navigator.notification.alert(
                                'Error',  // message
                                function () {  },         // callback
                                xhr.responseText,            // title
                                'Done'                  // buttonName
                            );

                        }
                    })
                }
            )
            $("#followFriend").click(function () {
                var name = $("#inputFriend").val();
                if (name != SingletonUser.getInstance().username) {
                    $("#loading").show();
                    $.ajax({
                        url: 'https://ewserver.di.unimi.it/mobicomp/geopost/follow?session_id=' +
                        SingletonUser.getInstance().session_id + '&username=' + name,
                        success: function (result) {
                            $("#loading").hide();
                            navigator.notification.alert(
                                'Now you have one more friend',  // message
                                function () {  },         // callback
                                'Success',            // title
                                'Done'                  // buttonName
                            );
                            loadModelFriends();
                        },
                        error: function (xhr, status, error) {
                            navigator.notification.alert(
                                xhr.responseText,  // message
                                function () {  },         // callback
                                'Error',            // title
                                'Done'                  // buttonName
                            );
                            $("#loading").hide();
                        }
                    })
                }
            })
        }
    );
}

function loadProfile() {
    console.log(SingletonUser.getInstance().username);
    initMap([SingletonUser.getInstance()], 'map_profile');
    $("#username").html(SingletonUser.getInstance().username);
    $("#status").html(SingletonUser.getInstance().status);
}

function loadProfileModel() {
    $.ajax({
        url: 'https://ewserver.di.unimi.it/mobicomp/geopost/profile?session_id=' + SingletonUser.getInstance().session_id,
        success: function (user) {
            console.log(user);
            SingletonUser.getInstance().username = user.username;
            SingletonUser.getInstance().status = user.msg;
            SingletonUser.getInstance().position = {'lat' : user.lat, 'lon' : user.lon}
        },
        error: function(xhr, status, error) {
            alert(xhr.responseText);
        }
    })
}

function profileViewController() {
    $("#loading").show();
    showBackHidesetting()
    $("#logout-button").show();
    console.log(SingletonUser.getInstance());
    $("#dynamicBody").load("view/viewProfile.html", function () {
        loadProfile();
        $("#dynamicBody").show();
        $("#loading").hide();
        google.maps.event.trigger(map, 'resize');


    })
}

function logout() {
    $("#loading").show();
    $("#dynamicBody").hide();
    $.ajax({
        url: "https://ewserver.di.unimi.it/mobicomp/geopost/logout?session_id=" + SingletonUser.getInstance().session_id,
        success: function (result) {
            console.log("logout eseguito!");
            var storage = window.localStorage;
            storage.removeItem("session_id");
            console.log(window.location.href);
            location.reload();
        }
    })
}
