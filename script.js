addEventListener("paste", function(e) {
	e.preventDefault();
	const text = (e.originalEvent || e).clipboardData.getData('text/plain');
	document.execCommand("insertHTML", false, text);
})

class ListBox {
	constructor(list, mountElement, onChange = () => null, onDelete = () => null) {
		const { id, title, points } = {
			id: Math.random() * Date.now(),
			title: '',
			points: [''],
			...list
		}

		this._onChange = () => 0
		this.id = id
		this.title = title
		this.points = points
		if(mountElement) {
			const children = mountElement.children
			mountElement.insertBefore(this._createListBox(), children[children.length - 1])
		}
		this._onChange = onChange
		this._onDelete = onDelete
	}

	get title() { return this._title }
	set title(title) {
		this._title = title
		if(!this.titleElement) this._createTitle()

		if(this._title) this.titleElement.classList.add('list-box__title--dirty')
		else this.titleElement.classList.remove('list-box__title--dirty')

		if(this.titleElement.textContent !== this.title) {
			this.titleElement.textContent = this.title
		}

		this._onChange(this)
	}

	get points() { return this._points }
	set points(points) {
		if(!points.length) this.destroy()
		this._points = points
		if(!this.listElement) this._createList()
		const pointElements = [...this.listElement.children]
		const currentPoints = []
		pointElements.forEach(pointElement => {
			const point = pointElement.textContent.trim()
			currentPoints.push(point)
			if(point) pointElement.classList.add('list-box__list__item--dirty')
			else pointElement.classList.remove('list-box__list__item--dirty')
		})

		if(!_.isEqual(currentPoints, this._points)) {
			const pointElements = this._points.map(point => this._createPoint(point))
			this.listElement.replaceChildren(...pointElements)
		}

		this._onChange(this)
	}

	toObject() {
		if(!this.points.filter(point => !!point).length) return
		return _.pick(this, ['id', 'title', 'points'])
	}

	_createListBox() {
		const listBox = document.createElement('div')
		listBox.classList.add('list-box')

		listBox.appendChild(this.titleElement || this._createTitle())
		listBox.appendChild(this.listElement || this._createList())

		this.listBoxElement = listBox
		return listBox
	}

	_createTitle() {
		const title = document.createElement('h1')
		title.classList.add('list-box__title')
		title.setAttribute('contenteditable', '')
		title.addEventListener('input', e => this.title = e.target.textContent)
		title.addEventListener('paste', e => this.title = e.target.textContent)

		this.titleElement = title
		return title
	}

	_createList() {
		const list = document.createElement('ol')
		list.classList.add('list-box__list')
		list.setAttribute('contenteditable', '')
		list.addEventListener('input', e => {
			if(e.inputType === 'deleteContentBackward' && _.isEqual(this._points, [''])) this.points = [] // Firefox robi dziwne rzeczy 
			else this.points = [...e.target.children]
				.map(pointElement => pointElement.textContent)
		})

		this.listElement = list
		return list
	}

	_createPoint(text) {
		const pointElement = document.createElement('li')
		pointElement.classList.add('list-box__list__item')
		if(text) pointElement.classList.add('list-box__list__item--dirty')
		pointElement.textContent = text
		return pointElement
	}

	destroy() {
		this.listBoxElement.remove()
		this._onDelete(this)
	}
}

const defaultList = [
	{
		title: 'Lista prezentacyjna 📝',
		points: [
			'Strona dostosowuje się do motywu przeglądarki 🌖',
			'Wszystkie listy zapisywane są automatycznie',
			'Aby usunąć listę, wystarczy usunąć wszystkie punkty',
			'Wszystko dzieje się lokalnie. Nic nie jest wysyłane w chmurę 🔒',
			'Puste listy nie zostają zapisane',
			'Strona jest responsywna - nie ważne jak mały lub wielki ekran - twoje listy zawsze będą wyglądać świetnie 🌟',
			'Drukowanie nie zostało pominięte - drukujesz to co potrzeba.',
			// 'Wszystko jest reaktywne. Np po wpisaniu w konsoli "listBoxes[0].title = "Hello world!"" zmieni się tytuł tej listy'
		]
	},
	{
		title: 'Zakupy na obiad',
		points: [
			'Pomidory w puszce 🥫',
			'Oliwa z oliwek ',
			'Czosnek 🧄',
			'Makaron penne ',
			'Świeża bazylia 🌿',
			'Parmezan 🧀',
			'Suszone pomidory',
			'Pieprz niemielony',
			'Cebula 🧅'
		]
	}
]
const localStorageLists = JSON.parse(localStorage.getItem('lists'))
const lists = localStorageLists || defaultList

function saveLists() {
	const lists = listBoxes
		.map(listBox => listBox.toObject())
		.filter(list => !!list)

	localStorage.setItem('lists', JSON.stringify(lists))
}

function onListBoxDelete(deletedListBox) {
	listBoxes = listBoxes.filter(listBox => listBox.id !== deletedListBox.id)
	saveLists()
}

const listsElement = document.querySelector('#lists')
const addButton = document.querySelector('#lists__add__button')


if(localStorageLists) listsElement.scrollIntoView({ behavior: "smooth" })

addButton.addEventListener('click', e =>
	listBoxes.push(new ListBox(
		undefined,
		listsElement,
		saveLists,
		onListBoxDelete
	))
)

let listBoxes = []
listBoxes = lists.map(list =>
	new ListBox(
		list,
		listsElement,
		saveLists,
		onListBoxDelete
	)
)