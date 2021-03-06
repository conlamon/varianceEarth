# Variance Earth

## Basic Overview

A React and Leaflet.js based UI that allows the user to select an area on a satellite image base map, then
click on this selection and receive a classification. The classification is performed by a Convolutional
Neural Network (CNN) running on a [Python and Flask based REST API](https://github.com/conlamon/satellite-classification-flask-api).


![Site](https://github.com/conlamon/varianceEarth/blob/master/media/variancearth.png)


## How It Works

When the user clicks on an area selected on the map, a POST request, containing the center latitude/longitude coordinate
for the area selected, is sent to the REST API. The API then searches a PostgreSQL database for the file location of a satellite image tile
containing the selected area. This image is then processed, in real time, through a Keras/TensorFlow ResNet50
model. This model makes a multilabel classification over 17 different labels returning a score between 0 and 1 for each label.
The resultant scores are filtered based on a cutoff value, and then returned as JSON to the front-end.

## Data

The model was trained using the public [dataset](https://www.kaggle.com/c/planet-understanding-the-amazon-from-space/data)
from [Planet](https://api.planet.com.) that was part of their Kaggle competition in 2017.
This dataset consisted of ~42,000 image tiles of the amazon rainforest, all labeled.
The main labels that appear in the current implementation are defined as the following:

| Label       | Description
| :-------------: |-------------|
| No Clouds    | No clouds in the image |
| Primary      | A segment of dense tree cover |
| Habitation | Any human homes or buildings |
| Agriculture | Any area of agriculture |
| Road | Any road within the image |
| Water | River or Lake |

There are many more labels which can be found [here](https://www.kaggle.com/c/planet-understanding-the-amazon-from-space/data).

## Model Choice

A [ResNet architecture](https://arxiv.org/abs/1512.03385) was chosen for the CNN due to it's
fast inference time, good accuracy and smaller model size. See this [paper](https://arxiv.org/pdf/1605.07678.pdf)
for a comparison on all of these traits for the most common CNN architectures.
