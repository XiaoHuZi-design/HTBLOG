const swiper = new Swiper('.swiper', {
    effect: 'cards',
    grabCursor: true,
    loop: true,
    speed: 500,
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    keyboard: {
        enabled: true,
    },
});