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

# API Scope and Namespace

Update routes to use a scope of /api and a namespace of V1

```
scope '/api' do
  namespace :v1, defaults: { format: :json } do

    resources :articles, except: [:new, :edit]

  end
end
```

    mkdir app/controllers/v1

    mv app/controllers/articles_controller.rb app/controllers/v1/articles_controller.rb

In app/controllers/v1/articles_controller.rb, change the first line where its says:

    ArticlesController

to:

    class V1::ArticlesController

## Setup Database

    echo "Article.create(title: 'Test Article', body: 'A test article. Cool!')" >> db/seeds.rb

    rake db:create

    rake db:migrate

    rake db:seed

# Test the scaffoled resource and routing

    rails s

    http://localhost:3000/articles

You should see nice JSON output of your Articles

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

    heroku run rake db:migrate && rake db:seed

    heroku open

    https://fast-forest-6196.herokuapp.com/articles
