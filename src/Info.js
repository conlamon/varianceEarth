import React, {Component} from 'react';


class Info extends Component{
    render(){
        return (
            <div className={'info-div'}>
                <strong>Classify images of Earth in real-time! </strong>
                <br/>Thanks to Convolutional Neural Networks.
                <ol>
                    <li>Press the black square on the left side-bar</li>
                    <li>Draw a rectangle on the map</li>
                    <li>Click on the drawn rectangle</li>
                    <li>Wait for classifications</li>
                    <li>
                        Hows it work? <br/>
                        <a href={'https://github.com/conlamon/varianceEarth'}> GitHub (Frontend)</a> <br/>
                        <a href={'https://github.com/conlamon/satellite-classification-flask-api'}> GitHub (Backend)</a>
                    </li>
                    <li>What are the labels? See 5.</li>
                    <li>Try exploring areas like the<br/>large lake to the left!</li>
                </ol>
            </div>
        )
    }

}

export default Info;