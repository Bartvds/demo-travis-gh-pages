# demo-travis-gh-pages [![Build Status](https://secure.travis-ci.org/Bartvds/demo-travis-gh-pages.png?branch=master)](http://travis-ci.org/Bartvds/demo-travis-gh-pages)

> Use Grunt and Travis-CI to publish content to gh-pages

**Warning** Beta version: logic should be good, still doing some testing, polishing the text, spotting typos etc.

**Note** If you have any questions or feedback then feel free to leave a [ticket](https://github
.com/Bartvds/demo-travis-gh-pages/issues).

-	View the [source repos](https://github.com/Bartvds/demo-travis-gh-pages/).
-	Check the result on [github.io](http://bartvds.github.io/demo-travis-gh-pages).

## Intro

This guide describes a setup to enable [Travis-CI](https://travis-ci.org/) to build your static website using [Grunt](http://gruntjs.com/) and publish it to [github pages](https://pages.github.com/) after you commit your sources to a specific branch of your repository.

The functionality depends on [grunt-gh-pages](https://www.npmjs.org/package/grunt-gh-pages) and an encrypted OAuth token. 

Using this you can automate exporting documentation for your project or publish any other static site you build with Grunt.

The build triggers after every commit to the specified branch, and will also re-publish your site after you merge a Pull Request or after using the code editor on github.com. This is a simple form of *continuous integration*.

This example uses Grunt but most of the information is valid for other task runners, except you'd need to find a plugin that can use an OAuth token to push content to github.


## Demo

Refer to the content of the [master branch](https://github.com/Bartvds/demo-travis-gh-pages/) to see the configurations used for this specific site.

View [the result](http://bartvds.github.io/demo-travis-gh-pages) in your browser, and check the [gh-pages](https://github.com/Bartvds/demo-travis-gh-pages/tree/gh-pages) branch to see the output.

This bare-bones demo will render the `README.md` to html using [grunt-markdown](https://www.npmjs.org/package/Grunt-markdown). This is a simple example to show the general process, but the flow can be used with any site generator (for example we use it with [docpad](http://docpad.org/)).

There are so many great Grunt plugins anything is possible, and if that is not enough you can use Grunt to work with pretty much any npm module or shell command.


## Prerequisites

Intermediate skills

-	Be comfortable using Github and ready to get hands-on with continuous integration.
-	Have some skill in reading docs and figuring things out if something unexpected turns up.
-	Have some experience configuring Grunt tasks and use it to build a static website.

Have some runtimes installed:

-	[nodejs](http://nodejs.org/) (to run Grunt)
-	[ruby](https://www.ruby-lang.org/en/installation/) (to run the travis gem)
-	git v1.7.6 or better (for grunt-gh-pages) 

Prepare Travis:

-	Create an account at [travis-ci](https://travis-ci.org/) (see [step #1 of the docs](http://docs.travis-ci.com/user/getting-started/#Step-one%3A-Sign-in) of the docs)
-	Use you terminal to install the travis ruby gem: 

````bash
$ gem install travis
````

## Guide

Follow these steps to set it up for you project. To get started you can copy the code from [this live example](https://github.com/Bartvds/demo-travis-gh-pages/).


### Create a project that generates a static site

-	Host it on github in the master branch.
-	Configure a Gruntfile (or start from the example).
-	Output the site content to the `./public` directory.

To keep the example simple we use [grunt-markdown](https://www.npmjs.org/package/grunt-markdown) to convert the `README.md` to html, wrapped in a simple template.


### Create a 'gh-pages' branch on github.com

-	Using your terminal or the github website interface. 


### Configure the 'grunt-gh-pages' plugin

-	See the example Gruntfile. 
-	Notice the example has two targets:
	-	A target to run locally (for testing) that will ask for a user-name and password.
	-	The target that will run on Travis using the OAuth token.
	-   In the example it will look for a environment variable `GH_TOKEN`.
	-	Make sure the branches and both urls are correct.
-	It is **very important** that the target with the token is set to `silent: true` or it will leak your token in the build log!
-	Make sure the `user` variable has a valid name and email (the example it reads from package.json)
	-	Github will not accept commits without this.
-	For more info see the [grunt-gh-pages documentation](https://www.npmjs.org/package/grunt-gh-pages).

### Configure Grunt to recognise Travis

-	Add a check to the Gruntfile for the Travis environment variables to conditionally run the build.
-	See the example Gruntfile, it uses the following condition.
-   Note how the task only runs on commits (it ignores pull requests).

````js
if ( process.env.TRAVIS === 'true' 
		&& process.env.TRAVIS_SECURE_ENV_VARS === 'true' 
		&& process.env.TRAVIS_PULL_REQUEST === 'false' 
) {
	grunt.log.writeln('executing deployment');
	grunt.task.run('gh-pages:deploy');
}
````

### Do a publish test

-	Make sure your site builds correctly to the `./public` folder.
-	Push the first version to `gh-pages` using the `$ grunt publish` task. It will ask for your user-name/password.
-	Check your repository on github.com and make sure the `gh-pages` branch has your content. 
-	Browse to the github.io url of your repos and make sure you see your site. 


### Activate the Travis webhooks for your project

-	Go to https://travis-ci.org/profile.
-	Sync your github account to refresh the list of repositories.
-	Enable Travis for this project (see [step #2 of the docs](http://docs.travis-ci.com/user/getting-started/#Step-two%3A-Activate-GitHub-Webhook))


### Create your '.travis.yml' in the project root

-	Copy the the content from the example.
-	Notice the secure value, it is encrypted using public key cryptography. 
	-	The key is locked to a specific repository so it only decrypts when building this exact repository (and not in forks or pull requests).
	-	Currently this holds one of my tokens so you'll need to replace it with your own (see below).
-	Make sure the `script` runs the correct task (eg: including the site build and the `grunt-gh-pages` target that is set to use the token in the Gruntfile).
-	Validate the content using [travis-lint](http://docs.travis-ci.com/user/travis-lint/).


### Create an OAuth token for your github account

- Go to https://github.com/settings/applications.
- In the 'personal-access-tokens' section click the 'Generate new token' button:
	-	It is recommended to create a separate token for every project.
	-	Enter a descriptive name so you can identify it later.
	-	In the popup *deselect* all scopes except `repo`.
	-	Click 'Generate token' and copy the hex string.
-	Regenerate or revoke tokens as much as you like (eg: if you leaked it somewhere you just revoke it and get a new one). 
-	The `repo` scope gives write access to all your public repos! Keep your tokens safe! *Never* save somewhere to
remember it. Instead encrypt it and then forget the original.
-	Revoke tokens you don't really use.


### Add the token to the secure section in '.travis.yml'

-	Remove the existing variable (the big base64 string).
-	Use the travis gem to store the token as `GH_TOKEN` environment variable. (more info in the [docs](http://docs.travis-ci.com/user/build-configuration/#Secure-environment-variables))
-   Run this command in your terminal (with your own token):

````bash
$ travis encrypt GH_TOKEN=your_oath_token --add
```` 

-	Check the `.travis.yml` and make sure a new value is set.


### Deploy your site

-	Add the `./public` folder to `.gitignore`
-	Commit the source files.
-	Push to the `master` branch on github.com.
-	Go to https://travis-ci.org/
-	Your project will show up on the left side (this can take a minute)
	-	If not then refresh the page
	-	Select your project
-	In the main view navigate to the latest build that triggered (can take a minute too).
-	Check the log for status and errors.
	-	Notice how it says `$ export GH_TOKEN=[secure]` near the start of the log.
	-	Scan the log output, it should look similar to what you see in your own terminal.
	-	Check if you didn't log your environment vars and token somewhere.
	-	Fix any build errors and push your changes, and a new build will start.
	-   Look for `Running "gh-pages:deploy" (gh-pages) task` and see if it passed.
-	The log should end at `Done. Your build exited with 0.`
-	Your gh-pages site is now published!
-	Browse to the github.io url of your repos and make sure you see the expected changes.


### Wrap it up

-	Feel awesome for setting up continuous integration!
-	Send a PR if you have fixes or clarifications.
-	Leave a [ticket](https://github.com/Bartvds/demo-travis-gh-pages/issues) if you found problems or have feedback.
-	Share this guide with friends and spread the fun.


## Security

You should be aware of the two main things that can go bad:

1.	Pushing to the wrong branch or repository (mildly bad)
2.	Leaking your un-encrypted token (really bad)

Always double-check your settings and development logs. 

If you leak your token just revoke it quickly and maybe check your Github [security activity](https://github.com/settings/security). Then create a new token, again making sure you limit the scope. A token is harmless after you revoked it (except to your bruised ego).

If you need to print the hidden output of a task that is using your token and there really is no other way then you could opt to allow the task to leak it to the logs, as long as you immediately revoke that token. Don't forget this or somebody will pwn your repos (seriously).

Keep in mind that anyone with commit access to the repository can modify the Grunt configuration to output the decrypted token to the build log. So make sure you trust your collaborators and verify no hostile code lands in your branch (check pull requests etc).

If you need this to work in a project with many collaborators and don't want to expose your whole account then you can create a machine user (bot account). Then give the bot commit access to your repository and create an OAuth token for the bot account. Github allows this, see https://help.github.com/articles/managing-deploy-keys#machine-users.


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

Build & push website using CLI user-name/password

````bash
$ grunt publish
````


## Thanks

-	Tim Schau (@tschaub)- for creating grunt-gh-pages
-	gruntjs - powerful tasks runner with near limitless choice of plugins
-	github - changing the game with free version control and capable project tools
-	travis - being a classy gent and introducing many people to continuous integration
-	you - for being awesome


## Contributing

Contributions are very welcome. Fork the project, make your changes and send a pull request.


## Licence

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by/4.0/80x15.png" /></a> This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>.
