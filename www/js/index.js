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

//Gestire meglio errori Login
//Gestire meglio errori in generale
//mettere massimo caratteri 25
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
    getLocation();
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
        login();
    })
}


function clickAction(action) {
    closeNav();
    action();
}

function login () {
    username = $("#inputUsername").val();
    password = $("#inputPassword").val();
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
            alert(error);
            $("#loading").hide();
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


function updateViewFriends() {
    showSettingHideback();
    $("#loading").hide();
    $("#map").hide();

    $("#dynamicBody").load("html/viewFriends.html", function () {
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



function logout() {
    $("#loading").show();
    $("#dynamicBody").hide();
    $.ajax({
        url: "https://ewserver.di.unimi.it/mobicomp/geopost/logout?session_id=" + SingletonUser.getInstance().session_id,
        success: function (result) {
            console.log("logout eseguito!");
            var storage = window.localStorage;
            storage.removeItem("session_id");
            window.location.href = "index.html"
        }
    })
}


function showUpdateStatusPage() {
    showBackHidesetting();
    $("#loading").show();
    $("#dynamicBody").hide();

    $("#dynamicBody").load("html/showUpdateStatusPage.html", function () {
        $("#loading").hide();
        $("#dynamicBody").show();
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
                        alert("Your state is updated! Thank you!")
                    }
                })
            }
            else {
                alert("I can't update you status! I don't know where you are! ");
                $("#loading").hide();
                $("#dynamicBody").show();
            }
        })
    })
}

function showAddFriendPage() {
    showBackHidesetting();
    $("#loading").show();
    $("#dynamicBody").hide();
    $("#dynamicBody").load("html/showAddFriendPage.html",
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
                            alert(xhr.responseText);

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
                            alert(result);
                            loadModelFriends();
                        },
                        error: function (xhr, status, error) {
                            alert(xhr.responseText);
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

function showProfilePage() {
    $("#loading").show();
    showBackHidesetting()
    $("#logout-button").show();
    console.log(SingletonUser.getInstance());
    $("#dynamicBody").load("html/profile.html", function () {
        loadProfile();
        $("#dynamicBody").show();
        $("#loading").hide();
        google.maps.event.trigger(map, 'resize');


    })
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
