# table-target-detection-annotation
A table target detection annotation tools; 表格目标检测标注工具

### 安装依赖
```shell script
pip install -r requirements.txt
```

### 配置文件夹
```python
# excel文件存放位置
sheet_folder = r'D:\file\semantic\org\split'

# 标记文件存放位置，需要事先创建好
label_folder = r'D:\Users\180870\Desktop'

# 类型存放位置
type_folder = r'D:\Users\180870\Desktop'

# 标签
mark_list = [
    'tech',
    'sheet',
    'title'
]

# 分类类别
type_list = [
    'tech_split',
    'sheet_close',
    'sheet_split'
]

# 工作类型，type表示分类，mark表示标注
work_type = 'type'
# work_type = 'mark'

```

### 运行
```shell script
python server.py
```

### 开始干活
浏览器打开http://127.0.0.1:1212