var locations = [
{ name: "Cairo Opera House", lat: 30.042696,   long: 31.253151 }, 
{ name: "The Egyptian Museum", lat: 30.047926, long: 31.233639 }, 
{ name: "Al-Azhar Mosque", lat: 30.045967, long: 31.262674 },
{ name: "Sultan Hassan Mosque", lat: 30.032256, long: 31.256455 }, 
{ name: "Sawy Cultural Wheel", lat: 30.061999,  long: 31.249780 }, 
];

var map;
var marker;
// initialize tMap
function initializetMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 30.036044,   lng: 31.242449 },  
        zoom: 13
    });

    var self = this;
    this.searchTo = ko.observable("");

    // holds places array, infowindow, markers, and all other info
    self.placeListView = ko.observableArray([]);

    // to knockout
    locations.forEach(function (Items) {
        self.placeListView.push(new GetLocationView(Items));
    });

    this.placeLotsArray = ko.computed(function (){
        var searchFilter = self.searchTo().toLowerCase();
        if (searchFilter) {
            return ko.utils.arrayFilter(self.placeListView(), function (Items) {
                var name = Items.name.toLowerCase();
                var result = (name.search(searchFilter) >= 0);
                Items.visible(result);
                return result;
            });
        } else {
            self.placeListView().forEach(function (Items) {
                Items.visible(true);
            });
            return self.placeListView();
        }
    }, self);

}

// initialize Locations
function initializeLocations() {
    ko.applyBindings(new initializetMap());
}

function ErrorHandler() {
    alert("Something went wronge,sorry for this");
}

var GetLocationView = function (data) {

    var self = this;
    this.name = data.name;
    this.lat = data.lat;
    this.long = data.long;
    this.phone = "";
    this.state = "";
    this.twitter = "";

    self.visible = ko.observable(true);

    // initialize foursquare api 

    var fourSquareApiUrl = 'https://api.foursquare.com/v2/venues/search?ll=' + this.lat + ',' + this.long + '&client_id=MMQHOPSHCGNBGOV0XIQNCGPQ4AO14GD2ZSVULAHDUBTZ5EC1&client_secret=PUKLCXNEC1BAFXEIWCHBFBGTGKOJPSZ24NRZLDR5UKJDU203&v=20170519&query=' + this.name;

    // ajax to get venue name, phone number, twitter and state

    $.getJSON(fourSquareApiUrl).done(function (data) {

        console.log("success");

        var responseApi = data.response.venues[0];

        self.phone = responseApi.contact.formattedPhone;
        self.state = responseApi.location.state;
        self.twitter = responseApi.contact.twitter;
        
        if (self.phone !== undefined) {
            self.phone;
        } else {
            self.phone = "";
        }

        console.log(self.phone + self.state + self.twitter);
    }).fail(function () {
        alert("Sorry,can't connect to Foursquare API.");
    });

    // infowindow to display map content

    this.infoContent = '<div><div>' + data.name + '</div><div>twitter:' + self.twitter + '</div><div>' + self.phone + '</div><div>state:' + self.state + '</div></div>';

    this.infoWindow = new google.maps.InfoWindow({ content: self.infoContent });

    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(data.lat, data.long),
        map: map,
        title: data.name
    });

    //show and hide markers while search

    this.showMarkerView = ko.computed(function () {
        if (this.visible() === true) {
            this.marker.setMap(map);
        } 
        else {
            this.marker.setMap(null);
        }
        return true;
    }, this);

    // open info window on click marker

    this.marker.addListener('click', function () {

        self.infoContent = '<div><div>' + data.name + '</div><div>twitter:' + self.twitter + '</div><div>' + self.phone + '</div><div>state:' + self.state + '</div></div>';

        self.infoWindow.setContent(self.infoContent);

        self.infoWindow.open(map, this);

        self.marker.setAnimation(google.maps.Animation.BOUNCE);

        setTimeout(function () {
            self.marker.setAnimation(null);
        }, 1600);
    });

    this.bounceTrig = function (place) {
        google.maps.event.trigger(self.marker, 'click');
    };

};

