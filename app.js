var APP_GLOBAL = APP_GLOBAL || {};

$(function () {
    // DOM is now ready

    (function () {
        setAppGlobal('category', 'Landscape');
        setAppGlobal('location', 'Current Location');
        setAppGlobal('radius', '10 Miles');
        setAppGlobal('numImg', 8);
        calcLatLongNearMe();
        console.log(JSON.stringify(APP_GLOBAL));

    })();

    _500px.init({
        sdk_key: apiKeys.px500Key
        // AIzaSyAKKIH5DVAuLtO7b3013VUPLutriX9XueY Google Key
    });
    // If the user clicks the login link, log them in
    $('#login').click(function () {
        _500px.login();
    });

    $('#back').click(function () {
        $('.images').children().remove();
        $('.sign-in-view').show();
        $('.image-results-view').hide();
    });

    // If the user clicks category dropdown
    $('#categoryDrop li').on('click', function () {
        setAppGlobal('category', $(this).text());
        $('#categoryBtn').text(getAppGlobal('category')).append('&nbsp;<span class="caret"></span>');
        $('span.picCat').text(getAppGlobal('category') + ' photos');
    });

    // If the user clicks location dropdown
    $('#locationDrop li').on('click', function () {
        setAppGlobal('location', $(this).text());
        $('#locationBtn').text(getAppGlobal('location')).append('&nbsp;<span class="caret"></span>');
        $('span.picLoc').text('near ' + getAppGlobal('location'));
        calcLatLong(getAppGlobal('location'));
    });

    // If the user clicks radius dropdown
    $('#radiusDrop li').on('click', function () {
        setAppGlobal('radius', $(this).text());
        //console.log("shown " + getAppGlobal('radius'));
        $('#radiusBtn').text(getAppGlobal('radius')).append('&nbsp;<span class="caret"></span>');
    });

    // If the user clicks numImg dropdown
    $('#numImgDrop li').on('click', function () {
        setAppGlobal('numImg', $(this).text());
        //console.log("shown " + getAppGlobal('radius'));
        $('#numImgBtn').text(getAppGlobal('numImg')).append('&nbsp;<span class="caret"></span>');
    });

    // When a successful login to 500px is made, they fire off the 'authorization_obtained' event
    _500px.on('authorization_obtained', function () {
        // Successful OAuth login!
        console.log("authorization obtained");

        $('.sign-in-view').hide();
        $('.image-results-view').show();
        $('span.picCat').text(getAppGlobal('category') + ' photos');
        $('span.picLoc').text('near ' + getAppGlobal('location'));

        var loc = {lat: getAppGlobal('lat'), long: getAppGlobal('long')};

        var cat = getAppGlobal('category');
        var radius = getAppGlobal('radius').replace(/\ miles/i, 'mi');
        var numImg = getAppGlobal('numImg');
        console.log("Calling 500px with lat: " + loc.lat + " long: " + loc.long + " cat: " + cat + " radius " + radius);
        console.log(JSON.stringify(APP_GLOBAL));

        var searchOptions = {
            geo: loc.lat + ',' + loc.long + ',' + radius,
            only: cat,

            rpp: numImg,
            sort: 'highest_rating',
            image_size: 3 //1080 // This isn't neccessary but by default the images are thumbnail sized
        };

        _500px.api('/photos/search', searchOptions, function (response) {
            var results = response.data.photos;
            var str = "";
            if (!results || results.length == 0) {
                str += '<div>&nbsp;</div><div class="center-div">Sorry no photos matching the search parameters were found!</div>';
            } else {

                results.sort(sortByVotesDesc);

                for (var i = 0; i < results.length; i++) {
                    var url = results[i].image_url;
                    var name = results[i].name;
                    var uname = results[i].user.username;
                    var votes = results[i].positive_votes_count;

                    if (i === 0) str += "<div>";
                    str += '<img src=' + url + ' class="img-thumbnail image rounded float-left img-fluid" </img>';

                    if (i === results.length - 1) str += "</div>";
                }
            }
            $('.images').append(str);

        });

    });

    function sortByVotesDesc(a, b) {
        //var sorted = arr.reduce();
        console.log("sorting");

        var aScore = a.positive_votes_count;
        var bScore = b.positive_votes_count;
        return ((aScore > bScore) ? -1 : ((aScore < bScore) ? 1 : 0));
    }

    function findCity(lat, long) {
        var uri = 'https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=' + apiKeys.googleMapsGeoCodingKey;

    }


    function calcLatLong(location) {
        var ll = {};
        if (location === "Current Location") {
            ll = getLatLongNearMe();
            setAppGlobal('lat', ll.lat);
            setAppGlobal('long', ll.long);
        } else {
            ll = calcLatLongUsingGoogle(location);
        }


        return ll;
    }

    function getLatLongNearMe() {

        var loc = {};
        loc.lat = getAppGlobal('latNearMe');
        loc.long = getAppGlobal('longNearMe');
        return loc
    }

    function calcLatLongNearMe() {
        if (navigator.geolocation) {
            //console.log("can do geo");
            navigator.geolocation.getCurrentPosition(function (position) {
                setAppGlobal('lat', position.coords.latitude);
                setAppGlobal('long', position.coords.longitude);
                setAppGlobal('latNearMe', position.coords.latitude);
                setAppGlobal('longNearMe', position.coords.longitude);

            });
        }
    }

    function calcLatLongUsingGoogle(location) {
        var loc = {
            lat: 0,
            long: 0
        };

        console.log("Using Google - lat " + loc.lat + " long " + loc.long);

        var geocoder = new google.maps.Geocoder();
        var address = location; //'London, UK';

        if (geocoder) {
            geocoder.geocode({'address': address}, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    console.log(results[0].geometry.location);
                    console.log("Lat: " + JSON.stringify(results[0].geometry.location));
                    var json = JSON.stringify(results[0].geometry.location);
                    var textLoc = JSON.parse(json);
                    loc.lat = textLoc.lat;
                    loc.long = textLoc.lng;
                    setAppGlobal('lat', textLoc.lat);
                    setAppGlobal('long', textLoc.lng);
                }
                else {
                    console.log("Geocoding failed: " + status);
                }
            });
        }
        return loc;
    }

    function setAppGlobal(prop, value) {
        APP_GLOBAL[prop] = value;
        console.log("Set prop: " + prop + " value: " + getAppGlobal(prop));
    }

    function getAppGlobal(prop) {
        return APP_GLOBAL[prop];
    }
});
