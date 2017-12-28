
// TODO create adapter pattern
// test macchina


function Person(username, status, lat, lon) {
    this.username = username;
    this.status = status;
    this.position = {'lat' : Number(lat), 'lon' : Number(lon)}
    this.distance = ""
}

Person.prototype.toString = function () {
    return self.username
}

function User(username, status, lat, lon, session_id) {
    Person.call(this, username, status, lat, lon)
    this.session_id = session_id
}


function FriendsList() {
    this.friends = []
}

FriendsList.prototype.getFriendsList = function () {
    return this.friends;
}

FriendsList.prototype.friendExists = function (username) {
    for (var i = 0; i < this.friends.length; i++){
        if (this.friends[i].username === username)
            return i;
    }
    return -1
}

FriendsList.prototype.addFriend = function (person) {
    var f = new Person(person.username, person.msg, person.lat, person.lon);
    if (this.friendExists(person.username) == -1)
        this.friends.push(f)
}

FriendsList.prototype.reset = function () {
    this.friends = []

}

FriendsList.prototype.getFriendByUsername = function (username) {
    var index = this.friendExists(username);
    if (index !== -1)
        return this.friends[index];
    return -1
}

FriendsList.prototype.sort = function (position) {
    this.friends.forEach(function (friend) {
        friend.distance = getDistance(friend.position, position)
        console.log(friend.distance)
    })
    return this.friends.sort(function (friend1, friend2) {
        return friend1.distance - friend2.distance
    })
}


function ListAdapter(div, list) {
    this.div = div
    this.list = list
}

ListAdapter.prototype.generateListElement = function (element) {
    return('<li>' + element + '</li>');
}

ListAdapter.prototype.refresh = function () {
    var toReturn = '<ul>';
    for (var i = 0; i < this.list.length; i++){
        toReturn += this.generateListElement(this.list[i]);
    }

    toReturn += '</ul>'
    console.log(toReturn);
    this.div.innerHTML = toReturn;
}

function FriendsListAdapter(div, friendsList) {
    ListAdapter.call(this, div, friendsList)
    FriendsList.prototype = Object.create(FriendsListAdapter.prototype)
    FriendsListAdapter.prototype.refresh = function () {
        var toReturn = '<div class="list-group">';
        for (var i = 0; i < this.list.length; i++){
            toReturn += this.generateListElement(this.list[i]);
        }
        toReturn += '</div>';
        this.div.innerHTML = toReturn;
    }
    FriendsListAdapter.prototype.generateListElement = function (person) {
        var toReturn = '<a href="#" class="list-group-item list-group-item-action flex-column align-items-start">';
        toReturn += '<div class="d-flex w-100 justify-content-between">';
        toReturn += '<h5 class="mb-1">' + person.username + '</h5>';
        toReturn += '</div>';
        if (person.status != null) toReturn += '<p class="mb-1">' + person.status + '</p>';
        toReturn += '<small style="position: absolute;\n' +
            'top: 12px;\n' +
            'right: 16px;">mt ' + parseInt(person.distance) + '</small>'
        toReturn += '</a>'
        return toReturn;
    }
}


var rad = function(x) {
    return x * Math.PI / 180;
};

var getDistance = function(p1, p2) {
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = rad(p2.lat - p1.lat);
    var dLong = rad(p2.lon - p1.lon);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d/1000; // returns the distance in meter
};


var SingletonFriendsList = (function () {
    var instance;

    function createInstance() {
        var friendList = new FriendsList();
        return friendList;
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

var SingletonUser = (function () {
    var instance;

    function createInstance() {
        var user = new User();
        return user;

    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();



// friendlist.addFriend("giuse", "ciao raga", "45.524", "9.20335");
// friendlist.addFriend("silvia", "ciao brutti", "45.450", "9.20335");
// friendlist.addFriend("valeria", "ciao stronzi", "45.510", "9.20310");
// friendlist.addFriend("mattia", "ciao belli", "45.300", "9.20335");



// console.log(getDistance(friendlist.getFriendByUsername("mattia").position,
//     friendlist.getFriendByUsername("giuse").position));

// console.log(friendlist.sort({"lat" : 45.524, lon : 9.20335}))

