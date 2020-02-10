FROM python:3.6
COPY ./requirements.txt /root/requirements.txt
RUN pip install -r /root/requirements.txt
RUN git clone https://github.com/qhduan/tr.git /tr
WORKDIR /tr
RUN cat /tr/libtorch/lib/libtorch.so.part.* > /tr/libtorch/lib/libtorch.so
RUN cp -r /tr/libtorch /usr/lib/
COPY ./app.py /tr/
CMD python app.py
