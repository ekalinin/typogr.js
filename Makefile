.PHONY: deploy deploy-github deploy-npm test

VERSIONS_COUNT=`grep -E 'version' *.js package.json  | grep -E -o '[0-9]\.[0-9]\.[0-9]' | uniq | wc -l`

test: minify check-version
	@expresso test/typographer.test.js

versions: minify
	@grep -E "version" typographer.js package.json |\
		grep -E '[0-9]\.[0-9]\.[0-9]' |\
		sed -r 's/\s*"?version"?:\s*/\t-->\t/gi' |\
		sed -r 's/\s*typographer.version\ =\s*/\t-->\t/gi'

check-version:
	@if [ "$(VERSIONS_COUNT)" != "1" ]; then\
		echo "\n\tVersions in *.js and *.json are different!\n";\
		exit 1; fi

minify:
	@uglifyjs --output typographer.min.js typographer.js

deploy-github:
	git push --tags origin master

deploy-npm:
	npm publish

deploy: check-version test deploy-npm deploy-github
