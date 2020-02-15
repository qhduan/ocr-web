import os
import uuid
import base64
import multiprocessing
import traceback

from contextlib import contextmanager
import sys, os

@contextmanager
def suppress_stdout():
    with open(os.devnull, "w") as devnull:
        old_stdout = sys.stdout
        sys.stdout = devnull
        try:  
            yield
        finally:
            sys.stdout = old_stdout


with suppress_stdout():
    import tr


def recog(imgstr, ext='.png'):
    if not isinstance(imgstr, str) and len(imgstr) > 0:
        return {'ok': False, 'error': 'Invalid Image: not string or too small'}
    try:
        img = base64.b64decode(imgstr)
    except:
        return {'ok': False, 'error': 'Invalid Image: not valid encode'}
    path = '/tmp/'
    path += str(uuid.uuid4()) + ext
    with open(path, 'wb') as fp:
        fp.write(img)
    try:
        r = tr.run(path)
        r = [
            {'x': int(a[0]), 'y': int(a[1]), 'w': int(a[2]), 'h': int(a[3]), 'text': b, 'c': c}
            for a, b, c in r]
        try:
            os.remove(path)
        except:
            pass
        return {'ok': True, 'data': r}
    except:
        try:
            os.remove(path)
        except:
            pass
        traceback.print_exc()
    return {'ok': False, 'error': 'Parse Error'}


def recog_json(image):
    if not isinstance(image, dict) or not isinstance(image.get('image'), str):
        return {'ok': False, 'error': 'Invalid Image'}
    if not isinstance(image.get('ext'), str) or '.' not in image.get('ext'):
        return {'ok': False, 'error': 'Invalid Image Ext'}
    return recog(image.get('image'))
