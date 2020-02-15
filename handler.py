
import sys
import json
from recog import recog_json


def handle(req):
    return 'xxx'
    obj = None
    try:
      obj = json.loads(req)
    except:
        return json.dumps({'ok': False, 'error': 'Invalid JSON Req'})

    if 'name' not in obj:
        return json.dumps({'ok': False, 'error': 'No Name'})

    return 'hello world ' + obj.get('name')


def get_stdin():
    buf = ""
    for line in sys.stdin:
        buf = buf + line
    return buf


def response(obj):
    print(json.dumps(obj))
    return json.dumps(obj)


def main():
    req = get_stdin()
    obj = None
    try:
      obj = json.loads(req)
    except:
        return response({'ok': False, 'error': 'Invalid JSON Req'})
    rep = recog_json(obj)
    return response(rep)


if __name__ == "__main__":
    main()

