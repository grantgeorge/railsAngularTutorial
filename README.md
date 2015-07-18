# Angular, Rails, Gulp, Heroku

This guide is inteded to demonstrate how you can deploy an Angular SPA app
with a Ruby on Rails JSON API backend to Heroku. It uses Gulp as a client-side
builder but this can easily be swapped out with Grunt.

## Prerequisites

- RVM / A Stable Ruby Version
- Yeoman, Gulp, Bower (npm install -g yo gulp bower)

Install the rails-api gem

    gem install rails-api

Generate a new Rails::API app

    rails-api new railsAngular --database=postgresql

change into the new directory

    cd railsAngular

    bundle install

## Create a scaffolded resource and test API

    bin/rails g scaffold articles title:string body:text

## API Scope and Namespace

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

## Test the scaffoled resource and routing

    rails s

    http://localhost:3000/articles

You should see nice JSON output of your Articles

## Testing

    rake db:setup RAILS_ENV=test

    bin/rake test

## Deploy to Heroku

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

    https://fast-forest-6196.herokuapp.com/api/v1/articles

## Create Angular App

    npm install -g generator-gulp-angular

    mkdir client && cd $_

    yo gulp-angular railsAngular

I select all the default options except I configure SASS to use the Ruby version.
This is all just a matter of personal preference.

? Which version of Angular do you want? 1.4.0 (stable)
? Which Angular's modules would you want to have? (ngRoute and ngResource wil? Which Angular's modules would you want to have? (ngRoute and ngResource will be addressed after) angular-animate.js (enable animation features), angular-cookies.js (handle cookie management), angular-touch.js (for mobile development), angular-sanitize.js (to securely parse and manipulate HTML)
? Would you need jQuery or perhaps Zepto? jQuery 2.x (new version, lighter, IE9+)
? Would you like to use a REST resource library? ngResource, the official support for RESTful services
? Would you like to use a router ? UI Router, flexible routing with nested views
? Which UI framework do you want? (Use arrow keys)
❯ Bootstrap, the most popular HTML, CSS, and JS framework
? Which UI framework do you want? Bootstrap, the most popular HTML, CSS, and JS framework
? How do you want to implements your Bootstrap components? (Use arrow keys)
? How do you want to implements your Bootstrap components? Angular UI Bootstrap, Bootstrap components written in pure AngularJS by the AngularUI Team
? Which CSS preprocessor do you want? (Use arrow keys)
❯ Sass (Node), Node.js binding to libsass, the C version of the popular style? Which CSS preprocessor do you want?
  Sass (Node), Node.js binding to libsass, the C version of the popular style? Which CSS preprocessor do you want?
  Sass (Node), Node.js binding to libsass, the C version of the popular style? Which CSS preprocessor do you want?
  Sass (Node), Node.js binding to libsass, the C version of the popular style? Which CSS preprocessor do you want?
  Sass (Node), Node.js binding to libsass, the C version of the popular style? Which CSS preprocessor do you want? None, only the good old CSS
? Which JS preprocessor do you want? (Use arrow keys)
❯ None, I like to code in standard JavaScript.
  ES6 (Babel formerly 6to5), ECMAScript 6 compiled with Babel which requires ? Which JS preprocessor do you want? None, I like to code in standard JavaScript.
? Which html template engine would you want? None, I like to code in standard HTML.

## Update the gulpfile to build to public directory in root of project source

Edit the gulpfile conf file at client/gulp/conf.js

change

```
exports.paths = {
  src: 'src',
  dist: 'dist',
  tmp: '.tmp',
  e2e: 'e2e'
};
```

to:

```
exports.paths = {
  src: 'src',
  dist: '../public',
  tmp: '.tmp',
  e2e: 'e2e'
};
```

Set the force option to true for the clean task in gulp/build.js:

```
gulp.task('clean', function (done) {
  $.del([path.join(conf.paths.dist, '/'), path.join(conf.paths.tmp, '/')], { force: true }, done);
});
```

    gulp build

    http://localhost:3000/#/

You should see the built version of the angular app.

## Configure local dev environment

For the local dev environment, I follow this tutorial:

http://www.angularonrails.com/how-to-wire-up-ruby-on-rails-and-angularjs-as-a-single-page-application-gulp-version/

edit client/gulp/server.js

Add:

var exec = require('child_process').exec;

to load this dependency.

Change this block

```
var server = {
  baseDir: baseDir,
  routes: routes,
};

/*
 * You can add a proxy to your backend by uncommenting the line bellow.
 * You just have to configure a context which will we redirected and the target url.
 * Example: $http.get('/users') requests will be automatically proxified.
 *
 * For more details and option, https://github.com/chimurai/http-proxy-middleware/blob/v0.0.5/README.md
 */
// server.middleware = proxyMiddleware('/users', {target: 'http://jsonplaceholder.typicode.com', proxyHost: 'jsonplaceholder.typicode.com'});

browserSync.instance = browserSync.init({
  startPath: '/',
  server: server,
  browser: browser
});
```

to

```
var server = {
  baseDir: baseDir,
  routes: routes,
  middleware: [
    proxyMiddleware('/api', { target: 'http://localhost:3000' })
  ]
};

/*
 * You can add a proxy to your backend by uncommenting the line bellow.
 * You just have to configure a context which will we redirected and the target url.
 * Example: $http.get('/users') requests will be automatically proxified.
 *
 * For more details and option, https://github.com/chimurai/http-proxy-middleware/blob/v0.0.5/README.md
 */
// server.middleware = proxyMiddleware('/users', {target: 'http://jsonplaceholder.typicode.com', proxyHost: 'jsonplaceholder.typicode.com'});

browserSync.instance = browserSync.init({
  port: 9000,
  startPath: '/',
  server: server,
  browser: browser
});
```

Add 2 tasks at the end of the file:

```
gulp.task('rails', function() {
  exec("../bin/rails s");
});

gulp.task('serve:full-stack', ['rails', 'serve']);
```

    npm install --save-dev http-proxy-middleware

Run:

    gulp serve:full-stack

1. The front-end server should come up on port 9000 instead of 3000.
2. If you navigate to http://localhost:9000/api/v1/articles, you should see a
response from the API.
3. Rails is running on port 3000.

## Acessing API from Client

Edit app/src/index.route.js and add an 'articles' state:

```
.state('articles', {
  url: '/articles',
  templateUrl: 'app/components/articles/articles.html',
  controller: 'ArticlesController'
});
```

mkdir src/app/components/article

touch src/app/components/articles/articles.factory.js

```
'use strict';

angular.module('angularRails')
  .factory('Articles', function ($resource) {
    return $resource('api/v1/articles/:articleId', {
      articleId: '@id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  });

```

touch src/app/components/articles/articles.html

```
<div class="container">

  <div>
    <acme-navbar creationDate="main.creationDate" />
  </div>

  <h1>Articles</h1>

  <div ng-repeat="article in articles">
    <h2>{{ article.title }}</h2>
    <p>{{ article.body }}</p>
  </div>

</div>

```

touch src/app/components/articles/articles.controller.js

```
angular.module('angularRails')
  .controller('ArticlesController', function ($scope, Articles) {

    Articles.query(function (res) {
      $scope.articles = res;
    });

  });
```

## Building the client app when deploying to Heroku

[Heroku Docs](https://devcenter.heroku.com/articles/using-multiple-buildpacks-for-an-app)

Add the ruby and node heroku buildpacks:

```
heroku buildpacks:set https://github.com/heroku/heroku-buildpack-ruby
heroku buildpacks:add --index 1 https://github.com/heroku/heroku-buildpack-nodejs
```

Verify (order matters)

```
$ heroku buildpacks
➜  railsAngular git:(master) heroku buildpacks
=== angular-rails-gulp-tutorial Buildpack URLs
1. https://github.com/heroku/heroku-buildpack-nodejs
2. https://github.com/heroku/heroku-buildpack-ruby
```

Set the node environment to production.

    heroku config:set NODE_ENV=production

Create a Procfile in root of project to run the WEBrick webserver

    bin/rails s

Deploy!

    git add -A

    git commit -m "testing deploy"

    git push heroku

Verify:

    heroku open

Navigate to articles page:

    https://angular-rails-gulp-tutorial.herokuapp.com/#/articles

Debrugging:

    heroku logs

    heroku addons:create papertrail

    heroku addons:open papertrail
