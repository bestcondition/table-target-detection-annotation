from collections import deque

from flask import Flask, render_template, redirect

import config
from label_excel import LabelExcel
from model import Box, get_label_file

app = Flask(__name__)

le = LabelExcel()


@app.route('/')
def index():
    return redirect(f'/sheet/{le.now_stem}')


@app.route('/sheet/<stem>')
def show_sheet(stem):
    le.change_stem(stem)
    sheet = le.get_now_sheet()
    return render_template(
        'sheet.html',
        sheet=sheet,
        le=le
    )


@app.route('/<method>/<int:y>/<int:x>/<int:h>/<int:w>/<mark>')
def op_box(method, y, x, h, w, mark):
    try:
        box = Box(y, x, h, w, mark)
        if not le.assert_box(box):
            raise KeyError(f'{box}有问题！')
        if method == 'add':
            add_box(box)
        elif method == "delete":
            delete_box(box)
        else:
            raise KeyError(f'{method} is not exist')
        return 'ok'
    except BaseException as e:
        return str(e), 403


def add_box(box):
    boxes = le.label.boxes
    if box in boxes:
        raise KeyError(f'{box} exist! no need add again!')
    boxes.add(box)
    le.save_label()


def delete_box(box):
    boxes = le.label.boxes
    if box not in boxes:
        raise KeyError(f'{box} not exist! no way to delete!')
    boxes.remove(box)
    le.save_label()


@app.route('/preview')
def preview():
    file_info_list = deque()
    for stem in le.stem_list:
        file = get_label_file(stem, le.label_folder)
        _index = le.stem_index_map[stem]
        exist = file.is_file()
        file_info_list.append((_index, stem, exist))
    return render_template('preview.html', info=file_info_list)


@app.route('/detail/<stem>')
def detail(stem):
    raw_text = le.get_label_raw(stem)
    return raw_text


@app.route('/save')
def save():
    le.save_label()
    return 'ok'


@app.route('/add_type/<type_name>')
def add_type(type_name):
    le.save_type(type_name)
    return 'ok'


app.run(host=config.host, port=config.port)
