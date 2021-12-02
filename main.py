# блок функций-утилит
def write_component(item: int, amount: int) -> None:
    if item in components:
        components[item] += amount
    else:
        components[item] = amount

def find_children(parent: int) -> list:
    return list(filter(lambda e: e['parent'] == parent, contents))

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
components = {}

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
            subchildren = find_children(child['child'])
            if not len(list(subchildren)):
                write_component(child['child'], child['amount'])

for key in components:
    print(f'{key}\t{listing[key]}')

def handle_children(component: dict):
    children = find_children(component['child'])
    if not len(children):
        write_component(component['child'], component['amount'])
    else:
        for child in children:
            handle_children(child)