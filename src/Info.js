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
                    <li>Hows it work? <a href={'https://github.com/conlamon/varianceEarth'}> See GitHub</a> </li>
                    <li>What are the labels? See 5.</li>
                    <li>Unconvinced? Scroll left to the <br/>large lake are and try classifying it! Also, see 5.</li>
                </ol>
                <p>
                    Note: The class 'clear' means <br/>
                    there are no clouds in the image.
                </p>
            </div>
        )
    }

}

export default Info;