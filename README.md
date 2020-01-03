# Self-driving-AI

Cars learn to drive around user drawn track by [Neuroevolution of Augmenting Topologies](https://en.wikipedia.org/wiki/Neuroevolution_of_augmenting_topologies) (NEAT)

[Check It Out!](https://manassarpatwar.github.io/Self-driving-AI/)

Used HTML5 Canvas and Javascript

Instructions:
* Press (?) for the description of icons
* Draw a track of any shape using the drawTrack button (pencil icon), example track below.

![Sample track](https://user-images.githubusercontent.com/44678221/71742869-f7599900-2e5a-11ea-961b-633a9f521800.png)

* Run the cars by pressing the play button
* Note: A car that is stuck in a loop is considered a good car as the fitness of each car is just the time it is alive.
  To avoid this draw the track with a smaller width. If cars get stuck press next gen (>>) button
* Tweak parameters, such as number of cars, number of sensors, turn type and Enjoy!

## Neural network visualisation
The changes in the "brain" of the best car, or its Neural Network are shown in the bottom right corner of the screen.
The green color and red color represents positive and negative change in weight over the previous best car respectively.

### The inputs:
The distance measured by the sensors

### The outputs:
Turn Left, turn Right or (nothing/return to center steering)

## Learning
Cars learn using mutations of best car's neural network

## NEAT
All cars use a fixed topology neural network. The cars cannot mutate new nodes and connections. The genetic algorithm does not implement crossover of two parents. It simple makes a clone of the brain of the best car.
