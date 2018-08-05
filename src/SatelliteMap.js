import React, {Component} from 'react';
import { Map, TileLayer, FeatureGroup, Popup} from 'react-leaflet';
import Control from 'react-leaflet-control';
import { EditControl } from 'react-leaflet-draw';
import './SatelliteMap.css';
import LoadingAnimation from './LoadingAnimation';
import Info from './Info';
import EmptyDiv from "./EmptyDiv";

class SatelliteMap extends Component {
    constructor() {
        super();
        this.state = {
            markers: [],
            // Set the map starting point by Lat, Lng and Zoom
            lat: parseFloat(process.env.REACT_APP_STARTING_LATITUDE),
            lng: parseFloat(process.env.REACT_APP_STARTING_LONGITUDE),
            zoom: parseInt(process.env.REACT_APP_STARTING_ZOOM, 10),
            minZoom: parseInt(process.env.REACT_APP_MIN_ZOOM, 10),
            maxZoom: parseInt(process.env.REACT_APP_MAX_ZOOM, 10),

            // Set the bounds on the map to restrict user to where tiles are
            northEastBound: [parseFloat(process.env.REACT_APP_NE_BOUND_LAT),
                             parseFloat(process.env.REACT_APP_NE_BOUND_LNG)],
            southWestBound: [parseFloat(process.env.REACT_APP_SW_BOUND_LAT),
                             parseFloat(process.env.REACT_APP_SW_BOUND_LON)],

            // Setup the default values to display popup window on map
            predictionList: [LoadingAnimation()],
            popupPosition: [parseFloat(process.env.REACT_APP_STARTING_LATITUDE),
                            parseFloat(process.env.REACT_APP_STARTING_LONGITUDE)],

            // Setup Info Box
            showInfo: true
        };

        this.handleToggleInfo = this.handleToggleInfo.bind(this)
    }


    handleToggleInfo() {
        this.setState(prevState => ({
            showInfo: !prevState.showInfo
        }));
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

               // Reset the prediction data list to be the loading animation
                _that.setState({predictionList: LoadingAnimation()});

               // make fetch POST call to the REST API with the lat, lng data
                fetch(process.env.REACT_APP_API_URL, {
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
                         // Add a header column to the table
                         predictionList.unshift(<tr key={'header'}> <td>What is in the image?</td> <td>How confident? (0-1)</td></tr>);
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
                <Map
                    center={position}
                    zoom={this.state.zoom}
                    maxBounds={bounds}
                    maxZoom={this.state.maxZoom}
                    minZoom={this.state.minZoom}>
                    <TileLayer
                        attribution="Imagery Courtesy USGS/NASA Landsat, <a href=http://www.esri.com/>Esri</a> and \
                        <a href=https://www.kaggle.com/c/planet-understanding-the-amazon-from-space/data/>Planet</a>"
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
                        <Popup position={this.state.popupPosition} className={'popup-container'}>
                            <table>
                                <tbody>
                                    {this.state.predictionList}
                                </tbody>
                            </table>
                        </Popup>
                    </FeatureGroup>

                    <Control position="topright" >
                        <div onClick={this.handleToggleInfo}>
                            {this.state.showInfo ? <Info/> : <EmptyDiv/>}
                        </div>
                    </Control>
                </Map>

        )
    }
}


export default SatelliteMap;
