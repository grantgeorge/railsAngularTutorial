Prerequisites:

- RVM / A Stable Ruby Version
- Yeoman, Gulp, Bower

Install the rails-api gem

    gem install rails-api

Generate a new Rails::API app

    rails-api new railsAngular --database=postgresql

change into the new directory

    cd railsAngular

    bundle install

# Create a scaffolded resource and test API

    bin/rails g scaffold articles title:string body:text

    rake db:create

    rake db:migrate

    rails s

    echo "Article.create(title: 'Test Article', body: 'A test article. Cool!')" >> db/seeds.rb

    rake db:seed

    http://localhost:3000/articles


# Testing

    rake db:setup RAILS_ENV=test

    bin/rake test

# Deploy to Heroku

https://devcenter.heroku.com/articles/getting-started-with-rails4

    echo "gem 'rails_12factor', group: :production" >> Gemfile

    bundle install

    git init

    git add .

    git commit -m "init"

    git status

    heroku create

    git config --list | grep heroku

    git push heroku master
