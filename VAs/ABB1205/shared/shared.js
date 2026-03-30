/* =========================================================
   ENVIRONMENT & EVENT TYPE
========================================================= */
const TOUCH_EVENT =
	"ontouchend" in document.documentElement
		? "touchend"
		: window.navigator.pointerEnabled
			? "pointerup"
			: "click";

const IS_VEEVA =
	/iP(hone|ad)/i.test(navigator.userAgent) ||
	/Veeva/i.test(navigator.userAgent);

window.IS_VEEVA = IS_VEEVA;

console.log("Veeva presentation:", IS_VEEVA);

/* =========================================================
   SCALE
========================================================= */
function adjustScale() {
	const content = document.getElementById("content");
	if (!content) return;

	// Atualizado para as dimensões da sua imagem
	const BASE_WIDTH = 2360;
	const BASE_HEIGHT = 1640;

	// Calcula a proporção ideal para caber na tela sem cortar
	const scale = Math.min(
		window.innerWidth / BASE_WIDTH,
		window.innerHeight / BASE_HEIGHT,
	);

	// Aplica o redimensionamento
	content.style.transform = `scale(${scale})`;
	content.style.transformOrigin = "top left";
	content.style.position = "absolute";

	// Centralização matemática precisa:
	// (Largura da Janela - Largura Real Ocupada) / 2
	const leftPos = (window.innerWidth - BASE_WIDTH * scale) / 2;
	const topPos = (window.innerHeight - BASE_HEIGHT * scale) / 2;

	content.style.left = `${leftPos}px`;
	content.style.top = `${topPos}px`;
}

window.addEventListener("load", adjustScale);
window.addEventListener("resize", adjustScale);

/* =========================================================
   VEEVA NAVIGATION (STABLE)
========================================================= */
function veevaNavigate(target) {
	if (target === "next") {
		window.location.href = "veeva:nextSlide()";
	} else if (target === "prev") {
		window.location.href = "veeva:prevSlide()";
	} else {
		window.location.href = `veeva:gotoSlide(${target}.zip)`;
	}
}

/* =========================================================
   LOCAL / BROWSER NAVIGATION
========================================================= */
function localNavigate(target) {
	const path = location.pathname;
	const parts = path.split("/").filter(Boolean);

	if (parts.length < 2) return;

	const slideIndex = parts.length - 2;
	const currentSlide = parts[slideIndex];

	if (!/^\d+$/.test(currentSlide)) return;

	let destination;

	if (target === "next") {
		destination = String(Number(currentSlide) + 1).padStart(2, "0");
	} else if (target === "prev") {
		destination = String(Number(currentSlide) - 1).padStart(2, "0");
	} else {
		destination = target;
	}

	parts[slideIndex] = destination;

	const newPath = "/" + parts.join("/");
	location.href = location.href.replace(path, newPath);
}

/* =========================================================
   LOCAL SLIDES (FADE)
========================================================= */
let slides = [];
let currentSlideIndex = 0;

function initLocalSlides() {
	slides = Array.from(document.querySelectorAll(".slide"));
	if (!slides.length) return;

	const visibleIndex = slides.findIndex(
		(slide) => getComputedStyle(slide).display !== "none",
	);

	currentSlideIndex = visibleIndex !== -1 ? visibleIndex : 0;
}

function goToLocalSlide(newIndex) {
	if (
		newIndex === currentSlideIndex ||
		newIndex < 0 ||
		newIndex >= slides.length
	)
		return;

	const current = slides[currentSlideIndex];
	const next = slides[newIndex];

	fadeOut(current, 200, () => {
		fadeIn(next, 200);
		currentSlideIndex = newIndex;
	});
}

/* =========================================================
   FADE HELPERS
========================================================= */
function fadeIn(el, duration = 200) {
	el.style.opacity = 0;
	el.style.display = "block";

	const start = performance.now();

	function animate(time) {
		const progress = Math.min((time - start) / duration, 1);
		el.style.opacity = progress;
		if (progress < 1) requestAnimationFrame(animate);
	}

	requestAnimationFrame(animate);
}

function fadeOut(el, duration = 200, callback) {
	el.style.opacity = 1;
	const start = performance.now();

	function animate(time) {
		const progress = Math.min((time - start) / duration, 1);
		el.style.opacity = 1 - progress;

		if (progress < 1) {
			requestAnimationFrame(animate);
		} else {
			el.style.display = "none";
			if (callback) callback();
		}
	}

	requestAnimationFrame(animate);
}

function fadeToggle(el, duration = 200) {
	const hidden = getComputedStyle(el).display === "none";
	hidden ? fadeIn(el, duration) : fadeOut(el, duration);
}

/* =========================================================
   GLOBAL EVENT HANDLER (SINGLE ENTRY)
========================================================= */
document.addEventListener(TOUCH_EVENT, function (event) {
	/* ---- LOCAL FADE SLIDES ---- */
	const slideBtn = event.target.closest(".btn-slide");
	if (slideBtn) {
		event.preventDefault();

		const action = slideBtn.dataset.content;
		if (action === "next") goToLocalSlide(currentSlideIndex + 1);
		if (action === "prev") goToLocalSlide(currentSlideIndex - 1);
		return;
	}

	/* ---- VEEVA / PAGE NAVIGATION ---- */
	const navBtn = event.target.closest("[data-slide]");
	if (navBtn) {
		event.preventDefault();

		const target = navBtn.dataset.slide;

		if (IS_VEEVA) veevaNavigate(target);
		else localNavigate(target);

		return;
	}

	/* ---- MODAL TOGGLE ---- */
	const modalBtn = event.target.closest(".btn-modal[data-id]");
	if (modalBtn) {
		event.preventDefault();

		modalBtn.dataset.id.split(" ").forEach((id) => {
			const el = document.getElementById(id);
			if (el) fadeToggle(el, 200);
		});
	}
});

/* =========================================================
   INIT
========================================================= */
document.addEventListener("DOMContentLoaded", initLocalSlides);

// Dropdowns

$(document).ready(function () {
	$(".dropdown-btn-01").on("click", function () {
		$(".dropdown-2, .dropdown-3, .dropdown-4").removeClass("active");
		$(".dropdown-1").toggleClass("active");
	});

	$(".dropdown-btn-02").on("click", function () {
		$(".dropdown-1, .dropdown-3, .dropdown-4").removeClass("active");
		$(".dropdown-2").toggleClass("active");
	});

	$(".dropdown-btn-03").on("click", function () {
		$(".dropdown-1, .dropdown-2, .dropdown-4").removeClass("active");
		$(".dropdown-3").toggleClass("active");
	});

	$(".dropdown-btn-04").on("click", function () {
		$(".dropdown-1, .dropdown-2, .dropdown-3").removeClass("active");
		$(".dropdown-4").toggleClass("active");
	});
});
