# Watch All

## Python

version: python-3.8.3

### site-packages

`./requirements.pip`

## Sencha

SenchaCmd version: [SenchaCmd-7.2.0.84-linux-amd64](http://cdn.sencha.com/cmd/7.2.0.84/no-jre/SenchaCmd-7.2.0.84-linux-amd64.sh.zip)

## Django project settings

Change mode: `project/settings/__init__.py`

Update settings:

- `project/settings/base.py`: base settings
- `project/settings/development.py`: import `base.py` and development settings
- `project/settings/production.py`: import `base.py` and production settings
- `project/settings/__init__.py`: change mode and django settings end point
