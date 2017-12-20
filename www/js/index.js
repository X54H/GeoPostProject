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

// TODO Sistemare logout
// TODO Handling Errors
//TODO PROFILE QUALCHE NON MOSTRA LA POSIZIONE SULLA MAPPA
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

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function showBackHidesetting() {
    closeNav();
    $("#setting").hide();
    $("#back").show();
}

function showSettingHideback() {
    closeNav();
    $("#setting").show();
    $("#back").hide();
}


// Update DOM on a Received Event
function receivedEvent(id) {
    console.log(id);
    //TODO Bug doppio click da risolvere.
    $("#sub").click(function () {
        login()
    })
}

function login () {
    username = $("#inputUsername").val();
    password = $("#inputPassword").val();
    // var username = "giuse";
    // var password = "bigs123qwert";
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

        },
        success: function(session_id){
            console.log(session_id);
            SingletonUser.getInstance().session_id = session_id;
            getProfile();
            loadFriends();
        }
    });
}

function loadFriends() {
    $.ajax({
        url: "https://ewserver.di.unimi.it/mobicomp/geopost/followed?session_id=" + SingletonUser.getInstance()
            .session_id,
        success: function (result) {
                var people = result.followed;
                people.forEach(function (person) {
                    SingletonFriendsList.getInstance().addFriend(person);

                })
                // showFollowedFriends();
                array_adapter = new FriendsListAdapter(document.getElementById('dynamicBody'), SingletonFriendsList
                    .getInstance().getFriendsList());
                array_adapter.refresh();
                $("nav").show(); 
        }
    })
}


function showFollowedFriends() {
    showSettingHideback();
    console.log(SingletonFriendsList.getInstance().getFriendsList());
    array_adapter.refresh()
}



function logout() {
    $.ajax({
        url: "https://ewserver.di.unimi.it/mobicomp/geopost/logout?session_id=" + SingletonUser.getInstance().session_id,
        success: function (result) {
            console.log("logout eseguito!");
            window.location.href = "index.html"
        }
    })
}


function showUpdateStatusPage() {
    showBackHidesetting();
    $("#dynamicBody").load("html/showUpdateStatusPage.html", function () {
        // if (confirm('Are you sure you want to save this thing into the database?')) {
        //     // Save it!
        // } else {
        //     // Do nothing!
        // }
        SingletonUser.getInstance().position = null;
        getMapLocation();
        $("#submitPost").click(function () {
            var status = $("#post").val();


            if (SingletonUser.getInstance().position != null) {
                $.ajax({
                    url: "https://ewserver.di.unimi.it/mobicomp/geopost/status_update?session_id="
                    + SingletonUser.getInstance().session_id + "&message=" + status + "&lat=" + SingletonUser.getInstance().position.lat
                    + "&lon=" + SingletonUser.getInstance().position.lon,

                    success: function (result) {
                        console.log("Messaggio postato! with result=" + result);
                        console.log(" " + status)
                        SingletonUser.getInstance().status = status;
                        alert("Your state is updated! Thank you!")
                    }
                })
            }
            else {
                alert("I can't update you status! I don't know where you are! ")
            }
        })
    })
}

function showAddFriendPage() {
    showBackHidesetting();
    $("#dynamicBody").load("html/showAddFriendPage.html",
        function () {
            $("#inputFriend").keyup(
                //TODO autocomplete
                function () {
                    var name = $("#inputFriend").val();
                    console.log(name);
                    $.ajax({
                        url: 'https://ewserver.di.unimi.it/mobicomp/geopost/users?session_id='
                        + SingletonUser.getInstance().session_id + '&usernamestart=' + name
                        + "&limit=20",
                        success: function (result) {
                            console.log(result.usernames);
                            $(function () {
                                var availableTags = result.usernames;
                                $("#inputFriend" ).autocomplete({
                                    source: availableTags
                                });
                            })
                        },
                        error: function(xhr, status, error) {
                            alert(xhr.responseText);
                        }
                    })
                }
            )
            $("#showAddFriendPage").click(function () {
                var name = $("#inputFriend").val();
                $.ajax({
                    url: 'https://ewserver.di.unimi.it/mobicomp/geopost/follow?session_id=' +
                    SingletonUser.getInstance().session_id + '&username=' + name,
                    success: function (result) {
                        alert(result);
                    },
                    error: function(xhr, status, error) {
                        alert(xhr.responseText);
                    }
                })
            })
        }
    );
}



function getProfile() {
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
    showBackHidesetting()
    getProfile();
    console.log(SingletonUser.getInstance());
    $("#dynamicBody").load("html/profile.html", function () {
        initMap([SingletonUser.getInstance()]);
    })
}

