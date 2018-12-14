# software manager


## About

small server app to register installed softwares and versions

API helps to add/update software and stat their usage

More an internal project, don't think it can be useful for others....

Anyway, license is Apache 2.0

## API

See swagger.yaml

## Client

A python client is available as exemple to add software/version:


    # Declare software
    python softmngr.py --apikey=ADZDEEEFEF --url=https://xxx  --name=test --desc="sample test"
    # Declare software and version
    python softmngr.py --apikey=ADZDEEEFEF --url=https://xxx  --name=test --desc="sample test"  --version=1.0 --venv="/softs/local/env/envtest.sh" --vlocation="/softs/local/test"
    # Add version to existing software
    python softmngr.py --apikey=ADZDEEEFEF --url=https://xxx  --name=test --version=2.0 --venv="/softs/local/env/envtest-2.0.sh" --vlocation="/softs/local/test"

## Status

In dev