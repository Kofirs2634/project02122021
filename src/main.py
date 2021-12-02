# блок функций-утилит
def write_component(item: int, amount: int) -> None:
    if item in result:
        result[item] += amount
    else:
        result[item] = amount

def find_children(parent: int) -> list:
    return list(filter(lambda e: e['parent'] == parent, contents))

def handle_children(component: dict, multiplier: int):
    children = find_children(component['child'])
    if not len(children):
        write_component(component['child'], component['amount'] * multiplier)
    else:
        for child in children:
            handle_children(child, component['amount'] * multiplier)

# читаем нужные файлы и собираем данные
listing = {}
contents = []

for listing_line in open('listing.txt').read().split('\n'):
    p = listing_line.split('\t')
    listing[int(p[0])] = p[1]

for contents_line in open('contents.txt').read().split('\n'):
    p = list(map(int, contents_line.split(' ')))
    contents.append(dict(zip(['parent', 'child', 'amount'], p)))

# сюда будем собирать данные
result = {}

# начинаем читать заказ
for order_line in open('order.txt').readlines():
    p = dict(zip(
        ['parent', 'amount'],
        map(int, order_line.replace('\n', '').split(' '))
    ))

    # проверяем, разбирается ли этот элемент
    children = find_children(p['parent'])
    if not len(children):
        write_component(p['parent'], p['amount'])
    else:
        for child in children:
            handle_children(child, p['amount'])

# вывести результаты в файлик
results_file = open('result.txt', encoding='utf-8', mode='w+')
for key in result:
    #results_file.write(f'{key}\t{listing[key]}\t{result[key]}\n')
    results_file.write(f'{listing[key]} - {result[key]} шт.\n')
results_file.close()

# номер \t название \t общее количество