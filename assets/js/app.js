export const $ = document.querySelector.bind(document);
export const $$ = document.querySelectorAll.bind(document);
import {ngocDieu} from './ngoc-dieu.js';
import {hoangNganAnh} from './hoang-ngan-anh.js';
import {ngoLanHuong} from './ngo-lan-huong.js';
import {lilShady} from './lil-shady.js';
import {tLong} from './tlong.js';
import {baoAnh} from './bao-anh.js';
import {vanMaiHuong} from './van-mai-huong.js';
import {ladyKillah} from './ladykillah.js';
import {lyThuThao} from './ly-thu-thao.js';
import {remix} from './remix.js';
import {hienNgan} from './hien-ngan.js';
import {vPop} from './v-pop.js';
const playlist = $('.song-list');
const songHeading = $('.now-playing-song-info h4');
const singerHeading = $('.now-playing-song-info p');
const nowPlayingThumb = $('img.img-responsive');
const audio = $('#audio');
const playBtn = $('.controls .play-button');
const waves = $$('.waves .wave');
const front = $('.front');
const posterMainInfoH2 = $('.poster-main-info h2');
const posterMainInfoP = $('.poster-main-info p');
const musicPlayerMain = $('.music-player-main');
const playlists = $('.playlists');
const musicPlayerMainPlaylist = $('.music-player-main-playlist-container');
const backPlaylistBtn = $('.back-playlist-btn');
const albumOverlayControls = $('.album-overlay-control');
const audioElement = $('audio');
const iconMute = $('.icon-mute');
const iconOff = $('.icon-off');
const iconLow = $('.icon-low');
const iconMedium = $('.icon-medium');
const iconHigh = $('.icon-high');
const posterMainPlayAll = $('.poster-main-play-all');
const allSongsFromPlaylist = ngocDieu.concat(hoangNganAnh, ngoLanHuong, lilShady, tLong, baoAnh, vanMaiHuong, ladyKillah, lyThuThao, remix, hienNgan, vPop);

let songListItems = [];
let nextBtnCLick = true;

const app = {
	currentIndex: 0,
	isPlaying: false,
	isFirstClick: true,
	isFirstTimePlayAlbum: true,
	renderAlbumSongs: false,
	isFirstPlayAlbumsClick: true,
	isShuffle: false,
	enterPressed: false,
	currentSongIndex: -1,
	repeatClickCount: 0,
	songs: allSongsFromPlaylist,

	render: function () {
		const htmls = this.songs.map((song, index) => {
			// if (song) {
			const imageUrl = song.images || './assets/img/default-album.jpg';
			const songIndex = index + 1;
			return `
					<div class="song-list-item">
						<div class="thumbnail" style="background-image: url('${imageUrl}');">
							<div class="thumbnail-overlay">
								<div class="play-button">
									<i class="fa-solid fa-pause icon-pause"></i>
									<i class="fa-duotone fa-play icon-play"></i>
								</div>
							</div>
						</div>
						<div class="song-info">
							<div class="song-name">
								<h3>${song.name}</h3>
								<p>${song.singer}</p>
							</div>
							<div class="album-name">
								<a href=""><h3>${song.album}</h3></a>
							</div>
						</div>
						<div class="song-number">${songIndex}</div>
					</div>
					`;
			// }
		});
		playlist.innerHTML = htmls.join('\n');

		// Cập nhật danh sách bài hát toàn cục cho chức năng Search
		this.updateSongListItems();
	},

	defineProperties: function () {
		Object.defineProperty(this, 'currentSong', {
			get: function () {
				return this.songs[this.currentIndex];
			},
		});
	},
	loadCurrentSong: function () {
		songHeading.textContent = this.currentSong.name;
		singerHeading.textContent = this.currentSong.singer;
		nowPlayingThumb.setAttribute('src', this.currentSong.images || './assets/img/default-album.jpg');
		audio.src = this.currentSong.path;
		waves.forEach((wave) => {
			wave.classList.add('paused');
			wave.style.width = '0';
		});
		this.loadAlbumSong();
		// SET TIÊU ĐỀ TAB CHROME THÀNH TÊN BÀI HÁT HIỆN TẠI
		function capitalizeFirstLetter(string) {
			return string.replace(/(?:^|\s)\S/g, function (firstLetter) {
				return firstLetter.toUpperCase();
			});
		}
		document.title = `${capitalizeFirstLetter(this.currentSong.name)} - ${capitalizeFirstLetter(this.currentSong.singer)}`;
		this.getLyricsFromActiveSong();
		setTimeout(() => {
			this.songListItemClickHandle();
			this.setActiveSong();
			this.updatePlayPauseIconsForAll();
		}, 0);
	},
	loadAlbumSong: function () {
		const imageUrl = this.currentSong.albumCover || this.currentSong.images || './assets/img/default-album.png';
		front.style.backgroundImage = `url('${imageUrl}'`;
		posterMainInfoH2.textContent = this.currentSong.album;
		posterMainInfoP.textContent = this.currentSong.singer;
	},
	handleEvent: function () {
		const _this = this;

		// XỬ LÝ LOẠI BỎ DẤU # TRÊN THANH ĐỊA CHỈ KHI CLICK CATEGORY
		document.addEventListener('DOMContentLoaded', function () {
			$$("a[href='#']").forEach(function (link) {
				link.addEventListener('click', function (event) {
					event.preventDefault();
				});
			});
		});

		// XỬ LÝ CLICK VÀO LOGO MARVIS PRO QUAY VỀ TRANG CHỦ
		$('.homePage').addEventListener('click', function () {
			window.location.href = 'https://tuanduong2408.github.io/marvis-pro/';
		});

		// XỬ LÝ NHẤN ENTER / SPACE ĐỂ PLAY / PAUSE BÀI HÁT
		// NHẤN UP / DOWN ĐỂ CHỌN BÀI HÁT, NHẤN ENTER ĐỂ PLAY / PAUSE BÀI HÁT
		let isFirstEnterPress = true;
		let selectedSongIndex = -1; // Chỉ số của bài hát đã chọn

		document.addEventListener('keydown', function (event) {
			if (event.target.tagName !== 'INPUT') {
				if (event.code === 'ArrowUp') {
					event.preventDefault();
					if (_this.songs && _this.currentIndex > 0) {
						_this.currentIndex--;
						selectSong(_this.currentIndex);
						scrollIntoViewIfNeeded(_this.currentIndex);
					}
				} else if (event.code === 'ArrowDown') {
					event.preventDefault();
					if (_this.songs && _this.currentIndex < _this.songs.length - 1) {
						_this.currentIndex++;
						selectSong(_this.currentIndex);
						scrollIntoViewIfNeeded(_this.currentIndex);
					}
				} else if (event.code === 'Enter') {
					event.preventDefault();
					if (isFirstEnterPress) {
						_this.loadCurrentSong();
						audio.play();
						_this.isPlaying = true;
						isFirstEnterPress = false;
						selectedSongIndex = _this.currentIndex; // Cập nhật chỉ số bài hát đã chọn
					} else if (selectedSongIndex === _this.currentIndex) {
						// Chỉ số của bài hát đã chọn giống với bài hát đang phát,
						// nên chỉ cần play hoặc pause nó
						if (_this.isPlaying) {
							audio.pause();
							_this.isPlaying = false;
						} else {
							audio.play();
							_this.isPlaying = true;
						}
					} else {
						// Chọn bài hát mới và phát ngay lập tức
						selectedSongIndex = _this.currentIndex;
						_this.loadCurrentSong();
						audio.play();
						_this.isPlaying = true;
					}
				} else if (event.code === 'Space') {
					event.preventDefault();
					if (_this.isPlaying) {
						audio.pause();
						_this.isPlaying = false;
					} else {
						audio.play();
						_this.isPlaying = true;
					}
				}
			}
		});

		function selectSong(index) {
			const songListItems = $$('.song-list-item');
			songListItems.forEach(function (item) {
				item.classList.remove('active-1');
			});
			songListItems[index].classList.add('active-1');
		}

		function scrollIntoViewIfNeeded(index) {
			const songListItems = $$('.song-list-item');
			const currentSongRect = songListItems[index].getBoundingClientRect();
			const playlistRect = $('.song-list-item').getBoundingClientRect();
			if (currentSongRect.bottom > playlistRect.bottom) {
				songListItems[index].scrollIntoView({block: 'center'});
			}
		}

		// XỬ LÝ KHI NHẤN NÚT ARROW LEFT VÀ ARROW RIGHT ĐỂ TUA NHANH 10S
		document.addEventListener('keydown', function (event) {
			if (event.target.tagName !== 'INPUT') {
				switch (event.key) {
					case 'ArrowLeft':
						audioElement.currentTime -= 5;
						break;
					case 'ArrowRight':
						audioElement.currentTime += 5;
						break;
					default:
						break;
				}
			}
		});

		// XỬ LÝ KHI CLICK PLAY BUTTON
		playBtn.onclick = function () {
			if (_this.isPlaying) {
				audio.pause();
				app.isPlaying = false;
			} else {
				audio.play();
				_this.isPlaying = true;
			}
			const songListItems = $$('.song-list-item');
			songListItems.forEach((songListItem) => {
				const thumbnailOverlay = songListItem.querySelector('.thumbnail-overlay');
				if (songListItem.classList.contains('active')) {
					thumbnailOverlay.classList.add('visible');
				} else {
					thumbnailOverlay.classList.remove('visible');
				}
			});
			_this.updatePlayPauseIconsForAll();
			_this.getLyricsFromActiveSong();
			_this.updatePosterMainPlayAllStatus();
		};

		// KHI BÀI HÁT ĐƯỢC PLAY
		audio.onplay = function () {
			_this.isPlaying = true;
			playBtn.classList.add('playing');
			waves.forEach((wave) => {
				wave.classList.remove('paused');
				wave.style.width = '';
			});
			_this.updatePlayPauseIconsForAll();
		};

		// KHI BÀI HÁT ĐƯỢC PAUSE
		audio.onpause = function () {
			_this.isPlaying = false;
			playBtn.classList.remove('playing');
			waves.forEach((wave) => {
				wave.classList.add('paused');
			});
			_this.updatePlayPauseIconsForAll();
		};

		// KHI PHÁT ĐẾN CUỐI BÀI HÁT
		audio.onended = function () {
			if (_this.repeatClickCount === 2) {
				audio.play();
			} else if (_this.repeatClickCount === 0) {
				// Kiểm tra nếu không có chế độ phát lại hoặc chế độ phát lại bình thường
				const currentSongIndex = _this.songs.findIndex((song) => song === _this.currentSong);
				const lastSongIndex = _this.songs.length - 1;

				if (currentSongIndex === lastSongIndex) {
					// Nếu đang phát bài cuối danh sách, dừng lại
					audio.pause();
					_this.isPlaying = false;
					_this.updatePosterMainPlayAllStatus();
				} else {
					// Nếu không phải bài cuối danh sách, chuyển đến bài tiếp theo và phát
					nextBtn.click();
					audio.play();
				}
			} else {
				nextBtn.click();
				audio.play();
			}
		};

		// XỬ LÝ KHI CLICK NÚT PREVIOUS
		const prevBtn = $('.controls .backward-button');
		prevBtn.onclick = function () {
			if (audioElement.currentTime > 5) {
				audioElement.currentTime = 0;
			} else {
				_this.prevSong();
			}

			// Xóa lớp 'active' khỏi tất cả các phần tử trong danh sách
			const songListItems = $$('.song-list-item');
			songListItems.forEach((item) => {
				item.classList.remove('active');
				item.classList.remove('active-1');
				const itemThumbnailOverlay = item.querySelector('.thumbnail-overlay');
				if (itemThumbnailOverlay) {
					itemThumbnailOverlay.classList.remove('visible');
				}
			});

			// Thêm lớp 'active' vào phần tử được chọn
			const currentSongListItem = songListItems[_this.currentIndex];
			currentSongListItem.classList.add('active');
			const currentSongThumbnailOverlay = currentSongListItem.querySelector('.thumbnail-overlay');
			if (currentSongThumbnailOverlay) {
				currentSongThumbnailOverlay.classList.add('visible');
			}

			// Lấy phần tử bài hát đang active
			const activeSong = $('.song-list-item.active');

			// Cuộn phần tử bài hát đang active vào vị trí cuối cùng
			activeSong.scrollIntoView({block: 'center', behavior: 'smooth', inline: 'nearest'});
		};

		// XỬ LÝ KHI CLICK NÚT NEXT
		const nextBtn = $('.controls .forward-button');
		nextBtn.onclick = function () {
			nextBtnCLick = true;
			_this.nextSong();
			// Xóa lớp 'active' khỏi tất cả các phần tử trong danh sách
			const songListItems = $$('.song-list-item');
			songListItems.forEach((item) => {
				item.classList.remove('active');
				item.classList.remove('active-1');
				const itemThumbnailOverlay = item.querySelector('.thumbnail-overlay');
				if (itemThumbnailOverlay) {
					itemThumbnailOverlay.classList.remove('visible');
				}
			});

			// Thêm lớp 'active' vào phần tử được chọn
			const currentSongListItem = songListItems[_this.currentIndex];
			currentSongListItem.classList.add('active');
			const currentSongThumbnailOverlay = currentSongListItem.querySelector('.thumbnail-overlay');
			if (currentSongThumbnailOverlay) {
				currentSongThumbnailOverlay.classList.add('visible');
			}

			// Lấy phần tử bài hát đang active
			const activeSong = $('.song-list-item.active');

			// Cuộn phần tử bài hát đang active vào vị trí cuối cùng
			activeSong.scrollIntoView({block: 'center', behavior: 'smooth', inline: 'nearest'});
		};

		// XỬ LÝ KHI CLICK NÚT REPEAT
		const repeatButton = $('.repeat-button');
		const repeatInfo = $('.repeat-info');
		repeatButton.onclick = function () {
			_this.repeatClickCount++;
			if (_this.repeatClickCount === 1) {
				repeatButton.classList.add('all-active');
				repeatButton.classList.remove('one-active');
				repeatInfo.style.width = '123px';
				repeatInfo.innerText = 'Repeat One Song';
			} else if (_this.repeatClickCount === 2) {
				repeatButton.classList.add('one-active');
				repeatButton.classList.remove('all-active');
				repeatInfo.style.width = '80px';
				repeatInfo.innerText = 'No Repeat';
			} else {
				repeatButton.classList.remove('all-active');
				repeatButton.classList.remove('one-active');
				repeatInfo.style.width = '120px';
				repeatInfo.innerText = 'Repeat All Songs';
				_this.repeatClickCount = 0;
			}
		};

		// XỬ LÝ KHI CLICK NÚT SHUFFLE
		const shuffleButton = $('.shuffle-button');
		const shuffleInfo = $('.shuffle-info');

		shuffleButton.onclick = function () {
			const currentSong = _this.currentSong;
			const previousActiveIndex = _this.currentIndex;
			const activeSongItem = $('.song-list-item.active-1');

			_this.isShuffle = !_this.isShuffle;
			shuffleButton.classList.toggle('active', _this.isShuffle);
			shuffleInfo.innerText = _this.isShuffle ? 'Shuffle Off' : 'Shuffle On';

			if (_this.isShuffle) {
				// Nếu trạng thái shuffle đang được bật
				_this.shufflePlaylist();
				const currentSongIndex = _this.songs.findIndex((song) => song.name === currentSong.name);
				if (currentSongIndex !== -1) {
					_this.songs.splice(currentSongIndex, 1);
					_this.songs.unshift(currentSong);
					_this.currentIndex = 0;
				}
				_this.render();
				const activeSongElement = $('.song-list-item.active');
				if (activeSongElement) {
					activeSongElement.scrollIntoView();
				}

				// Kiểm tra nếu có bài hát active-1, tiến hành loadCurrentSong cho nó
				if (activeSongItem && activeSongItem.classList.contains('active-1')) {
					const activeSongName = activeSongItem.querySelector('.song-name h3').innerText;
					const activeSong = _this.songs.find((song) => song.name === activeSongName);
					if (activeSong) {
						_this.loadCurrentSong(activeSong);
						!_this.isPlaying ? audio.pause() : audio.play();
						_this.updatePlayPauseIconsForAll();
						_this.updatePosterMainPlayAllStatus();
					}
				}
				_this.setActiveSong();
				nowPlayingSection.click();
			} else {
				// Nếu trạng thái shuffle đang được tắt
				_this.songs = [..._this.originalSongs];
				const index = _this.songs.findIndex((song) => song.name === currentSong.name);
				_this.currentIndex = index !== -1 ? index : previousActiveIndex;
				_this.render();
				_this.setActiveSong();
				const activeSongElement = $('.song-list-item.active');
				if (activeSongElement) {
					activeSongElement.scrollIntoView({behavior: 'smooth', block: 'center'});
				}
				// Kiểm tra nếu có bài hát active-1, tiến hành loadCurrentSong cho nó
				if (activeSongItem && activeSongItem.classList.contains('active-1')) {
					const activeSongName = activeSongItem.querySelector('.song-name h3').innerText;
					const activeSong = _this.songs.find((song) => song.name === activeSongName);
					if (activeSong) {
						_this.loadCurrentSong(activeSong);
						!_this.isPlaying ? audio.pause() : audio.play();
						_this.updatePlayPauseIconsForAll();
						_this.updatePosterMainPlayAllStatus();
					}
				}
			}

			_this.updatePlayPauseIconsForAll();
			_this.songListItemClickHandle();
		};

		// XỬ LÝ THANH TIẾN TRÌNH PROGRESS BAR CỦA ỨNG DỤNG
		const progressBar = $('.progress-bar');
		const musicCurrentTime = $('.current-time');
		const progressTime = $('.progress-time');
		const musicDuration = $('.max-duration');

		// Cập nhật thanh progress-bar theo thời gian hiện tại của bài hát
		let currentProgressPercent = 0.0; // Lưu trữ giá trị phần trăm progress hiện tại
		setInterval(() => {
			const currentTime = audio.currentTime;
			const duration = audio.duration;
			const progressPercent = (currentTime / duration) * 100;

			// Chỉ cập nhật giá trị progress khi có sự thay đổi đáng kể
			if (Math.abs(progressPercent - currentProgressPercent) >= 0.00001) {
				currentProgressPercent = progressPercent;
				progressBar.style.width = `${progressPercent}%`;
			}

			// Cập nhật thời gian hiện tại của bài hát
			let currentMin = Math.floor(currentTime / 60);
			let currentSec = Math.floor(currentTime % 60);
			if (currentMin < 10) {
				currentMin = `0${currentMin}`;
			}
			if (currentSec < 10) {
				currentSec = `0${currentSec}`;
			}
			progressTime.innerText = `${currentMin}:${currentSec}`;
		}, 10);

		// Cập nhật tổng thời lượng bài hát khi metadata được tải về
		audio.addEventListener('loadedmetadata', (e) => {
			const duration = e.target.duration;

			// Cập nhật tổng thời lượng bài hát
			if (!isNaN(duration)) {
				let totalMin = Math.floor(duration / 60);
				let totalSec = Math.floor(duration % 60);
				if (totalMin < 10) {
					totalMin = `0${totalMin}`;
				}
				if (totalSec < 10) {
					totalSec = `0${totalSec}`;
				}
				musicDuration.innerText = `${totalMin}:${totalSec}`;
				// musicCurrentTime.innerText = `${totalMin}:${totalSec}`;
			}
		});

		// Cập nhật thời gian còn lại của bài hát trong sự kiện timeupdate
		audio.addEventListener('timeupdate', function () {
			const duration = audio.duration;
			if (!isNaN(duration)) {
				const currentTime = audio.currentTime;
				const timeLeft = duration - currentTime;
				const minutes = Math.floor(timeLeft / 60);
				const seconds = Math.floor(timeLeft % 60);
				const formattedTimeLeft = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
				// Cập nhật thời gian còn lại vào phần tử hiển thị tổng thời lượng của bài hát
				// musicDuration.innerText = formattedTimeLeft;
				musicCurrentTime.innerText = formattedTimeLeft;
			} else {
				// Hiển thị giá trị mặc định hoặc không hiển thị gì cả
				musicDuration.innerText = '--:--';
			}
		});

		// Cho phép người dùng tua bài hát bằng cách kéo thanh progress-bar
		progressBar.parentElement.onclick = function (e) {
			const width = this.offsetWidth;
			const clickedWidth = e.offsetX;
			const progressPercent = (clickedWidth / width) * 100;
			const seekTime = (audio.duration / 100) * progressPercent;
			audio.currentTime = seekTime;
		};

		// Bắt đầu kéo thanh progress-bar
		let isProgressDragging = false;

		function handleProgressMouseDown(e) {
			e.preventDefault();
			isProgressDragging = true;
			updateProgress(e);
		}

		function handleProgressMouseMove(e) {
			e.preventDefault();
			if (isProgressDragging) {
				updateProgress(e);
			}
		}

		function handleProgressMouseUp() {
			isProgressDragging = false;
		}

		progressBar.parentElement.addEventListener('mousedown', handleProgressMouseDown);
		progressBar.parentElement.addEventListener('touchstart', handleProgressMouseDown);

		progressBar.parentElement.addEventListener('mousemove', handleProgressMouseMove);
		progressBar.parentElement.addEventListener('touchmove', handleProgressMouseMove);

		document.addEventListener('mouseup', handleProgressMouseUp);
		document.addEventListener('touchend', handleProgressMouseUp);

		// Cập nhật tiến độ của bài hát khi kéo thanh progress-bar
		function updateProgress(e) {
			const width = progressBar.parentElement.offsetWidth;
			let clientX = e.clientX;
			if (e.touches && e.touches.length > 0) {
				clientX = e.touches[0].clientX;
			}
			const clickedWidth = clientX - progressBar.parentElement.getBoundingClientRect().left;
			const progressPercent = (clickedWidth / width) * 100;
			const seekTime = (audio.duration / 100) * progressPercent;
			audio.currentTime = seekTime;
		}

		// XỬ LÝ KHI CLICK VÀO CATEGORY
		const categoryLinks = $$('.category ul li a');
		$('.category-songs-title p').innerHTML = `Songs (${_this.songs.length})`;
		categoryLinks.forEach((categoryLink) => {
			categoryLink.addEventListener('click', function () {
				categoryLinks.forEach((link) => {
					link.classList.remove('active');
				});
				backPlaylistBtn.classList.remove('active');
				// Reset số lượng về đã chọn ban đầu
				selectedPlaylistCount = initialPlaylistCount; // Reset số lượng playlist đã chọn về ban đầu
				categoryPlaylistCountElement.textContent = `Playlist (${selectedPlaylistCount})`; // Hiển thị số lượng playlist đã chọn
				selectedAlbumsCount = initialAlbumsCount; // Reset số lượng albums đã chọn về ban đầu
				categoryAlbumsCountElement.textContent = `Albums (${selectedAlbumsCount})`; // Hiển thị số lượng album đã chọn
				this.classList.add('active');
				if (this.classList.contains('category-songs')) {
					$('.category-songs-title p').innerHTML = `Songs (${_this.songs.length})`;
				}
				// Reset PosterMainPlayAll về trạng thái ban đầu
				_this.isFirstClick = true;
				posterMainPlayAll.innerHTML = '<i class="fa-solid fa-play icon-play"></i>Play Album';
				_this.renderAlbumSongs = false; // Đánh dấu rằng chưa render danh sách bài hát từ album
				_this.isFirstPlayAlbumsClick = true;
				albumOverlayControls.classList.remove('playing');
			});
		});

		// XỬ LÝ KHI CLICK VÀO CATEGORY-SONGS
		const categorySongs = $('.category-songs');
		categorySongs.onclick = function () {
			shuffleButton.classList.remove('active');
			_this.isShuffle = false;
			shuffleInfo.innerText = 'Shuffle On';
			playlists.classList.remove('active');
			musicPlayerMain.classList.remove('hidden');
			musicPlayerMainPlaylist.classList.remove('show');
			musicPlayerMainAlbum.classList.remove('show');
			albumContainer.classList.remove('active');

			// Lưu lại tên bài hát đang phát
			const currentSongName = _this.currentSong ? _this.currentSong.name : '';

			_this.currentIndex = 0;
			_this.songs = allSongsFromPlaylist;
			_this.loadAlbumSong();
			_this.render();
			_this.songListItemClickHandle();

			// Kiểm tra xem danh sách bài hát hiện tại có bất kỳ phần tử nào hay không
			if (allSongsFromPlaylist.length > 0) {
				const currentActiveIndex = _this.songs.findIndex((song) => song.name === currentSongName);

				if (currentActiveIndex !== -1) {
					_this.currentIndex = currentActiveIndex;
					_this.loadAlbumSong();

					const songListItems = $$('.song-list-item');
					songListItems.forEach((songListItem) => {
						songListItem.classList.remove('active');
						songListItem.classList.remove('active-1');
					});

					songListItems[currentActiveIndex].classList.add('active');
					songListItems[currentActiveIndex].classList.add('active-1');

					const thumbnailOverlay = songListItems[currentActiveIndex].querySelector('.thumbnail-overlay');
					if (songListItems[currentActiveIndex].classList.contains('active')) {
						thumbnailOverlay.classList.add('visible');
						_this.updatePlayPauseIconsForAll();
					}
				} else {
					// Nếu bài hát đang phát không có trong danh sách bài hát hiện tại
					// Đặt active cho bài hát đầu tiên trong danh sách
					_this.currentIndex = 0;
					const songListItems = $$('.song-list-item');

					songListItems.forEach((songListItem) => {
						songListItem.classList.remove('active');
						songListItem.classList.remove('active-1');
					});

					songListItems[_this.currentIndex].classList.add('active');
					songListItems[_this.currentIndex].classList.add('active-1');

					const thumbnailOverlay = songListItems[_this.currentIndex].querySelector('.thumbnail-overlay');
					if (songListItems[_this.currentIndex].classList.contains('active')) {
						thumbnailOverlay.classList.add('visible');
						_this.updatePlayPauseIconsForAll();
					}
				}
			}
			_this.isFirstTimePlayAlbum = true;
			nowPlayingSection.click();
		};

		// XỬ LÝ KHI CLICK VÀO CATEGORY-PLAYLIST
		const allPlaylists = [
			{name: 'baoAnh', songs: baoAnh},
			{name: 'hienNgan', songs: hienNgan},
			{name: 'hoangNganAnh', songs: hoangNganAnh},
			{name: 'ladyKillah', songs: ladyKillah},
			{name: 'lilShady', songs: lilShady},
			{name: 'lyThuThao', songs: lyThuThao},
			{name: 'ngocDieu', songs: ngocDieu},
			{name: 'ngoLanHuong', songs: ngoLanHuong},
			{name: 'remix', songs: remix},
			{name: 'tLong', songs: tLong},
			{name: 'vanMaiHuong', songs: vanMaiHuong},
			{name: 'vPop', songs: vPop},
		];

		const customPlaylistNames = [
			{playlistName: 'baoAnh', customName: 'Bảo Anh'},
			{playlistName: 'hienNgan', customName: 'Hiền Ngân Bolero'},
			{playlistName: 'hoangNganAnh', customName: 'Hoàng Ngân Anh'},
			{playlistName: 'ladyKillah', customName: 'LadyKillah'},
			{playlistName: 'lilShady', customName: 'Lil Shady'},
			{playlistName: 'lyThuThao', customName: 'Lý Thu Thảo'},
			{playlistName: 'ngocDieu', customName: 'Ngọc Diệu Bolero'},
			{playlistName: 'ngoLanHuong', customName: 'Ngô Lan Hương'},
			{playlistName: 'remix', customName: 'Remix Vinahouse'},
			{playlistName: 'tLong', customName: 'TLong'},
			{playlistName: 'vanMaiHuong', customName: 'Văn Mai Hương'},
			{playlistName: 'vPop', customName: 'V-POP'},
		];

		const playlistContainer = $('.playlists');
		let selectedPlaylistCount = allPlaylists.length; // Số lượng playlist đã chọn ban đầu
		const initialPlaylistCount = selectedPlaylistCount; // Số lượng playlist ban đầu
		const categoryPlaylistCountElement = $('.category-playlist p');
		const categoryPlaylist = $('.category-playlist');

		categoryPlaylistCountElement.textContent = `Playlist (${selectedPlaylistCount})`;
		categoryPlaylist.onclick = function () {
			musicPlayerMain.classList.add('hidden');
			playlists.classList.add('active');
			musicPlayerMainPlaylist.classList.add('show');
			musicPlayerMainAlbum.classList.remove('show');
			renderPlaylists();
			selectedPlaylistCount = initialPlaylistCount; // Reset số lượng playlist đã chọn về ban đầu
			categoryPlaylistCountElement.textContent = `Playlist (${selectedPlaylistCount})`; // Hiển thị số lượng playlist đã chọn
		};

		function renderPlaylists() {
			playlistContainer.innerHTML = '';

			allPlaylists.forEach((playlist, index) => {
				const playlistElement = document.createElement('div');
				playlistElement.classList.add('playlist');
				const imageUrl = getPlaylistThumbnail(playlist.songs);

				// Tìm tên playlist tùy chỉnh
				const customNameObj = customPlaylistNames.find((item) => item.playlistName === playlist.name);
				const customName = customNameObj ? customNameObj.customName : playlist.name;

				playlistElement.innerHTML = `
					<img src="${imageUrl}" alt="Playlist ${index + 1} Thumbnail" class="playlist-thumbnail">
					<div class="playlist-info">
						<div class="playlist-name">${customName}</div>
						<div class="playlist-song-count">${playlist.songs.length} Songs</div>
					</div>
				`;

				// XỬ LÝ KHI CLICK VÀO TỪNG PHẦN TỬ PLAYLIST
				let currentActiveIndex = -1;
				playlistElement.addEventListener('click', function () {
					shuffleButton.classList.remove('active');
					_this.isShuffle = false;
					categorySongs.click();
					_this.currentIndex = 0;

					const sortedSongs = playlist.songs.slice().sort((a, b) => {
						return a.name.localeCompare(b.name);
					});
					_this.songs = sortedSongs;
					_this.render();
					_this.loadAlbumSong();
					_this.currentIndex = -1;

					currentActiveIndex = sortedSongs.findIndex(() => {
						const customNameObj = customPlaylistNames.find((item) => item.playlistName === playlist.name);
						const customName = customNameObj ? customNameObj.customName : playlist.name;
						const songName = customName || playlist.name;
						return songName === _this.currentSong?.name;
					});

					_this.songListItemClickHandle();
					backPlaylistBtn.classList.add('active');
					selectedPlaylistCount = playlist.songs.length;
					categoryPlaylistCountElement.textContent = `Playlist (${selectedPlaylistCount})`;

					const songListItems = $$('.song-list-item');
					if (songListItems.length > 0) {
						songListItems[0].classList.add('active-1');
					}
					_this.isFirstTimePlayAlbum = true;
					$('.song-list-item.active-1').scrollIntoView({behavior: 'smooth', block: 'start'});
				});

				playlistContainer.appendChild(playlistElement);
			});
		}

		function getPlaylistThumbnail(songs) {
			if (songs && songs.length > 0 && songs[0].images) {
				const firstSong = songs[0];
				return firstSong.images;
			}
			return './assets/img/default-album.jpg'; // Đường dẫn mặc định nếu không có playlist hoặc không có hình ảnh thumbnail
		}

		const playlistThumbnails = $$('.playlist-thumbnail');
		playlistThumbnails.forEach((img, index) => {
			img.src = getPlaylistThumbnail(allPlaylists[index].songs);
		});

		// XỬ LÝ KHI CLICK VÀO CATEGORY ALBUM
		const allAlbums = [];
		allPlaylists.forEach((playlist) => {
			playlist.songs.forEach((song) => {
				const album = {
					name: song.album,
					singer: song.singer,
					images: song.images,
					albumCover: song.albumCover,
				};
				if (!allAlbums.some((a) => a.name === album.name)) {
					allAlbums.push(album);
				}
			});
		});

		// Lấy các phần tử HTML cần thiết
		const albumContainer = $('.albums');
		const categoryAlbums = $('.category-album');
		const musicPlayerMainAlbum = $('.music-player-main-album-container');
		let selectedAlbumsCount = allAlbums.length; // Số lượng album đã chọn ban đầu
		const initialAlbumsCount = selectedAlbumsCount; // Số lượng album ban đầu
		const categoryAlbumsCountElement = $('.category-album p');

		// Xử lý sự kiện khi click vào category-album
		categoryAlbumsCountElement.textContent = `Albums (${selectedAlbumsCount})`;
		categoryAlbums.addEventListener('click', function () {
			musicPlayerMain.classList.add('hidden');
			musicPlayerMainAlbum.classList.add('show');
			albumContainer.classList.add('active');
			musicPlayerMainPlaylist.classList.remove('show');
			renderAlbums();
			selectedAlbumsCount = initialAlbumsCount; // Reset số lượng album đã chọn về ban đầu
			categoryAlbumsCountElement.textContent = `Albums (${selectedAlbumsCount})`; // Hiển thị số lượng album đã chọn
		});

		// Hàm render danh sách album lên giao diện
		function renderAlbums() {
			albumContainer.innerHTML = '';

			// Sắp xếp danh sách album theo thứ tự Alpha B
			allAlbums.sort((a, b) => a.name.localeCompare(b.name));

			allAlbums.forEach((album, index) => {
				const albumElement = document.createElement('div');
				albumElement.classList.add('album');
				albumElement.innerHTML = `
					<img src="${album.albumCover || album.images || './assets/img/default-album.jpg'}" alt="Album ${index + 1} Thumbnail" class="album-thumbnail">
					<div class="album-info">
						<div class="album-namee">${album.name}</div>
						<div class="album-singer">${album.singer}</div>
					</div>
					`;

				// XỬ LÝ KHI CLICK VÀO TỪNG PHẦN TỬ ALBUM
				let currentActiveIndex = -1;
				albumElement.addEventListener('click', function () {
					backPlaylistBtn.classList.add('active');
					shuffleButton.classList.remove('active');
					_this.isShuffle = false;

					// LỌC DANH SÁCH CÁC BÀI HÁT THUỘC ALBUM ĐƯỢC CHỌN
					const selectedAlbumSongs = allPlaylists.reduce((songs, playlist) => {
						const albumSongs = playlist.songs.filter((song) => song.album === album.name);
						return songs.concat(albumSongs);
					}, []);

					categorySongs.click();
					_this.currentIndex = 0;

					// Sắp xếp danh sách bài hát trong album theo thứ tự Alphabetic B
					const sortedSongs = selectedAlbumSongs.slice().sort((a, b) => {
						return a.name.localeCompare(b.name);
					});

					_this.songs = sortedSongs;
					_this.render();
					_this.loadAlbumSong();
					_this.currentIndex = -1;

					currentActiveIndex = sortedSongs.findIndex((song) => {
						const songName = song.name;
						return songName === _this.currentSong?.name;
					});

					_this.songListItemClickHandle();

					// CẬP NHẬT SỐ LƯỢNG BÀI HÁT TRONG ALBUM
					selectedAlbumsCount = selectedAlbumSongs.length;
					categoryAlbumsCountElement.textContent = `Albums (${selectedAlbumsCount})`;

					// Kiểm tra xem danh sách .song-list-item có tồn tại hay không trước khi thêm lớp active-1
					const songListItems = $$('.song-list-item');
					if (songListItems.length > 0) {
						songListItems[0].classList.add('active-1');
						_this.updatePosterMainPlayAllStatus();
					}
					_this.isFirstTimePlayAlbum = true;
				});

				albumContainer.appendChild(albumElement);
			});
		}

		// XỬ LÝ KHI CLICK VÀO NÚT BACK PLAYLIST
		backPlaylistBtn.onclick = function () {
			const categoryPlaylist = $('.category-playlist .active');
			const categoryAlbums = $('.category-album .active');
			const categorySongs = $('.category-songs .active');
			if (categoryPlaylist) {
				categoryPlaylist.click();
			} else if (categoryAlbums) {
				categoryAlbums.click();
			} else if (categorySongs) {
				categorySongs.click();
			}
			nowPlayingSection.click();
		};

		let currentScrollTop = 0;

		// Lưu lại vị trí cuộn hiện tại khi người dùng cuộn chuột
		$('.song-list-item').addEventListener('scroll', function () {
			currentScrollTop = this.scrollTop;
		});

		// // Lưu lại vị trí cuộn hiện tại khi nhấp vào posterMainPlayAll
		posterMainPlayAll.addEventListener('click', function () {
			currentScrollTop = $('.song-list-item').scrollTop;
		});

		// Khôi phục lại vị trí cuộn khi người dùng nhấp vào categorySongs
		categorySongs.addEventListener('click', function () {
			$('.song-list-item').scrollTop = currentScrollTop;
		});

		// XỬ LÝ KHI CLICK VÀO NOW PLAYING
		const nowPlayingSection = $('.now-playing');
		nowPlayingSection.addEventListener('click', function () {
			const activeSong = $('.song-list-item.active');
			if (activeSong) {
				activeSong.classList.add('scrolling-active-song');
				activeSong.scrollIntoView({behavior: 'smooth', block: 'center'});
				setTimeout(() => {
					activeSong.classList.remove('scrolling-active-song');
				}, 1000); // Thời gian transition trong CSS
			}
		});

		// XỬ LÝ TĂNG GIẢM VOLUME
		const volumeControl = $('.progress-vol-area');
		const progressVolBar = $('.progress-vol-bar');
		let isVolDragging = false;

		function handleMouseDown(event) {
			event.preventDefault();
			isVolDragging = true;
			updateVolume(event);
		}

		function handleMouseUp() {
			isVolDragging = false;
		}

		function handleMouseMove(event) {
			if (isVolDragging) {
				updateVolume(event);
			}
		}

		function handleMouseEnter(event) {
			if (event.buttons === 1) {
				// Xử lý khi chuột di chuyển vào và đang nhấn giữ
				isVolDragging = true;
				updateVolume(event);
			}
		}

		function handleMouseLeave() {
			isVolDragging = false;
		}

		volumeControl.addEventListener('mousedown', handleMouseDown);
		volumeControl.addEventListener('mouseup', handleMouseUp);
		volumeControl.addEventListener('mousemove', handleMouseMove);
		volumeControl.addEventListener('mouseenter', handleMouseEnter);
		volumeControl.addEventListener('mouseleave', handleMouseLeave);

		document.addEventListener('mouseup', handleMouseUp);
		document.addEventListener('mousemove', handleMouseMove);

		function updateVolume(e) {
			const volumeControlRect = volumeControl.getBoundingClientRect();
			let clientX = e.clientX;
			if (e.touches && e.touches.length > 0) {
				clientX = e.touches[0].clientX;
			}
			const position = clientX - volumeControlRect.left;
			const totalWidth = volumeControl.offsetWidth;
			let volume = position / totalWidth;
			volume = Math.max(0, volume);
			volume = Math.min(1, volume);
			audioElement.volume = volume;
			progressVolBar.style.width = volume * 100 + '%';

			// Cập nhật icon volume tương ứng với % âm lượng
			if (volume < 0) {
				iconMute.style.display = 'block';
				iconOff.style.display = 'none';
				iconLow.style.display = 'none';
				iconMedium.style.display = 'none';
				iconHigh.style.display = 'none';
			} else if (volume === 0) {
				iconMute.style.display = 'none';
				iconOff.style.display = 'block';
				iconLow.style.display = 'none';
				iconMedium.style.display = 'none';
				iconHigh.style.display = 'none';
			} else if (volume <= 0.3) {
				iconMute.style.display = 'none';
				iconOff.style.display = 'none';
				iconLow.style.display = 'block';
				iconMedium.style.display = 'none';
				iconHigh.style.display = 'none';
			} else if (volume <= 0.7) {
				iconMute.style.display = 'none';
				iconOff.style.display = 'none';
				iconLow.style.display = 'none';
				iconMedium.style.display = 'block';
				iconHigh.style.display = 'none';
			} else {
				iconMute.style.display = 'none';
				iconOff.style.display = 'none';
				iconLow.style.display = 'none';
				iconMedium.style.display = 'none';
				iconHigh.style.display = 'block';
			}
		}
		audioElement.volume = 1;
		progressVolBar.style.width = '100%';

		const volumeIcons = [iconMute, iconOff, iconLow, iconMedium, iconHigh];
		let previousVolume = audioElement.volume;
		let previousIconIndex = 4; // Khởi tạo với chỉ số của iconHigh

		// Xử lý khi click vào bất kỳ icon volume nào
		volumeIcons.forEach((icon, index) => {
			icon.addEventListener('click', function () {
				if (audioElement.volume !== 0) {
					// Lưu trạng thái âm lượng hiện tại và chỉ số icon trước đó
					previousVolume = audioElement.volume;
					previousIconIndex = index;
					// Tắt tiếng bằng cách đặt âm lượng về 0
					audioElement.volume = 0;
					// Hiển thị icon-mute và ẩn các icon khác
					for (let i = 0; i < volumeIcons.length; i++) {
						if (i === 0) {
							volumeIcons[i].style.display = 'block';
						} else {
							volumeIcons[i].style.display = 'none';
						}
					}
				} else {
					// Khôi phục âm lượng trước đó
					audioElement.volume = previousVolume;
					// Hiển thị icon tương ứng với mức âm lượng trước đó
					for (let i = 0; i < volumeIcons.length; i++) {
						if (i === previousIconIndex) {
							volumeIcons[i].style.display = 'block';
						} else {
							volumeIcons[i].style.display = 'none';
						}
					}
				}
			});
		});

		// Cập nhật icon tương ứng với trạng thái volume hiện tại
		const currentVolume = audioElement.volume;
		if (currentVolume < 0) {
			iconMute.style.display = 'inline-block';
		} else if (currentVolume === 0) {
			iconOff.style.display = 'inline-block';
		} else if (currentVolume <= 0.3) {
			iconLow.style.display = 'inline-block';
		} else if (currentVolume <= 0.7) {
			iconMedium.style.display = 'inline-block';
		} else {
			iconHigh.style.display = 'inline-block';
		}

		// XỬ LÝ KHI CLICK VÀO POSTER MAIN PLAY ALL
		posterMainPlayAll.onclick = function () {
			const albumName = posterMainInfoH2.innerText;
			const albumSongs = _this.songs.filter((song) => song.album.toLocaleLowerCase() === albumName.toLocaleLowerCase());

			backPlaylistBtn.classList.add('active');

			if (albumSongs.length > 1) {
				if (_this.isFirstClick) {
					_this.isAlbumElementClick = false;
					_this.isFirstClick = false;
				}
				playBtn.click();
			} else if (albumSongs.length === 1) {
				_this.currentIndex = 0;
				if (_this.isFirstClick) {
					_this.isFirstClick = false;
				}
				playBtn.click();
			}

			// Set _this.currentIndex = 0 để play được album khi click PLAY ALBUMS
			const categoryAlbums = $('.category-album .link');
			const categoryPlaylist = $('.category-playlist .link');
			if (categoryAlbums.classList.contains('active') || categoryPlaylist.classList.contains('active')) {
				_this.currentIndex = 0;
			}

			// Khi click vào posterMainPlayAll bài hát nào, tìm kiếm bài hát đó, set active và đưa lên đầu mảng
			const currentSongName = _this.currentSong.name;
			_this.songs = albumSongs;

			const currentSongIndex = _this.songs.findIndex((song) => song.name === currentSongName);
			if (currentSongIndex !== -1 && _this.isFirstTimePlayAlbum) {
				const selectedSong = _this.songs[currentSongIndex];
				_this.songs.splice(currentSongIndex, 1);
				_this.songs.unshift(selectedSong);
				_this.isFirstTimePlayAlbum = false;
				_this.currentIndex = 0;
				_this.setActiveSong();
				nowPlayingSection.click();
			}

			// Kiểm tra isFirstPlayAlbumsClick để set active cho bài hát đầu tiên
			if (_this.isFirstPlayAlbumsClick) {
				if (_this.isPlaying) {
					_this.loadCurrentSong();
					audio.play();
					_this.isPlaying = true;
					_this.updatePosterMainPlayAllStatus();
					_this.updatePlayPauseIconsForAll();
					_this.setActiveSong();
					nowPlayingSection.click();
				} else {
					_this.loadCurrentSong();
					audio.play();
					_this.isPlaying = true;
					_this.updatePosterMainPlayAllStatus();
					_this.updatePlayPauseIconsForAll();
					_this.setActiveSong();
					nowPlayingSection.click();
				}
				_this.isFirstPlayAlbumsClick = false;
			}

			if (!_this.renderAlbumSongs) {
				_this.currentIndex = 0;
				_this.render();
				_this.renderAlbumSongs = true;
			}
			_this.updatePlayPauseIconsForAll();
			_this.updatePosterMainPlayAllStatus();
			_this.songListItemClickHandle();
		};

		// XỬ LÝ KHI CLICK VÀO ALBUM OVERLAY CONTROLS (PLAY BUTTON ON ALBUM COVER)
		albumOverlayControls.onclick = function () {
			posterMainPlayAll.click();
			albumOverlayControls.classList.toggle('playing');
			_this.updatePosterMainPlayAllStatus();
		};

		// XỬ LÝ KHI CLICK VÀO Ô SEARCH
		const searchForm = document.getElementById('search-form');
		const searchInput = document.getElementById('query');
		let currentHighlightedIndex = -1;

		let enterPressed = false; // Biến cờ để kiểm tra xem Enter đã được nhấn hay chưa

		searchForm.addEventListener('submit', function (event) {
			event.preventDefault();
			performSearch();
		});

		let activeIndex = -1; // Biến lưu trữ index của bài hát active
		searchInput.addEventListener('keydown', function (event) {
			if (event.key === 'Enter') {
				event.preventDefault();
				searchInput.select();

				if (enterPressed) {
					if (currentHighlightedIndex !== -1) {
						const songListItem = songListItems[currentHighlightedIndex];
						songListItem.classList.add('active'); // Thêm class "active" vào bài hát được tìm thấy
						// Tìm index của bài hát active
						activeIndex = Array.from(songListItems).indexOf(songListItem);

						if (_this.currentIndex === activeIndex) {
							playBtn.click();
						} else {
							_this.currentIndex = activeIndex;
							_this.loadCurrentSong();
							audio.play();
						}
					}
				} else {
					if (searchInput.value.trim() !== '') {
						performSearch();
						enterPressed = true;
					} else {
						if (_this.isPlaying) {
							_this.loadCurrentSong();
							audio.play();
						} else {
							_this.loadCurrentSong();
							audio.play();
						}
					}
				}
			} else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
				event.preventDefault();

				// Xử lý di chuyển lên xuống
				const direction = event.key === 'ArrowUp' ? -1 : 1;
				const currentIndex = currentHighlightedIndex + direction;

				if (currentIndex >= 0 && currentIndex < songListItems.length) {
					// Xóa class "active" của phần tử hiện tại
					if (currentHighlightedIndex >= 0 && currentHighlightedIndex < songListItems.length) {
						songListItems[currentHighlightedIndex].classList.remove('active');
					}

					// Đặt class "active" cho phần tử mới
					songListItems[currentIndex].classList.add('active');
					currentHighlightedIndex = currentIndex;

					// Cuộn tới phần tử mới nếu cần
					songListItems[currentIndex].scrollIntoView({
						behavior: 'smooth',
						block: 'nearest',
					});

					// Lưu chỉ mục của bài hát đang được đánh dấu
					_this.currentSongIndex = currentIndex;
				}
			}
		});

		searchInput.addEventListener('input', function () {
			enterPressed = false; // Reset biến cờ khi có thay đổi nội dung input
		});

		searchInput.addEventListener('click', function () {
			setTimeout(() => {
				searchInput.select();
			}, 300);
		});

		function performSearch() {
			const searchTerm = searchInput.value.trim().toLowerCase();
			let hasResults = false;
			let hasSearched = false; // Kiểm tra xem đã nhấn Enter tìm kiếm hay chưa

			// Xóa các đánh dấu và lớp "active" hiện tại
			clearSearchResults();

			// Tìm kiếm và đánh dấu các phần tử trùng khớp
			songListItems.forEach((item, index) => {
				const songNameElement = item.querySelector('.song-name h3');
				const songName = songNameElement.innerText.toLowerCase();

				const replacedHTML = songName.replace(new RegExp(`\\b(${searchTerm})\\b`, 'gi'), '<mark>$1</mark>');

				songNameElement.innerHTML = replacedHTML;

				// Cuộn tới vị trí đầu tiên của phần tử được đánh dấu
				if (!hasResults && replacedHTML.toLowerCase().includes(searchTerm)) {
					item.scrollIntoView({behavior: 'auto', block: 'center'});
					currentHighlightedIndex = index; // Cập nhật chỉ mục của phần tử được đánh dấu

					// Thêm lớp "active" cho phần tử được đánh dấu
					item.classList.add('active');

					// Lưu chỉ mục của bài hát đang được đánh dấu
					_this.currentSongIndex = index;

					hasResults = true;
					// Nếu có kết quả được tìm thấy, tự động chạy hàm loadCurrentSong và phát bài hát
				}
			});

			// Nếu có kết quả được tìm thấy, tự động chạy hàm loadCurrentSong và phát bài hát đã chọn
			if (hasResults) {
				_this.currentIndex = _this.currentSongIndex;
				_this.loadCurrentSong();
				audio.play();
			}

			// Nếu không có kết quả nào được tìm thấy, đặt lại giá trị của currentSongIndex và hasSearched
			const searchInfo = document.querySelector('.search-info');
			if (!hasResults) {
				_this.currentSongIndex = -1;
				hasSearched = false;
				searchInput.value = '';
				searchInput.placeholder = 'Song not found...';
				searchInfo.innerText = "The song doesn't exist !!";
				searchInfo.style.width = '75%';
			} else {
				searchInput.placeholder = 'Search...';
				searchInfo.innerText = 'Enter to Search and Play Song';
				searchInfo.style.width = '100%';
			}
		}

		function clearSearchResults() {
			songListItems.forEach((item) => {
				const songName = item.querySelector('.song-name h3');
				songName.innerHTML = songName.innerText; // Xóa các thẻ <mark> trong kết quả tìm kiếm
			});

			currentHighlightedIndex = -1;
			enterPressed = false; // Reset biến cờ
		}

		// Xử lý khi nhấn ESC để hủy bỏ forcus vào input
		document.addEventListener('keydown', function (event) {
			if (event.key === 'Escape') {
				const inputElement = $('#search-form input');
				inputElement.blur();
				searchInput.value = '';
			}
		});
	},

	sortSongsByAlpha: function () {
		this.songs.sort((a, b) => {
			// Sắp xếp theo tên bài hát (songName) theo thứ tự bảng chữ cái
			return a.name.localeCompare(b.name);
		});
	},
	sortSongsByAlphaB: function () {
		this.songs.sort((a, b) => {
			// Lấy tên bài hát
			const songNameA = a.name.toLowerCase();
			const songNameB = b.name.toLowerCase();

			// Kiểm tra xem tên bài hát bắt đầu bằng chữ "B" hay không
			const startsWithB_A = songNameA.startsWith('b');
			const startsWithB_B = songNameB.startsWith('b');

			// Sắp xếp theo thứ tự alphabetic B
			if (startsWithB_A && !startsWithB_B) {
				return -1;
			} else if (!startsWithB_A && startsWithB_B) {
				return 1;
			} else {
				// Nếu cả hai bài hát đều bắt đầu bằng chữ "B" hoặc không
				// bắt đầu bằng chữ "B", tiến hành sắp xếp theo tên bài hát
				return songNameA.localeCompare(songNameB);
			}
		});
	},
	sortAlbumsByAlpha: function () {
		this.songs.sort((a, b) => {
			// Sắp xếp theo tên bài hát (songName) theo thứ tự bảng chữ cái
			return a.album.localeCompare(b.album);
		});
	},
	songListItemClickHandle: function () {
		const _this = this;
		const songListItems = $$('.song-list-item');

		songListItems.forEach((songListItem, index) => {
			const thumbnail = songListItem.querySelector('.thumbnail');
			const thumbnailOverlay = songListItem.querySelector('.thumbnail-overlay');

			if (thumbnail && thumbnailOverlay) {
				thumbnail.onclick = function (event) {
					event.stopPropagation();
					if (_this.currentIndex === index) {
						if ((songListItem.classList.contains('active') && songListItem.classList.contains('active-1')) || (songListItem.classList.contains('active') && !_this.enterPressed)) {
							if (_this.isPlaying) {
								audio.pause();
								_this.isPlaying = false;
								_this.updatePosterMainPlayAllStatus();
							} else {
								audio.play();
								_this.isPlaying = true;
								_this.updatePosterMainPlayAllStatus();
							}
						} else {
							_this.loadCurrentSong();
							audio.play();
							_this.isPlaying = true;
							_this.updatePosterMainPlayAllStatus();
						}
					} else {
						_this.currentIndex = index;
						_this.loadCurrentSong();
						audio.play();
						_this.isPlaying = true;
						_this.updatePosterMainPlayAllStatus();
					}
					songListItems.forEach((item) => {
						item.classList.remove('active');
						item.classList.remove('active-1');
						const itemThumbnailOverlay = item.querySelector('.thumbnail-overlay');
						if (itemThumbnailOverlay) {
							itemThumbnailOverlay.classList.remove('visible');
						}
					});
					songListItem.classList.add('active');
					songListItem.classList.add('active-1');
					if (songListItem.classList.contains('active')) {
						thumbnailOverlay.classList.add('visible');
					}
					_this.updatePlayPauseIconsForAll();
					_this.getLyricsFromActiveSong();
				};
			}

			let clickCount = 0;
			let clickTimeout;
			songListItem.onclick = function (event) {
				if (!event.target.closest('.thumbnail')) {
					event.stopPropagation();
					clickCount++;
					if (clickCount === 1) {
						clickTimeout = setTimeout(() => {
							clickCount = 0;
						}, 300);
						_this.currentIndex = index;
						_this.loadAlbumSong();
						songListItems.forEach((item) => {
							item.classList.remove('active-1');
						});
						songListItem.classList.add('active-1');
					} else if (clickCount === 2) {
						clearTimeout(clickTimeout);
						if (songListItem.classList.contains('active') && songListItem.classList.contains('active-1')) {
							if (_this.isPlaying) {
								audio.pause();
								_this.isPlaying = false;
								_this.updatePosterMainPlayAllStatus();
							} else {
								audio.play();
								_this.isPlaying = true;
								_this.updatePosterMainPlayAllStatus();
							}
						} else {
							_this.currentIndex = index;
							_this.loadCurrentSong();
							audio.play();
							_this.isPlaying = true;
							_this.updatePosterMainPlayAllStatus();
							songListItems.forEach((item) => {
								item.classList.remove('active');
								item.classList.remove('active-1');
								const itemThumbnailOverlay = item.querySelector('.thumbnail-overlay');
								if (itemThumbnailOverlay) {
									itemThumbnailOverlay.classList.remove('visible');
								}
							});
							songListItem.classList.add('active');
							if (songListItem.classList.contains('active')) {
								thumbnailOverlay.classList.add('visible');
							}
							_this.updatePlayPauseIconsForAll();
						}
						_this.getLyricsFromActiveSong();
						clickCount = 0;
					}
				}
			};
		});
	},

	updatePosterMainPlayAllStatus: function () {
		const _this = this;
		if (!_this.isFirstClick && !_this.isPlaying) {
			posterMainPlayAll.innerHTML = '<p><i class="fa-solid fa-play icon-play"></i> Continues</p>';
			albumOverlayControls.classList.remove('playing');
		} else if (!_this.isFirstClick && _this.isPlaying) {
			posterMainPlayAll.innerHTML = '<p><i class="fa-solid fa-pause"></i> Pause</p>';
			albumOverlayControls.classList.add('playing');
		}
	},

	getLyricsFromActiveSong: function () {
		// Tải lời bài hát và hiển thị lên tab lyrics
		const lyricsTab = $('.lyrics-tab');
		const tabLyrics = $('.tab-lyrics');
		const currentSong = this.songs[this.currentIndex];
		if (currentSong && currentSong.lyrics) {
			fetch(currentSong.lyrics)
				.then((response) => response.text())
				.then((lyrics) => {
					lyricsTab.innerHTML = `
                <h2>${currentSong.name}</h2>
                <pre>${lyrics}</pre>
              `;
				})
				.catch((error) => {
					console.log('Error loading lyrics:', error);
					lyricsTab.innerHTML = '<h2>No Lyrics</h2>';
				});
		} else {
			lyricsTab.innerHTML = `<i class="fa-light fa-face-sad-sweat"></i> <br> <h3>No Lyrics</h3>`;
		}

		// Kiểm tra xem bài hát đang phát có thuộc tính lyrics không
		if (currentSong && currentSong.lyrics) {
			tabLyrics.innerText = 'View Lyrics';
		} else {
			tabLyrics.innerText = 'No Lyrics';
		}
	},

	// Cập nhật trạng thái của các icon play/pause
	updatePlayPauseIconsForAll: function () {
		const _this = this;
		const songListItems = $$('.song-list-item');
		songListItems.forEach((item) => {
			const playIcon = item.querySelector('.icon-play');
			const pauseIcon = item.querySelector('.icon-pause');
			if (playIcon && pauseIcon) {
				const isActive = item.classList.contains('active');
				const isPlaying = _this.isPlaying;
				if (isActive && isPlaying) {
					playIcon.style.display = 'none';
					pauseIcon.style.display = 'block';
				} else {
					playIcon.style.display = 'block';
					pauseIcon.style.display = 'none';
				}
			}
		});
		if (_this.isPlaying) {
			playBtn.classList.add('playing');
		} else {
			playBtn.classList.remove('playing');
		}
	},

	prevSong: function () {
		this.currentIndex--;
		if (this.currentIndex < 0) {
			if (this.repeatClickCount === 1) {
				this.currentIndex = this.songs.length - 1;
			} else {
				this.currentIndex = 0;
			}
		}
		this.loadCurrentSong();
		this.isPlaying ? audio.play() : audio.pause();
	},
	nextSong: function () {
		this.currentIndex++;
		if (this.currentIndex >= this.songs.length) {
			if (this.repeatClickCount === 1) {
				this.currentIndex = 0;
			} else {
				this.currentIndex = this.songs.length - 1;
			}
		}
		this.loadCurrentSong();
		this.isPlaying ? audio.play() : audio.pause();
	},

	// Hàm xáo trộn mảng một cách ngẫu nhiên
	shuffleArray: function (array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
	},

	// Hàm xáo trộn lại toàn bộ danh sách bài hát và render lại danh sách đó lên giao diện
	shufflePlaylist: function () {
		// Lưu lại danh sách bài hát ban đầu
		this.originalSongs = [...this.songs];

		// Lưu lại bài hát hiện tại
		const currentSong = this.currentSong;

		// Xóa bài hát hiện tại khỏi danh sách (nếu tồn tại)
		if (currentSong) {
			const currentSongIndex = this.songs.findIndex((song) => song.name === currentSong.name);
			if (currentSongIndex !== -1) {
				this.songs.splice(currentSongIndex, 1);
			}
		}

		// Xáo trộn lại toàn bộ danh sách bài hát (không bao gồm bài hát hiện tại)
		this.shuffleArray(this.songs);

		// Đưa bài hát hiện tại lên đầu danh sách
		if (currentSong) {
			this.songs.push(currentSong);
		}

		// Đặt currentIndex về 0 để phát từ đầu danh sách xáo trộn
		// this.currentIndex = -1;

		// Cập nhật lại danh sách bài hát được hiển thị trên giao diện
		// this.render();

		// Cập nhật trạng thái icon play/pause cho bài hát đang phát
		this.updatePlayPauseIconsForAll();
	},

	setActiveSong: function () {
		// Xóa lớp 'active' khỏi tất cả các phần tử trong danh sách
		const songListItems = $$('.song-list-item');
		songListItems.forEach((item) => {
			item.classList.remove('active');
			item.classList.remove('active-1');
			const itemThumbnailOverlay = item.querySelector('.thumbnail-overlay');
			if (itemThumbnailOverlay) {
				itemThumbnailOverlay.classList.remove('visible');
			}
		});

		// Kiểm tra xem currentIndex có hợp lệ không
		if (this.currentIndex >= 0 && this.currentIndex < songListItems.length) {
			const currentSongListItem = songListItems[this.currentIndex];
			currentSongListItem.classList.add('active');
			const currentSongThumbnailOverlay = currentSongListItem.querySelector('.thumbnail-overlay');
			if (currentSongThumbnailOverlay) {
				currentSongThumbnailOverlay.classList.add('visible');
			}
		}
	},

	// Cập nhật .song-list-item toàn cục cho chức năng Search
	updateSongListItems: function () {
		songListItems = $$('.song-list-item');
	},

	start: function () {
		this.defineProperties();
		this.sortSongsByAlpha();
		this.render();
		this.loadCurrentSong();
		this.handleEvent();
	},
};
app.start();
