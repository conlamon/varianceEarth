import React, {Component} from 'react';
import { Map, TileLayer, FeatureGroup, Popup} from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import './SatelliteMap.css';


class SatelliteMap extends Component {
    constructor() {
        super();
        this.state = {
            markers: [],
            // Set the map starting point by Lat, Lng and Zoom
            lat: 39.13,
            lng: -121.63,
            zoom: 11,
            minZoom: 10,
            maxZoom: 13,

            // Set the bounds on the map to restrict user to where tiles are
            northEastBound: [39.96177683325811, -120.29188071495460],
            southWestBound: [37.83012627959109, -122.98198300864898],

            // Setup the default values to display popup window on map
            predictionList: [<tr key='waiting'><p>Waiting for the API to load...</p></tr>],
            popupPosition: [39.13, -121.63]

        }
    }


    // Workhorse function for handling the event of clicking on a created polygon on the map
    onCreated(e) {
        let type = e.layerType;
        let layer = e.layer;
        let _that = this;

        // Run operation only if the polygon created is of type 'rectangle'
        if (type === 'rectangle') {

            // Make call to REST API on click
            layer.on('click', function(){
                let _thisThat = _that;

                // Get the center point of the rectangle
               let latLngCoords = layer.getCenter();
               let coordsPayload = {
                    "lat1": latLngCoords['lat'],
                    "lng1": latLngCoords['lng']
               };

               // make fetch POST call to the REST API with the lat, lng data
                fetch('https://earth-classification-api.herokuapp.com/predict', {
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify(coordsPayload)
                }).then(resp => {
                    if(!resp.ok){
                        if(resp.status >= 400 && resp.status < 500){
                            return resp.json().then(data => {
                                let err = {errorMessage: data.message};
                                throw err;
                            })
                        } else{
                            let err = {errorMessage: 'Please try again later, server is not responding...'}
                            throw err;
                        }
                    }
                    return resp.json();
                }).then(response => {
                        // Receive the predictions
                        let predictions = response['predictions'];

                        // Setup a sorting function to sort by probability
                        function compareProbability(a,b) {
                            if (a.probability < b.probability)
                                return -1;
                            if (a.probability > b.probability)
                                return 1;
                            return 0;
                        }
                        // Reverse to descending order
                        predictions.sort(compareProbability).reverse();

                        // Set the data to be rendered in a table format
                         let predictionList = predictions.map((pred) => {
                            return(
                                <tr key={pred.label}>
                                    <td>{pred.label}</td>
                                    <td>{pred.probability.toFixed(2)}</td>
                                </tr>
                            )
                         });

                         // Set the state
                         _thisThat.setState({predictionList: predictionList});

                    });
            });
        }
        else {
            console.log("Try using a Rectangle instead...", type, e);
        }
    }

    // Handle deletion of polygons
    _onDeleted = (e) => {
        let numDeleted = 0;
        e.layers.eachLayer( (layer) => {
            numDeleted += 1;
        });
        console.log(`onDeleted: removed ${numDeleted} layers`, e);
    };

    // Make call to Render the map
    render() {
        const position = [this.state.lat, this.state.lng];
        const bounds = [this.state.northEastBound, this.state.southWestBound];
        return (
            <div className='map-container'>
                {/*Map element*/}
                <Map
                    center={position}
                    zoom={this.state.zoom}
                    maxBounds={bounds}
                    maxZoom={this.state.maxZoom}
                    minZoom={this.state.minZoom}>
                    <TileLayer
                        attribution="<a href=http://www.esri.com/>Esri</a>"
                        url="http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />

                    {/*FeatureGroup for polygons created by the selection tool*/}
                    <FeatureGroup>
                        <EditControl
                            position='topleft'
                            onCreated={this.onCreated.bind(this)}
                            onDeleted={this._onDeleted}
                            draw={{
                                polygon: false,
                                marker: false,
                                circle: false,
                                polyline: false,
                                circlemarker: false
                            }}/>

                        {/*Popup to display the prediction results on the polygon*/}
                        <Popup position={this.state.popupPosition}>
                            <table>
                                <tbody>
                                    {this.state.predictionList}
                                </tbody>
                            </table>
                        </Popup>

                    </FeatureGroup>
                </Map>
            </div>

        )
    }
}


export default SatelliteMap;
