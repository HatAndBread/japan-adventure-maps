echo "Are you sure? y/n"

read ANSWER

if [ "$ANSWER" = "y" ]; then
  echo "Running tests... ๐งช"
  TEST_RESULT=$(bundle exec rspec | grep "0 failures")
  FAILURE_NUMBER=${#VAR}
  echo "Failed ${FAILURE_NUMBER} test(s)"
  if [ "$FAILURE_NUMBER" = "0" ]; then
    echo "Building Assets ๐จ"
    RAILS_ENV=production bundle exec rake assets:precompile
    echo "Pushing to git ๐บ "
    git add .
    git commit -m "Deploy $(date)"
    git push origin master
    git push heroku master
  fi
fi
