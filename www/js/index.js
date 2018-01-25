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

// TODO Migliorare Ricerca utente
// Migliorare la user experience

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
            // loadProfile();
            loadModelFriends();
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
            // google.maps.event.trigger(map, 'resize');
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
        // if (confirm('Areyou sure you want to save this thing into the database?')) {
        //     // Save it!
        // } else {
        //     // Do nothing!
        // }
        $("#loading").hide();
        $("#dynamicBody").show();
        $("#submitPost").click(function () {
            $("#loading").show();
            var status = $("#post").val();
            if (SingletonUser.getInstance().position != null) {
                $.ajax({
                    url: "https://ewserver.di.unimi.it/mobicomp/geopost/status_update?session_id="
                    + SingletonUser.getInstance().session_id + "&message=" + status + "&lat=" + SingletonUser.getInstance().position.lat
                    + "&lon=" + SingletonUser.getInstance().position.lon,

                    success: function (result) {
                        $("#loading").hide();
                        $("#dynamicBody").show();
                        console.log("Messaggio postato! with result=" + result);
                        console.log(" " + status)
                        SingletonUser.getInstance().status = status;
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
                                    return username != "Giuse";
                                })
                                console.log(availableTags);
                                $("#inputFriend" ).autocomplete({
                                    source: availableTags
                                });
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
                $("#loading").show();
                $.ajax({
                    url: 'https://ewserver.di.unimi.it/mobicomp/geopost/follow?session_id=' +
                    SingletonUser.getInstance().session_id + '&username=' + name,
                    success: function (result) {
                        $("#loading").hide();
                        alert(result);
                        loadModelFriends();
                    },
                    error: function(xhr, status, error) {
                        alert(xhr.responseText);
                        $("#loading").hide();
                    }
                })
            })
        }
    );
}


function loadProfile() {
    $("#loading").show();
    $("#dynamicBody").hide();
    $.ajax({
        url: 'https://ewserver.di.unimi.it/mobicomp/geopost/profile?session_id=' + SingletonUser.getInstance().session_id,
        success: function (user) {
            $("#loading").hide();
            $("#dynamicBody").show();
            console.log(user);
            var u = new Person(user.username, user.msg, user.lat, user.lon);
            initMap([u], 'map_profile');
            $("#username").html(user.username);
            $("#status").html(user.msg);
        },

        error: function(xhr, status, error) {
            alert(xhr.responseText);
        }
    })
}

function showProfilePage() {
    $("#loading").show();
    $("#dynamicBody").hide();
    showBackHidesetting()
    $("#logout-button").show();
    console.log(SingletonUser.getInstance());
    $("#dynamicBody").load("html/profile.html", function () {
        loadProfile();
        $("#dynamicBody").show();

    })
}


function loadModelFriends() {
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
            SingletonFriendsList.getInstance().sort(SingletonUser.getInstance().position)

            updateViewFriends();
            $("nav").show();
        }
    })
}
