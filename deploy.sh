echo "Are you sure? y/n"

read ANSWER

if [ "$ANSWER" = "y" ]; then
  echo "Running tests... 🧪"
  TEST_RESULT=$(bundle exec rspec | grep "0 failures")
  FAILURE_NUMBER=${#VAR}
  echo $FAILURE_NUMBER
  if $FAILURE_NUMBER -ne 2; then
    exit
  fi
  echo "Building Assets 🔨"
  RAILS_ENV=production bundle exec rake assets:precompile
  echo "Pushing to git 🕺 "
  git add .
  git commit -m "Deploy $(date)"
  git push origin master
  git push heroku master
fi
