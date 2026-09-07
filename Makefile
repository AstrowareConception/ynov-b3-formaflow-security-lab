PROJECT := formaflow-security-lab

.PHONY: setup start-vulnerable start-remediated stop reset-data smoke test security-tests tls quality
setup:
	npm run setup
start-vulnerable:
	npm run start:vulnerable
start-remediated:
	npm run start:remediated
stop:
	npm run stop
reset-data:
	npm run reset-data
smoke:
	npm run smoke
test:
	npm test
security-tests:
	@test -n "$(LAB_PROFILE)" || (echo "LAB_PROFILE=vulnerable|remediated|cookie est obligatoire" && exit 2)
	npm run test:security -- --profile $(LAB_PROFILE)
tls:
	npm run tls
quality:
	npm run quality
