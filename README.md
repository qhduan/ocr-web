

run

`docker run -p 8080:8080 -it --rm qhduan/tr`

try

`curl -F 'image=@imgs/web.png' http://localhost:8080/api/ocr`

python example

```python
import requests
import base64

with open('../tr/imgs/web.png', 'rb') as image:
    image_string = base64.b64encode(image.read()).decode('UTF-8')


r = requests.post('http://localhost:8080/api/ocr/base64', json={'image': image_string, 'ext': '.png'})
print(r.json())

```
