import sys

import click

import requests


@click.command()
@click.option('--apikey', help='api key [mandatory].')
@click.option('--url', help='software manager url [mandatory].')
@click.option('--name', help='software name [mandatory].')
@click.option('--version', help='version.')
def add(apikey, url, name, version):
    if not name:
        print("name is mandatory")
        sys.exit(1)
    if not apikey:
        print("Api key is mandatory")
        sys.exit(1)
    if not url:
        print("Url is mandatory")
        sys.exit(1)
    headers = {
        'x-api-key': apikey
    }

    if not url.endswith('/soft'):
        url += '/soft'
    url += '/' + name
    if version:
        url += '/' + version
    print("DELETE " + url)
    r = requests.delete(url, headers=headers)
    if not r.status_code == 200:
        print("something went wrong")
        sys.exit(1)


if __name__ == '__main__':
    add()
