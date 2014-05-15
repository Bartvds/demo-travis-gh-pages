'use strict';

/*jshint -W003*/

module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-markdown');
	grunt.loadNpmTasks('grunt-gh-pages');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			options: grunt.file.readJSON('.jshintrc'),
			all: ['Gruntfile.js', 'src/**/*.js']
		},
		clean: {
			tmp: ['tmp/**/*'],
			deploy: ['public/**/*']
		},
		markdown: {
			options: {
				template: './template/page.html',
				templateContext: {
					title: '<%=pkg.name%>',
					description: '<%=pkg.description%>',
					author: '<%=pkg.author.name%>',
					date: new Date().toISOString()
				},
				markdownOptions: {
					gfm: true,
					highlight: 'auto'
				}
			},
			all: {
				src: 'README.md',
				dest: 'public/index.html'
			}
		},
		'gh-pages': {
			options: {
				branch: 'gh-pages',
				base: 'public'
			},
			publish: {
				options: {
					repo: 'https://github.com/Bartvds/demo-travis-gh-pages.git',
					message: 'publish gh-pages (cli)'
				},
				src: ['**/*']
			},
			deploy: {
				options: {
					user: {
						name: 'demo-travis-gh-pages',
						email: 'bartvanderschoor@gmail.com'
					},
					repo: 'https://' + process.env.GH_TOKEN + '@github.com/Bartvds/demo-travis-gh-pages.git',
					message: 'publish gh-pages (auto)' + getDeployMessage(),
					silent: true
				},
				src: ['**/*']
			}
		}
	});

	function getDeployMessage() {
		var ret = '\n\n';
		if (process.env.TRAVIS !== 'true') {
			ret += 'missing env vars for travis-ci';
			return ret;
		}
		ret += 'branch:       ' + (process.env.TRAVIS_BRANCH || '<unknown>') + '\n';
		ret += 'SHA:          ' + (process.env.TRAVIS_COMMIT || '<unknown>') + '\n';
		ret += 'range SHA:    ' + (process.env.TRAVIS_COMMIT_RANGE || '<unknown>') + '\n';
		ret += 'build id:     ' + (process.env.TRAVIS_BUILD_ID || '<unknown>') + '\n';
		ret += 'build number: ' + (process.env.TRAVIS_BUILD_NUMBER || '<unknown>') + '\n';
		return ret;
	}

	grunt.registerTask('check-deploy', function() {
		this.requires(['build']);

		if (process.env.TRAVIS === 'true' && process.env.TRAVIS_SECURE_ENV_VARS === 'true' && process.env.TRAVIS_PULL_REQUEST === 'false') {
			grunt.log.writeln('executing deployment');
			grunt.task.run('gh-pages:deploy');
		}
		else {
			grunt.log.writeln('skipped deployment');
		}
	});

	grunt.registerTask('prep', [
		'clean',
		'jshint'
	]);

	grunt.registerTask('build', [
		'prep',
		'markdown:all'
	]);

	grunt.registerTask('publish', [
		'build',
		'gh-pages:publish'
	]);

	grunt.registerTask('deploy', [
		'build',
		'check-deploy'
	]);

	// whatever
	grunt.registerTask('test', ['build']);

	grunt.registerTask('default', ['test']);
};
