# Self-driving-AI

Cars learn to drive around user drawn track by [Neuroevolution of Augmenting Topologies](https://en.wikipedia.org/wiki/Neuroevolution_of_augmenting_topologies) (NEAT)

I tried to implement NEAT from the [original paper](http://nn.cs.utexas.edu/downloads/papers/stanley.ec02.pdf) but then I had to debug using a really great NEAT implementation by [Code Bullet](https://github.com/Code-Bullet/NEAT-Template-JavaScript) especially speciation and the overall natural selection process.

The user input mechanic for the cars directly taken from a fun and great implementation of a 2d car by [Juha Lindstedt](https://github.com/pakastin/car). 

The physics are loosely based on the excellent [car physics explanation](https://asawicki.info/Mirror/Car%20Physics%20for%20Games/Car%20Physics%20for%20Games.html) by Marco Monster.

The steering and return to steering are directly taken from the javascript implementation of the above car physics paper by [spacejack](https://github.com/spacejack/carphysics2d)


[Check It Out!](https://manassarpatwar.github.io/Self-driving-AI/)

Used HTML5 Canvas and Javascript

Instructions:
* Press (?) for tutorial.
* Draw a track of any shape using the drawTrack button (pencil icon), example track below.

![Sample track](https://user-images.githubusercontent.com/44678221/78273971-26041000-752d-11ea-9071-d794c5fa8df5.png)

## Neural network visualisation
The changes in the "brain" of the best car, or its Neural Network are shown in the bottom right corner of the screen.
The green color and red color represents enabled and disabled connections.

### The inputs:
The distance measured by the sensors + bias

### The outputs:
Power: If output < 0.33 -> reverse, output > 0.66 -> accelerate else do nothing  
Steer: If output < 0.33 -> turn left, output > 0.66 -> turn right else do nothing

## NEAT
Cars initially are thrown into the track and see how they perform. Each car thinks differently due to random initialization and mutations. Each mutation, especially mutating a hidden node or a connection will decrease the fitness of the car. But over generations it will have enough time to optimize its weights.

After each generation, cars are divided into species. The champions of the species are the best performing players within the species. The speciation criteria is how similar the topology of the networks are, and how similarly did they mutate over generations. Then 50% of the population within each species, and those species who have not improved within 15 generations are culled. The champions of each species are chosen without mutation for the next generation. Then each species is assigned a specific number of offsprings calculated from how well the species overall performed. The mutated offsprings are then chosen for the next generation.
