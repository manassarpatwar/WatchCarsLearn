# Self-driving-AI

Cars learn to drive around user drawn track by [Neuroevolution of Augmenting Topologies](https://en.wikipedia.org/wiki/Neuroevolution_of_augmenting_topologies) (NEAT)

[Check It Out!](https://manassarpatwar.github.io/Self-driving-AI/)

Used HTML5 Canvas and Javascript

Instructions:
* Press (?) for the description of icons
* Draw a track of any shape using the drawTrack button (pencil icon), example track below.

![Sample track](https://user-images.githubusercontent.com/44678221/71773884-117ba000-2f5d-11ea-929d-5d46a0dcd7be.png)

* The track is self enclosing, i.e. the track closes itself when you double click to stop drawing.
* Run the cars by pressing the play button
* Tweak parameters, such as number of cars, number of sensors, turn type and Enjoy!
* If the cars fail to learn a track try tweaking the parameters, or it may simply be the case that the track has very sharp turns.

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
All cars use a fixed topology neural network. The cars cannot mutate new nodes and connections. The genetic algorithm implements crossover of two parents, which produce all the new offsprings for the next generation.
