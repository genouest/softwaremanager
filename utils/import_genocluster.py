import os

import requests

blacklist = [
    'envconda.sh'
]

skipped = []

for root, dirs, files in os.walk("/softs/local/env"):
    for filename in files:
        if root.endswith('deprecated') or (not filename.startswith('env')) or filename in blacklist:
            continue
        elts = filename.replace('.sh', '').replace('env', '')
        subelts = elts.split('-')
        if len(subelts) < 2:
            skipped.append(filename)
            continue
        soft = subelts[0]
        version = '-'.join(subelts[1:])
        r = requests.get('https://bio.tools/api/' + soft + '/?format=json')
        uid = ''
        desc = ''
        clean_name = soft
        if r.status_code == 200:
            uid = soft
            rj = r.json()
            desc = rj['description']
            clean_name = rj['name']

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

print('Skipped because no version found:')
for sk in skipped:
    print(sk)