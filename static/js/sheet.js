let first_r = -1
let first_c = -1
let second_r = -1
let second_c = -1
let mark = ''

let mark_color_map = new Map()
let mark_list = []

let type_list = []

let work_type = ''

let work_type_map = new Map()
work_type_map.set('mark', [mark_list, 'mk_'])
work_type_map.set('type', [type_list, 'type_add_'])

function set_mark(m) {
    mark = m
    document.getElementById('mark_show').innerText = mark
    msg_info('类别：' + m)
}

function reset() {
    first_r = -1
    first_c = -1
    second_r = -1
    second_c = -1
    mark = ''
    document.getElementById('first_show').innerText = ''
    document.getElementById('second_show').innerText = ''
    document.getElementById('mark_show').innerText = ''
}

async function press(r, c) {
    if (mark !== '') { //说明点了个mark
        if (first_r !== -1) {//说明点了第一次，这是第二次
            second_r = r
            second_c = c
            document.getElementById('second_show').innerText = '' + r + ' ' + c
            msg_info('第二次点击' + r + ' ' + c)
            await add_box()
            //重置所有参数
            reset()
        } else {//这是第一次点击
            first_r = r
            first_c = c
            document.getElementById('first_show').innerText = '' + r + ' ' + c
            msg_info('第一次点击' + r + ' ' + c)
        }

    }
}

async function add_box() {
    let y = first_r
    let x = first_c
    //加一是因为算上边界了，例如两次点同一个格子，那么高度肯定是1，不是0
    let h = second_r - first_r + 1
    let w = second_c - first_c + 1
    if (h < 0 || w < 0 || mark === '') {
        alert('出问题了')
    }

    let url = '/add/' + y + '/' + x + '/' + h + '/' + w + '/' + mark
    let response = await fetch(url)
    if (response.ok) {
        let color = mark_color_map.get(mark)
        draw_box(y, x, h, w, color)
        add_box_tr_bom(y, x, h, w, mark)
        msg_ok('添加')
    } else {
        msg_error('添加')
        alert(await response.text())
    }


}

function draw_box(y, x, h, w, color) {
    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            let rx = y + i
            let cx = x + j
            let bt_id = 'bt_' + rx + '_' + cx
            let bt_bom = document.getElementById(bt_id)
            bt_bom.style.background = color
        }
    }
}

async function delete_box(y, x, h, w, mark) {
    let url = '/delete/' + y + '/' + x + '/' + h + '/' + w + '/' + mark
    let response = await fetch(url)
    if (response.ok) {
        //删除颜色
        draw_box(y, x, h, w, '')
        let box_id = 'box_' + y + '_' + x + '_' + h + '_' + w + '_' + mark
        let box_bom = document.getElementById(box_id)
        //自我删除
        box_bom.remove()
        msg_ok('删除')
    } else {
        msg_error('删除')
        alert(await response.text())
    }

}

function add_box_tr_bom(y, x, h, w, mark) {
    let tr = document.createElement('tr')
    tr.setAttribute('id', 'box_' + y + '_' + x + '_' + h + '_' + w + '_' + mark)

    //闪烁按钮
    let td_1 = document.createElement('td')
    let bt_flash = document.createElement('button')
    bt_flash.setAttribute('onclick', 'let_box_flash(' + y + ',' + x + ',' + h + ',' + w + ')')
    bt_flash.innerText = mark
    td_1.appendChild(bt_flash)
    tr.appendChild(td_1)

    //删除按钮
    let td_2 = document.createElement('td')
    tr.appendChild(td_2)
    let bt_delete = document.createElement('button')
    td_2.appendChild(bt_delete)
    bt_delete.setAttribute('onclick', 'delete_box(' + y + ',' + x + ',' + h + ',' + w + ',"' + mark + '")')
    bt_delete.innerText = 'delete'

    let tbody = document.getElementById('mark_tbody')
    tbody.appendChild(tr)
}

function let_box_flash(y, x, h, w) {
    let first_bt_id = 'bt_' + y + '_' + x
    let first_bt_bom = document.getElementById(first_bt_id)
    let org_color = first_bt_bom.style.background
    let no_color = ''

    function org() {
        draw_box(y, x, h, w, org_color)

    }

    function flash() {
        draw_box(y, x, h, w, no_color)

    }

    let t = 1
    for (let i = 0; i < 5; i++) {
        setTimeout(flash, 100 * (t++))
        setTimeout(org, 100 * (t++))
    }
    msg_info('闪烁')
}

let one_to_nine_str = new Set()
for (let i = 1; i <= 9; i++) {
    let s = i.toString()
    one_to_nine_str.add(s)
}

document.addEventListener('keydown', async (e) => {
    //按下的是数字
    if (one_to_nine_str.has(e.key)) {
        let index = parseInt(e.key) - 1
        let work_list = work_type_map.get(work_type)[0]
        let prefix = work_type_map.get(work_type)[1]
        if (index < work_list.length) {
            let wk = work_list[index]
            let wk_id = prefix + wk
            let wk_bom = document.getElementById(wk_id)
            wk_bom.click()
        }
    } else if (e.key === ' ' || e.key === 'ArrowRight') {
        let next_dom = document.getElementById('next_a')
        next_dom.click()
    } else if (e.key === 'ArrowLeft') {
        let next_dom = document.getElementById('last_a')
        next_dom.click()
    } else if (e.key === 'e') {
        let url = '/save'
        let response = await fetch(url)
        if (response.ok) {
            msg_ok('保存')
        } else {
            msg_error('保存')
        }
    }
})

function msg_ok(msg) {
    let dom = document.getElementById('msg')
    dom.innerText = msg + '成功'
    dom.style.background = 'green'
}

function msg_error(msg) {
    let dom = document.getElementById('msg')
    dom.innerText = msg + '失败'
    dom.style.background = 'red'
}

function msg_info(msg) {
    let dom = document.getElementById('msg')
    dom.innerText = msg
    dom.style.background = 'yellow'
}

