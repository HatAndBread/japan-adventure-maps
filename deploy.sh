echo "Are you sure? y/n"

read ANSWER

if [ "$ANSWER" = "y" ]; then
  echo "Building Assets 🔨"
  RAILS_ENV=production bundle exec rake assets:precompile
  echo "Pushing to git 🕺 "
  git add .
  git commit -m "New Deploy"
  git push origin master
  git push heroku master
fi
