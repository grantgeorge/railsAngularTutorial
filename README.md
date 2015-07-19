The purpose of this guide is to teach how to create an Angular app that uses a Rails::API Backend. We'll build the client-side app using Gulp and deploy to Heroku with the source all contained in the same repository. This is a great stack that utilizes the robustness of Rails as a JSON API and the agility of Angular as a client-side application.

I've grown very fond of using Rails as a single-purpose JSON API for it's great authentication (devise) and testing capability (RSpec, Capybara). Angular is great at consuming RESTful APIs using the official [ngResource](https://docs.angularjs.org/api/ngResource) module.

## Prerequisites

* RVM / A Stable Ruby Version
* Yeoman, Gulp, Bower `npm install -g yo gulp bower`

## Bootstrap the API

We'll be using the [Rails::API gem](https://github.com/rails-api/rails-api) for this application as we'll be using Rails as a RESTFul, JSON API. Since we're using Angular as the client application we don't need much of the middleware or asset management Rails provides by default. Rails::API slims-down the backend and gives us exactly what we need.

    $ gem install rails-api

Generate a new Rails::API app and run bundler.

```
$ rails-api new railsAngular --database=postgresql

$ cd railsAngular

$ bundle install
```

#### Scaffold a resource and test API

Scaffold a resource that we'll wire up to Angular and consume. This can be anything you want but I recommend including at least a few fields to test with.

```
$ bin/rails g scaffold articles title:string body:text
```

#### API Scope and Namespace

Modify routes to use a scope of /api and a namespace of V1. We'll also make it default to JSON.

```
scope '/api' do
  namespace :v1, defaults: { format: :json } do

    resources :articles, except: [:new, :edit]

  end
end
```

Update the controller to use the new V1 namespace.

```
$ mkdir app/controllers/v1

$ mv app/controllers/articles_controller.rb app/controllers/v1/articles_controller.rb
```

In app/controllers/v1/articles_controller.rb, update

```
class ArticlesController
```

to:

```
class V1::ArticlesController
```

#### Setup Database

I recommend creating a few seeds by adding to db/seeds.rb. This will help us when we test the end point to request the resources and we'll eventually see these through our UI.

```
$ echo "Article.create(title: 'Test Article', body: 'A test article. Cool!')" >> db/seeds.rb

$ rake db:create

$ rake db:migrate

$ rake db:seed
```

#### Test the Configuration

Test the new resource by navigating to articles GET #index.

```
$ bin/rails s
```

http://localhost:3000/api/v1/articles

You should see nice JSON output of the Article resources.

## Deploy to Heroku

Refer to the Heroku documentation about getting started with a Rails application. We install the rails_12factor gem for production, initialize the git repo, and then create the Heroku app. After we deploy to Heroku, we need to setup the Rails database.

https://devcenter.heroku.com/articles/getting-started-with-rails4

```
$ echo "gem 'rails_12factor', group: :production" >> Gemfile

$ bundle install

$ git init

$ git add .

$ git commit -m "init"

$ heroku create

$ git push heroku master

$ heroku run rake db:migrate && rake db:seed

$ heroku open
```

Open up your Heroku app in a browser and again test the resource you created. The output should be exactly as we see it when we deploy locally.

https://fast-forest-6196.herokuapp.com/api/v1/articles

## Create Angular App

We're going to put all of the source of our front-end Angular application in a client directory. We'll install the generator-gulp-angular, make the directory, and bootstrap the application.

```
$ npm install -g generator-gulp-angular

$ mkdir client && cd $_

$ yo gulp-angular railsAngular
```

I selected most of the default values. You can customize the options as you see fit.

* Angular 1.4.0
* all default Angular modules
* jQuery 2.x
* ngResource
* UI Router
* Bootstrap
* Angular UI Bootstrap
* Base CSS
* Standard Javascript
* Standard HTML

#### Setup local development environment

For the local dev environment, I followed this tutorial:

http://www.angularonrails.com/how-to-wire-up-ruby-on-rails-and-angularjs-as-a-single-page-application-gulp-version/

Next, we're going to edit client/gulp/server.js to do several things.

1. Configure [proxy middleware](https://www.npmjs.com/package/http-proxy-middleware#star) with a context of '/api' that targets the Rails API application.
2. Set browserSync to run the client application on port 9000 since the Rails server uses 3000 by default.
3. Add Gulp tasks to start rails and to start the entire full-stack application.

```
...

var proxyMiddleware = require('http-proxy-middleware');
+ var exec = require('child_process').exec;

...

var server = {
  baseDir: baseDir,
  routes: routes,
+ middleware: [
+   proxyMiddleware('/api', { target: 'http://localhost:3000' })
+ ]
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
+ port: 9000,
  startPath: '/',
  server: server,
  browser: browser
});

...

+ gulp.task('rails', function() {
+   exec("../bin/rails s");
+ });

+ gulp.task('serve:full-stack', ['rails', 'serve']);
```

Now we can run our new serve:full-stack task from the client directory and test that our client app loads and that the API is accessible from the proxy.

```
$ gulp serve:full-stack
```

Let's test the 3 changes we made:

1. The front-end server should come up on port 9000 instead of 3000.
2. Test the proxy by navigating to http://localhost:9000/api/v1/articles. You should see a response from the API.
3. Rails is running on port 3000.

## Acessing the API from Client

Edit client/app/src/index.route.js and add an 'articles' state:

```
...
.state('articles', {
  url: '/articles',
  templateUrl: 'app/components/articles/articles.html',
  controller: 'ArticlesController'
});
...
```

I like to create "Vertical Modules" where all of the source realted to a component is contained in the same directory.

```
$ mkdir client/src/app/components/articles
```

Create a factory that will consume our API resource. By default, Angular resource does not have a method for updating so we'll create that. See the [official documentation for Angular $resource](https://docs.angularjs.org/api/ngResource/service/$resource#creating-a-custom-put-request) for more information.

```
$ touch client/src/app/components/articles/articles.factory.js
```

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

Now we'll create a basic view that will iterate over all of the article resources and output their basic attributes.

```
touch src/app/components/articles/articles.html
```

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

We'll create a basic controller that uses the factory to query all of the Article resources.

```
$ touch src/app/components/articles/articles.controller.js
```

```
angular.module('angularRails')
  .controller('ArticlesController', function ($scope, Articles) {

    Articles.query(function (res) {
      $scope.articles = res;
    });

  });
```

#### Test the UI

Run gulp:full-stack again and navigate to your newly created state on the frontend (http://localhost:9000/#/articles). Your Angular application should be correctly consuming and display the Article resources.

![angular-on-rails-api](http://grantgeorge.io/content/images/2015/07/Screen-Shot-2015-07-19-at-9-44-20-AM.png)

## Deploy the entire stack to Heroku

Let's deploy our awesome full-stack application! We want Gulp to build the production files in a directory called 'public'. Rails, by default, will load these files at the root route.

Edit the gulpfile conf file at client/gulp/conf.js and change

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

Set the force option to true for the clean task in client/gulp/build.js. This is required since the build directory is a level up from the client directory and a warning is thrown when we clean the directory for building.

```
gulp.task('clean', function (done) {
  $.del([path.join(conf.paths.dist, '/'), path.join(conf.paths.tmp, '/')], { force: true }, done);
});
```

Now we can build the application and you should see the built application in public.

```
$ gulp build
```

#### Configure Multiple Heroku Buildpacks

The following section refers to the [official Heroku documentation on using multiple buildpacks](https://devcenter.heroku.com/articles/using-multiple-buildpacks-for-an-app).

Add the ruby and node heroku buildpacks:

```
$ heroku buildpacks:set https://github.com/heroku/heroku-buildpack-ruby
$ heroku buildpacks:add --index 1 https://github.com/heroku/heroku-buildpack-nodejs
```

Verify that you have the correct buildpack configuration. Note that you must have both buildpacks set and in the correct order. This ensures that it will install and build our client app but use the Rails app as the webserver.

```
$ heroku buildpacks
➜  railsAngular git:(master) heroku buildpacks
=== angular-rails-gulp-tutorial Buildpack URLs
1. https://github.com/heroku/heroku-buildpack-nodejs
2. https://github.com/heroku/heroku-buildpack-ruby
```

Set the node environment to production.

```
$ heroku config:set NODE_ENV=production
```

Create a Procfile in root of project to run the WEBrick webserver

```
$ bin/rails s
```

Deploy!

```
$ git add -A

$ git commit -m "testing deploy"

$ git push heroku
```

Open your deployed Heroku application and verify everything works!

```
$ heroku open
```

Navigate to articles page. It should work exactly as you have it locally but with built client assets.

https://angular-rails-gulp-tutorial.herokuapp.com/#/articles

![angular-on-rails-gulp-heroku-assets](http://grantgeorge.io/content/images/2015/07/Screen-Shot-2015-07-19-at-9-53-54-AM.png)

## Debugging

If you're having issues with the deploy I recommend tailing the Heroku logs while you deploy. Additionally, I recommend installing papertrail. Papertrail allows you to search the logs and offers many features that can be useful as your application grows.

```
$ heroku logs --tail

$ heroku addons:create papertrail

$ heroku addons:open papertrail
```

![heroku-papertrail-addon-in-action](http://grantgeorge.io/content/images/2015/07/Screen-Shot-2015-07-19-at-9-56-16-AM.png)

## Where to go from here?

Start building your application using the lightweight Rails API framework and the ever-popular Angular! This is a great stack that utilizes the robustness of Rails as a JSON API and the agility of Angular as a client-side application. There are many things you can do to improve your application: setup a test infrastructure, configure Puma as a webserver, and configure a logging application (I recommend papertrail as it works well with Heroku)

Have fun!
