function contactmap() {	
	
    if( jQuery('#map').length > 0 ){					
        var latlng = new google.maps.LatLng(34.052235,-118.243683);
        var settings = {
            zoom: 16,
            center: new google.maps.LatLng(34.052235,-118.243683),
            mapTypeControl: false,
            scrollwheel: false,
            draggable: true,
            panControl:false,
            scaleControl: false,
            zoomControl: false,
            streetViewControl:false,
            navigationControl: false};			
            var newstyle = [
            {
                "featureType": "all",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "saturation": 36
                    },
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 40
                    }
                ]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "visibility": "on"
                    },
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 16
                    }
                ]
            },
            {
                "featureType": "all",
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 20
                    }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 17
                    },
                    {
                        "weight": 1.2
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 20
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 21
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 17
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 29
                    },
                    {
                        "weight": 0.2
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 18
                    }
                ]
            },
            {
                "featureType": "road.local",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 16
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 19
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 17
                    }
                ]
            }
        ];
        var mapOptions = {
            styles: newstyle,
            mapTypeControlOptions: {
                 mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'holver']
            }
        };
        var map = new google.maps.Map(document.getElementById("map"), settings);	
        var mapType = new google.maps.StyledMapType(newstyle, { name:"Grayscale" });    
            map.mapTypes.set('holver', mapType);
            map.setMapTypeId('holver');
                    
        
        google.maps.event.addDomListener(window, "resize", function() {
            var center = map.getCenter();
            google.maps.event.trigger(map, "resize");
            map.setCenter(center);
        });	
        var contentString = '<div id="content-map-icon" style="text-align:center; padding-top:10px; padding-left:10px">'+
            '<div id="siteNotice">'+
            '</div>'+
            '<h4 id="firstHeading" class="firstHeading" style="color:#000!important; font-size:24px; font-weight:600; margin-bottom:0px;">David Fincher</h4>'+
            '<div id="bodyContent">'+
            '<p style="color:#000 !important; font-weight:500; font-size:16px; line-height:24px; margin-bottom:10px">1444 S. Alameda Street<br> Los Angeles, California 90021</p>'+
            '</div>'+
            '</div>';
        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });	
        var companyImage = new google.maps.MarkerImage('images/map-icon.png',
            new google.maps.Size(100,100),
            new google.maps.Point(0,0),
            new google.maps.Point(35,20)
        );
        var companyPos = new google.maps.LatLng(34.052235,-118.243683);	
        var companyMarker = new google.maps.Marker({
            position: companyPos,
            map: map,
            icon: companyImage,               
            title:"Our Office",
            zIndex: 3});	
        google.maps.event.addListener(companyMarker, 'click', function() {
            infowindow.open(map,companyMarker);
        });	
    }
    
    return false

}//End ContactMap