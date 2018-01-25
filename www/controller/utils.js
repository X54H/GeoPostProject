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
    $("#button_friend_list").hide();
    $("#refresh_button").hide();
    $("#button_map").hide();
}

function showSettingHideback() {
    closeNav();
    $("#refresh_button").show();
    $("#setting").show();
    $("#button_friend_list").show();
    $("#button_map").show();
    $("#setting").show();
    $("#back").hide();
    $("#logout-button").hide();
}

function precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}

function clickAction(action) {
    closeNav();
    action();
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
            window.location.href = "../index.html"
        }
    })
}
