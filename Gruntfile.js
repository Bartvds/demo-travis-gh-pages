'use strict';

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
					title: '<%=pkg.title%>',
					description: '<%=pkg.description%>',
					author: '<%=pkg.author.name%>'
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
				repo: 'https://github.com/Bartvds/demo-gh-pages.git',
				branch: 'gh-pages',
				base: 'public'
			},
			publish: {
				options: {
				},
				src: ['**/*']
			},
			deploy: {
				options: {
					repo: 'https://' + process.env.GH_TOKEN + '@github.com/Bartvds/demo-gh-pages.git',
					silent: true
				},
				src: ['**/*']
			}
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
		'gh-pages:deploy'
	]);

	// whatever
	grunt.registerTask('test', ['build']);

	grunt.registerTask('default', ['test']);
};
