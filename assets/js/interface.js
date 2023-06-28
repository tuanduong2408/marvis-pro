import {$, $$} from './app.js';
const toggleCheckbox = $('.toggle-checkbox');
const lightCss = $('#light-css');

// Biến trạng thái giao diện
let theme = localStorage.getItem('theme') || 'dark';

// Xử lý khi click vào Dark / Light
toggleCheckbox.addEventListener('click', function () {
	if (toggleCheckbox.checked) {
		lightCss.removeAttribute('disabled');
		localStorage.setItem('theme', 'light');
		theme = 'light';
	} else {
		lightCss.setAttribute('disabled', '');
		localStorage.setItem('theme', 'dark');
		theme = 'dark';
	}
});

// Hàm giữ nguyên trạng thái giao diện sau khi tải lại trang
function restoreTheme() {
	const savedTheme = localStorage.getItem('theme');
	if (savedTheme === 'light') {
		toggleCheckbox.checked = true;
		lightCss.removeAttribute('disabled');
		theme = 'light';
	} else {
		toggleCheckbox.checked = false;
		lightCss.setAttribute('disabled', '');
		theme = 'dark';
	}
}

window.addEventListener('load', restoreTheme);
window.addEventListener('load', () => {
	setTimeout(() => {
		document.body.style.visibility = 'visible';
	}, 500);
});

// Tabs
const tabs = $$('.tab-item');
const tabActive = $('.tab-item.active');
const line = $('.tabs .line');
const tabUpNext = $('.tab-upnext');

line.style.left = tabActive.offsetLeft + 'px';
line.style.width = tabActive.offsetWidth + 'px';

tabs.forEach((tab) => {
	const pane = $(`.tab-pane[data-pane="${tab.dataset.tab}"]`);
	tab.addEventListener('click', () => {
		$('.tab-item.active').classList.remove('active');
		$('.tab-pane.active').classList.remove('active');
		tab.classList.add('active');
		pane.classList.add('active');
		line.style.left = tab.offsetLeft + 'px';
		line.style.width = tab.offsetWidth + 'px';

		if (tab === tabUpNext) {
			const songListItemActive = $('.song-list-item.active');
			if (songListItemActive) {
				songListItemActive.scrollIntoView({behavior: 'smooth', block: 'center'});
			}
		}
	});
});
