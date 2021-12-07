/**
 * @typedef Component
 * @property {string} id
 * @property {string} name
 */

 /**
  * @typedef OrderItem
  * @property {string} id
  * @property {number} amount
  */

;(function() {
    /**
     * Обновляет список компонентов
     */
    function updateListing() {
        const listingEl = document.querySelector('.listing')
        listingEl.querySelectorAll('.item').forEach(e => e.remove())

        listing.forEach(e => {
            const _t = document.querySelector('#listing-item').content.cloneNode(true)
            _t.querySelector('.listing-id').innerText = e.id
            _t.querySelector('.listing-name').innerText = e.name

            _t.querySelector('.item').addEventListener('click', event => {
                // клик по записи - изменить, shift + клик - удалить
                if (!event.shiftKey) {
                    const modal = openModal('#listing-modal')
                    modal.querySelector('#listing-modal-id').value = e.id
                    modal.querySelector('#listing-modal-name').value = e.name
                    modal.setAttribute('action', 'edit')
                    modal.setAttribute('oid', e.id)
                } else {
                    listing = removeListEntry(event.target, listing, e.id)
                    updateListing()
                    updateOrder()
                }
            })
            listingEl.querySelector('.button').before(_t)
        })
    }

    /**
     * Обновляет список заказа
     */
    function updateOrder() {
        const orderEl = document.querySelector('.order')
        orderEl.querySelectorAll('.item').forEach(e => e.remove())

        order.forEach(e => {
            const _t = document.querySelector('#order-item').content.cloneNode(true)
            _t.querySelector('.order-name').innerText = listing.find(f => f.id == e.id).name
            _t.querySelector('.order-amount').innerText = `(${e.amount} шт.)`
            _t.querySelector('.item').addEventListener('click', event => {
                if (event.shiftKey) {
                    order = removeListEntry(event.target, order, e.id)
                    updateOrder()
                }
            })
            orderEl.querySelector('.button').before(_t)
        })
    }

    /**
     * Удаляет запись из списка при клике на нее
     * @param {EventTarget} target Цель клика
     * @param {Component[]|OrderItem[]} list Список, который непосредственно обновляется
     * @param {string} id Идентификатор ассоциированного элемента
     * @returns Обновленный список
     */
    function removeListEntry(target, list, id) {
        // тут есть МАГИЧЕСКИЙ прикол, когда таргетом назначается дочерний элемент записи
        if (target instanceof HTMLDivElement)
            target.remove()
        else target.parentElement.remove()

        if (list == listing) listing = listing.filter(f => f.id != id)
        order = order.filter(f => f.id != id)
        toggleButtons()

        return list.filter(f => f.id != id)
    }

    /**
     * Открывает указанную модаль
     * @param {string} selector Селектор элемента модали
     * @returns Указанная модаль для дальнейшего взаимодейтвия с ней
     */
    function openModal(selector) {
        const modal = document.querySelector(selector)
        modal.classList.add('active')
        modal.setAttribute('action', 'new')
        document.body.classList.add('shadowed')
        return modal
    }

    /**
     * Закрывает указанную модаль
     * @param {HTMLDivElement} modal Элемент модали
     */
    function closeModal(modal) {
        modal.removeAttribute('action')
        modal.querySelectorAll('input').forEach(e => e.value = e.getAttribute('value') ?? '')
        modal.querySelectorAll('option').forEach(e => e.remove())
        modal.classList.remove('active')
        document.body.classList.remove('shadowed')
    }

    /**
     * Управляет взаимодействием с локальным хранилищем
     * @param {'write'|'read'} action Действие с хранилищем. `write` записывает
     *   данные, `read` - считывает из данной ячейки
     * @param {string=} item Название ячейки хранилища, которую нужно считать. При
     *   `action = 'write'` не требуется
     * @returns При `action = 'read'` - считанный объект с данными
     * @throws Ошибка аргумента, если `action != 'write|read'`
     */
    function interactLC(action, item) {
        switch (action) {
            case 'write':
                window.localStorage.setItem('listing', JSON.stringify(listing))
                window.localStorage.setItem('order', JSON.stringify(order))
                break
            case 'read':
                return JSON.parse(window.localStorage.getItem(item))
            default: throw new RangeError(`action '${action}' is invalid!`)
        }
    }

    /**
     * Активирует или деактивирует кнопки состава и заказа
     */
    function toggleButtons() {
        const addRelationBtn = document.querySelector('#add-relation')
        const addOrderBtn = document.querySelector('#add-order')
        if (!listing.length) {
            addRelationBtn.setAttribute('disabled', '')
            addOrderBtn.setAttribute('disabled', '')
        } else {
            addRelationBtn.removeAttribute('disabled')
            addOrderBtn.removeAttribute('disabled')
        }
    }

    /**
     * Задает функционал управляющим кнопкам модали
     * @param {MouseEvent} event Событие клика по кнопкам
     */
    function handleModalControls(event) {
        event.preventDefault()  // запрещаем перезагрузку формы модали
        /** @type {HTMLDivElement} */
        const modal = event.target.parentElement.parentElement.parentElement
        const modalId = modal.getAttribute('id').match(/^\w+/)[0]
        const button = event.target.getAttribute('id').match(/\w+$/)[0]
        const action = modal.getAttribute('action')
        switch (button) {
            case 'cancel':  // кнопка "отмена"
                closeModal(modal)
                break
            case 'confirm':  // кнопка "сохранить"
                switch (modalId) {
                    case 'listing': {  // запись в листинг
                        const obj = {
                            id: modal.querySelector('[id*="id"]').value,
                            name: modal.querySelector('[id*="name"]').value
                        }
                        if (action == 'new') listing.push(obj)
                        else if (action == 'edit') {
                            listing = listing.filter(e => e.id != modal.getAttribute('oid'))
                            listing.push(obj)
                        }
                        break
                    }
                    case 'order': {  // запись в заказ
                        const obj = {
                            id: modal.querySelector('[id*="name"]').value,
                            amount: parseInt(modal.querySelector('[id*="amount"]').value)
                        }
                        const exist = order.find(e => e.id == obj.id)
                        if (exist) exist.amount += obj.amount
                        else order.push(obj)
                        break
                    }
                }
                closeModal(modal)
                updateListing()
                updateOrder()
                toggleButtons()
                break
        }
    }


    // создаем хранилища списков
    /** @type {Component[]} */
    var listing = interactLC('read', 'listing') ?? []
    /** @type {OrderItem[]} */
    var order = interactLC('read', 'order') ?? []

    // отрисовываем данные из локалсторейджа, если они есть
    updateListing()
    updateOrder()
    toggleButtons()

    // открываем всплывающее окно (далее - модаль) по клику на кнопке
    // добавления компонента
    document.querySelector('#add-listing').addEventListener('click', () => {
        openModal('#listing-modal')
    })

    // открываем модаль добавления в заказ
    document.querySelector('#add-order').addEventListener('click', () => {
        const modal = openModal('#order-modal')

        // вот это вот у нас заполнение дропдауна во избежание
        // цирка с конями со стороны юзера
        listing.forEach(e => {
            const _t = document.createElement('option')
            _t.setAttribute('value', e.id)
            _t.innerText = e.name
            modal.querySelector('#order-item-name').append(_t)
        })
    })

    // навешиваем обработку кликов на управляющие кнопки модалей
    document.querySelectorAll('.modal-controls button').forEach(el => el.addEventListener('click', handleModalControls))

    document.body.addEventListener('keydown', e => {
        if (e.code == 'KeyD') {
            console.log(listing, order)
        } else if (e.code == 'KeyS') {
            interactLC('write')
        }
    })
})();
