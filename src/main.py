# блок функций-утилит
def write_component(item: int, amount: int):
    """Записывает компонент в словарь с результатами. \n
    `item` — номер компонента \n
    `amount` — количество этого компонента к записи"""

    if item in result:  # компонент уже записан
        result[item] += amount
    else:
        result[item] = amount


def find_children(parent: int) -> list:
    """Ищет компоненты, составляющие данный, и возвращает их список. \n
    `parent` — номер родительского компонента"""

    return list(filter(lambda e: e['parent'] == parent, contents))


def handle_children(component: dict, multiplier: int):
    """Рекурсивно обрабатывает все компоненты, составляющие данный. \n
    `component` — словарь, описывающий отношение для данного компонента \n
    `multiplier` — множитель элементов от родителя. Нужен для правильного подсчета"""

    children = find_children(component['child'])
    if not len(children):  # компонент элементарный
        write_component(component['child'], component['amount'] * multiplier)
    else:  # уходим на уровень ниже
        for child in children:
            handle_children(child, component['amount'] * multiplier)


# читаем нужные файлы и собираем данные
listing = {}   # соотнесение номера и названия компонента
contents = []  # отношения между родительскими и дочерними компонентами

# преобразуем строки, разделенные табуляцией, в словарь вида
# { [номер]: [название] }
for listing_line in open('src/listing.txt').read().split('\n'):
    p = listing_line.split('\t')
    listing[int(p[0])] = p[1]

# задаем отношения компонентов, преобразуя строки, разделенные пробелами,
# в список словарей вида
# { "parent": [компонент], "child": [потомок], "amount": [кол-во потомков] }
for contents_line in open('src/contents.txt').read().split('\n'):
    p = list(map(int, contents_line.split(' ')))
    contents.append(dict(zip(['parent', 'child', 'amount'], p)))

# сюда будем собирать данные в формате { [номер]: [количество] }
result = {}

# начинаем читать заказ
for order_line in open('src/order.txt').readlines():
    # каждую строку преобразуем в словарь вида
    # { "parent": [компонент], "amount": [количество] }
    p = dict(zip(
        ['parent', 'amount'],
        map(int, order_line.replace('\n', '').split(' '))
    ))

    # проверяем, составной ли этот компонент
    # (т. е. в `contents` есть такое отношение, где "parent" - идентефикатор
    # данного компонента)
    children = find_children(p['parent'])
    if not len(children):  # компонент элементарен, пишем в результаты
        write_component(p['parent'], p['amount'])
    else:  # обрабатываем потомков первого уровня
        for child in children:
            handle_children(child, p['amount'])

# выводим результаты в файлик
# если его еще нет, он будет создан
results_file = open('src/result.txt', encoding='utf-8', mode='w+')

# каждую пару { [номер]: [количество] } превращаем в строку вида
# [название компонента] - [количество] шт.
# и пишем в файл
for key in result:
    results_file.write(f'{listing[key]} - {result[key]} шт.\n')

results_file.close()  # не забываем сохраниться
