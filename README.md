# demo-travis-gh-pages [![Build Status](https://secure.travis-ci.org/Bartvds/demo-travis-gh-pages.png?branch=master)](http://travis-ci.org/Bartvds/demo-travis-gh-pages)

> Use Grunt and Travis-CI to publish content to github-pages

**Note** If you have any questions or feedback then feel free to leave a [ticket](https://github.com/Bartvds/demo-travis-gh-pages/issues).

-	View the [source repos](https://github.com/Bartvds/demo-travis-gh-pages/).
-	Check the result on [github.io](http://bartvds.github.io/demo-travis-gh-pages).

## Intro

This guide describes a minimal setup to enable [Travis-CI](https://travis-ci.org/) to build your static website using [Grunt](http://gruntjs.com/) and publish it to [gh-pages](https://pages.github.com/) branch after you push your sources to your Github repository. Using this you can automatically export the documentation for your project or publish any other static site you build with Grunt.

Every push or merge to the specified branch will trigger the Github webhooks. Travis will then clone the repository, install the dependencies and run a command. In this case we use Grunt to rebuild our site and push the site back to to your repository's `gh-pages` branch. This is a simple form of *continuous deployment*.

In this demo we depends on [grunt-gh-pages](https://www.npmjs.org/package/grunt-gh-pages) and an encrypted OAuth token to enable Travis to push to a repository on your behalf.


## Alternatives

If you have a project that doesn't use github-pages but instead use old-skool FTP or some other deployment method, then you replace the gh-pages task with a Grunt plugin that handles your scenario. You skip the Github OAuth token and encrypt the credentials needed for the plugin of your choice.

This example uses Grunt but most of the information is valid for other task-runners, except you'd need to find a plugin that can use an OAuth token to push content to Github.

The data you push around is of course not limited to just websites; using encrypted variables you can get really creative.

The principle of encrypted environment variables works on most CI platforms: [Travis-CI](https://travis-ci.org/), [AppVeyor](http://appveyor.com/) (windows os), [Shippable](https://www.shippable.com/), [Wercker](https://app.wercker.com/#explore) and many more.


## Demo

This repository and it's github.io page are the demo.

Refer to the content of the [master branch](https://github.com/Bartvds/demo-travis-gh-pages/) to see the configurations used for this specific site. Check the [`Gruntfile`](https://github.com/Bartvds/demo-travis-gh-pages/tree/master/Gruntfile.js) and [`.travis.yml`](https://github.com/Bartvds/demo-travis-gh-pages/tree/master/.travis.yml) for the configuration.

View [the output](http://bartvds.github.io/demo-travis-gh-pages) in your browser, and check the [gh-pages](https://github.com/Bartvds/demo-travis-gh-pages/tree/gh-pages) branch to see the output. Have a look at the generated [commit messages](https://github.com/Bartvds/demo-travis-gh-pages/commits/gh-pages) that link to the diff of the source commits.

This bare-bones demo will render the `README.md` to html using [grunt-markdown](https://www.npmjs.org/package/Grunt-markdown). This is a simple example to show the general process, but the flow can be used with any site generator (for example we use it with [docpad](http://docpad.org/)).

There are many great Grunt plugins, and you can use Grunt to work with pretty much any npm module or shell command.


## Is this safe?

It is safe when your build is configured correctly and doesn't print your *decrypted* secret information to pubic logs on Travis, in the Git commit message or anywhere else.

Having the *encrypted* values in public repositories is safe because the public/private-key encryption: only in a Travis build of this specific repository will the variables be readable for the running code.

Make sure you read the safety-section further in this guide for the details.


## Prerequisites

Intermediate skills

-	Be comfortable using Github and ready to get hands-on with continuous deployment.
-	Some skill in reading docs and figuring things out if something unexpected turns up.
-	Experience configuring Grunt tasks and use it to build a static website.

Have some runtimes installed:

-	[nodejs](http://nodejs.org/) (to run Grunt)
-	[ruby](https://www.ruby-lang.org/en/installation/) (to run the travis gem)
-	git v1.7.6 or better (for grunt-gh-pages) 

Prepare Travis:

-	Sign-up for a free account at [travis-ci](https://travis-ci.org/) (see [step #1 of the docs](http://docs.travis-ci.com/user/getting-started/#Step-one%3A-Sign-in) of the docs)
-	Use you terminal to install the travis gem: 

````bash
$ gem install travis
````

## Guide

Follow these steps to set things up for you project. To get started you can copy the code from this [live example](https://github.com/Bartvds/demo-travis-gh-pages/).


### Create a project that generates a static site

-	Configure a Gruntfile (or start from the [example](https://github.com/Bartvds/demo-travis-gh-pages/blob/source/Gruntfile.js)).
-	Output the site content to the `./public` directory.
-	Host it on Github (we use the master branch here).

To keep the example simple we use [grunt-markdown](https://www.npmjs.org/package/grunt-markdown) to convert the `README.md` to html, wrapped in a simple template.


### Create a 'gh-pages' branch on github.com

-	Using your terminal or the Github website interface.


### Configure the 'grunt-gh-pages' plugin

-	See the example[Gruntfile](https://github.com/Bartvds/demo-travis-gh-pages/blob/source/Gruntfile.js).
-	Notice the example has two targets:
	-	A target to run locally that will ask for a username and password.
	-	The target that will run on Travis using the OAuth token.
	-	In the example it will look for a environment variable `GH_TOKEN`.
	-	Make sure the branches and both urls are correct.
-	It is **very important** that the target with the token is set to `silent: true` or it will leak your token in the build log!
-	Make extra sure the `user` variable has a valid name and email (the example reads from package.json).
	-	Github will not accept commits without this, but because the target is set to 'silent' it will fail without telling you this.
-	For more info see the [grunt-gh-pages documentation](https://www.npmjs.org/package/grunt-gh-pages).


### Do a publish test

-	Make sure your site builds correctly to the `./public` folder.
-	Push the first version to `gh-pages` using the `$ grunt publish` task. It will ask for your username/password.
-	Check your repository on github.com and make sure the `gh-pages` branch has your content.
-	Browse to the github.io url of your repos and make sure you see your site.


### Activate the Travis webhooks for your project

-	Go to https://travis-ci.org/profile.
-	Sync your Github account to refresh the list of repositories.
-	Enable Travis for this project (see [step #2 of the docs](http://docs.travis-ci.com/user/getting-started/#Step-two%3A-Activate-GitHub-Webhook))


### Configure Grunt to recognise Travis

-	Add a check to the Gruntfile for the Travis environment variables to conditionally run the build.
-	See the example Gruntfile, it uses the following condition:
	-	Note how the task only runs on commits (it ignores pull requests).

````js
if ( process.env.TRAVIS === 'true'
		&& process.env.TRAVIS_SECURE_ENV_VARS === 'true'
		&& process.env.TRAVIS_PULL_REQUEST === 'false'
) {
	grunt.log.writeln('executing deployment');
	grunt.task.run('gh-pages:deploy');
}
````

### Create your '.travis.yml' in the project root

-	Copy the the content from the [example](https://github.com/Bartvds/demo-travis-gh-pages/blob/source/.travis.yml).
-	Notice the secure value, it is encrypted using public key cryptography.
	-	The key is locked to a specific repository so it only decrypts when building this exact repository (and not in forks or pull requests).
	-	Currently this holds one of my tokens so you'll need to replace it with your own (see below).
	-	Note how I can expose this *encrypted* token to anyone: it is worthless unless it runs on the Travis build of this repos.
-	Make sure the `script` runs the correct task (eg: including the site build and the `grunt-gh-pages` target that uses the token in the Gruntfile).
-	Validate the content using [travis-lint](http://docs.travis-ci.com/user/travis-lint/).


### Create an OAuth token for your Github account

- Go to https://github.com/settings/applications.
- In the 'personal-access-tokens' section click the 'Generate new token' button:
	-	It is recommended to create a separate token for every project.
	-	Enter a descriptive name so you can identify it later.
	-	In the popup *deselect* all scopes except `public_repo`.
	-	Click 'Generate token' and copy the hex string.
-	Regenerate or revoke tokens as much as you like (eg: if you leaked it somewhere you just revoke it and get a new one).
-	The `public_repo` scope gives write access to all your public repos.
-	*Never* save un-encrypted tokens. Instead encrypt it and then forget the original.
-	Revoke any tokens you don't really use.


### Add the token to the secure section in '.travis.yml'

-	Remove the existing variable (the big base64 string).
-	Use the travis gem to store the token as `GH_TOKEN` environment variable. (more info in the [docs](http://docs.travis-ci.com/user/build-configuration/#Secure-environment-variables))
-	Run this command in your terminal (with your own token):

````bash
$ travis encrypt GH_TOKEN=your_oath_token --add
````

-	Check the `.travis.yml` and make sure a new value is set.


### Deploy your site

-	Add the `./public` folder to `.gitignore`
-	Commit the source files.
-	Push to your main branch on github.com (usually `master`).
-	Go to https://travis-ci.org/
-	Your project will show up on the left side (this can take a minute)
	-	If not then refresh the page
	-	Select your project
-	In the main view navigate to the latest build that triggered (can take a few minutes to show up and start).
-	Check the log for status and errors.
	-	Notice how it says `$ export GH_TOKEN=[secure]` near the start of the log.
	-	Scan the log output, it should look similar to what you see in your own terminal.
	-	Check if you didn't log your environment vars and token somewhere.
	-	Fix any build errors and push your changes, and a new build will start.
	-	Look for `Running "gh-pages:deploy" (gh-pages) task` and see if it passed.
-	The log should end at `Done. Your build exited with 0.`
-	Your gh-pages site is now published!
-	Browse to the github.io url of your repos, force-refresh and make sure you see the expected changes (this can take a minute).


### Wrap it up

-	Feel great for setting up continuous deployment!
-	Send a PR if you have fixes or clarifications.
-	If you have feedback or found any problems please leave a [ticket](https://github.com/Bartvds/demo-travis-gh-pages/issues).
-	Share this guide with friends and share the power.


### Online editing

-	Using this you can also use the generic code editor on github.com to edit files and republish without leaving your browser.
-	To commit but skip a build you can add `[ci skip]` to your commit message and Travis will ignore it. (see [how-to-skip-a-build](http://docs.travis-ci.com/user/how-to-skip-a-build/))
-	Keep in mind that every save triggers a new build. Travis offers a free service shared by everyone so don't waste to much of its time.


## Safety

You should be aware of the main situations that could be bad:

1.	Pushing to the wrong branch or repository (mildly bad)
2.	Leaking your un-encrypted token (really bad)

Always double-check your settings and development logs.

If you leak your token just revoke it quickly and maybe check your Github [security activity](https://github.com/settings/security). Then create a new token, again making sure you limit the scope. A token is harmless after you revoked it.

If you need to print the hidden output of a task that is using your encrypted variables and there really is no other way then you could opt to allow the task to leak it to the logs, as long as you *immediately* revoke that token. Don't forget this or somebody *will* pwn your repositories (Murphy's law also works on the internet).

Keep in mind that anyone with commit access to the repository can modify the Grunt configuration to output the decrypted token to the build log. So make sure you trust your collaborators and verify no hostile code lands in your branch (check pull requests etc). NPM operates on trust and reviewed code and is generally safe, but still be smart and don't use flaky plugins. You could opt to lock your dependency semvers or [shrink-wrap](https://www.npmjs.org/doc/cli/npm-shrinkwrap.html) your build so you can control what dependency version get installed.

If you need this to work in a project with many collaborators and don't want to expose your whole account then you can create a machine user (bot account). Then give the bot commit access to your shared repository and create an OAuth token for it's account. Github allows this, see https://help.github.com/articles/managing-deploy-keys#machine-users.


## Links

Travis

-	http://docs.travis-ci.com/
-	http://docs.travis-ci.com/user/getting-started/
-	http://docs.travis-ci.com/user/build-configuration/#Secure-environment-variables
-	http://docs.travis-ci.com/user/encryption-keys/

Github

-	https://pages.github.com/
-	https://github.com/settings/applications
-	https://github.com/settings/security
-	https://developer.github.com/v3/oauth/#scopes
-	https://help.github.com/articles/managing-deploy-keys#machine-users

Grunt

-	http://gruntjs.com/
-	https://www.npmjs.org/package/grunt
-	https://www.npmjs.org/package/grunt-gh-pages
-	https://www.npmjs.org/package/grunt-markdown


## Local commands

These work for the example Gruntfile from this repository.

Have global `grunt` command

````bash
$ npm install grunt-cli -g
````

Install dependencies

````bash
$ npm install
````

Rebuild demo page in `./public`

````bash
$ grunt build
````

Clean `./public`

````bash
$ grunt clean
````

Build & push website using CLI username/password

````bash
$ grunt publish
````


## Thanks

-	Tim Schau (@tschaub)- for creating grunt-gh-pages
-	gruntjs - powerful tasks runner with near limitless choice of plugins
-	github - changing the game with free version control and capable project tools
-	travis - being a classy gent and introducing many people to continuous deployment
-	you - for being awesome


## Contributing

Contributions are very welcome. Fork the project, make your changes and send a pull request.


## Licence

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="//i.creativecommons.org/l/by/4.0/80x15.png" /></a> This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>.
