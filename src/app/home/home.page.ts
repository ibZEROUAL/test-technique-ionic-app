import {Component} from '@angular/core';
import * as L from 'leaflet';
import {ApiRequestService} from "../service/api-request.service";
import 'leaflet-routing-machine';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  map!: L.Map;
  data: L.LatLng[] = [];

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

    this.movingMarker();
  }

    createPolyline() {
      let polyline = L.polyline(this.data, {color: 'blue'}).addTo(this.map);
      this.map.fitBounds(polyline.getBounds());
    }

    movingMarker() {

      var marker = L.marker([35.6895, 10.746]).addTo(this.map);

      this.map.on('click',(e)=>{

        L.Routing.control({
          waypoints: [
            L.latLng(35.6895, 10.746),
            L.latLng(e.latlng.lat,e.latlng.lng),
          ]
        }).on('routesfound',(e : any)=>{

          e.routes[0].coordinates.forEach((coord :any,index: any)=>{
            console.log(marker);
              setTimeout(()=>{
                marker.setLatLng([coord.lat,coord.lng])
                  .bindPopup('A pretty CSS popup.<br> Easily customizable.')
                  .openPopup();
              },10 * index)
          })
        }).addTo(this.map);
      })
    }

}
