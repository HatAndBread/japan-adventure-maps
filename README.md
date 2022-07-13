# Japan Adventure Maps

Source code for the [Japan Adventure Maps](https://japan-adventure-maps.com) website.
Japan Adventure Maps is application for building and sharing maps of hiking trails and cycling routes in Japan.
<img width="250" alt="map2" src="https://user-images.githubusercontent.com/61222965/178621293-13de5d2d-4106-496c-8172-97ca84d35aa5.png">

# Technologies 💻
* Rails
* React
* TypeScript
* MapboxGL

# Setup

Prerequisites: Make sure you have Ruby 3.1.2, Postgresql, Yarn and Node installed on your machine.

```bash
rails db:create
rails db:migrate
```

Start the Dev server
```
make start-dev
```

## Environment variables

We use a .env file to store application secrets. Contact me directly for a copy of this and put it in the root directory.

# Todo

* Need someone with an eye for design to make it look pretty 💅
* Different kinds of activities (trail running, skiing, mountain biking etc)
* Organize group rides, runs, hikes
* Integration with Strava, RideWithGPS?
* Improve SEO
* Removal of dead code
* Improve test coverage (using rspec in the spec folder. The test folder can be removed)
* WebGL memory leak with Webkit
