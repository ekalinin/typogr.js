.PHONY: deploy deploy-github deploy-npm test

test:
		expresso test/*

deploy-github:
		git push --tags origin master

deploy-npm:
		npm publish

deploy: test deploy-npm deploy-github
