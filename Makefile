msg=update

init:
	flask --app api/index db init

migrate:
	flask --app api/index db revision --autogenerate -m "$(msg)"

upgrade:
	flask --app api/index db upgrade

downgrade:
	flask --app api/index db downgrade