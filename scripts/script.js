


//получаем все необходимые элементы
const searchLink = document.querySelector('.search__link .icon-reg'),//иконка поиска
    mainContent = document.querySelector('.main__content'),//основной див для вывода инфы о фильмах
    mainClose = document.querySelectorAll('.main__close'),//кнопка для закрытия дива инфы о фильмах
    mainBlock = document.querySelector('.main__block'),//див для вывода результатов поиска
    moviesLink = document.querySelectorAll('.movies__link'),//кнопка movies
    movieSolo = document.querySelector('.main__solo'),//див для инфы о единичном фильме
    formMain = document.querySelector('.form__main'),//форма поиска
    formInput = document.querySelector('input'),//поисковой запрос
    anime = document.querySelector('.anime'),//прелодер
    pagination = document.querySelector('.pagination'),//пагинация для результатов поиска
    headerBtn = document.querySelector('.header__btn'),//кнопка открытия меню
    headerAbs = document.querySelector('.header__abs'),//темная область при открытом меню
    headerItems = document.querySelector('.header__items');//боковое меню

//открытие и закрытие бокового меню

headerBtn.addEventListener('click', function(e){
    e.preventDefault();
    if(!this.classList.contains('active')){
        this.classList.add('active');
        headerItems.classList.add('active');
        headerAbs.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    else{
        this.classList.remove('active');
        headerItems.classList.remove('active');
        headerAbs.classList.remove('active');
        document.body.style.overflow = '';
    }
});
//закрытие при клике на темную область
headerAbs.addEventListener('click', function(e){
    e.preventDefault();
    this.classList.remove('active');
    headerItems.classList.remove('active');
    headerBtn.classList.remove('active');
    document.body.style.overflow = '';
});

function openMainBlock(e){
    e.preventDefault();
    mainContent.classList.add('active');
    document.body.style.overflow = 'hidden';
};
searchLink.addEventListener('click', openMainBlock);
moviesLink.forEach(item => item.addEventListener('click', openMainBlock));
mainClose.forEach(item => {
    item.addEventListener('click', function(e){
        e.preventDefault();
        mainContent.classList.remove('active');
        document.body.style.overflow = '';
    });
})
const host = 'https://kinopoiskapiunofficial.tech';
const hostName = 'X-API-KEY';
const hostValue = '8566ffd8-9f4a-4a44-bb2c-e0b2c022cadd';

// главный класс где хранятся все запросы

class Kino{
    constructor(){
        this.date = new Date().getMonth();
        this.curYear = new Date().getFullYear();
        this.months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        this.curMonth = this.months[this.date];
    }
    fOpen = async (url) => {
        let res = await fetch(url, {
            headers: {
                [hostName]: hostValue
            }
        });
        if(res.ok) return res.json();
        else throw new Error(`Cannot access to ${url}`);
    }
    getTopMovies = (page = 1) => this.fOpen(`${host}/api/v2.2/films/top?type=TOP_250_BEST_FILMS&page=${page}`);
    getSoloFilm = (id) => this.fOpen(`${host}/api/v2.1/films/${id}`);
    getMostAwaited = (page = 1, year = this.curYear, month = this.curMonth) => this.fOpen(`${host}/api/v2.1/films/releases?year=${year}&month=${month}&page=${page}`);
    getFrames = (id) => this.fOpen(`${host}/api/v2.2/films/${id}/images?type=STILL&page=1`);
    getReviews = (id) => this.fOpen(`${host}/api/v2.2/films/${id}/reviews?page=1&order=DATE_DESC`);
    getSearch = (page = 1, keyword) => this.fOpen(`${host}/api/v2.1/films/search-by-keyword?keyword=${keyword}&page=${page}`);
};


const db = new Kino();

function renderTrendMovies(element = [], fn = [], films = [], params= []){
    anime.classList.add('active');
    element.forEach((item, i) => {
        let parent = document.querySelector(`${item} .swiper-wrapper`);
        db[fn[i]](params[i]).then(data => {
            data[films[i]].forEach(elem => {
                let slide = document.createElement('div');
                slide.classList.add('swiper-slide');
                slide.innerHTML = `
                    <div class="movie__item" data-id="${elem.filmId}">
                        <img src="${elem.posterUrlPreview}" alt="${elem.nameRu || elem.nameEn}" loading="lazy">
                    </div>
                `;
                parent.append(slide);
            });
           
        })
        .then(() => {
            element.forEach(item => {
               new Swiper(`${item}`, {
                    slidesPerView: 1,
                    spaceBetween: 27,
                    // slidesPerGroup: 3,
                    loop: true,
                    // loopFillGroupWithBlank: true,
                    navigation: {
                        nextEl: `${item} .swiper-button-next`,
                        prevEl: `${item} .swiper-button-prev`,
                    },
                    breakpoints: {
                        1440: {
                            slidesPerView: 6,
                        },
                        1200: {
                            slidesPerView: 5,
                        },
                        960: {
                            slidesPerView: 4,
                        },
                        720: {
                            slidesPerView: 3,
                        },
                        500: {
                            slidesPerView: 2,
                        },
                    }
                });
            })
            let pages = 13;
            let rand = Math.floor(Math.random() * pages + 1);
            renderHeader(rand);
            let m = document.querySelectorAll('.movie__item');
            m.forEach(item => {
                item.addEventListener('click', function(e){
                    let attr = this.getAttribute('data-id');
                    openMainBlock(e);
                    renderSolo(attr);
                })
            })
        })
        .catch(e => {
            console.log(e);
            anime.classList.remove('active');
        })
    })
}
renderTrendMovies(['.trend__tv-slider', '.popular__actors-slider'], ['getTopMovies', 'getMostAwaited'], ['films', 'releases'], [1,1]);


function renderHeader (page){
    db.getTopMovies(page).then(res => {
        anime.classList.add('active');
        let max = Math.floor(Math.random() * res.films.length);
        let filmId = res.films[max].filmId;
        let filmRating = res.films[max].rating;
        db.getSoloFilm(filmId).then(response => {
            let sm = response.data;
            let headerText = document.querySelector('.header__text');
            let url = sm.webUrl.split('www.').join('gg');
            headerText.innerHTML = `
                <h1 class="header__title">${sm.nameRu || sm.nameEn}</h1>
                <div class="header__balls">
                    <span class="header__year">${sm.year}</span>
                    <span class="logo__span header__rating  header__year ">${sm.ratingAgeLimits}+</span>
                    <div class="header__seasons header__year">${sm.seasons.length}</div>
                    <div class="header__stars header__year"><span class="icon-solid"></span><strong>${filmRating}</strong></div>
                </div>
                <p class="header__descr">
                   ${sm.description}
                </p>
                <div class="header__buttons">
                    <a href="${url}" class="header__watch"><span class="icon-solid"></span>watch</a>
                    <a href="#" class="header__more header__watch movie__item" data-id="${sm.filmId}">More information</a>
                </div>
            `;
        })
        .then(() => {
            anime.classList.remove('active');
            let headerMore = document.querySelector('.header__more');
            headerMore.addEventListener('click', function(e){
                e.preventDefault();
                let attr = this.getAttribute('data-id');
                openMainBlock(e);
                renderSolo(attr);
            })
        })
        .catch(e => {
            console.log(e);
            anime.classList.remove('active');
        })
    })
    .catch(e => {
        console.log(e);
        anime.classList.remove('active');
    })
}

const popularActorsTitle = document.querySelector('.popular__actors-title strong'),
      popularYear = document.querySelector('.year'),
      popularSoonPoster = document.querySelector('.coming__soon-block > img');
popularActorsTitle.textContent = `${db.curMonth} ${db.curYear}`;
popularYear.textContent = db.curYear;
db.getTopMovies(2).then(res => {
    let random = Math.floor(Math.random() * res.films.length);
    popularSoonPoster.src = res.films[random].posterUrlPreview;
});


async function renderSolo(id){
    mainBlock.innerHTML = '';
    pagination.innerHTML = '';
    anime.classList.add('active');
    (async function(){
        const [reviews, frames, solo] = await Promise.all([
            db.getReviews(id),
            db.getFrames(id),
            db.getSoloFilm(id)            
        ]);
        return {reviews, frames, solo};
    }())
    .then(res => {
        let solo = res.solo.data;
        let genres = solo.genres.reduce((acc, item) => acc + `${item.genre} `, '');
        let countries = solo.countries.reduce((acc, item) => acc + `${item.country} `, '');
        let facts = '';
        let reviews = '';
        let frames = '';
        solo.facts.forEach((item, i) => {
            if(i < 10) facts += `<li class="solo__facts">${i+1}: ${item}</li>`;
        });
        res.frames.items.forEach((item, i) => {
            if(i < 10) frames += `<img src="${item.previewUrl}" alt="" loading="lazy">`
        });
        res.reviews.items.forEach((item, i) => {
            if(i < 10) {
                reviews += `
                    <div class="review__item">
                        <span>${item.author}</span>
                        <p class="review__descr">${item.description}</p>
                    </div>
                `;
            }
        });
        let link = solo.webUrl.split('www.').join('gg');
        let div = `
        <div class="solo__img">
            <img src="${solo.posterUrlPreview}" alt="${solo.nameRu || solo.nameEn}">
            <a href="${link}" class="solo__link header__watch">Смотреть фильм</a>
        </div>
        <div class="solo__content">
            <h3 class="trend__tv-title solo__title">${solo.nameRu || solo.nameEn}</h3>
            <ul>
                <li class="solo__countries">Страны: ${countries}</li>
                <li class="solo__genres">Жанры: ${genres}</li>
                <li class="solo__dur">Продолжительность: ${solo.filmLength || ''}</li>
                <li class="solo__year">Год: ${solo.year || ''}</li>
                <li class="solo__premiere">Мировая премьера: ${solo.premiereWorld || ''}</li>
                <li class="solo__rating">Возрастной рейтинг: ${solo.ratingAgeLimits || ''}</li>
                <li class="solo__slogan">Слоган: ${solo.slogan || ''}</li>
                <li class="solo__descr">Описание: ${solo.description || ''}</li>
            </ul>
        </div>
        <ul class="solo__facts">
            <h3 class="trend__tv-title">Интересеные факты</h3>
            ${facts}
        </ul>
        <h3 class="trend__tv-title solo__title2">Кадры из фильма</h3>
        <div class="solo__images">
            ${frames}
        </div>
        <div class="solo__reviews">
            <h3 class="trend__tv-title solo__title2">Отзывы</h3>
            ${reviews}
        </div>
        `;
        movieSolo.innerHTML = div;
        anime.classList.remove('active');
    })
    .catch(e => {
        console.log(e);
        anime.classList.remove('active');
    })
}
function renderPagination(cur=1, len){
    pagination.innerHTML = '';
    let ul = document.createElement('ul');
    ul.classList.add('header__list');
    let list = len < 14 ? len : 14;
    for (let i = 1; i <= list; i++) {
      let li = document.createElement('li');
      li.innerHTML = `<a href="#" data-page="${i}" class="pagination__link ${cur == i ? 'active' : ''}">${i}</a>`;
      ul.append(li);
    }
    pagination.append(ul);
}
function clickPagination(val, fn){
    let links = document.querySelectorAll('.pagination__link');
    links.forEach(item => {
        item.addEventListener('click', function(e){
            e.preventDefault();
            let dataPage = this.getAttribute('data-page');
            renderCards(dataPage, val, fn);
        })
    })
}
function renderCards(page=1, se='', fn = 'getTopMovies') {
    mainBlock.innerHTML = '';
    movieSolo.innerHTML = '';
    db[fn](page, se).then(data => {
        if(data.films.length > 0){
            data.films.forEach(item => {
                let someItem = document.createElement('div');
                someItem.classList.add('some__item');
                someItem.innerHTML = `
                    <div class="some__img">
                        <img src="${item.posterUrlPreview}" alt="${item.nameRu || item.nameEn}" loading="lazy">
                        <span class="some__rating">${item.rating || 0}</span>
                    </div>
                    <h3 class="some__title">${item.nameRu || item.nameEn}</h3>
                `;
                someItem.setAttribute('data-id', item.filmId);
                mainBlock.append(someItem);
            });
            renderPagination(page, data.pagesCount);
        }
        else {
            pagination.innerHTML = '';
            mainBlock.innerHTML = `<p class="undefined">Ничего не найдено</p>`;
        }
    })
    .then(() => {
        let film = document.querySelectorAll('.some__item');
        film.forEach(item => {
            item.addEventListener('click', function(){
                let attr = this.getAttribute('data-id');
                renderSolo(attr);
            })
        })
        clickPagination(se, fn);
        anime.classList.remove('active');
    })
    .catch(e => {
        console.log(e);
        anime.classList.remove('active');
    })
}

formMain.addEventListener('submit', function(e){
    e.preventDefault();
    anime.classList.add('active');
    renderCards(1, formInput.value, 'getSearch');
});