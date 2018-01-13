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

