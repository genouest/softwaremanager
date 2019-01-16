import os
import re

import requests

# envs that we don't want to load
blacklist_env = [
    'envconda.sh',
    'envmpi-1.0.6p1.sh',
    'envmpi-1.sh',
    'envmpi2-1.1_gf44.sh',
    'envmpi2-1.1_smpd.sh',
    'envmpi-2.sh',
    'envmpich2-1.3.1.sh',
    'envmpich2.1.3-pic_recompil.sh',
    'envmpich2.1.3-pic.sh',
    'envmpich2.1.3.sh',
    'envmpi.sh',
    'envprotomatascripts-new-1.9.sh',
    'envprotomatascripts-new-2.0.sh',
    'envr.sh',
    'envR.sh',
    'envexonerate.sh',
    'envfrostools.sh',
    'envfrosto.sh',
    'envswig.sh',
    'envstar_static.sh',
    'enviprscan.sh',
    'envpython-2.7-bis.sh',
]

# to blacklist some strange version numbers
blacklist_version = [
    'new',
    'denovo',
    'utils'
]

# soft name replacement
name_convert = {
    'trinityrnaseq': 'trinity',
    'blast+': 'blast',
    'r': 'R',
    'cufflink': 'Cufflinks',
}

hardcoded_envs = {
    'envncbi.sh': {'soft': 'NCBI toolkit', 'version': '6.1_2.2.23'},
    'envprotomata-new.sh': {'soft': 'Protomata', 'version': '2.0'},
    'envemboss.sh': {'soft': 'Emboss', 'version': '6.5.7'},
    'envclustalw.sh': {'soft': 'Clustalw', 'version': '2.1'},
    'envwise.sh': {'soft': 'Genewise', 'version': '2.2.0'},
    'envphylip.sh': {'soft': 'Phylip', 'version': '3.67'},
    'envphyml.sh': {'soft': 'Phyml', 'version': '20120412'},
    'envstar.sh': {'soft': 'Star', 'version': '2.5.2a'},
    'envbcl2fastq.sh': {'soft': 'bcl2fastq', 'version': '1.8.4'},
    'envdialign.sh': {'soft': 'dialign', 'version': '2.2'},
    'envA_purva.sh': {'soft': 'A_purva', 'version': '1.6'},
    'envgassst.sh': {'soft': 'Gassst', 'version': '1.262'},
    'envgenemark.sh': {'soft': 'GeneMark', 'version': '3.9d'},
    'envprimer3.sh': {'soft': 'primer3', 'version': '2.3.4'},
}

biotools_precise_name = {
    'muscle': 'muscle_ebi',
}

skipped = []
current = []

for root, dirs, files in os.walk("/softs/local/env"):
    for filename in files:
        #if filename != 'envprotomata-new-2.0.sh':
        #    continue
        if root.endswith('deprecated') or (not filename.startswith('env')) or filename in blacklist_env:
            continue

        if filename in hardcoded_envs:
            soft = hardcoded_envs[filename]['soft']
            version = hardcoded_envs[filename]['version']
        else:
            elts = filename.replace('.sh', '').replace('env', '')
            subelts = elts.split('-')

            if len(subelts) < 2:
                env_path = os.path.join(root, filename)
                if os.path.isfile(env_path):
                    with open(os.path.join(root, filename), 'r') as env_content:
                        install_dir = re.search('/local/[A-Za-z0-9-_.]*/([A-Za-z0-9-_.]*)/', env_content.read(), re.IGNORECASE)

                        if install_dir:
                            install_dir = install_dir.group(1)
                            if install_dir == "current":
                                current.append('%s' % (filename))
                            else:
                                skipped.append('%s installed in %s ' % (filename, install_dir))
                else:
                    skipped.append('%s is not a file' % (filename))

                continue

            version_length = 1
            if filename.startswith('envinterproscan'):
                version_length = 2

            soft = '-'.join(subelts[:-version_length])
            if soft in name_convert:
                soft = name_convert[soft]
            version = '-'.join(subelts[-version_length:])
            if version in blacklist_version:
                skipped.append('%s have invalid version' % (filename))
                continue

        biotools_req = soft
        if soft in biotools_precise_name:
            biotools_req = biotools_precise_name[soft]
        r = requests.get('https://bio.tools/api/' + biotools_req + '/?format=json')
        uid = ''
        desc = ''
        clean_name = soft.capitalize()
        if r.status_code == 200:
            uid = soft
            rj = r.json()
            desc = rj['description']
            clean_name = rj['name']
            if clean_name.endswith(' (EBI)') or clean_name.endswith(' (NIH)'):
                clean_name = clean_name[:-6]

        install_type = None
        if os.path.exists(os.path.join(root, filename)):
            with open("/softs/local/env/" + filename, 'r') as env_content:
                if 'genouest_conda_activate' in env_content.read():
                    install_type = 'Conda'
                else:
                    install_type = 'Manual'

        payload = {
            "software": {
                "name": clean_name,
                "uid": uid,
                "description": desc
            },
            "version": {
                "version": version,
                "env": "/local/env/" + filename,
                "name": clean_name,
                "type": install_type
            }
        }
        headers = {
            "x-api-key": "ADZDEEEFEF"
        }
        print('Inserting %s %s (%s)' % (clean_name, version, install_type))
        # r = requests.post('http://localhost:3000/soft', json=payload, headers=headers)

print()
print('Skipped because no version found:')
for sk in skipped:
    print(sk)

print()
print('Skipped because current:')
for sk in current:
    print(sk)
