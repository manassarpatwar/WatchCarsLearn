# WatchCarsLearn

![watchcarslearn](https://user-images.githubusercontent.com/44678221/94596413-ba1b1e00-02a9-11eb-9a9d-64319faf0a46.gif)

## The Car
![car](https://user-images.githubusercontent.com/44678221/94605421-b93cb900-02b6-11eb-96d0-fffc29b1a7a2.png)
- Each car has 5 distance sensors which serve as inputs to its brain (neural network)
- Each sensor has a max length and the input passed to the network is a normalized value of the sensor input (length/maxLength)
- The brain of the car outputs 2 values, both between 0 and 1
- The first value controls the throttle and brake of the car. If the value is greater than 0.66, the car accelerates else if it is less than 0.33, it brakes.
- The second value controls the steering of the car. If the value is greater than 0.66, the car steers right, else if it is less than 0.33, it steers left.
- The physics of the car is inspired by [spacejack's implementation](https://github.com/spacejack/carphysics2d) of [Marco Monster's Car Physics for games paper](https://asawicki.info/Mirror/Car%20Physics%20for%20Games/Car%20Physics%20for%20Games.html)

## The Track
![track](https://user-images.githubusercontent.com/44678221/94599720-7e368780-02ae-11eb-85f3-9d9e0868734a.png)

### Procedural Generation
- I followed the steps outlined in a [Procedural Race Track Generation algorithm](https://i-hudson.github.io/projects/2019-02-02-Race-track-Generator/) implemented as a tool in Unity by [Ian Hudson](https://i-hudson.github.io/)
- I used [voronoi.js](https://github.com/gorhill/Javascript-Voronoi) for creating the voronoi diagram

### Bezies, Beziers, Beziers!
- I used [bezier.js](https://github.com/Pomax/bezierjs) for working with beziers
- The track is made up of a lot of bezier curves
- There exists a hidden path of bezier curves that runs through the middle of the track. I use this path to calculate score of each car, and check whether the car is on the track or it has crashed

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