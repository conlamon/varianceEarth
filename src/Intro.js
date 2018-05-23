import React, {Component} from 'react';
import './Intro.css';

class Intro extends Component{
    render(){
        return (
            <div className="intro-div">
                <p>
                This is a proof of concept site that uses a convolutional neural network
                based deep learning model to classify satellite images in real time
                </p>
            </div>
        )
    }
}

export default Intro;