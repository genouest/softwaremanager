import json
import sys

import click

import requests


@click.command()
@click.option('--apikey', help='api key [mandatory].')
@click.option('--url', help='software manager url [mandatory].')
@click.option('--name', help='software name [mandatory].')
@click.option('--desc', help='software description.', default="")
@click.option('--bio', help='bio.tools id.', default="")
@click.option('--info', help='software additional info.', default="")
@click.option('--version', help='version.')
@click.option('--vinfo', help='version additional info.', default="")
@click.option('--vtype', help='version installation type (manual, conda, ...).', default="")
@click.option('--venv', help='env file/module to load.', default="")
@click.option('--vlocation', help='version installation directory.', default="")
def add(apikey, url, name, desc, bio, info, version, vinfo, vtype, venv, vlocation):
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

    biotools_precise_name = {
        'muscle': 'muscle_ebi',
        'allpathslg': 'Allpaths-LG',
        'blast2go_cli': 'Blast2GO',
        'interproscan': 'interproscan_4',
        'sra-tools': 'SRA_toolkit',
        'viennarna': 'vienna_rna_package',
        'wise': 'genewise',
        'entrez-direct': 'entrez',
        'gatb-core': 'GATB',
        'hmmer': 'HMMER3',
        'macs2': 'MACS',
        'mafft': 'mafft_ebi',
    }

    if not bio and not desc:
        biotools_req = name
        if name in biotools_precise_name:
            biotools_req = biotools_precise_name[name]
        r = requests.get('https://bio.tools/api/' + biotools_req + '/?format=json')

        uid = ''
        desc = ''
        clean_name = name.capitalize()
        if r.status_code == 200:
            uid = name
            rj = r.json()
            desc = rj['description']
            clean_name = rj['name']
            if clean_name.endswith(' (EBI)') or clean_name.endswith(' (NIH)'):
                clean_name = clean_name[:-6]
    else:
        clean_name = name.capitalize()
        uid = bio

    data = {
        'software': {
            'name': clean_name,
            'description': desc,
            'info': info,
            'uid': uid
        }
    }
    if version:
        data['version'] = {
            'name': clean_name,
            'version': version,
            'type': vtype,
            'env': venv,
            'location': vlocation,
            'info': vinfo
        }

    if not url.endswith('/soft'):
        url += '/soft'
    print("Send to " + url + "," + json.dumps(data))
    r = requests.post(url, json=data, headers=headers)
    if not r.status_code == 200:
        print("something went wrong")
        sys.exit(1)


if __name__ == '__main__':
    add()
