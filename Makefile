start-dev:
		@echo "Starting Rails 🚂" && rake assets:clobber && bin/dev

start-dev-https:
		@echo "Starting Rails 🚂" && rake assets:clobber && rails s -b 'ssl://localhost:3000?key=localhost.key&cert=localhost.crt'

seed: 
		@echo "starting seed" && rails db:seed

deploy:
		@echo "Building Assets 🔨" && RAILS_ENV=production bundle exec rake assets:precompile && echo "Pushing to git 🕺 " && git add . && git commit -m "New Deploy" && git push origin master && echo "Deploying to Heroku🚀" && git push heroku master
