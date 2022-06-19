from pathlib import Path
from itertools import cycle

from model import Label, get_label_file, Sheet
import config


def get_stem_list():
    if hasattr(config, 'stem_file'):
        with open(config.stem_file, mode='r', encoding='utf-8') as fp:
            # 去重排序
            return sorted(list(set(fp.read().split())))
    return []


class LabelExcel:
    COLORS = 'green red blue yellow'.split()
    TYPE_SUFFIX = '.txt'

    def __init__(self):
        self.marks = config.mark_list
        self.types = config.type_list
        self.work_type = config.work_type
        # 用来颜色匹配的
        color_cycle = cycle(self.COLORS)
        # mark|color 映射
        self.mark_color_map = {
            mark: next(color_cycle)
            for mark in self.marks
        }
        self.sheet_folder = Path(config.sheet_folder)
        # label的文件夹
        self.label_folder = Path(config.label_folder)
        # 类型存放文件夹
        self.type_folder = Path(config.type_folder)
        # 先排序一下再说
        self.sheet_files = sorted(
            file
            for file in self.sheet_folder.iterdir()
            # 后缀是xlsx
            if file.suffix == '.xlsx'
        )
        print('共读入文件：', len(self.sheet_files), '个')
        self.stem_list = get_stem_list() or [
            file.stem
            for file in self.sheet_files
        ]
        print('任务共有：', len(self.stem_list), '个')
        # 因为打算用stem当作id
        self.stem_file_map = {
            file.stem: file
            for file in self.sheet_files
        }
        # 用来寻找前一个后一个
        self.stem_index_map = {
            stem: i
            for i, stem in enumerate(self.stem_list)
        }
        self.now_stem = self.stem_list[0]
        self.file_num = len(self.stem_list)
        self.label = self.load_label(self.now_stem)

    def get_label_raw(self, stem):
        file = get_label_file(stem, folder=self.label_folder)
        if file.exists():
            with open(file, mode='r', encoding='utf-8') as fp:
                return fp.read()
        else:
            return ""

    def save_label(self):
        self.label.save_label(self.label_folder)

    def assert_box(self, box):
        if min(box[:4]) < 0:
            return False
        if box[4] not in self.marks:
            return False
        return True

    def assert_label(self, label: Label):
        flag = all(self.assert_box(box) for box in label.boxes)
        return flag

    def load_label(self, stem):
        label = Label(stem, set())
        file = get_label_file(stem, self.label_folder)
        if file.exists():
            label = Label.from_file(file)
        if not self.assert_label(label):
            raise KeyError(f'{label.get_filename()}这个文件有问题')
        return label

    def get_now_index(self):
        return self.stem_index_map[self.now_stem]

    def mod_index(self, index):
        return index % self.file_num

    def get_offset_stem(self, offset):
        now_index = self.stem_index_map[self.now_stem]
        offset_index = self.mod_index(now_index + offset)
        return self.stem_list[offset_index]

    def get_next_stem(self):
        return self.get_offset_stem(1)

    def get_last_stem(self):
        return self.get_offset_stem(-1)

    def get_now_sheet(self):
        file = self.stem_file_map[self.now_stem]
        return Sheet.from_file(file)

    def change_stem(self, stem):
        self.now_stem = stem
        self.label = self.load_label(stem)

    def save_type(self, type_name):
        file = self._get_type_file(type_name)
        # 每一行加一个回车哦
        with file.open(mode='a', encoding='utf-8') as fp:
            fp.write(f'{self.label.stem}\n')

    def _get_type_file(self, type_name):
        assert type_name in self.types
        type_file_name = f'{type_name}{self.TYPE_SUFFIX}'
        type_file = self.type_folder / type_file_name
        return type_file
