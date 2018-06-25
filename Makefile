.PHONY: deploy deploy-github deploy-npm test

VERSIONS_COUNT=`grep -E 'version' *.js package.json  | grep -E -o '[0-9]\.[0-9]\.[0-9]' | sort | uniq | wc -l`
GIT_CHANGES_COUNT=`git status --short 2> /dev/null | wc -l`

lint:
	@jslint typogr.js

#test: lint
test:
	@npm test

versions: minify
	@grep -E "version" typogr.js package.json cli.js|\
		grep -E '[0-9]\.[0-9]\.[0-9]' |\
		sed -r 's/\s*"?version"?:\s*/\t-->\t/gi' |\
		sed -r 's/"//gi' |\
		sed -r "s/,|;|'//gi" |\
		sed -r 's/\s*typogr.version\ =\s*/\t-->\t/gi'
	@grep -E -o '[0-9]\.[0-9]\.[0-9]' typogr.min.js  |\
		awk '{ print "typogr.min.js\t-->\t" $$1}'

check-version:
	@if [ "$(VERSIONS_COUNT)" != "1" ]; then\
		echo "\n\tVersions in *.js and *.json are different!\n";\
		exit 1; fi

check-changes:
	@if [ "$(GIT_CHANGES_COUNT)" != "0" ]; then\
		echo "\n\tIn the repository there are unsaved changes\n";\
		exit 1; fi

minify:
	@./node_modules/uglify-js/bin/uglifyjs --output typogr.min.js typogr.js

deploy-github:
	@git tag `grep -E 'version' package.json  | grep -E -o '[0-9]\.[0-9]\.[0-9]'`
	@git push --tags origin master

deploy-npm:
	npm publish

deploy: minify check-changes check-version test deploy-npm deploy-github

env:
	@virtualenv env						&& \
		. env/bin/activate			&& \
		pip install nodeenv			&& \
		nodeenv --prebuilt -j 4 -p	&& \
		npm install

