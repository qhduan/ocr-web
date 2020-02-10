
import os
import uuid
import base64
import multiprocessing
import traceback
import tr
from flask import Flask, request, jsonify
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


def tr_run(path, return_dict):
    try:
        return_dict['ret'] = tr.run(path)
    except:
        return_dict['ret'] = None


def get_result(path):
    manager = multiprocessing.Manager()
    return_dict = manager.dict()
    p = multiprocessing.Process(target=tr_run, args=(path, return_dict))
    p.start()
    p.join()
    print(return_dict)
    return return_dict['ret']


def recog(imgstr, ext='.png'):
    if not isinstance(imgstr, str) and len(imgstr) > 0:
        return jsonify(ok=False, error='Invalid Image: not string or too small')
    try:
        img = base64.b64decode(imgstr)
    except:
        return jsonify(ok=False, error='Invalid Image: not valid encode')
    path = '/tmp/'
    path += str(uuid.uuid4()) + ext
    with open(path, 'wb') as fp:
        fp.write(img)
    try:
        r = get_result(path)
        r = [{'x': int(a[0]), 'y': int(a[1]), 'w': int(a[2]), 'h': int(a[3]), 'text': b, 'c': c} for a, b, c in r]
        try:
            os.remove(path)
        except:
            pass
        return jsonify(ok=True, data=r)
    except:
        try:
            os.remove(path)
        except:
            pass
        traceback.print_exc()
        return jsonify(ok=False, error='Parse Error')


@app.route('/')
def hello():
    return 'OCR'


@app.route('/api/ocr', methods=['POST'])
def ocr():
    if 'image' not in request.files:
        return jsonify(ok=False, error='Image not in body')
    image = request.files['image']
    if not image.filename or '.' not in image.filename:
        return jsonify(ok=False, error='Invalid Image Ext')
    ext = '.' + image.filename.rsplit('.', 1)[1].lower()
    image_string = base64.b64encode(image.read()).decode('UTF-8')
    return recog(image_string, ext)


@app.route('/api/ocr/base64', methods=['POST'])
def ocr_base64():
    try:
        image = request.get_json(force=True)
        if not isinstance(image, dict) or not isinstance(image.get('image'), str):
            return jsonify(ok=False, error='Invalid Image')
        if not isinstance(image.get('ext'), str) or '.' not in image.get('ext'):
            return jsonify(ok=False, error='Invalid Image Ext')
        return recog(image.get('image'))
    except:
        return jsonify(ok=False, error='Invalid Image')

# $ env FLASK_APP=hello.py flask run
if __name__ == '__main__':
    from waitress import serve
    serve(app, host="0.0.0.0", port=8080)

