# WatchCarsLearn

![watchcarslearn](https://user-images.githubusercontent.com/44678221/94646304-9b4d7380-030b-11eb-8b04-d903539a0d33.gif)

Watch cars learn right in your browser! https://manassarpatwar.github.io/WatchCarsLearn/

## The Car
![car](https://user-images.githubusercontent.com/44678221/94646404-cfc12f80-030b-11eb-87f8-dd9b5f703201.png)
- Each car has 5 distance sensors which serve as inputs to its brain (neural network)
- Each sensor has a max length and the input passed to the network is a normalized value of the sensor input (length/maxLength)
- The brain of the car outputs 2 values, both between 0 and 1
- The first value controls the throttle and brake of the car. If the value is greater than 0.66, the car accelerates else if it is less than 0.33, it brakes.
- The second value controls the steering of the car. If the value is greater than 0.66, the car steers right, else if it is less than 0.33, it steers left.
- The physics of the car is inspired by [spacejack's implementation](https://github.com/spacejack/carphysics2d) of [Marco Monster's Car Physics for games paper](https://asawicki.info/Mirror/Car%20Physics%20for%20Games/Car%20Physics%20for%20Games.html)

## The Track
![track](https://user-images.githubusercontent.com/44678221/94647465-1f085f80-030e-11eb-9ca5-3e74b03acfa1.png)

### Procedural Track Generation
- I followed the steps outlined in a [Procedural Race Track Generation algorithm](https://i-hudson.github.io/projects/2019-02-02-Race-track-Generator/) implemented as a tool in Unity by [Ian Hudson](https://i-hudson.github.io/)
- I used [voronoi.js](https://github.com/gorhill/Javascript-Voronoi) for creating the voronoi diagram

### Beziers, Beziers, Beziers!
- I used [bezier.js](https://github.com/Pomax/bezierjs) for working with beziers
- The track is made up of a lot of bezier curves
- There exists a hidden path of bezier curves that runs through the middle of the track. I use this path to calculate score of each car, and check whether the car is on the track or it has crashed
- The input sensor length is measured on every physics step. It is measured by calculating the intersection point between the sensor line and a nearest bezier curve

### Editing and randomizing
- The track is completely editable and randomizable on the fly
- The simulation is paused while the user is editing otherwise the window will freeze up
- To Edit, simply click on the pencil icon and drag any of the control points

## Neural Network
![network](https://user-images.githubusercontent.com/44678221/94598363-770e7a00-02ac-11eb-94e6-cef827b81b1a.png)

### Activation
- The network is a feed forward neural network and stops any recurrent connections from being mutated
- The network is activated using a list of nodes [sorted topologically](https://en.wikipedia.org/wiki/Topological_sorting)(Kahn's algorithm)

### Nodes
- Brightness of each node is the output of that node when activated

### Connections
- Connections which are green have a positive weight
- Connections which are blue have a negative weight
- Connections which are red are disabled

## Neuro Evolution of Augmenting Topologies (NEAT)
- I created my own NEAT implementation in JS
- [Alenaksu's implementation of NEAT](https://github.com/alenaksu/neatjs) in typescript helped me a lot in debugging my own
- [Kenneth O. Stanley's original NEAT paper](http://nn.cs.utexas.edu/downloads/papers/stanley.ec02.pdf)

## Icons
### All icons were created in p5.js web editor by me
#### Pencil
![pencil_black](https://user-images.githubusercontent.com/44678221/94646741-87eed800-030c-11eb-80d1-e7d4698b10de.png)  
[p5.js editor sketch for pencil](https://editor.p5js.org/Ringsofthekings/sketches/No4lk6J0T)

#### Randomize
![random_black ](https://user-images.githubusercontent.com/44678221/94646837-c5ebfc00-030c-11eb-8b93-1cdb6d0e6a81.png)  
[p5.js editor sketch for randomize](https://editor.p5js.org/Ringsofthekings/sketches/95C2SVNpU)

#### Steering wheel
![steering_black](https://user-images.githubusercontent.com/44678221/94646872-ddc38000-030c-11eb-9aed-d32beff7ee66.png)  
[p5.js editor sketch for steering wheel](https://editor.p5js.org/Ringsofthekings/sketches/yXrZ3m0ng) 

## License
[MIT](https://opensource.org/licenses/MIT)  
Copyright (c) 2020-present [Manas Sarpatwar](https://github.com/manassarpatwar)
