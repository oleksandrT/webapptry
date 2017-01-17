if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(function(registration) {
    console.log('ServiceWorker registration successful with scope: ', registration.scope);
  }).catch(function(err) {
    console.log('ServiceWorker registration failed: ', err);
  });
}

if (navigator.geolocation) {
  console.log('Geolocation is supported!');
}
else {
  console.log('Geolocation is not supported for this Browser/OS version yet.');
}

function get(url) {
  console.log("get url");
  return new Promise(function(resolve, reject) {
    var req = new XMLHttpRequest();

    req.open('GET', url);
    req.onload = function() {
      if (req.status == 200) {
        resolve(req.response);
      }
      else {
        reject(Error(req.statusText));
      }
    };

    req.onerror = function() {
      connectionFail();
      reject(Error("Network Error"));
    };
    req.send();
  })
}

function gpsFail(error) {
  // alert(error);
  document.getElementById('lat').innerHTML = "Bad news! We cannot find you";
  document.getElementById('no-location').style.display = 'block';
  if (error === 1) {
    document.getElementById('location-error').innerHTML = "Are you sure your location <br> service is switched on?";
  } else if(error === 3) {
    document.getElementById('location-error').innerHTML = "Location search timed out <br> we need the internet to work";
  }
}

function emptyNone() {
  document.getElementById('empty').style.display = 'none';
}

function loaderNone() {
  document.getElementById('loader').style.display = 'none';
}

function loaderBlock() {
  document.getElementById('loader').style.display = 'block';
}

function connectionFail() {
  loaderNone();
  document.getElementById('lat').innerHTML = "Bad news! We need the internet";
  document.getElementById('no-connection').style.display = 'block';
}

function connectionFailNone() {
  document.getElementById('no-connection').style.display = 'none';
}

function findLocation() {
    return new Promise(function(resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject, {timeout: 5000});
  });
};

function geoSuccess(position) {
  var lat = position.coords.latitude;
  var long = position.coords.longitude;
  var latshort = lat.toFixed(10) + ", ";
  var longshort = long.toFixed(10);

  document.getElementById('lat').innerHTML = latshort + " " + longshort;

  var latlng = {lat:lat, long:long};

  return latlng;
};

function geoFailure(error){
  emptyNone();
  if(error.code === 2) {
    connectionFail();
  } else {
    gpsFail(error.code);
  }
  return Promise.reject(error.code);
}

function searchRestaurants(latlng) {
  emptyNone();
  connectionFailNone();
  document.getElementById('restaurants').innerHTML = '';
  loaderBlock();
  return get('/results/?lat=' + latlng.lat + '&long=' + latlng.long);

}

function showRestaurants(restaurants) {
  loaderNone();
  document.getElementById('restaurants').innerHTML = restaurants;
}

function main() {
  findLocation()
  .then(geoSuccess, geoFailure)
  .then(searchRestaurants)
  .then(showRestaurants);
}

var detect = document.getElementById('submit');
detect.addEventListener('click', main);