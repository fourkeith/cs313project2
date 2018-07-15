#! /bin/bash
git add *
git status
git commit -m "new changes"
git push heroku master
git push origin master
