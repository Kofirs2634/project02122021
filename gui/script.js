/**
 * @typedef Component
 * @property {string} id
 * @property {string} name
 */

;(async function() {
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
            listingEl.querySelector('.button').before(_t)
        })
    }

    /**
     * Хранилище компонентов
     * @type {Component[]}
     */
    const listing = []

    // открываем всплывающее окно (далее - модаль) по клику на кнопке
    // добавления компонента
    document.querySelector('#add-listing').addEventListener('click', () => {
        const modal = document.querySelector('#listing-modal')
        modal.classList.add('active')
        document.body.classList.add('shadowed')
    })

    // навешиваем обработку кликов на управляющие кнопки модалей
    document.querySelectorAll('.modal-controls button').forEach(el => el.addEventListener('click', event => {
        event.preventDefault()  // запрещаем перезагрузку формы модали
        const modal = event.target.parentElement.parentElement.parentElement
        const act = event.target.getAttribute('id').match(/\w+$/)[0]
        switch (act) {
            case 'cancel':  // кнопка "отмена"
                modal.querySelectorAll('input').forEach(e => e.value = '')
                modal.classList.remove('active')
                document.body.classList.remove('shadowed')
                break
            case 'confirm':  // кнопка "сохранить"
                if (modal.getAttribute('id').match(/listing/)) {
                    listing.push({
                        id: modal.querySelector('[id*="id"]').value,
                        name: modal.querySelector('[id*="name"]').value
                    })
                }
                modal.classList.remove('active')
                document.body.classList.remove('shadowed')
                updateListing()
                break
        }
    }))
})();
