# Japan Adventure Maps

Source code for the [Japan Adventure Maps](https://japan-adventure-maps.com) website.
Japan Adventure Maps is application for building and sharing maps of hiking trails and cycling routes in Japan.

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
* Come up with a better build procedure. Currentlty building directly to the build folder and hosting that on Heroku. Hence the huge amount of js files.
* Improve SEO
* Removal of dead code
* Improve test coverage (using rspec in the spec folder. The test folder can be removed)
* WebGL memory leak with Webkit
