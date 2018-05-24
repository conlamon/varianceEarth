import React, {Component} from 'react';
import { Map, TileLayer, FeatureGroup, Popup} from 'react-leaflet';
import Control from 'react-leaflet-control';
import { EditControl } from 'react-leaflet-draw';
import './SatelliteMap.css';


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
            predictionList: [<tr key='waiting'><p>Waiting for the API to load.<br/>
                                                This may take up to 60 seconds due to the free Heroku Dyno shutting down :(,
                                                Once, active, inference time is in the 100s ms range</p></tr>],
            popupPosition: [parseFloat(process.env.REACT_APP_STARTING_LATITUDE),
                            parseFloat(process.env.REACT_APP_STARTING_LONGITUDE)]

        }
    }


    componentWillMount() {

        // Pre-load the API on opening of this site (since the API goes to sleep with free hosting)
        let coordsPayload = {
            "lat1": this.state.popupPosition[0],
            "lng1": this.state.popupPosition[1]
        };
        fetch(process.env.REACT_APP_API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(coordsPayload)
        }).then(resp => {
            if (!resp.ok) {
                if (resp.status >= 400 && resp.status < 500) {
                    return resp.json().then(data => {
                        let err = {errorMessage: data.message};
                        throw err;
                    })
                } else {
                    let err = {errorMessage: 'Please try again later, server is not responding...'}
                    throw err;
                }
            }
            return resp.json();
        })
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
                        attribution="Imagery Courtesy USGS/NASA Landsat, <a href=http://www.esri.com/>Esri</a> and
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
                                    <tr><td>Class:</td><td>Score:</td></tr>
                                    {this.state.predictionList}
                                </tbody>
                            </table>
                        </Popup>
                    </FeatureGroup>

                    <Control position="topright">
                        <div className={'info-div'}>
                            <p id={'info-header'} >
                                <strong>Classify images of Earth in real-time! </strong>
                                <br/>Thanks to Convolutional Neural Networks.
                            </p>
                            <p id={'info-body'}>
                                <ol>
                                    <li>Press the black square on the left side-bar</li>
                                    <li>Draw a small rectangle on the map</li>
                                    <li>Click on the drawn rectangle</li>
                                    <li>Wait for classifications</li>
                                    <li>Hows it work? <a href={'https://github.com/conlamon/varianceEarth'}>GitHub</a> </li>
                                    <li>What are the labels? See 5.</li>
                                    <li>Unconvinced? Scroll left to the <br/>large lake and try classifying it! Also, see 5.</li>
                                </ol>

                            </p>
                        </div>
                    </Control>
                    <Control position="topright" >
                        <div className={'info-div'}>
                            <p>
                                Note: The class 'clear' means <br/>
                                there are no clouds in the image.
                            </p>
                        </div>
                    </Control>
                </Map>

        )
    }
}


export default SatelliteMap;
