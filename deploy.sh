echo "Are you sure? y/n"

read ANSWER

if [ "$ANSWER" = "y" ]; then
  echo "Running tests... 🧪"
  TEST_RESULT=$(bundle exec rspec | grep "0 failures")
  FAILURE_NUMBER=${#VAR}
  echo "Failed ${FAILURE_NUMBER} test(s)"
  if [ "$FAILURE_NUMBER" = "2" ]; then
    echo "Building Assets 🔨"
    RAILS_ENV=production bundle exec rake assets:precompile
    echo "Pushing to git 🕺 "
    git add .
    git commit -m "Deploy $(date)"
    git push origin master
    git push heroku master
  fi
fi
