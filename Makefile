.PHONY: deploy deploy-github deploy-npm test

test: minify
	expresso test/typographer.test.js

minify:
	uglifyjs --output typographer.min.js typographer.js

deploy-github:
	git push --tags origin master

deploy-npm:
	npm publish

deploy: test deploy-npm deploy-github
