import {Component} from '@angular/core';
import * as L from 'leaflet';
import {ApiRequestService} from "../service/api-request.service";
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  map!: L.Map;
  data: L.LatLng[] = [];
  firstMarker : any;
  secondMarker : any;

  constructor(private apiRequestService: ApiRequestService) {}

  ngOnInit() {

    this.apiRequestService.findAll().subscribe((response) => {
      for (const point of response) {
        if (point.hasOwnProperty('latitude') && point.hasOwnProperty('longitude')) {
          this.data.push(new L.LatLng(point.latitude, point.longitude));
        }
      }
      this.createPolyline();
    });
  }

  ionViewDidEnter() {

    this.map = L.map('map').setView([35.6895, 10.746], 8);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.createMarkers();
  }

    createPolyline() {
      let polyline = L.polyline(this.data, {color: 'blue'}).addTo(this.map);
      this.map.fitBounds(polyline.getBounds());
    }

  createMarkers() {
      (L.Control as any).geocoder({
        placeholder: 'Start point',
        defaultMarkGeocode: false
        }).on('markgeocode', (e: any) => {
          var latlng = e.geocode.center;
          this.firstMarker = L.marker(latlng).addTo(this.map);
          this.map.fitBounds(e.geocode.bbox);
        }).addTo(this.map);

      (L.Control as any).geocoder({
        placeholder: 'End point',
        defaultMarkGeocode: false
        }).on('markgeocode', (e: any) => {
          var latlng = e.geocode.center;
          this.secondMarker = L.marker(latlng).addTo(this.map);
          this.map.fitBounds(e.geocode.bbox);
        }).addTo(this.map);
    }

  moveMarker() {

    var marker = L.marker([0,0]).addTo(this.map);

    L.Routing.control({
      waypoints: [
        L.latLng(this.firstMarker.getLatLng().lat, this.firstMarker.getLatLng().lng),
        L.latLng(this.secondMarker.getLatLng().lat,this.secondMarker.getLatLng().lng)
      ]
    }).on('routesfound',(e : any)=>{

      e.routes[0].coordinates.forEach((coord :any,index: any)=>{
        setTimeout(()=>{
          marker.setLatLng([coord.lat,coord.lng])
            .bindPopup(`Latitude: ${coord.lat}<br>Longitude: ${coord.lng}`)
            .openPopup();
        },100 * index)
      })
    }).addTo(this.map);
  }

}
