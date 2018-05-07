import React, {Component} from 'react';
import { Map, TileLayer, FeatureGroup} from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
// import L from 'leaflet';
import './SatelliteMap.css';



class SatelliteMap extends Component {
    constructor() {
        super();
        this.state = {
            lat: 39.13,
            lng: -121.63,
            zoom: 12
        }
    }

    _onCreated(e) {
        let type = e.layerType;
        let layer = e.layer;
        if (type === 'rectangle') {
            // Setup on click to make API call
            // *** TO DO: *****
            // Make call to RESTAPI right here, on click
            layer.on('click', function(){
               let latLngCoords = layer.getLatLngs();
               console.log(latLngCoords);
            });
        }
        else {
            console.log("_onCreated: something else created:", type, e);
        }
        // Do whatever else you need to. (save to db; etc)

        //this._onChange();
    }

    _onDeleted = (e) => {

        let numDeleted = 0;
        e.layers.eachLayer( (layer) => {
            numDeleted += 1;
        })
        console.log(`onDeleted: removed ${numDeleted} layers`, e);

        //this._onChange();
    }


    render() {
        const position = [this.state.lat, this.state.lng];

        return (
            <Map
                center={position}
                zoom={this.state.zoom}>
                <TileLayer
                    attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <TileLayer
                    attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                    url="/tiles/{z}/{x}/{y}.png"
                    noWrap={true}
                    tms={true}
                />

                <FeatureGroup>
                    <EditControl
                        position='topleft'
                        onCreated={this._onCreated}
                        onDeleted={this._onDeleted}
                        draw={{
                            polygon: false,
                            marker: false,
                            circle: false,
                            polyline: false,
                            circlemarker: false
                        }}
                    />
                </FeatureGroup>
            </Map>
        )
    }


    // _onChange = () => {
    //
    //     // this._editableFG contains the edited geometry, which can be manipulated through the leaflet API
    //
    //     const { onChange } = this.props;
    //
    //     if (!this._editableFG || !onChange) {
    //         return;
    //     }
    //
    //     const geojsonData = this._editableFG.leafletElement.toGeoJSON();
    //     onChange(geojsonData);
    // }
}



export default SatelliteMap;
