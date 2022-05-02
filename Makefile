start-dev:
		@echo "Starting Rails 🚂" && rake assets:clobber && bin/dev

start-dev-https:
		@echo "Starting Rails 🚂" && rake assets:clobber && rails s -b 'ssl://localhost:3000?key=localhost.key&cert=localhost.crt'

seed: 
		@echo "starting seed" && rails db:seed
